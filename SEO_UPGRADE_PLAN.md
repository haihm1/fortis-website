# Fortis VN SEO & Performance Upgrade Plan

File nay la nguon task chinh cho cac dot nang cap SEO, Core Web Vitals va kha nang index cua website Fortis VN.

## Nguyen tac thuc hien

- Doc task tu file nay truoc khi bat dau.
- Hoi y kien nguoi dung truoc khi thuc hien tung task.
- Chi danh dau task la hoan thanh sau khi da sua code va kiem tra pass.
- Khong tu y chuyen sang task tiep theo neu chua duoc nguoi dung xac nhan.
- Khi hoan thanh task, cap nhat checkbox va them ghi chu ngan gon vao muc "Ket qua".

## Giai doan 1: Task de - Chi thao tac Frontend

### Task 1: Toi uu hieu suat hinh anh va CLS

**Trang thai:** [x] Hoan thanh ngay 2026-06-08

**Pham vi:** `frontend/`

**Yeu cau:**

- Tim toan bo the `<img />` trong du an frontend.
- Them `loading="lazy"` cho cac anh nam duoi nep gap man hinh, vi du trang danh sach san pham.
- Dam bao moi anh co class CSS dinh hinh ty le khung hinh, vi du `aspect-square`, `aspect-video`, `object-cover`, `w-full`, `h-full`.
- Muc tieu la giam loi Cumulative Layout Shift (CLS).

**Kiem tra truoc khi hoan thanh:**

- Khong anh huong toi anh hero/banner quan trong above-the-fold.
- Anh san pham/list/card khong lam vo layout khi load cham.
- Frontend lint/build pass.

**Ket qua:**

- Da them `loading="lazy"` va `decoding="async"` cho anh noi dung/card/list/admin preview nam duoi nep gap man hinh.
- Giu eager/high priority cho logo, hero/banner va anh chinh above-the-fold de khong anh huong LCP.
- Da bo sung/cung co `aspect-ratio` cho cac khung anh san pham, tin tuc, gallery, anh chi tiet san pham va preview admin de giam CLS.
- Kiem tra `npm run lint` va `npm run build` trong `frontend/` deu pass. Build chi con warning chunk size cua Vite.

### Task 2: Bo sung JSON-LD Breadcrumb va FAQ

**Trang thai:** [x] Hoan thanh ngay 2026-06-08

**Pham vi:** `frontend/`

**Yeu cau:**

- Tao custom hook `src/hooks/useBreadcrumbJsonLd.js`.
- Tao custom hook `src/hooks/useFaqJsonLd.js`.
- Chen Breadcrumb Schema vao layout chinh de ap dung cho moi trang.
- Tao component FAQ hien thi cau hoi thuong gap ve:
  - Dieu kien giao hang.
  - Phuong thuc thanh toan.
  - Tieu chuan/chung nhan nhu Halal.
  - Quy trinh giao hang theo Incoterms nhu FOB, CIF.
- Gan FAQ Schema de toi uu Rich Snippets.

**Kiem tra truoc khi hoan thanh:**

- JSON-LD dung dinh dang `application/ld+json`.
- Khong tao script trung lap bat thuong khi chuyen route.
- Frontend lint/build pass.

**Ket qua:**

- Da tao `src/hooks/useBreadcrumbJsonLd.js` va gan Breadcrumb Schema vao `SiteLayout` de ap dung cho cac route public.
- Da tao `src/hooks/useFaqJsonLd.js` va component `FaqSection` hien thi FAQ B2B tren trang chu.
- FAQ gom noi dung ve Incoterms, thanh toan, Halal/chung tu xuat khau va quy cach dong goi, co ban dich VI/EN/ZH.
- Da bo cac Breadcrumb JSON-LD cuc bo tren trang export/product detail de tranh schema bi lap.
- Kiem tra `npm run lint` va `npm run build` trong `frontend/` deu pass. Build chi con warning chunk size cua Vite.

### Task 3: Hoan thien hreflang va Meta Tags

**Trang thai:** [x] Hoan thanh ngay 2026-06-08

**Pham vi:** `frontend/`

**Yeu cau:**

- Cap nhat `useSeoMeta.js`.
- Tu dong chen `<link rel="alternate" hreflang="..." />` vao `<head>`.
- Khai bao URL cho ngon ngu tieng Viet `vi`, tieng Anh `en`.
- Can xem xet bo sung tieng Trung `zh` vi website da co ngon ngu nay.
- Dinh dang `<title>` theo cau truc `[Ten san pham/Trang] | [Ten cong ty]`.
- Gioi han title duoi 60 ky tu neu co the.

**Kiem tra truoc khi hoan thanh:**

- Title khong bi trung lap ten cong ty.
- Hreflang thay doi dung theo route hien tai.
- Khong lam mat meta description hien co.
- Frontend lint/build pass.

**Ket qua:**

- Da cap nhat `useSeoMeta.js` de title luon theo dang `[Ten trang] | Fortis VN` va gioi han trong 60 ky tu.
- Da tu dong chen alternate hreflang cho `vi`, `en`, `zh` va `x-default`.
- Do website chua co route rieng theo ngon ngu, URL hreflang dang dung query `?lang=vi`, `?lang=en`, `?lang=zh`.
- Da cap nhat `App.jsx` de doc `?lang=` khi mo trang va luu lai ngon ngu tuong ung.
- Kiem tra `npm run lint` va `npm run build` trong `frontend/` deu pass. Build chi con warning chunk size cua Vite.

## Giai doan 2: Task trung binh - Dong bo Frontend va Backend

### Task 4: Bo sung tu khoa ngach B2B vao trang Chi tiet San pham

**Trang thai:** [x] Hoan thanh ngay 2026-06-08

**Pham vi:** `backend/`, `frontend/`

**Yeu cau:**

- Backend:
  - Mo rong `ProductEntity`.
  - Them `hsCode` kieu `String`.
  - Them `packagingSpec` kieu `String`.
  - Cap nhat DTO va service lien quan.
- Frontend:
  - Cap nhat admin edit product de nhap 2 truong moi.
  - Cap nhat `ProductDetailPage.jsx`.
  - Thiet ke bang "Thong so ky thuat" chuyen nghiep de hien thi noi bat `hsCode` va `packagingSpec`.

**Kiem tra truoc khi hoan thanh:**

- Du lieu cu khong bi loi khi 2 truong moi rong/null.
- API create/update product van hoat dong.
- Trang chi tiet san pham hien thi tot tren mobile/desktop.
- Backend package va frontend lint/build pass.

**Ket qua:**

- Backend da them `hsCode` va `packagingSpec` vao `ProductEntity`, request DTO, admin response va public catalog response.
- `ProductCatalogService` da luu/doc 2 truong moi; Hibernate `ddl-auto: update` se tu them cot nullable cho du lieu cu.
- Admin Edit Product da co input "Ma HS Code" va "Quy cach dong goi" trong phan thong tin nang cao.
- Trang chi tiet san pham da dua HS Code va quy cach dong goi len dau bang "Thong so ky thuat" voi style noi bat.
- Product JSON-LD da them HS Code va quy cach dong goi vao `additionalProperty`.
- Kiem tra backend package, `npm run lint` va `npm run build` deu pass. Build frontend chi con warning chunk size cua Vite.

### Task 5: Tu dong sinh sitemap.xml va robots.txt

**Trang thai:** [x] Hoan thanh ngay 2026-06-08

**Pham vi:** `backend/`, `frontend/`

**Yeu cau:**

- Backend:
  - Tao `SitemapController.java`.
  - Endpoint `GET /api/public/sitemap.xml`.
  - Tu dong sinh XML chuan gom:
    - Trang chu.
    - Trang danh muc san pham.
    - Tat ca slug san pham hien co.
- Frontend:
  - Tao `frontend/public/robots.txt`.
  - Them chi thi `Sitemap: [API_URL]/api/public/sitemap.xml`.

**Kiem tra truoc khi hoan thanh:**

- Response co content type phu hop voi XML.
- Sitemap khong chua URL admin.
- Robots khong block cac route public quan trong.
- Backend package va frontend lint/build pass neu co thay doi frontend.

**Ket qua:**

- Backend da tao `SitemapController.java` voi endpoint `GET /api/public/sitemap.xml`, response `application/xml`.
- Sitemap tu dong gom `/`, `/products`, `/contact`, `/export-market`, toan bo slug san pham active va slug bai viet export market active; khong chua URL admin.
- Da them cau hinh `app.site-url` co the override bang bien moi truong `APP_SITE_URL`, mac dinh `https://fortisvn.com`.
- Frontend da tao `frontend/public/robots.txt` voi `Disallow: /admin` va `Sitemap: https://fortisvn.com/api/public/sitemap.xml`.
- Kiem tra backend package, `npm run lint` va `npm run build` deu pass. `robots.txt` da duoc copy vao `frontend/dist/`.

## Giai doan 3: Task kho - Build Process / Ha tang

### Task 6: Trien khai Prerendering/SSG cho Vite

**Trang thai:** [x] Hoan thanh ngay 2026-06-08

**Pham vi:** `frontend/`, co the can doc API backend

**Yeu cau:**

- Danh gia thu vien prerender phu hop voi Vite hien tai, vi du:
  - `vite-plugin-prerender`
  - `@prerenderer/rollup-plugin`
- Cau hinh `vite.config.js`.
- Khi chay `npm run build`, he thong tu dong render san HTML tinh cho:
  - `/`
  - `/products`
  - Tat ca `/products/:slug`
- Can goi backend de lay danh sach slug san pham.

**Muc tieu:**

- Crawler va doi tac truy cap link nhan duoc HTML co noi dung chu co ban, khong chi la trang trong doi JavaScript.

**Kiem tra truoc khi hoan thanh:**

- Build Cloudflare khong bi vo.
- Co fallback neu backend khong truy cap duoc luc build.
- Route SPA van hoat dong sau khi prerender.
- Frontend build pass.

**Ket qua:**

- Da cau hinh `vite.config.js` voi plugin `fortis-prerender-seo`, chay sau khi Vite build xong.
- Da tao script `frontend/scripts/prerender-seo.mjs` de sinh HTML tinh cho `/`, `/products` va tat ca `/products/:slug`.
- Script goi `${VITE_API_BASE_URL}/api/public/catalog?lang=en` de lay slug/noi dung san pham khi build; neu API khong truy cap duoc thi fallback ve catalog noi bo de build Cloudflare khong bi vo.
- HTML tinh co title, meta description, canonical, hreflang, OG/Twitter tags va noi dung chu co ban trong `#root` de crawler doc duoc truoc khi JavaScript chay.
- Da doi fallback `VITE_SITE_URL` trong SEO frontend ve `https://fortisvn.com` cho dong bo domain public.
- Kiem tra `npm run lint` va `npm run build` trong `frontend/` deu pass. Build local sinh 8 route tinh bang fallback catalog do chua co `VITE_API_BASE_URL`.

### Task 7: Tracking Off-page va Backlink

**Trang thai:** [ ] Chua thuc hien

**Pham vi:** Thu cong sau deploy

**Yeu cau:**

- Sau khi website len song, dua URL trang chu va cac trang san pham chu luc di xay dung backlink.
- Dat profile cong ty kem link web tren cac nen tang B2B, vi du `go4worldbusiness`.
- Co the tao checklist noi dung profile cong ty, anchor text, va danh sach nen tang nen dang.

**Kiem tra truoc khi hoan thanh:**

- URL public da on dinh.
- Cac trang san pham chu luc da co SEO title/meta/FAQ/schema can thiet.

**Ket qua:**

- Chua co.
