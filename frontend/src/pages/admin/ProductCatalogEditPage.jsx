import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconUpload,
} from '../../admin/AdminIcons'
import {
  createAdminProduct,
  getAdminCatalog,
  updateAdminProduct,
  uploadAdminCatalogImage,
} from '../../services/admin/adminApi'

const EMPTY_PRODUCT = {
  slug: '',
  categoryId: '',
  name: '',
  nameEn: '',
  nameZh: '',
  summary: '',
  summaryEn: '',
  summaryZh: '',
  quoteLabel: '',
  featured: false,
  applications: [''],
  applicationsEn: [''],
  applicationsZh: [''],
  specifications: {
    thickness: '',
    moisture: '',
    glueType: '',
    size: '',
  },
  specificationsEn: {
    thickness: '',
    moisture: '',
    glueType: '',
    size: '',
  },
  specificationsZh: {
    thickness: '',
    moisture: '',
    glueType: '',
    size: '',
  },
}

const LANGUAGE_TABS = [
  { value: 'vi', label: 'Vi', nameKey: 'name', summaryKey: 'summary', appsKey: 'applications', specsKey: 'specifications' },
  { value: 'en', label: 'En', nameKey: 'nameEn', summaryKey: 'summaryEn', appsKey: 'applicationsEn', specsKey: 'specificationsEn' },
  { value: 'zh', label: '中文', nameKey: 'nameZh', summaryKey: 'summaryZh', appsKey: 'applicationsZh', specsKey: 'specificationsZh' },
]

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
  const [specFile, setSpecFile] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [existingSpecUrl, setExistingSpecUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [lang, setLang] = useState('vi')
  const activeLanguage = LANGUAGE_TABS.find((item) => item.value === lang) ?? LANGUAGE_TABS[0]

  useEffect(() => {
    let mounted = true
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
              nameEn: product.nameEn ?? '',
              nameZh: product.nameZh ?? '',
              summary: product.summary,
              summaryEn: product.summaryEn ?? '',
              summaryZh: product.summaryZh ?? '',
              quoteLabel: product.quoteLabel ?? '',
              featured: Boolean(product.featured),
              applications: product.applications?.length ? product.applications : [''],
              applicationsEn: product.applicationsEn?.length ? product.applicationsEn : [''],
              applicationsZh: product.applicationsZh?.length ? product.applicationsZh : [''],
              specifications: {
                thickness: product.specifications?.thickness ?? '',
                moisture: product.specifications?.moisture ?? '',
                glueType: product.specifications?.glueType ?? '',
                size: product.specifications?.size ?? '',
              },
              specificationsEn: {
                thickness: product.specificationsEn?.thickness ?? '',
                moisture: product.specificationsEn?.moisture ?? '',
                glueType: product.specificationsEn?.glueType ?? '',
                size: product.specificationsEn?.size ?? '',
              },
              specificationsZh: {
                thickness: product.specificationsZh?.thickness ?? '',
                moisture: product.specificationsZh?.moisture ?? '',
                glueType: product.specificationsZh?.glueType ?? '',
                size: product.specificationsZh?.size ?? '',
              },
            })
            setGalleryImages(product.galleryImages?.length ? product.galleryImages : [product.imageUrl].filter(Boolean))
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

  function updateLocalizedField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateSpec(key, value) {
    setForm((current) => ({
      ...current,
      [activeLanguage.specsKey]: { ...current[activeLanguage.specsKey], [key]: value },
    }))
  }

  function updateApplication(index, value) {
    setForm((current) => {
      const next = [...current[activeLanguage.appsKey]]
      next[index] = value
      return { ...current, [activeLanguage.appsKey]: next }
    })
  }

  function addApplication() {
    setForm((current) => ({
      ...current,
      [activeLanguage.appsKey]: [...current[activeLanguage.appsKey], ''],
    }))
  }

  function removeApplication(index) {
    setForm((current) => ({
      ...current,
      [activeLanguage.appsKey]: current[activeLanguage.appsKey].filter((_, i) => i !== index),
    }))
  }

  async function handleGalleryFilesChange(files) {
    const selectedFiles = Array.from(files ?? [])
    if (selectedFiles.length === 0) return

    setGalleryUploading(true)
    setMessage('')

    try {
      const uploadedUrls = []
      for (const file of selectedFiles) {
        const uploadResult = await uploadAdminCatalogImage(adminAuth.token, file)
        const imageUrl = uploadResult.secure_url ?? uploadResult.url
        if (!imageUrl) {
          throw new Error('Cloudinary không trả về URL ảnh.')
        }
        uploadedUrls.push(imageUrl)
      }
      setGalleryImages((current) => [...current, ...uploadedUrls])
      setMessage(`Đã upload ${uploadedUrls.length} ảnh lên Cloudinary. Bấm lưu để ghi gallery vào sản phẩm.`)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setGalleryUploading(false)
    }
  }

  function removeExistingGalleryImage(index) {
    setGalleryImages((current) => current.filter((_, imageIndex) => imageIndex !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanedApplications = form.applications.map((a) => a.trim()).filter(Boolean)
    const cleanedApplicationsEn = form.applicationsEn.map((a) => a.trim()).filter(Boolean)
    const cleanedApplicationsZh = form.applicationsZh.map((a) => a.trim()).filter(Boolean)
    if (cleanedApplications.length === 0) {
      setMessage('Cần ít nhất một ứng dụng / mục đích sử dụng.')
      return
    }
    if (galleryUploading) {
      setMessage('Ảnh đang được upload lên Cloudinary, vui lòng đợi hoàn tất rồi lưu.')
      return
    }
    if (isCreate && galleryImages.length === 0) {
      setMessage('Cần tải ít nhất một ảnh cho sản phẩm mới.')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const payload = {
        slug: form.slug,
        categoryId: form.categoryId,
        name: form.name,
        nameEn: form.nameEn,
        nameZh: form.nameZh,
        summary: form.summary,
        summaryEn: form.summaryEn,
        summaryZh: form.summaryZh,
        quoteLabel: form.quoteLabel || null,
        featured: form.featured,
        applications: cleanedApplications,
        applicationsEn: cleanedApplicationsEn,
        applicationsZh: cleanedApplicationsZh,
        specifications: form.specifications,
        specificationsEn: form.specificationsEn,
        specificationsZh: form.specificationsZh,
        galleryImages,
      }

      if (isCreate) {
        await createAdminProduct(adminAuth.token, payload, null, specFile)
      } else {
        await updateAdminProduct(adminAuth.token, productId, payload, null, specFile)
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
            aria-label="Quay lại"
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
            {LANGUAGE_TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={lang === item.value ? 'is-active' : ''}
                onClick={() => setLang(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-error">{message}</div> : null}

      <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem', marginTop: -8, marginBottom: 16 }}>
        Nhập tiếng Việt làm bản gốc bắt buộc. Tiếng Anh và tiếng Trung có thể nhập riêng; nếu bỏ trống, backend sẽ fallback từ bản tiếng Việt.
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
                  value={form[activeLanguage.nameKey]}
                  onChange={(event) => updateLocalizedField(activeLanguage.nameKey, event.target.value)}
                  required={lang === 'vi'}
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
                  value={form[activeLanguage.summaryKey]}
                  onChange={(event) => updateLocalizedField(activeLanguage.summaryKey, event.target.value)}
                  required={lang === 'vi'}
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

              <label className="featured-product-toggle">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => setForm((c) => ({ ...c, featured: event.target.checked }))}
                />
                <span className="featured-product-toggle-track" aria-hidden="true" />
                <span>
                  <span>Sản phẩm nổi bật</span>
                  <small>Hiển thị ở trang chủ</small>
                </span>
              </label>
            </div>
          </section>

          <div style={{ display: 'grid', gap: 20 }}>
            <section className="surface-card">
              <header className="surface-card-header">
                <div>
                  <h2>Gallery ảnh</h2>
                  <p>Upload nhiều ảnh lên Cloudinary. Ảnh đầu tiên là ảnh đại diện catalog.</p>
                </div>
              </header>

              <div className="gallery-grid product-gallery-admin-grid">
                {galleryImages.map((imageUrl, index) => (
                  <div className="gallery-cell product-gallery-admin-cell" key={imageUrl}>
                    <img src={imageUrl} alt={`${form.name || 'Product'} gallery ${index + 1}`} />
                    <div className="product-gallery-admin-overlay">
                      {index === 0 ? <span>Ảnh đại diện</span> : <span>Gallery #{index + 1}</span>}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeExistingGalleryImage(index)}
                      >
                        <IconTrash style={{ width: 14, height: 14 }} />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}

                <label className="gallery-cell product-gallery-upload-cell">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={galleryUploading}
                    style={{ display: 'none' }}
                    onChange={(event) => {
                      handleGalleryFilesChange(event.target.files)
                      event.target.value = ''
                    }}
                  />
                    <span style={{ display: 'grid', placeItems: 'center', gap: 6 }}>
                      <IconUpload />
                      <small style={{ fontSize: '0.75rem' }}>
                        {galleryUploading ? 'Đang upload...' : 'Tải thêm ảnh'}
                      </small>
                    </span>
                </label>
              </div>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8rem', marginTop: 12 }}>
                Ảnh được upload lên Cloudinary ngay khi chọn file. Khi lưu, hệ thống ghi các URL này vào gallery sản phẩm.
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
                          value={form[activeLanguage.specsKey][key]}
                          onChange={(event) => updateSpec(key, event.target.value)}
                          required={lang === 'vi'}
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
                    {form[activeLanguage.appsKey].map((app, index) => (
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
                          disabled={form[activeLanguage.appsKey].length === 1}
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
          <button type="submit" className="btn btn-primary" disabled={submitting || galleryUploading}>
            {submitting ? 'Đang lưu...' : isCreate ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </>
  )
}
