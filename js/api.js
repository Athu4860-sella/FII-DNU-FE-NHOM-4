// api.js

// ================= BASE URL =================

const BASE_URL = "https://69fc37aafce564e259177aba.mockapi.io/api/v1";
const dishesAPI = `${BASE_URL}/dishes`;
const categoriesAPI = `${BASE_URL}/categories`;

// ================= STATE =================

let foodsData = [];
let currentFilterData = [];

// ================= GET CATEGORIES =================

async function getCategories() {
  const response = await fetch(categoriesAPI);
  const data = await response.json();

  let html = "";
  data.forEach((category) => {
    html += `
      <div class="col-6 col-md-4 col-lg-2">
        <div class="category-card" onclick="filterCategory('${category.TenDanhMuc}')">
          <img src="${category.HinhAnh}" />
          <h6 class="mt-2">${category.TenDanhMuc}</h6>
        </div>
      </div>
    `;
  });

  $("#categories-list").html(html);
}

// ================= GET FOODS =================

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
    $("#menu-list").html(
      `<p class='text-center'>Không tìm thấy món ăn phù hợp.</p>`,
    );
    return;
  }

  data.forEach((food) => {
    const isAvailable = food.isAvailable !== false;

    html += `
      <div class="col-12 col-md-6 col-lg-4" data-aos="fade-up">
        <div class="card food-card h-100 shadow-sm border-0">
          <img src="${food.HinhAnh}" class="card-img-top" style="height:200px; object-fit:cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="fw-bold mb-1">${food.TenMon}</h5>
            <div class="price text-success fw-bold fs-4 mb-2">${formatPrice(food.Gia)}</div>

            <div class="d-flex align-items-center mb-3">
              <small class="me-2 text-muted">Số lượng:</small>
              <input type="number" id="qty-${food.id}" class="form-control form-control-sm w-25 text-center shadow-none" value="1" min="1">
            </div>

            <div class="d-flex gap-2 mt-auto">
              <button class="btn btn-outline-success flex-fill rounded-pill" onclick='showDetail(${JSON.stringify(food)})'>
                Chi tiết
              </button>
              <button class="btn btn-success rounded-circle ${isAvailable ? "" : "disabled"}"
                onclick='addToCart(${JSON.stringify(food)}, document.getElementById("qty-${food.id}").value)'>
                <i class="fa-solid fa-cart-plus"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  $("#menu-list").html(html);
}

// ================= FILTER THEO CATEGORY =================

function filterCategory(category) {
  const filteredFoods = foodsData.filter((food) => food.DanhMuc === category);
  displayFoods(filteredFoods);
}

// ================= FILTER THEO GIÁ =================

function filterPrice(type, btn) {
  document
    .querySelectorAll(".filter-pill")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  let result = [...foodsData];

  if (type === "low") {
    result = foodsData.filter((food) => food.Gia < 100000);
  } else if (type === "high") {
    result = foodsData.filter((food) => food.Gia >= 100000);
  }

  displayFoods(result);
}

// ================= SẮP XẾP =================

function sortFood(value) {
  let result = [...currentFilterData];

  if (value === "asc") {
    result.sort((a, b) => a.Gia - b.Gia);
  } else if (value === "desc") {
    result.sort((a, b) => b.Gia - a.Gia);
  }

  displayFoods(result);
}

// ================= CHI TIẾT MÓN ĂN =================

function showDetail(food) {
  const html = `
    <img src="${food.HinhAnh}" class="img-fluid rounded mb-3" />
    <h3>${food.TenMon}</h3>
    <p class="text-success fs-4 fw-bold">${formatPrice(food.Gia)}</p>
    <p>${renderStars(Math.round(food.DanhGia))} ${food.DanhGia}</p>
    <p>${food.MoTa}</p>
  `;

  $("#modal-body").html(html);
  const modal = new bootstrap.Modal(document.getElementById("foodModal"));
  modal.show();
}
