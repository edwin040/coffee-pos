# KopiKasir — Coffee Shop POS

Aplikasi kasir coffee shop **mobile-first** untuk Android. Antarmuka dibuat dengan HTML, CSS, dan JavaScript, lalu dibungkus menjadi aplikasi Android menggunakan Capacitor.

## Build APK otomatis

Setiap perubahan pada konfigurasi Android atau folder `www/` di branch `main` akan menjalankan GitHub Actions untuk membangun APK debug.

1. Buka tab **Actions** di repository GitHub.
2. Pilih workflow **Build KopiKasir APK**.
3. Tunggu sampai status workflow **Success**.
4. Buka hasil run dan unduh artifact **KopiKasir-Android-APK**.
5. Ekstrak ZIP, lalu pasang file `app-debug.apk` di perangkat Android.

Workflow juga dapat dijalankan manual melalui **Actions → Build KopiKasir APK → Run workflow**.

## Fitur kasir tahap awal
- Layar kasir portrait: pencarian menu, kategori, katalog produk.
- Keranjang: tambah/kurangi kuantitas dan hitung total otomatis.
- Pembayaran: tunai, QRIS, dan transfer. QRIS/transfer saat ini dicatat manual, belum terhubung payment gateway.
- Struk transaksi yang bisa dicetak/disimpan melalui dialog cetak yang didukung perangkat.
- Riwayat transaksi dan ringkasan penjualan hari ini.
- Penyimpanan transaksi di localStorage perangkat.

## Menjalankan versi web

Aktifkan GitHub Pages pada repository ini (Settings → Pages → Deploy from a branch → main → /(root)), lalu buka alamat Pages melalui browser.

## Build lokal Android

```bash
npm install
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

APK debug akan berada di `android/app/build/outputs/apk/debug/app-debug.apk`.

## Struktur
- `index.html`, `styles.css`, `app.js` — versi web.
- `www/` — salinan aset web yang dibundel ke aplikasi Android.
- `package.json`, `capacitor.config.json` — konfigurasi Capacitor.
- `.github/workflows/build-apk.yml` — build APK otomatis di GitHub Actions.

## Catatan
- Versi Android menyimpan transaksi secara lokal pada perangkat. Belum ada sinkronisasi cloud, backend, login, stok bahan, atau integrasi printer/payment gateway.
- Folder `www/` adalah sumber aset Android; bila mengubah antarmuka, perubahan perlu disalin ke folder tersebut agar APK berikutnya ikut diperbarui.
- Artifact APK dari workflow debug tersedia selama 30 hari.

Mata uang: Rupiah (IDR).
