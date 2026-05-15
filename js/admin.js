// admin.js

// ================= BASE URL =================

const BASE_URL = "https://69fc37aafce564e259177aba.mockapi.io/api/v1";

// ================= APIs =================

const dishesAPI = "https://69fc37aafce564e259177aba.mockapi.io/api/v1/dishes";

const categoriesAPI =
  "https://69fc37aafce564e259177aba.mockapi.io/api/v1/categories";

// ================= DATA =================

let foodsData = [];

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

// ================= DISPLAY FOODS =================

function displayFoods(data) {
  let html = "";

  data.forEach((food, index) => {
    html += `

            <tr>

                <td>
                    ${index + 1}
                </td>

                <td>

                    <img src="${food.HinhAnh}">

                </td>

                <td>

                    <strong>

                        ${food.TenMon}

                    </strong>

                    <br>

                    <small>

                        ${food.MoTa}

                    </small>

                </td>

                <td>

                    <span class="badge bg-success">

                        ${food.DanhMuc}

                    </span>

                </td>

                <td>

                    ${food.Gia}đ

                </td>

                <td>

                    ⭐ ${food.DanhGia}

                </td>

                <td>

                    <button
                            class="action-btn edit-btn"
                            onclick="editFood('${food.id}')">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                            class="action-btn delete-btn"
                            onclick="deleteFood('${food.id}')">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;
  });

  $("#foodTable").html(html);
}

// ================= GET CATEGORIES =================

function getCategories() {
  $.ajax({
    url: categoriesAPI,

    method: "GET",

    success: function (data) {
      let html = `

                <option value="">
                    Chọn danh mục
                </option>

            `;

      data.forEach((category) => {
        html += `

                    <option>

                        ${category.TenDanhMuc}

                    </option>

                `;
      });

      $("#DanhMuc").html(html);
    },
  });
}

// ================= ADD FOOD =================

$("#foodForm").submit(function (e) {
  e.preventDefault();
  // GET VALUES

  const TenMon = $("#TenMon").val();

  const Gia = $("#Gia").val();

  const DanhMuc = $("#DanhMuc").val();

  const HinhAnh = $("#HinhAnh").val();

  const DanhGia = $("#DanhGia").val();

  const MoTa = $("#MoTa").val();

  // RESET ERROR

  $("#errorTenMon").text("");

  $("#errorGia").text("");

  $("#errorDanhMuc").text("");

  // VALIDATION

  if (TenMon === "") {
    $("#errorTenMon").text("Tên món không được để trống");

    return;
  }

  if (Gia === "") {
    $("#errorGia").text("Giá món không được để trống");

    return;
  }

  if (DanhMuc === "") {
    $("#errorDanhMuc").text("Vui lòng chọn danh mục");

    return;
  }

  // OBJECT

  const newFood = {
    TenMon,
    Gia,
    DanhMuc,
    HinhAnh,
    DanhGia,
    MoTa,
  };

  // POST API

  $.ajax({
    url: dishesAPI,

    method: "POST",

    data: newFood,

    success: function () {
      alert("Thêm món ăn thành công");

      $("#foodForm")[0].reset();

      getFoods();

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("foodModal"),
      );

      modal.hide();
    },
  });
});

// ================= DELETE =================

function deleteFood(id) {
  const confirmDelete = confirm("Bạn có chắc muốn xóa món ăn này?");

  if (confirmDelete) {
    $.ajax({
      url: `${dishesAPI}/${id}`,

      method: "DELETE",

      success: function () {
        alert("Xóa thành công");

        getFoods();
      },
    });
  }
}

// ================= EDIT =================

function editFood(id) {
  const food = foodsData.find((item) => item.id == id);

  // FILL FORM

  $("#TenMon").val(food.TenMon);

  $("#Gia").val(food.Gia);

  $("#DanhMuc").val(food.DanhMuc);

  $("#HinhAnh").val(food.HinhAnh);

  $("#DanhGia").val(food.DanhGia);

  $("#MoTa").val(food.MoTa);

  // CHANGE TITLE

  $(".modal-title").text("Cập nhật món ăn");

  // SHOW MODAL

  const modal = new bootstrap.Modal(document.getElementById("foodModal"));

  modal.show();

  // REMOVE OLD SUBMIT

  $("#foodForm").off("submit");

  // UPDATE SUBMIT

  $("#foodForm").submit(function (e) {
    e.preventDefault();

    const updatedFood = {
      TenMon: $("#TenMon").val(),

      Gia: $("#Gia").val(),

      DanhMuc: $("#DanhMuc").val(),

      HinhAnh: $("#HinhAnh").val(),

      DanhGia: $("#DanhGia").val(),

      MoTa: $("#MoTa").val(),
    };

    $.ajax({
      url: `${dishesAPI}/${id}`,

      method: "PUT",

      data: updatedFood,
      success: function () {
        alert("Cập nhật thành công");

        $("#foodForm")[0].reset();

        modal.hide();

        getFoods();

        resetFormSubmit();
      },
    });
  });
}

// ================= RESET SUBMIT =================

function resetFormSubmit() {
  $("#foodForm").off("submit");

  $("#foodForm").submit(function (e) {
    e.preventDefault();
  });
}

// ================= SEARCH =================

$("#searchInput").on("keyup", function () {
  const keyword = $(this).val().toLowerCase();

  const filteredFoods = foodsData.filter((food) =>
    food.TenMon.toLowerCase().includes(keyword),
  );

  displayFoods(filteredFoods);
});

// ================= RUN =================

getFoods();

getCategories();
