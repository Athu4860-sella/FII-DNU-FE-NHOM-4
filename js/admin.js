// admin.js

// ================= BASE URL =================
const BASE_URL = "https://69fc37aafce564e259177aba.mockapi.io/api/v1";

const dishesAPI = BASE_URL + "/dishes";
const categoriesAPI = BASE_URL + "/categories";
const usersAPI = "https://6a096abce7e3f433d483134b.mockapi.io/admin";

// ================= STATE =================
let foodsData = [];
let editId = null;

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// ================= GET FOODS =================
function getFoods() {
  $("#loading").show();

  $.ajax({
    url: dishesAPI,
    method: "GET",
    success: function (data) {
      foodsData = data;
      displayFoods(data);
      $("#loading").hide();
    },
  });
}

// ================= DISPLAY =================
function displayFoods(data) {
  let html = "";

  data.forEach((food, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>

        <td>
          <img src="${food.HinhAnh}" width="60">
        </td>

        <td>
          <strong>${food.TenMon}</strong><br>
          <small>${food.MoTa || ""}</small>
        </td>

        <td>
          <span class="badge bg-success">${food.DanhMuc}</span>
        </td>

        <td>${formatPrice(food.Gia)}</td>

        <td>⭐ ${food.DanhGia}</td>

        <td>
          <button class="action-btn edit-btn"
            onclick="editFood('${food.id}')">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button class="action-btn delete-btn"
            onclick="deleteFood('${food.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  $("#foodTable").html(html);
}

// ================= CATEGORY =================
function getCategories() {
  $.ajax({
    url: categoriesAPI,
    method: "GET",
    success: function (data) {
      let html = `<option value="">Chọn danh mục</option>`;

      data.forEach((c) => {
        html += `
          <option value="${c.TenDanhMuc}">
            ${c.TenDanhMuc}
          </option>
        `;
      });

      $("#DanhMuc").html(html);
    },
  });
}

// ================= LOGIN =================
$("#loginForm").submit(async function (e) {
  e.preventDefault();

  const username = $("#username").val();
  const password = $("#password").val();

  const res = await fetch(usersAPI);
  const users = await res.json();

  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));

    $("#loginPage").hide();
    $("#adminPage").removeClass("d-none");

    alert("Đăng nhập thành công");
  } else {
    alert("Sai tài khoản hoặc mật khẩu");
  }
});

// ================= ADD + EDIT (FIXED) =================
$("#foodForm").submit(function (e) {
  e.preventDefault();

  const foodData = {
    TenMon: $("#TenMon").val(),
    Gia: $("#Gia").val(),
    DanhMuc: $("#DanhMuc").val(),
    HinhAnh: $("#HinhAnh").val(),
    DanhGia: $("#DanhGia").val(),
    MoTa: $("#MoTa").val(),
  };

  // ================= EDIT =================
  if (editId) {
    $.ajax({
      url: `${dishesAPI}/${editId}`,
      method: "PUT",
      data: foodData,
      success: function () {
        alert("Cập nhật thành công");

        $("#foodForm")[0].reset();
        editId = null;

        $(".modal-title").text("Thêm món ăn");

        bootstrap.Modal.getInstance(
          document.getElementById("foodModal"),
        ).hide();

        getFoods();
      },
    });

    return;
  }

  // ================= ADD =================
  $.ajax({
    url: dishesAPI,
    method: "POST",
    data: foodData,
    success: function () {
      alert("Thêm món ăn thành công");

      $("#foodForm")[0].reset();

      bootstrap.Modal.getInstance(document.getElementById("foodModal")).hide();

      getFoods();
    },
  });
});

// ================= EDIT FIXED =================
function editFood(id) {
  console.log("CLICK EDIT ID:", id);
  console.log("DATA:", foodsData);

  const food = foodsData.find((item) => String(item.id) === String(id));

  if (!food) {
    alert("Không tìm thấy món ăn!");
    return;
  }

  editId = id;

  $("#TenMon").val(food.TenMon);
  $("#Gia").val(food.Gia);
  $("#DanhMuc").val(food.DanhMuc);
  $("#HinhAnh").val(food.HinhAnh);
  $("#DanhGia").val(food.DanhGia);
  $("#MoTa").val(food.MoTa);

  $(".modal-title").text("Cập nhật món ăn");

  const modal = new bootstrap.Modal(document.getElementById("foodModal"));

  modal.show();
}

// ================= DELETE =================
function deleteFood(id) {
  if (!confirm("Bạn có chắc muốn xóa?")) return;

  $.ajax({
    url: `${dishesAPI}/${id}`,
    method: "DELETE",
    success: function () {
      alert("Xóa thành công");
      getFoods();
    },
  });
}

// ================= SEARCH =================
$("#searchInput").on("keyup", function () {
  const key = $(this).val().toLowerCase();

  const filtered = foodsData.filter((f) =>
    f.TenMon.toLowerCase().includes(key),
  );

  displayFoods(filtered);
});

// ================= INIT =================
getFoods();
getCategories();
