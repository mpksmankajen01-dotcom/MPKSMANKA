const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUjygcJEgnGyed9tQN3PQbF-E1fkaP0F8AcEx93MgRoj9UGPuaCV--y2DF-v0fztJbqg/exec"; 
const GALLERY_SHEET_URL = "https://script.google.com/macros/s/AKfycbxUjygcJEgnGyed9tQN3PQbF-E1fkaP0F8AcEx93MgRoj9UGPuaCV--y2DF-v0fztJbqg/exec"; 
const LEADERBOARD_SHEET_URL = "https://script.google.com/macros/s/AKfycbxUjygcJEgnGyed9tQN3PQbF-E1fkaP0F8AcEx93MgRoj9UGPuaCV--y2DF-v0fztJbqg/exec";

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
// 3. AMBIL DATA GALERI DARI GOOGLE SHEETS
// =========================================
async function loadDynamicGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    try {
        const response = await fetch(GALLERY_SHEET_URL);
        const data = await response.json();

        if (data && data.length > 0) {
            galleryGrid.innerHTML = ""; 
            
            data.forEach(item => {
                const title = item.Judul || "Kegiatan MPK";
                const date = item.Tanggal || "-";
                const category = item.Kategori || "Rapat";
                const desc = item.Deskripsi || "";
                const img = item.LinkGambar || "LOGO MPK.png";

                const tagLabel = category === 'Proker' ? 'Program Kerja' : 'Dokumentasi Kegiatan';

                const galleryItemHTML = `
                    <div class="gallery-item reveal active" data-category="${category}" onclick="openModal('${title}', '${date}', '${desc}', '${img}')">
                        <img src="${img}" alt="${title}">
                        <div class="gallery-overlay">
                            <span class="gallery-tag">${tagLabel}</span>
                            <h4>${title}</h4>
                            <p><i class="fa-regular fa-calendar"></i> ${date}</p>
                        </div>
                    </div>
                `;
                galleryGrid.insertAdjacentHTML('beforeend', galleryItemHTML);
            });
            setupGalleryFilter();
        }
    } catch (error) {
        console.error("Gagal memuat galeri:", error);
        galleryGrid.innerHTML = `<p style="text-align: center; color: #dc2626; grid-column: 1/-1;">Gagal memuat galeri dari Google Sheets.</p>`;
    }
}

// =========================================
// 4. FILTER GALERI KEGIATAN
// =========================================
function setupGalleryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// =========================================
// 5. MODAL DETAIL FOTO GALERI
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
}

function closeModal(event) {
    if (event.target === photoModal) forceCloseModal();
}

// =========================================
// 6. MINI GAME SPEED MATH (30 DETIK & LEADERBOARD GOOGLE SHEETS)
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
// 7. FORM ASPIRASI & KIRIM KE GOOGLE SHEETS
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

// Inisialisasi galeri dan papan rangking saat halaman dimuat
window.addEventListener('load', () => {
    loadDynamicGallery();
    displayLeaderboard();
});
