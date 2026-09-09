import { CharcoalHeading } from '../../components/charcoal/CharcoalHeading'
import { Reveal } from '../../components/motion/Reveal'
import { Stagger } from '../../components/motion/Stagger'
import { CHARCOAL_CONTENT } from '../../data/charcoalContent'
import { COMPANY_CONTACT, getMapEmbedUrl } from '../../data/companyContact'
import { SEO, buildOrganizationSchema } from '../../data/seoConfig'
import { useJsonLd } from '../../hooks/useJsonLd'
import { useSeoMeta } from '../../hooks/useSeoMeta'

export function CharcoalContactPage({ locale }) {
  const copy = CHARCOAL_CONTENT[locale] ?? CHARCOAL_CONTENT.en
  const seo = SEO.charcoalContact[locale] ?? SEO.charcoalContact.en

  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('organization', buildOrganizationSchema())

  const address = locale === 'vi' ? COMPANY_CONTACT.address : COMPANY_CONTACT.addressEn
  const workingHours = COMPANY_CONTACT.workingHours[locale] ?? COMPANY_CONTACT.workingHours.en

  const rows = [
    { label: copy.contact.labels.address, value: address },
    { label: copy.contact.labels.hotline, value: COMPANY_CONTACT.hotlineDisplay, href: COMPANY_CONTACT.hotlineHref },
    { label: copy.contact.labels.email, value: COMPANY_CONTACT.email, href: COMPANY_CONTACT.emailHref },
  ]

  const channels = [
    COMPANY_CONTACT.channels.zalo,
    COMPANY_CONTACT.channels.whatsapp,
    COMPANY_CONTACT.channels.email,
  ]

  return (
    <div className="overflow-x-clip bg-carbon-950">
      <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <CharcoalHeading
          as="h1"
          eyebrow={copy.contact.eyebrow}
          title={copy.contact.title}
          description={copy.cta.description}
        />

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          <Stagger each={0.09}>
            <Reveal child variant="up" duration={0.6}>
              <dl className="divide-y divide-white/10 rounded-2xl bg-carbon-900 p-6 ring-1 ring-white/10 lg:p-8">
                {rows.map((row) => (
                  <div className="py-4 first:pt-0 last:pb-0" key={row.label}>
                    <dt className="text-xs font-semibold tracking-[0.15em] text-ember-400 uppercase">
                      {row.label}
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-white/80">
                      {row.href ? (
                        <a className="transition-colors hover:text-ember-300" href={row.href}>
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal child variant="up" duration={0.6}>
              <p className="mt-5 text-sm text-white/50">{workingHours}</p>
            </Reveal>

            <Reveal child variant="up" duration={0.6}>
              <ul className="mt-6 flex flex-wrap gap-3">
                {channels.map((channel) => (
                  <li key={channel.display + (channel.href ?? '')}>
                    <a
                      className="inline-flex h-11 cursor-pointer items-center rounded-full bg-white/5 px-5 text-sm font-medium text-white/80 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
                      href={channel.href}
                      target={channel.href?.startsWith('http') ? '_blank' : undefined}
                      rel={channel.href?.startsWith('http') ? 'noreferrer' : undefined}
                    >
                      {channel.label[locale] ?? channel.label.en}
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </Stagger>

          <Reveal variant="right" duration={0.7}>
            <iframe
              className="h-[340px] w-full rounded-2xl ring-1 ring-white/10 lg:h-full lg:min-h-[400px]"
              src={getMapEmbedUrl()}
              title="FortisVN office location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </div>
    </div>
  )
}
