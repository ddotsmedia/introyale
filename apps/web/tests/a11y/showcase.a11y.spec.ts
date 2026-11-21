import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

// Wait until client handlers are bound before interacting (SSR markup is inert until hydration).
const ready = async (page: Page) => {
  await page.goto('/dev/components')
  await page.waitForSelector('html[data-hydrated="true"]')
}

test.describe('component showcase (M4)', () => {
  test('axe: zero violations in LTR and RTL', async ({ page }) => {
    await ready(page)
    await expect(page.locator('[dir="ltr"]').first()).toBeVisible()
    await expect(page.locator('[dir="rtl"]').first()).toBeAttached()
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })

  test('the lightbox opens with the keyboard and closes with Escape', async ({ page }) => {
    await ready(page)
    const trigger = page.getByRole('button', { name: 'Open image 1 of 3' }).first()
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Image viewer' }).first()
    await expect(dialog).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(dialog.getByText('2 / 3')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('the before/after slider moves with the keyboard', async ({ page }) => {
    await ready(page)
    const slider = page.getByRole('slider', { name: 'Reveal before and after' }).first()
    await slider.focus()
    await expect(slider).toHaveValue('50')
    await page.keyboard.press('ArrowRight')
    await expect(slider).toHaveValue('51')
  })
})

test.describe('mobile navigation (M4)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('focus is trapped while open and returns to the trigger on Escape', async ({ page }) => {
    await ready(page)
    const menu = page.getByRole('button', { name: 'Menu' })
    await menu.focus()
    await page.keyboard.press('Enter')
    const panel = page.getByRole('dialog', { name: 'Site menu' })
    await expect(panel).toBeVisible()
    await page.keyboard.press('Shift+Tab')
    const insidePanel = await page.evaluate(
      () => !!document.activeElement?.closest('#mobile-nav-panel'),
    )
    expect(insidePanel).toBe(true)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
    await expect(menu).toBeFocused()
  })
})
