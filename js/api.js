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

async function getFoods() {
  $("#loading").show();

  const response = await fetch(dishesAPI);

  const data = await response.json();

  foodsData = data;

  displayFoods(data);

  $("#loading").hide();
}

// ================= DISPLAY FOODS =================

function displayFoods(data) {
  let html = "";

  // DUYỆT QUA TỪNG MÓN ĂN

  data.forEach((food) => {
    html += `

      <div class="col-12 col-md-6 col-lg-4">

        <div class="card food-card h-100">

          <!-- HÌNH ẢNH -->

          <img
            src="${food.HinhAnh}"
            class="card-img-top"
          >

          <div class="card-body d-flex flex-column">

            <!-- DANH MỤC -->

            <span class="badge bg-success mb-2">

              ${food.DanhMuc}

            </span>

            <!-- TÊN MÓN -->

            <h5 class="card-title">

              ${food.TenMon}

            </h5>

            <!-- GIÁ -->

            <div class="price mb-2">

              ${formatPrice(food.Gia)}

            </div>

            <!-- ĐÁNH GIÁ -->

            <p class="text-warning">

              ⭐ ${food.DanhGia}

            </p>

            <!-- MÔ TẢ -->

            <p class="card-text">

              ${food.MoTa}

            </p>

            <!-- BUTTON -->

            <div class="d-flex gap-2 mt-auto">

              <!-- XEM CHI TIẾT -->

              <button
                class="btn btn-success flex-fill"
                onclick='showDetail(${JSON.stringify(food)})'
              >

                Xem chi tiết

              </button>

              <!-- THÊM VÀO GIỎ -->

              <button
                class="btn btn-warning"
                onclick='addToCart(${JSON.stringify(food)})'
              >

                <i class="fa-solid fa-cart-plus"></i>

              </button>

            </div>

          </div>

        </div>

      </div>

    `;
  });

  // HIỂN THỊ RA HTML

  $("#menu-list").html(html);
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

function addToCart(food) {
  // THÊM MÓN ĂN VÀO GIỎ

  cart.push(food);

  // LƯU GIỎ HÀNG

  localStorage.setItem("cart", JSON.stringify(cart));

  // CẬP NHẬT SỐ LƯỢNG

  updateCartCount();

  alert("Đã thêm vào giỏ hàng");
}

// ================= CẬP NHẬT SỐ LƯỢNG =================

function updateCartCount() {
  $("#cart-count").text(cart.length);
}

// ================= HIỂN THỊ GIỎ HÀNG =================

function showCart() {
  let html = "";

  let total = 0;

  // NẾU GIỎ HÀNG TRỐNG

  if (cart.length === 0) {
    html = `

      <p class="text-center">

        Giỏ hàng trống

      </p>

    `;
  } else {
    // DUYỆT TỪNG MÓN ĂN

    cart.forEach((item, index) => {
      total += Number(item.Gia);

      html += `

        <div class="d-flex align-items-center border-bottom py-3">

          <!-- HÌNH -->

          <img
            src="${item.HinhAnh}"
            width="80"
            height="80"
            class="rounded object-fit-cover me-3"
          >

          <!-- THÔNG TIN -->

          <div class="flex-grow-1">

            <h6>

              ${item.TenMon}

            </h6>

            <p class="text-success fw-bold mb-1">

              ${formatPrice(item.Gia)}

            </p>

          </div>

          <!-- NÚT XÓA -->

          <button
            class="btn btn-danger btn-sm"
            onclick="removeCart(${index})"
          >

            Xóa

          </button>

        </div>

      `;
    });
  }

  // HIỂN THỊ HTML

  $("#cart-body").html(html);

  // HIỂN THỊ TỔNG TIỀN

  $("#cart-total").text(formatPrice(total));

  // MỞ MODAL

  const modal = new bootstrap.Modal(document.getElementById("cartModal"));

  modal.show();
}

// ================= XÓA MÓN =================

function removeCart(index) {
  // XÓA MÓN KHỎI GIỎ

  cart.splice(index, 1);

  // LƯU LẠI

  localStorage.setItem("cart", JSON.stringify(cart));

  // UPDATE

  updateCartCount();

  showCart();
}

// ================= THANH TOÁN =================

function checkout() {
  // KIỂM TRA GIỎ HÀNG

  if (cart.length === 0) {
    alert("Giỏ hàng trống");

    return;
  }

  alert("Thanh toán thành công 🎉");

  // RESET GIỎ HÀNG

  cart = [];

  localStorage.removeItem("cart");

  // UPDATE

  updateCartCount();

  $("#cart-body").html("");

  $("#cart-total").text("0đ");
}

// ================= RUN CART =================

updateCartCount();
