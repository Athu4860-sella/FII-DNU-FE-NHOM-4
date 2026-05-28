// main.js

// ================= AUTH CONFIG =================
// Tài khoản admin mặc định — thay đổi tại đây nếu cần
const AUTH_CONFIG = {
  adminUser: "admin",
  adminPass: "123456",
};

// ================= INITIALIZATION =================

$(document).ready(function () {
  updateUserDropdown();
  getCategories();
  getFoods();
  updateCartCount();
  initSlider();
  renderCombos();
});

// ================= COMBO =================

const DEFAULT_COMBOS = [
  {
    id: "combo-1",
    TenMon: "Combo Sáng Đặc Biệt",
    Gia: 85000,
    oldPrice: 120000,
    img: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&q=80",
    items: ["🍜 Phở Bò Đặc Biệt", "🍵 Trà Đào Cam Sả"],
    tag: "Bán chạy",
  },
  {
    id: "combo-2",
    TenMon: "Combo Trưa Thịnh Vượng",
    Gia: 75000,
    oldPrice: 108000,
    img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80",
    items: ["🍚 Cơm Tấm Sườn Bì", "🥤 Nước Cam Tươi"],
    tag: "Mới",
  },
  {
    id: "combo-3",
    TenMon: "Combo Gia Đình",
    Gia: 320000,
    oldPrice: 460000,
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    items: ["🍲 Lẩu Thái Hải Sản", "🥤 4 Nước Tươi", "🍮 Tráng Miệng"],
    tag: "HOT",
  },
  {
    id: "combo-4",
    TenMon: "Combo Đặc Biệt VIP",
    Gia: 135000,
    oldPrice: 195000,
    img: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80",
    items: ["🍜 Bún Bò Huế", "🥗 Nem Cuốn (4 cái)", "🍧 Chè Thái"],
    tag: "Tiết kiệm nhất",
  },
];

function getCombosData() {
  try {
    const saved = localStorage.getItem("combos");
    if (saved) return JSON.parse(saved);
  } catch {}
  localStorage.setItem("combos", JSON.stringify(DEFAULT_COMBOS));
  return [...DEFAULT_COMBOS];
}

function renderCombos() {
  const container = document.getElementById("combo-list");
  if (!container) return;
  const combosData = getCombosData();

  container.innerHTML = combosData
    .map((combo, idx) => {
      const discount = Math.round((1 - combo.Gia / combo.oldPrice) * 100);
      const itemsHtml = combo.items.map((item) => `<li>${item}</li>`).join("");
      return `
      <div class="col-sm-6 col-lg-3">
        <div class="combo-card">
          <div class="combo-badge">-${discount}%</div>
          <div class="combo-tag">${combo.tag}</div>
          <div class="combo-img-wrap">
            <img src="${combo.img}" alt="${combo.TenMon}" class="combo-img" />
          </div>
          <div class="combo-body">
            <h5 class="combo-name">${combo.TenMon}</h5>
            <ul class="combo-items">${itemsHtml}</ul>
            <div class="combo-price-row">
              <span class="combo-old">${formatPrice(combo.oldPrice)}</span>
              <span class="combo-new">${formatPrice(combo.Gia)}</span>
            </div>
            <button class="combo-btn" onclick="addComboToCart(${idx})">
              <i class="fa-solid fa-cart-plus me-2"></i>Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function addComboToCart(idx) {
  const combo = getCombosData()[idx];
  addToCart(
    { id: combo.id, TenMon: combo.TenMon, Gia: combo.Gia, HinhAnh: combo.img },
    1,
  );
}
window.addComboToCart = addComboToCart;

// ================= SLIDESHOW =================

let currentSlide = 0;
let sliderInterval = null;

function initSlider() {
  startSlider();

  const sliderEl = document.querySelector(".hero-slider");
  if (sliderEl) {
    sliderEl.addEventListener("mouseenter", () =>
      clearInterval(sliderInterval),
    );
    sliderEl.addEventListener("mouseleave", startSlider);
  }
}

function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  if (!slides.length) return;

  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide = (index + slides.length) % slides.length;

  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");
}

function nextSlide() {
  showSlide(currentSlide + 1);
  resetSlider();
}

function prevSlide() {
  showSlide(currentSlide - 1);
  resetSlider();
}

function goToSlide(index) {
  showSlide(index);
  resetSlider();
}

function startSlider() {
  sliderInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
}

function resetSlider() {
  clearInterval(sliderInterval);
  startSlider();
}

window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;

// ================= SEARCH =================

$("#searchInput").on("keyup", function () {
  const keyword = $(this).val().toLowerCase();
  const filteredFoods = foodsData.filter((food) =>
    food.TenMon.toLowerCase().includes(keyword),
  );
  displayFoods(filteredFoods);
});

// ================= GIỎ HÀNG =================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// 1. Thêm vào giỏ kèm Toast
function addToCart(food, quantity) {
  let qty = parseInt(quantity);
  if (isNaN(qty) || qty < 1) qty = 1;

  const index = cart.findIndex((item) => String(item.id) === String(food.id));

  if (index >= 0) {
    cart[index].quantity += qty;
  } else {
    cart.push({ ...food, quantity: qty });
  }

  saveCart();

  $("#toastMsg").text(`Đã thêm ${qty} ${food.TenMon} thành công!`);
  const toast = new bootstrap.Toast(document.getElementById("cartToast"));
  toast.show();
}

// 2. Hiển thị giỏ hàng
function renderCart() {
  let html = "";
  let subtotal = 0;

  if (cart.length === 0) {
    html = `
      <div class="text-center py-5">
        <i class="fa-solid fa-cart-flatbed fs-1 text-muted mb-3 opacity-25"></i>
        <p class="text-muted">Chưa có món ăn nào trong giỏ.</p>
      </div>
    `;
  } else {
    cart.forEach((item) => {
      let totalItemPrice = item.Gia * item.quantity;
      subtotal += totalItemPrice;
      html += `
        <div class="d-flex align-items-center justify-content-between border-bottom py-3">
          <div class="d-flex align-items-center">
            <img src="${item.HinhAnh}" width="60" height="60" class="rounded me-3 shadow-sm object-fit-cover">
            <div>
              <h6 class="mb-0 fw-bold">${item.TenMon}</h6>
              <small class="text-success fw-bold">${formatPrice(item.Gia)}</small>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <div class="input-group input-group-sm me-3" style="width: 100px;">
              <button class="btn btn-outline-secondary" onclick="updateCartQty('${item.id}', -1)">-</button>
              <input type="text" class="form-control text-center bg-white" value="${item.quantity}" readonly>
              <button class="btn btn-outline-secondary" onclick="updateCartQty('${item.id}', 1)">+</button>
            </div>
            <div class="text-end" style="min-width: 90px;">
              <div class="fw-bold text-dark">${formatPrice(totalItemPrice)}</div>
              <button class="btn btn-link btn-sm text-danger p-0 border-0" onclick="removeCartItem('${item.id}')">Xóa</button>
            </div>
          </div>
        </div>
      `;
    });
  }

  $("#cart-body").html(html);
  $("#cart-subtotal").text(formatPrice(subtotal));
  const shipping = subtotal > 0 ? 20000 : 0;
  $("#cart-total").text(formatPrice(subtotal + shipping));
}

// 3. Tăng/Giảm số lượng
function updateCartQty(id, delta) {
  const item = cart.find((i) => String(i.id) === String(id));
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) return removeCartItem(id);
    saveCart();
    renderCart();
  }
}

// 4. Xóa món kèm SweetAlert2
function removeCartItem(id) {
  Swal.fire({
    title: "Bạn muốn xóa món?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#198754",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Đúng, xóa đi!",
    cancelButtonText: "Hủy",
  }).then((result) => {
    if (result.isConfirmed) {
      cart = cart.filter((i) => String(i.id) !== String(id));
      saveCart();
      renderCart();
    }
  });
}

function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  $("#cart-count").text(total);
}

function showCart() {
  renderCart();
  const cartModal = new bootstrap.Modal(document.getElementById("cartModal"));
  cartModal.show();
}

// 5. Thanh toán
function checkout() {
  if (cart.length === 0) {
    showMessage("Giỏ hàng đang trống!", "warning");
    return;
  }

  const name = $("#cus-name").val().trim();
  const phone = $("#cus-phone").val().trim();
  const address = $("#cus-address").val().trim();

  if (isEmpty(name) || isEmpty(phone) || isEmpty(address)) {
    showMessage("Vui lòng điền đầy đủ thông tin giao hàng!", "warning");
    return;
  }

  const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
  orderHistory.push({
    date: new Date().toLocaleString("vi-VN"),
    name,
    phone,
    address,
    payment: selectedPayment === "cod" ? "Trực tiếp (COD)" : "Trực tuyến",
    items: [...cart],
    total:
      cart.reduce((sum, item) => sum + item.Gia * item.quantity, 0) + 20000,
  });
  localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

  const paymentMsg =
    selectedPayment === "cod"
      ? "Vui lòng chuẩn bị tiền mặt khi nhận hàng 💵"
      : "Đơn hàng của bạn đã được ghi nhận 🎉";
  Swal.fire("Đặt hàng thành công!", paymentMsg, "success");
  cart = [];
  saveCart();
  $("#cartModal").modal("hide");
}

// ================= LOGIN & AUTH =================

function showRegister() {
  $("#loginForm").addClass("d-none");
  $("#registerForm").removeClass("d-none");
  $("#modalTitle").text("Đăng ký");
}

function showLogin() {
  $("#registerForm").addClass("d-none");
  $("#loginForm").removeClass("d-none");
  $("#modalTitle").text("Đăng nhập");
}

$("#loginForm").submit(function (e) {
  e.preventDefault();
  const username = $("#loginUsername").val();
  const password = $("#loginPassword").val();
  const savedUser = JSON.parse(localStorage.getItem("user"));

  const isDefaultAdmin =
    username === AUTH_CONFIG.adminUser && password === AUTH_CONFIG.adminPass;
  const isRegisteredUser =
    savedUser &&
    username === savedUser.username &&
    password === savedUser.password;

  if (isDefaultAdmin || isRegisteredUser) {
    localStorage.setItem("isLogin", "true");
    updateUserDropdown();
    Swal.fire("Thành công", "Đăng nhập thành công!", "success");
    $("#loginModal").modal("hide");
  } else {
    Swal.fire("Thất bại", "Sai tài khoản hoặc mật khẩu", "error");
  }
});

$("#registerForm").submit(function (e) {
  e.preventDefault();

  const username = $("#registerUsername").val().trim();
  const password = $("#registerPassword").val().trim();
  const confirmPassword = $("#confirmPassword").val().trim();

  if (isEmpty(username)) {
    showMessage("Username không được để trống", "warning");
    return;
  }
  if (username.length < 4) {
    showMessage("Username phải từ 4 ký tự", "warning");
    return;
  }
  if (isEmpty(password)) {
    showMessage("Password không được để trống", "warning");
    return;
  }
  if (password.length < 6) {
    showMessage("Password phải từ 6 ký tự", "warning");
    return;
  }

  const regexPassword = /^(?=.*[A-Za-z])(?=.*\d).+$/;
  if (!regexPassword.test(password)) {
    showMessage("Password phải có chữ và số", "warning");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Mật khẩu nhập lại không đúng", "warning");
    return;
  }

  const user = { username, password };
  localStorage.setItem("user", JSON.stringify(user));
  Swal.fire("Thành công", "Đăng ký thành công!", "success");
  $("#registerForm")[0].reset();
  showLogin();
});

function logout() {
  localStorage.removeItem("isLogin");
  updateUserDropdown();
  Swal.fire("Thông báo", "Đã đăng xuất tài khoản", "info");
}

function updateUserDropdown() {
  const isLogin = localStorage.getItem("isLogin") === "true";
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const name = isLogin ? (savedUser ? savedUser.username : "Admin") : null;

  const greet = document.getElementById("dropGreet");
  const sub = document.getElementById("dropSubtext");
  const label = document.getElementById("userBtnLabel");

  if (greet)
    greet.textContent = isLogin ? `Xin chào, ${name}!` : "Xin chào, Khách!";
  if (sub)
    sub.textContent = isLogin
      ? `Đã đăng nhập thành công`
      : "Đăng nhập để xem đơn hàng";
  if (label) label.textContent = isLogin ? name : "Tôi";
}

// ================= LỊCH SỬ ĐƠN =================

function showOrderHistory() {
  const history = JSON.parse(localStorage.getItem("orderHistory")) || [];
  let html = "";

  if (history.length === 0) {
    html = `<p class="text-center text-muted">Bạn chưa có đơn hàng nào.</p>`;
  } else {
    history
      .slice()
      .reverse()
      .forEach((order, i) => {
        html += `
        <div class="border rounded-3 p-3 mb-3">
          <div class="d-flex justify-content-between mb-2">
            <strong>Đơn #${history.length - i}</strong>
            <small class="text-muted">${order.date}</small>
          </div>
          <p class="mb-1"><i class="fa-solid fa-user me-2"></i>${order.name} - ${order.phone}</p>
          <p class="mb-1"><i class="fa-solid fa-location-dot me-2"></i>${order.address}</p>
          <p class="mb-0 text-success fw-bold">Tổng: ${formatPrice(order.total)}</p>
        </div>
      `;
      });
  }

  $("#order-history-body").html(html);
  const modal = new bootstrap.Modal(
    document.getElementById("orderHistoryModal"),
  );
  modal.show();
}

// ================= DARK MODE =================

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const icon = document.getElementById("dark-icon");
  if (document.body.classList.contains("dark-mode")) {
    icon.classList.replace("fa-moon", "fa-sun");
    localStorage.setItem("darkMode", "on");
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
    localStorage.setItem("darkMode", "off");
  }
}

if (localStorage.getItem("darkMode") === "on") {
  document.body.classList.add("dark-mode");
  document.getElementById("dark-icon") &&
    document.getElementById("dark-icon").classList.replace("fa-moon", "fa-sun");
}

// ================= SEARCH TOGGLE =================

function toggleSearch() {
  $("#searchInput").toggleClass("active");
}

// ================= BACK TO TOP =================

const bttBtn = document.getElementById("backToTop");
const bttCircle = document.getElementById("bttCircle");
const bttCircumference = 2 * Math.PI * 18; // r=18 → ~113

window.addEventListener("scroll", function () {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;

  if (bttBtn) {
    bttBtn.style.display = scrollTop > 300 ? "flex" : "none";
  }
  if (bttCircle) {
    const offset = bttCircumference - progress * bttCircumference;
    bttCircle.style.strokeDashoffset = offset;
  }
});

bttBtn &&
  bttBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

// ================= PAYMENT METHOD =================

let selectedPayment = "online";

function selectPayment(method) {
  selectedPayment = method;
  document
    .getElementById("pm-online")
    .classList.toggle("active", method === "online");
  document
    .getElementById("pm-cod")
    .classList.toggle("active", method === "cod");
}
window.selectPayment = selectPayment;
