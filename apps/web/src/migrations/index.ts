import * as migration_20261121_111004_init from './20261121_111004_init'
import * as migration_20261121_114752_m3_cms from './20261121_114752_m3_cms'
import * as migration_20261121_121638_m5_pages from './20261121_121638_m5_pages'
import * as migration_20261121_123007_m6_avif from './20261121_123007_m6_avif'
import * as migration_20261121_125809_m8_leads from './20261121_125809_m8_leads'
import * as migration_20261121_193207_m10_7_blocks from './20261121_193207_m10_7_blocks'
import * as migration_20261121_194543_m10_7_closing_cta from './20261121_194543_m10_7_closing_cta'
import * as migration_20261121_201245_m10_7_consent from './20261121_201245_m10_7_consent'
import * as migration_20261122_005545_m11_admin_v2 from './20261122_005545_m11_admin_v2'
import * as migration_20261122_013400_m11_seo_keyword from './20261122_013400_m11_seo_keyword'

export const migrations = [
  {
    up: migration_20261121_111004_init.up,
    down: migration_20261121_111004_init.down,
    name: '20261121_111004_init',
  },
  {
    up: migration_20261121_114752_m3_cms.up,
    down: migration_20261121_114752_m3_cms.down,
    name: '20261121_114752_m3_cms',
  },
  {
    up: migration_20261121_121638_m5_pages.up,
    down: migration_20261121_121638_m5_pages.down,
    name: '20261121_121638_m5_pages',
  },
  {
    up: migration_20261121_123007_m6_avif.up,
    down: migration_20261121_123007_m6_avif.down,
    name: '20261121_123007_m6_avif',
  },
  {
    up: migration_20261121_125809_m8_leads.up,
    down: migration_20261121_125809_m8_leads.down,
    name: '20261121_125809_m8_leads',
  },
  {
    up: migration_20261121_193207_m10_7_blocks.up,
    down: migration_20261121_193207_m10_7_blocks.down,
    name: '20261121_193207_m10_7_blocks',
  },
  {
    up: migration_20261121_194543_m10_7_closing_cta.up,
    down: migration_20261121_194543_m10_7_closing_cta.down,
    name: '20261121_194543_m10_7_closing_cta',
  },
  {
    up: migration_20261121_201245_m10_7_consent.up,
    down: migration_20261121_201245_m10_7_consent.down,
    name: '20261121_201245_m10_7_consent',
  },
  {
    up: migration_20261122_005545_m11_admin_v2.up,
    down: migration_20261122_005545_m11_admin_v2.down,
    name: '20261122_005545_m11_admin_v2',
  },
  {
    up: migration_20261122_013400_m11_seo_keyword.up,
    down: migration_20261122_013400_m11_seo_keyword.down,
    name: '20261122_013400_m11_seo_keyword',
  },
]
