const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconDashboard(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}

export function IconRfq(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h7M9 17h5" />
    </svg>
  )
}

export function IconCatalog(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function IconCompany(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 21V8l9-5 9 5v13" />
      <path d="M9 21v-6h6v6" />
      <path d="M7 11h.01M11 11h.01M15 11h.01M11 7h.01M15 7h.01" />
    </svg>
  )
}

export function IconUsers(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 20c0-2.5 1.5-4.5 4-4.5s3 1.5 3 4.5" />
    </svg>
  )
}

export function IconMenu(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function IconBell(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 8a6 6 0 1 1 12 0c0 6 2 8 2 8H4s2-2 2-8z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function IconHelp(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export function IconSearch(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export function IconPlus(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconEdit(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 20h4l11-11-4-4L4 16v4z" />
      <path d="m14 6 4 4" />
    </svg>
  )
}

export function IconTrash(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function IconLock(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function IconUnlock(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 7.5-2" />
    </svg>
  )
}

export function IconClose(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function IconChart(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 17l5-5 4 3 8-8" />
      <path d="M14 7h6v6" />
    </svg>
  )
}

export function IconMail(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export function IconPencilCircle(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 14l5-5 2 2-5 5H9v-2z" />
    </svg>
  )
}

export function IconCalendar(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  )
}

export function IconUpload(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 16V4" />
      <path d="m6 10 6-6 6 6" />
      <path d="M4 20h16" />
    </svg>
  )
}

export function IconImage(props) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  )
}

export function IconArrowLeft(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

export function IconLogout(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </svg>
  )
}

export function IconUser(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  )
}

export function IconKey(props) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.5 12.5 8-8" />
      <path d="m15 8 3 3M17 6l3 3" />
    </svg>
  )
}
