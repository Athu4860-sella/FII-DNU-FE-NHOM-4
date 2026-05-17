// main.js

// ================= USER PAGE =================

// LOAD CATEGORY

getCategories();

// LOAD FOOD

getFoods();

// SEARCH FOOD

$("#searchInput").on("keyup", function () {
  const keyword = $(this).val().toLowerCase();

  const filteredFoods = foodsData.filter((food) =>
    food.TenMon.toLowerCase().includes(keyword),
  );

  displayFoods(filteredFoods);
});

// FILTER CATEGORY

function filterCategory(category) {
  const filteredFoods = foodsData.filter((food) => food.DanhMuc === category);

  displayFoods(filteredFoods);
}

// ================= LOGIN =================

$("#loginForm").submit(function (e) {

   e.preventDefault();

   const username = $("#username").val();

   const password = $("#password").val();

   if(username === "admin" &&
      password === "123456"){

      localStorage.setItem("isLogin", "true");

      alert("Đăng nhập thành công");

      $("#loginModal").modal("hide");

   }else{

      alert("Sai tài khoản");

   }

});

// ================= LOGOUT =================

function logout(){

   localStorage.removeItem("isLogin");

   alert("Đã đăng xuất");

}