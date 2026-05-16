// app.js

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

                <div class="category-card"
                     onclick="filterCategory('${category.TenDanhMuc}')">

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

  data.forEach((food) => {
    html += `

            <div class="col-12 col-md-6 col-lg-4">

                <div class="card food-card h-100">

                    <img src="${food.HinhAnh}"
                         class="card-img-top">

                    <div class="card-body d-flex flex-column">

                        <span class="badge bg-success mb-2">

                            ${food.DanhMuc}

                        </span>

                        <h5 class="card-title">

                            ${food.TenMon}

                        </h5>

                        <div class="price mb-2">

                            ${formatPrice(food.Gia)}

                        </div>

                        <p class="text-warning">

                            ⭐ ${food.DanhGia}

                        </p>

                        <p class="card-text">

                            ${food.MoTa}

                        </p>

                        <button
                                class="btn btn-success mt-auto"
                                onclick='showDetail(${JSON.stringify(food)})'>

                            Xem chi tiết

                        </button>

                    </div>

                </div>

            </div>

        `;
  });

  $("#menu-list").html(html);// chỗ này là id của div chứa danh sách món ăn, 
  // nó sẽ được thay thế bằng html mới mỗi khi
  //  hiển thị lại danh sách món ăn 
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

        <img src="${food.HinhAnh}"
             class="img-fluid rounded mb-3">

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
