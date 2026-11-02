# EDUVERSE · Ekspedisi Bahasa

Game petualangan 3D untuk Bahasa Indonesia kelas XII SMK dengan **solo dan multiplayer Firebase**, kontrol HP/keyboard, tiga model karakter, tiga tempat, dan enam NPC. Dibuat menggunakan Three.js dan aset geometri orisinal. Hosting berupa file statis di GitHub Pages; Firebase mengelola akun, progres, dan koneksi antarpemain.

**Mulai dari [FIREBASE.md](FIREBASE.md)** untuk membuat proyek Firebase. Paket belum berisi konfigurasi proyek Anda, sehingga pertama kali dibuka game berjalan solo. Panduan dan pembuat berkas konfigurasi tersedia pada **setup.html** atau menu **Teman**. Paket terbaru: **EDUVERSE-MULTIPLAYER.zip**.

## Mulai bermain

1. Isi nama penjelajah (2–20 karakter).
2. Pilih **Penjelajah**, **Rimbawan**, atau **Kreator**. Ketiganya mempunyai bentuk rambut/aksesori berbeda. Warna pakaian, kulit, dan rambut dapat diubah. Geser pratinjau 3D untuk melihat karakter dari berbagai sudut.
3. Pilih **Huma Betang**, **Tepian Kahayan**, atau **Rimba Literasi**.
4. Klik **Masuk dunia**. Ikuti panah misi, berjalan mendekati objek, lalu gunakan Interaksi.
5. Menu **Dunia** memungkinkan pindah tempat kapan saja. Semua tempat juga tersambung lewat jalan setapak.
6. Setelah Firebase diatur: buka **Teman**, daftar/masuk akun, lalu buat atau gabung ruang. Bagikan kode 8 karakter; teman memakai akun berbeda dan kode yang sama.

## Multiplayer dan NPC

Pemain dalam ruang yang sama saling melihat avatar, gerak, lompat, lokasi, dan emote. Ada delapan pesan cepat, tiga emote, daftar anggota, sambung ulang koneksi, serta progres latihan pribadi di Firestore. Misi tetap dikerjakan masing-masing; tidak ada kuis beregu atau video yang diputar serempak.

Pemilik ruang dapat membisukan, mengeluarkan, mengizinkan kembali, dan menutup ruang. Batas 24 anggota mencakup anggota offline; pemilik dapat mengeluarkan anggota yang tidak dipakai. Nama berlabel **PEMAIN** adalah peserta online; **NPC** adalah pemandu komputer.

| NPC | Peran |
|---|---|
| Rani | Penjaga arsip dan pembuka misi Huma Betang |
| Bima | Pemandu ekspedisi sungai |
| Nara | Pemandu Rimba Literasi |
| Sari | Pengantar video pembelajaran |
| Damar | Pelatih kuis Bahasa Indonesia |
| Awan | Pemandu akun dan pertemanan |

NPC mempunyai dialog dan tombol aktivitas sesuai perannya. Mereka tidak menggantikan pemain nyata.

## Bermain di HP

Buka **tautan HTTPS GitHub Pages** melalui browser HP yang mendukung WebGL2. Tidak perlu memasang Roblox atau aplikasi lain. Tampilan lebih nyaman saat HP mendatar, tetapi posisi tegak juga tersedia.

- **Joystick kiri:** tahan dan geser untuk berjalan; semakin jauh digeser, semakin cepat sampai batas kecepatan berjalan.
- **Geser area dunia:** putar kamera dengan jari kanan. Joystick dan kamera menggunakan pointer terpisah sehingga bisa digunakan bersama.
- **Lari:** ketuk untuk mengaktifkan/menonaktifkan mode berlari.
- **Lompat:** ketuk tombol panah ke atas.
- **Interaksi:** ketuk saat dekat NPC, portal, gulungan, atau meja penyusun. Petunjuk di layar juga bisa diketuk.
- **Misi:** ketuk bilah nama tempat untuk membuka/ringkas informasi misi.
- **Layar penuh:** tombol ⛶ bila browser mendukung. Browser tertentu, termasuk sebagian browser iPhone, dapat membatasi fitur ini; permainan tidak bergantung pada layar penuh.

Joystick dan kamera berhenti saat panel dibuka, layar berubah ukuran, aplikasi kehilangan fokus, atau sentuhan dibatalkan. Mode grafis ringan dipilih saat awal masuk dari perangkat sentuh atau layar sempit. Mode Standar tersedia di Pengaturan.

Dukungan HP sudah diimplementasikan dan diuji pada ukuran layar HP di browser komputer. **Belum diuji langsung pada perangkat Android/iPhone fisik**, sehingga kelancaran perangkat tertentu belum dijamin. Gunakan browser terbaru dan coba mode ringan. Ini game browser bergaya blocky dengan desain orisinal; bukan game yang dijalankan di platform Roblox.

## Kontrol komputer

W/A/S/D atau tombol panah untuk berjalan, Shift untuk berlari, Spasi untuk melompat, seret mouse pada dunia untuk kamera, E untuk interaksi, Esc untuk jeda/menutup panel. Tombol **Plaza** kembali ke Huma Betang. Tombol aksi di layar juga bisa digunakan.

## Tiga tempat dan misi

| Tempat | Aktivitas | Hadiah sekali |
|---|---|---|
| Huma Betang | Bicara dengan Rani, baca 4 kartu materi, jawab minimal 4 dari 5 soal | 150 XP + 50 koin + badge Arsiparis |
| Tepian Kahayan | Temukan 3 gulungan di tepi sungai, lalu susun prosedur pengamatan di meja penyusun | 100 XP + 30 koin + badge Pengamat Sungai |
| Rimba Literasi | Temukan 3 gulungan di jalan hutan, lalu susun prosedur pencatatan tanaman | 100 XP + 30 koin + badge Pencatat Rimba |

Gulungan diambil melalui Interaksi, kemudian hilang dari dunia dan tersimpan di Tas. Kumpulkan seluruh petunjuk sebelum memakai meja penyusun. Dalam mini-game, ketuk kartu sesuai urutan; gunakan **Ulangi urutan** jika salah. Hadiah tidak bertambah saat misi yang sama dibuka ulang. Total ketiga misi adalah 350 XP dan 110 koin. Level bertambah setiap 100 XP.

Materi lama, kuis, video pilihan guru, profil, dan riwayat latihan tetap tersedia. Arena kuis sekarang memakai nama **Arena Bahasa**, agar berbeda dengan ekspedisi sungai yang bisa dijelajahi.

## Cara membuka dari komputer

Cara paling sederhana adalah mengunggah ke GitHub Pages. Jangan klik dua kali `index.html`; modul JavaScript perlu dibuka melalui alamat web.

Untuk pratinjau jika Node.js sudah terpasang:

1. Buka folder EDUVERSE di File Explorer.
2. Ketik `powershell` pada bilah alamat, lalu Enter.
3. Ketik `node serve.mjs`, lalu Enter.
4. Buka **http://127.0.0.1:4173** di browser komputer tersebut.
5. Terminal tetap terbuka selama pratinjau. Tekan Ctrl+C setelah selesai.

Alamat `127.0.0.1` hanya untuk komputer yang menjalankan pratinjau, **bukan tautan yang bisa dibuka di HP lain**. Untuk mencoba di HP, unggah ke GitHub Pages dan buka tautan hasil penerbitan. Tidak diperlukan server yang Anda kelola. `serve.mjs` hanya alat bantu pratinjau.

## Unggah ke GitHub Pages

1. Masuk ke GitHub dan buat repository, misalnya `eduverse`, sesuai kebijakan sekolah.
2. Pilih **Add file → Upload files**.
3. Unggah **isi paket terbaru**. `index.html` harus berada di tingkat teratas, bersama `style.css`, `setup.html`, `.nojekyll`, serta folder `js`, `data`, `vendor`, dan `firebase`. Isi `firebase/config.json` dan pasang rules di Firebase sesuai panduan.
4. Jika menggunakan paket ZIP, **ekstrak dulu**, kemudian unggah isinya. Mengunggah ZIP saja tidak menerbitkan game.
5. Klik **Commit changes**.
6. Buka **Settings → Pages**, pilih **Deploy from a branch**, cabang `main`, folder `/(root)`, kemudian **Save**.
7. Tunggu penerbitan selesai. Gunakan tautan yang ditampilkan GitHub, biasanya `https://NAMA-AKUN.github.io/eduverse/`.
8. Buka tautan yang sama di HP. Uji nama → karakter → tempat → joystick → interaksi.

Pembaruan: unggah seluruh berkas yang berubah, termasuk **file baru** di `js` dan `data`, lalu Commit changes. Tunggu penerbitan dan muat ulang. Semua impor relatif, sehingga mendukung subfolder repository GitHub Pages.

File inti yang wajib disertakan:

- `index.html`, `setup.html`, `style.css`, `.nojekyll`
- Seluruh folder `js`, `data`, `vendor`, dan `firebase`, termasuk semua modul multiplayer dan `data/npcs.js`
- `FIREBASE.md`, `README.md`, `TESTING.md` agar tautan panduan tetap tersedia

Jangan unggah `node_modules`, `.tools`, log emulator, atau ZIP lama. File rules di GitHub tidak otomatis aktif: publikasikan juga di Firebase Console.

## Progres, materi, dan video

Progres solo disimpan di browser dan tetap terpisah dari akun. Setiap akun mempunyai progres pribadi di Firestore serta cadangan lokal tersendiri. Akun baru memulai progres baru; mengubah nama tidak menghapus progres. Gunakan akun yang sama pada perangkat lain dan pastikan status **Tersimpan di Firebase** sebelum berpindah. Jika simpan gagal, sambungkan kembali dan tekan **Simpan progres sekarang**. Keluar akun setelah memakai perangkat bersama.

Materi dan soal ada di `data/content.js`; konfigurasi tempat/karakter dan petunjuk ada di `data/destinations.js`; dialog/pengaturan NPC ada di `data/npcs.js`. Panel guru tanpa edit kode belum dibuat. Soal contoh masih lima, kelulusan empat; jika jumlah soal diubah, logika skor dan tampilan perlu disesuaikan.

Portal Bioskop menerima tautan YouTube `watch`, `youtu.be`, atau `shorts`. Domain dan ID divalidasi. Pemutaran memerlukan internet dan izin penyematan dari pemilik video. Jika ditolak, gunakan **Buka di YouTube**. Tautan demo tersimpan secara lokal, bukan diterbitkan kepada seluruh siswa.

Lingkungan terinspirasi arsitektur dan alam Kalimantan Tengah, bukan rekonstruksi budaya yang diklaim akurat. Misi merupakan skenario sekolah fiktif. Guru perlu meninjau konten sebelum digunakan di kelas. Misi sungai berada di daratan, bukan petunjuk berenang atau memasuki sungai.

## Kinerja dan keterbatasan

Objek dekorasi statis dan ubin digabung untuk mengurangi pekerjaan menggambar. Resolusi render dibatasi, bayangan dinonaktifkan pada mode ringan, dan tampilan latar dibatasi saat panel terbuka. Three.js 0.170.0 disertakan di folder vendor; font web mempunyai font pengganti jika internet tidak tersedia.

Firebase dan multiplayer sudah diimplementasikan serta diuji dengan dua akun pada emulator lokal. Proyek Firebase Anda belum dibuat/dihubungkan. Belum tersedia: panel administrator kurikulum, peran guru/siswa yang diverifikasi, tugas yang dikumpulkan online, penilaian resmi, leaderboard tepercaya, voice chat, chat teks bebas, audio permainan, atau editor pakaian lengkap.

XP/progres merupakan **latihan, bukan nilai resmi tahan manipulasi**. Rules membatasi akses dan bentuk data, tetapi tidak membuktikan bahwa jawaban dikerjakan tanpa manipulasi browser. Batas 24 anggota bukan jaminan kinerja/kuota. Pantau pemakaian Firebase; rincian ada dalam panduan. Tampilan memakai geometri blocky sederhana, belum menyamai detail ilustrasi referensi.

## Jika ada kendala

- Layar kosong: buka lewat HTTP/HTTPS, gunakan browser WebGL2 dengan akselerasi grafis.
- Kontrol belum muncul: pastikan `js/controls.js`, `js/lobby.js`, dan `data/destinations.js` ikut diunggah. Muat ulang setelah deployment selesai.
- Lambat/panas: gunakan Pengaturan → Ringan dan tutup tab berat lain.
- Gagal masuk ke portal: dekati sampai petunjuk interaksi muncul, lalu ketuk/tekan E.
- Joystick tidak bergerak: tutup panel; letakkan jari di area lingkaran kiri bawah, lalu geser dan tahan.
- Halaman lama: muat ulang tanpa cache di komputer; pada HP tutup tab lama lalu buka lagi. Menghapus data situs dapat menghapus progres.
- Progres berbeda di HP dan komputer: pastikan menggunakan akun yang sama dan penyimpanan cloud berhasil, bukan mode solo.
- Teman tidak muncul: periksa akun berbeda, kode ruang sama, status Online, dan lokasi; lihat panduan Firebase untuk rules/config.
- Video gagal: gunakan tautan buka YouTube; pembatasan pemilik video tidak bisa diatasi game.

Pengujian otomatis: `node --test tests/*.test.mjs`. Rincian uji dan batas verifikasi terdapat di `TESTING.md`.
