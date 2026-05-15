const adminDishList =
    document.getElementById("adminDishList");

const dishForm =
    document.getElementById("dishForm");

let editingId = null;


// LOAD CATEGORY
function loadCategories() {

    getCategories()

        .then(data => {

            let html = "";

            data.forEach(category => {

                html += `
                
                <option value="${category.name}">
                    ${category.name}
                </option>
                `;
            });

            document.getElementById("category").innerHTML =
                html;
        });
}


// LOAD DISHES
function loadAdminData() {

    $("#adminDishList")
        .hide()
        .fadeIn(500);

    getDishes()

        .then(data => {

            let html = "";

            data.forEach(dish => {

                html += `
                
                <tr>

                    <td>
                        <img src="${dish.image}"
                             width="80"
                             class="rounded">
                    </td>

                    <td>${dish.name}</td>

                    <td>
                        ${formatPrice(dish.price)}
                    </td>

                    <td>${dish.category}</td>

                    <td>

                        <span class="badge
                        ${dish.available
                            ? "bg-success"
                            : "bg-secondary"}">

                            ${dish.available
                                ? "Còn phục vụ"
                                : "Hết món"}

                        </span>

                    </td>

                    <td>

                        <button class="btn btn-warning btn-sm editBtn"
                            data-id="${dish.id}">

                            Sửa

                        </button>

                        <button class="btn btn-danger btn-sm deleteBtn"
                            data-id="${dish.id}">

                            Xóa

                        </button>

                        <button class="btn btn-secondary btn-sm toggleBtn"
                            data-id="${dish.id}"
                            data-status="${dish.available}">

                            Toggle

                        </button>

                    </td>

                </tr>
                `;
            });

            adminDishList.innerHTML = html;
        });
}

loadAdminData();
loadCategories();


// SUBMIT FORM
dishForm.addEventListener("submit", function (e) {

    e.preventDefault();

    let name =
        document.getElementById("name").value;

    let price =
        document.getElementById("price").value;

    let image =
        document.getElementById("image").value;

    let category =
        document.getElementById("category").value;


    // VALIDATE
    if (!validateDish(name, price, image)) {
        return;
    }


    let dishData = {

        name,
        price,
        image,
        category,

        available: true
    };


    // UPDATE
    if (editingId) {

        updateDish(editingId, dishData)

            .then(() => {

                loadAdminData();

                dishForm.reset();

                editingId = null;

                bootstrap.Modal
                    .getInstance(
                        document.getElementById("dishModal")
                    )
                    .hide();
            });

    }

    // CREATE
    else {

        createDish(dishData)

            .then(() => {

                loadAdminData();

                dishForm.reset();

                bootstrap.Modal
                    .getInstance(
                        document.getElementById("dishModal")
                    )
                    .hide();
            });
    }
});


// DELETE
$(document).on("click", ".deleteBtn", function () {

    let id =
        $(this).data("id");

    if (confirm("Bạn có chắc muốn xóa?")) {

        deleteDish(id)

            .then(() => {

                loadAdminData();

                $("#liveToast")
                    .toast("show");
            });
    }
});


// EDIT
$(document).on("click", ".editBtn", function () {

    let id =
        $(this).data("id");

    getDishes()

        .then(data => {

            let dish =
                data.find(item => item.id == id);

            document.getElementById("name").value =
                dish.name;

            document.getElementById("price").value =
                dish.price;

            document.getElementById("image").value =
                dish.image;

            document.getElementById("category").value =
                dish.category;

            editingId = id;

            $("#dishModal")
                .modal("show");
        });
});


// TOGGLE STATUS
$(document).on("click", ".toggleBtn", function () {

    let id =
        $(this).data("id");

    let status =
        $(this).data("status") === true;

    updateDish(id, {

        available: !status

    })

        .then(() => {

            loadAdminData();
        });
});


// EFFECT
$(".table")
    .hide()
    .slideDown(800);