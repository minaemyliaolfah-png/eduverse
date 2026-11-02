# Panduan Firebase EDUVERSE — dari nol

Paket ini sudah berisi kode multiplayer, akun, penyimpanan progres, dan aturan akses. **Anda belum mempunyai proyek Firebase, sehingga konfigurasi di paket sengaja kosong.** Game dapat dimainkan solo sekarang. Setelah penyiapan berikut, pemain dari HP berbeda bisa bertemu menggunakan akun berbeda dan kode ruang yang sama.

Panduan dengan formulir konfigurasi juga tersedia dalam **setup.html**. Buka melalui alamat web game, misalnya `https://NAMA-AKUN.github.io/eduverse/setup.html`, atau pilih **Teman → Buka panduan penyiapan**.

## Yang disiapkan satu kali oleh pemilik game

- Akun Google untuk mengelola Firebase.
- Akun GitHub untuk menerbitkan game di GitHub Pages.
- Satu proyek Firebase khusus EDUVERSE, dipakai bersama oleh seluruh siswa.
- Browser dan internet. Tidak perlu menyewa atau menjalankan server Node.js produksi.

Siswa tidak perlu membuat proyek Firebase. Mereka hanya mendaftar akun di dalam game. Akun pembuat proyek Firebase berbeda dari akun pemain EDUVERSE.

## 1. Buat proyek dan aplikasi web

1. Buka [Firebase Console](https://console.firebase.google.com/) dan masuk dengan akun Google pemilik game.
2. Pilih **Create a project / Add project**. Nama bebas, misalnya **EDUVERSE Sekolah**. Simpan project ID yang dibuat Firebase.
3. Google Analytics tidak diperlukan untuk fitur dalam paket ini.
4. Mulai menggunakan paket **Spark** selama kuotanya sesuai kebutuhan.
5. Buka **Project settings → General → Your apps**, lalu tambahkan aplikasi **Web**, biasanya bertanda `</>`.
6. Nama aplikasi misalnya **EDUVERSE Web**. Firebase Hosting tidak diperlukan karena hosting game memakai GitHub Pages.
7. Salin objek **firebaseConfig**. Pilihan npm pada contoh Firebase tidak mewajibkan instalasi apa pun untuk game ini; game memakai SDK browser.

## 2. Aktifkan Authentication

1. Di menu **Build → Authentication**, pilih **Get started**.
2. Buka **Sign-in method**, aktifkan **Email/Password**, lalu simpan. Passwordless/email-link tidak diperlukan.
3. Di **Settings → Authorized domains**, tambahkan domain tempat game diterbitkan, misalnya `namaguru.github.io`.
4. Masukkan domain saja, tanpa `https://` dan tanpa `/eduverse/`. Tambahkan domain sendiri jika game memakai domain khusus.
5. Untuk uji lokal dengan proyek nyata, tambahkan `localhost` dan/atau `127.0.0.1` sesuai alamat yang digunakan bila diminta oleh Firebase.

[Dokumentasi Email/Password Firebase](https://firebase.google.com/docs/auth/web/password-auth).

## 3. Buat dua database

Keduanya diperlukan dan memiliki fungsi berbeda.

| Layanan | Fungsinya dalam game |
|---|---|
| Cloud Firestore | Menyimpan progres latihan pribadi, karakter, misi, XP, dan badge |
| Realtime Database | Mengirim posisi pemain, ruang, kehadiran, pesan cepat, dan emote |

**Cloud Firestore:** buka **Build → Firestore Database → Create database**. Pilih Standard, database `(default)`, dan lokasi yang sesuai. Mulai dengan aturan tertutup/production. Pilih lokasi dengan cermat karena perubahan lokasi tidak dilakukan lewat konfigurasi game.

**Realtime Database:** buka **Build → Realtime Database → Create database**, pilih lokasi, lalu mulai dalam **locked mode**. Salin URL di bagian atas tampilan database. Contohnya berakhiran `.firebaseio.com` atau `.firebasedatabase.app`; gunakan alamat persis dari proyek Anda.

Jangan menyalin URL halaman console sebagai databaseURL. Jika konfigurasi disalin sebelum Realtime Database dibuat, databaseURL mungkin belum tercantum di firebaseConfig.

## 4. Pasang Security Rules dari paket

1. Buka file **firebase/database.rules.json** dengan editor teks, salin seluruh isinya.
2. Di Firebase Console, buka **Realtime Database → Rules**, ganti isi editor, kemudian **Publish**.
3. Buka file **firebase/firestore.rules**, salin seluruh isinya.
4. Di **Firestore Database → Rules**, ganti isi editor, kemudian **Publish**.
5. Pastikan kedua layanan berada dalam proyek yang sama dengan konfigurasi web.

Gunakan proyek khusus EDUVERSE agar aturan ini tidak menimpa aplikasi lain. Jangan memperbaiki `permission-denied` dengan membuka `.read` dan `.write` untuk seluruh database.

Aturan ini membatasi progres per pemilik akun, menolak penulisan avatar orang lain, membatasi bentuk data/koordinat, mengharuskan keanggotaan ruang, dan mengatur kewenangan pemilik ruang. Aturan **bukan sistem anti-cheat lengkap**: gerakan dan hasil latihan masih dilaporkan browser.

## 5. Isi firebase/config.json

Cara paling mudah: buka **setup.html** dari website game, tempel objek firebaseConfig, isi databaseURL jika belum ada, lalu tekan **Periksa & unduh config.json**. Formulir hanya memeriksa format dan membuat berkas di browser, tidak mengirim konfigurasi ke layanan lain.

Ganti berkas **firebase/config.json** dalam paket dengan hasil unduhan. Jangan meletakkannya di folder utama atau mengganti namanya menjadi `config.json.txt`.

Jika mengedit langsung, bentuknya JSON berikut. Ganti semua nilai dengan data milik proyek Anda; contoh ini tidak dapat dipakai untuk tersambung:

```json
{
  "apiKey": "SALIN_API_KEY_WEB",
  "authDomain": "SALIN_AUTH_DOMAIN",
  "projectId": "SALIN_PROJECT_ID",
  "databaseURL": "SALIN_URL_REALTIME_DATABASE",
  "appId": "SALIN_APP_ID_WEB"
}
```

Gunakan tanda kutip ganda, tanpa `const firebaseConfig =`, komentar, atau koma setelah baris terakhir. `storageBucket` dan `messagingSenderId` boleh ikut disalin, tetapi tidak dipakai fitur sekarang.

Konfigurasi **aplikasi web** memang dibaca browser. Jangan memasukkan service-account JSON, private key, password, atau kredensial Admin SDK ke game/GitHub. Security Rules dan Authentication melindungi data; menyembunyikan web config bukan pengganti aturan akses.

## 6. Terbitkan di GitHub Pages

1. Ekstrak **EDUVERSE-MULTIPLAYER.zip**.
2. Lengkapi **firebase/config.json**.
3. Buat repository GitHub, misalnya `eduverse`.
4. **Add file → Upload files**: unggah isi paket, bukan ZIP-nya. `index.html` berada di tingkat teratas bersama `style.css`, `setup.html`, folder `js`, `data`, `vendor`, dan `firebase`.
5. Commit, kemudian **Settings → Pages → Deploy from a branch → main → /(root) → Save**.
6. Tunggu penerbitan selesai dan buka tautan yang ditampilkan GitHub.
7. Buka tautan yang sama pada HP. Untuk multiplayer, semua pemain harus memakai versi game dan konfigurasi proyek Firebase yang sama.

Folder `node_modules`, `.tools`, log pengujian, serta ZIP lama bukan bagian website dan tidak perlu diunggah. Pembaruan rules harus dipublikasikan di Firebase Console; mengunggah file rules ke GitHub saja tidak mengaktifkannya.

## 7. Guru dan siswa bermain bersama

1. Isi nama penjelajah → pilih karakter → pilih tempat → **Masuk dunia**.
2. Tekan **Teman** di kanan atas, isi email dan kata sandi minimal 8 karakter, lalu **Daftar akun**. Berikutnya gunakan **Masuk**.
3. Guru/pemandu memilih **Buat ruang**. Simpan dan bagikan kode 8 karakter kepada peserta kelas.
4. Siswa masuk memakai **akun masing-masing**, memilih **Gabung ruang**, lalu memasukkan kode yang sama.
5. Untuk pertemuan awal, semua pilih **Dunia → Huma Betang**. Tutup panel untuk berjalan.
6. Avatar berlabel **PEMAIN** adalah akun lain. Enam pemandu berlabel **NPC** merupakan karakter komputer, tidak dihitung sebagai peserta online.
7. Menu Teman menyediakan delapan pesan cepat dan tiga emote. Gerak, lompat, perubahan karakter, dan lokasi teman tersinkron. Misi/XP/petunjuk tetap milik masing-masing pemain; belum ada kuis beregu atau video serempak.

Pemilik ruang dapat **Bisukan**, **Buka suara**, **Keluarkan**, **Izinkan bergabung lagi**, atau **Tutup ruang untuk semua**. Sembunyikan hanya menyembunyikan avatar dan pesan pada perangkat sendiri. Mengeluarkan membatalkan akses akun itu sampai pemilik mengizinkannya kembali. Ini peran pemilik ruang, bukan akun administrator sekolah yang diverifikasi.

Maksimal **24 anggota terdaftar** per ruang. Anggota offline tetap berada dalam daftar dan memakai tempat. Pemilik dapat mengeluarkannya untuk menyediakan tempat. Simpan kode jika ingin masuk lagi; pemuatan ulang tidak otomatis bergabung ke ruang. Jangan memakai akun yang sama untuk dua siswa: tampilan menggabungkan sesi dari akun yang sama menjadi satu pemain.

Progres solo dan progres setiap akun dipisahkan. Akun baru memulai progres baru. Progres akun disimpan di Firestore dan dicadangkan di perangkat. Periksa tulisan **Tersimpan di Firebase** sebelum berpindah perangkat. Jika koneksi gagal, sambungkan kembali dan tekan **Simpan progres sekarang**. Masuk pada perangkat lain menggunakan akun yang sama untuk mengambil progresnya. Keluar akun pada perangkat bersama.

## 8. Uji sebelum kelas pertama

- Pakai dua HP atau dua profil browser, dengan dua akun berbeda.
- Periksa kedua avatar saling terlihat; gerakkan A dan B bergantian, lompat, dan pindah lokasi.
- Coba pesan cepat, emote, bisukan, keluarkan, dan izinkan bergabung kembali.
- Putuskan internet salah satu perangkat. Avatar akan hilang setelah server mendeteksi putus atau data dianggap kedaluwarsa; ini tidak selalu seketika. Sambungkan kembali.
- Selesaikan satu misi, tunggu status penyimpanan, keluar akun, lalu masuk lagi dan periksa progres.
- Pantau penggunaan Firebase selama uji. Coba mode grafis Ringan pada HP sasaran.

Kode sudah diuji menggunakan Firebase Emulator dan dua akun berbeda. **Proyek Firebase Anda, deployment GitHub Pages, dan perangkat HP fisik belum diverifikasi.** Setelah langkah penyiapan, lakukan daftar uji ini pada layanan nyata.

## Kuota dan biaya

Per 27 Oktober 2026, [halaman harga Firebase](https://firebase.google.com/pricing) mencantumkan Spark Realtime Database dengan 100 koneksi bersamaan, 1 GB penyimpanan, dan 10 GB unduhan/bulan. Kuota adalah milik proyek, dibagi seluruh ruang/perangkat. Batas 24 anggota game tidak menjamin kuota cukup untuk kelas yang bermain terus-menerus.

Mulai dengan kelompok kecil, misalnya 8–12 peserta, lalu pantau Usage pada kedua database. Gerakan dikirim hingga lima kali/detik dan dibagikan ke anggota ruang sehingga unduhan bertambah seiring jumlah pemain. Avatar diam mengirim heartbeat setiap sekitar 10 detik. Tab/sesi tambahan tetap dapat memakai koneksi. Spark dapat membatasi layanan setelah kuota habis. Jangan mengaktifkan Blaze tanpa meninjau tarif; anggaran/peringatan bukan batas pengeluaran otomatis. Fitur paket ini tidak memerlukan Cloud Functions.

Ruang tertutup dan anggota lama masih tersimpan. Pengelola proyek dapat membersihkan data ruang yang sudah tidak diperlukan melalui Firebase Console sesuai kebijakan sekolah. Tidak ada pembersihan data otomatis atau jaminan kapasitas produksi dalam paket ini.

## Pemecahan masalah

| Gejala | Periksa |
|---|---|
| Firebase belum dihubungkan | Isi `firebase/config.json`; periksa lokasi dan unggah versi terbaru |
| Layanan gagal dimuat | Internet dan akses ke `www.gstatic.com`, muat ulang halaman |
| Email/password gagal | Aktifkan metode Email/Password, isi email valid dan sandi minimal 8 karakter; gunakan Lupa sandi untuk akun nyata |
| Permission denied | Proyek dan rules kedua database harus benar; akun bisa juga dikeluarkan pemilik |
| Progres cloud gagal dimuat | Buat default Firestore dan pasang rules; tekan Coba muat progres lagi |
| Teman tak tampak | Akun berbeda, kode sama, status Online, lokasi sama, dan tidak disembunyikan |
| Ruang penuh | Anggota offline tetap memakai slot; pemilik keluarkan yang tidak dipakai atau buat ruang baru |
| Tidak bisa masuk setelah dikeluarkan | Pemilik memilih Izinkan bergabung lagi pada daftar anggota yang dikeluarkan |
| Progres berbeda antarperangkat | Gunakan akun sama dan tunggu status Tersimpan di Firebase, bukan hanya penyimpanan solo |
| Halaman masih versi lama | Tunggu deployment selesai, lalu muat ulang; jangan hapus data situs jika cadangan lokal masih diperlukan |

## Untuk pengembang: pengujian tanpa akun Firebase produksi

Produksi menggunakan file statis. Node.js/npm dan Java hanya diperlukan bila ingin menjalankan pengujian emulator lokal ini.

1. Gunakan Node.js yang didukung Firebase CLI yang tercantum pada package-lock, Java 21, lalu jalankan `npm ci`.
2. Jalankan `npx firebase emulators:start --project demo-eduverse --only auth,database,firestore`.
3. Pada terminal lain, jalankan `node serve.mjs`, kemudian buka `http://127.0.0.1:4173/?emulator=1`.
4. Buat akun contoh; data hanya berada di emulator lokal. Parameter emulator diabaikan pada domain publik.
5. Jalankan unit test dengan `npm test`. Jalankan uji integrasi dengan `npm run test:firebase` saat emulator aktif. Uji integrasi mengosongkan database proyek demo emulator; tutup sesi browser uji sebelum menjalankannya.

Emulator mendengarkan hanya pada 127.0.0.1 dan tidak dipakai sebagai server kelas. Uji lokal bukan pengganti pemasangan rules dan pemeriksaan dua perangkat pada proyek nyata. [Dokumentasi emulator dan uji rules](https://firebase.google.com/docs/rules/unit-tests), [kehadiran/disconnect Realtime Database](https://firebase.google.com/docs/database/web/offline-capabilities).
