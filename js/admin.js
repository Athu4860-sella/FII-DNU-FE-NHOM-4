// admin.js

// ================= BASE =================

const BASE_URL = "https://69fc37aafce564e259177aba.mockapi.io/api/v1";
const dishesAPI = `${BASE_URL}/dishes`;
const categoriesAPI = `${BASE_URL}/categories`;

// ================= STATE =================

let foodsData = [];
let editId = null;

// ================= ELEMENTS =================

const foodForm = document.getElementById("foodForm");
const loadingEl = document.getElementById("loading");
const foodTable = document.getElementById("foodTable");
const searchInput = document.getElementById("searchInput");
const fetchError = document.getElementById("fetchError");
const modalTitle = document.getElementById("modalTitle");
const formMessage = document.getElementById("formMessage");
const foodModalEl = document.getElementById("foodModal");
const foodModal = new bootstrap.Modal(foodModalEl);

const tenMonEl = document.getElementById("TenMon");
const giaEl = document.getElementById("Gia");
const danhMucEl = document.getElementById("DanhMuc");
const hinhAnhEl = document.getElementById("HinhAnh");
const danhGiaEl = document.getElementById("DanhGia");
const isAvailableEl = document.getElementById("isAvailable");
const moTaEl = document.getElementById("MoTa");

const errTenMon = document.getElementById("errTenMon");
const errGia = document.getElementById("errGia");
const errDanhMuc = document.getElementById("errDanhMuc");
const errHinhAnh = document.getElementById("errHinhAnh");

const statTotalEl = document.getElementById("stat-total");
const statAvailableEl = document.getElementById("stat-available");
const statEmptyEl = document.getElementById("stat-empty");

// ================= UTIL =================

function showLoading() {
  loadingEl.style.display = "block";
}

function hideLoading() {
  loadingEl.style.display = "none";
}

function setFetchError(message) {
  fetchError.textContent = message;
  fetchError.style.display = message ? "block" : "none";
}

function setFormMessage(message, isError = true) {
  formMessage.textContent = message;
  formMessage.classList.toggle("text-danger", isError);
  formMessage.classList.toggle("text-success", !isError);
}

function clearErrors() {
  errTenMon.innerText = "";
  errGia.innerText = "";
  errDanhMuc.innerText = "";
  errHinhAnh.innerText = "";
  setFormMessage("", true);
}

function validateForm() {
  clearErrors();

  const tenMon = tenMonEl.value.trim();
  const gia = Number(giaEl.value);
  const danhMuc = danhMucEl.value;
  const hinhAnh = hinhAnhEl.value.trim();

  let isValid = true;

  if (isEmpty(tenMon)) {
    errTenMon.innerText = "Tên không được trống";
    isValid = false;
  }

  if (!isValidPrice(gia)) {
    errGia.innerText = "Giá phải > 0";
    isValid = false;
  }

  if (danhMuc === "") {
    errDanhMuc.innerText = "Chọn danh mục";
    isValid = false;
  }

  if (!hinhAnh.startsWith("http")) {
    errHinhAnh.innerText = "Link ảnh không hợp lệ";
    isValid = false;
  }

  return isValid;
}

function resetForm() {
  editId = null;
  foodForm.reset();
  modalTitle.innerText = "Thêm món ăn";
  isAvailableEl.checked = true;
  clearErrors();
}

// ================= FETCH FOODS =================

function getFoods() {
  showLoading();
  setFetchError("");

  fetch(dishesAPI)
    .then((response) => {
      if (!response.ok) throw new Error("Network error");
      return response.json();
    })
    .then((data) => {
      foodsData = data;
      renderFoods(data);
      hideLoading();
    })
    .catch(() => {
      hideLoading();
      setFetchError("Lỗi tải dữ liệu món ăn. Vui lòng thử lại.");
    });
}

// ================= FETCH CATEGORIES =================

function getCategories() {
  fetch(categoriesAPI)
    .then((response) => {
      if (!response.ok) throw new Error("Network error");
      return response.json();
    })
    .then((data) => {
      let html = "<option value=''>Chọn danh mục</option>";
      let i = 0;
      while (i < data.length) {
        html += `<option value="${data[i].TenDanhMuc}">${data[i].TenDanhMuc}</option>`;
        i++;
      }
      danhMucEl.innerHTML = html;
    })
    .catch(() => {
      setFetchError("Không tải được danh mục.");
    });
}

// ================= RENDER FOODS =================

function renderFoods(data) {
  let html = "";
  let i = 0;
  let countAvailable = 0;

  while (i < data.length) {
    const food = data[i];
    const isAvailable = food.isAvailable !== false;
    if (isAvailable) countAvailable++;

    html += `
      <tr>
        <td>${i + 1}</td>
        <td>
          <img src="${food.HinhAnh || "https://via.placeholder.com/70"}"
            width="70" height="70"
            style="object-fit:cover; border-radius:10px;"
            onerror="this.src='https://via.placeholder.com/70'" />
        </td>
        <td>
          <strong>${food.TenMon}</strong><br />
          <small>${truncateText(food.MoTa || "", 60)}</small>
        </td>
        <td><span class="badge bg-success">${food.DanhMuc}</span></td>
        <td>${formatPrice(food.Gia)}</td>
        <td>
          ${
            isAvailable
              ? '<span class="badge bg-success">Còn món</span>'
              : '<span class="badge bg-danger">Hết món</span>'
          }
        </td>
        <td>${renderStars(Math.round(food.DanhGia))} ${food.DanhGia || 0}</td>
        <td>
          <button type="button" class="btn btn-warning btn-sm btn-edit" data-id="${food.id}">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button type="button" class="btn btn-danger btn-sm btn-delete" data-id="${food.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
    i++;
  }

  if (html === "") {
    html = `<tr><td colspan="8" class="text-center">Không có món ăn phù hợp</td></tr>`;
  }

  foodTable.innerHTML = html;
  statTotalEl.innerText = data.length;
  statAvailableEl.innerText = countAvailable;
  statEmptyEl.innerText = data.length - countAvailable;
}

// ================= SUBMIT FORM =================

foodForm.addEventListener("submit", function (event) {
  event.preventDefault();
  clearErrors();

  if (!validateForm()) {
    setFormMessage("Vui lòng sửa các lỗi bên trên.", true);
    return;
  }

  const foodData = {
    TenMon: tenMonEl.value.trim(),
    Gia: Number(giaEl.value),
    DanhMuc: danhMucEl.value,
    HinhAnh: hinhAnhEl.value.trim(),
    DanhGia: Number(danhGiaEl.value) || 0,
    isAvailable: isAvailableEl.checked,
    MoTa: moTaEl.value.trim(),
  };

  const requestUrl = editId ? `${dishesAPI}/${editId}` : dishesAPI;
  const requestMethod = editId ? "PUT" : "POST";
  const successMessage = editId ? "Cập nhật thành công" : "Thêm thành công";
  const failureMessage = editId ? "Cập nhật thất bại" : "Thêm thất bại";

  fetch(requestUrl, {
    method: requestMethod,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(foodData),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network error");
      return response.json();
    })
    .then(() => {
      setFormMessage(successMessage, false);
      resetForm();
      foodModal.hide();
      getFoods();
    })
    .catch(() => {
      setFormMessage(failureMessage, true);
    });
});

// ================= OPEN MODAL =================

const addButton = document.querySelector(
  '[data-bs-toggle="modal"][data-bs-target="#foodModal"]',
);
if (addButton) {
  addButton.addEventListener("click", function () {
    resetForm();
    setFormMessage("", true);
  });
}

// ================= EDIT / DELETE =================

foodTable.addEventListener("click", function (event) {
  const editButton = event.target.closest(".btn-edit");
  const deleteButton = event.target.closest(".btn-delete");

  if (editButton) handleEdit(editButton.dataset.id);
  if (deleteButton) handleDelete(deleteButton.dataset.id);
});

function handleEdit(id) {
  const food = foodsData.find((item) => String(item.id) === String(id));
  if (!food) {
    setFetchError("Không tìm thấy món ăn.");
    return;
  }

  editId = id;
  modalTitle.innerText = "Cập nhật món ăn";
  tenMonEl.value = food.TenMon || "";
  giaEl.value = food.Gia || "";
  danhMucEl.value = food.DanhMuc || "";
  hinhAnhEl.value = food.HinhAnh || "";
  danhGiaEl.value = food.DanhGia || "";
  isAvailableEl.checked = food.isAvailable !== false;
  moTaEl.value = food.MoTa || "";
  clearErrors();
  setFormMessage("", true);
  foodModal.show();
}

function handleDelete(id) {
  const confirmed = window.confirm("Bạn có chắc muốn xóa món ăn này?");
  if (!confirmed) return;

  fetch(`${dishesAPI}/${id}`, { method: "DELETE" })
    .then((response) => {
      if (!response.ok) throw new Error("Network error");
      return response.json();
    })
    .then(() => {
      getFoods();
    })
    .catch(() => {
      setFetchError("Xóa thất bại. Vui lòng thử lại.");
    });
}

// ================= SEARCH =================

searchInput.addEventListener("input", function () {
  const keyword = this.value.trim().toLowerCase();
  const filtered = foodsData.filter((food) =>
    food.TenMon.toLowerCase().includes(keyword),
  );
  renderFoods(filtered);
});

// ================= LOGOUT =================

function logout() {
  localStorage.removeItem("isLogin");
  window.location.href = "index.html";
}

// ================= INIT =================

hideLoading();
getFoods();
getCategories();
