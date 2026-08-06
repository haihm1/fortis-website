const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://fortisvn.com'

export const SEO = {
  home: {
    vi: {
      title: 'Nông sản xuất khẩu ổn định, minh bạch và đúng chuẩn',
      description:
        'FortisVN – đối tác cung ứng nông sản Việt Nam cho thị trường xuất khẩu quốc tế. Chuyên bưởi, chuối, dừa tươi, cơm dừa sấy. Sourcing minh bạch, giao hàng ổn định, hỗ trợ B2B linh hoạt.',
      path: '/',
    },
    en: {
      title: 'Reliable, Transparent Vietnamese Agricultural Export Solutions',
      description:
        'FortisVN is a Vietnamese agricultural product supply partner for global buyers. Specialising in pomelo, banana, fresh coconut and desiccated coconut. Transparent sourcing, stable delivery, flexible B2B support.',
      path: '/',
    },
    zh: {
      title: '可靠透明的越南农产品出口解决方案',
      description:
        'FortisVN 是面向全球买家的越南农产品供应伙伴，专注于水果、椰子及农产品出口，提供透明采购、稳定交付和灵活的 B2B 支持。',
      path: '/',
    },
  },
  about: {
    vi: {
      title: 'Về FortisVN – Hồ sơ năng lực công ty',
      description:
        'Giới thiệu Công ty TNHH FortisVN: câu chuyện thương hiệu, tầm nhìn – sứ mệnh – giá trị cốt lõi, lĩnh vực hoạt động, chuỗi cung ứng khép kín, năng lực vận hành và cam kết chất lượng với đối tác xuất khẩu.',
      path: '/about',
    },
    en: {
      title: 'About FortisVN – Company Profile',
      description:
        'Learn about FortisVN Company Limited: brand story, vision, mission and core values, business activities, closed-loop supply chain, operational capabilities and quality commitments to export partners.',
      path: '/about',
    },
    zh: {
      title: '关于 FortisVN — 公司简介',
      description:
        '了解 FortisVN 有限公司：品牌故事、愿景使命与核心价值、业务领域、闭环供应链、运营能力，以及对出口伙伴的品质承诺。',
      path: '/about',
    },
  },
  products: {
    vi: {
      title: 'Catalog Nông Sản Xuất Khẩu',
      description:
        'Khám phá danh mục nông sản xuất khẩu của FortisVN: bưởi da xanh, chuối Cavendish, dừa tươi gọt kim cương, cơm dừa sấy, nước cốt dừa. Lọc theo quy cách, chứng nhận và thị trường.',
      path: '/products',
    },
    en: {
      title: 'Export Agricultural Product Catalog',
      description:
        "Browse FortisVN's export catalogue: green-skin pomelo, Cavendish banana, diamond-cut coconut, desiccated coconut, coconut milk. Filter by packing, certification and target market.",
      path: '/products',
    },
    zh: {
      title: '出口农产品目录',
      description:
        '浏览 FortisVN 出口产品目录，按包装、认证和目标市场筛选重点农产品。',
      path: '/products',
    },
  },
  contact: {
    vi: {
      title: 'Liên Hệ',
      description:
        'Liên hệ FortisVN để nhận báo giá, thảo luận quy cách đóng gói hoặc lịch giao hàng. Địa chỉ: 6/40/165 Dương Quảng Hàm, phường Nghĩa Đô, Hà Nội. Email: fortisvn.coltd@gmail.com.',
      path: '/contact',
    },
    en: {
      title: 'Contact Us',
      description:
        'Contact FortisVN for a quote, packing specifications or shipment scheduling. Address: 6/40/165 Duong Quang Ham, Nghia Do Ward, Hanoi, Vietnam. Email: fortisvn.coltd@gmail.com.',
      path: '/contact',
    },
    zh: {
      title: '联系我们',
      description:
        '联系 FortisVN 获取报价、包装规格或出货计划。邮箱：fortisvn.coltd@gmail.com。',
      path: '/contact',
    },
  },
}

export function buildProductSeo(product, locale) {
  if (!product) return null

  const isVi = locale === 'vi'
  const isZh = locale === 'zh'
  const primarySpec = product.specifications?.[0]
  const secondarySpec = product.specifications?.[1]
  return {
    title: product.name,
    description: isVi
      ? `${product.name} – ${product.summary}. ${primarySpec?.label ?? 'Thông số'}: ${primarySpec?.value ?? ''}. ${secondarySpec?.label ?? 'Tiêu chuẩn'}: ${secondarySpec?.value ?? ''}. Liên hệ FortisVN để nhận báo giá xuất khẩu.`
      : isZh
        ? `${product.name} - ${product.summary}. ${primarySpec?.label ?? '规格'}：${primarySpec?.value ?? ''}. ${secondarySpec?.label ?? '标准'}：${secondarySpec?.value ?? ''}. 联系 FortisVN 获取出口报价。`
        : `${product.name} – ${product.summary}. ${primarySpec?.label ?? 'Specification'}: ${primarySpec?.value ?? ''}. ${secondarySpec?.label ?? 'Standard'}: ${secondarySpec?.value ?? ''}. Contact FortisVN for an export quote.`,
    path: `/products/${product.slug}`,
    image: product.image,
    type: 'article',
  }
}

// ─── Structured data schemas ───────────────────────────────────────────────

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FortisVN Co., Ltd.',
    alternateName: 'Công ty TNHH FortisVN',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'FortisVN is an export-focused Vietnamese agricultural product supply partner for international buyers, specialising in fresh fruit and coconut-based products.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '6/40/165 Dương Quảng Hàm',
      addressLocality: 'Hà Nội',
      addressCountry: 'VN',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+84-378-414-824',
        contactType: 'sales',
        availableLanguage: ['Vietnamese', 'English'],
      },
    ],
    email: 'fortisvn.coltd@gmail.com',
    sameAs: [
      'https://zalo.me/84365510567',
      'https://wa.me/84378414824',
    ],
  }
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FortisVN',
    url: SITE_URL,
    description: 'Export-focused Vietnamese agricultural product supply partner for global buyers.',
    inLanguage: ['vi', 'en'],
  }
}

export function buildProductSchema(product) {
  if (!product) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary,
    image: product.image,
    url: `${SITE_URL}/products/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: 'FortisVN',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      seller: {
        '@type': 'Organization',
        name: 'FortisVN Co., Ltd.',
      },
    },
    additionalProperty: [
      product.hsCode ? { label: 'HS Code', value: product.hsCode } : null,
      product.packagingSpec ? { label: 'Packaging specification', value: product.packagingSpec } : null,
      ...(product.specifications ?? []),
    ]
      .filter((spec) => spec?.label && spec?.value)
      .map((spec) => ({
        '@type': 'PropertyValue',
        name: spec.label,
        value: spec.value,
      })),
  }
}

export function buildContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact FortisVN',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'FortisVN Co., Ltd.',
      alternateName: 'Công ty TNHH FortisVN',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '6/40/165 Dương Quảng Hàm',
        addressLocality: 'Hà Nội',
        addressCountry: 'VN',
      },
      telephone: '+84-378-414-824',
      email: 'fortisvn.coltd@gmail.com',
      url: SITE_URL,
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:30',
      },
    },
  }
}

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
