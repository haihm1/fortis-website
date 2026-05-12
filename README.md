# Fortis VN — Website giới thiệu và bán hàng nông sản xuất khẩu

Website doanh nghiệp + portal quản trị của **Fortis VN**, phục vụ giới thiệu năng lực sản xuất, công bố catalog nông sản xuất khẩu, thu thập yêu cầu báo giá (RFQ) và cho phép đội vận hành quản lý nội dung qua giao diện admin.

Dự án được tổ chức theo mô hình **monorepo** gồm hai phần độc lập triển khai:

- `frontend/` — Single Page Application bằng **React 19 + Vite + React Router 7**, đa ngôn ngữ (vi/en), SEO sẵn (meta tags, Open Graph, JSON-LD), deploy trên **Cloudflare Pages/Workers** (`wrangler`).
- `backend/` — REST API bằng **Spring Boot 4 + Java 21**, dùng **PostgreSQL** làm database, **Spring Security + JWT (HS256)** cho admin, **JPA/Hibernate** cho persistence, có tích hợp `spring-boot-starter-mail` để gửi thông báo liên hệ.
- `deploy/` + `docker-compose.prod.example.yml` + `DEPLOYMENT.md` — hướng dẫn và file mẫu để chạy production trên VPS với **Docker + Caddy (HTTPS Let's Encrypt)**.

---

## Mục lục

- [1. Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
- [2. Cây thư mục](#2-cây-thư-mục)
- [3. Tech stack](#3-tech-stack)
- [4. Chức năng cho người dùng cuối (public site)](#4-chức-năng-cho-người-dùng-cuối-public-site)
- [5. Chức năng portal admin](#5-chức-năng-portal-admin)
- [6. API backend](#6-api-backend)
- [7. Mô hình dữ liệu](#7-mô-hình-dữ-liệu)
- [8. Đa ngôn ngữ (i18n)](#8-đa-ngôn-ngữ-i18n)
- [9. SEO & structured data](#9-seo--structured-data)
- [10. Bảo mật](#10-bảo-mật)
- [11. Yêu cầu môi trường](#11-yêu-cầu-môi-trường)
- [12. Chạy local (dev)](#12-chạy-local-dev)
- [13. Cấu hình biến môi trường](#13-cấu-hình-biến-môi-trường)
- [14. Build & deploy production](#14-build--deploy-production)
- [15. Database seeding](#15-database-seeding)
- [16. Backlog / roadmap](#16-backlog--roadmap)

---

## 1. Tổng quan kiến trúc

```
┌─────────────────────┐         HTTPS          ┌──────────────────────────┐
│  Cloudflare Pages   │  ───────────────────▶  │  Spring Boot API (VPS)   │
│  React SPA (Vite)   │   /api/public/*        │  Java 21 + PostgreSQL    │
│  i18n vi/en         │   /api/admin/* (JWT)   │  JWT auth, file storage  │
└─────────────────────┘                        └──────────────────────────┘
        │                                                  │
        │ SEO meta + JSON-LD                               │ Caddy reverse proxy
        ▼                                                  ▼  (HTTPS Let's Encrypt)
   Google / OG crawlers                              api.example.com
```

- **Frontend** gọi API qua biến `VITE_API_BASE_URL` (mặc định `http://localhost:9090` khi dev). Toàn bộ endpoint public không cần token; endpoint admin cần `Authorization: Bearer <jwt>`.
- **Backend** mở CORS theo danh sách `app.cors.allowed-origins` (đọc từ env `APP_CORS_ALLOWED_ORIGINS`, các giá trị cách nhau bằng dấu phẩy, đã trim sẵn).
- **File upload** (ảnh banner, ảnh sản phẩm, gallery, spec sheet) lưu trên đĩa tại `app.storage.upload-dir` (mặc định `backend/storage/uploads`) và serve tĩnh qua HTTP.

## 2. Cây thư mục

```
website/
├── backend/                          # Spring Boot API
│   ├── pom.xml
│   ├── Dockerfile
│   ├── storage/uploads/              # file lưu khi upload
│   └── src/main/
│       ├── java/vn/fortis/website/
│       │   ├── controller/
│       │   │   ├── auth/             # AuthController (login, /me)
│       │   │   ├── admin/            # Account/Contact/Content/ProductCatalog admin APIs
│       │   │   └── publicapi/        # Contact, ProductCatalog, Health
│       │   ├── service/
│       │   │   ├── account/          # AccountManagementService
│       │   │   ├── catalog/          # ProductCatalogService, FileStorageService
│       │   │   ├── contact/          # ContactManagementService, ContactNotificationService
│       │   │   ├── content/          # ContentManagementService
│       │   │   └── HomeContentService.java
│       │   ├── repository/           # Spring Data JPA
│       │   ├── entity/               # JPA entities
│       │   ├── dto/                  # request/response DTO
│       │   └── config/
│       │       ├── security/         # SecurityConfig, JwtTokenService
│       │       ├── bootstrap/        # DatabaseSeeder (seed admin & catalog)
│       │       ├── WebCorsConfig.java
│       │       └── AdminSupportConfig.java
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           └── application-prod.yml
├── frontend/                         # React SPA
│   ├── package.json
│   ├── vite.config.js
│   ├── wrangler.jsonc                # cấu hình Cloudflare deploy
│   ├── index.html
│   └── src/
│       ├── App.jsx                   # routes + admin auth bootstrap
│       ├── layouts/SiteLayout.jsx    # header, footer, quick contact
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── ProductCatalogPage.jsx
│       │   ├── ProductDetailPage.jsx
│       │   ├── ContactPage.jsx
│       │   └── admin/
│       │       ├── AdminLoginPage.jsx
│       │       └── AdminDashboardPage.jsx
│       ├── sections/                 # Hero, CoreValues, FeaturedProducts, Certificates
│       ├── components/               # LanguageSwitcher, PhoneInput, SuccessModal, QuickContactIcon, admin/AdminRoute
│       ├── services/                 # API clients (public & admin)
│       ├── hooks/                    # useSeoMeta, useJsonLd
│       ├── data/                     # seoConfig, companyContact, fallback catalog
│       └── locales/homeContentFallback.js
├── deploy/caddy/                     # Caddyfile mẫu cho HTTPS
├── docker-compose.prod.example.yml
├── .env.production.example
├── DEPLOYMENT.md                     # hướng dẫn production chi tiết
├── DEVELOPMENT_PLAN.md               # backlog các giai đoạn phát triển
└── LEARNING_PLAN.md
```

## 3. Tech stack

**Frontend**

- React `^19.2`, React DOM, React Router DOM `^7.13`
- Vite `^8` + `@vitejs/plugin-react`
- `country-codes-list` (cho ô nhập số điện thoại quốc tế)
- ESLint 9, eslint-plugin-react-hooks, eslint-plugin-react-refresh
- Cloudflare `@cloudflare/vite-plugin` + `wrangler ^4`

**Backend**

- Spring Boot `4.0.0` (parent), Java 21
- `spring-boot-starter-webmvc`, `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa` + PostgreSQL JDBC driver
- `spring-boot-starter-security` + `spring-boot-starter-oauth2-resource-server` + `spring-security-oauth2-jose` (JWT HS256)
- `spring-security-crypto` (BCrypt cho password admin)
- `spring-boot-starter-mail` (thông báo liên hệ qua email tuỳ chọn)

**Hạ tầng**

- PostgreSQL (Neon hoặc tự host)
- Docker + Docker Compose
- Caddy (reverse proxy, Let's Encrypt) hoặc Nginx
- Cloudflare Pages/Workers cho frontend

## 4. Chức năng cho người dùng cuối (public site)

Routes do `App.jsx` đăng ký, render trong `SiteLayout` (header + footer + quick contact icons):

| Route | Page | Mô tả chi tiết |
|---|---|---|
| `/` | `HomePage` | Trang chủ gồm các section: **Hero banner** (slide hình, headline, CTA), **CoreValues** (giá trị cốt lõi của công ty), **FeaturedProducts** (sản phẩm nổi bật từ API hoặc fallback), **Certificates** (chứng chỉ/đối tác). Nội dung lấy từ `GET /api/public/home`, có fallback local trong `locales/homeContentFallback.js` để site vẫn hoạt động khi API lỗi. |
| `/products` | `ProductCatalogPage` | Catalog đầy đủ + **bộ lọc đa tiêu chí**: nhóm nông sản (category), quy cách đóng gói, tiêu chuẩn chất lượng, xuất xứ/chứng nhận, mục đích sử dụng. Hỗ trợ search keyword, phân trang, gọi `GET /api/public/products`. |
| `/products/:slug` | `ProductDetailPage` | Trang chi tiết theo slug (tối ưu SEO). Hiển thị: gallery ảnh, mô tả vi/en, quy cách, tiêu chuẩn, xuất xứ, ứng dụng thực tế, **file spec sheet** tải về, sản phẩm liên quan. Gọi `GET /api/public/products/{slug}`. |
| `/contact` | `ContactPage` | Form **RFQ nâng cấp**: họ tên, công ty, email, điện thoại (`PhoneInput` có chọn quốc gia), thị trường xuất khẩu đích, **số lượng**, **quy cách**, ghi chú chi tiết, **đính kèm file** (PO, spec yêu cầu). POST tới `/api/public/contact`. Hiển thị `SuccessModal` khi gửi thành công. |

**Tính năng dùng chung trên toàn site:**

- **Language switcher** (`LanguageSwitcher.jsx`) chuyển giữa `vi` / `en`, state nằm ở `App` và truyền xuống các page.
- **Quick contact** (`QuickContactIcon.jsx`): nút floating WhatsApp, Zalo, Email, Hotline. Thông tin lấy từ `data/companyContact.js` (có thể bị override bởi `ContentProfile` từ admin).
- **SEO động** mỗi route qua hook `useSeoMeta` (đổi `<title>`, meta description, Open Graph, canonical) và `useJsonLd` để chèn structured data (Organization, Product, ContactPoint).
- **Fallback** dữ liệu: nếu API trả lỗi, dùng `productCatalogFallback.js` và `homeContentFallback.js` để site không bị trắng nội dung.

## 5. Chức năng portal admin

Đăng nhập tại `/admin/login`, vào dashboard tại `/admin` (được bảo vệ bởi `AdminRoute` — kiểm tra JWT lưu trong localStorage và rehydrate user qua `GET /api/auth/me`).

| Module | Mô tả |
|---|---|
| **Đăng nhập / phiên** | Login bằng username + password, nhận JWT (HS256, exp 8 tiếng theo `app.security.jwt-expiration-seconds`). Token lưu qua `adminAuthStorage`. Khi reload, app tự gọi `fetchCurrentAdminUser` để xác thực lại; nếu fail thì xoá session. |
| **Quản lý tài khoản** | `AccountAdminController` — CRUD admin account, đổi role (ADMIN/EDITOR), reset mật khẩu. Dùng BCrypt. Bootstrap account mặc định qua `DatabaseSeeder` (xem mục [15](#15-database-seeding)). |
| **Quản lý liên hệ (RFQ)** | `ContactAdminController` — liệt kê, lọc, phân trang yêu cầu liên hệ, đổi **trạng thái xử lý** (mới, đang xử lý, đã trả lời, đóng), xem file đính kèm. Khi có RFQ mới, `ContactNotificationService` có thể gửi email tới `APP_CONTACT_NOTIFICATION_EMAIL`. |
| **Quản lý nội dung công ty** | `ContentAdminController` + `ContentManagementService` — cập nhật `ContentProfile` (about, sứ mệnh, năng lực, chứng chỉ, thông tin liên hệ công khai vi/en) và quản lý **HomeBanner** (slide hero của trang chủ): upload ảnh, sắp xếp, bật/tắt. |
| **Quản lý catalog** | `ProductCatalogAdminController` + `ProductCatalogService` — CRUD `ProductCategory` và `Product`: thông tin vi/en, slug, ảnh chính, **gallery**, **spec sheet** (upload qua `FileStorageService`), quy cách, tiêu chuẩn, xuất xứ, danh sách ứng dụng (`product_applications_vi/en`), đánh dấu featured. |
| **Health / dashboard** | `PublicHealthController` cung cấp `/health` cho monitoring. Trang `AdminDashboardPage` hiển thị tab cho từng module trên. |

## 6. API backend

Tất cả endpoint có prefix `/api`. Endpoint admin yêu cầu header `Authorization: Bearer <token>`.

### Public (không auth)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/api/public/home` | Lấy banner + content cho trang chủ (theo locale) |
| `GET` | `/api/public/products` | Danh sách sản phẩm; query: `locale`, `category`, `q`, `page`, `size`, các filter facet |
| `GET` | `/api/public/products/{slug}` | Chi tiết sản phẩm theo slug |
| `POST` | `/api/public/contact` | Gửi yêu cầu liên hệ / RFQ (multipart nếu có file đính kèm) |

### Auth

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/auth/login` | Đăng nhập admin → trả `{ token, expiresAt, user }` |
| `GET` | `/api/auth/me` | Lấy thông tin admin hiện tại (validate token) |

### Admin (yêu cầu JWT, role ADMIN/EDITOR theo endpoint)

| Method | Endpoint | Mô tả |
|---|---|---|
| `GET/POST/PUT/DELETE` | `/api/admin/accounts/**` | Quản lý tài khoản admin |
| `GET/PATCH` | `/api/admin/contacts/**` | Liệt kê và cập nhật trạng thái RFQ |
| `GET/PUT/POST` | `/api/admin/content/**` | Cập nhật ContentProfile + HomeBanner (kèm upload ảnh) |
| `GET/POST/PUT/DELETE` | `/api/admin/products/**` | CRUD danh mục, sản phẩm, gallery, spec sheet |

> Tệp tin upload được serve tĩnh dưới đường dẫn tương ứng với `app.storage.upload-dir`.

## 7. Mô hình dữ liệu

Entities trong `vn.fortis.website.entity` (đều kế thừa `BaseAuditEntity` với `createdAt`, `updatedAt`):

- `AdminAccountEntity` — `username`, `passwordHash` (BCrypt), `fullName`, `role`, `active`.
- `ContactRequestEntity` — họ tên, công ty, email, phone (E.164), thị trường, số lượng, quy cách, nội dung, file đính kèm, **status** (xử lý).
- `ContentProfileEntity` — thông tin công ty đa ngôn ngữ (vi/en), năng lực, chứng chỉ, footer.
- `HomeBannerEntity` — slide hero (image url, headline vi/en, CTA, thứ tự, active).
- `ProductCategoryEntity` — nhóm nông sản, slug, tên vi/en, mô tả.
- `ProductEntity` — thuộc category; slug duy nhất, tên/mô tả vi/en, ảnh chính, gallery, spec sheet, quy cách, tiêu chuẩn, xuất xứ, **applications** lưu ở 2 bảng phụ `product_applications_vi` và `product_applications_en`, featured flag.

JPA tự `ddl-auto: update`, không dùng migration tool ngoài. Khi đổi seed lớn (ví dụ chuyển từ ngành gỗ sang nông sản) cần xoá thủ công theo thứ tự: `product_applications_en` → `product_applications_vi` → `products` → `product_categories` (xem `DEVELOPMENT_PLAN.md` mục Notes).

## 8. Đa ngôn ngữ (i18n)

- Hiện hỗ trợ **vi (mặc định)** và **en**.
- State `locale` ở `App.jsx` được truyền vào tất cả page; mỗi API request truyền `?locale=` để backend trả đúng field vi/en.
- Fallback content nội bộ tại `frontend/src/locales/homeContentFallback.js` và `frontend/src/data/productCatalogFallback.js`.
- Backlog (P2, mục `4.2` trong `DEVELOPMENT_PLAN.md`): tách field vi/en trong admin để biên tập độc lập.

## 9. SEO & structured data

- `frontend/src/hooks/useSeoMeta.js` cập nhật `<title>`, meta description, Open Graph, canonical theo từng route.
- `frontend/src/hooks/useJsonLd.js` chèn JSON-LD `<script>` cho:
  - `Organization` (toàn site)
  - `Product` (trên `/products/:slug`)
  - `ContactPoint` (trên `/contact`)
- Cấu hình mặc định nằm ở `frontend/src/data/seoConfig.js`.
- Slug sản phẩm dùng URL thân thiện để index Google tốt hơn.

## 10. Bảo mật

- **JWT HS256** ký bằng `app.security.jwt-secret` (production phải đổi qua env `APP_JWT_SECRET`). Hạn token: 28 800 giây (8h).
- Spring Security cấu hình tại `config/security/SecurityConfig.java`: stateless, BCrypt cho password, resource server JWT cho `/api/admin/**` và `/api/auth/me`.
- CORS whitelist từ `app.cors.allowed-origins` (đã trim từng phần tử). Mặc định dev cho phép `localhost:5173` và `localhost:4173`.
- File upload: validate content-type và size trong `FileStorageService`; tên file random để tránh ghi đè.
- Không log secret; biến môi trường nhạy cảm không commit (xem `.env.production.example`).

## 11. Yêu cầu môi trường

- **Node.js ≥ 20** (khuyến nghị 22) và npm ≥ 10.
- **Java 21** (Temurin / Zulu) + Maven Wrapper (`./mvnw` đã có sẵn).
- **PostgreSQL 14+** (local Docker hoặc Neon).
- (Tuỳ chọn) **Docker 24+** và Docker Compose plugin để chạy production.

## 12. Chạy local (dev)

### Backend

```bash
cd backend

# Tạo DB local: postgres://postgres:postgres@localhost:5432/fortis
# Hoặc dùng Neon và set biến môi trường (xem mục 13).

# Chạy với profile dev (mặc định)
./mvnw spring-boot:run
# → http://localhost:9090
# → Swagger? Không tích hợp; xem mục 6 cho danh sách endpoint.
```

Lần đầu chạy, `DatabaseSeeder` sẽ tạo:

- Admin mặc định (xem mục [15](#15-database-seeding) — đổi mật khẩu ngay).
- Danh mục + sản phẩm nông sản mẫu.
- `ContentProfile` và `HomeBanner` mặc định.

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Tạo file `frontend/.env.local` nếu cần đổi API base URL:

```bash
VITE_API_BASE_URL=http://localhost:9090
```

## 13. Cấu hình biến môi trường

### Backend (production, profile `prod`)

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | có | Đặt `prod` |
| `PORT` |  | Cổng HTTP container (mặc định 9090) |
| `APP_DB_URL` | có | `jdbc:postgresql://HOST:5432/DB?sslmode=require` |
| `APP_DB_USERNAME` | có | User DB |
| `APP_DB_PASSWORD` | có | Mật khẩu DB |
| `APP_JWT_SECRET` | có | Chuỗi ngẫu nhiên ≥ 32 ký tự, **khác dev** |
| `APP_CORS_ALLOWED_ORIGINS` | có | Danh sách origin frontend, cách nhau dấu phẩy. Ví dụ `https://fortis.pages.dev,https://www.fortisvn.vn` |
| `APP_CONTACT_NOTIFICATION_EMAIL` |  | Email nhận thông báo khi có RFQ mới |
| `JAVA_TOOL_OPTIONS` |  | Khuyến nghị `-Xms256m -Xmx512m` trên VPS 1 GB RAM |

Xem file mẫu: `.env.production.example`.

### Frontend (build time, Vite)

| Biến | Mô tả |
|---|---|
| `VITE_API_BASE_URL` | URL HTTPS công khai của API, ví dụ `https://api.fortisvn.vn` |

## 14. Build & deploy production

Tài liệu đầy đủ: [`DEPLOYMENT.md`](./DEPLOYMENT.md). Tóm tắt:

### Backend trên VPS với Docker Compose

```bash
cp docker-compose.prod.example.yml docker-compose.yml
cp .env.production.example .env.production
# Điền giá trị thật vào .env.production (KHÔNG commit)

docker compose build
docker compose up -d
curl -sS http://127.0.0.1:9090/health
```

Sau đó dựng **Caddy** (xem `deploy/caddy/Caddyfile.example`) để có HTTPS tự động qua Let's Encrypt và proxy `api.example.com` → `127.0.0.1:9090`.

### Frontend trên Cloudflare

```bash
cd frontend
npm install
VITE_API_BASE_URL=https://api.example.com npm run build
npm run deploy   # = vite build && wrangler deploy
```

Cấu hình `wrangler.jsonc` đã có; trỏ Cloudflare project về `dist/`.

## 15. Database seeding

`config/bootstrap/DatabaseSeeder.java` chạy mỗi lần khởi động backend:

- Tạo admin mặc định nếu chưa có. **Đăng nhập lần đầu xong phải đổi mật khẩu ngay trong tab Tài khoản.**
- Seed `ProductCategory` + `Product` nông sản mẫu khi catalog rỗng.
- Seed `ContentProfile` và `HomeBanner` mặc định.

**Reset catalog (khi muốn seed lại):** xoá theo thứ tự khoá ngoại:

```sql
DELETE FROM product_applications_en;
DELETE FROM product_applications_vi;
DELETE FROM products;
DELETE FROM product_categories;
```

Sau đó restart backend.

## 16. Backlog / roadmap

Xem chi tiết theo Priority/Status trong [`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md). Trạng thái hiện tại:

**Đã hoàn thành (done)**

- `1.2` Nâng cấp form RFQ (số lượng, quy cách, thị trường, ghi chú, file đính kèm)
- `1.3` Kênh liên hệ nhanh (WhatsApp, Zalo, Email, hotline floating)
- `3.1` Bộ lọc catalog đa tiêu chí
- `3.2` Trang chi tiết sản phẩm theo slug
- `3.3` Gallery + spec sheet sản phẩm
- `5.1` SEO meta cho từng trang
- `5.2` Structured data (Organization, Product, ContactPoint)

**Đang chờ (pending)** — ưu tiên cao:

- `2.1` Trang giới thiệu công ty (About)
- `2.2` Trang chứng chỉ & đối tác chi tiết
- `2.3` Khu vực case study / lô hàng đã giao
- `4.2` Tách nội dung vi/en thật sự trong admin
- `4.4` Quản lý catalog đầy đủ trong admin

---

## License & ownership

Dự án nội bộ của **Fortis VN**. Không công bố license công khai trong repo.
