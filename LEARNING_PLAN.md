# Fortis Frontend Learning Plan

Tai lieu nay la giao trinh hoc code frontend cho du an Fortis Website.

Muc tieu:
- Hieu duoc cach project `Vite + React` dang hoat dong.
- Doc va sua duoc component, state, route, API, CSS.
- Co kha nang control cach code, cach tach file va cach mo rong tinh nang.

Nguyen tac hoc:
- Hoc truc tiep tren codebase hien tai, khong hoc ly thuyet chung chung.
- Moi buoi se co: muc tieu, file can doc, kien thuc can nam, bai tap.
- Co the goi hoc theo buoi hoac theo chu de, vi du: `hoc buoi 1`, `hoc buoi 6`, `hoc router`, `hoc adminApi`.

## Cach su dung
- `Bat dau buoi 1`
- `Hoc buoi 4`
- `Giai thich buoi 8`
- `On lai buoi 2`
- `Day toi phan admin`

## Trang thai hoc hien tai
- `done`: Buoi 1
- `done`: Buoi 2
- `done`: Buoi 3
- `done`: Buoi 4
- `pending`: Buoi 5
- `pending`: Buoi 6
- `pending`: Buoi 7
- `pending`: Buoi 8
- `pending`: Buoi 9
- `pending`: Buoi 10
- `pending`: Buoi 11
- `pending`: Buoi 12

## Giai doan 1. Nen tang Vite + React

### Buoi 1. Vite la gi va app chay tu dau
- Muc tieu:
  - Hieu Vite dong vai tro gi trong du an.
  - Hieu app frontend khoi dong tu dau.
  - Biet `npm run dev` va `npm run build` lam gi.
- File can hoc:
  - `frontend/package.json`
  - `frontend/src/main.jsx`
  - `frontend/src/App.jsx`
- Kien thuc can nam:
  - Script trong `package.json`
  - Entry point cua app
  - Build va dev server
- Bai tap:
  - Doi 1 doan text tren giao dien
  - Tu chay build frontend

### Buoi 2. JSX, component va props
- Muc tieu:
  - Hieu component React la gi.
  - Hieu props duoc truyen nhu the nao.
- File can hoc:
  - `frontend/src/layouts/SiteLayout.jsx`
  - `frontend/src/components/SectionHeading.jsx`
  - `frontend/src/components/LanguageSwitcher.jsx`
- Kien thuc can nam:
  - JSX
  - Functional component
  - Props
  - Render condition don gian
- Bai tap:
  - Tao 1 component nho moi
  - Truyen props vao component do

### Buoi 3. CSS trong project nay
- Muc tieu:
  - Hieu cau truc CSS tong trong project.
  - Biet cach sua spacing, width, grid, responsive.
- File can hoc:
  - `frontend/src/index.css`
- Kien thuc can nam:
  - Class naming
  - Layout theo block
  - Grid va flex
  - Responsive voi media query
- Bai tap:
  - Tu chinh kich thuoc 1 section
  - Tu chinh spacing cua 1 card

## Giai doan 2. Dieu huong va cau truc trang

### Buoi 4. Router va dieu huong
- Muc tieu:
  - Hieu cach app chia route.
  - Hieu `SiteLayout` dang bao ngoai cac page nhu the nao.
- File can hoc:
  - `frontend/src/App.jsx`
  - `frontend/src/layouts/SiteLayout.jsx`
- Kien thuc can nam:
  - `BrowserRouter`
  - `Routes`
  - `Route`
  - Layout route
- Bai tap:
  - Tu them 1 route moi, vi du `/about`

### Buoi 5. State co ban trong page
- Muc tieu:
  - Hieu `useState`, `useEffect`, `useMemo`.
  - Doc duoc logic trong page lon.
- File can hoc:
  - `frontend/src/pages/HomePage.jsx`
  - `frontend/src/pages/ProductCatalogPage.jsx`
- Kien thuc can nam:
  - Local state
  - Side effect
  - Derived state
- Bai tap:
  - Them 1 state loc don gian
  - Tu sua logic chon item dang active

## Giai doan 3. API va du lieu

### Buoi 6. Service layer va goi API
- Muc tieu:
  - Hieu vi sao nen tach API ra khoi page.
  - Doc duoc luong lay du lieu tu backend.
- File can hoc:
  - `frontend/src/services/apiConfig.js`
  - `frontend/src/services/productCatalogApi.js`
  - `frontend/src/services/publicContactApi.js`
- Kien thuc can nam:
  - API base URL
  - Fetch
  - Xu ly loi
  - Normalize data
- Bai tap:
  - Them 1 ham API moi
  - Goi ham do tu 1 page

### Buoi 7. Fallback data va cach chong vo UI
- Muc tieu:
  - Hieu vi sao du an co fallback data.
  - Biet cach them field moi vao du lieu fallback.
- File can hoc:
  - `frontend/src/data/productCatalogFallback.js`
  - `frontend/src/locales/homeContentFallback.js`
- Kien thuc can nam:
  - Mock/fallback data
  - Mapping field
  - Dam bao UI van render khi backend loi
- Bai tap:
  - Them 1 field moi vao product fallback
  - Render field do ra giao dien

## Giai doan 4. Hoc theo tinh nang that cua du an

### Buoi 8. Catalog san pham
- Muc tieu:
  - Hieu trang catalog san pham dang hoat dong nhu the nao.
  - Hieu filter va detail page.
- File can hoc:
  - `frontend/src/pages/ProductCatalogPage.jsx`
  - `frontend/src/pages/ProductDetailPage.jsx`
  - `frontend/src/utils/productCatalog.js`
- Kien thuc can nam:
  - Filter logic
  - Slug route
  - Gallery va technical specs
- Bai tap:
  - Them 1 bo loc moi
  - Them 1 thong tin moi vao trang detail

### Buoi 9. RFQ form
- Muc tieu:
  - Hieu form RFQ tu UI den API.
  - Hieu gui `multipart/form-data` va file attachment.
- File can hoc:
  - `frontend/src/pages/ProductCatalogPage.jsx`
  - `frontend/src/services/publicContactApi.js`
- Kien thuc can nam:
  - Controlled form
  - Submit async
  - FormData
  - Feedback state
- Bai tap:
  - Them 1 field moi vao RFQ
  - Gui field do len backend

## Giai doan 5. Admin va kien truc code

### Buoi 10. Admin auth
- Muc tieu:
  - Hieu dang nhap admin dang hoat dong nhu the nao.
  - Hieu token duoc luu va dung ra sao.
- File can hoc:
  - `frontend/src/services/admin/adminAuthApi.js`
  - `frontend/src/services/admin/adminAuthStorage.js`
  - `frontend/src/components/admin/AdminRoute.jsx`
- Kien thuc can nam:
  - Token
  - localStorage
  - Protected route
- Bai tap:
  - Theo doi luong login -> luu auth -> vao admin

### Buoi 11. Admin dashboard va admin API
- Muc tieu:
  - Doc duoc man hinh admin lon.
  - Hieu `adminApi.js` va cach to chuc request theo module.
- File can hoc:
  - `frontend/src/pages/admin/AdminDashboardPage.jsx`
  - `frontend/src/services/admin/adminApi.js`
- Kien thuc can nam:
  - State lon theo tab
  - Hydrate data
  - CRUD flow
- Bai tap:
  - Them 1 request admin moi
  - Render 1 block du lieu moi trong dashboard

## Giai doan 6. Tu duy control code

### Buoi 12. Khi nao tach component, service, util
- Muc tieu:
  - Biet cach giu code sach va de mo rong.
  - Biet khi nao nen refactor.
- File can hoc:
  - `frontend/src/App.jsx`
  - `frontend/src/pages/ProductCatalogPage.jsx`
  - `frontend/src/services/admin/adminApi.js`
  - `frontend/src/utils/productCatalog.js`
- Kien thuc can nam:
  - Cach tach file
  - Dat ten
  - Giam lap code
  - Refactor co chu dich
- Bai tap:
  - De xuat tach 1 khoi code lon thanh util/component/service

## Thu tu hoc de hieu nhanh nhat
1. Buoi 1
2. Buoi 2
3. Buoi 4
4. Buoi 3
5. Buoi 5
6. Buoi 6
7. Buoi 8
8. Buoi 9
9. Buoi 10
10. Buoi 11
11. Buoi 7
12. Buoi 12

## Muc tieu sau khi hoc xong
- Tu doc duoc code frontend cua project nay.
- Tu sua duoc UI, route, state, API.
- Tu biet can sua file nao khi co yeu cau moi.
- Du kha nang review va control cach code trong du an.
