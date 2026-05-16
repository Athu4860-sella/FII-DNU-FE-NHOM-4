// ================= PRICE FORMATTING =================
// Định dạng giá tiền theo tiếng Việt (ví dụ: 1000000 -> 1.000.000đ)
function formatPrice(price) {
  const numPrice =
    typeof price === "string" ? Number(price.replace(/\./g, "")) : price;
  return numPrice.toLocaleString("vi-VN") + "đ";
}
// ================= IMAGE VALIDATION =================
// Kiểm tra URL ảnh hợp lệ (png, jpg, jpeg, webp)
function validateImage(url) {
  return /(https?:\/\/.*\.(?:png|jpg|jpeg|webp))/i.test(url);
}

// ================= TOAST NOTIFICATIONS =================
// Hiển thị thông báo nhanh (toast) lên trang - Sử dụng jQuery
function showToast(message, type = "success") {
  const toast = $("#toast");

  toast.html(`
    <div class="toast align-items-center text-bg-${type} border-0 show">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
      </div>
    </div>
  `);

  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    toast.html("");
  }, 3000);
}

// ================= LOADING MANAGEMENT =================
// Hiển thị biểu tượng loading - Sử dụng jQuery cho consistency
function showLoading() {
  $("#loading").show();
}

// Ẩn biểu tượng loading - Sử dụng jQuery cho consistency
function hideLoading() {
  $("#loading").hide();
}
