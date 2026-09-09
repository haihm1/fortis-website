import { Link } from 'react-router-dom'
import { CharcoalHeading } from '../../components/charcoal/CharcoalHeading'
import { Reveal } from '../../components/motion/Reveal'
import { Stagger } from '../../components/motion/Stagger'
import { CHARCOAL_CONTENT } from '../../data/charcoalContent'
import { CHARCOAL_PRODUCT_IMAGES } from '../../data/charcoalMedia'
import { SEO, buildOrganizationSchema } from '../../data/seoConfig'
import { useJsonLd } from '../../hooks/useJsonLd'
import { useSeoMeta } from '../../hooks/useSeoMeta'
import { brandPath } from '../../lib/brand'

export function CharcoalProductsPage({ locale, prefix }) {
  const copy = CHARCOAL_CONTENT[locale] ?? CHARCOAL_CONTENT.en
  const seo = SEO.charcoalProducts[locale] ?? SEO.charcoalProducts.en

  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('organization', buildOrganizationSchema())

  return (
    <div className="overflow-x-clip">
      <section className="border-b border-white/10 bg-carbon-900">
        <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <CharcoalHeading
            as="h1"
            eyebrow={copy.products.eyebrow}
            title={copy.products.title}
            description={copy.products.description}
          />
        </div>
      </section>

      <section className="bg-carbon-950">
        <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Stagger className="space-y-6" each={0.1}>
            {copy.products.items.map((item, index) => (
              <Reveal
                child
                as="article"
                variant="up"
                duration={0.65}
                key={item.name}
                className="group grid gap-6 overflow-hidden rounded-2xl bg-carbon-900 ring-1 ring-white/10 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:ring-ember-500/40 lg:grid-cols-[0.8fr_1.2fr]"
              >
                <span className="block aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[240px]">
                  <img
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    src={CHARCOAL_PRODUCT_IMAGES[index % CHARCOAL_PRODUCT_IMAGES.length]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <div className="p-6 lg:py-8 lg:pr-9">
                  <h2 className="font-display text-xl leading-snug font-semibold text-white lg:text-2xl">
                    {item.name}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/60 lg:text-base">{item.summary}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {item.attributes.map((attribute) => (
                      <li
                        className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/70 ring-1 ring-white/10"
                        key={`${item.name}-${attribute}`}
                      >
                        {attribute}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/40">
                    {copy.products.specsNote}
                  </p>
                </div>
              </Reveal>
            ))}
          </Stagger>

          <Reveal variant="up" duration={0.6} className="mt-12 text-center">
            <Link
              className="inline-flex h-12 cursor-pointer items-center rounded-full bg-ember-500 px-7 text-sm font-semibold text-white transition-all duration-200 hover:bg-ember-400 hover:shadow-[0_8px_28px_rgba(210,101,31,0.35)]"
              to={brandPath('/contact', prefix)}
            >
              {copy.cta.primary}
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
