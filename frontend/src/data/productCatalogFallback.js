const SAMPLE_SPECIFICATION_URL =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

const PRODUCT_CATALOG_FALLBACK = {
  vi: {
    pageHeader: {
      eyebrow: 'Danh mục sản phẩm',
      title: 'Catalog nông sản cho khách hàng nhập khẩu và đối tác B2B.',
      description:
        '',
    },
    categories: [
      {
        id: 'fresh-fruits',
        slug: 'trai-cay-tuoi',
        name: 'Trái cây tươi',
        description: 'Bưởi, chuối và các dòng trái cây nhiệt đới đóng gói xuất khẩu.',
      },
      {
        id: 'fresh-coconut',
        slug: 'dua-tuoi',
        name: 'Dừa tươi',
        description: 'Dừa xiêm, dừa gọt kim cương và quy cách carton theo thị trường.',
      },
      {
        id: 'processed-coconut',
        slug: 'san-pham-tu-dua',
        name: 'Sản phẩm từ dừa',
        description: 'Cơm dừa sấy, nước cốt dừa và nguyên liệu thực phẩm từ dừa.',
      },
      {
        id: 'oem-packing',
        slug: 'dong-goi-theo-yeu-cau',
        name: 'Đóng gói theo yêu cầu',
        description: 'Tổ hợp sản phẩm, nhãn riêng và quy cách đóng gói theo buyer spec.',
      },
    ],
    products: [
      {
        id: 'green-skin-pomelo',
        slug: 'buoi-da-xanh',
        categoryId: 'fresh-fruits',
        name: 'Bưởi da xanh',
        summary: 'Trái tuyển chọn theo size, vỏ xanh đều và vị ngọt thanh cho kênh nhập khẩu trái cây tươi.',
        image:
          'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: '9 - 12 trái / thùng',
          moisture: 'Brix 10+ / trái đồng đều',
          glueType: 'VietGAP / vùng Mekong',
          size: '12 - 15 kg / carton',
        },
        applications: [
          'Siêu thị và cửa hàng trái cây cao cấp',
          'Nhà nhập khẩu trái cây tươi',
          'Kênh quà tặng theo mùa',
        ],
        quoteLabel: 'Nhận báo giá nhanh',
      },
      {
        id: 'cavendish-banana',
        slug: 'chuoi-cavendish',
        categoryId: 'fresh-fruits',
        name: 'Chuối Cavendish',
        summary: 'Nguồn cung theo mùa vụ, đóng thùng carton và kiểm soát độ chín trước khi xuất.',
        image:
          'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: '13 - 18 kg / carton',
          moisture: 'Độ chín 3 - 4 khi đóng hàng',
          glueType: 'VietGAP / GlobalG.A.P. ready',
          size: 'Cluster / hand packed',
        },
        applications: [
          'Chuỗi bán lẻ và nhà phân phối trái cây',
          'Wholesale market',
          'Chương trình nhập khẩu định kỳ',
        ],
        quoteLabel: 'Nhận báo giá nhanh',
      },
      {
        id: 'diamond-cut-coconut',
        slug: 'dua-tuoi-got-kim-cuong',
        categoryId: 'fresh-coconut',
        name: 'Dừa tươi gọt kim cương',
        summary: 'Dừa tươi tạo hình đẹp, phù hợp kênh bán lẻ, nhà hàng và nhà phân phối đồ uống.',
        image:
          'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: '9 / 12 / 18 trái / thùng',
          moisture: 'Nước ngọt tự nhiên, trái tươi',
          glueType: 'Bến Tre / Mekong Delta',
          size: 'Theo quy cách thị trường',
        },
        applications: [
          'Kênh đồ uống và nhà hàng',
          'Siêu thị trái cây nhiệt đới',
          'Nhà phân phối dừa tươi',
        ],
        quoteLabel: 'Nhận báo giá nhanh',
      },
      {
        id: 'whole-fresh-coconut',
        slug: 'dua-tuoi-nguyen-trai',
        categoryId: 'fresh-coconut',
        name: 'Dừa tươi nguyên trái',
        summary: 'Nguồn dừa tươi ổn định cho các đơn hàng volume, đóng thùng hoặc bao theo yêu cầu.',
        image:
          'https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: '20 - 25 trái / bao hoặc carton',
          moisture: 'Trái tươi, kiểm tra ngoại quan',
          glueType: 'Vùng trồng Bến Tre / Trà Vinh',
          size: 'Theo buyer spec',
        },
        applications: [
          'Nhà nhập khẩu volume lớn',
          'Chợ đầu mối và wholesale',
          'Nhà máy chế biến đồ uống',
        ],
        quoteLabel: 'Nhận báo giá nhanh',
      },
      {
        id: 'desiccated-coconut',
        slug: 'com-dua-say',
        categoryId: 'processed-coconut',
        name: 'Cơm dừa sấy',
        summary: 'Sản phẩm chế biến từ dừa cho ngành bánh kẹo, thực phẩm và đóng gói lại.',
        image:
          'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: 'Fine / medium grade',
          moisture: 'Food grade / HACCP',
          glueType: 'Nguồn dừa Việt Nam',
          size: '25 kg / bao',
        },
        applications: [
          'Nhà máy bánh kẹo và bakery',
          'Nguyên liệu chế biến thực phẩm',
          'Khách hàng repacking',
        ],
        quoteLabel: 'Nhận báo giá nhanh',
      },
      {
        id: 'custom-produce-packing',
        slug: 'dong-goi-nong-san-theo-yeu-cau',
        categoryId: 'oem-packing',
        name: 'Đóng gói nông sản theo yêu cầu',
        summary: 'Nhận phát triển quy cách thùng, nhãn và tổ hợp sản phẩm theo yêu cầu nhập khẩu.',
        image:
          'https://images.unsplash.com/photo-1601593768798-76c20d8108fd?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: 'Carton / pouch / combo pack',
          moisture: 'Theo tiêu chuẩn đơn hàng',
          glueType: 'VietGAP / HACCP / buyer spec',
          size: 'Tùy chỉnh theo RFQ',
        },
        applications: [
          'Nhãn riêng cho nhà nhập khẩu',
          'Combo trái cây theo mùa',
          'Dự án B2B theo thị trường mục tiêu',
        ],
        quoteLabel: 'Nhận báo giá nhanh',
      },
    ],
    quoteSection: {
      eyebrow: 'Nhận báo giá',
      title: 'Gửi nhanh nhu cầu về mặt hàng, quy cách đóng gói và lịch giao để đội ngũ FortisVN phản hồi.',
      description:
        'Có thể đính kèm tiêu chuẩn mua hàng, yêu cầu thị trường hoặc tài liệu tham chiếu để báo giá chính xác hơn.',
      fields: {
        name: 'Họ và tên',
        company: 'Công ty',
        email: 'Email',
        phone: 'Số điện thoại / WeChat / WhatsApp',
        quantity: 'Số lượng dự kiến',
        targetMarket: 'Thị trường xuất khẩu',
        specificationDetails: 'Quy cách chi tiết',
        attachment: 'Tệp đính kèm',
        message: 'Nhu cầu sản phẩm / quy cách / số lượng',
        submit: 'Gửi yêu cầu báo giá',
      },
    },
    labels: {
      allProducts: 'Tất cả',
      productList: 'Danh sách sản phẩm',
      productDetail: 'Chi tiết sản phẩm',
      applications: 'Thị trường / kênh tiêu thụ',
      technicalSpecs: 'Thông số kỹ thuật',
      empty: 'Chưa có sản phẩm trong danh mục này.',
    },
  },
  en: {
    pageHeader: {
      eyebrow: 'Product catalog',
      title: 'Fresh and processed agricultural products for importers and B2B sourcing teams.',
      description:
        'Browse export-ready fruits and coconut-based products with packing formats, quality standards and RFQ support.',
    },
    categories: [
      {
        id: 'fresh-fruits',
        slug: 'fresh-fruits',
        name: 'Fresh Fruits',
        description: 'Pomelo, banana and tropical fruits packed for export programs.',
      },
      {
        id: 'fresh-coconut',
        slug: 'fresh-coconut',
        name: 'Fresh Coconut',
        description: 'Young coconut, diamond-cut coconut and market-specific carton formats.',
      },
      {
        id: 'processed-coconut',
        slug: 'processed-coconut',
        name: 'Coconut Products',
        description: 'Desiccated coconut, coconut milk and coconut-based food ingredients.',
      },
      {
        id: 'oem-packing',
        slug: 'oem-packing',
        name: 'OEM Packing',
        description: 'Private label, product combinations and buyer-specific packing formats.',
      },
    ],
    products: [
      {
        id: 'green-skin-pomelo',
        slug: 'green-skin-pomelo',
        categoryId: 'fresh-fruits',
        name: 'Green skin pomelo',
        summary: 'Selected fruit by size with consistent appearance and clean sweetness for fresh fruit importers.',
        image:
          'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: '9 - 12 pcs / carton',
          moisture: 'Brix 10+ / uniform fruit',
          glueType: 'VietGAP / Mekong region',
          size: '12 - 15 kg / carton',
        },
        applications: [
          'Supermarkets and premium fruit stores',
          'Fresh fruit importers',
          'Seasonal gift programs',
        ],
        quoteLabel: 'Get a quick quote',
      },
      {
        id: 'cavendish-banana',
        slug: 'cavendish-banana',
        categoryId: 'fresh-fruits',
        name: 'Cavendish banana',
        summary: 'Seasonal supply with carton packing and ripeness control before export.',
        image:
          'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: '13 - 18 kg / carton',
          moisture: 'Ripeness stage 3 - 4 at packing',
          glueType: 'VietGAP / GlobalG.A.P. ready',
          size: 'Cluster / hand packed',
        },
        applications: [
          'Retail chains and fruit distributors',
          'Wholesale market',
          'Recurring import programs',
        ],
        quoteLabel: 'Get a quick quote',
      },
      {
        id: 'diamond-cut-coconut',
        slug: 'diamond-cut-fresh-coconut',
        categoryId: 'fresh-coconut',
        name: 'Diamond-cut fresh coconut',
        summary: 'Fresh coconuts with attractive trimming for retail, restaurant and beverage channels.',
        image:
          'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: '9 / 12 / 18 pcs / carton',
          moisture: 'Natural sweet water, fresh fruit',
          glueType: 'Ben Tre / Mekong Delta',
          size: 'Market-specific format',
        },
        applications: [
          'Beverage and restaurant channels',
          'Tropical fruit supermarkets',
          'Fresh coconut distributors',
        ],
        quoteLabel: 'Get a quick quote',
      },
      {
        id: 'whole-fresh-coconut',
        slug: 'whole-fresh-coconut',
        categoryId: 'fresh-coconut',
        name: 'Whole fresh coconut',
        summary: 'Stable fresh coconut supply for volume orders, packed in cartons or bags by requirement.',
        image:
          'https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: '20 - 25 pcs / bag or carton',
          moisture: 'Fresh fruit, visual inspection',
          glueType: 'Ben Tre / Tra Vinh growing regions',
          size: 'Buyer specification',
        },
        applications: [
          'High-volume importers',
          'Wholesale markets',
          'Beverage processing plants',
        ],
        quoteLabel: 'Get a quick quote',
      },
      {
        id: 'desiccated-coconut',
        slug: 'desiccated-coconut',
        categoryId: 'processed-coconut',
        name: 'Desiccated coconut',
        summary: 'Processed coconut ingredient for bakery, confectionery and repacking customers.',
        image:
          'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: 'Fine / medium grade',
          moisture: 'Food grade / HACCP',
          glueType: 'Vietnam coconut source',
          size: '25 kg / bag',
        },
        applications: [
          'Bakery and confectionery factories',
          'Food ingredient processing',
          'Repacking customers',
        ],
        quoteLabel: 'Get a quick quote',
      },
      {
        id: 'custom-produce-packing',
        slug: 'custom-produce-packing',
        categoryId: 'oem-packing',
        name: 'Custom produce packing',
        summary: 'Packing, labelling and product combinations developed around importer requirements.',
        image:
          'https://images.unsplash.com/photo-1601593768798-76c20d8108fd?auto=format&fit=crop&w=1200&q=80',
        specifications: {
          thickness: 'Carton / pouch / combo pack',
          moisture: 'Order standard based',
          glueType: 'VietGAP / HACCP / buyer spec',
          size: 'Customized by RFQ',
        },
        applications: [
          'Private label import programs',
          'Seasonal fruit combo packs',
          'B2B projects by target market',
        ],
        quoteLabel: 'Get a quick quote',
      },
    ],
    quoteSection: {
      eyebrow: 'Get a quote',
      title: 'Share your crop, packing and shipment requirements so FortisVN can respond quickly.',
      description:
        'Attach buying specs, target market requirements or reference documents for a more accurate quotation.',
      fields: {
        name: 'Full name',
        company: 'Company',
        email: 'Email',
        phone: 'Phone / WeChat / WhatsApp',
        quantity: 'Estimated quantity',
        targetMarket: 'Target market',
        specificationDetails: 'Detailed specification',
        attachment: 'Attachment file',
        message: 'Product requirement / spec / quantity',
        submit: 'Send quote request',
      },
    },
    labels: {
      allProducts: 'All products',
      productList: 'Product list',
      productDetail: 'Product detail',
      applications: 'Markets / channels',
      technicalSpecs: 'Technical specifications',
      empty: 'No products available in this category.',
    },
  },
}

function buildFallbackGallery(product, categoryProducts) {
  const relatedImages = categoryProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 3)
    .map((item) => item.image)

  return [product.image, ...relatedImages]
}

function enrichCatalog(catalog) {
  return {
    ...catalog,
    products: catalog.products.map((product) => {
      const categoryName =
        catalog.categories.find((category) => category.id === product.categoryId)?.name ?? ''
      const categoryProducts = catalog.products.filter(
        (item) => item.categoryId === product.categoryId,
      )

      return {
        ...product,
        categoryName,
        specifications: normalizeFallbackSpecifications(product.specifications, catalog.labels?.allProducts),
        detailDescription: product.detailDescription ?? product.summary ?? '',
        highlights: normalizeFallbackSpecifications(product.highlights ?? product.specifications, catalog.labels?.allProducts).slice(0, 3),
        qualityControlSteps: normalizeFallbackSpecifications(product.qualityControlSteps ?? [], catalog.labels?.allProducts),
        specificationFileUrl: product.specificationFileUrl ?? SAMPLE_SPECIFICATION_URL,
        gallery: product.gallery ?? buildFallbackGallery(product, categoryProducts),
      }
    }),
  }
}

function normalizeFallbackSpecifications(specifications, localeHint) {
  if (Array.isArray(specifications)) {
    return specifications
  }

  const english = localeHint === 'All products'
  const labels = english
    ? [
        ['thickness', 'Packing format'],
        ['moisture', 'Quality standard'],
        ['glueType', 'Origin / certification'],
        ['size', 'Net weight / carton'],
      ]
    : [
        ['thickness', 'Quy cách đóng gói'],
        ['moisture', 'Tiêu chuẩn chất lượng'],
        ['glueType', 'Xuất xứ / Chứng nhận'],
        ['size', 'Khối lượng / Quy cách carton'],
      ]

  return labels
    .map(([key, label]) => ({
      label,
      value: specifications?.[key],
    }))
    .filter((spec) => spec.value)
}

export function getFallbackProductCatalog(locale) {
  return enrichCatalog(PRODUCT_CATALOG_FALLBACK[locale] ?? PRODUCT_CATALOG_FALLBACK.en)
}
