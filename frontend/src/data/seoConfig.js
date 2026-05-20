const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://fortisvn.vn'

export const SEO = {
  home: {
    vi: {
      title: 'Nông sản xuất khẩu ổn định, minh bạch và đúng chuẩn',
      description:
        'Fortis VN – đối tác cung ứng nông sản Việt Nam cho thị trường xuất khẩu quốc tế. Chuyên bưởi, chuối, dừa tươi, cơm dừa sấy. Sourcing minh bạch, giao hàng ổn định, hỗ trợ B2B linh hoạt.',
      path: '/',
    },
    en: {
      title: 'Reliable, Transparent Vietnamese Agricultural Export Solutions',
      description:
        'Fortis VN is a Vietnamese agricultural product supply partner for global buyers. Specialising in pomelo, banana, fresh coconut and desiccated coconut. Transparent sourcing, stable delivery, flexible B2B support.',
      path: '/',
    },
    zh: {
      title: '可靠透明的越南农产品出口解决方案',
      description:
        'Fortis VN 是面向全球买家的越南农产品供应伙伴，专注于水果、椰子及农产品出口，提供透明采购、稳定交付和灵活的 B2B 支持。',
      path: '/',
    },
  },
  products: {
    vi: {
      title: 'Catalog Nông Sản Xuất Khẩu',
      description:
        'Khám phá danh mục nông sản xuất khẩu của Fortis VN: bưởi da xanh, chuối Cavendish, dừa tươi gọt kim cương, cơm dừa sấy, nước cốt dừa. Lọc theo quy cách, chứng nhận và thị trường.',
      path: '/products',
    },
    en: {
      title: 'Export Agricultural Product Catalog',
      description:
        "Browse Fortis VN's export catalogue: green-skin pomelo, Cavendish banana, diamond-cut coconut, desiccated coconut, coconut milk. Filter by packing, certification and target market.",
      path: '/products',
    },
    zh: {
      title: '出口农产品目录',
      description:
        '浏览 Fortis VN 出口产品目录，按包装、认证和目标市场筛选重点农产品。',
      path: '/products',
    },
  },
  contact: {
    vi: {
      title: 'Liên Hệ',
      description:
        'Liên hệ Fortis VN để nhận báo giá, thảo luận quy cách đóng gói hoặc lịch giao hàng. Địa chỉ: 6/40/165 Dương Quảng Hàm, phường Nghĩa Đô, Hà Nội. Email: fortisvn.coltd@gmail.com.',
      path: '/contact',
    },
    en: {
      title: 'Contact Us',
      description:
        'Contact Fortis VN for a quote, packing specifications or shipment scheduling. Address: 6/40/165 Duong Quang Ham, Nghia Do Ward, Hanoi, Vietnam. Email: fortisvn.coltd@gmail.com.',
      path: '/contact',
    },
    zh: {
      title: '联系我们',
      description:
        '联系 Fortis VN 获取报价、包装规格或出货计划。邮箱：fortisvn.coltd@gmail.com。',
      path: '/contact',
    },
  },
}

export function buildProductSeo(product, locale) {
  if (!product) return null

  const isVi = locale === 'vi'
  const isZh = locale === 'zh'
  return {
    title: product.name,
    description: isVi
      ? `${product.name} – ${product.summary}. Quy cách: ${product.specifications?.thickness ?? ''}. Tiêu chuẩn: ${product.specifications?.moisture ?? ''}. Liên hệ Fortis VN để nhận báo giá xuất khẩu.`
      : isZh
        ? `${product.name} - ${product.summary}. 包装：${product.specifications?.thickness ?? ''}. 标准：${product.specifications?.moisture ?? ''}. 联系 Fortis VN 获取出口报价。`
        : `${product.name} – ${product.summary}. Packing: ${product.specifications?.thickness ?? ''}. Standard: ${product.specifications?.moisture ?? ''}. Contact Fortis VN for an export quote.`,
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
    name: 'Fortis VN Co., Ltd.',
    alternateName: 'Công ty TNHH Fortis VN',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Fortis VN is an export-focused Vietnamese agricultural product supply partner for international buyers, specialising in fresh fruit and coconut-based products.',
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
    name: 'Fortis VN',
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
      name: 'Fortis VN',
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      seller: {
        '@type': 'Organization',
        name: 'Fortis VN Co., Ltd.',
      },
    },
    additionalProperty: [
      product.specifications?.thickness && {
        '@type': 'PropertyValue',
        name: 'Packing',
        value: product.specifications.thickness,
      },
      product.specifications?.moisture && {
        '@type': 'PropertyValue',
        name: 'Quality Standard',
        value: product.specifications.moisture,
      },
      product.specifications?.glueType && {
        '@type': 'PropertyValue',
        name: 'Certification',
        value: product.specifications.glueType,
      },
    ].filter(Boolean),
  }
}

export function buildContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Fortis VN',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'LocalBusiness',
      name: 'Fortis VN Co., Ltd.',
      alternateName: 'Công ty TNHH Fortis VN',
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
