// =========================================
// KONFIGURASI GOOGLE SHEETS (Ganti dengan URL Web App Anda)
// =========================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbHzjo27PHzzm9cBuccsL9aA3ntF6xN1DMUVLYeMzkCXDvqf8JDBCKQl-sBQ_1CTG-3Q/exec"; 
const GALLERY_SHEET_URL = "https://script.google.com/macros/s/AKfycbzbHzjo27PHzzm9cBuccsL9aA3ntF6xN1DMUVLYeMzkCXDvqf8JDBCKQl-sBQ_1CTG-3Q/exec"; // Bisa menggunakan URL Web App yang sama jika digabung dalam 1 project Apps Script

// =========================================
// 1. MENU MOBILE TOGGLE
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
// 3. AMBIL DATA GALERI DARI GOOGLE SHEETS
// =========================================
async function loadDynamicGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    try {
        const response = await fetch(GALLERY_SHEET_URL);
        const data = await response.json();

        if (data && data.length > 0) {
            galleryGrid.innerHTML = ""; // Kosongkan placeholder teks memuat
            
            data.forEach(item => {
                const title = item.Judul || "Kegiatan MPK";
                const date = item.Tanggal || "-";
                const category = item.Kategori || "forum";
                const desc = item.Deskripsi || "";
                const img = item.LinkGambar || "LOGO MPK.png";

                const tagLabel = category === 'sidang' ? 'Sidang & Rapat' : 'Dokumentasi Kegiatan';

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
            setupGalleryFilter(); // Pasang event filter setelah elemen galeri termuat
        }
    } catch (error) {
        console.error("Gagal memuat galeri dari Google Sheets:", error);
        galleryGrid.innerHTML = `<p style="text-align: center; color: #dc2626; grid-column: 1/-1;">Gagal memuat galeri. Periksa kembali URL Google Script Anda.</p>`;
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
// 6. MINI GAME ASAH OTAK (LOGIKA & MPK)
// =========================================
const quizData = [
    {
        question: "Apa fungsi utama dari Majelis Permusyawaratan Kelas (MPK)?",
        options: [
            "Menyelenggarakan pentas seni sekolah",
            "Menampung aspirasi dan mengawasi OSIS",
            "Mengurus administrasi pembayaran SPP",
            "Mengajar di kelas saat guru berhalangan"
        ],
        correct: 1
    },
    {
        question: "Jika dalam suatu diskusi kelompok semua anggota setuju tetapi ada 1 orang bingung, sikap pemimpin yang bijak adalah...",
        options: [
            "Mengabaikannya agar cepat selesai",
            "Mendengarkan kendalanya dan memberi penjelasan ulang",
            "Memarahi orang tersebut",
            "Mengeluarkan anggota dari kelompok"
        ],
        correct: 1
    },
    {
        question: "Berapakah jumlah bintang emas utama yang berada di bagian atas Logo Resmi MPK SMANKA?",
        options: ["1 Bintang", "3 Bintang", "5 Bintang", "7 Bintang"],
        correct: 1
    },
    {
        question: "Logika Berpikir: Jika kemarin adalah hari sebelum hari Rabu, hari apakah besok?",
        options: ["Selasa", "Rabu", "Kamis", "Jumat"],
        correct: 2
    }
];

let currentQuestionIndex = 0;
let score = 0;

const questionArea = document.getElementById('gameQuestionArea');
const optionsArea = document.getElementById('gameOptionsArea');
const currentScoreEl = document.getElementById('currentScore');
const questionCounterEl = document.getElementById('questionCounter');
const gameFeedbackEl = document.getElementById('gameFeedback');

function loadQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        questionArea.innerHTML = `<h3>🎉 Luar Biasa! Kamu Menyelesaikan Mini Game Ini!</h3><p style="text-align:center; color:var(--text-muted); margin-bottom:15px;">Skor Akhir Kamu: <strong>${score} dari ${quizData.length * 25}</strong></p>`;
        optionsArea.innerHTML = `<button class="btn-submit" onclick="restartGame()"><i class="fa-solid fa-rotate-right"></i> Main Lagi</button>`;
        gameFeedbackEl.classList.add('hidden');
        return;
    }

    const q = quizData[currentQuestionIndex];
    questionCounterEl.textContent = `Soal ${currentQuestionIndex + 1} dari ${quizData.length}`;
    currentScoreEl.textContent = score;

    questionArea.innerHTML = `<h3>${q.question}</h3>`;
    optionsArea.innerHTML = "";

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'game-option-btn';
        btn.textContent = opt;
        btn.onclick = () => selectAnswer(index, btn);
        optionsArea.appendChild(btn);
    });
}

function selectAnswer(selectedIndex, buttonElement) {
    const q = quizData[currentQuestionIndex];
    const allButtons = optionsArea.querySelectorAll('.game-option-btn');

    allButtons.forEach(btn => btn.disabled = true);

    if (selectedIndex === q.correct) {
        buttonElement.classList.add('correct');
        score += 25;
        currentScoreEl.textContent = score;
        gameFeedbackEl.textContent = "✓ Jawaban Benar! Hebat sekali logika berfikirmu!";
        gameFeedbackEl.className = "game-feedback success";
    } else {
        buttonElement.classList.add('wrong');
        allButtons[q.correct].classList.add('correct');
        gameFeedbackEl.textContent = "✗ Kurang tepat. Tetap semangat!";
        gameFeedbackEl.className = "game-feedback info";
    }

    gameFeedbackEl.classList.remove('hidden');

    setTimeout(() => {
        currentQuestionIndex++;
        gameFeedbackEl.classList.add('hidden');
        loadQuestion();
    }, 1800);
}

function restartGame() {
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
}

if (questionArea && optionsArea) {
    loadQuestion();
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
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim Rahasia...';
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
            submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Pesan Secara Rahasia';
        }

        if (formStatus) {
            setTimeout(() => { formStatus.textContent = ""; }, 6000);
        }
    });
}

// Inisialisasi galeri saat halaman dimuat
window.addEventListener('load', () => {
    loadDynamicGallery();
});
