var cl = console.log;

const Base_url = "https://xhr-1st-crud-default-rtdb.firebaseio.com";
const Book_url = `${Base_url}/Books.json`;

const form = document.getElementById("form");
const BookTitle = document.getElementById("BookTitle");
const Author = document.getElementById("Author");
const Category = document.getElementById("Category");
const Price = document.getElementById("Price");
const ImageURL = document.getElementById("ImageURL");
const SubmitBtn = document.getElementById("SubmitBtn");
const UpdateBtn = document.getElementById("UpdateBtn");
const booksdata = document.getElementById("booksdata");
const spinner = document.getElementById("spinner");

// Local state
let state = {
    BookArr: [],
    Edit_id: null
};

// Spinner
function Spinnerhandler() {
    spinner.classList.toggle("d-none");
}

// Snackbar
function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 2500,
        showConfirmButton: false
    });
}

// Make API call
function MakeApi(url, method, msgbody = null) {
    let body = msgbody ? JSON.stringify(msgbody) : null;

    return fetch(url, {
        method: method,
        body: body,
        headers: {
            "Content-Type": "application/json",
            "Security": "JWT Token"
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`ERROR: ${res.status}`);
        }
        return res.json();
    })
    .catch(err => {
        cl(err);
        throw err;
    })
    .finally(() => {
        Spinnerhandler();
    });
}

// Templating
function Rendering(arr) {
    let result = "";
    arr.forEach(ele => {
        result += `
            <div class="col-md-4 col-lg-3 mb-4" id="${ele.id}">
                <div class="card book-card h-100">
                    <div class="card-body">
                        <img
                            class="book-image img-fluid"
                            src="${ele.image}"
                            alt="${ele.title}">
                        <h5 class="mt-3"><b>${ele.title}</b></h5>
                        <p class="mb-2">
                            <i class="fa-solid fa-user"></i>
                            ${ele.author}
                        </p>
                        <p class="mb-2">
                            <span class="badge badge-info">
                                ${ele.category}
                            </span>
                        </p>
                        <h6>Price: ₹${ele.price}</h6>
                        <div class="d-flex justify-content-between icon mt-3">
                            <i
                                class="fa-solid fa-pen-to-square fa-2x text-primary"
                                onclick="onEdit(this)">
                            </i>

                            <i
                                class="fa-solid fa-trash fa-2x text-danger"
                                onclick="onDelete(this)">
                            </i>

                        </div>

                    </div>
                </div>
            </div>
        `;
    });

    booksdata.innerHTML = result;
}

// Read data
function Readdata() {
    Spinnerhandler();

    MakeApi(Book_url, "GET")
        .then(data => {
            state.BookArr = [];

            if (data) {
                for (const key in data) {
                    data[key].id = key;
                    state.BookArr.unshift(data[key]);
                }
            }

            Rendering(state.BookArr);
        })
        .catch(err => {
            cl(err);
        });
}

Readdata();

// Create book
function Oncreate(eve) {
    eve.preventDefault();

    let obj = {
        title: BookTitle.value.trim(),
        author: Author.value.trim(),
        category: Category.value,
        price: Price.value.trim(),
        image: ImageURL.value.trim()
    };

    Spinnerhandler();

    MakeApi(Book_url, "POST", obj)
        .then(data => {
            obj.id = data.name;

            state.BookArr.unshift(obj);

            let div = document.createElement("div");
            div.className = "col-md-4 col-lg-3 mb-4";
            div.id = obj.id;

            div.innerHTML = `
                <div class="card book-card h-100">
                    <div class="card-body">

                        <img
                            class="book-image img-fluid"
                            src="${obj.image}"
                            alt="${obj.title}">
                        <h5 class="mt-3"><b>${obj.title}</b></h5>

                        <p class="mb-2">
                            <i class="fa-solid fa-user"></i>
                            ${obj.author}
                        </p>

                        <p class="mb-2">
                            <span class="badge badge-info">
                                ${obj.category}
                            </span>
                        </p>

                        <h6>Price: ₹${obj.price}</h6>

                        <div class="d-flex justify-content-between icon mt-3">
                            <i
                                class="fa-solid fa-pen-to-square fa-2x text-primary"
                                onclick="onEdit(this)">
                            </i>

                            <i
                                class="fa-solid fa-trash fa-2x text-danger"
                                onclick="onDelete(this)">
                            </i>
                        </div>

                    </div>
                </div>
            `;

            booksdata.prepend(div);

            form.reset();

            snackBar("Book added successfully!", "success");
        })
        .catch(err => {
            cl(err);
        });
}

// Edit
function onEdit(eve) {
    let Edit_id = eve.closest(".col-md-4").id;

    state.Edit_id = Edit_id;

    let Edobj = state.BookArr.find(t => t.id === Edit_id);

    if (!Edobj) {
        snackBar("Book not found!", "error");
        return;
    }

    BookTitle.value = Edobj.title;
    Author.value = Edobj.author;
    Category.value = Edobj.category;
    Price.value = Edobj.price;
    ImageURL.value = Edobj.image;
    SubmitBtn.classList.add("d-none");
    UpdateBtn.classList.remove("d-none");
}

// Update book
function UpdateBook() {
    Spinnerhandler();
    let Update_id = state.Edit_id;
    let upobj = {
        title: BookTitle.value.trim(),
        author: Author.value.trim(),
        category: Category.value,
        price: Price.value.trim(),
        image: ImageURL.value.trim(),
        id: Update_id
    };
    let update_url = `${Base_url}/Books/${Update_id}.json`;
    MakeApi(update_url, "PATCH", upobj)
        .then(data => {
            let index = state.BookArr.findIndex(
                t => t.id === Update_id
            );

            state.BookArr[index] = upobj;

            let div = document.getElementById(Update_id);

            Rendering(state.BookArr);

            SubmitBtn.classList.remove("d-none");
            UpdateBtn.classList.add("d-none");

            state.Edit_id = null;

            form.reset();

            snackBar("Book updated successfully!", "success");
        })
        .catch(err => {
            cl(err);
        });
}

// Delete
function onDelete(eve) {
    let Remove_id = eve.closest(".col-md-4").id;

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then(result => {

        if (result.isConfirmed) {
            Spinnerhandler();

            let Remove_url =
                `${Base_url}/Books/${Remove_id}.json`;

            MakeApi(Remove_url, "DELETE")
                .then(data => {
                    let index = state.BookArr.findIndex(
                        t => t.id === Remove_id
                    );

                    if (index !== -1) {
                        state.BookArr.splice(index, 1);
                    }

                    eve.closest(".col-md-4").remove();

                    snackBar("Book removed successfully!", "success");
                })
                .catch(err => {
                    cl(err);
                });
        }
    });
}

// Events
form.addEventListener("submit", Oncreate);
UpdateBtn.addEventListener("click", UpdateBook);