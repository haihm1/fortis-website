import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { QuickContactIcon } from '../components/QuickContactIcon'
import { COMPANY_CONTACT } from '../data/companyContact'
import { useBreadcrumbJsonLd } from '../hooks/useBreadcrumbJsonLd'
import { useHashScroll } from '../hooks/useHashScroll'
import { loadHomeContent } from '../services/homeContentApi'
import fortisLogo from '../image/LOGO Ngang.png'

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
  useHashScroll()

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
        { key: 'about', label: copy.about, path: '/about' },
        { key: 'services', label: copy.services, path: '/#categories' },
        { key: 'products', label: copy.products, path: '/products' },
        { key: 'export-market', label: copy.exportMarket, path: '/export-market' },
      ]
  const activeMobileLanguage =
    MOBILE_LANGUAGE_OPTIONS.find((option) => option.value === locale) ?? MOBILE_LANGUAGE_OPTIONS[0]
  const inactiveMobileLanguages = MOBILE_LANGUAGE_OPTIONS.filter((option) => option.value !== locale)

  const desktopNavLinkClass = ({ isActive }) =>
    `text-sm font-medium tracking-wide transition-colors duration-200 py-2 ${
      isActive ? 'text-gold-600' : 'text-forest-950/80 hover:text-forest-950'
    }`

  return (
    <div className="site-shell min-h-screen bg-stone-25 font-sans text-forest-950 antialiased">
      <header
        id="site-navigation"
        className={`sticky top-0 z-40 border-b transition-shadow duration-300 ${
          isScrolled ? 'border-forest-950/10 shadow-[0_4px_24px_rgba(15,30,16,0.08)]' : 'border-transparent'
        } bg-white/90 backdrop-blur-md`}
      >
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          <NavLink to="/" aria-label="FortisVN home" className="flex shrink-0 items-center">
            <img className="h-12 w-auto lg:h-14" src={fortisLogo} alt="FortisVN logo" decoding="async" />
          </NavLink>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {navItems.map((item) =>
              item.path?.includes('#') ? (
                <Link key={item.key ?? item.label} to={item.path} className={desktopNavLinkClass({ isActive: false })}>
                  {item.label}
                </Link>
              ) : (
                <NavLink key={item.key ?? item.label} to={item.path} className={desktopNavLinkClass}>
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher locale={locale} onChange={onChangeLocale} />
            <Link
              className="inline-flex h-11 cursor-pointer items-center rounded-full bg-forest-800 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-forest-900"
              to="/products#quote-request"
            >
              {copy.cta}
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full lg:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span
              className={`h-[2px] w-5 rounded-full bg-forest-950 transition-transform duration-200 ${isMobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
            />
            <span
              className={`h-[2px] w-5 rounded-full bg-forest-950 transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`h-[2px] w-5 rounded-full bg-forest-950 transition-transform duration-200 ${isMobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div id="mobile-navigation" className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-pointer bg-forest-950/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-forest-950/10 px-5">
              <img className="h-9 w-auto" src={fortisLogo} alt="FortisVN logo" />
              <button
                type="button"
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-forest-950"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Main navigation">
              {navItems.map((item) =>
                item.path?.includes('#') ? (
                  <Link
                    key={item.key ?? item.label}
                    to={item.path}
                    className="rounded-xl px-4 py-3 text-base font-medium text-forest-950/85 transition-colors hover:bg-forest-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <NavLink
                    key={item.key ?? item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                        isActive ? 'bg-forest-50 text-gold-700' : 'text-forest-950/85 hover:bg-forest-50'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ),
              )}
            </nav>
            <div className="mt-auto flex flex-col gap-4 border-t border-forest-950/10 px-5 py-5">
              <LanguageSwitcher locale={locale} onChange={onChangeLocale} />
              <Link
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-forest-800 px-6 text-sm font-semibold text-white transition-colors hover:bg-forest-900"
                to="/products#quote-request"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {copy.cta}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <Outlet />

      <div
        className="fixed right-4 bottom-6 z-30 flex flex-col items-end gap-3 sm:right-6"
        aria-label={copy.quickContactTitle}
      >
        <div className="flex flex-col items-end gap-3" role="group" aria-label="Language switcher">
          {isMobileLanguageOpen
            ? inactiveMobileLanguages.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-xl shadow-card transition-transform duration-200 hover:scale-105"
                  onClick={() => {
                    onChangeLocale(option.value)
                    setIsMobileLanguageOpen(false)
                  }}
                  aria-label={option.label}
                >
                  <span aria-hidden="true">{option.flag}</span>
                </button>
              ))
            : null}

          <button
            type="button"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-xl shadow-card ring-1 ring-forest-950/10 transition-transform duration-200 hover:scale-105 lg:hidden"
            onClick={() => setIsMobileLanguageOpen((current) => !current)}
            aria-label={`Current language: ${activeMobileLanguage.label}`}
            aria-expanded={isMobileLanguageOpen}
          >
            <span aria-hidden="true">{activeMobileLanguage.flag}</span>
          </button>
        </div>

        {quickContacts.map((item) =>
          item.action ? (
            <button
              key={item.key}
              type="button"
              className="group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-gold-600 shadow-card ring-1 ring-forest-950/10 transition-all duration-200 hover:scale-105 hover:text-gold-700"
              onClick={item.action}
              aria-label={`${item.label}: ${item.value}`}
              title={`${item.label}: ${item.value}`}
            >
              <QuickContactIcon type={item.icon} />
            </button>
          ) : (
            <a
              key={item.key}
              className="group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-gold-600 shadow-card ring-1 ring-forest-950/10 transition-all duration-200 hover:scale-105 hover:text-gold-700"
              href={item.href}
              aria-label={`${item.label}: ${item.value}`}
              title={`${item.label}: ${item.value}`}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
            >
              <QuickContactIcon type={item.icon} />
            </a>
          ),
        )}
      </div>

      <footer className="bg-forest-950 text-white/80" id="footer-contact">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8 lg:py-16">
          <div className="max-w-sm">
            <p className="font-display text-xl font-semibold text-white">
              {company?.englishName || COMPANY_CONTACT.englishName}
            </p>
            <p className="mt-4 text-sm leading-relaxed">{copy.footer}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{copy.footerTagline}</p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">{copy.branchesTitle}</p>
            <ul className="mt-4 space-y-3">
              {branches.map((branch) => (
                <li key={branch.name} className="text-sm leading-relaxed">
                  <strong className="block font-semibold text-white">{branch.name}</strong>
                  <span>{branch.address}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">{copy.quickLinksTitle}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex gap-2">
                <dt className="text-white/60">{copy.footerHotlineLabel}:</dt>
                <dd>
                  <a className="text-white transition-colors hover:text-gold-300" href={phoneHref}>
                    {hotlineDisplay}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-white/60">{copy.footerEmailLabel}:</dt>
                <dd>
                  <a className="text-white transition-colors hover:text-gold-300" href={emailHref}>
                    {email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-[1240px] px-4 py-5 text-xs text-white/50 sm:px-6 lg:px-8">
            © {new Date().getFullYear()} {company?.englishName || COMPANY_CONTACT.englishName}
          </p>
        </div>
      </footer>
    </div>
  )
}
