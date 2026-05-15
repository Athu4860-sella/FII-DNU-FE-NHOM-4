// FORMAT PRICE
function formatPrice(price) {

    return Number(price)
        .toLocaleString("vi-VN") + "đ";
}


// VALID URL
function isValidURL(url) {

    return url.startsWith("http");
}


// VALIDATE FORM
function validateDish(name, price, image) {

    let isValid = true;

    // RESET
    document.getElementById("nameError").innerHTML = "";
    document.getElementById("priceError").innerHTML = "";
    document.getElementById("imageError").innerHTML = "";

    // NAME
    if (name.trim() === "") {

        document.getElementById("nameError").innerHTML =
            "Tên không được rỗng";

        isValid = false;
    }

    // PRICE
    if (price <= 0) {

        document.getElementById("priceError").innerHTML =
            "Giá phải lớn hơn 0";

        isValid = false;
    }

    // IMAGE
    if (!isValidURL(image)) {

        document.getElementById("imageError").innerHTML =
            "URL ảnh không hợp lệ";

        isValid = false;
    }

    return isValid;
}