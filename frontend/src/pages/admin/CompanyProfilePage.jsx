import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { IconEdit, IconImage } from '../../admin/AdminIcons'
import {
  getAdminContent,
  updateAdminBanner,
  updateAdminContentProfile,
} from '../../services/admin/adminApi'

export function CompanyProfilePage() {
  const { adminAuth } = useOutletContext()
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [bannerMessage, setBannerMessage] = useState('')
  const [editingBanner, setEditingBanner] = useState(null)
  const [bannerForm, setBannerForm] = useState(null)
  const [bannerImage, setBannerImage] = useState(null)
  const [bannerLang, setBannerLang] = useState('vi')
  const [profileLang, setProfileLang] = useState('vi')

  useEffect(() => {
    let mounted = true
    getAdminContent(adminAuth.token)
      .then((data) => {
        if (mounted) setContent(data)
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [adminAuth.token])

  function openBannerEdit(banner) {
    setEditingBanner(banner)
    setBannerForm({
      titleVi: banner.titleVi ?? '',
      titleEn: banner.titleEn ?? '',
      titleZh: banner.titleZh ?? '',
      descriptionVi: banner.descriptionVi ?? '',
      descriptionEn: banner.descriptionEn ?? '',
      descriptionZh: banner.descriptionZh ?? '',
      overlayLabel: banner.overlayLabel ?? '',
    })
    setBannerImage(null)
  }

  async function handleBannerSubmit(event) {
    event.preventDefault()
    setBannerMessage('')
    try {
      const updated = await updateAdminBanner(
        adminAuth.token,
        editingBanner.slot,
        bannerForm,
        bannerImage,
      )
      setContent((current) => ({
        ...current,
        banners: current.banners.map((item) =>
          item.slot === editingBanner.slot ? updated : item,
        ),
      }))
      setBannerMessage(`Đã cập nhật banner #${editingBanner.slot}.`)
      setEditingBanner(null)
    } catch (err) {
      setBannerMessage(err.message)
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setProfileMessage('')
    try {
      const payload = {
        aboutArticleVi: content.aboutArticleVi,
        aboutArticleEn: content.aboutArticleEn,
        aboutArticleZh: content.aboutArticleZh,
        address: content.address,
        hotline: content.hotline,
        email: content.email,
      }
      const updated = await updateAdminContentProfile(adminAuth.token, payload)
      setContent((current) => ({ ...current, ...updated }))
      setProfileMessage('Đã lưu hồ sơ công ty.')
    } catch (err) {
      setProfileMessage(err.message)
    }
  }

  if (loading) {
    return (
      <>
        <header className="admin-page-header">
          <div>
            <h1>Company Profile</h1>
            <p>Đang tải nội dung công ty...</p>
          </div>
        </header>
      </>
    )
  }

  if (!content) {
    return (
      <>
        <header className="admin-page-header">
          <h1>Company Profile</h1>
        </header>
        <div className="alert alert-error">{error || 'Không tải được dữ liệu.'}</div>
      </>
    )
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Company Profile</h1>
          <p>Quản lý hero banner, hồ sơ công ty và cấu hình liên hệ footer.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="surface-card" style={{ marginBottom: 22 }}>
        <header className="surface-card-header">
          <div>
            <h2>Hero Banners — trang chủ</h2>
            <p>Quản lý các slide xuất hiện trên hero section homepage.</p>
          </div>
        </header>

        {bannerMessage ? <div className="alert alert-success">{bannerMessage}</div> : null}

        <div className="data-table-scroll">
          <table className="data-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Caption (Vi/En/Zh)</th>
                <th>Overlay</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {content.banners.map((banner) => (
                <tr key={banner.slot}>
                  <td>
                    <div className="thumbnail-cell">
                      <div className="thumbnail-cell-image">
                        {banner.imageUrl ? (
                          <img src={banner.imageUrl} alt={banner.titleVi} loading="lazy" decoding="async" />
                        ) : (
                          <IconImage style={{ color: 'var(--admin-text-muted)' }} />
                        )}
                      </div>
                      <div className="cell-stack">
                        <strong>Slot #{banner.slot}</strong>
                        <small>{banner.imageUrl ? 'Đã tải ảnh' : 'Chưa có ảnh'}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-stack">
                      <strong>{banner.titleVi}</strong>
                      <small>{banner.titleEn}</small>
                      <small>{banner.titleZh || 'Chưa nhập tiếng Trung'}</small>
                    </div>
                  </td>
                  <td className="cell-muted">{banner.overlayLabel}</td>
                  <td>
                    <div className="data-table-actions">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openBannerEdit(banner)}
                      >
                        <IconEdit style={{ width: 14, height: 14 }} />
                        Chỉnh sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginTop: 14 }}>
          Trang chủ đang hiển thị trực tiếp 3 banner theo slot này. Cập nhật ảnh, tiêu đề, mô tả hoặc overlay ở đây sẽ được public Home API trả về cho client.
        </p>
      </section>

      <section className="surface-card" style={{ marginBottom: 22 }}>
        <header className="surface-card-header">
          <div>
            <h2>Chứng chỉ & đối tác</h2>
            <p>Hiển thị huy hiệu chứng nhận và logo đối tác trên trang chủ.</p>
          </div>
        </header>

        <div className="empty-state">
          <strong>Sắp ra mắt</strong>
          <small>
            Backend chưa có entity chứng chỉ/đối tác. Sẽ bổ sung CRUD sau khi tạo bảng dữ liệu — danh sách hiện tại đang dùng từ frontend config.
          </small>
        </div>
      </section>

      <div className="profile-columns">
        <section className="surface-card">
          <header className="surface-card-header">
            <div>
              <h2>Giới thiệu công ty</h2>
              <p>Nội dung About hiển thị trên trang chủ và trang giới thiệu.</p>
            </div>
            <div className="lang-tabs" role="tablist">
              <button
                type="button"
                className={profileLang === 'vi' ? 'is-active' : ''}
                onClick={() => setProfileLang('vi')}
              >
                Vi
              </button>
              <button
                type="button"
                className={profileLang === 'en' ? 'is-active' : ''}
                onClick={() => setProfileLang('en')}
              >
                En
              </button>
              <button
                type="button"
                className={profileLang === 'zh' ? 'is-active' : ''}
                onClick={() => setProfileLang('zh')}
              >
                中文
              </button>
            </div>
          </header>

          {profileMessage ? <div className="alert alert-success">{profileMessage}</div> : null}

          <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: 14 }}>
            {profileLang === 'vi' ? (
              <label className="field">
                <span className="field-label">Bài giới thiệu tiếng Việt</span>
                <textarea
                  className="field-textarea"
                  rows={8}
                  value={content.aboutArticleVi}
                  onChange={(event) =>
                    setContent((current) => ({ ...current, aboutArticleVi: event.target.value }))
                  }
                />
              </label>
            ) : profileLang === 'en' ? (
              <label className="field">
                <span className="field-label">English introduction</span>
                <textarea
                  className="field-textarea"
                  rows={8}
                  value={content.aboutArticleEn}
                  onChange={(event) =>
                    setContent((current) => ({ ...current, aboutArticleEn: event.target.value }))
                  }
                />
              </label>
            ) : (
              <label className="field">
                <span className="field-label">中文公司介绍</span>
                <textarea
                  className="field-textarea"
                  rows={8}
                  value={content.aboutArticleZh ?? ''}
                  onChange={(event) =>
                    setContent((current) => ({ ...current, aboutArticleZh: event.target.value }))
                  }
                />
              </label>
            )}

            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>
              Lưu giới thiệu
            </button>
          </form>
        </section>

        <section className="surface-card">
          <header className="surface-card-header">
            <div>
              <h2>Cấu hình footer</h2>
              <p>Hotline, địa chỉ và email hiển thị ở footer.</p>
            </div>
          </header>

          <form onSubmit={handleProfileSubmit} style={{ display: 'grid', gap: 14 }}>
            <label className="field">
              <span className="field-label">Hotline / WhatsApp / Zalo</span>
              <input
                className="field-input"
                value={content.hotline}
                onChange={(event) =>
                  setContent((current) => ({ ...current, hotline: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Địa chỉ trụ sở</span>
              <input
                className="field-input"
                value={content.address}
                onChange={(event) =>
                  setContent((current) => ({ ...current, address: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Email liên hệ</span>
              <input
                type="email"
                className="field-input"
                value={content.email}
                onChange={(event) =>
                  setContent((current) => ({ ...current, email: event.target.value }))
                }
              />
            </label>

            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'end' }}>
              Lưu cấu hình footer
            </button>
          </form>
        </section>
      </div>

      {editingBanner ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) setEditingBanner(null)
          }}
        >
          <div className="admin-modal admin-modal-large">
            <header className="admin-modal-header">
              <div>
                <h3>Hero banner slot #{editingBanner.slot}</h3>
                <p style={{ color: 'var(--admin-text-soft)', margin: '4px 0 0', fontSize: '0.85rem' }}>
                  Cập nhật ảnh, caption đa ngôn ngữ và overlay label.
                </p>
              </div>
              <div className="lang-tabs">
                <button
                  type="button"
                  className={bannerLang === 'vi' ? 'is-active' : ''}
                  onClick={() => setBannerLang('vi')}
                >
                  Vi
                </button>
                <button
                  type="button"
                  className={bannerLang === 'en' ? 'is-active' : ''}
                  onClick={() => setBannerLang('en')}
                >
                  En
                </button>
                <button
                  type="button"
                  className={bannerLang === 'zh' ? 'is-active' : ''}
                  onClick={() => setBannerLang('zh')}
                >
                  中文
                </button>
              </div>
            </header>

            <form onSubmit={handleBannerSubmit} style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 14 }}>
                <div className="thumbnail-cell-image" style={{ width: '100%', height: 140 }}>
                  {bannerImage ? (
                    <img src={URL.createObjectURL(bannerImage)} alt="preview" decoding="async" />
                  ) : editingBanner.imageUrl ? (
                    <img src={editingBanner.imageUrl} alt={editingBanner.titleVi} loading="lazy" decoding="async" />
                  ) : (
                    <IconImage style={{ color: 'var(--admin-text-muted)' }} />
                  )}
                </div>
                <label className="field">
                  <span className="field-label">Ảnh banner (tùy chọn — bỏ trống để giữ nguyên)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setBannerImage(event.target.files?.[0] ?? null)}
                    className="field-input"
                  />
                </label>
              </div>

              <label className="field">
                <span className="field-label">Overlay label</span>
                <input
                  className="field-input"
                  value={bannerForm.overlayLabel}
                  onChange={(event) =>
                    setBannerForm((c) => ({ ...c, overlayLabel: event.target.value }))
                  }
                  required
                />
              </label>

              {bannerLang === 'vi' ? (
                <>
                  <label className="field">
                    <span className="field-label">Tiêu đề (VI)</span>
                    <input
                      className="field-input"
                      value={bannerForm.titleVi}
                      onChange={(event) =>
                        setBannerForm((c) => ({ ...c, titleVi: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Mô tả (VI)</span>
                    <textarea
                      className="field-textarea"
                      rows={4}
                      value={bannerForm.descriptionVi}
                      onChange={(event) =>
                        setBannerForm((c) => ({ ...c, descriptionVi: event.target.value }))
                      }
                      required
                    />
                  </label>
                </>
              ) : bannerLang === 'en' ? (
                <>
                  <label className="field">
                    <span className="field-label">Title (EN)</span>
                    <input
                      className="field-input"
                      value={bannerForm.titleEn}
                      onChange={(event) =>
                        setBannerForm((c) => ({ ...c, titleEn: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Description (EN)</span>
                    <textarea
                      className="field-textarea"
                      rows={4}
                      value={bannerForm.descriptionEn}
                      onChange={(event) =>
                        setBannerForm((c) => ({ ...c, descriptionEn: event.target.value }))
                      }
                      required
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="field">
                    <span className="field-label">标题 (中文)</span>
                    <input
                      className="field-input"
                      value={bannerForm.titleZh ?? ''}
                      onChange={(event) =>
                        setBannerForm((c) => ({ ...c, titleZh: event.target.value }))
                      }
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">描述 (中文)</span>
                    <textarea
                      className="field-textarea"
                      rows={4}
                      value={bannerForm.descriptionZh ?? ''}
                      onChange={(event) =>
                        setBannerForm((c) => ({ ...c, descriptionZh: event.target.value }))
                      }
                    />
                  </label>
                </>
              )}

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setEditingBanner(null)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu banner
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
