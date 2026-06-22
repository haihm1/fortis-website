import { useMemo, useState } from 'react'
import { PhoneInput } from '../components/PhoneInput'
import { QuickContactIcon } from '../components/QuickContactIcon'
import { SectionHeading } from '../components/SectionHeading'
import { SuccessModal } from '../components/SuccessModal'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import {
  COMPANY_CONTACT,
  getMapDirectionsUrl,
  getMapEmbedUrl,
} from '../data/companyContact'
import { SEO, buildContactPageSchema } from '../data/seoConfig'
import { submitContactRequest } from '../services/publicContactApi'

const COPY = {
  vi: {
    eyebrow: 'Liên hệ',
    title: 'Kết nối cùng đội ngũ FortisVN',
    description:
      'Gửi yêu cầu của bạn về sản phẩm, quy cách đóng gói hoặc lịch giao hàng. Đội ngũ của chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
    infoTitle: 'Thông tin công ty',
    addressLabel: 'Địa chỉ',
    hoursLabel: 'Giờ làm việc',
    hotlineLabel: 'Hotline',
    emailLabel: 'Email',
    channelsTitle: 'Kênh liên hệ nhanh',
    channelsDescription:
      'Chọn kênh phù hợp để chat trực tiếp với đội kinh doanh.',
    mapTitle: 'Bản đồ',
    mapDirections: 'Mở chỉ đường',
    formEyebrow: 'Gửi yêu cầu',
    formTitle: 'Để lại thông tin, chúng tôi sẽ phản hồi sớm',
    formDescription:
      'Vui lòng cung cấp đầy đủ thông tin liên hệ và mô tả nhu cầu để chúng tôi tư vấn chính xác hơn.',
    fields: {
      fullName: 'Họ và tên *',
      companyName: 'Tên công ty',
      email: 'Email *',
      phone: 'Số điện thoại',
      productInterest: 'Sản phẩm quan tâm',
      targetMarket: 'Thị trường xuất khẩu',
      message: 'Nội dung cần trao đổi *',
      submit: 'Gửi yêu cầu',
    },
    successTitle: 'Gửi thành công!',
    success: 'Yêu cầu của bạn đã được gửi. Cảm ơn bạn đã liên hệ FortisVN! Đội ngũ sẽ phản hồi sớm nhất.',
    error: 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại hoặc dùng các kênh liên hệ nhanh.',
    sending: 'Đang gửi...',
    closeModal: 'Đóng',
    requiredHint: 'Các trường có dấu * là bắt buộc.',
  },
  en: {
    eyebrow: 'Contact',
    title: 'Get in touch with the FortisVN team',
    description:
      'Share your inquiry about products, packing specifications or shipment schedules. Our team will respond as soon as possible.',
    infoTitle: 'Company information',
    addressLabel: 'Address',
    hoursLabel: 'Working hours',
    hotlineLabel: 'Hotline',
    emailLabel: 'Email',
    channelsTitle: 'Quick contact channels',
    channelsDescription:
      'Pick the channel you prefer to chat directly with our sales team.',
    mapTitle: 'Location map',
    mapDirections: 'Open directions',
    formEyebrow: 'Send request',
    formTitle: 'Leave your details and we will get back to you',
    formDescription:
      'Please provide complete contact information and describe your requirements so we can advise you accurately.',
    fields: {
      fullName: 'Full name *',
      companyName: 'Company name',
      email: 'Email *',
      phone: 'Phone number',
      productInterest: 'Product of interest',
      targetMarket: 'Target export market',
      message: 'Message *',
      submit: 'Send request',
    },
    successTitle: 'Request submitted!',
    success: 'Your request has been submitted. Thank you for contacting FortisVN! Our team will reply as soon as possible.',
    error: 'Unable to submit your request right now. Please try again or use a quick contact channel.',
    sending: 'Sending...',
    closeModal: 'Close',
    requiredHint: 'Fields marked with * are required.',
  },
  zh: {
    eyebrow: '联系我们',
    title: '联系 FortisVN 团队',
    description:
      '请告诉我们您的产品、包装规格或出货计划需求。我们的团队会尽快回复。',
    infoTitle: '公司信息',
    addressLabel: '地址',
    hoursLabel: '工作时间',
    hotlineLabel: '热线',
    emailLabel: '邮箱',
    channelsTitle: '快速联系渠道',
    channelsDescription: '选择您偏好的渠道，直接与销售团队沟通。',
    mapTitle: '地图位置',
    mapDirections: '打开路线',
    formEyebrow: '发送请求',
    formTitle: '留下信息，我们会尽快回复',
    formDescription: '请提供完整联系方式并描述您的需求，以便我们更准确地提供建议。',
    fields: {
      fullName: '姓名 *',
      companyName: '公司名称',
      email: '邮箱 *',
      phone: '电话号码',
      productInterest: '感兴趣的产品',
      targetMarket: '目标出口市场',
      message: '留言 *',
      submit: '发送请求',
    },
    successTitle: '提交成功！',
    success: '您的请求已提交。感谢联系 FortisVN！我们的团队会尽快回复。',
    error: '暂时无法提交请求。请稍后再试或使用快速联系渠道。',
    sending: '提交中...',
    closeModal: '关闭',
    requiredHint: '带 * 的字段为必填项。',
  },
}

const INITIAL_FORM = {
  fullName: '',
  companyName: '',
  email: '',
  phoneDialCode: '+84',
  phoneLocalNumber: '',
  productInterest: '',
  targetMarket: '',
  message: '',
}

export function ContactPage({ locale }) {
  const copy = useMemo(() => COPY[locale] ?? COPY.en, [locale])
  const seo = SEO.contact[locale] ?? SEO.contact.en
  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('contact-page', buildContactPageSchema())

  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [showSuccess, setShowSuccess] = useState(false)

  const address = locale === 'vi' ? COMPANY_CONTACT.address : COMPANY_CONTACT.addressEn
  const workingHours = COMPANY_CONTACT.workingHours[locale] ?? COMPANY_CONTACT.workingHours.en

  const quickChannels = [
    {
      key: 'whatsapp',
      icon: 'whatsapp',
      label: COMPANY_CONTACT.channels.whatsapp.label[locale] ?? 'WhatsApp',
      value: COMPANY_CONTACT.channels.whatsapp.display,
      href: COMPANY_CONTACT.channels.whatsapp.href,
      external: true,
    },
    {
      key: 'zalo',
      icon: 'zalo',
      label: COMPANY_CONTACT.channels.zalo.label[locale] ?? 'Zalo',
      value: COMPANY_CONTACT.channels.zalo.display,
      href: COMPANY_CONTACT.channels.zalo.href,
      external: true,
    },
    {
      key: 'wechat',
      icon: 'wechat',
      label: COMPANY_CONTACT.channels.wechat.label[locale] ?? 'WeChat',
      value: COMPANY_CONTACT.channels.wechat.display,
    },
    {
      key: 'email',
      icon: 'email',
      label: COMPANY_CONTACT.channels.email.label[locale] ?? 'Email',
      value: COMPANY_CONTACT.channels.email.display,
      href: COMPANY_CONTACT.channels.email.href,
    },
  ]

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback({ type: '', message: '' })

    try {
      await submitContactRequest({
        fullName: form.fullName,
        companyName: form.companyName,
        email: form.email,
        phoneNumber: `${form.phoneDialCode} ${form.phoneLocalNumber}`.trim(),
        productInterest: form.productInterest,
        requestedQuantity: '',
        targetMarket: form.targetMarket,
        specificationDetails: '',
        message: form.message,
      })
      setForm(INITIAL_FORM)
      setShowSuccess(true)
    } catch {
      setFeedback({ type: 'error', message: copy.error })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-grid">
          <div className="contact-info-card">
            <p className="subsection-title">{copy.infoTitle}</p>
            <h3 className="contact-info-name">{COMPANY_CONTACT.vietnameseName}</h3>
            <p className="contact-info-subname">{COMPANY_CONTACT.englishName}</p>

            <ul className="contact-info-list">
              <li>
                <span className="contact-info-icon" aria-hidden="true">
                  <QuickContactIcon type="map" />
                </span>
                <div>
                  <p className="contact-info-label">{copy.addressLabel}</p>
                  <p className="contact-info-value">{address}</p>
                </div>
              </li>
              <li>
                <span className="contact-info-icon" aria-hidden="true">
                  <QuickContactIcon type="clock" />
                </span>
                <div>
                  <p className="contact-info-label">{copy.hoursLabel}</p>
                  <p className="contact-info-value">{workingHours}</p>
                </div>
              </li>
              <li>
                <span className="contact-info-icon" aria-hidden="true">
                  <QuickContactIcon type="phone" />
                </span>
                <div>
                  <p className="contact-info-label">{copy.hotlineLabel}</p>
                  <a className="contact-info-value" href={COMPANY_CONTACT.hotlineHref}>
                    {COMPANY_CONTACT.hotlineDisplay}
                  </a>
                </div>
              </li>
              <li>
                <span className="contact-info-icon" aria-hidden="true">
                  <QuickContactIcon type="email" />
                </span>
                <div>
                  <p className="contact-info-label">{copy.emailLabel}</p>
                  <a className="contact-info-value" href={COMPANY_CONTACT.emailHref}>
                    {COMPANY_CONTACT.email}
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div className="contact-channels-card">
            <p className="subsection-title">{copy.channelsTitle}</p>
            <p className="contact-channels-description">{copy.channelsDescription}</p>

            <div className="contact-channels-grid">
              {quickChannels.map((channel) => {
                const content = (
                  <>
                    <span className="contact-channel-icon" aria-hidden="true">
                      <QuickContactIcon type={channel.icon} />
                    </span>
                    <div>
                      <p className="contact-channel-label">{channel.label}</p>
                      <p className="contact-channel-value">{channel.value}</p>
                    </div>
                  </>
                )

                if (channel.href) {
                  return (
                    <a
                      key={channel.key}
                      className="contact-channel-item"
                      href={channel.href}
                      target={channel.external ? '_blank' : undefined}
                      rel={channel.external ? 'noreferrer' : undefined}
                    >
                      {content}
                    </a>
                  )
                }

                return (
                  <div key={channel.key} className="contact-channel-item">
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="contact-map-section">
        <div className="contact-map-header">
          <p className="subsection-title">{copy.mapTitle}</p>
          <a
            className="secondary-button"
            href={getMapDirectionsUrl()}
            target="_blank"
            rel="noreferrer"
          >
            {copy.mapDirections}
          </a>
        </div>
        <div className="contact-map-frame">
          <iframe
            src={getMapEmbedUrl()}
            title="FortisVN office location"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      <section className="quote-section" id="contact-form">
        <div className="quote-copy">
          <SectionHeading
            eyebrow={copy.formEyebrow}
            title={copy.formTitle}
            description={copy.formDescription}
          />
        </div>

        <form className="quote-form" onSubmit={handleSubmit}>
          <input
            type="text"
            required
            value={form.fullName}
            placeholder={copy.fields.fullName}
            aria-label={copy.fields.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
          />
          <input
            type="text"
            value={form.companyName}
            placeholder={copy.fields.companyName}
            aria-label={copy.fields.companyName}
            onChange={(event) => updateField('companyName', event.target.value)}
          />
          <input
            type="email"
            required
            value={form.email}
            placeholder={copy.fields.email}
            aria-label={copy.fields.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
          <PhoneInput
            required
            dialCode={form.phoneDialCode}
            localNumber={form.phoneLocalNumber}
            placeholder={copy.fields.phone}
            ariaLabel={copy.fields.phone}
            onDialCodeChange={(code) => updateField('phoneDialCode', code)}
            onLocalNumberChange={(num) => updateField('phoneLocalNumber', num)}
          />
          <input
            type="text"
            value={form.productInterest}
            placeholder={copy.fields.productInterest}
            aria-label={copy.fields.productInterest}
            onChange={(event) => updateField('productInterest', event.target.value)}
          />
          <input
            type="text"
            value={form.targetMarket}
            placeholder={copy.fields.targetMarket}
            aria-label={copy.fields.targetMarket}
            onChange={(event) => updateField('targetMarket', event.target.value)}
          />
          <textarea
            rows="6"
            required
            value={form.message}
            placeholder={copy.fields.message}
            aria-label={copy.fields.message}
            onChange={(event) => updateField('message', event.target.value)}
          />
          {feedback.message ? (
            <p className={`form-message ${feedback.type === 'error' ? 'error' : ''}`}>
              {feedback.message}
            </p>
          ) : null}
          <p style={{ marginTop: '12px' , textAlign: 'right'}} className="contact-required-hint">{copy.requiredHint}</p>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? copy.sending : copy.fields.submit}
          </button>
        </form>
      </section>

      <SuccessModal
        open={showSuccess}
        title={copy.successTitle}
        message={copy.success}
        closeLabel={copy.closeModal}
        onClose={() => setShowSuccess(false)}
      />
    </main>
  )
}
