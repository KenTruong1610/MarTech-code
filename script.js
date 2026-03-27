/**
 * Marketing & Sales Automation Simulator
 * File: script.js
 * Chứa logic theo dõi hành vi, tính toán CTR, và mô phỏng traffic.
 */

// --- 0. KHỞI TẠO FIREBASE SDK (CDN) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Cấu hình Firebase của bạn
const firebaseConfig = {
    apiKey: "AIzaSyDzPCkfos0wKGadAH8SSvb8KATMyhMygZk",
    authDomain: "ec-website-b7b87.firebaseapp.com",
    projectId: "ec-website-b7b87",
    storageBucket: "ec-website-b7b87.firebasestorage.app",
    messagingSenderId: "318849736986",
    appId: "1:318849736986:web:6a24d37ab39a26094f0ca3",
    measurementId: "G-59GY08R25R"
};

let useFirebase = false;
let app, analytics, db, statsRef;

try {
    // Kích hoạt Firebase với CẤU HÌNH CỦA BẠN
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    statsRef = doc(db, "marketing", "simulator_stats");
    useFirebase = true;
    console.log("Khởi tạo Firebase thành công!");
} catch (error) {
    console.error("Lỗi khởi tạo Firebase: ", error);
}

// --- 1. BIẾN TRẠNG THÁI & CƠ SỞ DỮ LIỆU ---
let totalVisitors = 0;
let totalClicks = 0;
let emailsCollected = [];

// Hàm lưu dữ liệu vào "Cơ sở dữ liệu" (Firebase hoặc LocalStorage fallback)
async function saveToDatabase() {
    if (useFirebase) {
        try {
            await setDoc(statsRef, {
                totalVisitors,
                totalClicks,
                emailsCollected
            });
            console.log('[Firebase] Đã đồng bộ dữ liệu lên Cloud!');
        } catch (error) {
            console.error('[Firebase] Lỗi lưu trữ:', error);
        }
    } else {
        localStorage.setItem('totalVisitors', totalVisitors);
        localStorage.setItem('totalClicks', totalClicks);
        localStorage.setItem('emailsCollected', JSON.stringify(emailsCollected));
    }
}

// --- 2. TRUY XUẤT DOM ELEMENTS ---
// Dashboard Elements
const statVisitors = document.getElementById('stat-visitors');
const statClicks = document.getElementById('stat-clicks');
const statEmails = document.getElementById('stat-emails');
const statCtr = document.getElementById('stat-ctr');

// Modal Elements
const modalVisitors = document.getElementById('modal-visitors');
const modalClicks = document.getElementById('modal-clicks');
const modalEmails = document.getElementById('modal-emails');
const modalCtr = document.getElementById('modal-ctr');

// Buttons & Forms
const btnSimulate = document.getElementById('btn-simulate');
const btnCalculate = document.getElementById('btn-calculate');
const buyButtons = document.querySelectorAll('.buy-btn');
const emailForm = document.getElementById('email-form');
const emailInput = document.getElementById('email-input');
const subscribeAlert = document.getElementById('subscribe-alert');

// --- 3. HÀM CẬP NHẬT GIAO DIỆN (DASHBOARD REALTIME) ---
function updateDashboard() {
    // Cập nhật các chỉ số thô
    statVisitors.innerText = totalVisitors;
    statClicks.innerText = totalClicks;
    statEmails.innerText = emailsCollected.length;

    // Tính toán Tỷ lệ nhấp (CTR) realtime
    let ctr = 0;
    if (totalVisitors > 0) {
        ctr = (totalClicks / totalVisitors) * 100;
    }

    // Hiển thị dạng phần trăm với 2 chữ số thập phân
    statCtr.innerText = ctr.toFixed(2) + '%';
}

// --- 4. ENGINE: SIMULATE TRAFFIC ---
// Nút này cho phép mô phỏng việc chạy ads đổ traffic vào website
btnSimulate.addEventListener('click', () => {
    // Random tăng visitors từ 10 đến 50 người
    const incomingTraffic = Math.floor(Math.random() * 41) + 10;
    totalVisitors += incomingTraffic;

    // Lưu vào database
    saveToDatabase();

    console.log(`[Marketing] Nhận được ${incomingTraffic} visitors mới. Tổng visitors: ${totalVisitors}`);

    // Nút có hiệu ứng nháy sáng nhẹ
    btnSimulate.innerHTML = `Simulating... (+${incomingTraffic})`;
    setTimeout(() => {
        btnSimulate.innerHTML = 'Simulate Visitors';
    }, 600);

    // Render lại Dashboard
    updateDashboard();
});

// --- 5. ENGINE: THEO DÕI CLICKS & MICRO-CONVERSIONS ---
// Lặp qua tất cả nút Buy Now để gắn sự kiện theo dõi hành vi
buyButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        // Tăng đếm số lần click của cả site
        totalClicks++;

        // Lưu vào database
        saveToDatabase();

        console.log(`[Sales] Sản phẩm ID_${index + 1} được click. Tổng clicks toàn site: ${totalClicks}`);

        // UI Feedback: Báo user đã click thành công
        const originalText = btn.innerText;
        btn.innerText = "Booked!";
        btn.classList.replace('btn-outline-primary', 'btn-success');

        // Reset lại nút sau 1.5 giây
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.replace('btn-success', 'btn-outline-primary');
        }, 1500);

        // Update realtime dashboard
        updateDashboard();
    });
});

// --- 6. ENGINE: LEAD CAPTURE (THU THẬP EMAIL) ---
// Xử lý sự kiện đăng ký nhận bản tin
emailForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Ngăn trình duyệt reload lại trang

    const submittedEmail = emailInput.value.trim();

    if (submittedEmail) {
        // Lưu data vào mảng
        emailsCollected.push(submittedEmail);

        // Lưu vào database
        saveToDatabase();

        console.log(`[Lead Capture] Đã thu thập: ${submittedEmail}`);
        console.log('Database hiện tại:', emailsCollected);

        // Reset form
        emailInput.value = '';

        // Cập nhật số email ở dashboard realtime
        updateDashboard();

        // Hiển thị banner thành công và tự động ẩn đi sau 3 giây
        subscribeAlert.classList.remove('d-none');
        setTimeout(() => {
            subscribeAlert.classList.add('d-none');
        }, 3000);
    }
});

// --- 7. BÁO CÁO MARKETING (TÍNH TOÁN CTR & HIỂN THỊ MODAL) ---
// Kích hoạt khi user bấm nút "Calculate CTR"
btnCalculate.addEventListener('click', () => {
    // Đẩy data state hiện tại vào UI nội dung Modal
    modalVisitors.innerText = totalVisitors;
    modalClicks.innerText = totalClicks;
    modalEmails.innerText = emailsCollected.length;

    // Áp dụng công thức CTR = (Clicks / Visitors) * 100
    let finalCtr = 0;
    if (totalVisitors > 0) {
        finalCtr = (totalClicks / totalVisitors) * 100;
    }
    modalCtr.innerText = finalCtr.toFixed(2) + '%';

    console.log(`[Report] Modal đã mở. Current CTR = ${finalCtr.toFixed(2)}%`);
});

// --- 8. KHỞI TẠO DỮ LIỆU BAN ĐẦU (TỪ FIREBASE HOẶC LOCAL) ---
async function initSystem() {
    // Kiểm tra xem trình duyệt này đã từng truy cập chưa
    const isNewVisitor = !localStorage.getItem('hasVisitedBefore');

    if (useFirebase) {
        console.log('[Firebase] Đang tải dữ liệu từ Cloud Firestore...');
        try {
            const docSnap = await getDoc(statsRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                totalVisitors = data.totalVisitors || 0;
                totalClicks = data.totalClicks || 0;
                emailsCollected = data.emailsCollected || [];
            } else {
                totalVisitors = 0;
            }

            // Nếu thiết bị này mới vào web lần đầu, tự động cộng thêm người (Tracking thật)
            if (isNewVisitor) {
                totalVisitors++;
                localStorage.setItem('hasVisitedBefore', 'true');
                await saveToDatabase();
                console.log('[Analytics] Ghi nhận +1 Unique Visitor lên Cloud Firestore');
            }
        } catch (error) {
            console.error("[Firebase] Lỗi đọc dữ liệu: ", error);
        }
    } else {
        // Fallback Local Storage nếu chưa cài Firebase
        totalVisitors = parseInt(localStorage.getItem('totalVisitors')) || 0;
        totalClicks = parseInt(localStorage.getItem('totalClicks')) || 0;
        emailsCollected = JSON.parse(localStorage.getItem('emailsCollected')) || [];

        // Nếu thiết bị này mới vào web lần đầu
        if (isNewVisitor) {
            totalVisitors++;
            localStorage.setItem('hasVisitedBefore', 'true');
            saveToDatabase();
            console.log('[Analytics] Ghi nhận +1 Unique Visitor offline');
        }
        
        console.log('[Local Storage] Đang chạy với database trình duyệt offline.');
    }

    updateDashboard();
    console.log('[System] Marketing Automation Simulator initialized.');
}

initSystem();

// --- 9. SLIDER NAVIGATION ---
const tourSlider = document.getElementById('tour-slider');
const btnPrev = document.getElementById('tour-prev');
const btnNext = document.getElementById('tour-next');

if (tourSlider && btnPrev && btnNext) {
    btnNext.addEventListener('click', () => {
        const slideWidth = tourSlider.querySelector('.tour-slide-item').clientWidth + 24; // 24px is var for gap-4
        tourSlider.scrollBy({ left: slideWidth, behavior: 'smooth' });
    });

    btnPrev.addEventListener('click', () => {
        const slideWidth = tourSlider.querySelector('.tour-slide-item').clientWidth + 24;
        tourSlider.scrollBy({ left: -slideWidth, behavior: 'smooth' });
    });
}
