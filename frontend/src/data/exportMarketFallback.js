const fallbackArticles = {
  vi: [
    {
      id: 'pepper-cinnamon-export-jan-jul',
      slug: 'statistics-of-pepper-and-cinnamon-export-volume-from-january-to-july',
      title: 'Thống kê xuất khẩu hồ tiêu và quế từ tháng 1 đến tháng 7',
      excerpt:
        '7 tháng đầu năm ghi nhận giá trị xuất khẩu hồ tiêu tăng dù sản lượng giảm, trong khi quế tiếp tục mở rộng tại các thị trường trọng điểm.',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1400&q=85',
      category: 'Pepper & Cinnamon',
      author: 'Fortis VN',
      publishedAt: '2025-08-12',
      featured: true,
      paragraphs: [
        'Theo thống kê từ ngày 1/1 đến 31/7/2025, Việt Nam xuất khẩu 145.046 tấn hồ tiêu các loại. Hồ tiêu đen đạt 124.271 tấn, hồ tiêu trắng đạt 20.775 tấn.',
        'Tổng kim ngạch xuất khẩu hồ tiêu đạt khoảng 988 triệu USD. Dù sản lượng giảm so với cùng kỳ, giá trị xuất khẩu tăng nhờ mặt bằng giá bình quân cao hơn.',
        'Đối với quế, Việt Nam xuất khẩu 73.080 tấn trong cùng giai đoạn, kim ngạch đạt khoảng 187,5 triệu USD. Ấn Độ tiếp tục là thị trường lớn nhất, tiếp theo là Hoa Kỳ, Bangladesh, UAE và Trung Quốc.',
        'Fortis VN theo dõi các biến động này để hỗ trợ khách hàng B2B lên kế hoạch mua hàng, chốt quy cách đóng gói và tối ưu lịch giao theo mùa vụ.',
      ],
    },
    {
      id: 'coffee-export-throne',
      slug: 'coffee-takes-the-export-throne',
      title: 'Cà phê giữ vị thế dẫn đầu trong nhóm nông sản xuất khẩu',
      excerpt:
        'Cà phê tiếp tục đóng vai trò dẫn dắt khi nhiều nhóm nông, lâm, thủy sản tăng trưởng mạnh trong các tháng đầu năm.',
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=85',
      category: 'Coffee',
      author: 'Fortis VN',
      publishedAt: '2025-08-11',
      featured: true,
      paragraphs: [
        'Nhu cầu ổn định từ các thị trường rang xay và chế biến giúp cà phê duy trì giá trị xuất khẩu cao.',
        'Các doanh nghiệp xuất khẩu cần kiểm soát độ ẩm, tạp chất, quy cách bao bì và lịch giao để phù hợp yêu cầu từng thị trường.',
        'Với khách hàng nhập khẩu, việc theo dõi biến động giá và tồn kho giúp giảm rủi ro khi chốt hợp đồng dài hạn.',
      ],
    },
    {
      id: 'long-term-agricultural-export-strategy',
      slug: 'long-term-strategy-is-needed-to-maintain-agricultural-export-position',
      title: 'Cần chiến lược dài hạn để giữ vị thế xuất khẩu nông sản',
      excerpt:
        'Nông nghiệp Việt Nam cần tiếp tục đầu tư vào chất lượng, truy xuất nguồn gốc và năng lực chế biến để giữ đà tăng trưởng.',
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=85',
      category: 'Strategy',
      author: 'Fortis VN',
      publishedAt: '2025-08-10',
      featured: false,
      paragraphs: [
        'Trong bối cảnh rào cản kỹ thuật ngày càng rõ, lợi thế giá không còn là yếu tố duy nhất để cạnh tranh.',
        'Doanh nghiệp cần xây dựng vùng nguyên liệu ổn định, tiêu chuẩn kiểm soát chất lượng và dữ liệu truy xuất minh bạch.',
        'Fortis VN định hướng phát triển mạng lưới đối tác có khả năng đáp ứng đều về chất lượng, chứng từ và tiến độ giao hàng.',
      ],
    },
    {
      id: 'lychee-export-orders',
      slug: 'viet-linh-continuously-updates-lychee-export-orders',
      title: 'Cập nhật đơn hàng vải xuất khẩu sang thị trường quốc tế',
      excerpt:
        'Mùa vải mở ra cơ hội ngắn hạn cho các đơn hàng trái cây tươi nếu kiểm soát tốt thu hoạch, làm mát và logistics.',
      image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=1400&q=85',
      category: 'Fresh Fruit',
      author: 'Fortis VN',
      publishedAt: '2025-06-18',
      featured: false,
      paragraphs: [
        'Vải là mặt hàng có mùa vụ ngắn nên kế hoạch thu mua, sơ chế và đặt lịch vận chuyển cần được chuẩn bị sớm.',
        'Các thị trường như Trung Quốc, Nhật Bản, Hàn Quốc và Australia thường yêu cầu tiêu chuẩn kiểm dịch và đóng gói rõ ràng.',
        'Việc phối hợp từ vùng trồng đến kho đóng gói giúp giảm rủi ro trễ lịch và giữ chất lượng trái khi đến cảng đích.',
      ],
    },
  ],
  en: [],
  zh: [],
}

fallbackArticles.en = fallbackArticles.vi.map((article) => ({
  ...article,
  title: {
    'pepper-cinnamon-export-jan-jul': 'Statistics of pepper and cinnamon export volume from January to July',
    'coffee-export-throne': 'Coffee takes the export throne',
    'long-term-agricultural-export-strategy': 'Long-term strategy is needed to maintain agricultural export position',
    'lychee-export-orders': 'Lychee export orders update for international markets',
  }[article.id],
  excerpt: {
    'pepper-cinnamon-export-jan-jul':
      'Pepper export value rose despite lower volume in the first seven months, while cinnamon continued to expand across key destination markets.',
    'coffee-export-throne':
      'Coffee continued to lead as several agricultural, forestry and fishery product groups posted strong export growth.',
    'long-term-agricultural-export-strategy':
      'Vietnamese agriculture needs continued investment in quality, traceability and processing capacity to sustain growth.',
    'lychee-export-orders':
      'The lychee season creates short-term opportunities for fresh fruit orders when harvest, cooling and logistics are tightly controlled.',
  }[article.id],
  paragraphs: {
    'pepper-cinnamon-export-jan-jul': [
      'From January 1 to July 31, 2025, Vietnam exported 145,046 tons of pepper, including 124,271 tons of black pepper and 20,775 tons of white pepper.',
      'Total pepper export turnover reached around USD 988 million. Although volume declined year over year, export value improved thanks to higher average prices.',
      'For cinnamon, Vietnam shipped 73,080 tons in the same period with turnover of about USD 187.5 million. India remained the largest market, followed by the United States, Bangladesh, the UAE and China.',
      'Fortis VN tracks these movements to help B2B customers plan sourcing, confirm packing specifications and optimize shipment schedules around seasonal supply.',
    ],
    'coffee-export-throne': [
      'Stable demand from roasting and processing markets helped coffee maintain strong export value.',
      "Exporters need to control moisture, impurities, packing formats and shipment timing to match each market's requirements.",
      'For importers, tracking price movement and inventory levels can reduce risk when negotiating longer-term contracts.',
    ],
    'long-term-agricultural-export-strategy': [
      'As technical barriers become more visible, price advantage alone is no longer enough to compete.',
      'Companies need stable sourcing regions, quality-control standards and transparent traceability data.',
      'Fortis VN aims to develop a partner network capable of consistent quality, documentation and delivery performance.',
    ],
    'lychee-export-orders': [
      'Lychee has a short season, so purchasing, packing and shipment planning should be prepared early.',
      'Markets such as China, Japan, Korea and Australia usually require clear quarantine and packing standards.',
      'Coordinating from growing area to packing house helps reduce schedule risk and maintain fruit quality at destination.',
    ],
  }[article.id],
}))

fallbackArticles.zh = fallbackArticles.en

const copy = {
  vi: {
    pageHeader: {
      eyebrow: 'Thị trường xuất khẩu',
      title: 'Cập nhật thị trường xuất khẩu cho khách hàng sourcing nông sản.',
      description:
        'Theo dõi xu hướng hồ tiêu, quế, cà phê và nông sản tươi qua các bản tin ngắn phục vụ kế hoạch B2B.',
    },
    labels: {
      breadcrumbHome: 'Trang chủ',
      breadcrumbCurrent: 'Thị trường xuất khẩu',
      readMore: 'Đọc tiếp',
      latestPosts: 'Bài mới',
      maybeYouLike: 'Có thể bạn quan tâm',
      noArticles: 'Chưa có bài viết thị trường xuất khẩu.',
    },
  },
  en: {
    pageHeader: {
      eyebrow: 'Export market',
      title: 'Export market intelligence for agricultural sourcing teams.',
      description:
        'Follow pepper, cinnamon, coffee and fresh produce export trends with concise updates for B2B planning.',
    },
    labels: {
      breadcrumbHome: 'Home',
      breadcrumbCurrent: 'Export market',
      readMore: 'Read more',
      latestPosts: 'New post',
      maybeYouLike: 'Maybe you like',
      noArticles: 'No export market articles are available.',
    },
  },
  zh: {
    pageHeader: {
      eyebrow: '出口市场',
      title: '为农产品采购团队提供出口市场资讯。',
      description:
        '通过简洁资讯跟踪胡椒、肉桂、咖啡和新鲜农产品出口趋势，支持 B2B 采购计划。',
    },
    labels: {
      breadcrumbHome: '首页',
      breadcrumbCurrent: '出口市场',
      readMore: '阅读更多',
      latestPosts: '最新文章',
      maybeYouLike: '您可能感兴趣',
      noArticles: '暂无出口市场文章。',
    },
  },
}

export function getFallbackExportMarket(locale) {
  const currentCopy = copy[locale] ?? copy.en
  return {
    locale,
    pageHeader: currentCopy.pageHeader,
    labels: currentCopy.labels,
    articles: fallbackArticles[locale] ?? fallbackArticles.en,
  }
}

export function getFallbackExportMarketDetail(locale, slug) {
  const list = getFallbackExportMarket(locale)
  const article = list.articles.find((item) => item.slug === slug) ?? list.articles[0]
  const related = list.articles.filter((item) => item.id !== article.id)
  return {
    locale,
    labels: list.labels,
    article,
    latestPosts: related.slice(0, 5),
    relatedPosts: related.filter((item) => item.featured || item.category === article.category).slice(0, 5),
  }
}
