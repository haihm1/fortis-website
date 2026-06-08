import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { QuickContactIcon } from '../components/QuickContactIcon'
import { COMPANY_CONTACT } from '../data/companyContact'
import { useBreadcrumbJsonLd } from '../hooks/useBreadcrumbJsonLd'
import { loadHomeContent } from '../services/homeContentApi'
import fortisLogo from '../image/logo fortis.png'

const LAYOUT_COPY = {
  vi: {
    home: 'Trang chủ',
    about: 'About Us',
    services: 'Services',
    products: 'Sản phẩm',
    exportMarket: 'Export Market',
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
    branchesTitle: 'Chi nhánh',
    quickLinksTitle: 'Liên kết',
  },
  en: {
    home: 'Home',
    about: 'About Us',
    services: 'Services',
    products: 'Products',
    exportMarket: 'Export Market',
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
    branchesTitle: 'Branches',
    quickLinksTitle: 'Quick links',
  },
  zh: {
    home: '首页',
    about: '关于我们',
    services: '服务',
    products: '产品',
    exportMarket: '出口市场',
    cta: '获取报价',
    quickContactTitle: '快速联系',
    wechat: 'WeChat',
    zalo: 'Zalo',
    whatsapp: 'WhatsApp',
    email: '邮箱',
    copied: '已复制',
    footer: '面向全球买家的越南农产品出口供应伙伴。',
    footerTagline: '透明采购、稳定交付、灵活的 B2B 支持。',
    footerAddressLabel: '地址',
    footerHotlineLabel: '热线',
    footerEmailLabel: '邮箱',
    branchesTitle: '分支机构',
    quickLinksTitle: '快捷链接',
  },
}

const MOBILE_LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
]

export function SiteLayout({ locale, onChangeLocale, navigationItems = [] }) {
  const copy = LAYOUT_COPY[locale] ?? LAYOUT_COPY.en
  useBreadcrumbJsonLd({ locale, navigationItems })

  const [wechatCopied, setWechatCopied] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileLanguageOpen, setIsMobileLanguageOpen] = useState(false)
  const [company, setCompany] = useState(null)

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function hydrateCompanyProfile() {
      try {
        const result = await loadHomeContent(locale, controller.signal)
        setCompany(result.data.company ?? null)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setCompany(null)
        }
      }
    }

    hydrateCompanyProfile()
    return () => controller.abort()
  }, [locale])

  const hotlineDisplay = company?.hotline || COMPANY_CONTACT.hotlineDisplay
  const email = company?.email || COMPANY_CONTACT.email
  const phoneDigits = hotlineDisplay.replace(/[^\d]/g, '')
  const phoneHref = phoneDigits ? `tel:+${phoneDigits}` : COMPANY_CONTACT.hotlineHref
  const whatsappHref = phoneDigits ? `https://wa.me/${phoneDigits}` : COMPANY_CONTACT.channels.whatsapp.href
  const zaloHref = phoneDigits ? `https://zalo.me/${phoneDigits}` : COMPANY_CONTACT.channels.zalo.href
  const emailHref = `mailto:${email}`
  const address = company?.address || (locale === 'vi' ? COMPANY_CONTACT.address : COMPANY_CONTACT.addressEn)

  async function handleWechatCopy() {
    try {
      await navigator.clipboard.writeText(hotlineDisplay)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = hotlineDisplay
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

  const quickContacts = [
    {
      key: 'wechat',
      label: wechatCopied ? copy.copied : copy.wechat,
      value: hotlineDisplay,
      icon: 'wechat',
      action: handleWechatCopy,
    },
    {
      key: 'zalo',
      href: zaloHref,
      label: copy.zalo,
      value: hotlineDisplay,
      icon: 'zalo',
      external: true,
    },
    {
      key: 'whatsapp',
      href: whatsappHref,
      label: copy.whatsapp,
      value: hotlineDisplay,
      icon: 'whatsapp',
      external: true,
    },
  ]

  const branches = [
    {
      name: 'Head office',
      address: address,
    }
  ]

  const navItems = navigationItems.length
    ? navigationItems
    : [
        { key: 'home', label: copy.home, path: '/' },
        { key: 'about', label: copy.about, path: '/#company-profile' },
        { key: 'services', label: copy.services, path: '/#categories' },
        { key: 'products', label: copy.products, path: '/products' },
        { key: 'export-market', label: copy.exportMarket, path: '/export-market' },
      ]
  const activeMobileLanguage =
    MOBILE_LANGUAGE_OPTIONS.find((option) => option.value === locale) ?? MOBILE_LANGUAGE_OPTIONS[0]
  const inactiveMobileLanguages = MOBILE_LANGUAGE_OPTIONS.filter((option) => option.value !== locale)

  return (
    <div className="site-shell">
      <button
        type="button"
        className={`mobile-menu-button ${isMobileMenuOpen ? 'is-open' : ''}`}
        onClick={() => setIsMobileMenuOpen((current) => !current)}
        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="site-navigation"
      >
        <span />
        <span />
        <span />
      </button>

      <button
        type="button"
        className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'is-open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-label="Close navigation menu"
      />

      <header
        id="site-navigation"
        className={`topbar ${isScrolled ? 'is-scrolled' : ''} ${isMobileMenuOpen ? 'is-mobile-open' : ''}`}
      >
        <div className="brand-identity">
          <NavLink to="/" aria-label="Fortis VN home">
            <img className="brand-logo" src={fortisLogo} alt="Fortis VN logo" decoding="async" />
          </NavLink>
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
            {navItems.map((item) => (
              item.path?.includes('#') ? (
                <Link key={item.key ?? item.label} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ) : (
                <NavLink key={item.key ?? item.label} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </NavLink>
              )
            ))}
          </nav>

          <LanguageSwitcher locale={locale} onChange={onChangeLocale} />
          <Link className="cta-link" to="/products#quote-request" onClick={() => setIsMobileMenuOpen(false)}>
            {copy.cta}
          </Link>
        </div>
      </header>

      <Outlet />

      <div className="quick-contact-stack" aria-label={copy.quickContactTitle}>
        <div className={`mobile-language-buttons ${isMobileLanguageOpen ? 'is-open' : ''}`} role="group" aria-label="Language switcher">
          <div className="mobile-language-options">
            {inactiveMobileLanguages.map((option) => (
              <button
                key={option.value}
                type="button"
                className="quick-contact-button language-flag-button"
                onClick={() => {
                  onChangeLocale(option.value)
                  setIsMobileLanguageOpen(false)
                }}
                aria-label={option.label}
                data-label={option.label}
              >
                <span aria-hidden="true">{option.flag}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="quick-contact-button language-flag-button is-active"
            onClick={() => setIsMobileLanguageOpen((current) => !current)}
            aria-label={`Current language: ${activeMobileLanguage.label}`}
            aria-expanded={isMobileLanguageOpen}
            data-label={activeMobileLanguage.label}
          >
            <span aria-hidden="true">{activeMobileLanguage.flag}</span>
          </button>
        </div>

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
        <div className="footer-brand-column">
          <p className="footer-title">{company?.englishName || COMPANY_CONTACT.englishName}</p>
          <p>{copy.footer}</p>
          <p className="footer-tagline">{copy.footerTagline}</p>
        </div>

        <div className="footer-column">
          <p className="footer-heading">{copy.branchesTitle}</p>
          <ul className="footer-branch-list">
            {branches.map((branch) => (
              <li key={branch.name}>
                <strong>{branch.name}</strong>
                <span>{branch.address}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <p className="footer-heading">{copy.quickLinksTitle}</p>
          <dl className="footer-contact-list">
            <div>
              <dt>{copy.footerHotlineLabel}</dt>
              <dd>
                <a href={phoneHref}>{hotlineDisplay}</a>
              </dd>
            </div>
            <div>
              <dt>{copy.footerEmailLabel}</dt>
              <dd>
                <a href={emailHref}>{email}</a>
              </dd>
            </div>
          </dl>
        </div>

      </footer>
    </div>
  )
}
