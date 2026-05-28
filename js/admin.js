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

async function getFoods() {
  showLoading();
  setFetchError("");
  try {
    const res = await fetch(dishesAPI);
    if (!res.ok) throw new Error("Network error");
    foodsData = await res.json();
    renderFoods(foodsData);
  } catch {
    setFetchError("Lỗi tải dữ liệu món ăn. Vui lòng thử lại.");
  } finally {
    hideLoading();
  }
}

// ================= FETCH CATEGORIES =================

async function getCategories() {
  try {
    const res = await fetch(categoriesAPI);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    danhMucEl.innerHTML = [
      "<option value=''>Chọn danh mục</option>",
      ...data.map(
        (d) => `<option value="${d.TenDanhMuc}">${d.TenDanhMuc}</option>`,
      ),
    ].join("");
  } catch {
    setFetchError("Không tải được danh mục.");
  }
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
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-edit-admin btn-edit" data-id="${food.id}">
              <i class="fa-solid fa-pen me-1"></i>Sửa
            </button>
            <button type="button" class="btn btn-delete-admin btn-delete" data-id="${food.id}">
              <i class="fa-solid fa-trash me-1"></i>Xóa
            </button>
          </div>
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

foodForm.addEventListener("submit", async function (event) {
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

  const url = editId ? `${dishesAPI}/${editId}` : dishesAPI;
  const method = editId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(foodData),
    });
    if (!res.ok) throw new Error("Network error");
    resetForm();
    foodModal.hide();
    await getFoods();
    showMessage(
      editId ? "Cập nhật món ăn thành công!" : "Thêm món ăn thành công!",
      "success",
    );
  } catch {
    setFormMessage(
      editId ? "Cập nhật thất bại. Thử lại!" : "Thêm thất bại. Thử lại!",
      true,
    );
  }
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

async function handleDelete(id) {
  const result = await Swal.fire({
    title: "Xóa món ăn này?",
    text: "Hành động này không thể hoàn tác!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  });
  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`${dishesAPI}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Network error");
    await getFoods();
    showMessage("Đã xóa món ăn thành công!", "success");
  } catch {
    setFetchError("Xóa thất bại. Vui lòng thử lại.");
  }
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

const ALL_SECTIONS = ["foods", "combo", "danh-muc", "thong-ke"];

const SECTION_TITLES = {
  foods: "Quản lý món ăn",
  combo: "Quản lý Combo",
  "danh-muc": "Danh mục",
  "thong-ke": "Thống kê",
};

function showSection(section) {
  ALL_SECTIONS.forEach((s) => {
    const el = document.getElementById(s + "-section");
    const nav = document.getElementById("nav-" + s);
    if (el) {
      const isActive = s === section;
      el.style.display = isActive ? "block" : "none";
      if (isActive) {
        el.classList.remove("section-fade");
        void el.offsetWidth;
        el.classList.add("section-fade");
      }
    }
    if (nav) nav.classList.toggle("active", s === section);
  });
  const titleEl = document.getElementById("mobileSectionTitle");
  if (titleEl) titleEl.textContent = SECTION_TITLES[section] || section;
  if (section === "combo") renderComboTable();
  if (section === "danh-muc") renderCatTable();
  if (section === "thong-ke") renderThongKe();
  closeSidebar();
}

function openSidebar() {
  document.getElementById("adminSidebar").classList.add("open");
  document.getElementById("sidebarOverlay").classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  const sidebar = document.getElementById("adminSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("show");
  document.body.style.overflow = "";
}

window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;

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
          <div class="d-flex gap-2">
            <button class="btn btn-edit-admin" onclick="editCombo('${c.id}')">
              <i class="fa-solid fa-pen me-1"></i>Sửa
            </button>
            <button class="btn btn-delete-admin" onclick="deleteCombo('${c.id}')">
              <i class="fa-solid fa-trash me-1"></i>Xóa
            </button>
          </div>
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

// ================= DANH MỤC CRUD =================

let categoriesData = [];
let editCatId = null;
const catModalEl = document.getElementById("catModal");
const catModal = catModalEl ? new bootstrap.Modal(catModalEl) : null;
const catForm = document.getElementById("catForm");

async function renderCatTable() {
  const tbody = document.getElementById("catTable");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" class="text-center py-3"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>`;

  try {
    const res = await fetch(categoriesAPI);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    categoriesData = data;
    const statEl = document.getElementById("stat-cat-total");
    if (statEl) statEl.textContent = data.length;

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Chưa có danh mục nào</td></tr>`;
      return;
    }

    tbody.innerHTML = data
      .map((cat, i) => {
        const count = foodsData.filter(
          (f) => f.DanhMuc === cat.TenDanhMuc,
        ).length;
        return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${cat.TenDanhMuc}</strong></td>
          <td><span class="badge bg-success">${count} món</span></td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-edit-admin" onclick="editCat('${cat.id}')">
                <i class="fa-solid fa-pen me-1"></i>Sửa
              </button>
              <button class="btn btn-delete-admin" onclick="deleteCat('${cat.id}')">
                <i class="fa-solid fa-trash me-1"></i>Xóa
              </button>
            </div>
          </td>
        </tr>`;
      })
      .join("");
  } catch {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-3">Không tải được danh mục</td></tr>`;
  }
}

function openCatModal(id = null) {
  editCatId = id;
  document.getElementById("catModalTitle").textContent = id
    ? "Sửa danh mục"
    : "Thêm danh mục";
  document.getElementById("err-cat-name").textContent = "";
  if (id) {
    const cat = categoriesData.find((c) => c.id === id);
    if (cat) document.getElementById("cat-name").value = cat.TenDanhMuc;
  } else {
    document.getElementById("cat-name").value = "";
  }
  catModal && catModal.show();
}

function editCat(id) {
  openCatModal(id);
}

async function deleteCat(id) {
  const result = await Swal.fire({
    title: "Xóa danh mục này?",
    text: "Hành động này không thể hoàn tác!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  });
  if (!result.isConfirmed) return;

  try {
    const res = await fetch(`${categoriesAPI}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Network error");
    await renderCatTable();
    await getCategories();
    showMessage("Đã xóa danh mục thành công!", "success");
  } catch {
    showMessage("Xóa thất bại. Vui lòng thử lại!", "error");
  }
}

catForm &&
  catForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("cat-name").value.trim();
    document.getElementById("err-cat-name").textContent = "";
    if (!name) {
      document.getElementById("err-cat-name").textContent =
        "Tên danh mục không được trống";
      return;
    }
    const url = editCatId ? `${categoriesAPI}/${editCatId}` : categoriesAPI;
    const method = editCatId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TenDanhMuc: name }),
      });
      if (!res.ok) throw new Error("Network error");
      catModal && catModal.hide();
      await renderCatTable();
      await getCategories();
      showMessage(
        editCatId
          ? "Cập nhật danh mục thành công!"
          : "Thêm danh mục thành công!",
        "success",
      );
      editCatId = null;
    } catch {
      showMessage("Lưu thất bại. Vui lòng thử lại!", "error");
    }
  });

// ================= THỐNG KÊ =================

function renderThongKe() {
  const combos = loadCombos();
  const total = foodsData.length;
  const available = foodsData.filter((f) => f.isAvailable !== false).length;
  const unavailable = total - available;
  const cats = [...new Set(foodsData.map((f) => f.DanhMuc).filter(Boolean))];

  const cards = document.getElementById("tk-stat-cards");
  if (cards) {
    cards.innerHTML = `
      <div class="col-6 col-md-3">
        <div class="admin-stat-card bg-success text-white shadow-sm">
          <h6><i class="fa-solid fa-bowl-food me-2"></i>Tổng món ăn</h6>
          <h2>${total}</h2>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="admin-stat-card bg-warning text-dark shadow-sm">
          <h6><i class="fa-solid fa-circle-check me-2"></i>Đang phục vụ</h6>
          <h2>${available}</h2>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="admin-stat-card text-white shadow-sm" style="background:#0d6efd">
          <h6><i class="fa-solid fa-list me-2"></i>Danh mục</h6>
          <h2>${cats.length}</h2>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="admin-stat-card bg-danger text-white shadow-sm">
          <h6><i class="fa-solid fa-gift me-2"></i>Combo ưu đãi</h6>
          <h2>${combos.length}</h2>
        </div>
      </div>`;
  }

  const catMap = {};
  foodsData.forEach((f) => {
    const cat = f.DanhMuc || "Khác";
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  const maxVal = sorted.length ? sorted[0][1] : 1;

  const chartEl = document.getElementById("tk-category-chart");
  if (chartEl) {
    if (!sorted.length) {
      chartEl.innerHTML = `<p class="text-muted text-center">Chưa có dữ liệu</p>`;
    } else {
      chartEl.innerHTML = sorted
        .map(([name, count]) => {
          const pct = Math.round((count / maxVal) * 100);
          return `
          <div class="mb-3">
            <div class="d-flex justify-content-between mb-1">
              <span class="fw-semibold" style="font-size:14px">${name}</span>
              <span class="text-muted" style="font-size:13px">${count} món</span>
            </div>
            <div style="background:#e9ecef;border-radius:8px;height:12px;overflow:hidden">
              <div style="background:linear-gradient(90deg,#198754,#20c997);height:12px;border-radius:8px;width:${pct}%;transition:width 0.7s ease"></div>
            </div>
          </div>`;
        })
        .join("");
    }
  }

  const comboEl = document.getElementById("tk-combo-list");
  if (comboEl) {
    if (!combos.length) {
      comboEl.innerHTML = `<p class="text-muted text-center py-3">Chưa có combo nào</p>`;
    } else {
      comboEl.innerHTML = combos
        .slice(0, 6)
        .map((c) => {
          const disc = Math.round((1 - c.Gia / c.oldPrice) * 100);
          return `
          <div class="d-flex align-items-center gap-3 mb-3 p-2 rounded-3" style="background:#f8f9fa">
            <img src="${c.img}" width="46" height="46"
              style="border-radius:10px;object-fit:cover;flex-shrink:0"
              onerror="this.src='https://via.placeholder.com/46'" />
            <div style="flex:1;min-width:0">
              <div class="fw-semibold text-truncate" style="font-size:13px">${c.TenMon}</div>
              <div class="text-success fw-bold" style="font-size:13px">${formatPrice(c.Gia)}</div>
            </div>
            <span class="badge bg-danger">-${disc}%</span>
          </div>`;
        })
        .join("");
    }
  }
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
