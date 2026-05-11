import { useEffect, useMemo, useState } from 'react'
import {
  changeAdminPassword,
  createAdminAccount,
  getAdminAccounts,
  getAdminContacts,
  getAdminContent,
  updateAdminAccount,
  updateAdminBanner,
  updateAdminContactStatus,
  updateAdminContentProfile,
} from '../../services/admin/adminApi'

const TABS = [
  { id: 'contacts', label: 'Liên hệ', roles: ['SUPER_ADMIN', 'CONTACT_MANAGER'] },
  {
    id: 'content',
    label: 'Nội dung',
    roles: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  },
  {
    id: 'accounts',
    label: 'Tài khoản',
    roles: ['SUPER_ADMIN', 'ACCOUNT_MANAGER'],
  },
]

const ROLE_OPTIONS = [
  'SUPER_ADMIN',
  'CONTENT_EDITOR',
  'CONTENT_PUBLISHER',
  'CONTACT_MANAGER',
  'ACCOUNT_MANAGER',
]

const EMPTY_ACCOUNT_FORM = {
  username: '',
  displayName: '',
  email: '',
  active: true,
  roles: ['CONTENT_EDITOR'],
}

export function AdminDashboardPage({ adminAuth, onLogout }) {
  const [activeTab, setActiveTab] = useState('contacts')
  const [contacts, setContacts] = useState([])
  const [content, setContent] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT_FORM)
  const [selectedAccountId, setSelectedAccountId] = useState(null)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const [bannerFiles, setBannerFiles] = useState({})
  const [contentMessage, setContentMessage] = useState('')
  const [accountMessage, setAccountMessage] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const availableTabs = useMemo(() => {
    const userRoles = adminAuth.user.roles ?? []
    return TABS.filter((tab) => tab.roles.some((role) => userRoles.includes(role)))
  }, [adminAuth.user.roles])

  useEffect(() => {
    if (!availableTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id ?? 'contacts')
    }
  }, [activeTab, availableTabs])

  useEffect(() => {
    let isMounted = true

    async function hydrateDashboard() {
      setLoading(true)
      setPageError('')

      try {
        const tasks = []
        const hasRole = (roles) => roles.some((role) => adminAuth.user.roles.includes(role))

        if (hasRole(['SUPER_ADMIN', 'CONTACT_MANAGER'])) {
          tasks.push(
            getAdminContacts(adminAuth.token).then((result) => {
              if (isMounted) {
                setContacts(result.contacts ?? [])
              }
            }),
          )
        }

        if (hasRole(['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'])) {
          tasks.push(
            getAdminContent(adminAuth.token).then((result) => {
              if (isMounted) {
                setContent(result)
              }
            }),
          )
        }

        if (hasRole(['SUPER_ADMIN', 'ACCOUNT_MANAGER'])) {
          tasks.push(
            getAdminAccounts(adminAuth.token).then((result) => {
              if (isMounted) {
                setAccounts(result.accounts ?? [])
              }
            }),
          )
        }

        await Promise.all(tasks)
      } catch (error) {
        if (isMounted) {
          setPageError(error.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    hydrateDashboard()

    return () => {
      isMounted = false
    }
  }, [adminAuth.token, adminAuth.user.roles])

  function handleSelectAccount(account) {
    setSelectedAccountId(account.id)
    setAccountForm({
      username: account.username,
      displayName: account.displayName,
      email: account.email,
      active: account.active,
      roles: account.roles,
    })
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
    })
  }

  async function handleContactStatusChange(contactId, status) {
    try {
      const updated = await updateAdminContactStatus(adminAuth.token, contactId, status)
      setContacts((current) =>
        current.map((contact) => (contact.id === contactId ? updated : contact)),
      )
      setContactMessage('Đã cập nhật trạng thái liên hệ.')
    } catch (error) {
      setContactMessage(error.message)
    }
  }

  async function handleContentProfileSubmit(event) {
    event.preventDefault()
    setContentMessage('')

    try {
      const updated = await updateAdminContentProfile(adminAuth.token, {
        aboutArticleVi: content.aboutArticleVi,
        aboutArticleEn: content.aboutArticleEn,
        address: content.address,
        hotline: content.hotline,
        email: content.email,
      })
      setContent(updated)
      setContentMessage('Đã cập nhật nội dung hồ sơ công ty.')
    } catch (error) {
      setContentMessage(error.message)
    }
  }

  async function handleBannerSubmit(event, banner) {
    event.preventDefault()
    setContentMessage('')

    try {
      const form = new FormData(event.currentTarget)
      const payload = {
        titleVi: form.get('titleVi'),
        titleEn: form.get('titleEn'),
        descriptionVi: form.get('descriptionVi'),
        descriptionEn: form.get('descriptionEn'),
        overlayLabel: form.get('overlayLabel'),
      }

      const updatedBanner = await updateAdminBanner(
        adminAuth.token,
        banner.slot,
        payload,
        bannerFiles[banner.slot],
      )

      setContent((current) => ({
        ...current,
        banners: current.banners.map((item) =>
          item.slot === banner.slot ? updatedBanner : item,
        ),
      }))
      setBannerFiles((current) => ({ ...current, [banner.slot]: null }))
      setContentMessage(`Đã cập nhật banner slot ${banner.slot}.`)
    } catch (error) {
      setContentMessage(error.message)
    }
  }

  async function handleAccountSubmit(event) {
    event.preventDefault()
    setAccountMessage('')

    try {
      const payload = {
        ...accountForm,
        roles: accountForm.roles,
      }

      let savedAccount
      if (selectedAccountId) {
        savedAccount = await updateAdminAccount(adminAuth.token, selectedAccountId, payload)
        setAccounts((current) =>
          current.map((account) =>
            account.id === selectedAccountId ? savedAccount : account,
          ),
        )
        setAccountMessage('Đã cập nhật tài khoản.')
      } else {
        savedAccount = await createAdminAccount(adminAuth.token, payload)
        setAccounts((current) => [...current, savedAccount])
        setSelectedAccountId(savedAccount.id)
        setAccountMessage(
          'Đã tạo tài khoản mới. Mật khẩu mặc định hiện tại là ChangeMe@123.',
        )
      }
    } catch (error) {
      setAccountMessage(error.message)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    if (!selectedAccountId) {
      return
    }

    setAccountMessage('')

    try {
      const result = await changeAdminPassword(
        adminAuth.token,
        selectedAccountId,
        passwordForm,
      )
      setPasswordForm({ currentPassword: '', newPassword: '' })
      setAccountMessage(result.message)
    } catch (error) {
      setAccountMessage(error.message)
    }
  }

  if (loading) {
    return (
      <main className="admin-page">
        <section className="admin-panel">
          <p>Đang tải dashboard admin...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="section-eyebrow">Admin Dashboard</p>
          <h1 className="admin-page-title">Quản trị Fortis VN</h1>
          <p className="admin-page-subtitle">
            Xin chào {adminAuth.user.displayName}. Bạn đang đăng nhập với vai trò{' '}
            {adminAuth.user.roles.join(', ')}.
          </p>
        </div>

        <button type="button" className="secondary-button admin-logout" onClick={onLogout}>
          Đăng xuất
        </button>
      </section>

      {pageError ? <p className="form-message error">{pageError}</p> : null}

      <section className="admin-shell">
        <aside className="admin-sidebar">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab ? 'is-active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="admin-content">
          {activeTab === 'contacts' ? (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Yêu cầu báo giá / liên hệ</h2>
                  <p className="admin-label">{contacts.length} yêu cầu đã nhận</p>
                </div>
              </div>
              {contactMessage ? <p className="form-message">{contactMessage}</p> : null}
              {contacts.length === 0 ? (
                <div className="admin-empty-state">
                  <p>Chưa có yêu cầu liên hệ nào.</p>
                </div>
              ) : (
                <div className="admin-table-list">
                  {contacts.map((contact) => {
                    const statusConfig = {
                      NEW: { label: 'Mới', className: 'status-new' },
                      IN_PROGRESS: { label: 'Đang xử lý', className: 'status-inprogress' },
                      QUOTED: { label: 'Đã báo giá', className: 'status-quoted' },
                      CLOSED: { label: 'Đã đóng', className: 'status-closed' },
                    }
                    const status = statusConfig[contact.status] ?? { label: contact.status, className: '' }

                    return (
                      <article key={contact.id} className="admin-contact-card">
                        <div className="admin-contact-header">
                          <div className="admin-contact-identity">
                            <strong className="admin-contact-name">{contact.fullName}</strong>
                            {contact.companyName ? (
                              <span className="admin-contact-company">{contact.companyName}</span>
                            ) : null}
                          </div>
                          <div className="admin-contact-meta">
                            <span className={`admin-status-badge ${status.className}`}>
                              {status.label}
                            </span>
                            <time className="admin-contact-time">
                              {new Date(contact.createdAt).toLocaleString('vi-VN')}
                            </time>
                          </div>
                        </div>

                        <div className="admin-contact-body">
                          <div className="admin-contact-channels">
                            {contact.email ? (
                              <a href={`mailto:${contact.email}`} className="admin-contact-channel-link">
                                <span className="admin-channel-icon">✉</span>
                                {contact.email}
                              </a>
                            ) : null}
                            {contact.phoneNumber ? (
                              <a href={`tel:${contact.phoneNumber.replace(/\s/g, '')}`} className="admin-contact-channel-link">
                                <span className="admin-channel-icon">📞</span>
                                {contact.phoneNumber}
                              </a>
                            ) : null}
                          </div>

                          <div className="admin-contact-fields">
                            {contact.productInterest ? (
                              <div className="admin-field-item">
                                <span className="admin-field-label">Sản phẩm quan tâm</span>
                                <span className="admin-field-value admin-field-highlight">{contact.productInterest}</span>
                              </div>
                            ) : null}
                            {contact.requestedQuantity ? (
                              <div className="admin-field-item">
                                <span className="admin-field-label">Số lượng dự kiến</span>
                                <span className="admin-field-value">{contact.requestedQuantity}</span>
                              </div>
                            ) : null}
                            {contact.targetMarket ? (
                              <div className="admin-field-item">
                                <span className="admin-field-label">Thị trường mục tiêu</span>
                                <span className="admin-field-value">{contact.targetMarket}</span>
                              </div>
                            ) : null}
                          </div>

                          {contact.specificationDetails ? (
                            <div className="admin-contact-note">
                              <p className="admin-field-label">Quy cách chi tiết</p>
                              <p>{contact.specificationDetails}</p>
                            </div>
                          ) : null}

                          {contact.message ? (
                            <div className="admin-contact-note">
                              <p className="admin-field-label">Nội dung</p>
                              <p>{contact.message}</p>
                            </div>
                          ) : null}

                          {contact.attachmentUrl ? (
                            <div className="admin-contact-note">
                              <p className="admin-field-label">Tệp đính kèm</p>
                              <a href={contact.attachmentUrl} target="_blank" rel="noreferrer" className="admin-attachment-link">
                                {contact.attachmentUrl}
                              </a>
                            </div>
                          ) : null}
                        </div>

                        <div className="admin-contact-footer">
                          <span className="admin-field-label">Cập nhật trạng thái:</span>
                          <select
                            value={contact.status}
                            className="admin-status-select"
                            onChange={(event) =>
                              handleContactStatusChange(contact.id, event.target.value)
                            }
                          >
                            <option value="NEW">Mới (NEW)</option>
                            <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
                            <option value="QUOTED">Đã báo giá (QUOTED)</option>
                            <option value="CLOSED">Đã đóng (CLOSED)</option>
                          </select>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          ) : null}

          {activeTab === 'content' && content ? (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <h2>Nội dung doanh nghiệp</h2>
                <p>Banner, giới thiệu, địa chỉ, hotline</p>
              </div>
              {contentMessage ? <p className="form-message">{contentMessage}</p> : null}

              <form className="admin-form" onSubmit={handleContentProfileSubmit}>
                <textarea
                  rows="4"
                  value={content.aboutArticleVi}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      aboutArticleVi: event.target.value,
                    }))
                  }
                  placeholder="Bài giới thiệu tiếng Việt"
                />
                <textarea
                  rows="4"
                  value={content.aboutArticleEn}
                  onChange={(event) =>
                    setContent((current) => ({
                      ...current,
                      aboutArticleEn: event.target.value,
                    }))
                  }
                  placeholder="English introduction article"
                />
                <input
                  type="text"
                  value={content.address}
                  onChange={(event) =>
                    setContent((current) => ({ ...current, address: event.target.value }))
                  }
                  placeholder="Địa chỉ"
                />
                <input
                  type="text"
                  value={content.hotline}
                  onChange={(event) =>
                    setContent((current) => ({ ...current, hotline: event.target.value }))
                  }
                  placeholder="Hotline"
                />
                <input
                  type="email"
                  value={content.email}
                  onChange={(event) =>
                    setContent((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Email doanh nghiệp"
                />
                <button type="submit" className="primary-button">
                  Lưu hồ sơ công ty
                </button>
              </form>

              <div className="admin-banner-list">
                {content.banners.map((banner) => (
                  <form
                    key={banner.slot}
                    className="admin-card admin-form"
                    onSubmit={(event) => handleBannerSubmit(event, banner)}
                  >
                    <div className="admin-panel-header compact">
                      <h3>Banner Slot {banner.slot}</h3>
                      <span>{banner.imageUrl}</span>
                    </div>
                    <input name="titleVi" defaultValue={banner.titleVi} placeholder="Tiêu đề VI" />
                    <input name="titleEn" defaultValue={banner.titleEn} placeholder="Title EN" />
                    <textarea
                      name="descriptionVi"
                      rows="3"
                      defaultValue={banner.descriptionVi}
                      placeholder="Mô tả VI"
                    />
                    <textarea
                      name="descriptionEn"
                      rows="3"
                      defaultValue={banner.descriptionEn}
                      placeholder="Description EN"
                    />
                    <input
                      name="overlayLabel"
                      defaultValue={banner.overlayLabel}
                      placeholder="Overlay label"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setBannerFiles((current) => ({
                          ...current,
                          [banner.slot]: event.target.files?.[0] ?? null,
                        }))
                      }
                    />
                    <button type="submit" className="primary-button">
                      Cập nhật banner
                    </button>
                  </form>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === 'accounts' ? (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <h2>Tài khoản quản trị</h2>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setSelectedAccountId(null)
                    setAccountForm(EMPTY_ACCOUNT_FORM)
                    setPasswordForm({ currentPassword: '', newPassword: '' })
                  }}
                >
                  Tạo tài khoản mới
                </button>
              </div>
              {accountMessage ? <p className="form-message">{accountMessage}</p> : null}

              <div className="admin-account-layout">
                <div className="admin-table-list">
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      className={`admin-card admin-account-card ${
                        selectedAccountId === account.id ? 'is-active' : ''
                      }`}
                      onClick={() => handleSelectAccount(account)}
                    >
                      <strong>{account.displayName}</strong>
                      <p>{account.username}</p>
                      <p>{account.email}</p>
                      <p>{account.roles.join(', ')}</p>
                    </button>
                  ))}
                </div>

                <div className="admin-card admin-form-card">
                  <form className="admin-form" onSubmit={handleAccountSubmit}>
                    <input
                      type="text"
                      value={accountForm.username}
                      onChange={(event) =>
                        setAccountForm((current) => ({
                          ...current,
                          username: event.target.value,
                        }))
                      }
                      placeholder="Username"
                    />
                    <input
                      type="text"
                      value={accountForm.displayName}
                      onChange={(event) =>
                        setAccountForm((current) => ({
                          ...current,
                          displayName: event.target.value,
                        }))
                      }
                      placeholder="Display name"
                    />
                    <input
                      type="email"
                      value={accountForm.email}
                      onChange={(event) =>
                        setAccountForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="Email"
                    />
                    <label className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={accountForm.active}
                        onChange={(event) =>
                          setAccountForm((current) => ({
                            ...current,
                            active: event.target.checked,
                          }))
                        }
                      />
                      <span>Tài khoản đang hoạt động</span>
                    </label>

                    <div className="role-grid">
                      {ROLE_OPTIONS.map((role) => (
                        <label key={role} className="admin-checkbox">
                          <input
                            type="checkbox"
                            checked={accountForm.roles.includes(role)}
                            onChange={(event) =>
                              setAccountForm((current) => ({
                                ...current,
                                roles: event.target.checked
                                  ? [...current.roles, role]
                                  : current.roles.filter((item) => item !== role),
                              }))
                            }
                          />
                          <span>{role}</span>
                        </label>
                      ))}
                    </div>

                    <button type="submit" className="primary-button">
                      {selectedAccountId ? 'Lưu tài khoản' : 'Tạo tài khoản'}
                    </button>
                  </form>

                  {selectedAccountId ? (
                    <form className="admin-form admin-password-form" onSubmit={handlePasswordSubmit}>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            currentPassword: event.target.value,
                          }))
                        }
                        placeholder="Mật khẩu hiện tại"
                      />
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({
                            ...current,
                            newPassword: event.target.value,
                          }))
                        }
                        placeholder="Mật khẩu mới"
                      />
                      <button type="submit" className="secondary-button">
                        Đổi mật khẩu
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  )
}
