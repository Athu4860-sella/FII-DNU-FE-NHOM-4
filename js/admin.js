// ================= BASE URL =================

const BASE_URL = "https://69fc37aafce564e259177aba.mockapi.io/api/v1";

const dishesAPI = BASE_URL + "/dishes";

const categoriesAPI = BASE_URL + "/categories";

// ================= STATE =================

let foodsData = [];

let editId = null;

// ================= FORMAT PRICE =================

function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN") + "đ";
}

// ================= LOGOUT =================

function logout() {
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

    error: function () {
      alert("Không tải được dữ liệu");
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
          <img
            src="${food.HinhAnh || "https://via.placeholder.com/70"}"

            width="70"
            height="70"

            style="
              object-fit: cover;
              border-radius: 10px;
            "

            onerror="
              this.src='https://via.placeholder.com/70'
            "
          >
        </td>

        <td>
          <strong>${food.TenMon}</strong>

          <br>

          <small>
            ${food.MoTa || ""}
          </small>
        </td>

        <td>
          <span class="badge bg-success">
            ${food.DanhMuc}
          </span>
        </td>

        <td>
          ${formatPrice(food.Gia)}
        </td>

        <td>
          ⭐ ${food.DanhGia || 0}
        </td>

        <td>
          <button
            class="btn btn-warning btn-sm"
            onclick="editFood('${food.id}')"
          >
            <i class="fa-solid fa-pen"></i>
          </button>

          <button
            class="btn btn-danger btn-sm"
            onclick="deleteFood('${food.id}')"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  $("#foodTable").html(html);
}

// ================= GET CATEGORY =================

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

// ================= RESET FORM =================

$('[data-bs-target="#foodModal"]').click(function () {
  editId = null;

  $("#foodForm")[0].reset();

  $(".modal-title").text("Thêm món ăn");
});

// ================= ADD + EDIT =================

$("#foodForm").submit(function (e) {
  e.preventDefault();

  const foodData = {
    TenMon: $("#TenMon").val().trim(),

    Gia: $("#Gia").val(),

    DanhMuc: $("#DanhMuc").val(),

    HinhAnh: $("#HinhAnh").val().trim(),

    DanhGia: $("#DanhGia").val(),

    MoTa: $("#MoTa").val().trim(),
  };

  // VALIDATE

  if (!foodData.TenMon || !foodData.Gia || !foodData.DanhMuc) {
    alert("Vui lòng nhập đầy đủ thông tin");

    return;
  }

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

        const modal = bootstrap.Modal.getOrCreateInstance(
          document.getElementById("foodModal"),
        );

        modal.hide();

        getFoods();
      },

      error: function () {
        alert("Cập nhật thất bại");
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

      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("foodModal"),
      );

      modal.hide();

      getFoods();
    },

    error: function () {
      alert("Thêm món ăn thất bại");
    },
  });
});

// ================= EDIT =================

function editFood(id) {
  const food = foodsData.find((item) => String(item.id) === String(id));

  if (!food) {
    alert("Không tìm thấy món ăn");

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

  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("foodModal"),
  );

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

    error: function () {
      alert("Xóa thất bại");
    },
  });
}

// ================= SEARCH =================

$("#searchInput").on("keyup", function () {
  const keyword = $(this).val().toLowerCase();

  const filtered = foodsData.filter((food) =>
    food.TenMon.toLowerCase().includes(keyword),
  );

  displayFoods(filtered);
});

// ================= INIT =================

getFoods();

getCategories();
