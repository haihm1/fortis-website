import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from '../../admin/AdminIcons'
import {
  createAdminExportMarketArticle,
  deleteAdminExportMarketArticle,
  getAdminExportMarket,
  updateAdminExportMarketArticle,
} from '../../services/admin/adminApi'
import { formatDisplayDate } from '../../utils/dateFormat'

const EMPTY_FORM = {
  slug: '',
  titleVi: '',
  titleEn: '',
  titleZh: '',
  excerptVi: '',
  excerptEn: '',
  excerptZh: '',
  imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1400&q=85',
  category: 'Market Update',
  author: 'Fortis VN',
  publishedAt: new Date().toISOString().slice(0, 10),
  featured: false,
  active: true,
  paragraphsVi: '',
  paragraphsEn: '',
  paragraphsZh: '',
}

export function ExportMarketAdminPage() {
  const { adminAuth } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [editingArticle, setEditingArticle] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    getAdminExportMarket(adminAuth.token)
      .then((data) => {
        if (mounted) setArticles(data.articles ?? [])
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

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return articles

    return articles.filter((article) => {
      const haystack = [
        article.titleVi,
        article.titleEn,
        article.titleZh,
        article.slug,
        article.category,
        article.excerptVi,
        article.excerptEn,
        article.excerptZh,
      ].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [articles, query])

  function openCreateForm() {
    setEditingArticle(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
    setMessage('')
  }

  function openEditForm(article) {
    setEditingArticle(article)
    setForm({
      slug: article.slug,
      titleVi: article.titleVi,
      titleEn: article.titleEn,
      titleZh: article.titleZh ?? '',
      excerptVi: article.excerptVi,
      excerptEn: article.excerptEn,
      excerptZh: article.excerptZh ?? '',
      imageUrl: article.imageUrl,
      category: article.category,
      author: article.author,
      publishedAt: article.publishedAt,
      featured: article.featured,
      active: article.active,
      paragraphsVi: (article.paragraphsVi ?? []).join('\n\n'),
      paragraphsEn: (article.paragraphsEn ?? []).join('\n\n'),
      paragraphsZh: (article.paragraphsZh ?? []).join('\n\n'),
    })
    setFormOpen(true)
    setMessage('')
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function buildPayload() {
    return {
      ...form,
      paragraphsVi: splitParagraphs(form.paragraphsVi),
      paragraphsEn: splitParagraphs(form.paragraphsEn),
      paragraphsZh: splitParagraphs(form.paragraphsZh),
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const payload = buildPayload()
      const saved = editingArticle
        ? await updateAdminExportMarketArticle(adminAuth.token, editingArticle.id, payload)
        : await createAdminExportMarketArticle(adminAuth.token, payload)

      setArticles((current) => {
        if (!editingArticle) return [saved, ...current]
        return current.map((article) => (article.id === saved.id ? saved : article))
      })
      setMessage(editingArticle ? 'Đã cập nhật bài viết Export Market.' : 'Đã tạo bài viết Export Market.')
      setFormOpen(false)
      setEditingArticle(null)
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(article) {
    if (!window.confirm(`Xóa bài viết "${article.titleVi}"?`)) return
    setMessage('')
    setError('')

    try {
      await deleteAdminExportMarketArticle(adminAuth.token, article.id)
      setArticles((current) => current.filter((item) => item.id !== article.id))
      setMessage('Đã xóa bài viết Export Market.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Export Market</h1>
          <p>Quản lý bài viết thị trường xuất khẩu hiển thị ở trang public Export Market.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openCreateForm}>
          <IconPlus style={{ width: 16, height: 16 }} />
          Thêm bài viết
        </button>
        <div className="field-search toolbar-grow">
          <span className="field-search-icon">
            <IconSearch />
          </span>
          <input
            className="field-input"
            type="search"
            placeholder="Tìm theo tiêu đề, slug hoặc danh mục..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {formOpen ? (
        <section className="surface-card admin-export-editor">
          <header className="surface-card-header">
            <div>
              <h2>{editingArticle ? 'Chỉnh sửa bài viết' : 'Thêm bài viết Export Market'}</h2>
              <p>Mỗi dòng trống trong phần nội dung sẽ được tách thành một đoạn văn.</p>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormOpen(false)}>
              Đóng
            </button>
          </header>

          <form className="admin-export-form" onSubmit={handleSubmit}>
            <div className="admin-export-form-grid">
              <label className="field">
                <span className="field-label">Slug</span>
                <input
                  className="field-input"
                  required
                  value={form.slug}
                  onChange={(event) => updateForm('slug', slugify(event.target.value))}
                />
              </label>
              <label className="field">
                <span className="field-label">Ngày đăng</span>
                <input
                  className="field-input"
                  type="date"
                  required
                  value={form.publishedAt}
                  onChange={(event) => updateForm('publishedAt', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Danh mục</span>
                <input
                  className="field-input"
                  required
                  value={form.category}
                  onChange={(event) => updateForm('category', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Tác giả</span>
                <input
                  className="field-input"
                  required
                  value={form.author}
                  onChange={(event) => updateForm('author', event.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span className="field-label">Image URL</span>
              <input
                className="field-input"
                required
                value={form.imageUrl}
                onChange={(event) => updateForm('imageUrl', event.target.value)}
              />
            </label>

            <div className="admin-export-preview">
              <img src={form.imageUrl} alt="Export Market preview" loading="lazy" decoding="async" />
              <div>
                <span>{form.category}</span>
                <strong>{form.titleVi || 'Tiêu đề bài viết'}</strong>
                <p>{form.excerptVi || 'Mô tả ngắn của bài viết sẽ hiển thị ở đây.'}</p>
              </div>
            </div>

            <div className="admin-export-form-grid">
              <label className="field">
                <span className="field-label">Tiêu đề VI</span>
                <input
                  className="field-input"
                  required
                  value={form.titleVi}
                  onChange={(event) => updateForm('titleVi', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Title EN</span>
                <input
                  className="field-input"
                  required
                  value={form.titleEn}
                  onChange={(event) => updateForm('titleEn', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">标题 ZH</span>
                <input
                  className="field-input"
                  value={form.titleZh}
                  onChange={(event) => updateForm('titleZh', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Excerpt VI</span>
                <textarea
                  className="field-textarea"
                  rows={4}
                  required
                  value={form.excerptVi}
                  onChange={(event) => updateForm('excerptVi', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Excerpt EN</span>
                <textarea
                  className="field-textarea"
                  rows={4}
                  required
                  value={form.excerptEn}
                  onChange={(event) => updateForm('excerptEn', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">摘要 ZH</span>
                <textarea
                  className="field-textarea"
                  rows={4}
                  value={form.excerptZh}
                  onChange={(event) => updateForm('excerptZh', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Nội dung VI</span>
                <textarea
                  className="field-textarea"
                  rows={10}
                  required
                  value={form.paragraphsVi}
                  onChange={(event) => updateForm('paragraphsVi', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Content EN</span>
                <textarea
                  className="field-textarea"
                  rows={10}
                  required
                  value={form.paragraphsEn}
                  onChange={(event) => updateForm('paragraphsEn', event.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">正文 ZH</span>
                <textarea
                  className="field-textarea"
                  rows={10}
                  value={form.paragraphsZh}
                  onChange={(event) => updateForm('paragraphsZh', event.target.value)}
                />
              </label>
            </div>

            <div className="admin-export-toggles">
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) => updateForm('featured', event.target.checked)}
                />
                Featured article
              </label>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => updateForm('active', event.target.checked)}
                />
                Hiển thị public
              </label>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu bài viết'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>
                Hủy
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {loading ? (
        <div className="empty-state">
          <strong>Đang tải Export Market...</strong>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="empty-state">
          <strong>Chưa có bài viết phù hợp</strong>
          <small>Thử bỏ tìm kiếm hoặc thêm bài viết mới.</small>
        </div>
      ) : (
        <div className="admin-export-grid">
          {filteredArticles.map((article) => (
            <article key={article.id} className="admin-export-card">
              <img src={article.imageUrl} alt={article.titleVi} loading="lazy" decoding="async" />
              <div className="admin-export-card-body">
                <div className="admin-export-card-meta">
                  <span>{formatDisplayDate(article.publishedAt)}</span>
                  <span>{article.category}</span>
                </div>
                <h2>{article.titleVi}</h2>
                <p>{article.excerptVi}</p>
                <div className="catalog-card-footer">
                  <span className={`badge ${article.active ? 'badge-success' : 'badge-warn'}`}>
                    {article.active ? 'Visible' : 'Hidden'}
                  </span>
                  {article.featured ? <span className="badge badge-info">Featured</span> : null}
                </div>
                <div className="admin-export-card-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => openEditForm(article)}>
                    <IconEdit style={{ width: 14, height: 14 }} />
                    Sửa
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(article)}>
                    <IconTrash style={{ width: 14, height: 14 }} />
                    Xóa
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

function splitParagraphs(value) {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
