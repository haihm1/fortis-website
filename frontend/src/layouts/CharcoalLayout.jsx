import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { COMPANY_CONTACT } from '../data/companyContact'
import { CHARCOAL_CONTENT } from '../data/charcoalContent'
import { useHashScroll } from '../hooks/useHashScroll'
import { agriEntryUrl, brandPath } from '../lib/brand'
import fortisLogo from '../image/LOGO Ngang.png'

/**
 * Shell for the charcoal line.
 *
 * Deliberately a separate layout from SiteLayout rather than a variant of it: the
 * two sites share a company but not a navigation model, and threading a brand flag
 * through SiteLayout's menu gating, breadcrumb JSON-LD and quick-contact rail would
 * have made the agricultural site harder to reason about for no gain.
 */
export function CharcoalLayout({ locale, onChangeLocale, prefix }) {
  const copy = (CHARCOAL_CONTENT[locale] ?? CHARCOAL_CONTENT.en).nav
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useHashScroll()

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { key: 'home', label: copy.home, path: brandPath('/', prefix) },
    { key: 'about', label: copy.about, path: `${brandPath('/', prefix)}#about` },
    { key: 'products', label: copy.products, path: brandPath('/products', prefix) },
    { key: 'process', label: copy.process, path: `${brandPath('/', prefix)}#process` },
    { key: 'contact', label: copy.contact, path: brandPath('/contact', prefix) },
  ]

  const linkClass = ({ isActive }) =>
    `text-sm font-medium tracking-wide transition-colors duration-200 py-2 ${
      isActive ? 'text-ember-400' : 'text-white/75 hover:text-white'
    }`

  return (
    <div className="charcoal-shell site-shell flex min-h-screen flex-col bg-carbon-950 text-white">
      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
          isScrolled ? 'border-white/10 bg-carbon-950/95 backdrop-blur' : 'border-transparent bg-carbon-950'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-6 lg:h-24 lg:px-8">
          <Link className="flex shrink-0 items-center gap-3" to={brandPath('/', prefix)}>
            <img className="h-11 w-auto lg:h-12" src={fortisLogo} alt="FortisVN" decoding="async" />
            <span className="hidden border-l border-white/20 pl-3 font-display text-sm font-semibold text-ember-300 sm:block">
              Charcoal
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Charcoal site navigation">
            {navItems.map((item) =>
              item.path.includes('#') ? (
                <Link className={linkClass({ isActive: false })} key={item.key} to={item.path}>
                  {item.label}
                </Link>
              ) : (
                <NavLink className={linkClass} end key={item.key} to={item.path}>
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher locale={locale} onChange={onChangeLocale} />
            <Link
              className="inline-flex h-11 cursor-pointer items-center rounded-full bg-ember-500 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-ember-400"
              to={brandPath('/contact', prefix)}
            >
              {copy.quote}
            </Link>
          </div>

          <button
            className="inline-flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 lg:hidden"
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-controls="charcoal-mobile-nav"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            <span className="h-[2px] w-5 rounded-full bg-white" />
            <span className="h-[2px] w-5 rounded-full bg-white" />
            <span className="h-[2px] w-5 rounded-full bg-white" />
          </button>
        </div>

        {isMobileMenuOpen ? (
          <nav
            className="border-t border-white/10 bg-carbon-950 px-4 py-4 lg:hidden"
            id="charcoal-mobile-nav"
            aria-label="Charcoal site navigation"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  className="rounded-xl px-4 py-3 text-base font-medium text-white/85 transition-colors hover:bg-white/5"
                  key={item.key}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
              <LanguageSwitcher locale={locale} onChange={onChangeLocale} />
              <a
                className="text-sm text-white/55 underline-offset-4 hover:text-white hover:underline"
                href={agriEntryUrl()}
              >
                {copy.switchToAgri}
              </a>
            </div>
          </nav>
        ) : null}
      </header>

      {/*
        Keyed on locale so the whole page subtree remounts when the language changes.
        Reveal/Stagger trigger with `whileInView` + `once: true`: once a container has
        fired, it stops observing. Switching language replaces its children (their keys
        are the translated strings) but not the container itself, so the new children
        mount in the `hidden` state with nothing left to trigger them and the section
        goes blank. Remounting the container re-attaches the observer.
      */}
      <main className="flex-1" key={locale}>
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-carbon-950">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div>
            <img className="h-11 w-auto" src={fortisLogo} alt="FortisVN" decoding="async" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              {locale === 'vi'
                ? 'Than mùn cưa ép và than BBQ từ Việt Nam cho khách hàng công nghiệp và xuất khẩu.'
                : locale === 'zh'
                  ? '来自越南的机制锯末炭与烧烤炭，服务工业与出口客户。'
                  : 'Pressed sawdust and BBQ charcoal from Vietnam for industrial and export buyers.'}
            </p>
            <a
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-ember-300 underline-offset-4 transition-colors hover:text-ember-200 hover:underline"
              href={agriEntryUrl()}
            >
              {copy.switchToAgri}
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <nav aria-label="Charcoal site footer navigation">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-ember-400 uppercase">
              {locale === 'vi' ? 'Liên kết' : locale === 'zh' ? '链接' : 'Links'}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link className="text-sm text-white/60 transition-colors hover:text-white" to={item.path}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs font-semibold tracking-[0.2em] text-ember-400 uppercase">
              {locale === 'vi' ? 'Liên hệ' : locale === 'zh' ? '联系方式' : 'Contact'}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>{locale === 'vi' ? COMPANY_CONTACT.address : COMPANY_CONTACT.addressEn}</li>
              <li>
                <a className="transition-colors hover:text-white" href={COMPANY_CONTACT.hotlineHref}>
                  {COMPANY_CONTACT.hotlineDisplay}
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-white" href={COMPANY_CONTACT.emailHref}>
                  {COMPANY_CONTACT.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <p className="mx-auto max-w-[1240px] px-4 py-5 text-xs text-white/35 sm:px-6 lg:px-8">
            © {new Date().getFullYear()} {COMPANY_CONTACT.vietnameseName}
          </p>
        </div>
      </footer>
    </div>
  )
}
