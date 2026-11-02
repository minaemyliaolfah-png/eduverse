# Catatan pengujian EDUVERSE — multiplayer, NPC, HP & tiga tempat

Tanggal: 27 Oktober 2026.

## Hasil versi multiplayer

**12/12 unit test dan 1/1 uji integrasi Firebase lulus.** Uji integrasi menggunakan Firebase Auth, Realtime Database, dan Firestore Emulator, memuat kedua file Security Rules sebenarnya, serta akun dengan UID berbeda. Bukan simulasi avatar palsu atau penyimpanan dua tab saja.

Perintah: `npm test` dan `npm run test:firebase` (emulator harus aktif). Pengujian memakai Node.js 24.20.0, Java 21, Firebase SDK 12.4.0, rules-unit-testing 5.0.0, dan Firebase CLI 14.22.0. CLI mempunyai peringatan kompatibilitas dependency pada Node 24; emulator dan pengujian tetap selesai dengan exit code 0. SDK pengujian meninggalkan transport Node aktif; runner menggunakan `--test-force-exit` setelah assertion dan cleanup selesai.

Yang berhasil diperiksa:

- Daftar/masuk akun contoh, UID berbeda, membuat ruang dan bergabung memakai kode yang sama.
- Kedua akun menerima avatar masing-masing; perubahan posisi dan emote terkirim; pesan cepat diterima.
- Menyimpan dan membaca progres pribadi. Akses progres akun lain, daftar seluruh profil, tambahan field admin, dan XP tidak sesuai rumus ditolak.
- Orang luar tidak dapat membaca daftar pemain/anggota atau mendaftar seluruh ruang. Penulisan avatar milik orang lain, koordinat di luar batas, dan field email tambahan ditolak.
- Mengambil alih pemilik ruang, slot ke-25, keanggotaan tanpa slot, serta pengiriman pesan terlalu cepat ditolak oleh aturan server.
- Bisukan/buka suara, keluarkan/blokir, penolakan masuk kembali, buka blokir/bergabung kembali, dan penutupan ruang.
- `goOffline` memicu onDisconnect: node pemain benar-benar dihapus server dan avatar hilang dari akun lain. `goOnline` mendaftarkan cleanup dan kehadiran kembali.
- Unit test tambahan memeriksa penggabungan progres antarperangkat, deduplikasi sesi akun sama, data kedaluwarsa/koordinat invalid, kode ruang, parsing konfigurasi, dan penolakan kunci privat/alamat database tidak sah.

Log `PERMISSION_DENIED` pada pengujian negatif adalah hasil yang diharapkan dan diperiksa dengan assertion.

## Pengujian tampilan multiplayer

Dua sesi browser dibuka melalui `?emulator=1`, masing-masing membuat akun contoh berbeda lewat formulir game. Akun Gufron membuat ruang; akun Alya bergabung. UI menunjukkan **2 tersambung**, avatar Alya berlabel **PEMAIN** tampil dan bergerak dalam dunia Gufron, serta pesan cepat muncul. NPC Awan berlabel **NPC** tetap terpisah.

Muat ulang mempertahankan akun dan mengambil progres. Pemilik mengeluarkan Alya, daftar turun ke satu pemain, lalu tombol **Izinkan bergabung lagi** memungkinkan Alya masuk kembali. Mendekati Awan membuka dialog dan tombolnya membawa pemain ke menu Teman. Tidak ada error/warning aplikasi saat alur masuk, join, gerak, dan pesan cepat awal diperiksa; penolakan akses setelah kick memang diharapkan.

Halaman game tanpa parameter emulator dan dengan konfigurasi kosong menampilkan **Firebase belum dihubungkan**, tautan panduan, dan keterangan mode solo. Formulir setup menolak contoh service-account/private-key tanpa mengunduh konfigurasi. `preview-multiplayer.png` dan `preview-room.png` adalah tangkapan pengujian lokal, bukan bukti layanan produksi sudah aktif.

## Perubahan dan temuan yang diperbaiki

- Versi sebelumnya belum mempunyai kontrol jalan HP. Kini ada joystick analog, kamera dengan geser, tombol lari/lompat/interaksi, dan penanganan pointer terpisah.
- Alur masuk diubah menjadi nama → karakter 3D → tempat. Tiga model mempunyai geometri aksesori/rambut berbeda.
- Ditambahkan area Tepian Kahayan dan Rimba Literasi, enam gulungan yang dapat diambil, dua meja penyusun, dua misi, serta badge/hadiah masing-masing.
- HUD ponsel diringkas: menu horizontal, misi yang dapat dilipat, minimap kecil, dan kontrol sudut bawah.
- Memperbaiki permukaan sungai yang sebelumnya berada di bawah tanah; menambahkan ketinggian jalan jembatan/tangga dan bayangan kontak avatar.
- Mengurangi draw call ubin/dekorasi melalui instancing, memilih mode ringan untuk HP, dan membatasi rendering latar saat panel terbuka.
- Progres lama tetap dibaca; pengumpulan petunjuk dan hadiah baru tidak menggandakan hadiah lama.

## Tujuh pengujian dasar yang tetap lulus

Perintah: `node --test tests/*.test.mjs`.

1. Dua pointer bergerak dan memutar kamera secara independen; pointer ketiga tidak mengambil alih, pelepasan/cancel/reset/blur menghentikan gerak.
2. Zona netral joystick, kecepatan parsial, batas diagonal, dan arah negatif.
3. Pengumpulan unik, prasyarat tiga petunjuk, penolakan urutan salah, penerimaan urutan benar, dan hadiah satu kali.
4. Migrasi penyimpanan lama serta pembatasan data baru yang rusak/tidak dikenal.
5. Hadiah misi arsip hanya setelah tiga syarat terpenuhi dan tidak berulang.
6. Progres dapat dimuat ulang; penyimpanan rusak atau tidak tersedia ditangani.
7. Tautan YouTube dibatasi menurut domain, protokol, dan format ID.

Pemeriksaan sintaks juga dilakukan pada seluruh modul aplikasi/data.

## Pengujian browser yang dilakukan

Browser dalam aplikasi dengan viewport 390×844, 844×390, dan 1280×720:

- Mengisi nama, memilih Rimbawan, membuka pratinjau, memilih tempat, dan masuk dunia.
- Memilih Kreator setelah muat ulang dan melihat model baru di dunia.
- Kontrol HUD dapat dibaca pada HP tegak dan mendatar; menu tidak membutuhkan keyboard.
- Menahan joystick layar memakai input pointer browser menggerakkan avatar, lalu berhenti setelah dilepas.
- Menjelajah dan mengambil seluruh petunjuk sungai dan hutan melalui tombol layar.
- Urutan salah pada tantangan sungai ditolak. Urutan benar pada kedua tantangan memberi masing-masing 100 XP dan 30 koin.
- Menu Dunia memindahkan pemain ke ketiga tempat.
- Drag pada dunia mengubah sudut kamera. Tombol Lompat mengangkat avatar; tombol Lari mengubah mode dan kecepatan gerak.
- Keyboard W/A/S/D dan E tetap dapat dipakai; air mancur menghalangi jalan lurus.
- NPC Rani dan keempat kartu materi tetap berfungsi.
- Kuis lama dijalankan ulang sampai hasil 5/5. Hadiah tidak berulang: total tetap **350 XP, 110 koin, 3/3 misi**.
- Nama, model karakter, tempat pilihan, petunjuk, misi, dan hadiah bertahan setelah muat ulang.
- Log error/warning yang diperiksa selama pengujian tidak menunjukkan error/warning.

## Batas verifikasi

Ini **pengujian browser desktop dengan ukuran layar HP**, bukan pengujian pada Android/iPhone fisik. Input dua jari diuji dalam pengujian otomatis pengendali pointer; pengoperasian dua jari bersamaan pada layar sentuh fisik belum diverifikasi. Kinerja, pengelolaan memori, keyboard virtual, dan layar penuh di tiap browser HP tetap perlu diuji pada perangkat sasaran.

Belum dilakukan: pengukuran FPS pada HP kelas rendah, uji beban 24 pemain, uji ketahanan sesi panjang, seluruh kombinasi collision, pengujian video YouTube nyata, audit keamanan produksi menyeluruh, deployment GitHub Pages, atau pengujian Firebase cloud milik pengguna. Multiplayer sudah diuji pada emulator dan browser lokal; koneksi internet antardua HP baru dapat diperiksa setelah proyek pengguna dikonfigurasi.

`preview-lobby.png` dan `preview-mobile.png` adalah bukti tampilan, bukan gambar latar permainan.
