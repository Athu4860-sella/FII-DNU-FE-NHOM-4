// api.js

// ================= BASE URL =================

const BASE_URL = "https://69fc37aafce564e259177aba.mockapi.io/api/v1";

// ================= APIs =================

const dishesAPI = "https://69fc37aafce564e259177aba.mockapi.io/api/v1/dishes";

const categoriesAPI =
  "https://69fc37aafce564e259177aba.mockapi.io/api/v1/categories";

// ================= GET CATEGORIES =================

async function getCategories() {
  const response = await fetch(categoriesAPI);

  const data = await response.json();

  let html = "";

  data.forEach((category) => {
    html += `

      <div class="col-6 col-md-4 col-lg-2">

        <div
          class="category-card"
          onclick="filterCategory('${category.TenDanhMuc}')"
        >

          <img src="${category.HinhAnh}">

          <h6 class="mt-2">

            ${category.TenDanhMuc}

          </h6>

        </div>

      </div>

    `;
  });

  $("#categories-list").html(html);
}

// ================= GET FOODS =================

let foodsData = [];
let currentFilterData = [];

async function getFoods() {
  $("#loading").show();

  const response = await fetch(dishesAPI);

  const data = await response.json();

  foodsData = data;
  currentFilterData = data;

  displayFoods(data);

  $("#loading").hide();
}

// ================= DISPLAY FOODS =================

function displayFoods(data) {
  currentFilterData = data;
  let html = "";

  if (data.length === 0) {
    html = `<p class='text-center'>Không tìm thấy món ăn phù hợp.</p>`;
    $("#menu-list").html(html);
    return;
  }

  data.forEach((food) => {
    const isAvailable = food.isAvailable !== false;
    const statusBadge = isAvailable
      ? `<span class="badge bg-success mb-2">Còn món</span>`
      : `<span class="badge bg-danger mb-2">Hết món</span>`;
    const disabledAttr = isAvailable ? "" : "disabled";
    const opacityStyle = isAvailable
      ? ""
      : "style='opacity: 0.7; filter: grayscale(0.5);'";

    html += `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card food-card h-100" ${opacityStyle}>
          <img src="${food.HinhAnh}" class="card-img-top" alt="${food.TenMon}">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between">
              <span class="badge bg-info text-dark mb-2">${food.DanhMuc}</span>
              ${statusBadge}
            </div>
            <h5 class="card-title fw-bold">${food.TenMon}</h5>
            <div class="price mb-2 text-success fw-bold fs-4">${formatPrice(food.Gia)}</div>
            <p class="text-warning mb-2">${renderStars(food.DanhGia)}</p>
            <p class="card-text text-muted small">${truncateText(food.MoTa, 60)}</p>
            <div class="d-flex gap-2 mt-auto align-items-center">
              <button class="btn btn-outline-success flex-fill rounded-pill" onclick='showDetail(${JSON.stringify(food)})'>
                Chi tiết
              </button>
<button class="btn btn-success rounded-circle ${disabledAttr}" onclick='addToCart(${JSON.stringify(food)}, document.getElementById("qty-${food.id}").value)'>
                <i class="fa-solid fa-cart-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  });

  $("#menu-list").html(html);
}

function filterPrice(range) {
  let filtered = foodsData;
  if (range === "low")
    filtered = foodsData.filter((f) => Number(f.Gia) < 100000);
  if (range === "high")
    filtered = foodsData.filter((f) => Number(f.Gia) >= 100000);
  displayFoods(filtered);
}

function sortFood(type) {
  let sorted = [...currentFilterData];
  if (type === "asc") sorted.sort((a, b) => Number(a.Gia) - Number(b.Gia));
  if (type === "desc") sorted.sort((a, b) => Number(b.Gia) - Number(a.Gia));
  displayFoods(sorted);
}

// ================= SEARCH =================

$("#searchInput").on("keyup", function () {
  const keyword = $(this).val().toLowerCase();

  const filteredFoods = foodsData.filter((food) =>
    food.TenMon.toLowerCase().includes(keyword),
  );

  displayFoods(filteredFoods);
});

// ================= FILTER CATEGORY =================

function filterCategory(category) {
  const filteredFoods = foodsData.filter((food) => food.DanhMuc === category);

  displayFoods(filteredFoods);
}

// ================= MODAL =================

function showDetail(food) {
  const html = `

    <img
      src="${food.HinhAnh}"
      class="img-fluid rounded mb-3"
    >

    <h3>

      ${food.TenMon}

    </h3>

    <p class="text-success fs-4 fw-bold">

      ${formatPrice(food.Gia)}

    </p>

    <p>

      ⭐ ${food.DanhGia}

    </p>

    <p>

      ${food.MoTa}

    </p>

  `;

  $("#modal-body").html(html);

  const modal = new bootstrap.Modal(document.getElementById("foodModal"));

  modal.show();
}

// ================= RUN =================

getCategories();

getFoods();

// ================= SHOW REGISTER =================

function showRegister() {
  $("#loginForm").addClass("d-none");

  $("#registerForm").removeClass("d-none");

  $("#modalTitle").text("Đăng ký");
}

// ================= SHOW LOGIN =================

function showLogin() {
  $("#registerForm").addClass("d-none");

  $("#loginForm").removeClass("d-none");

  $("#modalTitle").text("Đăng nhập");
}

// ================= REGISTER =================

$("#registerForm").submit(function (e) {
  e.preventDefault();

  const username = $("#registerUsername").val().trim();

  const password = $("#registerPassword").val().trim();

  const confirmPassword = $("#confirmPassword").val().trim();

  // USERNAME

  if (username === "") {
    alert("Username không được để trống");

    return;
  }

  if (username.length < 4) {
    alert("Username phải từ 4 ký tự");

    return;
  }

  // PASSWORD

  if (password === "") {
    alert("Password không được để trống");

    return;
  }

  if (password.length < 6) {
    alert("Password phải từ 6 ký tự");

    return;
  }

  // PASSWORD CÓ CHỮ VÀ SỐ

  const regexPassword = /^(?=.*[A-Za-z])(?=.*\d).+$/;

  if (!regexPassword.test(password)) {
    alert("Password phải có chữ và số");

    return;
  }

  // NHẬP LẠI PASSWORD

  if (password !== confirmPassword) {
    alert("Mật khẩu nhập lại không đúng");

    return;
  }

  // TẠO USER

  const user = {
    username,
    password,
  };

  // LƯU USER

  localStorage.setItem("user", JSON.stringify(user));

  alert("Đăng ký thành công");

  $("#registerForm")[0].reset();

  showLogin();
});

// ================= LOGIN =================

$("#loginForm").submit(function (e) {
  e.preventDefault();

  const username = $("#loginUsername").val();

  const password = $("#loginPassword").val();

  const savedUser = JSON.parse(localStorage.getItem("user"));

  if (
    savedUser &&
    username === savedUser.username &&
    password === savedUser.password
  ) {
    alert("Đăng nhập thành công");

    $("#loginModal").modal("hide");
  } else {
    alert("Sai tài khoản");
  }
});

// ================= TOGGLE SEARCH =================

function toggleSearch() {
  $("#searchInput").toggleClass("active");
}

// ================= GIỎ HÀNG =================

// LẤY GIỎ HÀNG TỪ localStorage

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= THÊM VÀO GIỎ =================

function addToCart(food, quantity) {
  let qty = Number(quantity);
  if (isNaN(qty) || qty < 1) qty = 1;

  const existingIndex = cart.findIndex(
    (item) => String(item.id) === String(food.id),
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity =
      Number(cart[existingIndex].quantity || 1) + qty;
  } else {
    cart.push({ ...food, quantity: qty });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`Đã thêm ${qty} sản phẩm vào giỏ hàng`);
}

// ================= CẬP NHẬT SỐ LƯỢNG =================

function updateCartCount() {
  const totalQuantity = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0,
  );

  $("#cart-count").text(totalQuantity);
}

// ================= THAY ĐỔI SỐ LƯỢNG =================

function changeQuantity(id, delta) {
  const item = cart.find((product) => String(product.id) === String(id));
  if (!item) return;

  item.quantity = Number(item.quantity || 1) + delta;

  if (item.quantity <= 0) {
    cart = cart.filter((product) => String(product.id) !== String(id));
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function setQuantity(id, value) {
  const item = cart.find((product) => String(product.id) === String(id));
  if (!item) return;

  const quantity = Math.max(1, Number(value) || 1);
  item.quantity = quantity;

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

// ================= HIỂN THỊ GIỎ HÀNG =================
function renderCart() {
  let html = "";
  let total = 0;

  if (cart.length === 0) {
    html = `
      <p class="text-center">Giỏ hàng trống</p>
    `;
  } else {
    cart.forEach((item) => {
      const quantity = Number(item.quantity || 1);
      const itemTotal = Number(item.Gia) * quantity;
      total += itemTotal;

      html += `
        <div class="d-flex align-items-center border-bottom py-3">
          <img
            src="${item.HinhAnh}"
            width="80"
            height="80"
            class="rounded object-fit-cover me-3"
          />

          <div class="flex-grow-1">
            <h6>${item.TenMon}</h6>
            <p class="text-success fw-bold mb-1">${formatPrice(item.Gia)} x ${quantity} = ${formatPrice(itemTotal)}</p>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-secondary btn-sm" onclick="changeQuantity('${item.id}', -1)">-</button>
              <input
                type="number"
                min="1"
                value="${quantity}"
                onchange="setQuantity('${item.id}', this.value)"
                class="form-control form-control-sm text-center"
                style="width: 80px;"
              />
              <button class="btn btn-outline-secondary btn-sm" onclick="changeQuantity('${item.id}', 1)">+</button>
            </div>
          </div>

          <button class="btn btn-danger btn-sm" onclick="removeCart('${item.id}')">Xóa</button>
        </div>
      `;
    });
  }

  $("#cart-body").html(html);
  $("#cart-total").text(formatPrice(total));
}

function showCart() {
  renderCart();

  if (!$("#cartModal").hasClass("show")) {
    const modal = new bootstrap.Modal(document.getElementById("cartModal"));
    modal.show();
  }
}

// ================= XÓA MÓN =================

function removeCart(id) {
  cart = cart.filter((item) => String(item.id) !== String(id));
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showCart();
}

// ================= THANH TOÁN =================

function checkout() {
  if (cart.length === 0) {
    alert("Giỏ hàng trống");
    return;
  }

  alert("Thanh toán thành công 🎉");
  cart = [];
  localStorage.removeItem("cart");

  // UPDATE

  updateCartCount();

  $("#cart-body").html("");

  $("#cart-total").text("0đ");
}

// ================= RUN CART =================

updateCartCount();
