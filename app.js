/* ====== Utility ====== */
function parseNum(src){
  if (src === null || src === undefined) return null;
  // If an input element is passed, prefer its dataset.raw
  if (typeof src === 'object' && src.dataset){
    const raw = src.dataset.raw;
    if (raw === undefined || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  // Fallback: parse string/number by stripping common separators
  if (src === '') return null;
  const cleaned = String(src).replace(/[.,\s]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
const fmtInt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
const fmt2   = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function fInt(v){ return v === null ? '-' : fmtInt.format(v); }
function f2(v){ return v === null ? '-' : fmt2.format(v); }

// truncate to 2 decimals toward zero
function trunc2(val){
  if (!Number.isFinite(val)) return null;
  // multiply by 100, truncate toward zero, divide
  return Math.trunc(val * 100) / 100;
}

function formatPctTruncSigned(pct){
  if (pct === null || !Number.isFinite(pct)) return '-';
  const t = trunc2(pct);
  if (t === null) return '-';
  const sign = t > 0 ? '+' : (Object.is(t, -0) ? '' : ''); // negative already has '-'
  // use toLocaleString to show comma as decimal separator
  return `${sign}${t.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

/* ====== DOM refs ====== */
// Input refs (unchanged)
const sales1El = document.getElementById('sales1');
const sales2El = document.getElementById('sales2');
const struk1El = document.getElementById('struk1');
const struk2El = document.getElementById('struk2');
const akmSalesYesterdayEl = document.getElementById('akmSalesYesterday');
const akmStrukYesterdayEl = document.getElementById('akmStrukYesterday');
const daysEl = document.getElementById('days');
const prevSPDEl = document.getElementById('prevSPD');
const prevSTDEl = document.getElementById('prevSTD');
const prevAPCEl = document.getElementById('prevAPC');

// Output refs (updated to match new layout)
const outSales1 = document.getElementById('outSales1');
const outSales2 = document.getElementById('outSales2');
const outTotalSales = document.getElementById('outTotalSales');
const outStruk1 = document.getElementById('outStruk1');
const outStruk2 = document.getElementById('outStruk2');
const outTotalStruk = document.getElementById('outTotalStruk');
const outAkmSales = document.getElementById('outAkmSales');
const outAkmStruk = document.getElementById('outAkmStruk');
const outSPD = document.getElementById('outSPD');
const outSTD = document.getElementById('outSTD');
const outAPC = document.getElementById('outAPC');
const outGrowthSPD = document.getElementById('outGrowthSPD');
const outGrowthSTD = document.getElementById('outGrowthSTD');
const outGrowthAPC = document.getElementById('outGrowthAPC');

// Helper function to update value with class
function updateValueWithClass(element, value, isGrowth = false) {
    if (!element) return;
    
    // Update nilai
    element.textContent = value;
    
    // Handle growth classes
    if (isGrowth) {
        element.classList.remove('positive', 'negative');
        if (value && value !== '-') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                if (numValue > 0) {
                    element.classList.add('positive');
                } else if (numValue < 0) {
                    element.classList.add('negative');
                }
            }
        }
    }
}

// Tambahkan fungsi debug untuk membantu troubleshooting
function logDebug(label, value) {
    console.log(`${label}:`, value);
}

/* ====== Core compute function ====== */
function computeAll(){
  // parse inputs
  const s1 = parseNum(sales1El);
  const s2 = parseNum(sales2El);
  const st1 = parseNum(struk1El);
  const st2 = parseNum(struk2El);
  const akmSalesY = parseNum(akmSalesYesterdayEl);
  const akmStrukY = parseNum(akmStrukYesterdayEl);
  const days = parseNum(daysEl);

  const prevSPD = parseNum(prevSPDEl);
  const prevSTD = parseNum(prevSTDEl);
  const prevAPC = parseNum(prevAPCEl);

  // totals (require both shifts? In this calculator we accept if one shift empty -> treat as 0)
  const totalSales = (s1 === null && s2 === null) ? null : ( (s1 || 0) + (s2 || 0) );
  const totalStruk = (st1 === null && st2 === null) ? null : ( (st1 || 0) + (st2 || 0) );

  // akumulasi hari ini (butuh akm yesterday)
  let akmSalesToday = null;
  if (akmSalesY !== null && totalSales !== null) akmSalesToday = akmSalesY + totalSales;
  else if (akmSalesY !== null && totalSales === null) akmSalesToday = akmSalesY; // no sales today
  else if (akmSalesY === null && totalSales !== null) akmSalesToday = totalSales; // no prior akm

  let akmStrukToday = null;
  if (akmStrukY !== null && totalStruk !== null) akmStrukToday = akmStrukY + totalStruk;
  else if (akmStrukY !== null && totalStruk === null) akmStrukToday = akmStrukY;
  else if (akmStrukY === null && totalStruk !== null) akmStrukToday = totalStruk;

  // SPD & STD: need days
  let spdToday = null;
  let stdToday = null;
  if (days !== null && days >= 1){
    if (akmSalesToday !== null) spdToday = akmSalesToday / days;
    if (akmStrukToday !== null) stdToday = akmStrukToday / days;
  }

  // APC = totalSales / totalStruk but prefer using totals of hari ini (bukan akumulasi)
  let apcToday = null;
  if (totalSales !== null && totalStruk !== null && totalStruk !== 0){
    apcToday = totalSales / totalStruk;
  }

  // APC periode (berdasarkan akumulasi berjalan)
  let apcPeriod = null;
  if (akmSalesToday !== null && akmStrukToday !== null && akmStrukToday !== 0){
    apcPeriod = akmSalesToday / akmStrukToday;
  }

  // Growths: (periode ini / periode lalu - 1) * 100
  let growthSPD = null;
  if (spdToday !== null && prevSPD !== null && prevSPD !== 0){
    growthSPD = ((spdToday / prevSPD) - 1) * 100;
  }

  let growthSTD = null;
  if (stdToday !== null && prevSTD !== null && prevSTD !== 0){
    growthSTD = ((stdToday / prevSTD) - 1) * 100;
  }

  let growthAPC = null;
  if (apcPeriod !== null && prevAPC !== null && prevAPC !== 0){
    growthAPC = ((apcPeriod / prevAPC) - 1) * 100;
  }

  // Debug logs
  logDebug('Sales1', s1);
  logDebug('Sales2', s2);
  logDebug('TotalSales', totalSales);
  
  // Update output values
  updateValueWithClass(outSales1, s1 === null ? '-' : fInt(Math.round(s1)));
  updateValueWithClass(outSales2, s2 === null ? '-' : fInt(Math.round(s2)));
  updateValueWithClass(outStruk1, st1 === null ? '-' : fInt(Math.round(st1)));
  updateValueWithClass(outStruk2, st2 === null ? '-' : fInt(Math.round(st2)));
  updateValueWithClass(outTotalSales, totalSales === null ? '-' : fInt(Math.round(totalSales)));
  updateValueWithClass(outTotalStruk, totalStruk === null ? '-' : fInt(Math.round(totalStruk)));
  updateValueWithClass(outAkmSales, akmSalesToday === null ? '-' : fInt(Math.round(akmSalesToday)));
  updateValueWithClass(outAkmStruk, akmStrukToday === null ? '-' : fInt(Math.round(akmStrukToday)));
  updateValueWithClass(outSPD, spdToday === null ? '-' : fInt(Math.round(spdToday)));
  updateValueWithClass(outSTD, stdToday === null ? '-' : f2(stdToday));
  updateValueWithClass(outAPC, apcToday === null ? '-' : fInt(Math.trunc(apcToday)));
  
  // Update growth values
  updateValueWithClass(outGrowthSPD, formatPctTruncSigned(growthSPD), true);
  updateValueWithClass(outGrowthSTD, formatPctTruncSigned(growthSTD), true);
  updateValueWithClass(outGrowthAPC, formatPctTruncSigned(growthAPC), true);
}

/* ====== Event wiring ====== */
const inputs = [
  sales1El, sales2El, struk1El, struk2El,
  akmSalesYesterdayEl, akmStrukYesterdayEl, daysEl,
  prevSPDEl, prevSTDEl, prevAPCEl
];

// Recompute on input (debounce tiny)
let computeDebounce;
inputs.forEach(inp=>{
  inp.addEventListener('input', ()=>{
    clearTimeout(computeDebounce);
    computeDebounce = setTimeout(computeAll, 150);
  });
});

// Navigasi Enter ke kolom berikutnya
inputs.forEach((inp, idx)=>{
  inp.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){
      e.preventDefault();
      const nextEl = inputs[idx + 1];
      if (nextEl){
        nextEl.focus();
        requestAnimationFrame(()=>{
          if (typeof nextEl.setSelectionRange === 'function'){
            const val = nextEl.value || '';
            nextEl.setSelectionRange(val.length, val.length);
          }
        });
      } else {
        // jika sudah di kolom terakhir, jalankan hitung dan kembali ke kolom pertama
        computeAll();
        const firstEl = inputs[0];
        if (firstEl){
          firstEl.focus();
          requestAnimationFrame(()=>{
            if (typeof firstEl.setSelectionRange === 'function'){
              const val = firstEl.value || '';
              firstEl.setSelectionRange(val.length, val.length);
            }
          });
        }
      }
    }
    // Shift+Enter: ke kolom sebelumnya
    if (e.key === 'Enter' && e.shiftKey){
      e.preventDefault();
      const prevEl = inputs[idx - 1] || inputs[inputs.length - 1];
      prevEl.focus();
      requestAnimationFrame(()=>{
        if (typeof prevEl.setSelectionRange === 'function'){
          const val = prevEl.value || '';
          prevEl.setSelectionRange(val.length, val.length);
        }
      });
    }
    // Esc: kosongkan field aktif
    if (e.key === 'Escape'){
      inp.value = '';
      if (inp.dataset) inp.dataset.raw = '';
      computeAll();
    }
    // Arrow up/down: naik/turun angka sesuai step (default 1)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown'){
      const stepAttr = inp.getAttribute('step');
      const step = stepAttr ? Number(stepAttr) : 1;
      const cur = parseNum(inp) || 0;
      const next = e.key === 'ArrowUp' ? (cur + step) : (cur - step);
      inp.dataset.raw = String(next);
      inp.value = String(next);
      computeAll();
      e.preventDefault();
    }
  });
});

// Saat fokus di perangkat Android, pastikan kolom terlihat di tengah layar
inputs.forEach(inp=>{
  inp.addEventListener('focus', ()=>{
    setTimeout(()=>{
      try{ inp.scrollIntoView({ block: 'center', behavior: 'smooth' }); }catch{}
    }, 50);
  });
});

btnReset.addEventListener('click', ()=>{
  // clear all inputs + raw datasets agar nilai lama tidak muncul kembali saat fokus
  inputs.forEach(i=>{
    i.value = '';
    if (i.dataset) i.dataset.raw = '';
  });
  computeAll();
  // bersihkan penyimpanan lokal
  try{
    localStorage.removeItem('calc_state');
  }catch{}
});

// NOTE: initialization (computeAll + autofocus) is deferred until splash finishes
// to avoid focus/compute while splash is visible. startApp() will be called by
// the splash finish routine.

// formatter ribuan Indonesia
const numFormatter = new Intl.NumberFormat('id-ID');

// formatter input: simpan angka mentah saat mengetik, format ribuan saat blur
function attachNumberFormatter(inputEl) {
  const sanitizeToNumericString = (value) => {
    const hasMinus = value.trim().startsWith('-');
    const digits = value.replace(/[^0-9]/g, '');
    return hasMinus ? ('-' + digits) : digits;
  };

  // init dataset.raw jika ada nilai awal
  if (!inputEl.dataset.raw && inputEl.value) {
    const initClean = sanitizeToNumericString(inputEl.value);
    inputEl.dataset.raw = initClean;
  }

  // saat mengetik: hanya simpan nilai mentah (tanpa pemisah)
  inputEl.addEventListener('input', () => {
    const clean = sanitizeToNumericString(inputEl.value);
    inputEl.dataset.raw = clean;
  });

  // saat fokus: tampilkan angka mentah agar mudah mengedit
  inputEl.addEventListener('focus', () => {
    const raw = inputEl.dataset.raw || '';
    inputEl.value = raw;
    requestAnimationFrame(() => {
      inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
    });
  });

  // saat blur: tampilkan dengan pemisah ribuan
  inputEl.addEventListener('blur', () => {
    const raw = inputEl.dataset.raw;
    if (raw === undefined || raw === '') {
      inputEl.value = '';
      return;
    }
    const num = Number(raw);
    if (Number.isFinite(num)) {
      inputEl.value = numFormatter.format(num);
    } else {
      inputEl.value = '';
      inputEl.dataset.raw = '';
    }
  });
}

// ambil semua input angka
document.querySelectorAll('input[type="number"], input.input-inline')
  .forEach(el => {
    // ganti jadi text agar bisa menampilkan pemisah ribuan saat blur
    el.setAttribute('type', 'text');
    // --- NEW: prefer numeric keyboard on Android ---
    el.setAttribute('inputmode', 'numeric');
    el.setAttribute('pattern', '[0-9]*');
    // --- end new ---
    attachNumberFormatter(el);
    // format awal jika ada nilai
    const n = parseNum(el);
    if (n !== null) {
      el.value = numFormatter.format(n);
    }
  });

/* ====== Persistence (theme & inputs) ====== */
function saveState(){
  try{
    const state = {
      values: inputs.map(el=> el.dataset?.raw ?? ''),
      theme: (document.documentElement.getAttribute('data-theme') === 'amoled' ? 'dark' : (document.documentElement.getAttribute('data-theme') || 'light'))
    };
    localStorage.setItem('calc_state', JSON.stringify(state));
  }catch{}
}

function restoreState(){
  try{
    const raw = localStorage.getItem('calc_state');
    if (!raw) return;
    const state = JSON.parse(raw);
    if (Array.isArray(state.values)){
      inputs.forEach((el, i)=>{
        const v = state.values[i] ?? '';
        el.dataset.raw = v;
        el.value = v;
      });
      computeAll();
      // format ulang sesuai blur agar tampil rapi
      inputs.forEach(el=> el.dispatchEvent(new Event('blur')));
    }
    if (state.theme){
      const theme = state.theme === 'amoled' ? 'dark' : state.theme;
      document.documentElement.setAttribute('data-theme', theme);
      if (btnTheme){
        btnTheme.textContent = theme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
      }
      const meta = document.getElementById('meta-theme-color');
      if (meta){
        const styles = getComputedStyle(document.documentElement);
        meta.setAttribute('content', styles.getPropertyValue('--bg').trim());
      }
    }
  }catch{}
}

// simpan saat input berubah (debounced compute sudah ada)
inputs.forEach(inp=>{
  inp.addEventListener('input', ()=>{
    saveState();
  });
  inp.addEventListener('blur', ()=>{
    saveState();
  });
});

// Theme toggle
if (btnTheme){
  btnTheme.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    // add a classy fade by toggling a class for a short time (optional)
    document.documentElement.classList.add('theming');
    document.documentElement.setAttribute('data-theme', next);
    if (btnTheme){
      btnTheme.textContent = next === 'dark' ? 'Mode Terang' : 'Mode Gelap';
    }
    try{ localStorage.setItem('last_theme', next); }catch{}
    const meta = document.getElementById('meta-theme-color');
    if (meta){
      const styles = getComputedStyle(document.documentElement);
      meta.setAttribute('content', styles.getPropertyValue('--bg').trim());
    }
    saveState();
    setTimeout(()=> document.documentElement.classList.remove('theming'), 350);
  });
}

// pulihkan saat load
restoreState();
// sinkronkan label tema & warna status bar saat awal
if (btnTheme){
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  btnTheme.textContent = cur === 'dark' ? 'Mode Terang' : 'Mode Gelap';
}
const __meta = document.getElementById('meta-theme-color');
if (__meta){
  const styles = getComputedStyle(document.documentElement);
  __meta.setAttribute('content', styles.getPropertyValue('--bg').trim());
}

// Determine theme on load with priority:
// 1) last_theme (explicit toggle)
// 2) saved calc_state.theme (restoreState already applies it)
// 3) fallback default: dark
try{
  const last = localStorage.getItem('last_theme');
  if (last){
    document.documentElement.setAttribute('data-theme', last);
  } else if (!document.documentElement.getAttribute('data-theme')){
    // restoreState may have applied theme; if not, default to dark
    document.documentElement.setAttribute('data-theme','dark');
  }
  if (btnTheme){
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    btnTheme.textContent = cur === 'dark' ? 'Mode Terang' : 'Mode Gelap';
  }
  const meta = document.getElementById('meta-theme-color');
  if (meta){
    const styles = getComputedStyle(document.documentElement);
    meta.setAttribute('content', styles.getPropertyValue('--bg').trim());
  }
}catch{}

// tombol simpan eksplisit
// autosave sudah aktif via input/blur listeners di bawah

// Splash screen animation
function initSplash() {
  const splash = document.getElementById('splash');
  const text = splash.textContent;
  splash.textContent = '';
  
  // Create letter container
  const letters = document.createElement('div');
  letters.className = 'splash-letters';
  
  // Create scanning effect element
  const scan = document.createElement('div');
  scan.className = 'splash-scan';
  letters.appendChild(scan);
  
  // Split text into characters
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'splash-char';
    span.textContent = char;
    letters.appendChild(span);
  });
  
  splash.appendChild(letters);
  
  // Animate letters appearing
  let delay = 0;
  document.querySelectorAll('.splash-char').forEach((char) => {
    setTimeout(() => {
      char.style.opacity = '1';
      char.style.transform = 'translateY(0)';
    }, delay);
    delay += 120;
  });
  
  // Start scanning effect after letters appear
  setTimeout(() => {
    // Add scanning animation
    scan.style.animation = 'scanningEffect 2s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    
    // Add glitch effect to letters during scan
    const letters = document.querySelectorAll('.splash-char');
    letters.forEach((letter, index) => {
      setTimeout(() => {
        letter.style.animation = 'glitchEffect 0.3s ease-in-out';
        
        // Add glow effect during scan
        letter.style.textShadow = '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4)';
        
        // Remove effects after scan passes
        setTimeout(() => {
          letter.style.animation = '';
          letter.style.textShadow = '';
        }, 400);
      }, index * 50 + 800); // Stagger the glitch effect
    });
    
    // Hide splash after scan completes with a fade out effect
    setTimeout(() => {
      splash.style.opacity = '0';
      splash.style.transform = 'scale(1.05)';
      setTimeout(() => {
        splash.remove();
        startApp();
      }, 400);
    }, 2500);
  }, delay + 500);
}

// Initialize splash on load
document.addEventListener('DOMContentLoaded', initSplash);

// startApp: perform initial compute and focus after splash is gone
function startApp(){
  // avoid running twice
  if (window.__app_started) return;
  window.__app_started = true;
  try{ computeAll(); }catch{}
  // autofocus kolom pertama
  try{ if (inputs[0]) inputs[0].focus(); }catch{}
}

// allow user to skip splash. persist flag: 'skip_splash'
function finishSplashImmediately(persist){
  const splash = document.getElementById('splash');
  if (!splash) return;
  // remove any running animations and go to final state once
  splash.classList.remove('animate');
  splash.classList.add('hide');
  try{ splash.remove(); }catch{}
  document.documentElement.classList.remove('splash-active');
  document.body.classList.remove('splash-active');
  document.documentElement.classList.add('splash-ending');
  document.body.classList.add('splash-ending');
  setTimeout(()=>{
    document.documentElement.classList.remove('splash-ending');
    document.body.classList.remove('splash-ending');
    startApp();
  }, 320);
  if (persist){ try{ localStorage.setItem('skip_splash','1'); }catch{} }
}

// users can click the splash to skip once, or Shift+click to persist
document.addEventListener('click', (e)=>{
  const splash = document.getElementById('splash');
  if (!splash) return;
  if (e.target === splash || splash.contains(e.target)){
    finishSplashImmediately(e.shiftKey === true);
  }
});

// auto-skip if user previously opted in
try{
  if (localStorage.getItem('skip_splash')){
    // remove splash synchronously if present
    const s = document.getElementById('splash');
    if (s) finishSplashImmediately(false);
    else startApp();
  }
}catch{}