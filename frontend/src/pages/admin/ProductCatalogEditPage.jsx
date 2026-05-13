import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  IconArrowLeft,
  IconImage,
  IconPlus,
  IconTrash,
  IconUpload,
} from '../../admin/AdminIcons'
import {
  createAdminProduct,
  getAdminCatalog,
  updateAdminProduct,
} from '../../services/admin/adminApi'

const EMPTY_PRODUCT = {
  slug: '',
  categoryId: '',
  name: '',
  summary: '',
  quoteLabel: '',
  applications: [''],
  specifications: {
    thickness: '',
    moisture: '',
    glueType: '',
    size: '',
  },
}

const SPEC_LABELS = {
  thickness: 'Quy cách đóng gói',
  moisture: 'Tiêu chuẩn chất lượng',
  glueType: 'Xuất xứ / Chứng nhận',
  size: 'Khối lượng / Quy cách carton',
}

export function ProductCatalogEditPage() {
  const { adminAuth } = useOutletContext()
  const { productId } = useParams()
  const navigate = useNavigate()
  const isCreate = !productId

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [imageFile, setImageFile] = useState(null)
  const [specFile, setSpecFile] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [existingSpecUrl, setExistingSpecUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lang, setLang] = useState('vi')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getAdminCatalog(adminAuth.token)
      .then((data) => {
        if (!mounted) return
        setCategories(data.categories ?? [])
        if (productId) {
          const product = (data.products ?? []).find((p) => p.id === productId)
          if (!product) {
            setError('Không tìm thấy sản phẩm.')
          } else {
            setForm({
              slug: product.slug,
              categoryId: product.categoryId,
              name: product.name,
              summary: product.summary,
              quoteLabel: product.quoteLabel ?? '',
              applications: product.applications?.length ? product.applications : [''],
              specifications: {
                thickness: product.specifications?.thickness ?? '',
                moisture: product.specifications?.moisture ?? '',
                glueType: product.specifications?.glueType ?? '',
                size: product.specifications?.size ?? '',
              },
            })
            setExistingImage(product.imageUrl)
            setExistingSpecUrl(product.specificationFileUrl)
          }
        } else if (data.categories?.length) {
          setForm((current) => ({ ...current, categoryId: data.categories[0].id }))
        }
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
  }, [adminAuth.token, productId])

  function updateSpec(key, value) {
    setForm((current) => ({
      ...current,
      specifications: { ...current.specifications, [key]: value },
    }))
  }

  function updateApplication(index, value) {
    setForm((current) => {
      const next = [...current.applications]
      next[index] = value
      return { ...current, applications: next }
    })
  }

  function addApplication() {
    setForm((current) => ({ ...current, applications: [...current.applications, ''] }))
  }

  function removeApplication(index) {
    setForm((current) => ({
      ...current,
      applications: current.applications.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanedApplications = form.applications.map((a) => a.trim()).filter(Boolean)
    if (cleanedApplications.length === 0) {
      setMessage('Cần ít nhất một ứng dụng / mục đích sử dụng.')
      return
    }
    if (isCreate && !imageFile) {
      setMessage('Cần tải ảnh chính cho sản phẩm mới.')
      return
    }

    setSubmitting(true)
    setMessage('')

    const payload = {
      slug: form.slug,
      categoryId: form.categoryId,
      name: form.name,
      summary: form.summary,
      quoteLabel: form.quoteLabel || null,
      applications: cleanedApplications,
      specifications: form.specifications,
    }

    try {
      if (isCreate) {
        await createAdminProduct(adminAuth.token, payload, imageFile, specFile)
      } else {
        await updateAdminProduct(adminAuth.token, productId, payload, imageFile, specFile)
      }
      navigate('/admin/products', { replace: true })
    } catch (err) {
      setMessage(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <header className="admin-page-header">
          <h1>{isCreate ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm'}</h1>
        </header>
        <div className="empty-state">
          <strong>Đang tải dữ liệu...</strong>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="product-editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="admin-icon-button"
            onClick={() => navigate('/admin/products')}
            aria-label="Quay lại catalog"
          >
            <IconArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
              {isCreate ? 'Add Product' : 'Edit Product'}
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--admin-text-soft)', fontSize: '0.88rem' }}>
              {isCreate ? 'Tạo mới sản phẩm trong catalog Fortis VN.' : `Cập nhật sản phẩm: ${form.name}`}
            </p>
          </div>
        </div>

        <div className="product-editor-header-actions">
          <div className="lang-tabs" role="tablist">
            <button
              type="button"
              className={lang === 'vi' ? 'is-active' : ''}
              onClick={() => setLang('vi')}
            >
              Vi
            </button>
            <button
              type="button"
              className={lang === 'en' ? 'is-active' : ''}
              onClick={() => setLang('en')}
            >
              En
            </button>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-error">{message}</div> : null}

      <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginTop: -8, marginBottom: 16 }}>
        Lưu ý: API hiện lưu chung một bản dịch theo `locale` hệ thống, chưa tách trường vi/en độc lập. Tab ngôn ngữ ở đây chỉ phục vụ định hướng UI; sau khi backend tách field vi/en sẽ binding riêng từng tab.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="product-editor">
          <section className="surface-card">
            <header className="surface-card-header">
              <div>
                <h2>Thông tin cơ bản</h2>
                <p>Tên hiển thị, slug và mô tả ngắn.</p>
              </div>
            </header>

            <div style={{ display: 'grid', gap: 14 }}>
              <label className="field">
                <span className="field-label">Tên sản phẩm</span>
                <input
                  className="field-input"
                  value={form.name}
                  onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))}
                  required
                  placeholder="Vd: Hạt điều rang muối"
                />
              </label>

              <label className="field">
                <span className="field-label">Slug (URL)</span>
                <input
                  className="field-input"
                  value={form.slug}
                  onChange={(event) =>
                    setForm((c) => ({
                      ...c,
                      slug: event.target.value.toLowerCase().replace(/\s+/g, '-'),
                    }))
                  }
                  required
                  pattern="[a-z0-9\-]+"
                  placeholder="hat-dieu-rang-muoi"
                />
              </label>

              <label className="field">
                <span className="field-label">Mô tả ngắn</span>
                <textarea
                  className="field-textarea"
                  rows={5}
                  value={form.summary}
                  onChange={(event) => setForm((c) => ({ ...c, summary: event.target.value }))}
                  required
                  placeholder="Mô tả ngắn về sản phẩm, tiêu chuẩn và lợi thế..."
                />
              </label>

              <label className="field">
                <span className="field-label">Nhãn nút báo giá (tùy chọn)</span>
                <input
                  className="field-input"
                  value={form.quoteLabel}
                  onChange={(event) => setForm((c) => ({ ...c, quoteLabel: event.target.value }))}
                  placeholder="Vd: Yêu cầu báo giá"
                />
              </label>
            </div>
          </section>

          <div style={{ display: 'grid', gap: 20 }}>
            <section className="surface-card">
              <header className="surface-card-header">
                <div>
                  <h2>Gallery ảnh</h2>
                  <p>Ảnh chính hiển thị trên catalog và trang chi tiết.</p>
                </div>
              </header>

              <div className="gallery-grid">
                <label
                  className="gallery-cell"
                  style={{
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--admin-text-soft)',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                  />
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="preview" />
                  ) : existingImage ? (
                    <img src={existingImage} alt={form.name} />
                  ) : (
                    <span style={{ display: 'grid', placeItems: 'center', gap: 6 }}>
                      <IconUpload />
                      <small style={{ fontSize: '0.75rem' }}>Tải ảnh</small>
                    </span>
                  )}
                </label>
                <div className="gallery-cell">
                  <IconImage />
                </div>
                <div className="gallery-cell">
                  <IconImage />
                </div>
              </div>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', marginTop: 12 }}>
                API hiện chỉ lưu một ảnh chính. Các slot phụ chỉ là placeholder cho tới khi backend hỗ trợ gallery.
              </p>
            </section>

            <section className="surface-card">
              <header className="surface-card-header">
                <div>
                  <h2>Thông tin nâng cao</h2>
                  <p>Danh mục, thông số kỹ thuật và file spec sheet.</p>
                </div>
              </header>

              <div style={{ display: 'grid', gap: 14 }}>
                <label className="field">
                  <span className="field-label">Danh mục</span>
                  <select
                    className="field-select"
                    value={form.categoryId}
                    onChange={(event) => setForm((c) => ({ ...c, categoryId: event.target.value }))}
                    required
                  >
                    <option value="" disabled>
                      Chọn danh mục
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="field">
                  <span className="field-label">Thông số kỹ thuật</span>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {Object.entries(SPEC_LABELS).map(([key, label]) => (
                      <div key={key} className="spec-row">
                        <input className="field-input" value={label} disabled />
                        <input
                          className="field-input"
                          value={form.specifications[key]}
                          onChange={(event) => updateSpec(key, event.target.value)}
                          required
                          placeholder="Giá trị"
                        />
                        <span />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <span className="field-label">Ứng dụng / mục đích sử dụng</span>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {form.applications.map((app, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: 8 }}>
                        <input
                          className="field-input"
                          value={app}
                          onChange={(event) => updateApplication(index, event.target.value)}
                          placeholder={`Ứng dụng #${index + 1}`}
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => removeApplication(index)}
                          aria-label="Xóa ứng dụng"
                          disabled={form.applications.length === 1}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={addApplication}
                      style={{ justifySelf: 'start' }}
                    >
                      <IconPlus style={{ width: 14, height: 14 }} />
                      Thêm ứng dụng
                    </button>
                  </div>
                </div>

                <label className="field">
                  <span className="field-label">File spec sheet (PDF, tùy chọn)</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="field-input"
                    onChange={(event) => setSpecFile(event.target.files?.[0] ?? null)}
                  />
                  {existingSpecUrl && !specFile ? (
                    <small style={{ color: 'var(--admin-text-soft)', fontSize: '0.78rem' }}>
                      Hiện đang dùng:{' '}
                      <a href={existingSpecUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-accent)' }}>
                        {existingSpecUrl}
                      </a>
                    </small>
                  ) : null}
                </label>
              </div>
            </section>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 22 }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/admin/products')}
          >
            Hủy bỏ
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Đang lưu...' : isCreate ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </>
  )
}
