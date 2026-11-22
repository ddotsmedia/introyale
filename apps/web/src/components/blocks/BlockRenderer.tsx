import { BeforeAfterSpotlight } from './BeforeAfterSpotlight'
import { ClientWall } from './ClientWall'
import { ContactInfo } from './ContactInfo'
import { CtaBand } from './CtaBand'
import { EnquiryForm } from './EnquiryForm'
import { FeaturedWork } from './FeaturedWork'
import { Hero } from './Hero'
import { ImageText } from './ImageText'
import { IntroStats } from './IntroStats'
import { ProcessSteps } from './ProcessSteps'
import { SectorTiles } from './SectorTiles'
import { ServicesList } from './ServicesList'
import { Statement } from './Statement'
import { TextSection } from './TextSection'
import type { Layout } from './shared'

/** Renders CMS layout blocks in order. Blocks marked hidden are skipped. */
export function BlockRenderer({
  layout,
  sector,
}: {
  layout: Layout | null | undefined
  sector?: string
}) {
  return (
    <>
      {(layout ?? []).map((block, i) => {
        if (block.hidden) return null
        const key = block.id ?? `${block.blockType}-${String(i)}`
        switch (block.blockType) {
          case 'hero':
            return <Hero key={key} block={block} />
          case 'introStats':
            return <IntroStats key={key} block={block} />
          case 'featuredWork':
            return <FeaturedWork key={key} block={block} />
          case 'sectorTiles':
            return <SectorTiles key={key} block={block} />
          case 'servicesList':
            return <ServicesList key={key} block={block} />
          case 'processSteps':
            return <ProcessSteps key={key} block={block} />
          case 'clientWall':
            return <ClientWall key={key} block={block} />
          case 'statement':
            return <Statement key={key} block={block} />
          case 'beforeAfterSpotlight':
            return <BeforeAfterSpotlight key={key} block={block} />
          case 'ctaBand':
            return <CtaBand key={key} block={block} />
          case 'imageText':
            return <ImageText key={key} block={block} />
          case 'textSection':
            return <TextSection key={key} block={block} />
          case 'contactInfo':
            return <ContactInfo key={key} block={block} />
          case 'enquiryForm':
            return <EnquiryForm key={key} block={block} sector={sector} />
          default:
            return null
        }
      })}
    </>
  )
}
