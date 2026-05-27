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
          <button type="button" class="btn btn-edit-admin btn-edit me-1" data-id="${food.id}">
            <i class="fa-solid fa-pen me-1"></i>Sửa
          </button>
          <button type="button" class="btn btn-delete-admin btn-delete" data-id="${food.id}">
            <i class="fa-solid fa-trash me-1"></i>Xóa
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

// ================= SECTION SWITCHING =================

function showSection(section) {
  document.getElementById("foods-section").style.display =
    section === "foods" ? "block" : "none";
  document.getElementById("combo-section").style.display =
    section === "combo" ? "block" : "none";

  document
    .getElementById("nav-foods")
    .classList.toggle("active", section === "foods");
  document
    .getElementById("nav-combo")
    .classList.toggle("active", section === "combo");

  if (section === "combo") renderComboTable();
}

// ================= COMBO CRUD =================

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

function loadCombos() {
  try {
    const saved = localStorage.getItem("combos");
    if (saved) return JSON.parse(saved);
  } catch {}
  localStorage.setItem("combos", JSON.stringify(DEFAULT_COMBOS));
  return [...DEFAULT_COMBOS];
}

function saveCombos(data) {
  localStorage.setItem("combos", JSON.stringify(data));
}

function renderComboTable() {
  const combos = loadCombos();
  const tbody = document.getElementById("comboTable");
  const statEl = document.getElementById("stat-combo-total");
  if (statEl) statEl.textContent = combos.length;

  if (!combos.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Chưa có combo nào</td></tr>`;
    return;
  }

  tbody.innerHTML = combos
    .map((c, i) => {
      const discount = Math.round((1 - c.Gia / c.oldPrice) * 100);
      const itemsList = (c.items || [])
        .map((it) => `<div>${it}</div>`)
        .join("");
      return `
      <tr>
        <td>${i + 1}</td>
        <td><img src="${c.img}" width="70" height="70"
              style="object-fit:cover;border-radius:10px"
              onerror="this.src='https://via.placeholder.com/70'" /></td>
        <td><strong>${c.TenMon}</strong><br/>
            <span class="badge bg-danger">-${discount}%</span></td>
        <td><small>${itemsList}</small></td>
        <td><s class="text-muted">${formatPrice(c.oldPrice)}</s></td>
        <td class="text-success fw-bold">${formatPrice(c.Gia)}</td>
        <td><span class="badge bg-success">${c.tag || ""}</span></td>
        <td>
          <button class="btn btn-edit-admin me-1" onclick="editCombo('${c.id}')">
            <i class="fa-solid fa-pen me-1"></i>Sửa
          </button>
          <button class="btn btn-delete-admin" onclick="deleteCombo('${c.id}')">
            <i class="fa-solid fa-trash me-1"></i>Xóa
          </button>
        </td>
      </tr>`;
    })
    .join("");
}

let editComboId = null;
const comboModalEl = document.getElementById("comboModal");
const comboModal = comboModalEl ? new bootstrap.Modal(comboModalEl) : null;
const comboForm = document.getElementById("comboForm");

function openComboModal(id = null) {
  editComboId = id;
  document.getElementById("comboModalTitle").textContent = id
    ? "Sửa Combo"
    : "Thêm Combo";
  document.getElementById("err-combo-name").textContent = "";
  document.getElementById("err-combo-price").textContent = "";
  document.getElementById("err-combo-old-price").textContent = "";
  document.getElementById("err-combo-img").textContent = "";

  if (id) {
    const combo = loadCombos().find((c) => c.id === id);
    if (combo) {
      document.getElementById("combo-name").value = combo.TenMon;
      document.getElementById("combo-price").value = combo.Gia;
      document.getElementById("combo-old-price").value = combo.oldPrice;
      document.getElementById("combo-img").value = combo.img;
      document.getElementById("combo-tag").value = combo.tag || "";
      document.getElementById("combo-items-input").value = (
        combo.items || []
      ).join("\n");
    }
  } else {
    comboForm.reset();
  }
  comboModal && comboModal.show();
}

function editCombo(id) {
  openComboModal(id);
}

function deleteCombo(id) {
  if (!confirm("Bạn có chắc muốn xóa combo này?")) return;
  const combos = loadCombos().filter((c) => c.id !== id);
  saveCombos(combos);
  renderComboTable();
  showMessage("Đã xóa combo!", "success");
}

comboForm &&
  comboForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("combo-name").value.trim();
    const price = Number(document.getElementById("combo-price").value);
    const oldPrice = Number(document.getElementById("combo-old-price").value);
    const img = document.getElementById("combo-img").value.trim();
    const tag = document.getElementById("combo-tag").value.trim();
    const itemsRaw = document.getElementById("combo-items-input").value.trim();

    let valid = true;
    document.getElementById("err-combo-name").textContent = "";
    document.getElementById("err-combo-price").textContent = "";
    document.getElementById("err-combo-old-price").textContent = "";
    document.getElementById("err-combo-img").textContent = "";

    if (!name) {
      document.getElementById("err-combo-name").textContent =
        "Tên không được trống";
      valid = false;
    }
    if (!price || price <= 0) {
      document.getElementById("err-combo-price").textContent = "Giá phải > 0";
      valid = false;
    }
    if (!oldPrice || oldPrice <= price) {
      document.getElementById("err-combo-old-price").textContent =
        "Giá gốc phải lớn hơn giá ưu đãi";
      valid = false;
    }
    if (!img.startsWith("http")) {
      document.getElementById("err-combo-img").textContent =
        "Link ảnh không hợp lệ";
      valid = false;
    }
    if (!valid) return;

    const items = itemsRaw
      ? itemsRaw
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const combos = loadCombos();

    if (editComboId) {
      const idx = combos.findIndex((c) => c.id === editComboId);
      if (idx >= 0)
        combos[idx] = {
          ...combos[idx],
          TenMon: name,
          Gia: price,
          oldPrice,
          img,
          tag,
          items,
        };
    } else {
      combos.push({
        id: "combo-" + Date.now(),
        TenMon: name,
        Gia: price,
        oldPrice,
        img,
        tag,
        items,
      });
    }

    saveCombos(combos);
    comboModal && comboModal.hide();
    renderComboTable();
    showMessage(
      editComboId ? "Cập nhật combo thành công!" : "Thêm combo thành công!",
      "success",
    );
    editComboId = null;
  });
