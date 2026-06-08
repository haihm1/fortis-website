import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import Editor, {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnNumberedList,
  BtnRedo,
  BtnUnderline,
  BtnUndo,
  Toolbar,
} from 'react-simple-wysiwyg'
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
  detailDescription: '',
  detailDescriptionEn: '',
  detailDescriptionZh: '',
  hsCode: '',
  packagingSpec: '',
  quoteLabel: '',
  featured: false,
  applications: [''],
  applicationsEn: [''],
  applicationsZh: [''],
  specifications: [
    {
      label: 'Quy cách đóng gói',
      labelEn: 'Packing format',
      labelZh: '包装规格',
      value: '',
      valueEn: '',
      valueZh: '',
    },
  ],
  highlights: [{ label: '', labelEn: '', labelZh: '', value: '', valueEn: '', valueZh: '' }],
  qualityControlSteps: [{ label: '', labelEn: '', labelZh: '', value: '', valueEn: '', valueZh: '' }],
}

const LANGUAGE_TABS = [
  { value: 'vi', label: 'Vi', nameKey: 'name', summaryKey: 'summary', detailKey: 'detailDescription', appsKey: 'applications', specLabelKey: 'label', specValueKey: 'value' },
  { value: 'en', label: 'En', nameKey: 'nameEn', summaryKey: 'summaryEn', detailKey: 'detailDescriptionEn', appsKey: 'applicationsEn', specLabelKey: 'labelEn', specValueKey: 'valueEn' },
  { value: 'zh', label: '中文', nameKey: 'nameZh', summaryKey: 'summaryZh', detailKey: 'detailDescriptionZh', appsKey: 'applicationsZh', specLabelKey: 'labelZh', specValueKey: 'valueZh' },
]

export function ProductCatalogEditPage() {
  const { adminAuth } = useOutletContext()
  const { productId } = useParams()
  const navigate = useNavigate()
  const isCreate = !productId

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [specFile, setSpecFile] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [deletedGalleryImages, setDeletedGalleryImages] = useState([])
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
              detailDescription: product.detailDescription ?? '',
              detailDescriptionEn: product.detailDescriptionEn ?? '',
              detailDescriptionZh: product.detailDescriptionZh ?? '',
              hsCode: product.hsCode ?? '',
              packagingSpec: product.packagingSpec ?? '',
              quoteLabel: product.quoteLabel ?? '',
              featured: Boolean(product.featured),
              applications: product.applications?.length ? product.applications : [''],
              applicationsEn: product.applicationsEn?.length ? product.applicationsEn : [''],
              applicationsZh: product.applicationsZh?.length ? product.applicationsZh : [''],
              specifications: normalizeProductSpecifications(product.specifications),
              highlights: normalizeOptionalProductSpecifications(product.highlights),
              qualityControlSteps: normalizeOptionalProductSpecifications(product.qualityControlSteps),
            })
            setGalleryImages(product.galleryImages?.length ? product.galleryImages : [product.imageUrl].filter(Boolean))
            setDeletedGalleryImages([])
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

  function updateSpec(index, key, value) {
    updateSpecList('specifications', index, key, value)
  }

  function updateSpecList(listKey, index, key, value) {
    setForm((current) => ({
      ...current,
      [listKey]: current[listKey].map((spec, specIndex) =>
        specIndex === index ? { ...spec, [key]: value } : spec,
      ),
    }))
  }

  function addSpecification() {
    addSpecListItem('specifications')
  }

  function addSpecListItem(listKey) {
    setForm((current) => ({
      ...current,
      [listKey]: [
        ...current[listKey],
        { label: '', labelEn: '', labelZh: '', value: '', valueEn: '', valueZh: '' },
      ],
    }))
  }

  function removeSpecification(index) {
    removeSpecListItem('specifications', index)
  }

  function removeSpecListItem(listKey, index) {
    setForm((current) => ({
      ...current,
      [listKey]: current[listKey].filter((_, specIndex) => specIndex !== index),
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
    const imageUrl = galleryImages[index]
    if (!imageUrl) return

    setGalleryImages((current) => current.filter((_, imageIndex) => imageIndex !== index))
    setDeletedGalleryImages((current) => (
      current.includes(imageUrl) ? current : [...current, imageUrl]
    ))
    setMessage('Ảnh đã được đánh dấu xóa. Cloudinary và DB sẽ được cập nhật sau khi bấm Lưu.')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanedApplications = form.applications.map((a) => a.trim()).filter(Boolean)
    const cleanedApplicationsEn = form.applicationsEn.map((a) => a.trim()).filter(Boolean)
    const cleanedApplicationsZh = form.applicationsZh.map((a) => a.trim()).filter(Boolean)
    const cleanedSpecifications = cleanSpecList(form.specifications)
    const cleanedHighlights = cleanSpecList(form.highlights)
    const cleanedQualityControlSteps = cleanSpecList(form.qualityControlSteps)
    if (cleanedApplications.length === 0) {
      setMessage('Cần ít nhất một ứng dụng / mục đích sử dụng.')
      return
    }
    if (cleanedSpecifications.length === 0) {
      setMessage('Cần ít nhất một thông số kỹ thuật tiếng Việt.')
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
        detailDescription: form.detailDescription.trim(),
        detailDescriptionEn: form.detailDescriptionEn.trim(),
        detailDescriptionZh: form.detailDescriptionZh.trim(),
        hsCode: form.hsCode.trim(),
        packagingSpec: form.packagingSpec.trim(),
        quoteLabel: form.quoteLabel || null,
        featured: form.featured,
        applications: cleanedApplications,
        applicationsEn: cleanedApplicationsEn,
        applicationsZh: cleanedApplicationsZh,
        specifications: cleanedSpecifications,
        highlights: cleanedHighlights,
        qualityControlSteps: cleanedQualityControlSteps,
        galleryImages,
        deletedGalleryImages,
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
          <div style={{ display: 'grid', gap: 20 }}>
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

            <section className="surface-card">
              <header className="surface-card-header">
                <div>
                  <h2>Thông tin chi tiết</h2>
                  <p>Mô tả đầy đủ, điểm nổi bật và quy trình kiểm soát chất lượng.</p>
                </div>
              </header>

              <div style={{ display: 'grid', gap: 16 }}>
                <RichTextEditor
                  label="Mô tả chi tiết"
                  value={form[activeLanguage.detailKey]}
                  onChange={(value) => updateLocalizedField(activeLanguage.detailKey, value)}
                  placeholder="Nhập mô tả đầy đủ để hiển thị trong màn hình View Detail..."
                />

                <SpecListEditor
                  title="Điểm nổi bật"
                  items={form.highlights}
                  activeLanguage={activeLanguage}
                  onChange={(index, key, value) => updateSpecList('highlights', index, key, value)}
                  onAdd={() => addSpecListItem('highlights')}
                  onRemove={(index) => removeSpecListItem('highlights', index)}
                  addLabel="Thêm điểm nổi bật"
                />

                <SpecListEditor
                  title="Quy trình kiểm soát chất lượng"
                  items={form.qualityControlSteps}
                  activeLanguage={activeLanguage}
                  onChange={(index, key, value) => updateSpecList('qualityControlSteps', index, key, value)}
                  onAdd={() => addSpecListItem('qualityControlSteps')}
                  onRemove={(index) => removeSpecListItem('qualityControlSteps', index)}
                  addLabel="Thêm bước kiểm soát"
                />
              </div>
            </section>
          </div>

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
                    <img
                      src={imageUrl}
                      alt={`${form.name || 'Product'} gallery ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="product-gallery-admin-overlay">
                      {index === 0 ? <span>Ảnh đại diện</span> : <span>Gallery #{index + 1}</span>}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeExistingGalleryImage(index)}
                        disabled={galleryUploading}
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
                Ảnh được upload lên Cloudinary ngay khi chọn file. Ảnh bị xóa chỉ được đánh dấu trước; khi bấm Lưu, hệ thống mới cập nhật DB và xóa ảnh khỏi Cloudinary.
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

                <div className="admin-form-grid-2">
                  <label className="field">
                    <span className="field-label">Mã HS Code</span>
                    <input
                      className="field-input"
                      value={form.hsCode}
                      onChange={(event) => setForm((c) => ({ ...c, hsCode: event.target.value }))}
                      placeholder="Vd: 0801.11"
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Quy cách đóng gói</span>
                    <input
                      className="field-input"
                      value={form.packagingSpec}
                      onChange={(event) => setForm((c) => ({ ...c, packagingSpec: event.target.value }))}
                      placeholder="Vd: 25 kg / bao, 12 kg / carton"
                    />
                  </label>
                </div>

                <div className="field">
                  <span className="field-label">Thông số kỹ thuật</span>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {form.specifications.map((spec, index) => (
                      <div key={index} className="spec-row">
                        <input
                          className="field-input"
                          value={spec[activeLanguage.specLabelKey]}
                          onChange={(event) => updateSpec(index, activeLanguage.specLabelKey, event.target.value)}
                          required={lang === 'vi'}
                          placeholder="Tên thông số"
                        />
                        <input
                          className="field-input"
                          value={spec[activeLanguage.specValueKey]}
                          onChange={(event) => updateSpec(index, activeLanguage.specValueKey, event.target.value)}
                          required={lang === 'vi'}
                          placeholder="Giá trị"
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => removeSpecification(index)}
                          aria-label="Xóa thông số"
                          disabled={form.specifications.length === 1}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={addSpecification}
                      style={{ justifySelf: 'start' }}
                    >
                      <IconPlus style={{ width: 14, height: 14 }} />
                      Thêm thông số
                    </button>
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

function SpecListEditor({ title, items, activeLanguage, onChange, onAdd, onRemove, addLabel }) {
  return (
    <div className="field">
      <span className="field-label">{title}</span>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((item, index) => (
          <div key={index} className="spec-row">
            <input
              className="field-input"
              value={item[activeLanguage.specLabelKey]}
              onChange={(event) => onChange(index, activeLanguage.specLabelKey, event.target.value)}
              placeholder="Tên mục"
            />
            <input
              className="field-input"
              value={item[activeLanguage.specValueKey]}
              onChange={(event) => onChange(index, activeLanguage.specValueKey, event.target.value)}
              placeholder="Nội dung"
            />
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => onRemove(index)}
              aria-label={`Xóa ${title.toLowerCase()}`}
              disabled={items.length === 1}
            >
              <IconTrash />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onAdd}
          style={{ justifySelf: 'start' }}
        >
          <IconPlus style={{ width: 14, height: 14 }} />
          {addLabel}
        </button>
      </div>
    </div>
  )
}

function RichTextEditor({ label, value, onChange, placeholder }) {
  return (
    <div className="field rich-text-field">
      <span className="field-label">{label}</span>
      <Editor
        value={formatRichTextForEditor(value)}
        placeholder={placeholder}
        containerProps={{ className: 'rich-text-editor' }}
        onChange={(event) => onChange(sanitizeRichText(event.target.value))}
      >
        <Toolbar>
          <BtnUndo />
          <BtnRedo />
          <BtnBold />
          <BtnItalic />
          <BtnUnderline />
          <BtnBulletList />
          <BtnNumberedList />
          <BtnClearFormatting />
        </Toolbar>
      </Editor>
    </div>
  )
}

function normalizeProductSpecifications(specifications) {
  if (Array.isArray(specifications) && specifications.length > 0) {
    return specifications.map((spec) => ({
      label: spec.label ?? '',
      labelEn: spec.labelEn ?? '',
      labelZh: spec.labelZh ?? '',
      value: spec.value ?? '',
      valueEn: spec.valueEn ?? '',
      valueZh: spec.valueZh ?? '',
    }))
  }

  return EMPTY_PRODUCT.specifications
}

function normalizeOptionalProductSpecifications(specifications) {
  if (Array.isArray(specifications) && specifications.length > 0) {
    return normalizeProductSpecifications(specifications)
  }

  return [{ label: '', labelEn: '', labelZh: '', value: '', valueEn: '', valueZh: '' }]
}

function cleanSpecList(specifications) {
  return specifications
    .map((spec) => ({
      label: spec.label.trim(),
      labelEn: spec.labelEn.trim(),
      labelZh: spec.labelZh.trim(),
      value: spec.value.trim(),
      valueEn: spec.valueEn.trim(),
      valueZh: spec.valueZh.trim(),
    }))
    .filter((spec) => spec.label && spec.value)
}

function formatRichTextForEditor(value) {
  if (!value) {
    return ''
  }
  if (/<[a-z][\s\S]*>/i.test(value)) {
    return sanitizeRichText(value)
  }
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function sanitizeRichText(value) {
  const template = document.createElement('template')
  template.innerHTML = value
  const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'DIV'])

  function cleanNode(node) {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.has(child.tagName)) {
          child.replaceWith(...Array.from(child.childNodes))
          return
        }
        Array.from(child.attributes).forEach((attribute) => child.removeAttribute(attribute.name))
        cleanNode(child)
      }
    })
  }

  cleanNode(template.content)
  return template.innerHTML.trim()
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
