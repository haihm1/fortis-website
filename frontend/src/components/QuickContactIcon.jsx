export function QuickContactIcon({ type }) {
  if (type === 'wechat') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" width="20" height="20">
        <path d="M9.12 5C5.74 5 3 7.24 3 10c0 1.58.9 2.98 2.32 3.9L4.6 16.4l2.64-1.32c.6.12 1.22.18 1.88.18 3.38 0 6.12-2.24 6.12-5s-2.74-5-6.12-5z" />
        <path d="M16.9 9.4c-2.82 0-5.1 1.9-5.1 4.24 0 1.26.66 2.4 1.72 3.18l-.46 1.98 2.04-1.02c.56.1 1.16.16 1.8.16 2.82 0 5.1-1.9 5.1-4.24 0-2.34-2.28-4.3-5.1-4.3z" />
        <circle cx="7.1" cy="9.88" r="0.82" fill="#fff" />
        <circle cx="11.1" cy="9.88" r="0.82" fill="#fff" />
        <circle cx="14.9" cy="13.64" r="0.82" fill="#fff" />
        <circle cx="18.26" cy="13.64" r="0.82" fill="#fff" />
      </svg>
    )
  }

  if (type === 'zalo') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" width="20" height="20">
        <path d="M12 3c5 0 9 3.58 9 8s-4 8-9 8c-.84 0-1.66-.1-2.43-.3L5 21l1.43-3.56C4.3 16 3 13.63 3 11c0-4.42 4.03-8 9-8z" />
        <path d="M8.1 8.2h7.8v1.6l-5.45 5.96h5.45v1.64H8v-1.6l5.45-5.96H8.1z" fill="#fff" />
      </svg>
    )
  }

  if (type === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" width="20" height="20">
        <path d="M12.04 3C7.06 3 3 6.94 3 11.8c0 1.57.43 3.1 1.24 4.43L3 21l4.94-1.28a9.2 9.2 0 0 0 4.1.98c4.98 0 9.04-3.94 9.04-8.9S17.02 3 12.04 3z" />
        <path d="M16.93 14.34c-.2-.1-1.2-.58-1.38-.65-.18-.06-.32-.1-.46.1-.14.19-.53.65-.65.78-.12.13-.24.15-.44.05-.2-.1-.86-.31-1.63-1a6.12 6.12 0 0 1-1.13-1.4c-.12-.2-.01-.31.09-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.34.07-.13.03-.25-.02-.35-.05-.1-.46-1.08-.63-1.48-.17-.4-.34-.34-.46-.35h-.39c-.14 0-.35.05-.53.25-.18.2-.69.67-.69 1.63s.7 1.9.8 2.03c.1.13 1.37 2.14 3.34 2.92.47.2.84.31 1.13.39.48.15.92.13 1.27.08.39-.06 1.2-.49 1.37-.96.17-.47.17-.87.12-.96-.05-.1-.18-.15-.38-.25z" fill="#fff" />
      </svg>
    )
  }

  if (type === 'phone') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" width="20" height="20">
        <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.57 1 1 0 0 1-.25 1z" />
      </svg>
    )
  }

  if (type === 'map') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" width="20" height="20">
        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
      </svg>
    )
  }

  if (type === 'clock') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" width="20" height="20">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 11h-4V7h2v4h2z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" width="20" height="20">
      <path d="M4 6.5h16A1.5 1.5 0 0 1 21.5 8v8A1.5 1.5 0 0 1 20 17.5H4A1.5 1.5 0 0 1 2.5 16V8A1.5 1.5 0 0 1 4 6.5z" />
      <path d="m4.2 8 7.1 5.1a1.2 1.2 0 0 0 1.4 0L19.8 8" fill="#fff" />
    </svg>
  )
}
