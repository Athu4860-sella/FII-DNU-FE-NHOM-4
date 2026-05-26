// utils.js

/* =========================
   FORMAT TIỀN
========================= */

function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN") + "đ";
}

/* =========================
   VALIDATE RỖNG
========================= */

function isEmpty(value) {
  return value.trim() === "";
}

/* =========================
   VALIDATE GIÁ
========================= */

function isValidPrice(price) {
  return Number(price) > 0;
}

/* =========================
   HIỂN THỊ SAO
========================= */

function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += `<i class="fa-solid fa-star text-warning"></i>`;
    } else {
      stars += `<i class="fa-regular fa-star text-warning"></i>`;
    }
  }
  return stars;
}

/* =========================
   CẮT CHỮ DÀI
========================= */

function truncateText(text, maxLength = 80) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
}

/* =========================
   THÔNG BÁO (dùng SweetAlert2)
========================= */

function showMessage(message, type = "info") {
  Swal.fire({ text: message, icon: type, confirmButtonColor: "#198754" });
}
