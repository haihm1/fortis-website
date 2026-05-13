# Triển khai production (chi phí thấp, API không sleep)

Tài liệu này thực hiện kế hoạch deploy: **frontend tĩnh miễn phí**, **API Spring Boot luôn chạy** (không dùng free tier có sleep cho JVM).

## 1. Chọn hosting (quyết định)

| Phương án | Mô tả | Chi phí gợi ý | Ghi chú |
|-----------|--------|---------------|---------|
| **A — VPS (khuyến nghị)** | Docker chạy API trên máy ảo nhỏ; HTTPS bằng Caddy/Nginx + Let’s Encrypt | ~5–12 USD/tháng + domain (tùy chọn) | Kiểm soát chi phí, không cold start theo policy PaaS |
| **B — PaaS có phí** | Render / Railway / Fly.io **gói always-on** | ~7–15 USD/tháng | Ít ops, thường đắt hơn VPS cùng mức ổn định |

**Chốt trong repo:** dùng **Phương án A (VPS)** nếu bạn chấp nhận SSH và firewall cơ bản; dùng **B** nếu ưu tiên “ít đụng server”. Tránh **gói free** cho Java API nếu yêu cầu “không sleep”.

## 2. Database (Neon hoặc Postgres trên VPS)

1. Tạo project PostgreSQL (Neon hoặc tự host).
2. Lấy **JDBC URL** dạng: `jdbc:postgresql://HOST:5432/DB?sslmode=require` (Neon: dùng connection string cho serverless, ghép đúng host/port/db + `sslmode=require`).
3. User/Password riêng; không commit secret.

## 3. Backend (Docker + biến môi trường)

### Biến tối thiểu (production)

| Biến | Mô tả |
|------|--------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `APP_DB_URL` | JDBC URL PostgreSQL |
| `APP_DB_USERNAME` | User DB |
| `APP_DB_PASSWORD` | Mật khẩu DB |
| `APP_JWT_SECRET` | Chuỗi ngẫu nhiên mạnh (khác dev) |
| `APP_CORS_ALLOWED_ORIGINS` | Danh sách origin FE, cách nhau bằng dấu phẩy, **đúng HTTPS** của Cloudflare Pages (vd. `https://xxx.pages.dev`, không thừa dấu cách — app đã trim) |
| `APP_CONTACT_NOTIFICATION_EMAIL` | Tùy chọn (email thông báo liên hệ) |
| `PORT` | Cổng container (mặc định 9090; PaaS thường inject sẵn) |

### Chạy trên VPS với Docker Compose

1. Sao chép `docker-compose.prod.example.yml` → `docker-compose.yml`.
2. Sao chép `.env.production.example` ở thư mục gốc repo → `.env.production`, điền giá trị thật (file này **không** commit).
3. Trên VPS: cài Docker + Docker Compose plugin.
4. `docker compose build && docker compose up -d`
5. Kiểm tra: `curl -sS http://127.0.0.1:9090/health` và `curl -sS http://127.0.0.1:9090/api/public/home` (sau khi proxy HTTPS, thay bằng URL công khai).

**VPS 1 GB RAM:** giữ `JAVA_TOOL_OPTIONS=-Xms256m -Xmx512m` trong compose như ví dụ để giảm nguy cơ OOM.

### HTTPS + reverse proxy (Caddy)

Mục tiêu: TLS miễn phí, proxy `https://api.example.com` → `127.0.0.1:9090`.

1. Trỏ DNS **A/AAAA** (hoặc CNAME tùy nhà cung cấp) subdomain API về IP VPS.
2. Dùng ví dụ `deploy/caddy/Caddyfile.example` (đổi domain, mở port 80/443 trên firewall).
3. Chạy Caddy trên host hoặc container; đảm bảo `APP_CORS_ALLOWED_ORIGINS` khớp **đúng** origin trang Pages (giao thức + host).

### Health check / monitoring

- Endpoint công khai: `GET /` và `GET /health` (phục vụ probe uptime, vd. UptimeRobot).

## 4. PaaS (Phương án B) — gợi ý ngắn

1. Tạo **Web Service** trỏ repo hoặc image Docker build từ `backend/Dockerfile`.
2. Profile: `prod`; set đủ biến như bảng trên.
3. Gói **có phí / always-on** — không dùng free tier sleep cho Java.
4. CORS: cùng nguyên tắc — origin Pages production chính xác.

## 5. Frontend (Cloudflare Pages)

1. Build command: `npm ci && npm run build` (trong thư mục `frontend/`).
2. Thư mục output: `frontend/dist` (hoặc `dist` nếu build context là `frontend`).
3. **Biến build** (Cloudflare Pages → Settings → Environment variables):  
   `VITE_API_BASE_URL=https://api.tenmiencuaban.com`  
   (URL API production có HTTPS, không dấu `/` cuối trừ khi codebase yêu cầu).
4. Mỗi lần đổi URL API cần **trigger build lại** (Vite embed env lúc build).
5. Kiểm tra E2E: trang chủ, catalog, form RFQ/liên hệ gọi API thành công (DevTools → Network không 403 CORS).

Tham chiếu mẫu: `frontend/.env.production.example`.

## 6. Checklist nhanh

- [ ] HTTPS cho FE và API  
- [ ] `APP_JWT_SECRET` production mạnh  
- [ ] Backup DB (Neon snapshot hoặc dump Postgres VPS)  
- [ ] Giám sát `GET https://api.../health`  

---

## Phụ lục: Phương án A (VPS) — hướng dẫn chi tiết từng bước

Dùng khi bạn đã **chốt phương án A**: một máy VPS chạy Docker (API) + Caddy (HTTPS) + database tách (khuyến nghị **Neon**).

### Bước 0 — Chuẩn bị

- **VPS:** Ubuntu 22.04 hoặc 24.04 LTS; **tối thiểu 1 GB RAM** (ổn định hơn với 2 GB). Nhà cung cấp gợi ý: Hetzner, DigitalOcean, Vultr, hoặc VPS trong nước tương đương.
- **Domain (khuyến nghị):** một subdomain cho API, ví dụ `api.tenmiencuaban.com`.
- **Neon:** tài khoản miễn phí / trả phí tùy quota; tạo database và user.

### Bước 1 — DNS trỏ về VPS

1. Trong DNS của domain, thêm bản ghi **A** (hoặc **AAAA** nếu dùng IPv6):  
   `api.tenmiencuaban.com` → **IP công khai** của VPS.  
2. Đợi propagate (thường vài phút đến vài giờ). Kiểm tra: `ping api.tenmiencuaban.com` hoặc `dig +short api.tenmiencuaban.com`.

### Bước 2 — SSH và bảo mật cơ bản

1. Đăng nhập: `ssh root@IP_VPS` (hoặc user mà nhà cung cấp gửi).  
2. Cập nhật hệ thống: `apt update && apt upgrade -y`.  
3. (Khuyến nghị: tạo user có `sudo`, hạn chế đăng nhập root bằng mật khẩu, ưu tiên SSH key — làm theo tài liệu nhà cung cấp nếu chưa quen.)  
4. Bật firewall **UFW**, chỉ mở cổng cần thiết:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

*(Compose trong repo chỉ bind API lên `127.0.0.1:9090`, không cần mở 9090 ra internet — Caddy sẽ proxy từ 443 vào localhost.)*

### Bước 3 — Cài Docker và Compose

Theo [hướng dẫn chính thức Docker cho Ubuntu](https://docs.docker.com/engine/install/ubuntu/) (thêm repository Docker, cài `docker-ce`, plugin `docker compose`).

Kiểm tra:

```bash
docker --version
docker compose version
```

### Bước 4 — Neon → JDBC và file `.env.production`

1. Trong Neon, lấy **connection string** (dạng host, port thường `5432`, database name, user, password, `sslmode=require`).  
2. Ghép **JDBC URL**:

`jdbc:postgresql://<HOST>:5432/<DATABASE>?sslmode=require`

3. Trên VPS, tạo thư mục làm việc (ví dụ `/opt/fortis`) và đặt file **`.env.production`** (sao chép từ [`.env.production.example`](.env.production.example) ở thư mục gốc repo), điền:

   - `APP_DB_URL`, `APP_DB_USERNAME`, `APP_DB_PASSWORD`
   - `APP_JWT_SECRET`: chuỗi dài ngẫu nhiên (không dùng mẫu dev)
   - `APP_CORS_ALLOWED_ORIGINS`: **đúng** URL frontend production, ví dụ `https://<project>.pages.dev` — nếu sau này gắn custom domain cho Pages, thêm origin đó (cách nhau bởi dấu phẩy, không khoảng trắng thừa)

### Bước 5 — Đưa code và Docker Compose lên VPS

Cách 1 — **Git clone** trên VPS (cần repo không chứa secret):

```bash
cd /opt
git clone <URL_REPO> fortis && cd fortis
cp docker-compose.prod.example.yml docker-compose.yml
nano .env.production   # đã tạo ở bước 4
```

Cách 2 — **scp** từ máy cá nhân: chỉ cần thư mục `backend/`, `docker-compose.yml`, `.env.production`.

Build và chạy:

```bash
docker compose build
docker compose up -d
docker compose logs -f fortis-api   # xem khởi động, thoát Ctrl+C
```

Kiểm tra nội bộ trên VPS:

```bash
curl -sS http://127.0.0.1:9090/health
curl -sS http://127.0.0.1:9090/api/public/home
```

*Nếu build trên VPS 1 GB bị treo hoặc hết RAM: build image trên máy mạnh hơn rồi `docker save` / `docker load` trên VPS, hoặc dùng registry (GHCR/Docker Hub) — ngoài phạm vi tối thiểu nhưng hay gặp thực tế.*

### Bước 6 — Caddy (HTTPS, Let’s Encrypt)

1. Cài Caddy (Ubuntu): theo [tài liệu Caddy](https://caddyserver.com/docs/install) hoặc gói `.deb` chính thức.  
2. Tạo `/etc/caddy/Caddyfile` (tham chiếu `deploy/caddy/Caddyfile.example`), thay `api.example.com` bằng subdomain thật của bạn, `reverse_proxy` vẫn trỏ `127.0.0.1:9090`.  
3. Kiểm tra cú pháp: `caddy validate --config /etc/caddy/Caddyfile`  
4. Nạp lại dịch vụ: `systemctl reload caddy` (tên service có thể là `caddy`).

Kiểm tra từ máy bất kỳ:

```bash
curl -sS https://api.tenmiencuaban.com/health
curl -sS https://api.tenmiencuaban.com/api/public/home
```

### Bước 7 — Frontend trên Cloudflare Pages

1. Kết nối repo với Cloudflare Pages.  
2. **Root directory:** `frontend`  
3. **Build command:** `npm ci && npm run build`  
4. **Build output directory:** `dist`  
5. **Environment variables (Production):** `VITE_API_BASE_URL=https://api.tenmiencuaban.com` (đúng domain đã bật TLS ở bước 6).  
6. Deploy. Mở site Pages, DevTools → Network: các request API phải `200`, không lỗi CORS.

*Nếu vẫn lỗi CORS: kiểm tra lại `APP_CORS_ALLOWED_ORIGINS` trên VPS (đúng `https://` và host, có thể thêm cả preview URL Pages nếu cần test.)*

### Bước 8 — Sau khi lên production

- Bật **UptimeRobot** (hoặc tương đương) trỏ `GET https://api.../health`.  
- Bật backup Neon trong dashboard (snapshot theo lịch).  
- Lưu `.env.production` an toàn (password manager); không đưa lên Git.
