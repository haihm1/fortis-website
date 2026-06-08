import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { IconImage, IconPlus, IconSearch, IconTrash } from '../../admin/AdminIcons'
import {
  deleteAdminProduct,
  getAdminCatalog,
} from '../../services/admin/adminApi'

export function ProductCatalogListPage() {
  const { adminAuth } = useOutletContext()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

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

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter && p.categoryId !== categoryFilter) return false
      if (query) {
        const q = query.toLowerCase()
        const haystack = [p.name, p.slug, p.summary].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [products, query, categoryFilter])

  function categoryName(id) {
    return categories.find((c) => c.id === id)?.name ?? '—'
  }

  async function handleDelete(product) {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return
    setMessage('')
    try {
      await deleteAdminProduct(adminAuth.token, product.id)
      setProducts((current) => current.filter((p) => p.id !== product.id))
      setMessage(`Đã xóa "${product.name}".`)
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Product Catalog</h1>
          <p>Quản lý danh mục nông sản và sản phẩm xuất khẩu.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-info">{message}</div> : null}

      <div className="toolbar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/admin/products/new')}
        >
          <IconPlus style={{ width: 16, height: 16 }} />
          Thêm sản phẩm
        </button>
        <div className="field-search toolbar-grow">
          <span className="field-search-icon">
            <IconSearch />
          </span>
          <input
            className="field-input"
            type="search"
            placeholder="Tìm theo tên hoặc slug..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="field-select"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          style={{ maxWidth: 240 }}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty-state">
          <strong>Đang tải catalog...</strong>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <strong>Chưa có sản phẩm phù hợp</strong>
          <small>Thử bỏ bớt bộ lọc hoặc thêm sản phẩm mới.</small>
        </div>
      ) : (
        <div className="catalog-grid">
          {filtered.map((product) => (
            <article key={product.id} className="catalog-card">
              <Link
                to={`/admin/products/${product.id}`}
                style={{ color: 'inherit', textDecoration: 'none', display: 'flex', flexDirection: 'column', flex: 1 }}
              >
                <div className="catalog-card-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" />
                  ) : (
                    <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#9ab3a7' }}>
                      <IconImage />
                    </div>
                  )}
                  <div className="catalog-card-flags">VI · EN</div>
                </div>
                <div className="catalog-card-body">
                  <h3 className="catalog-card-title">{product.name}</h3>
                  <div className="catalog-card-meta">
                    <span>{categoryName(product.categoryId)}</span>
                    <span style={{ fontFamily: 'monospace' }}>{product.slug}</span>
                  </div>
                  <div className="catalog-card-footer">
                    <span className="badge badge-success">Visible</span>
                    {product.featured ? <span className="badge badge-warn">Featured</span> : null}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 16px 14px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(product)}
                >
                  <IconTrash style={{ width: 14, height: 14 }} />
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
