export const characters = [
  { id: 'explorer', name: 'Penjelajah', detail: 'Ransel & rambut pendek', shirt: '#238baf', skin: '#dca977', hair: '#302c29' },
  { id: 'ranger', name: 'Rimbawan', detail: 'Topi & rompi lapangan', shirt: '#51845c', skin: '#ba825c', hair: '#282520' },
  { id: 'maker', name: 'Kreator', detail: 'Rambut panjang & jaket', shirt: '#b06ba7', skin: '#ebba91', hair: '#432e27' }
];
export const destinations = [
  { id: 'hub', name: 'Huma Betang', subtitle: 'Kampung ilmu', icon: '⌂', color: '#7adfc8', x: 0, z: 21, yaw: 0,
    description: 'Temui Rani, pelajari teks prosedur, lalu tuntaskan kuis arsip kelas.', activity: 'NPC · Materi · Kuis', reward: '150 XP + 50 koin' },
  { id: 'river', name: 'Tepian Kahayan', subtitle: 'Ekspedisi sungai', icon: '≈', color: '#ffc875', x: 20.5, z: 24, yaw: -Math.PI/2,
    description: 'Temukan tiga gulungan petunjuk di tepi sungai, lalu susun prosedur pengamatan.', activity: 'Eksplorasi · Susun langkah', reward: '100 XP + 30 koin' },
  { id: 'forest', name: 'Rimba Literasi', subtitle: 'Jejak pengetahuan', icon: '♧', color: '#b6b0ff', x: -33, z: 16, yaw: 0,
    description: 'Ikuti jalan setapak, kumpulkan tiga petunjuk, dan susun prosedur pencatatan tanaman.', activity: 'Eksplorasi · Susun langkah', reward: '100 XP + 30 koin' }
];
export const expeditions = {
  river: { title: 'Pengamat Tepian Kahayan', hint: 'Cari gulungan emas di daratan tepian sungai.',
    steps: ['Siapkan lembar pengamatan dan tentukan titik aman bersama guru.', 'Amati keadaan tepi sungai dari daratan, lalu catat temuan.', 'Setelah pengamatan, rangkum catatan menjadi laporan singkat.'],
    explanation: 'Persiapan mendahului pengamatan. Laporan disusun setelah data dicatat. Tetap di daratan dan bersama guru.' },
  forest: { title: 'Pencatat Rimba Literasi', hint: 'Cari gulungan ungu di sepanjang jalan hutan.',
    steps: ['Siapkan buku catatan dan pilih tanaman yang akan diamati.', 'Catat ciri daun dan batang tanpa merusak tanaman.', 'Kemudian, periksa kembali catatan dan beri judul laporan.'],
    explanation: 'Tentukan objek sebelum mencatat. Pemeriksaan dan pemberian judul dilakukan setelah catatan tersedia.' }
};
