import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useFaqJsonLd } from '../hooks/useFaqJsonLd'

const MotionSection = motion.section

const FAQ_COPY = {
  vi: {
    eyebrow: 'FAQ',
    title: 'Câu hỏi thường gặp cho đối tác nhập khẩu',
    description: 'Các thông tin FortisVN thường xác nhận trước khi chốt quy cách, điều kiện giao hàng và bộ chứng từ xuất khẩu.',
    items: [
      {
        question: 'FortisVN hỗ trợ những điều kiện giao hàng Incoterms nào?',
        answer:
          'FortisVN có thể làm việc theo các điều kiện phổ biến như FOB, CIF, CFR hoặc EXW tùy tuyến vận chuyển, cảng đích và yêu cầu chứng từ của người mua.',
      },
      {
        question: 'Công ty chấp nhận các phương thức thanh toán nào?',
        answer:
          'Tùy từng đơn hàng, FortisVN có thể trao đổi các phương thức như T/T, L/C, D/P, D/A hoặc O/A sau khi đánh giá hồ sơ khách hàng và điều khoản thương mại.',
      },
      {
        question: 'Sản phẩm có thể cung cấp chứng nhận Halal hoặc chứng từ xuất khẩu không?',
        answer:
          'Với các mặt hàng phù hợp, FortisVN phối hợp nhà cung cấp để chuẩn bị chứng nhận Halal, kiểm dịch thực vật, chứng nhận xuất xứ, packing list, invoice và các chứng từ theo yêu cầu thị trường.',
      },
      {
        question: 'FortisVN có hỗ trợ quy cách đóng gói riêng cho từng thị trường không?',
        answer:
          'Có. Đội ngũ FortisVN có thể ghi nhận yêu cầu về khối lượng, nhãn mác, thùng carton, pallet, container và tiêu chuẩn đóng gói riêng của từng khách hàng B2B.',
      },
    ],
  },
  en: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions for import partners',
    description: 'Key points FortisVN usually confirms before finalising packing, delivery terms and export documentation.',
    items: [
      {
        question: 'Which Incoterms can FortisVN support?',
        answer:
          'FortisVN can discuss common terms such as FOB, CIF, CFR or EXW depending on the shipping lane, destination port and buyer documentation requirements.',
      },
      {
        question: 'Which payment methods are available?',
        answer:
          'Depending on the order, FortisVN can review payment methods such as T/T, L/C, D/P, D/A or O/A after checking the customer profile and trade terms.',
      },
      {
        question: 'Can products be supplied with Halal or export documents?',
        answer:
          'For suitable products, FortisVN coordinates with suppliers to prepare Halal certification, phytosanitary documents, certificate of origin, packing list, invoice and market-specific paperwork.',
      },
      {
        question: 'Can FortisVN support custom packing specifications?',
        answer:
          'Yes. FortisVN can record requirements for weight, labelling, cartons, pallets, containers and market-specific packing standards for B2B buyers.',
      },
    ],
  },
  zh: {
    eyebrow: 'FAQ',
    title: '进口合作伙伴常见问题',
    description: 'FortisVN 在确认包装、交货条款和出口文件前通常会核对的关键信息。',
    items: [
      {
        question: 'FortisVN 可支持哪些 Incoterms 贸易条款？',
        answer:
          'FortisVN 可根据运输路线、目的港和买方文件要求，沟通 FOB、CIF、CFR 或 EXW 等常见贸易条款。',
      },
      {
        question: '可接受哪些付款方式？',
        answer:
          '根据订单情况，FortisVN 可在评估客户资料和贸易条件后，沟通 T/T、L/C、D/P、D/A 或 O/A 等付款方式。',
      },
      {
        question: '产品是否可提供 Halal 或出口文件？',
        answer:
          '对于适用产品，FortisVN 可协调供应商准备 Halal 认证、植物检疫证书、原产地证、装箱单、发票及目标市场要求的文件。',
      },
      {
        question: 'FortisVN 是否支持定制包装规格？',
        answer:
          '可以。FortisVN 可记录重量、标签、纸箱、托盘、集装箱及不同市场的 B2B 包装标准要求。',
      },
    ],
  },
}

export function FaqSection({ locale = 'en' }) {
  const copy = FAQ_COPY[locale] ?? FAQ_COPY.en
  const questions = useMemo(() => copy.items, [copy.items])

  useFaqJsonLd('b2b-faq', questions)

  return (
    <MotionSection
      className="content-section faq-section"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55 }}
    >
      <div className="section-heading">
        <p className="section-eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>

      <div className="faq-grid">
        {questions.map((item) => (
          <article className="faq-card" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </MotionSection>
  )
}

