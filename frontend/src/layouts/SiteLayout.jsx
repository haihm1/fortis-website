import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { QuickContactIcon } from '../components/QuickContactIcon'
import { COMPANY_CONTACT } from '../data/companyContact'
import fortisLogo from '../image/logo fortis.png'

const LAYOUT_COPY = {
  vi: {
    home: 'Trang chủ',
    products: 'Sản phẩm',
    certificates: 'Chứng chỉ',
    contact: 'Liên hệ',
    cta: 'Nhận báo giá',
    quickContactTitle: 'Liên hệ nhanh',
    wechat: 'WeChat',
    zalo: 'Zalo',
    whatsapp: 'WhatsApp',
    email: 'Email',
    copied: 'Da copy',
    footer:
      'Đối tác cung ứng nông sản Việt cho thị trường xuất khẩu quốc tế.',
    footerTagline: 'Sourcing minh bạch, giao hàng ổn định, hỗ trợ B2B linh hoạt.',
    footerAddressLabel: 'Địa chỉ',
    footerHotlineLabel: 'Hotline',
    footerEmailLabel: 'Email',
  },
  en: {
    home: 'Home',
    products: 'Products',
    certificates: 'Certificates',
    contact: 'Contact',
    cta: 'Get a quote',
    quickContactTitle: 'Quick contact',
    wechat: 'WeChat',
    zalo: 'Zalo',
    whatsapp: 'WhatsApp',
    email: 'Email',
    copied: 'Copied',
    footer: 'Export-focused Vietnamese agricultural product supply partner for global buyers.',
    footerTagline: 'Transparent sourcing, stable delivery and flexible B2B support.',
    footerAddressLabel: 'Address',
    footerHotlineLabel: 'Hotline',
    footerEmailLabel: 'Email',
  },
}

export function SiteLayout({ locale, onChangeLocale }) {
  const copy = LAYOUT_COPY[locale] ?? LAYOUT_COPY.vi
  const [wechatCopied, setWechatCopied] = useState(false)

  async function handleWechatCopy() {
    try {
      await navigator.clipboard.writeText(COMPANY_CONTACT.channels.wechat.display)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = COMPANY_CONTACT.channels.wechat.display
      textArea.setAttribute('readonly', '')
      textArea.style.position = 'absolute'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }

    setWechatCopied(true)
    window.setTimeout(() => setWechatCopied(false), 2000)
  }

  const address = locale === 'en' ? COMPANY_CONTACT.addressEn : COMPANY_CONTACT.address

  const quickContacts = [
    {
      key: 'wechat',
      label: wechatCopied ? copy.copied : copy.wechat,
      value: COMPANY_CONTACT.channels.wechat.display,
      icon: 'wechat',
      action: handleWechatCopy,
    },
    {
      key: 'zalo',
      href: COMPANY_CONTACT.channels.zalo.href,
      label: copy.zalo,
      value: COMPANY_CONTACT.channels.zalo.display,
      icon: 'zalo',
      external: true,
    },
    {
      key: 'whatsapp',
      href: COMPANY_CONTACT.channels.whatsapp.href,
      label: copy.whatsapp,
      value: COMPANY_CONTACT.channels.whatsapp.display,
      icon: 'whatsapp',
      external: true,
    },
  ]

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand-identity">
          <img className="brand-logo" src={fortisLogo} alt="Fortis VN logo" />
          {/* <div>
            <p className="brand-kicker">FORTIS VN</p>
            <div className="brand-block">
              <h1>Công ty TNHH Fortis VN</h1>
              <p>Fortis VN Co., Ltd.</p>
            </div>
          </div> */}
        </div>

        <div className="topbar-actions">
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/">{copy.home}</NavLink>
            <NavLink to="/products">{copy.products}</NavLink>
            {/* <a href="/#credentials">{copy.certificates}</a> */}
            <NavLink to="/contact">{copy.contact}</NavLink>
          </nav>

          <LanguageSwitcher locale={locale} onChange={onChangeLocale} />
          <a className="cta-link" href="/products#quote-request">
            {copy.cta}
          </a>
        </div>
      </header>

      <Outlet />

      <div className="quick-contact-stack" aria-label={copy.quickContactTitle}>
        {quickContacts.map((item) => (
          item.action ? (
            <button
              key={item.key}
              type="button"
              className="quick-contact-button"
              onClick={item.action}
              aria-label={`${item.label}: ${item.value}`}
              data-label={item.label}
              title={`${item.label}: ${item.value}`}
            >
              <QuickContactIcon type={item.icon} />
            </button>
          ) : (
            <a
              key={item.key}
              className="quick-contact-button"
              href={item.href}
              aria-label={`${item.label}: ${item.value}`}
              data-label={item.label}
              title={`${item.label}: ${item.value}`}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
            >
              <QuickContactIcon type={item.icon} />
            </a>
          )
        ))}
      </div>

      <footer className="footer" id="footer-contact">
        <div>
          <p className="footer-title">{COMPANY_CONTACT.englishName}</p>
          <p>{copy.footer}</p>
          <p className="footer-tagline">{copy.footerTagline}</p>
        </div>

        <dl className="footer-contact-list">
          <div>
            <dt>{copy.footerAddressLabel}</dt>
            <dd>{address}</dd>
          </div>
          <div>
            <dt>{copy.footerHotlineLabel}</dt>
            <dd>
              <a href={COMPANY_CONTACT.hotlineHref}>{COMPANY_CONTACT.hotlineDisplay}</a>
            </dd>
          </div>
          <div>
            <dt>{copy.footerEmailLabel}</dt>
            <dd>
              <a href={COMPANY_CONTACT.emailHref}>{COMPANY_CONTACT.email}</a>
            </dd>
          </div>
        </dl>
      </footer>
    </div>
  )
}
