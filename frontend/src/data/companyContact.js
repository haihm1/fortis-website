export const COMPANY_CONTACT = {
  vietnameseName: 'Công ty TNHH Fortis VN',
  englishName: 'Fortis VN Co., Ltd.',
  address: '6/40/165 Dương Quảng Hàm, phường Nghĩa Đô, Hà Nội',
  addressEn: '6/40/165 Duong Quang Ham, Nghia Do Ward, Hanoi, Vietnam',
  hotlineDisplay: '+84 378 414 824',
  hotlineHref: 'tel:+84378414824',
  email: 'fortisvn.coltd@gmail.com',
  emailHref: 'mailto:fortisvn.coltd@gmail.com',
  workingHours: {
    vi: 'Thứ 2 - Thứ 6, 08:00 - 17:30 (GMT+7)',
    en: 'Monday - Friday, 08:00 - 17:30 (GMT+7)',
  },
  channels: {
    wechat: {
      label: { vi: 'WeChat', en: 'WeChat' },
      display: '+84 378 414 824',
    },
    zalo: {
      label: { vi: 'Zalo', en: 'Zalo' },
      display: '+84 378 414 824',
      href: 'https://zalo.me/84378414824',
    },
    whatsapp: {
      label: { vi: 'WhatsApp', en: 'WhatsApp' },
      display: '+84 378 414 824',
      href: 'https://wa.me/84378414824',
    },
    email: {
      label: { vi: 'Email', en: 'Email' },
      display: 'fortisvn.coltd@gmail.com',
      href: 'mailto:fortisvn.coltd@gmail.com',
    },
  },
}

export function getMapEmbedUrl() {
  const query = encodeURIComponent(
    '6/40/165 Duong Quang Ham, Nghia Do, Cau Giay, Ha Noi',
  )
  return `https://www.google.com/maps?q=${query}&output=embed`
}

export function getMapDirectionsUrl() {
  const query = encodeURIComponent(
    '6/40/165 Duong Quang Ham, Nghia Do, Cau Giay, Ha Noi',
  )
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`
}
