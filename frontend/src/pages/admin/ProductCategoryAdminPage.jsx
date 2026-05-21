import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '../../admin/AdminIcons'
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCatalog,
  updateAdminCategory,
} from '../../services/admin/adminApi'

const EMPTY_FORM = {
  slug: '',
  name: '',
  nameEn: '',
  nameZh: '',
  description: '',
  descriptionEn: '',
  descriptionZh: '',
  active: true,
}

export function ProductCategoryAdminPage() {
  const { adminAuth } = useOutletContext()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    getAdminCatalog(adminAuth.token)
      .then((data) => {
        if (!mounted) return
        setCategories(data.categories ?? [])
        setProducts(data.products ?? [])
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

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return categories
    return categories.filter((category) =>
      [
        category.slug,
        category.name,
        category.nameEn,
        category.nameZh,
        category.description,
        category.descriptionEn,
        category.descriptionZh,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [categories, query])

  function productCount(categoryId) {
    return products.filter((product) => product.categoryId === categoryId).length
  }

  function openCreateForm() {
    setEditingCategory(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
    setMessage('')
    setError('')
  }

  function openEditForm(category) {
    setEditingCategory(category)
    setForm({
      slug: category.slug ?? '',
      name: category.name ?? '',
      nameEn: category.nameEn ?? '',
      nameZh: category.nameZh ?? '',
      description: category.description ?? '',
      descriptionEn: category.descriptionEn ?? '',
      descriptionZh: category.descriptionZh ?? '',
      active: category.active ?? true,
    })
    setFormOpen(true)
    setMessage('')
    setError('')
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      const payload = {
        ...form,
        slug: slugify(form.slug),
      }
      const saved = editingCategory
        ? await updateAdminCategory(adminAuth.token, editingCategory.id, payload)
        : await createAdminCategory(adminAuth.token, payload)

      setCategories((current) =>
        editingCategory
          ? current.map((category) => (category.id === saved.id ? saved : category))
          : [...current, saved],
      )
      setMessage(editingCategory ? 'Đã cập nhật danh mục.' : 'Đã tạo danh mục mới.')
      setFormOpen(false)
      setEditingCategory(null)
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return
    setMessage('')
    setError('')
    try {
      await deleteAdminCategory(adminAuth.token, category.id)
      setCategories((current) => current.filter((item) => item.id !== category.id))
      setMessage('Đã xóa danh mục.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Product Categories</h1>
          <p>Quản lý danh mục sản phẩm, nội dung đa ngôn ngữ và trạng thái hiển thị.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openCreateForm}>
          <IconPlus style={{ width: 16, height: 16 }} />
          Thêm danh mục
        </button>
        <div className="field-search toolbar-grow">
          <span className="field-search-icon">
            <IconSearch />
          </span>
          <input
            className="field-input"
            type="search"
            placeholder="Tìm theo tên, slug hoặc mô tả..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {formOpen ? (
        <section className="surface-card" style={{ marginBottom: 22 }}>
          <header className="surface-card-header">
            <div>
              <h2>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục sản phẩm'}</h2>
              <p>Tiếng Việt là bản gốc; tiếng Anh và tiếng Trung sẽ fallback nếu để trống.</p>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setFormOpen(false)}>
              Đóng
            </button>
          </header>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <div className="admin-export-form-grid">
              <label className="field">
                <span className="field-label">Slug</span>
                <input
                  className="field-input"
                  required
                  value={form.slug}
                  onChange={(event) => updateForm('slug', normalizeSlugInput(event.target.value))}
                  pattern="[a-z0-9-]+"
                  placeholder="fresh-fruits"
                />
              </label>
              <label className="admin-checkbox" style={{ alignSelf: 'end', marginBottom: 10 }}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => updateForm('active', event.target.checked)}
                />
                Hiển thị public
              </label>
            </div>

            <div className="admin-export-form-grid">
              <TextField label="Tên danh mục VI" value={form.name} onChange={(value) => updateForm('name', value)} required />
              <TextField label="Category name EN" value={form.nameEn} onChange={(value) => updateForm('nameEn', value)} />
              <TextField label="分类名称 ZH" value={form.nameZh} onChange={(value) => updateForm('nameZh', value)} />
              <TextArea label="Mô tả VI" value={form.description} onChange={(value) => updateForm('description', value)} required />
              <TextArea label="Description EN" value={form.descriptionEn} onChange={(value) => updateForm('descriptionEn', value)} />
              <TextArea label="描述 ZH" value={form.descriptionZh} onChange={(value) => updateForm('descriptionZh', value)} />
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu danh mục'}
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
          <strong>Đang tải danh mục...</strong>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="empty-state">
          <strong>Chưa có danh mục phù hợp</strong>
          <small>Thử bỏ tìm kiếm hoặc thêm danh mục mới.</small>
        </div>
      ) : (
        <div className="surface-card">
          <div className="data-table-scroll">
            <table className="data-table" style={{ minWidth: 860 }}>
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th>Slug</th>
                  <th>Sản phẩm</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => {
                  const count = productCount(category.id)
                  return (
                    <tr key={category.id}>
                      <td>
                        <div className="cell-stack">
                          <strong>{category.name}</strong>
                          <small>{category.nameEn || 'Chưa nhập EN'}</small>
                          <small>{category.nameZh || 'Chưa nhập ZH'}</small>
                        </div>
                      </td>
                      <td className="cell-muted" style={{ fontFamily: 'monospace' }}>{category.slug}</td>
                      <td>{count}</td>
                      <td>
                        <span className={`badge ${category.active ? 'badge-success' : 'badge-warn'}`}>
                          {category.active ? 'Visible' : 'Hidden'}
                        </span>
                      </td>
                      <td>
                        <div className="data-table-actions">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => openEditForm(category)}>
                            <IconEdit style={{ width: 14, height: 14 }} />
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(category)}
                            disabled={count > 0}
                            title={count > 0 ? 'Không thể xóa danh mục còn sản phẩm.' : 'Xóa danh mục'}
                          >
                            <IconTrash style={{ width: 14, height: 14 }} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

function TextField({ label, value, onChange, required = false }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({ label, value, onChange, required = false }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <textarea
        className="field-textarea"
        rows={4}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function slugify(value) {
  return normalizeSlugInput(value)
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeSlugInput(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}
