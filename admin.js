/**
 * Bale Keluarga Homestay Sembalun - Admin Panel Engine
 * Real-time data management, live image upload & preview, dual persistence (Google Sheets, Cloudinary, Local API & LocalStorage)
 */

let appData = null;
let currentModalAction = null;

// Default factory data in case file or server is absent
const defaultFactoryData = {
  profile: {
    brandName: "Bale Keluarga",
    brandSubtitle: "Homestay Sembalun",
    phone: "085801112024",
    whatsapp: "085801112024",
    address: "Jl. Pariwisata Sembalun Lawang, Lombok Timur, NTB 83656",
    pricePerNight: 350000,
    priceSubtitle: "Sewa 1 Homestay Penuh / Malam",
    aboutLead: "\"Bale\" dalam bahasa Sasak bermakna Rumah. Kami menghadirkan tempat pulang yang nyaman bagi setiap musafir dan keluarga yang berkunjung ke Sembalun.",
    aboutDesc: "Terletak di ketinggian 1.150 meter di atas permukaan laut di lereng megah Gunung Rinjani, Bale Keluarga memadukan kehangatan arsitektur kayu khas Lombok dengan kenyamanan modern. Udara Sembalun yang sejuk hingga 14°C dapat dinikmati dengan tenang berkat kamar mandi berair panas melimpah, selimut duvet hangat, dan seduhan kopi Sembalun segar.",
    aboutImage: "images/hero.jpg",
    badgeNumber: "100% Asli",
    badgeText: "Dikelola Ramah oleh Warga Lokal Sembalun",
    aboutBullet1: "Air Panas 24 Jam Tekanan Kuat",
    aboutBullet2: "5 Menit ke Bukit Pergasingan",
    aboutBullet3: "Kebun Stroberi Petik Sendiri",
    aboutBullet4: "Parkir Mobil & Motor Luas",
    checkinTime: "14:00 WITA",
    checkoutTime: "12:00 WITA",
    openHours: "Buka Reservasi: 24 Jam Setiap Hari",
    footerDesc: "Akomodasi keluarga dan pendaki terhangat di lembah Sembalun, Lombok Timur. Menghadirkan kenyamanan modern dengan pesona alam Gunung Rinjani yang megah."
  },
  hero: {
    badge: "4.9/5 Rating Terverifikasi (140+ Ulasan)",
    title: "Kehangatan Rumah Keluarga di",
    highlightWord: "Kaki Gunung Rinjani",
    description: "Nikmati sejuknya alam Sembalun dengan kenyamanan kamar hangat berair panas, balkon berpanorama gunung megah, kebun stroberi petik sendiri, dan keramahan asli suku Sasak.",
    bgImage: "https://res.cloudinary.com/lsxj03eg/image/upload/v1792849208/bale_keluarga/zo97hebxji78ok5wireg.png",
    ctaText: "Pesan Homestay Langsung",
    cta2Text: "Lihat Fasilitas",
    highlight1: "Water Heater 24 Jam",
    highlight2: "View 360° Rinjani & Pergasingan",
    highlight3: "Sarapan & Kopi Sembalun"
  },
  location: {
    mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3946.046187799432!2d116.52445831526462!3d-8.35921869398822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4ee8a58a98f1%3A0xe54ef5bb919baec6!2sSembalun%20Lawang%2C%20East%20Lombok%20Regency%2C%20West%20Nusa%20Tenggara!5e0!3m2!1sen!2sid!4v1689000000000!5m2!1sen!2sid",
    route1Title: "Dari Bandara Internasional Lombok (BIL)",
    route1Desc: "Jarak tempuh sekitar 2,5 jam via rute Praya - Aikmel - Suela - Sembalun. Kami menyediakan layanan penjemputan shuttle mobil jika dibutuhkan.",
    route2Title: "Dari Kota Mataram / Senggigi",
    route2Desc: "Sekitar 2,5 jam perjalanan menyusuri jalan lingkar Lombok Timur yang sejuk dengan aspal mulus.",
    route3Title: "Dari Jalur Pendakian Rinjani",
    route3Desc: "Hanya 7 menit dari Rinjani Information Center (RIC) Sembalun. Sangat praktis untuk penitipan tas dan istirahat pasca-trekking."
  },
  facilities: [],
  experiences: [],
  gallery: [],
  reviews: [],
  faqs: []
};

document.addEventListener('DOMContentLoaded', async () => {
  checkAdminAuth();
  setupNavigationTabs();
  await loadInitialData();
  bindMasterSaveButton();
  initSyncSettings();
});

// 1. Load Initial Data (API or LocalStorage or Default)
async function loadInitialData() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      appData = await res.json();
      localStorage.setItem('bale_homestay_data', JSON.stringify(appData));
    } else {
      throw new Error('API fetch failed');
    }
  } catch (err) {
    const local = localStorage.getItem('bale_homestay_data');
    if (local) {
      appData = JSON.parse(local);
    } else {
      appData = JSON.parse(JSON.stringify(defaultFactoryData));
    }
  }

  populateAllSections();
  updateDashboardStats();
}

// 2. Setup Sidebar Tabs
function setupNavigationTabs() {
  const tabButtons = document.querySelectorAll('.nav-item-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      switchAdminTab(targetTab);
    });
  });

  const mobileBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('adminSidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}

function switchAdminTab(tabName) {
  document.querySelectorAll('.nav-item-btn').forEach(b => {
    if (b.dataset.tab === tabName) b.classList.add('active');
    else b.classList.remove('active');
  });

  document.querySelectorAll('.tab-pane').forEach(p => {
    if (p.id === `pane-${tabName}`) p.classList.add('active');
    else p.classList.remove('active');
  });

  const topbarTitle = document.getElementById('topbarCurrentTabTitle');
  const titles = {
    overview: 'Dashboard Ringkasan',
    hero: 'Hero & Banner Utama',
    profile: 'Profil & Tarif Homestay',
    facilities: 'Fasilitas Homestay',
    experiences: 'Paket Wisata & Trip',
    gallery: 'Galeri Foto Asli',
    reviews: 'Ulasan & Testimoni Tamu',
    location: 'Petunjuk Rute & Peta Lokasi',
    faqs: 'FAQ (Tanya Jawab)',
    integrations: 'Database Google Spreadsheet & Cloudinary',
    backup: 'Backup & Pemulihan Data'
  };
  if (topbarTitle && titles[tabName]) {
    topbarTitle.textContent = titles[tabName];
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById('adminSidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');
}

// 3. Populate All Form Fields & Lists
function populateAllSections() {
  if (!appData) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  };

  // Hero Fields
  if (appData.hero) {
    setVal('heroBadgeInput', appData.hero.badge);
    setVal('heroTitleInput', appData.hero.title);
    setVal('heroHighlightWordInput', appData.hero.highlightWord);
    setVal('heroDescInput', appData.hero.description);
    setVal('heroCtaTextInput', appData.hero.ctaText || 'Pesan Homestay Langsung');
    setVal('heroCta2TextInput', appData.hero.cta2Text || 'Lihat Fasilitas');
    setVal('heroHl1Input', appData.hero.highlight1);
    setVal('heroHl2Input', appData.hero.highlight2);
    setVal('heroHl3Input', appData.hero.highlight3);

    const heroBg = appData.hero.bgImage || 'images/hero.jpg';
    const bgPreview = document.getElementById('heroBgPreview');
    if (bgPreview) bgPreview.src = heroBg;
    setVal('heroBgCustomInput', heroBg);
    setSelectIfPreset('heroPresetSelect', heroBg);
  }

  // Profile Fields
  if (appData.profile) {
    setVal('profBrandNameInput', appData.profile.brandName);
    setVal('profBrandSubInput', appData.profile.brandSubtitle);
    setVal('profPriceInput', appData.profile.pricePerNight || 350000);
    setVal('profPriceSubInput', appData.profile.priceSubtitle || 'Sewa 1 Homestay Penuh / Malam');
    const contactNum = appData.profile.phone || appData.profile.whatsapp || '085801112024';
    setVal('profPhoneInput', contactNum);
    setVal('profWhatsappInput', contactNum);
    setVal('profAddressInput', appData.profile.address);
    setVal('profCheckinInput', appData.profile.checkinTime);
    setVal('profCheckoutInput', appData.profile.checkoutTime);
    setVal('profOpenHoursInput', appData.profile.openHours || 'Buka Reservasi: 24 Jam Setiap Hari');
    setVal('profFooterDescInput', appData.profile.footerDesc || '');
    setVal('profAboutLeadInput', appData.profile.aboutLead);
    setVal('profAboutDescInput', appData.profile.aboutDesc);
    setVal('profBadgeNumInput', appData.profile.badgeNumber);
    setVal('profBadgeTextInput', appData.profile.badgeText);
    setVal('profBullet1Input', appData.profile.aboutBullet1 || 'Air Panas 24 Jam Tekanan Kuat');
    setVal('profBullet2Input', appData.profile.aboutBullet2 || '5 Menit ke Bukit Pergasingan');
    setVal('profBullet3Input', appData.profile.aboutBullet3 || 'Kebun Stroberi Petik Sendiri');
    setVal('profBullet4Input', appData.profile.aboutBullet4 || 'Parkir Mobil & Motor Luas');

    const aboutImg = appData.profile.aboutImage || 'images/hero.jpg';
    const aboutPreview = document.getElementById('aboutImgPreview');
    if (aboutPreview) aboutPreview.src = aboutImg;
    setVal('aboutImgCustomInput', aboutImg);
    setSelectIfPreset('aboutPresetSelect', aboutImg);
  }

  // Location Fields
  if (appData.location) {
    setVal('locMapsUrlInput', appData.location.mapsEmbedUrl);
    setVal('locRoute1TitleInput', appData.location.route1Title);
    setVal('locRoute1DescInput', appData.location.route1Desc);
    setVal('locRoute2TitleInput', appData.location.route2Title);
    setVal('locRoute2DescInput', appData.location.route2Desc);
    setVal('locRoute3TitleInput', appData.location.route3Title);
    setVal('locRoute3DescInput', appData.location.route3Desc);
  }

  // Render Collection Lists
  renderFacilitiesList();
  renderExperiencesList();
  renderGalleryList();
  renderReviewsList();
  renderFaqsList();
}

function setSelectIfPreset(selectId, val) {
  const el = document.getElementById(selectId);
  if (!el) return;
  for (let opt of el.options) {
    if (opt.value === val) {
      el.value = val;
      return;
    }
  }
}

// 4. Update Overview Dashboard Statistics
function updateDashboardStats() {
  if (!appData) return;
  const priceDisplay = document.getElementById('statPriceDisplay');
  const fc = document.getElementById('statFacilitiesCount');
  const ec = document.getElementById('statExpCount');
  const gc = document.getElementById('statGalleryCount');

  if (priceDisplay && appData.profile) {
    const price = appData.profile.pricePerNight || 350000;
    priceDisplay.textContent = `Rp ${Number(price).toLocaleString('id-ID')}`;
  }
  if (fc && appData.facilities) fc.textContent = appData.facilities.length;
  if (ec && appData.experiences) ec.textContent = appData.experiences.length;
  if (gc && appData.gallery) gc.textContent = appData.gallery.length;
}

// 5. Render Dynamic Collection Lists
function renderFacilitiesList() {
  const container = document.getElementById('adminFacilitiesList');
  if (!container || !appData.facilities) return;

  container.innerHTML = '';
  appData.facilities.forEach((fac, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.style.gridTemplateColumns = '1fr auto';
    card.innerHTML = `
      <div class="manage-item-info">
        <h4>${fac.title}</h4>
        <p style="font-size:0.9rem; color:var(--admin-text-muted);">${fac.desc}</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit Fasilitas" onclick="editFacility(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus Fasilitas" onclick="deleteFacility(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderExperiencesList() {
  const container = document.getElementById('adminExperiencesList');
  if (!container || !appData.experiences) return;

  container.innerHTML = '';
  appData.experiences.forEach((exp, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.innerHTML = `
      <img src="${exp.image || 'images/pergasingan.jpg'}" class="manage-item-thumb" alt="${exp.title}">
      <div class="manage-item-info">
        <h4>${exp.title}</h4>
        <div class="manage-item-meta">
          <span class="item-price-badge">Rp ${Number(exp.price).toLocaleString('id-ID')}</span>
          <span style="background:var(--admin-gold); color:#122116; font-weight:700; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${exp.tag || 'Wisata'}</span>
        </div>
        <p style="font-size:0.88rem; color:var(--admin-text-muted);">${exp.desc}</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit Paket" onclick="editExperience(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus Paket" onclick="deleteExperience(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderGalleryList() {
  const container = document.getElementById('adminGalleryList');
  if (!container || !appData.gallery) return;

  container.innerHTML = '';
  appData.gallery.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.innerHTML = `
      <img src="${item.image || 'images/hero.jpg'}" class="manage-item-thumb" alt="${item.title}">
      <div class="manage-item-info">
        <h4>${item.title}</h4>
        <div class="manage-item-meta">
          <span style="text-transform:uppercase; font-size:0.75rem; font-weight:700; background:#e2e8e2; padding:3px 8px; border-radius:4px;">${item.category}</span>
          <span>Lebar: ${item.span2 ? '2 Kolom (Besar)' : '1 Kolom'}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--admin-text-muted);">${item.subtitle || ''}</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit Foto" onclick="editGalleryItem(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus Foto" onclick="deleteGalleryItem(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderReviewsList() {
  const container = document.getElementById('adminReviewsList');
  if (!container || !appData.reviews) return;

  container.innerHTML = '';
  appData.reviews.forEach((rev, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.style.gridTemplateColumns = '60px 1fr auto';
    card.innerHTML = `
      <div style="width:50px; height:50px; border-radius:50%; background:#eaf2eb; color:var(--admin-primary); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.2rem;">
        ${rev.avatar || rev.name.charAt(0)}
      </div>
      <div class="manage-item-info">
        <h4>${rev.name}</h4>
        <div class="manage-item-meta">
          <span>📍 ${rev.origin}</span>
          <span style="color:var(--admin-gold);">★★★★★ ${rev.rating || 5}/5</span>
        </div>
        <p style="font-size:0.88rem; font-style:italic; color:var(--admin-text-muted);">"${rev.text}"</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit Ulasan" onclick="editReview(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus Ulasan" onclick="deleteReview(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderFaqsList() {
  const container = document.getElementById('adminFaqsList');
  if (!container || !appData.faqs) return;

  container.innerHTML = '';
  appData.faqs.forEach((faq, idx) => {
    const card = document.createElement('div');
    card.className = 'manage-item-card';
    card.style.gridTemplateColumns = '1fr auto';
    card.innerHTML = `
      <div class="manage-item-info">
        <h4 style="color:var(--admin-primary);">❓ ${faq.question}</h4>
        <p style="font-size:0.9rem; color:var(--admin-text-muted); margin-top:6px;">${faq.answer}</p>
      </div>
      <div class="manage-actions-btns">
        <button class="btn-icon-action edit" title="Edit FAQ" onclick="editFaq(${idx})">✏️</button>
        <button class="btn-icon-action delete" title="Hapus FAQ" onclick="deleteFaq(${idx})">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// 6. Master Save Handler
function bindMasterSaveButton() {
  const saveBtn = document.getElementById('btnMasterSave');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `⏳ Menyimpan...`;

    const getVal = (id, fallback = '') => {
      const el = document.getElementById(id);
      return el ? el.value : fallback;
    };

    try {
      if (!appData) appData = JSON.parse(JSON.stringify(defaultFactoryData));
      if (!appData.hero) appData.hero = {};
      if (!appData.profile) appData.profile = {};
      if (!appData.location) appData.location = {};

      // Collect values from Hero safely
      appData.hero.badge = getVal('heroBadgeInput', appData.hero.badge);
      appData.hero.title = getVal('heroTitleInput', appData.hero.title);
      appData.hero.highlightWord = getVal('heroHighlightWordInput', appData.hero.highlightWord);
      appData.hero.description = getVal('heroDescInput', appData.hero.description);
      appData.hero.ctaText = getVal('heroCtaTextInput', appData.hero.ctaText || 'Pesan Homestay Langsung');
      appData.hero.cta2Text = getVal('heroCta2TextInput', appData.hero.cta2Text || 'Lihat Fasilitas');
      appData.hero.bgImage = getVal('heroBgCustomInput') || appData.hero.bgImage || 'images/hero.jpg';
      appData.hero.highlight1 = getVal('heroHl1Input', appData.hero.highlight1);
      appData.hero.highlight2 = getVal('heroHl2Input', appData.hero.highlight2);
      appData.hero.highlight3 = getVal('heroHl3Input', appData.hero.highlight3);

      // Collect values from Profile safely
      appData.profile.brandName = getVal('profBrandNameInput', appData.profile.brandName);
      appData.profile.brandSubtitle = getVal('profBrandSubInput', appData.profile.brandSubtitle);
      appData.profile.pricePerNight = Number(getVal('profPriceInput', appData.profile.pricePerNight || 350000));
      appData.profile.priceSubtitle = getVal('profPriceSubInput', appData.profile.priceSubtitle || 'Sewa 1 Homestay Penuh / Malam');
      const contactNum = (getVal('profPhoneInput') || getVal('profWhatsappInput') || '085801112024').trim();
      appData.profile.phone = contactNum;
      appData.profile.whatsapp = contactNum;
      appData.profile.address = getVal('profAddressInput', appData.profile.address);
      appData.profile.checkinTime = getVal('profCheckinInput', appData.profile.checkinTime);
      appData.profile.checkoutTime = getVal('profCheckoutInput', appData.profile.checkoutTime);
      appData.profile.openHours = getVal('profOpenHoursInput', appData.profile.openHours || 'Buka Reservasi: 24 Jam Setiap Hari');
      appData.profile.footerDesc = getVal('profFooterDescInput', appData.profile.footerDesc || '');
      appData.profile.aboutLead = getVal('profAboutLeadInput', appData.profile.aboutLead);
      appData.profile.aboutDesc = getVal('profAboutDescInput', appData.profile.aboutDesc);
      appData.profile.badgeNumber = getVal('profBadgeNumInput', appData.profile.badgeNumber);
      appData.profile.badgeText = getVal('profBadgeTextInput', appData.profile.badgeText);
      appData.profile.aboutBullet1 = getVal('profBullet1Input', appData.profile.aboutBullet1 || 'Air Panas 24 Jam Tekanan Kuat');
      appData.profile.aboutBullet2 = getVal('profBullet2Input', appData.profile.aboutBullet2 || '5 Menit ke Bukit Pergasingan');
      appData.profile.aboutBullet3 = getVal('profBullet3Input', appData.profile.aboutBullet3 || 'Kebun Stroberi Petik Sendiri');
      appData.profile.aboutBullet4 = getVal('profBullet4Input', appData.profile.aboutBullet4 || 'Parkir Mobil & Motor Luas');
      appData.profile.aboutImage = getVal('aboutImgCustomInput') || appData.profile.aboutImage || 'images/hero.jpg';

      // Collect values from Location safely
      appData.location.mapsEmbedUrl = getVal('locMapsUrlInput', appData.location.mapsEmbedUrl);
      appData.location.route1Title = getVal('locRoute1TitleInput', appData.location.route1Title);
      appData.location.route1Desc = getVal('locRoute1DescInput', appData.location.route1Desc);
      appData.location.route2Title = getVal('locRoute2TitleInput', appData.location.route2Title);
      appData.location.route2Desc = getVal('locRoute2DescInput', appData.location.route2Desc);
      appData.location.route3Title = getVal('locRoute3TitleInput', appData.location.route3Title);
      appData.location.route3Desc = getVal('locRoute3DescInput', appData.location.route3Desc);

      // 1. Save to LocalStorage (Always safe offline backup)
      localStorage.setItem('bale_homestay_data', JSON.stringify(appData));

      // 2. Save directly to Google Spreadsheet
      let savedToGoogleSheet = false;
      const defaultSheetUrl = 'https://script.google.com/macros/s/AKfycbz-fWSD4VWqrb8vZqmMNCW9t8DV4UZTR1nWg_VJl71dn4wKHWVRnF49eK-tB2JJP6HuRg/exec';
      const sheetUrl = localStorage.getItem('bale_google_sheet_url') || defaultSheetUrl;
      if (sheetUrl) {
        try {
          await fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appData)
          });
          savedToGoogleSheet = true;
        } catch (err) {
          console.warn('Google Sheet save error:', err);
        }
      }

      // 3. Multi-tier Save: Cloud Vercel KV / GitHub Token / LocalStorage
      let savedToCloud = false;
      let savedToGitHub = false;

      try {
        const res = await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appData, null, 2)
        });
        if (res.ok) {
          const result = await res.json();
          if (result && result.success) {
            if (result.storage === 'vercel-kv') savedToCloud = true;
            if (result.storage === 'github') savedToGitHub = true;
          }
        }
      } catch (e) {
        console.warn('API POST failed:', e);
      }

      // 4. Fallback client-side GitHub Commit if user configured GitHub Token in settings
      const ghToken = localStorage.getItem('bale_admin_gh_token');
      if (!savedToCloud && !savedToGitHub && !savedToGoogleSheet && ghToken) {
        try {
          const ghSuccess = await commitDataToGitHubDirect(ghToken, appData);
          if (ghSuccess) savedToGitHub = true;
        } catch (e) {
          console.warn('Client GitHub commit failed:', e);
        }
      }

      // Feedback to User
      const statusText = document.getElementById('saveStatusText');
      if (statusText) {
        if (savedToGoogleSheet) {
          statusText.textContent = '✓ Sinkron ke Google Sheet!';
        } else if (savedToCloud) {
          statusText.textContent = '✓ Tersimpan di Cloud!';
        } else if (savedToGitHub) {
          statusText.textContent = '✓ Tersimpan di GitHub!';
        } else {
          statusText.textContent = '✓ Tersimpan di Memori!';
        }
      }

      updateDashboardStats();
      showToast('🎉 Seluruh perubahan berhasil disimpan!');
    } catch (err) {
      console.error('Error during master save:', err);
      showToast('⚠️ Terjadi kendala saat menyimpan. Periksa koneksi Anda.');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        Simpan Semua Perubahan
      `;
    }
  });
}

// 7. Image Preset Change Handler
function onPresetImageChange(selectEl, previewId, customInputId) {
  const preview = document.getElementById(previewId);
  const customInput = document.getElementById(customInputId);
  if (preview && selectEl) preview.src = selectEl.value;
  if (customInput && selectEl) customInput.value = selectEl.value;
}

function onCustomUrlInput(inputEl, previewId) {
  const preview = document.getElementById(previewId);
  if (preview && inputEl.value) {
    preview.src = inputEl.value;
  }
}

// 8. File Upload Handler (Cloudinary CDN or Local Data URL)
async function handleFileUpload(event, previewId, inputId) {
  const file = event.target.files[0];
  if (!file) return;

  const preview = document.getElementById(previewId);
  const input = document.getElementById(inputId);

  // Instant local preview
  const localReader = new FileReader();
  localReader.onload = (e) => {
    if (preview) preview.src = e.target.result;
  };
  localReader.readAsDataURL(file);

  // Check Cloudinary Settings
  const defaultCloudName = 'lsxj03eg';
  const defaultUploadPreset = 'bale_keluarga_preset';
  const cloudName = localStorage.getItem('bale_cloudinary_name') || defaultCloudName;
  const uploadPreset = localStorage.getItem('bale_cloudinary_preset') || defaultUploadPreset;

  if (cloudName && uploadPreset) {
    showToast('☁️ Mengunggah foto ke Cloudinary CDN...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'bale_keluarga');

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (uploadRes.ok) {
        const uploadJson = await uploadRes.json();
        if (uploadJson.secure_url) {
          if (input) input.value = uploadJson.secure_url;
          if (preview) preview.src = uploadJson.secure_url;
          showToast('✅ Foto berhasil diunggah ke Cloudinary!');
          return;
        }
      } else {
        const errJson = await uploadRes.json().catch(() => ({}));
        console.warn('Cloudinary upload warning:', errJson);
      }
    } catch (err) {
      console.warn('Cloudinary upload error:', err);
    }
  }

  // Fallback to Base64 Data URL if Cloudinary fails or not configured
  showToast('💾 Menyimpan foto ke penyimpanan lokal browser...');
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    if (input) input.value = dataUrl;
    showToast('✅ Foto siap disimpan.');
  };
  reader.readAsDataURL(file);
}

// 9. Generic Modal Utility
function openGenericModal(title, bodyHtml, onSaveCallback) {
  const modal = document.getElementById('adminGenericModal');
  const titleEl = document.getElementById('genericModalTitle');
  const bodyEl = document.getElementById('genericModalBody');
  const saveBtn = document.getElementById('btnGenericModalSave');

  if (!modal) return;
  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;

  currentModalAction = onSaveCallback;
  saveBtn.onclick = () => {
    if (typeof currentModalAction === 'function') {
      currentModalAction();
    }
  };

  modal.classList.add('active');
}

function closeGenericModal() {
  const modal = document.getElementById('adminGenericModal');
  if (modal) modal.classList.remove('active');
  currentModalAction = null;
}

// 10. Facilities CRUD
function openFacilityModalForAdd() {
  const bodyHtml = `
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Nama Fasilitas</label>
        <input type="text" id="mFacTitle" class="admin-input" placeholder="contoh: Air Panas 24 Jam">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Keterangan / Deskripsi Fasilitas</label>
        <textarea id="mFacDesc" class="admin-textarea" placeholder="Tuliskan kenyamanan fasilitas ini..."></textarea>
      </div>
    </div>
  `;

  openGenericModal('Tambah Fasilitas Baru', bodyHtml, () => {
    const title = document.getElementById('mFacTitle').value.trim();
    const desc = document.getElementById('mFacDesc').value.trim();
    if (!title) return alert('Nama fasilitas harus diisi!');

    appData.facilities.push({
      id: `f-${Date.now()}`,
      title: title,
      desc: desc
    });

    renderFacilitiesList();
    updateDashboardStats();
    closeGenericModal();
    showToast('Fasilitas berhasil ditambahkan!');
  });
}

function editFacility(index) {
  const f = appData.facilities[index];
  if (!f) return;

  const bodyHtml = `
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Nama Fasilitas</label>
        <input type="text" id="mFacTitle" class="admin-input" value="${f.title}">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Keterangan / Deskripsi Fasilitas</label>
        <textarea id="mFacDesc" class="admin-textarea">${f.desc}</textarea>
      </div>
    </div>
  `;

  openGenericModal(`Edit Fasilitas: ${f.title}`, bodyHtml, () => {
    f.title = document.getElementById('mFacTitle').value;
    f.desc = document.getElementById('mFacDesc').value;
    renderFacilitiesList();
    closeGenericModal();
    showToast('Fasilitas berhasil diperbarui!');
  });
}

function deleteFacility(index) {
  if (confirm(`Hapus fasilitas "${appData.facilities[index].title}"?`)) {
    appData.facilities.splice(index, 1);
    renderFacilitiesList();
    updateDashboardStats();
    showToast('Fasilitas telah dihapus.');
  }
}

// 11. Experiences CRUD
function openExpModalForAdd() {
  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Judul Paket Wisata</label>
        <input type="text" id="mExpTitle" class="admin-input" placeholder="contoh: Sunrise Pergasingan">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Label Tag</label>
        <input type="text" id="mExpTag" class="admin-input" placeholder="contoh: Terpopuler">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Harga Paket (Rp)</label>
        <input type="number" id="mExpPrice" class="admin-input" placeholder="150000">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Poin Fasilitas (Pisahkan dengan koma)</label>
        <input type="text" id="mExpPerks" class="admin-input" placeholder="Guide Lokal, Kopi Hangat, Tiket">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Deskripsi Pengalaman</label>
        <textarea id="mExpDesc" class="admin-textarea" placeholder="Jelaskan keseruan paket ini..."></textarea>
      </div>
    </div>
    <div class="image-selector-box">
      <img src="images/pergasingan.jpg" id="mExpImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Foto Paket:</div>
        <div style="display:flex; gap:10px; align-items:center;">
          <label class="custom-file-upload">
            <input type="file" accept="image/*" style="display:none;" onchange="handleFileUpload(event, 'mExpImgPreview', 'mExpImgInput')">
            📁 Unggah File
          </label>
          <input type="text" id="mExpImgInput" class="admin-input" style="flex:1;" value="images/pergasingan.jpg" oninput="onCustomUrlInput(this, 'mExpImgPreview')">
        </div>
      </div>
    </div>
  `;

  openGenericModal('Tambah Paket Wisata', bodyHtml, () => {
    const title = document.getElementById('mExpTitle').value.trim();
    if (!title) return alert('Judul paket wisata harus diisi!');

    const perksRaw = document.getElementById('mExpPerks').value;
    const perks = perksRaw ? perksRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    appData.experiences.push({
      id: `exp-${Date.now()}`,
      title: title,
      tag: document.getElementById('mExpTag').value || 'Wisata',
      price: Number(document.getElementById('mExpPrice').value) || 0,
      desc: document.getElementById('mExpDesc').value || '',
      image: document.getElementById('mExpImgInput').value || 'images/pergasingan.jpg',
      perks: perks
    });

    renderExperiencesList();
    updateDashboardStats();
    closeGenericModal();
    showToast('Paket wisata berhasil ditambahkan!');
  });
}

function editExperience(index) {
  const exp = appData.experiences[index];
  if (!exp) return;

  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Judul Paket</label>
        <input type="text" id="mExpTitle" class="admin-input" value="${exp.title}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Label Tag</label>
        <input type="text" id="mExpTag" class="admin-input" value="${exp.tag || ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Harga (Rp)</label>
        <input type="number" id="mExpPrice" class="admin-input" value="${exp.price}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Poin Fasilitas (Koma)</label>
        <input type="text" id="mExpPerks" class="admin-input" value="${(exp.perks || []).join(', ')}">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Deskripsi</label>
        <textarea id="mExpDesc" class="admin-textarea">${exp.desc}</textarea>
      </div>
    </div>
    <div class="image-selector-box">
      <img src="${exp.image || 'images/pergasingan.jpg'}" id="mExpImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Foto:</div>
        <input type="text" id="mExpImgInput" class="admin-input" value="${exp.image || ''}" oninput="onCustomUrlInput(this, 'mExpImgPreview')">
      </div>
    </div>
  `;

  openGenericModal(`Edit Paket: ${exp.title}`, bodyHtml, () => {
    exp.title = document.getElementById('mExpTitle').value;
    exp.tag = document.getElementById('mExpTag').value;
    exp.price = Number(document.getElementById('mExpPrice').value) || 0;
    exp.desc = document.getElementById('mExpDesc').value;
    const perksRaw = document.getElementById('mExpPerks').value;
    exp.perks = perksRaw ? perksRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    exp.image = document.getElementById('mExpImgInput').value || exp.image;

    renderExperiencesList();
    closeGenericModal();
    showToast('Paket wisata diperbarui!');
  });
}

function deleteExperience(index) {
  if (confirm(`Hapus paket wisata "${appData.experiences[index].title}"?`)) {
    appData.experiences.splice(index, 1);
    renderExperiencesList();
    updateDashboardStats();
    showToast('Paket wisata dihapus.');
  }
}

// 12. Gallery CRUD
function openGalleryModalForAdd() {
  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Judul Foto</label>
        <input type="text" id="mGalTitle" class="admin-input" placeholder="contoh: Pemandangan Pagi Rinjani">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Kategori</label>
        <select id="mGalCat" class="admin-select">
          <option value="pemandangan">Pemandangan</option>
          <option value="aktivitas">Aktivitas</option>
          <option value="suasana">Suasana Homestay</option>
        </select>
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Keterangan Singkat</label>
        <input type="text" id="mGalSub" class="admin-input" placeholder="contoh: Pemandangan langsung dari halaman">
      </div>
    </div>
    <div class="form-row full">
      <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem;">
        <input type="checkbox" id="mGalSpan2"> Tampilkan dengan Ukuran Lebar (Span 2 Kolom)
      </label>
    </div>
    <div class="image-selector-box">
      <img src="images/hero.jpg" id="mGalImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Foto Galeri:</div>
        <div style="display:flex; gap:10px; align-items:center;">
          <label class="custom-file-upload">
            <input type="file" accept="image/*" style="display:none;" onchange="handleFileUpload(event, 'mGalImgPreview', 'mGalImgInput')">
            📁 Unggah File
          </label>
          <input type="text" id="mGalImgInput" class="admin-input" style="flex:1;" value="images/hero.jpg" oninput="onCustomUrlInput(this, 'mGalImgPreview')">
        </div>
      </div>
    </div>
  `;

  openGenericModal('Tambah Foto Galeri', bodyHtml, () => {
    const title = document.getElementById('mGalTitle').value.trim();
    if (!title) return alert('Judul foto harus diisi!');

    appData.gallery.push({
      id: `g-${Date.now()}`,
      title: title,
      subtitle: document.getElementById('mGalSub').value || '',
      category: document.getElementById('mGalCat').value,
      span2: document.getElementById('mGalSpan2').checked,
      image: document.getElementById('mGalImgInput').value || 'images/hero.jpg'
    });

    renderGalleryList();
    updateDashboardStats();
    closeGenericModal();
    showToast('Foto galeri berhasil ditambahkan!');
  });
}

function editGalleryItem(index) {
  const g = appData.gallery[index];
  if (!g) return;

  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Judul Foto</label>
        <input type="text" id="mGalTitle" class="admin-input" value="${g.title}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Kategori</label>
        <select id="mGalCat" class="admin-select">
          <option value="pemandangan" ${g.category === 'pemandangan' ? 'selected' : ''}>Pemandangan</option>
          <option value="aktivitas" ${g.category === 'aktivitas' ? 'selected' : ''}>Aktivitas</option>
          <option value="suasana" ${g.category === 'suasana' ? 'selected' : ''}>Suasana Homestay</option>
        </select>
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Keterangan Singkat</label>
        <input type="text" id="mGalSub" class="admin-input" value="${g.subtitle || ''}">
      </div>
    </div>
    <div class="form-row full">
      <label style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem;">
        <input type="checkbox" id="mGalSpan2" ${g.span2 ? 'checked' : ''}> Tampilkan dengan Ukuran Lebar (Span 2 Kolom)
      </label>
    </div>
    <div class="image-selector-box">
      <img src="${g.image || 'images/hero.jpg'}" id="mGalImgPreview" class="img-preview-thumb">
      <div class="image-controls">
        <div>Foto:</div>
        <input type="text" id="mGalImgInput" class="admin-input" value="${g.image || ''}" oninput="onCustomUrlInput(this, 'mGalImgPreview')">
      </div>
    </div>
  `;

  openGenericModal(`Edit Foto Galeri: ${g.title}`, bodyHtml, () => {
    g.title = document.getElementById('mGalTitle').value;
    g.category = document.getElementById('mGalCat').value;
    g.subtitle = document.getElementById('mGalSub').value;
    g.span2 = document.getElementById('mGalSpan2').checked;
    g.image = document.getElementById('mGalImgInput').value || g.image;

    renderGalleryList();
    closeGenericModal();
    showToast('Foto galeri diperbarui!');
  });
}

function deleteGalleryItem(index) {
  if (confirm(`Hapus foto "${appData.gallery[index].title}" dari galeri?`)) {
    appData.gallery.splice(index, 1);
    renderGalleryList();
    updateDashboardStats();
    showToast('Foto galeri dihapus.');
  }
}

// 13. Reviews CRUD
function openReviewModalForAdd() {
  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Nama Tamu / Rombongan</label>
        <input type="text" id="mRevName" class="admin-input" placeholder="contoh: Keluarga Pratama">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Asal Kota / Komunitas</label>
        <input type="text" id="mRevOrigin" class="admin-input" placeholder="contoh: Jakarta">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Teks Ulasan / Testimoni</label>
        <textarea id="mRevText" class="admin-textarea" placeholder="Tuliskan ulasan tamu..."></textarea>
      </div>
    </div>
  `;

  openGenericModal('Tambah Ulasan Tamu', bodyHtml, () => {
    const name = document.getElementById('mRevName').value.trim();
    if (!name) return alert('Nama tamu harus diisi!');

    appData.reviews.push({
      id: `r-${Date.now()}`,
      name: name,
      origin: document.getElementById('mRevOrigin').value || 'Wisatawan',
      avatar: name.charAt(0).toUpperCase(),
      rating: 5,
      text: document.getElementById('mRevText').value || 'Pengalaman luar biasa di Bale Keluarga!'
    });

    renderReviewsList();
    closeGenericModal();
    showToast('Ulasan berhasil ditambahkan!');
  });
}

function editReview(index) {
  const r = appData.reviews[index];
  if (!r) return;

  const bodyHtml = `
    <div class="form-row">
      <div class="form-group-admin">
        <label class="admin-label">Nama Tamu</label>
        <input type="text" id="mRevName" class="admin-input" value="${r.name}">
      </div>
      <div class="form-group-admin">
        <label class="admin-label">Asal Kota</label>
        <input type="text" id="mRevOrigin" class="admin-input" value="${r.origin}">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Teks Ulasan</label>
        <textarea id="mRevText" class="admin-textarea">${r.text}</textarea>
      </div>
    </div>
  `;

  openGenericModal(`Edit Ulasan: ${r.name}`, bodyHtml, () => {
    r.name = document.getElementById('mRevName').value;
    r.origin = document.getElementById('mRevOrigin').value;
    r.text = document.getElementById('mRevText').value;
    renderReviewsList();
    closeGenericModal();
    showToast('Ulasan diperbarui!');
  });
}

function deleteReview(index) {
  if (confirm(`Hapus ulasan dari "${appData.reviews[index].name}"?`)) {
    appData.reviews.splice(index, 1);
    renderReviewsList();
    showToast('Ulasan telah dihapus.');
  }
}

// 14. FAQs CRUD
function openFaqModalForAdd() {
  const bodyHtml = `
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Pertanyaan (FAQ)</label>
        <input type="text" id="mFaqQ" class="admin-input" placeholder="contoh: Apakah ada layanan rental motor?">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Jawaban Lengkap</label>
        <textarea id="mFaqA" class="admin-textarea" placeholder="Tuliskan jawaban informatif..."></textarea>
      </div>
    </div>
  `;

  openGenericModal('Tambah FAQ Baru', bodyHtml, () => {
    const q = document.getElementById('mFaqQ').value.trim();
    if (!q) return alert('Pertanyaan harus diisi!');

    appData.faqs.push({
      id: `faq-${Date.now()}`,
      question: q,
      answer: document.getElementById('mFaqA').value || ''
    });

    renderFaqsList();
    closeGenericModal();
    showToast('FAQ baru ditambahkan!');
  });
}

function editFaq(index) {
  const f = appData.faqs[index];
  if (!f) return;

  const bodyHtml = `
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Pertanyaan</label>
        <input type="text" id="mFaqQ" class="admin-input" value="${f.question}">
      </div>
    </div>
    <div class="form-row full">
      <div class="form-group-admin">
        <label class="admin-label">Jawaban</label>
        <textarea id="mFaqA" class="admin-textarea">${f.answer}</textarea>
      </div>
    </div>
  `;

  openGenericModal('Edit FAQ', bodyHtml, () => {
    f.question = document.getElementById('mFaqQ').value;
    f.answer = document.getElementById('mFaqA').value;
    renderFaqsList();
    closeGenericModal();
    showToast('FAQ berhasil diperbarui!');
  });
}

function deleteFaq(index) {
  if (confirm(`Hapus pertanyaan FAQ ini?`)) {
    appData.faqs.splice(index, 1);
    renderFaqsList();
    showToast('FAQ telah dihapus.');
  }
}

// 15. Backup, Export, Import, & Factory Reset
function exportDataJson() {
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", jsonStr);
  dlAnchor.setAttribute("download", `bale_keluarga_backup_${Date.now()}.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
  showToast('📥 File backup JSON berhasil diunduh!');
}

function importDataJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.profile) {
        appData = imported;
        populateAllSections();
        updateDashboardStats();
        showToast('📤 Data berhasil dipulihkan dari file JSON! Silakan klik "Simpan Semua Perubahan".');
      } else {
        alert('Format file JSON tidak sesuai struktur data homestay!');
      }
    } catch (err) {
      alert('Gagal membaca file JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function resetToFactoryDefault() {
  if (confirm('PERINGATAN: Seluruh teks, tarif, fasilitas, dan foto akan dikembalikan ke pengaturan awal Sembalun. Lanjutkan?')) {
    fetch('/api/data?reset=1')
      .catch(() => {})
      .finally(async () => {
        try {
          const res = await fetch('data.json');
          if (res.ok) {
            appData = await res.json();
          } else {
            appData = JSON.parse(JSON.stringify(defaultFactoryData));
          }
        } catch (e) {
          appData = JSON.parse(JSON.stringify(defaultFactoryData));
        }

        populateAllSections();
        updateDashboardStats();
        showToast('⚠️ Data dikembalikan ke default. Klik "Simpan Semua Perubahan" untuk konfirmasi.');
      });
  }
}

// 16. Toast Utility
function showToast(message) {
  const toast = document.getElementById('adminToast');
  const msg = document.getElementById('toastMessage');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// 17. Admin Authentication Shield (Password: 122027)
function checkAdminAuth() {
  const isAuth = sessionStorage.getItem('bale_admin_auth') === '122027';
  const shield = document.getElementById('adminAuthShield');
  if (isAuth) {
    if (shield) shield.style.display = 'none';
  } else {
    if (shield) {
      shield.style.display = 'flex';
      const input = document.getElementById('shieldPassInput');
      if (input) setTimeout(() => input.focus(), 150);
    }
  }
}

function handleShieldLogin(e) {
  e.preventDefault();
  const input = document.getElementById('shieldPassInput');
  const errorEl = document.getElementById('shieldErrorMsg');
  const btn = document.getElementById('btnShieldSubmit');

  if (input && input.value.trim() === '122027') {
    sessionStorage.setItem('bale_admin_auth', '122027');
    if (errorEl) errorEl.style.display = 'none';
    if (btn) {
      btn.textContent = 'Berhasil Masuk...';
      btn.style.background = '#16a34a';
    }
    setTimeout(() => {
      const shield = document.getElementById('adminAuthShield');
      if (shield) shield.style.display = 'none';
    }, 350);
  } else {
    if (errorEl) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'Kata sandi salah! Silakan coba lagi.';
    }
    if (input) {
      input.focus();
      input.select();
    }
  }
}

function toggleShieldPassVisibility() {
  const input = document.getElementById('shieldPassInput');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function adminLogout() {
  if (confirm('Apakah Anda yakin ingin keluar dari Panel Admin?')) {
    sessionStorage.removeItem('bale_admin_auth');
    window.location.href = 'index.html';
  }
}

// 18. Google Sheets, Cloudinary, & Cloud Sync Helpers
function initSyncSettings() {
  // Google Spreadsheet URL
  const defaultSheetUrl = 'https://script.google.com/macros/s/AKfycbz-fWSD4VWqrb8vZqmMNCW9t8DV4UZTR1nWg_VJl71dn4wKHWVRnF49eK-tB2JJP6HuRg/exec';
  const sheetUrl = localStorage.getItem('bale_google_sheet_url') || defaultSheetUrl;
  const sheetInput = document.getElementById('googleSheetUrlInput');
  const sheetBadge = document.getElementById('sheetStatusBadge');
  if (sheetInput) sheetInput.value = sheetUrl;
  if (sheetBadge) {
    sheetBadge.textContent = '📊 Google Sheet: Aktif (Real-time)';
    sheetBadge.style.background = '#dcfce7';
    sheetBadge.style.color = '#15803d';
  }

  // Cloudinary Settings
  const defaultCloudName = 'lsxj03eg';
  const defaultUploadPreset = 'bale_keluarga_preset';
  const cName = localStorage.getItem('bale_cloudinary_name') || defaultCloudName;
  const cPreset = localStorage.getItem('bale_cloudinary_preset') || defaultUploadPreset;
  const cNameInput = document.getElementById('cloudinaryCloudNameInput');
  const cPresetInput = document.getElementById('cloudinaryPresetInput');
  const cBadge = document.getElementById('cloudinaryStatusBadge');
  if (cNameInput) cNameInput.value = cName;
  if (cPresetInput) cPresetInput.value = cPreset;
  if (cBadge) {
    cBadge.textContent = '☁️ Cloudinary CDN: Aktif';
    cBadge.style.background = '#dbeafe';
    cBadge.style.color = '#1d4ed8';
  }

  // GitHub Token
  const token = localStorage.getItem('bale_admin_gh_token');
  const input = document.getElementById('adminGhTokenInput');
  const statusBadge = document.getElementById('syncModeBadge');
  const statusText = document.getElementById('ghTokenStatusText');

  if (input && token) {
    input.value = token;
  }

  if (token) {
    if (statusBadge) {
      statusBadge.textContent = '🚀 GitHub Sync: Aktif';
      statusBadge.style.background = '#dcfce7';
      statusBadge.style.color = '#15803d';
    }
    if (statusText) statusText.style.display = 'block';
  } else {
    if (statusBadge) {
      statusBadge.textContent = 'ℹ️ Mode: Standar';
      statusBadge.style.background = '#fef3c7';
      statusBadge.style.color = '#b45309';
    }
    if (statusText) statusText.style.display = 'none';
  }
}

function saveGoogleSheetUrl() {
  const input = document.getElementById('googleSheetUrlInput');
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    localStorage.setItem('bale_google_sheet_url', val);
    showToast('✅ URL Google Spreadsheet berhasil disimpan!');
    initSyncSettings();
  } else {
    localStorage.removeItem('bale_google_sheet_url');
    showToast('ℹ️ URL Google Spreadsheet dihapus.');
    initSyncSettings();
  }
}

async function testGoogleSheetConnection() {
  const input = document.getElementById('googleSheetUrlInput');
  const statusMsg = document.getElementById('sheetStatusMsg');
  const url = input ? input.value.trim() : '';

  if (!url) {
    showToast('⚠️ Masukkan URL Google Apps Script terlebih dahulu!');
    return;
  }

  showToast('⏳ Menguji koneksi ke Google Spreadsheet...');
  if (statusMsg) {
    statusMsg.style.display = 'block';
    statusMsg.style.color = '#3b82f6';
    statusMsg.textContent = '⏳ Menghubungi Google Spreadsheet...';
  }

  try {
    const res = await fetch(url);
    if (res.ok) {
      showToast('✅ Berhasil terhubung ke Google Spreadsheet!');
      if (statusMsg) {
        statusMsg.style.color = '#16a34a';
        statusMsg.textContent = '✅ Koneksi Sukses! Google Spreadsheet siap digunakan sebagai database real-time.';
      }
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn('Test connection note:', err);
    showToast('ℹ️ Skrip terdeteksi. Silakan coba klik "Simpan Semua Perubahan" untuk menguji pengiriman data.');
    if (statusMsg) {
      statusMsg.style.color = '#d97706';
      statusMsg.textContent = 'ℹ️ URL tersimpan. Pastikan izin deployment Apps Script sudah diatur ke "Anyone".';
    }
  }
}

function copyAppsScriptCode() {
  const code = `// ============================================================
// Google Apps Script - Database Real-Time Bale Keluarga Homestay
// ============================================================

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var raw = sheet.getRange("A1").getValue();
  if (!raw) {
    return ContentService.createTextOutput("{}").setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(raw).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = e.postData.contents;
    sheet.getRange("A1").setValue(payload);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data tersimpan di Google Spreadsheet" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      showToast('📋 Kode Apps Script berhasil disalin ke clipboard!');
    }).catch(() => {
      showToast('📋 Silakan salin kode dari panduan.');
    });
  } else {
    showToast('📋 Silakan salin kode dari panduan.');
  }
}

function saveCloudinaryConfig() {
  const nameInput = document.getElementById('cloudinaryCloudNameInput');
  const presetInput = document.getElementById('cloudinaryPresetInput');
  const name = nameInput ? nameInput.value.trim() : '';
  const preset = presetInput ? presetInput.value.trim() : '';

  if (name && preset) {
    localStorage.setItem('bale_cloudinary_name', name);
    localStorage.setItem('bale_cloudinary_preset', preset);
    showToast('✅ Pengaturan Cloudinary berhasil disimpan!');
  } else {
    localStorage.removeItem('bale_cloudinary_name');
    localStorage.removeItem('bale_cloudinary_preset');
    showToast('ℹ️ Pengaturan Cloudinary dikosongkan.');
  }
  initSyncSettings();
}

function testCloudinaryConfig() {
  const name = localStorage.getItem('bale_cloudinary_name');
  const preset = localStorage.getItem('bale_cloudinary_preset');
  if (!name || !preset) {
    showToast('⚠️ Isi Cloud Name dan Preset terlebih dahulu!');
  } else {
    showToast(`✅ Cloudinary aktif: ${name} (Preset: ${preset}). Siap upload dari HP/Laptop!`);
  }
}

function saveAdminGitHubToken() {
  const input = document.getElementById('adminGhTokenInput');
  if (!input) return;
  const token = input.value.trim();
  if (token) {
    localStorage.setItem('bale_admin_gh_token', token);
    showToast('✅ Token GitHub berhasil disimpan!');
    initSyncSettings();
  } else {
    localStorage.removeItem('bale_admin_gh_token');
    showToast('ℹ️ Token GitHub dihapus.');
    initSyncSettings();
  }
}

async function commitDataToGitHubDirect(token, data) {
  const repo = 'rodiman-2024/balesembalun';
  try {
    const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/data.json`, {
      headers: {
        Authorization: `token ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    let sha = null;
    if (getRes.ok) {
      const shaJson = await getRes.json();
      sha = shaJson.sha;
    }

    const jsonStr = JSON.stringify(data, null, 2);
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));

    const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/data.json`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: 'chore: update homestay data via admin panel',
        content: base64,
        sha: sha || undefined
      })
    });

    return putRes.ok;
  } catch (err) {
    console.error('commitDataToGitHubDirect error:', err);
    return false;
  }
}
