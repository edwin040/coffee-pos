# KopiKasir — Coffee Shop POS

Aplikasi kasir coffee shop **mobile-first** untuk Android. Dibangun dengan HTML, CSS, dan JavaScript vanilla agar ringan, mudah dikembangkan, dan dapat dipasang sebagai PWA.

## Fitur tahap awal
- Layar kasir portrait: pencarian menu, kategori, katalog produk.
- Keranjang: tambah/kurangi kuantitas dan hitung total otomatis.
- Pembayaran: tunai, QRIS, dan transfer. QRIS/transfer saat ini dicatat manual, belum terhubung payment gateway.
- Struk transaksi yang bisa dicetak/disimpan sebagai PDF melalui dialog cetak browser.
- Riwayat transaksi dan ringkasan penjualan hari ini.
- Penyimpanan transaksi di localStorage perangkat dan cache dasar untuk penggunaan offline setelah kunjungan pertama.

## Menjalankan
1. Aktifkan GitHub Pages pada repository ini (Settings → Pages → Deploy from a branch → main → /(root)).
2. Buka alamat Pages melalui Chrome Android.
3. Pilih **Tambahkan ke layar utama / Install app** dari menu browser.

> Catatan: data saat ini tersimpan di browser/perangkat yang digunakan. Menghapus data browser dapat menghapus riwayat. Belum ada sinkronisasi multi-perangkat, backend, akun, stok bahan, atau integrasi printer/POS.

## Struktur
- `index.html` — struktur antarmuka.
- `styles.css` — tampilan mobile.
- `app.js` — logika kasir dan penyimpanan.
- `manifest.webmanifest`, `sw.js`, `icon.svg` — dukungan PWA.

## Rencana pengembangan
1. Fondasi kasir dan transaksi (tahap awal).
2. Kelola produk/kategori dan pengaturan toko.
3. Stok bahan baku dan resep.
4. Laporan harian, mingguan, bulanan, serta pembukuan.
5. Backup/sinkronisasi cloud, autentikasi, dan hardening produksi.

Mata uang: Rupiah (IDR).