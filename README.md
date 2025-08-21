Kalkulator Sales — SPD / STD / APC / Growth

Aplikasi web kalkulator sales yang dirancang untuk menghitung dan menganalisis metrik penjualan harian seperti SPD (Sales Per Day), STD (Struk Per Day), APC (Average Per Customer), dan pertumbuhan (Growth).

Fitur

✨ Antarmuka Pengguna

· Splash screen animasi dengan efek scan dan glitch
· Tema gelap/terang yang dapat disesuaikan
· Desain responsif untuk desktop dan mobile
· Format angka otomatis dengan pemisah ribuan
· Navigasi keyboard dengan dukungan Enter, Shift+Enter, dan tombol panah

📊 Metrik yang Dihitung

· Sales Harian: Shift 1, Shift 2, dan Total
· Struk Harian: Shift 1, Shift 2, dan Total
· AKM (Akumulasi): Sales dan Struk
· SPD (Sales Per Day): Rata-rata sales per hari
· STD (Struk Per Day): Rata-rata struk per hari
· APC (Average Per Customer): Rata-rata nilai per transaksi
· Growth: Persentase pertumbuhan SPD, STD, dan APC

💾 Fitur Penyimpanan

· Auto-save input pengguna secara otomatis
· Pemulihan state saat aplikasi dibuka kembali
· Preferensi tema yang disimpan secara lokal

Cara Menggunakan

Input Data

1. Input Harian:
   · Sales Shift 1 & 2: Jumlah penjualan per shift
   · Struk Shift 1 & 2: Jumlah transaksi per shift
2. Input AKM Kemarin:
   · AKM Sales: Total sales hingga hari sebelumnya
   · AKM Struk: Total struk hingga hari sebelumnya
   · Jumlah Hari: Periode akumulasi dalam hari
3. Data Periode Sebelumnya:
   · SPD, STD, dan APC sebelumnya untuk menghitung growth

Navigasi Keyboard

· Enter: Pindah ke field berikutnya
· Shift+Enter: Pindah ke field sebelumnya
· Escape: Kosongkan field aktif
· Panah Atas/Bawah: Tambah/kurangi nilai dengan step 1

Tampilan Hasil

Hasil perhitungan ditampilkan secara real-time di panel kanan dengan:

· Format angka yang mudah dibaca
· Warna indikator (hijau/merah) untuk nilai growth positif/negatif
· Ringkasan terorganisir dalam kartu terpisah untuk Sales, Struk, dan APC

Teknologi

· HTML5 dengan semantic markup
· CSS3 dengan custom properties untuk theming
· JavaScript ES6+ dengan module pattern
· Local Storage untuk persistensi data
· Intl.NumberFormat untuk formatting angka

Browser Support

Aplikasi kompatibel dengan browser modern yang mendukung:

· CSS Custom Properties (variables)
· ES6 JavaScript features
· Local Storage API
· Intl.NumberFormat API

Instalasi

Tidak diperlukan instalasi khusus. Cukup buka file index.html di browser web.

Struktur File

```
├── index.html      # Struktur utama aplikasi
├── styles.css      # Styling dan theming
└── app.js          # Logika aplikasi dan interaksi
```

Customization

Tema Warna

Warna dapat dikustomisasi dengan mengubah CSS custom properties di :root:

```css
:root {
  --bg: #f6f7f8;
  --card: #ffffff;
  --text: #0f172a;
  /* dan seterusnya */
}
```

Animasi Splash Screen

Efek animasi splash screen dapat dimodifikasi di bagian CSS yang terkait dengan class:

· .splash-char untuk animasi karakter
· .splash-scan untuk efek scanning
· .splash-ripple untuk efek ripple

Catatan Performa

· Debouncing diterapkan pada input untuk menghindari perhitungan berlebihan
· GPU acceleration digunakan untuk animasi yang smooth
· Formatting angka dilakukan secara efisien dengan Web APIs

Dukungan Mobile

· Touch targets yang besar untuk mudah digunakan di perangkat mobile
· Viewport yang dioptimalkan untuk berbagai ukuran layar
· Input numeric keyboard pada perangkat mobile

Aplikasi ini dirancang untuk membantu tim sales dalam melacak dan menganalisis performa penjualan harian dengan antarmuka yang intuitif dan fungsionalitas yang lengkap.
