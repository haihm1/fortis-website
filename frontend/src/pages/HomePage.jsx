import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaqSection } from '../components/FaqSection'
import { PageLoading } from '../components/PageLoading'
import { SectionHeading } from '../components/SectionHeading'
import { useBackendData } from '../hooks/useBackendData'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { HeroBannerSection } from '../sections/HeroBannerSection'
import { loadHomeContent } from '../services/homeContentApi'
import {
  SEO,
  buildOrganizationSchema,
  buildWebsiteSchema,
} from '../data/seoConfig'

const MEDIA = {
  hero: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=85',
  cinnamon: 'https://images.unsplash.com/photo-1600423115367-87ea7661688f?auto=format&fit=crop&w=1200&q=85',
  anise: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=1200&q=85',
  pepper: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85',
  cashew: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2f?auto=format&fit=crop&w=1200&q=85',
  fruit: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1200&q=85',
  spices: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=1200&q=85',
  charcoal: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=1200&q=85',
  coffeeNews: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=85',
  marketNews: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=85',
  strategyNews: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=85',
  certificate: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=85',
}

const reveal = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
}

const MotionArticle = motion.article
const MotionDiv = motion.div

const CONTENT = {
  vi: {
    heroEyebrow: 'Vietnamese Agrimex Partner',
    heroTitle: 'FortisVN kết nối nông sản Việt với thị trường quốc tế.',
    heroDescription:
      'Mô phỏng tinh thần VietLinh Agrimex với banner lớn, danh mục sản phẩm rõ ràng và tin thị trường xuất khẩu giàu hình ảnh.',
    primaryAction: 'Xem sản phẩm',
    secondaryAction: 'Tin thị trường',
    categories: {
      eyebrow: 'Danh mục',
      title: 'Nông sản, gia vị và than xuất khẩu.',
      description: 'Ba nhóm ngành chủ lực của FortisVN với nguồn cung ổn định, chất lượng kiểm soát và quy cách đóng gói theo yêu cầu từng thị trường.',
      items: [
        {
          title: 'Nông sản',
          description: 'Trái cây tươi, gạo, cà phê và các mặt hàng nông sản Việt Nam theo mùa.',
          alt: 'Nông sản Việt Nam và trái cây nhiệt đới',
        },
        {
          title: 'Gia vị',
          description: 'Quế, hồi, tiêu và các loại gia vị Việt Nam đạt chuẩn xuất khẩu.',
          alt: 'Gia vị Việt Nam quế hồi tiêu xuất khẩu',
        },
        {
          title: 'Than',
          description: 'Than gáo dừa, than củi và than ép phục vụ nhu cầu công nghiệp và xuất khẩu.',
          alt: 'Than gáo dừa và than củi xuất khẩu',
        },
      ],
    },
    products: {
      eyebrow: 'Sản phẩm tiêu biểu',
      title: 'Các mặt hàng xuất khẩu chủ lực của FortisVN',
      description: 'Tuyển chọn nông sản, gia vị và than đạt chuẩn xuất khẩu, kiểm soát chất lượng từ vùng trồng đến khâu đóng gói.',
    },
    news: {
      eyebrow: 'Export Market',
      title: 'Tin thị trường xuất khẩu',
      description: 'Các thẻ tin mới nhất giúp trang chủ có nhịp nội dung giống site tham khảo.',
    },
    profile: {
      eyebrow: 'Company Profile',
      title: 'Hồ sơ năng lực và chứng chỉ',
      description: 'Khu vực tải hồ sơ công ty, catalog và nhấn mạnh tiêu chuẩn chứng nhận cho đối tác B2B.',
      profileButton: 'Tải Company Profile',
    },
    detailButton: 'Xem chi tiết',
  },
  en: {
    heroEyebrow: 'Vietnamese Agrimex Partner',
    heroTitle: 'FortisVN connects Vietnamese produce with global markets.',
    heroDescription:
      'A VietLinh Agrimex-inspired homepage with an immersive hero, clear product categories and export market news.',
    primaryAction: 'View products',
    secondaryAction: 'Market news',
    categories: {
      eyebrow: 'Categories',
      title: 'Agricultural products, spices and charcoal exports.',
      description: 'Three core product groups from FortisVN, backed by stable supply, controlled quality and packing formats tailored to each market.',
      items: [
        {
          title: 'Agricultural Products',
          description: 'Fresh fruits, rice, coffee and seasonal Vietnamese agricultural products.',
          alt: 'Vietnamese agricultural products and tropical fruit',
        },
        {
          title: 'Spices',
          description: 'Cassia cinnamon, star anise, pepper and other export-grade Vietnamese spices.',
          alt: 'Vietnamese spices cinnamon star anise pepper for export',
        },
        {
          title: 'Charcoal',
          description: 'Coconut shell charcoal, hardwood charcoal and briquettes for industry and export.',
          alt: 'Coconut shell and hardwood charcoal for export',
        },
      ],
    },
    products: {
      eyebrow: 'Featured products',
      title: "FortisVN's key export products",
      description: 'A curated range of export-grade agricultural products, spices and charcoal, quality-controlled from the growing area to final packaging.',
    },
    news: {
      eyebrow: 'Export Market',
      title: 'Export market news',
      description: 'Latest market cards give the homepage the same editorial rhythm as the reference site.',
    },
    profile: {
      eyebrow: 'Company Profile',
      title: 'Company profile and certificates',
      description: 'Download profile assets, catalog materials and highlight B2B compliance credentials.',
      profileButton: 'Download Company Profile',
    },
    detailButton: 'View details',
  },
  zh: {
    heroEyebrow: '越南农产品出口伙伴',
    heroTitle: 'FortisVN 将越南农产品连接到国际市场。',
    heroDescription:
      '以沉浸式横幅、清晰产品分类和出口市场资讯展示 FortisVN 的贸易能力。',
    primaryAction: '查看产品',
    secondaryAction: '市场资讯',
    categories: {
      eyebrow: '分类',
      title: '农产品、香辛料和木炭出口。',
      description: 'FortisVN 的三大核心品类，拥有稳定供应、严格质量管控，并按各市场需求提供相应包装规格。',
      items: [
        {
          title: '农产品',
          description: '新鲜水果、大米、咖啡及越南季节性农产品。',
          alt: '越南农产品和热带水果',
        },
        {
          title: '香辛料',
          description: '肉桂、八角、胡椒及其他符合出口标准的越南香辛料。',
          alt: '越南香辛料肉桂八角胡椒出口',
        },
        {
          title: '木炭',
          description: '椰壳炭、硬木炭及炭砖，供工业与出口使用。',
          alt: '出口用椰壳炭和硬木炭',
        },
      ],
    },
    products: {
      eyebrow: '精选产品',
      title: 'FortisVN 的核心出口产品',
      description: '精选符合出口标准的农产品、香辛料和木炭，从种植区到包装全程严格管控质量。',
    },
    news: {
      eyebrow: 'Export Market',
      title: '出口市场资讯',
      description: '最新市场资讯帮助买家快速掌握出口趋势。',
    },
    profile: {
      eyebrow: 'Company Profile',
      title: '公司简介与认证',
      description: '展示公司能力、资料下载和 B2B 合规资质。',
      profileButton: '下载公司简介',
    },
    detailButton: '查看详情',
  },
}

export function HomePage({ locale, visibleMenuKeys }) {
  const location = useLocation()
  const pageData = useBackendData((signal) => loadHomeContent(locale, signal), [locale])

  const copy = useMemo(() => CONTENT[locale] ?? CONTENT.en, [locale])
  const seo = SEO.home[locale] ?? SEO.home.en
  const heroSlides = useMemo(() => buildHeroSlides(copy, pageData ?? {}), [copy, pageData])
  const products = useMemo(
    () => buildProducts(pageData ?? {}, copy.detailButton),
    [pageData, copy.detailButton],
  )
  const featuredProductsSection = pageData?.featuredProductsSection ?? copy.products
  const companyProfileSection = useMemo(
    () => buildCompanyProfileSection(pageData ?? {}, copy.profile, locale),
    [pageData, copy.profile, locale],
  )
  const showServices = !visibleMenuKeys || visibleMenuKeys.has('services')
  const showAbout = !visibleMenuKeys || visibleMenuKeys.has('about')

  useEffect(() => {
    const disabledHash =
      (location.hash === '#categories' && !showServices) ||
      (location.hash === '#company-profile' && !showAbout)

    if (disabledHash) {
      window.history.replaceState(null, '', '/')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location.hash, showAbout, showServices])

  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('organization', buildOrganizationSchema())
  useJsonLd('website', buildWebsiteSchema())

  if (!pageData) {
    return <PageLoading locale={locale} />
  }

  return (
    <main className="home-page">
      <HeroBannerSection slides={heroSlides} />
      {showServices ? <CategorySection copy={copy.categories} /> : null}
      <FeaturedProductsSection section={featuredProductsSection} products={products} />
      <ExportMarketNewsSection section={copy.news} />
      <FaqSection locale={locale} />
      {showAbout ? <CompanyProfileSection section={companyProfileSection} certificates={pageData.certificates} /> : null}
    </main>
  )
}

function buildHeroSlides(copy, pageData) {
  const fallbackImages = [MEDIA.hero, MEDIA.cinnamon, MEDIA.pepper]
  const apiSlides = pageData.heroSlides?.length ? pageData.heroSlides : []

  if (apiSlides.length > 0) {
    return apiSlides.map((slide, index) => ({
      eyebrow: slide.eyebrow || slide.overlayLabel || copy.heroEyebrow,
      title: slide.title || copy.heroTitle,
      description: slide.description || copy.heroDescription,
      image: slide.image || fallbackImages[index % fallbackImages.length],
      alt: `${slide.title || 'FortisVN export'} banner`,
      overlayLabel: slide.overlayLabel,
      facts: slide.facts ?? [],
      primaryActionLabel: copy.primaryAction,
      secondaryActionLabel: copy.secondaryAction,
      secondaryActionHref: '#export-market',
    }))
  }

  return [{
    eyebrow: copy.heroEyebrow,
    title: copy.heroTitle,
    description: copy.heroDescription,
    image: MEDIA.hero,
    alt: 'FortisVN export product hero banner',
    primaryActionLabel: copy.primaryAction,
    secondaryActionLabel: copy.secondaryAction,
    secondaryActionHref: '#export-market',
  }]
}

function buildProducts(pageData, detailButton) {
  const fallbackImages = [
    { image: MEDIA.cinnamon, alt: 'Cassia cinnamon sticks for export' },
    { image: MEDIA.anise, alt: 'Vietnamese star anise for export' },
    { image: MEDIA.pepper, alt: 'Black pepper seeds for export' },
    { image: MEDIA.cashew, alt: 'Vietnamese cashew nuts for export' },
  ]

  return (pageData.featuredProducts ?? []).slice(0, 4).map((product, index) => {
    const specifications = Array.isArray(product.specifications)
      ? product.specifications.filter((spec) => spec?.label && spec?.value)
      : []
    const applications = Array.isArray(product.applications) ? product.applications.filter(Boolean) : []

    return {
      name: product.name,
      category: product.category,
      summary: product.summary ?? '',
      specifications: specifications.length > 0
        ? specifications
        : product.grade
          ? [{ label: 'Standard', value: product.grade }]
          : [],
      applications: applications.length > 0 ? applications : product.commonUse ? [product.commonUse] : [],
      image: product.image || fallbackImages[index % fallbackImages.length].image,
      alt: `${product.name} featured product`,
      href: product.slug ? `/products/${product.slug}` : '/products',
      actionLabel: detailButton,
    }
  })
}

function buildCompanyProfileSection(pageData, fallbackSection, locale) {
  return {
    eyebrow: pageData.credentialsSection?.eyebrow ?? fallbackSection.eyebrow,
    title:
      (locale === 'vi' ? pageData.company?.vietnameseName : pageData.company?.englishName) ??
      fallbackSection.title,
    description:
      pageData.introductionArticle ??
      pageData.credentialsSection?.description ??
      fallbackSection.description,
    profileButton: fallbackSection.profileButton,
    address: pageData.company?.address,
    hotline: pageData.company?.hotline,
    email: pageData.company?.email,
    labels:
      locale === 'vi'
        ? { address: 'Địa chỉ', hotline: 'Hotline', email: 'Email' }
        : locale === 'zh'
          ? { address: '地址', hotline: '热线', email: '邮箱' }
          : { address: 'Address', hotline: 'Hotline', email: 'Email' },
  }
}

function CategorySection({ copy }) {
  const categoryImages = [MEDIA.fruit, MEDIA.spices, MEDIA.charcoal]
  const categories = (copy.items ?? [
    {
      title: 'Nông sản',
      description: 'Fresh fruits, rice, coffee and seasonal Vietnamese agricultural products.',
      alt: 'Vietnamese agricultural products and passion fruit',
    },
    {
      title: 'Gia vị',
      description: 'Cassia cinnamon, star anise, pepper and other export-grade Vietnamese spices.',
      alt: 'Vietnamese spices cinnamon star anise pepper for export',
    },
    {
      title: 'Than',
      description: 'Coconut shell charcoal, hardwood charcoal and briquettes for industry and export.',
      alt: 'Coconut shell and hardwood charcoal for export',
    },
  ]).map((category, index) => ({
    ...category,
    image: categoryImages[index % categoryImages.length],
  }))

  return (
    <section className="content-section category-section" id="categories">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <div className="category-card-grid">
        {categories.map((category, index) => (
          <MotionArticle
            className="category-card"
            key={category.title}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: index * 0.08 }}
          >
            <img
              className="category-card-image"
              src={category.image}
              alt={category.alt}
              loading="lazy"
              decoding="async"
            />
            <div className="category-card-overlay" />
            <div className="category-card-content">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
            </div>
          </MotionArticle>
        ))}
      </div>
    </section>
  )
}

function FeaturedProductsSection({ section, products }) {
  return (
    <section className="content-section section-muted featured-products-home" id="featured-products">
      <SectionHeading eyebrow={section.eyebrow} title={section.title} description={section.description} />
      <div className="featured-product-grid">
        {products.map((product, index) => (
          <MotionArticle
            className="featured-product-card"
            key={product.name}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: index * 0.08 }}
          >
            <div className="featured-product-image-wrap">
              <img
                className="featured-product-image"
                src={product.image}
                alt={product.alt}
                loading="lazy"
                decoding="async"
              />
              <a className="featured-product-action" href={product.href}>
                {product.actionLabel}
              </a>
            </div>
            <div className="featured-product-body">
              <h3>{product.name}</h3>
              <p>{product.summary}</p>
              {product.specifications.length > 0 ? (
                <dl className="featured-product-specs">
                  {product.specifications.slice(0, 3).map((spec) => (
                    <div key={`${product.name}-${spec.label}-${spec.value}`}>
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {product.applications.length > 0 ? (
                <ul className="featured-product-applications">
                  {product.applications.slice(0, 3).map((application) => (
                    <li key={`${product.name}-${application}`}>{application}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </MotionArticle>
        ))}
      </div>
    </section>
  )
}

function ExportMarketNewsSection({ section }) {
  const news = [
    {
      title: 'STATISTICS OF PEPPER AND CINNAMON EXPORT VOLUME FROM JANUARY TO JULY',
      image: MEDIA.marketNews,
      alt: 'Pepper and cinnamon export market statistics thumbnail',
      href: '/export-market/statistics-of-pepper-and-cinnamon-export-volume-from-january-to-july',
    },
    {
      title: "COFFEE TAKES THE EXPORT 'THE THRONE'",
      image: MEDIA.coffeeNews,
      alt: 'Vietnamese coffee export news thumbnail',
      href: '/export-market/coffee-takes-the-export-throne',
    },
    {
      title: 'LONG-TERM STRATEGY IS NEEDED TO MAINTAIN AGRICULTURAL EXPORT POSITION',
      image: MEDIA.strategyNews,
      alt: 'Vietnam agricultural export strategy news thumbnail',
      href: '/export-market/long-term-strategy-is-needed-to-maintain-agricultural-export-position',
    },
  ]

  return (
    <section className="content-section export-news-section" id="export-market">
      <SectionHeading eyebrow={section.eyebrow} title={section.title} description={section.description} />
      <div className="export-news-grid">
        {news.map((item, index) => (
          <MotionArticle
            className="export-news-card"
            key={item.title}
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: index * 0.1 }}
          >
            <a href={item.href} className="export-news-image-link">
              <img
                className="export-news-image"
                src={item.image}
                alt={item.alt}
                loading="lazy"
                decoding="async"
              />
            </a>
            <a href={item.href} className="export-news-body">
              <p className="section-eyebrow">Export market</p>
              <h3>{item.title}</h3>
            </a>
          </MotionArticle>
        ))}
      </div>
    </section>
  )
}

function CompanyProfileSection({ section, certificates }) {
  return (
    <section className="content-section company-profile-section" id="company-profile">
      <MotionDiv
        className="company-profile-panel"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="section-eyebrow">{section.eyebrow}</p>
          <h2>{section.title}</h2>
          <div className="company-profile-copy">
            {String(section.description ?? '')
              .split(/\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>
          <dl className="company-profile-contact">
            {section.address ? (
              <div>
                <dt>{section.labels.address}</dt>
                <dd>{section.address}</dd>
              </div>
            ) : null}
            {section.hotline ? (
              <div>
                <dt>{section.labels.hotline}</dt>
                <dd>{section.hotline}</dd>
              </div>
            ) : null}
            {section.email ? (
              <div>
                <dt>{section.labels.email}</dt>
                <dd>{section.email}</dd>
              </div>
            ) : null}
          </dl>
          <div className="company-profile-actions">
            <a className="primary-button" href="/company-profile.pdf" download="PROFILE-FORTISVN.pdf">{section.profileButton}</a>
          </div>
        </div>
        <div className="certificate-list">
          {(certificates ?? []).slice(0, 4).map((certificate) => (
            <article key={certificate.name} className="certificate-item">
              <img
                src={MEDIA.certificate}
                alt={`${certificate.name} certificate badge`}
                loading="lazy"
                decoding="async"
              />
              <div>
                <strong>{certificate.name}</strong>
                <p>{certificate.description}</p>
              </div>
            </article>
          ))}
        </div>
      </MotionDiv>
    </section>
  )
}
