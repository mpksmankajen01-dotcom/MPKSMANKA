const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjkOeaw0nduGUxnstBEo6inb2hajvs5CPDTC27Ic0usxGqIemyHPvbMYcY8LTASU284Q/exec"; 
const GALLERY_SHEET_URL = "https://script.google.com/macros/s/AKfycbzjkOeaw0nduGUxnstBEo6inb2hajvs5CPDTC27Ic0usxGqIemyHPvbMYcY8LTASU284Q/exec"; 
const LEADERBOARD_SHEET_URL = "https://script.google.com/macros/s/AKfycbzjkOeaw0nduGUxnstBEo6inb2hajvs5CPDTC27Ic0usxGqIemyHPvbMYcY8LTASU284Q/exec";

// =========================================
// 1. NAVBAR MOBILE TOGGLE
// =========================================
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// =========================================
// 2. ANIMASI SCROLL REVEAL
// =========================================
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - 80) {
            el.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// =========================================
// 3. GALERI TICKER, FILTER, PENCARIAN & LIKE
// =========================================
let globalGalleryData = [];
let currentCategoryFilter = 'all';

async function loadDynamicGalleryTicker() {
    const galleryTrack = document.getElementById('galleryTrack');
    if (!galleryTrack) return;

    try {
        const response = await fetch(GALLERY_SHEET_URL);
        const data = await response.json();

        if (data && data.length > 0) {
            globalGalleryData = data;
            applyGalleryFilters();
            setupCategoryFilterButtons();
        } else {
            galleryTrack.innerHTML = `<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 40px;">Belum ada data galeri.</p>`;
        }
    } catch (error) {
        console.error("Gagal memuat galeri:", error);
        galleryTrack.innerHTML = `<p style="text-align: center; color: #dc2626; width: 100%; padding: 40px;">Gagal memuat galeri dari Google Sheets.</p>`;
    }
}

// Render item ke ticker (diduplikasi agar infinite scroll mulus)
function renderTickerItems(data) {
    const galleryTrack = document.getElementById('galleryTrack');
    if (!galleryTrack) return;

    galleryTrack.innerHTML = "";

    if (data.length === 0) {
        galleryTrack.innerHTML = `<p style="text-align: center; color: var(--text-muted); width: 100%; padding: 40px;">Tidak ada foto yang cocok dengan pencarian.</p>`;
        return;
    }

    const itemsToRender = data.length < 4 ? [...data, ...data, ...data] : [...data, ...data];

    itemsToRender.forEach((item) => {
        const title = item.Judul || "Kegiatan MPK";
        const date = item.Tanggal || "-";
        const category = item.Kategori || "Dokumentasi Kegiatan";
        const desc = item.Deskripsi || "";
        const img = item.LinkGambar || "LOGO MPK.png";
        const likes = item.Likes || 0;
        const rowIndex = item.rowIndex; // Nomor baris asli di Google Sheets

        const tagLabel = category === 'Proker' ? 'Program Kerja' : 'Dokumentasi Kegiatan';

        const cardHTML = `
            <div class="ticker-card" onclick="handleCardClick('${escapeHtml(title)}', '${escapeHtml(String(date))}', '${escapeHtml(desc)}', '${img}')">
                <img src="${img}" alt="${escapeHtml(title)}" onerror="this.src='LOGO MPK.png'">
                <div class="ticker-card-body">
                    <span class="gallery-tag">${tagLabel}</span>
                    <h4>${title}</h4>
                    <p style="font-size: 0.82rem; color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${date}</p>
                    <div class="ticker-card-actions" onclick="event.stopPropagation()">
                        <span style="font-size: 0.78rem; font-weight: 600; color: var(--logo-blue);">${category}</span>
                        <button class="like-btn" onclick="likePhoto(${rowIndex}, this)">
                            <i class="fa-solid fa-heart"></i> <span class="like-count">${likes}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        galleryTrack.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function setupCategoryFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategoryFilter = btn.getAttribute('data-filter');
            applyGalleryFilters();
        });
    });
}

function applyGalleryFilters() {
    const searchInput = document.getElementById('gallerySearchInput');
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";

    const filtered = globalGalleryData.filter(item => {
        const title = (item.Judul || "").toLowerCase();
        const desc = (item.Deskripsi || "").toLowerCase();
        const cat = (item.Kategori || "").trim();

        const matchesSearch = title.includes(searchQuery) || desc.includes(searchQuery);
        const matchesCategory = currentCategoryFilter === 'all' || cat === currentCategoryFilter;

        return matchesSearch && matchesCategory;
    });

    renderTickerItems(filtered);
}

function handleCardClick(title, date, desc, img) {
    const track = document.getElementById('galleryTrack');
    if (track) track.classList.add('paused'); 

    openModal(title, date, desc, img);
}

// =========================================
// 4. MODAL DETAIL FOTO GALERI & LIKE
// =========================================
const photoModal = document.getElementById('photoModal');
const modalImg = document.getElementById('modalImg');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');

function openModal(title, date, desc, imgSrc) {
    if (modalTitle && modalDate && modalDesc && modalImg && photoModal) {
        modalTitle.textContent = title;
        modalDate.textContent = date;
        modalDesc.textContent = desc;
        modalImg.src = imgSrc;
        photoModal.classList.add('active');
    }
}

function forceCloseModal() {
    if (photoModal) photoModal.classList.remove('active');
    const track = document.getElementById('galleryTrack');
    if (track) track.classList.remove('paused'); 
}

function closeModal(event) {
    if (event.target === photoModal) forceCloseModal();
}

async function likePhoto(rowIndex, buttonElement) {
    const countSpan = buttonElement.querySelector('.like-count');
    let currentLikes = parseInt(countSpan.textContent) || 0;
    currentLikes++;
    countSpan.textContent = currentLikes;

    // Update nilai likes di memori lokal agar filter tetap sinkron
    const targetItem = globalGalleryData.find(item => item.rowIndex === rowIndex);
    if (targetItem) {
        targetItem.Likes = currentLikes;
    }

    const formData = new URLSearchParams();
    formData.append('type', 'like'); // Huruf kecil agar cocok dengan Apps Script
    formData.append('rowIndex', rowIndex);

    try {
        if (GOOGLE_SCRIPT_URL !== "" && GOOGLE_SCRIPT_URL.includes("https://script.google.com")) {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
        }
    } catch (error) {
        console.error("Gagal menyimpan like:", error);
    }
}

function escapeHtml(text) {
    return text.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

// =========================================
// 5. MINI GAME SPEED MATH
// =========================================
let score = 0;
let timeLeft = 30;
let timerInterval = null;
let currentCorrectAnswer = 0;

const gameStartScreen = document.getElementById('gameStartScreen');
const gamePlayArea = document.getElementById('gamePlayArea');
const gameOverArea = document.getElementById('gameOverArea');
const questionArea = document.getElementById('gameQuestionArea');
const optionsArea = document.getElementById('gameOptionsArea');
const currentScoreEl = document.getElementById('currentScore');
const timeLeftEl = document.getElementById('timeLeft');
const finalScoreEl = document.getElementById('finalScore');
const playerNameInput = document.getElementById('playerName');
const leaderboardList = document.getElementById('leaderboardList');

function startGame() {
    score = 0;
    timeLeft = 30;
    if (currentScoreEl) currentScoreEl.textContent = score;
    if (timeLeftEl) timeLeftEl.textContent = timeLeft;

    if (gameStartScreen) gameStartScreen.classList.add('hidden');
    if (gameOverArea) gameOverArea.classList.add('hidden');
    if (gamePlayArea) gamePlayArea.classList.remove('hidden');

    generateMathQuestion();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeftEl) timeLeftEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function generateMathQuestion() {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let num1, num2, answer;

    if (op === '+') {
        num1 = Math.floor(Math.random() * 40) + 1;
        num2 = Math.floor(Math.random() * 40) + 1;
        answer = num1 + num2;
    } else if (op === '-') {
        num1 = Math.floor(Math.random() * 40) + 1;
        num2 = Math.floor(Math.random() * 40) + 1;
        if (num1 < num2) { let temp = num1; num1 = num2; num2 = temp; }
        answer = num1 - num2;
    } else if (op === '×') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
    } else {
        num2 = Math.floor(Math.random() * 9) + 1;
        let multiplier = Math.floor(Math.random() * 9) + 1;
        num1 = num2 * multiplier;
        answer = multiplier;
    }

    currentCorrectAnswer = answer;
    if (questionArea) questionArea.textContent = `${num1} ${op} ${num2} = ?`;

    let options = [answer];
    while (options.length < 4) {
        let wrongAnswer = answer + (Math.floor(Math.random() * 10) - 5);
        if (wrongAnswer !== answer && !options.includes(wrongAnswer) && wrongAnswer >= 0) {
            options.push(wrongAnswer);
        }
    }
    options.sort(() => Math.random() - 0.5);

    if (optionsArea) {
        optionsArea.innerHTML = "";
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'game-option-btn';
            btn.textContent = opt;
            btn.onclick = () => checkMathAnswer(opt, btn);
            optionsArea.appendChild(btn);
        });
    }
}

function checkMathAnswer(selectedOption, buttonElement) {
    const allButtons = optionsArea.querySelectorAll('.game-option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (selectedOption === currentCorrectAnswer) {
        buttonElement.classList.add('correct');
        score++;
        if (currentScoreEl) currentScoreEl.textContent = score;
    } else {
        buttonElement.classList.add('wrong');
        allButtons.forEach(btn => {
            if (parseInt(btn.textContent) === currentCorrectAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        if (timeLeft > 0) {
            generateMathQuestion();
        }
    }, 350);
}

function endGame() {
    if (gamePlayArea) gamePlayArea.classList.add('hidden');
    if (gameOverArea) gameOverArea.classList.remove('hidden');
    if (finalScoreEl) finalScoreEl.textContent = score;
    displayLeaderboard();
}

async function saveScore() {
    const name = playerNameInput ? playerNameInput.value.trim() : "";
    if (!name) {
        alert("Silakan masukkan nama kamu terlebih dahulu!");
        return;
    }

    const saveBtn = document.getElementById('saveScoreBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';
    }

    const formData = new URLSearchParams();
    formData.append('type', 'leaderboard');
    formData.append('name', name);
    formData.append('score', score);

    try {
        if (LEADERBOARD_SHEET_URL !== "" && LEADERBOARD_SHEET_URL.includes("https://script.google.com")) {
            await fetch(LEADERBOARD_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
        }

        if (playerNameInput) playerNameInput.value = "";
        alert("Skor berhasil disimpan ke papan rangking!");

        setTimeout(() => {
            displayLeaderboard();
        }, 1200);
    } catch (error) {
        console.error("Gagal menyimpan skor:", error);
        alert("Gagal menyimpan skor ke papan rangking.");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Skor ke Papan Rangking';
        }
    }
}

async function displayLeaderboard() {
    if (!leaderboardList) return;

    try {
        const response = await fetch(`${LEADERBOARD_SHEET_URL}?action=leaderboard`);
        const leaderboard = await response.json();

        if (!leaderboard || leaderboard.length === 0) {
            leaderboardList.innerHTML = `<li style="color: var(--text-muted); padding: 5px 0;">Belum ada skor tercatat. Jadilah yang pertama!</li>`;
            return;
        }

        leaderboardList.innerHTML = "";
        leaderboard.slice(0, 5).forEach((item, index) => {
            const li = document.createElement('li');
            li.style.cssText = "display: flex; justify-content: space-between; padding: 6px 10px; margin-bottom: 6px; background: var(--sky-50); border-radius: 8px; border: 1px solid var(--sky-200); font-weight: 600;";
            li.innerHTML = `<span>#${index + 1} ${item.name}</span> <span class="text-blue">${item.score} Soal Benar</span>`;
            leaderboardList.appendChild(li);
        });
    } catch (error) {
        console.error("Gagal memuat papan rangking:", error);
        leaderboardList.innerHTML = `<li style="color: #dc2626; padding: 5px 0;">Gagal memuat papan rangking.</li>`;
    }
}

// =========================================
// 6. FORM ASPIRASI & KIRIM KE GOOGLE SHEETS
// =========================================
const anonToggle = document.getElementById('anonToggle');
const identityFields = document.getElementById('identityFields');
const aspirasiForm = document.getElementById('aspirasiForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

if (anonToggle && identityFields) {
    anonToggle.addEventListener('change', () => {
        if (anonToggle.checked) {
            identityFields.classList.add('hidden');
        } else {
            identityFields.classList.remove('hidden');
        }
    });
}

if (aspirasiForm) {
    aspirasiForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isAnon = anonToggle ? anonToggle.checked : true;
        const nameInput = document.getElementById('senderName');
        const classInput = document.getElementById('senderClass');
        const categorySelect = document.getElementById('category');
        const messageInput = document.getElementById('message');

        const senderName = isAnon ? "Anonim" : (nameInput ? nameInput.value.trim() || "Anonim" : "Anonim");
        const senderClass = isAnon ? "-" : (classInput ? classInput.value.trim() || "-" : "-");
        const category = categorySelect ? categorySelect.value : "Aspirasi Sekolah";
        const message = messageInput ? messageInput.value.trim() : "";

        if (!message) return;

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim Pesan...';
        }

        const formData = new URLSearchParams();
        formData.append('waktu', new Date().toLocaleString('id-ID'));
        formData.append('nama', senderName);
        formData.append('kelas', senderClass);
        formData.append('kategori', category);
        formData.append('pesan', message);

        try {
            if (GOOGLE_SCRIPT_URL !== "" && GOOGLE_SCRIPT_URL.includes("https://script.google.com")) {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });
            }
            if (formStatus) {
                formStatus.textContent = "✓ Aspirasi dan curhatanmu berhasil dikirim secara aman dan rahasia ke database MPK!";
                formStatus.style.color = "#15803d";
            }
        } catch (error) {
            if (formStatus) {
                formStatus.textContent = "Gagal terhubung ke database. Periksa koneksi internetmu.";
                formStatus.style.color = "#dc2626";
            }
        }

        aspirasiForm.reset();
        if (anonToggle) {
            anonToggle.checked = true;
            if (identityFields) identityFields.classList.add('hidden');
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Pesan';
        }

        if (formStatus) {
            setTimeout(() => { formStatus.textContent = ""; }, 6000);
        }
    });
}

// Inisialisasi galeri ticker dan papan rangking saat halaman dimuat
window.addEventListener('load', () => {
    loadDynamicGalleryTicker();
    displayLeaderboard();
});
