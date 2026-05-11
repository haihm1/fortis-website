# Fortis Website Development Plan

Tai lieu nay la backlog chinh cho cac giai doan phat trien tiep theo cua website Fortis VN.

## Usage Rules
- Co the goi task bang ma muc, vi du: `1.2`, `3.2`, `4.2`.
- Co the goi theo muc uu tien, vi du: `bat dau P1`.
- Trang thai mac dinh cua cac muc trong file nay la `pending` neu chua duoc cap nhat.
- Khi bat dau thuc hien mot muc, co the tach ra thanh backlog ky thuat chi tiet hon.

## Status Legend
- `pending`: chua bat dau
- `in_progress`: dang thuc hien
- `done`: da hoan thanh
- `blocked`: dang bi chan boi phu thuoc hoac quyet dinh khac

## Priority Legend
- `P1`: uu tien cao, nen lam som
- `P2`: uu tien trung binh, nen lam sau P1
- `P3`: co gia tri bo sung, lam sau khi da on dinh cac muc quan trong

## Master Backlog

### 1. Tang chuyen doi khach hang

| ID | Ten hang muc | Mo ta ngan | Priority | Status |
| --- | --- | --- | --- | --- |
| 1.1 | CTA ro rang hon | Them CTA noi bat o Home va Product: Nhan bao gia, Lien he ngay, Tai profile cong ty | P2 | pending |
| 1.2 | Nang cap form RFQ | Bo sung so luong, quy cach, thi truong xuat khau, ghi chu chi tiet, file dinh kem | P1 | done |
| 1.3 | Kenh lien he nhanh | Them WhatsApp, Zalo, Email, hotline dang floating hoac sticky | P2 | done |

### 2. Tang do tin cay doanh nghiep

| ID | Ten hang muc | Mo ta ngan | Priority | Status |
| --- | --- | --- | --- | --- |
| 2.1 | Trang gioi thieu cong ty | Them trang About gom gioi thieu, nang luc san xuat, thi truong xuat khau, quy trinh QC | P1 | pending |
| 2.2 | Trang chung chi va doi tac | Tao trang rieng cho chung chi, doi tac, logo, hinh scan va thong tin xac thuc | P2 | pending |
| 2.3 | Du an / lo hang / case study | Them khu vuc chung minh nang luc thuc te qua cac lo hang va thi truong da cung cap | P2 | pending |

### 3. Nang cap catalog san pham

| ID | Ten hang muc | Mo ta ngan | Priority | Status |
| --- | --- | --- | --- | --- |
| 3.1 | Bo loc catalog | Loc theo nhom nong san, quy cach dong goi, tieu chuan chat luong, xuat xu / chung nhan va muc dich su dung | P3 | done |
| 3.2 | Trang chi tiet san pham | Tao trang chi tiet rieng theo slug de toi uu SEO va trinh bay day du noi dung | P1 | done |
| 3.3 | Tai lieu ky thuat va gallery | Them gallery anh, file spec sheet, bang quy cach, ung dung thuc te | P2 | done |

### 4. Hoan thien admin

| ID | Ten hang muc | Mo ta ngan | Priority | Status |
| --- | --- | --- | --- | --- |
| 4.1 | Dashboard tong quan | Hien thi so lien he moi, tinh trang xu ly, san pham noi bat, banner dang hoat dong | P3 | pending |
| 4.2 | Quan ly da ngon ngu that su | Tach rieng noi dung `vi/en` cho cac field trong admin | P2 | pending |
| 4.3 | Lich su chinh sua va phan quyen chi tiet | Bo sung audit log, nguoi cap nhat, thoi gian cap nhat, vai tro va quyen chi tiet hon | P3 | pending |
| 4.4 | Quan ly catalog trong admin | Them tab Catalog de quan ly danh muc, san pham, gallery va file spec tu giao dien admin | P2 | pending |

### 5. Marketing va SEO

| ID | Ten hang muc | Mo ta ngan | Priority | Status |
| --- | --- | --- | --- | --- |
| 5.1 | SEO co ban cho tung trang | Meta title, meta description, Open Graph, canonical cho cac trang quan trong | P2 | done |
| 5.2 | Structured data | Them schema cho Organization, Product, Contact | P2 | done |
| 5.3 | Blog / tin tuc | Xay dung khu vuc bai viet ve xuat khau nong san, vung trong, chung nhan va logistics lanh | P3 | pending |

### 6. Toi uu trai nghiem va hieu nang

| ID | Ten hang muc | Mo ta ngan | Priority | Status |
| --- | --- | --- | --- | --- |
| 6.1 | Loading state tot hon | Them skeleton, empty state, error state ro rang | P3 | pending |
| 6.2 | Toi uu hinh anh | Dung WebP, lazy loading, toi uu kich thuoc banner va anh san pham | P3 | pending |
| 6.3 | Cai thien mobile UX | Toi uu mobile menu, responsive catalog, form va admin dashboard | P3 | pending |

## Priority View

### P1
- `1.2` Nang cap form RFQ
- `2.1` Trang gioi thieu cong ty
- `3.2` Trang chi tiet san pham

### P2
- `1.1` CTA ro rang hon
- `1.3` Kenh lien he nhanh
- `2.2` Trang chung chi va doi tac
- `2.3` Du an / lo hang / case study
- `3.3` Tai lieu ky thuat va gallery
- `4.4` Quan ly catalog trong admin
- `4.2` Quan ly da ngon ngu that su
- `5.1` SEO co ban cho tung trang
- `5.2` Structured data

### P3
- `3.1` Bo loc catalog
- `4.1` Dashboard tong quan
- `4.3` Lich su chinh sua va phan quyen chi tiet
- `5.3` Blog / tin tuc
- `6.1` Loading state tot hon
- `6.2` Toi uu hinh anh
- `6.3` Cai thien mobile UX

## Command Examples
- `Lam muc 1.2`
- `Trien khai 3.2`
- `Bat dau P1`
- `Lam tiep 4.2`
- `Cap nhat status 3.2 thanh done`

## Development Notes
- Khi doi seed catalog tu go sang nong san tren DB local da co du lieu cu, can xoa du lieu catalog cu theo thu tu phu thuoc khoa ngoai: xoa `product_applications_en`, `product_applications_vi`, `products`, sau do xoa `product_categories`. Restart backend de `DatabaseSeeder` tao lai danh muc va san pham nong san.
- Neu chi muon giu du lieu lien he/admin/content hien co, khong xoa cac bang `contact_request`, `admin_account`, `content_profile`, `home_banner`.
