import { SectionHeading } from '../components/SectionHeading'

export function CertificatesSection({ section, certificates, partners }) {
  return (
    <section className="content-section" id="credentials">
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
      />

      <div className="credentials-layout">
        <div>
          <p className="subsection-title">Certificates</p>
          <div className="badge-grid">
            {certificates.map((certificate) => (
              <article key={certificate.name} className="badge-card">
                <div className="badge-logo">{certificate.name}</div>
                <p>{certificate.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <p className="subsection-title">Global Partners</p>
          <div className="badge-grid">
            {partners.map((partner) => (
              <article key={partner.name} className="badge-card partner-card">
                <div className="badge-logo">{partner.name}</div>
                <p>{partner.region}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
