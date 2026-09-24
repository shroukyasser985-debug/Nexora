/* =========================================================
   NEXORA JAVASCRIPT
   Cleaned & Fixed Version
========================================================= */

const APPLICANTS_KEY = "nexoraApplicants";
const LOGIN_KEY = "nexoraLoggedIn";

let pendingEditPhotoFile = null;


/* =========================================================
   LOGIN
========================================================= */

function initLogin() {

    const form =
        document.querySelector(".login-card form");

    const fullNameInput =
        document.querySelector("#fullName");

    const emailInput =
        document.querySelector("#email");

    const passwordInput =
        document.querySelector("#password");

    const submitButton =
        form?.querySelector("button[type='submit']");


    if (
        !form ||
        !fullNameInput ||
        !emailInput ||
        !passwordInput ||
        !submitButton
    ) {
        return;
    }


    const statusMessage =
        document.createElement("p");

    statusMessage.className =
        "login-status mt-3 mb-0 text-center small";

    statusMessage.setAttribute(
        "role",
        "status"
    );

    form.after(statusMessage);


    const validateField =
        (input) => {

            const isValid =
                input.checkValidity() &&
                input.value.trim() !== "";

            input.classList.toggle(
                "is-invalid",
                !isValid
            );

            input.classList.toggle(
                "is-valid",
                isValid
            );

            return isValid;
        };


    fullNameInput.focus();


    [
        fullNameInput,
        emailInput,
        passwordInput
    ].forEach(
        (input) => {

            input.addEventListener(
                "input",
                () => {

                    validateField(input);

                    statusMessage.textContent =
                        "";

                }
            );


            input.addEventListener(
                "blur",
                () => {

                    validateField(input);

                }
            );

        }
    );


    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const fieldsAreValid = [
                fullNameInput,
                emailInput,
                passwordInput
            ]
                .map(validateField)
                .every(Boolean);


            if (!fieldsAreValid) {

                statusMessage.textContent =
                    "Please complete all fields correctly.";

                statusMessage.className =
                    "login-status mt-3 mb-0 text-center small text-danger";

                return;
            }


            submitButton.disabled =
                true;


            submitButton.textContent =
                "Signing in...";


            statusMessage.textContent =
                "Welcome back, redirecting to Nexora Home...";


            statusMessage.className =
                "login-status mt-3 mb-0 text-center small text-success";


            /* ---------------------------------------------
               KEEP LOGIN STATE
            --------------------------------------------- */

            localStorage.setItem(
                LOGIN_KEY,
                "true"
            );


            /* ---------------------------------------------
               GO TO HOME
            --------------------------------------------- */

            window.setTimeout(
                () => {

                    window.location.href =
                        "/home.html";

                },
                500
            );

        }
    );
}


/* =========================================================
   STORAGE
========================================================= */

function getApplicants() {

    try {

        const stored =
            localStorage.getItem(
                APPLICANTS_KEY
            );


        if (!stored) {
            return [];
        }


        const applicants =
            JSON.parse(stored);


        return Array.isArray(applicants)
            ? applicants
            : [];


    } catch (error) {

        console.error(
            "Could not read applicants:",
            error
        );

        return [];
    }
}



function saveApplicants(applicants) {

    try {

        localStorage.setItem(
            APPLICANTS_KEY,
            JSON.stringify(applicants)
        );

        return true;


    } catch (error) {

        console.error(
            "Could not save applicants:",
            error
        );


        alert(
            "Could not save the application. Browser storage may be full."
        );


        return false;
    }
}


/* =========================================================
   NAVBAR
========================================================= */

function loadNavbar() {

    const navbar =
        document.querySelector("#navbar");


    if (!navbar) {
        return;
    }


    fetch("/navbar.html")

        .then(
            function(response) {

                if (!response.ok) {

                    throw new Error(
                        "Navbar could not be loaded."
                    );

                }

                return response.text();
            }
        )

        .then(
            function(html) {

                navbar.innerHTML =
                    html;

            }
        )

        .catch(
            function(error) {

                console.error(
                    "Navbar error:",
                    error
                );

            }
        );
}


/* =========================================================
   APPLY MODAL LOADER
========================================================= */

function loadApplyModal() {

    const modalContainer =
        document.querySelector("#apply-modal");


    if (!modalContainer) {
        return;
    }


    fetch("/apply-modal.html")

        .then(
            function(response) {

                if (!response.ok) {

                    throw new Error(
                        "Apply modal could not be loaded."
                    );

                }

                return response.text();
            }
        )

        .then(
            function(html) {

                modalContainer.innerHTML =
                    html;

                setupApplyModal();

            }
        )

        .catch(
            function(error) {

                console.error(
                    "Apply modal error:",
                    error
                );

            }
        );
}


/* =========================================================
   IMAGE COMPRESSION
========================================================= */

function compressImage(file) {

    return new Promise(
        function(resolve, reject) {

            if (!file) {

                reject(
                    new Error(
                        "No image selected."
                    )
                );

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    const image =
                        new Image();


                    image.onload =
                        function() {

                            const maxSize =
                                400;


                            let width =
                                image.width;

                            let height =
                                image.height;


                            if (
                                width > height &&
                                width > maxSize
                            ) {

                                height =
                                    Math.round(
                                        (height * maxSize) /
                                        width
                                    );

                                width =
                                    maxSize;


                            } else if (
                                height >= width &&
                                height > maxSize
                            ) {

                                width =
                                    Math.round(
                                        (width * maxSize) /
                                        height
                                    );

                                height =
                                    maxSize;

                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                width;

                            canvas.height =
                                height;


                            const context =
                                canvas.getContext(
                                    "2d"
                                );


                            if (!context) {

                                reject(
                                    new Error(
                                        "Could not create image canvas."
                                    )
                                );

                                return;
                            }


                            context.drawImage(
                                image,
                                0,
                                0,
                                width,
                                height
                            );


                            const compressedImage =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.7
                                );


                            resolve(
                                compressedImage
                            );

                        };


                    image.onerror =
                        function() {

                            reject(
                                new Error(
                                    "Invalid image."
                                )
                            );

                        };


                    image.src =
                        event.target.result;

                };


            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Could not read image."
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );
}


/* =========================================================
   APPLY MODAL
========================================================= */

function setupApplyModal() {

    const modalElement =
        document.querySelector(
            "#applyModal"
        );


    if (!modalElement) {
        return;
    }


    const applyModal =
        new bootstrap.Modal(
            modalElement
        );


    const companyName =
        document.querySelector(
            "#applyCompanyName"
        );


    const categoryInput =
        document.querySelector(
            "#applyCategory"
        );


    const salaryInput =
        document.querySelector(
            "#applySalary"
        );


    const jobInput =
        document.querySelector(
            "#applyJob"
        );


    const nameInput =
        document.querySelector(
            "#applicantName"
        );


    const ageInput =
        document.querySelector(
            "#applicantAge"
        );


    const locationInput =
        document.querySelector(
            "#applicantLocation"
        );


    const emailInput =
        document.querySelector(
            "#applicantEmail"
        );


    const photoInput =
        document.querySelector(
            "#applicantPhoto"
        );


    const photoName =
        document.querySelector(
            "#selectedPhotoName"
        );


    const submitButton =
        document.querySelector(
            "#submitApplicationBtn"
        );


    if (
        !companyName ||
        !categoryInput ||
        !salaryInput ||
        !jobInput ||
        !nameInput ||
        !ageInput ||
        !locationInput ||
        !emailInput ||
        !photoInput ||
        !submitButton
    ) {

        console.error(
            "Apply modal fields are missing."
        );

        return;
    }


    /* =====================================================
       APPLY NOW
    ===================================================== */

    document.addEventListener(
        "click",
        function(event) {

            const applyButton =
                event.target.closest(
                    ".apply-btn"
                );


            if (!applyButton) {
                return;
            }


            const company =
                applyButton.dataset.company ||
                "";

            const job =
                applyButton.dataset.job ||
                "";

            const category =
                applyButton.dataset.category ||
                "";

            const salary =
                applyButton.dataset.salary ||
                "";


            companyName.textContent =
                company || "—";


            jobInput.value =
                job;


            categoryInput.value =
                category;


            salaryInput.value =
                salary;


            nameInput.value =
                "";

            ageInput.value =
                "";

            locationInput.value =
                "";

            emailInput.value =
                "";

            photoInput.value =
                "";


            if (photoName) {

                photoName.textContent =
                    "";

            }


            applyModal.show();

        }
    );


    /* =====================================================
       PHOTO
    ===================================================== */

    photoInput.addEventListener(
        "change",
        function() {

            const file =
                photoInput.files[0];


            if (!file) {

                if (photoName) {

                    photoName.textContent =
                        "";

                }

                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );


                photoInput.value =
                    "";


                if (photoName) {

                    photoName.textContent =
                        "";

                }

                return;
            }


            if (photoName) {

                photoName.textContent =
                    "Selected: " +
                    file.name;

            }

        }
    );


    /* =====================================================
       SUBMIT
    ===================================================== */

    submitButton.addEventListener(
        "click",
        async function() {

            const name =
                nameInput.value.trim();


            const age =
                ageInput.value.trim();


            const location =
                locationInput.value.trim();


            const email =
                emailInput.value.trim();


            const photo =
                photoInput.files[0];


            const company =
                companyName.textContent.trim();


            const job =
                jobInput.value.trim();


            const category =
                categoryInput.value.trim();


            const salary =
                salaryInput.value.trim();


            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */

            if (
                !name ||
                !age ||
                !location ||
                !email ||
                !photo
            ) {

                alert(
                    "Please fill in all fields and choose a profile photo."
                );

                return;
            }


            if (
                Number(age) < 18 ||
                Number(age) > 70
            ) {

                alert(
                    "Age must be between 18 and 70."
                );

                return;
            }


            if (
                !photo.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please choose a valid image."
                );

                return;
            }


            /* ---------------------------------------------
               LOADING
            --------------------------------------------- */

            submitButton.disabled =
                true;


            submitButton.innerHTML =
                `
                    <span
                        class="spinner-border spinner-border-sm me-2"
                    ></span>

                    Submitting...
                `;


            try {

                /* -----------------------------------------
                   COMPRESS PHOTO
                ----------------------------------------- */

                const image =
                    await compressImage(
                        photo
                    );


                /* -----------------------------------------
                   GET EXISTING APPLICATIONS
                ----------------------------------------- */

                const applicants =
                    getApplicants();


                /* -----------------------------------------
                   NEXT DISPLAY ID
                ----------------------------------------- */

                const lastDisplayId =
                    applicants.reduce(
                        function(max, applicant) {

                            const currentId =
                                Number(
                                    applicant.displayId
                                ) || 100;


                            return Math.max(
                                max,
                                currentId
                            );

                        },
                        100
                    );


                /* -----------------------------------------
                   CREATE APPLICATION
                ----------------------------------------- */

                const applicant = {

                    id:
                        "app-" +
                        Date.now() +
                        "-" +
                        Math.random()
                            .toString(36)
                            .slice(2, 7),


                    displayId:
                        lastDisplayId + 1,


                    name:
                        name,


                    age:
                        age,


                    email:
                        email,


                    location:
                        location,


                    photo:
                        image,


                    company:
                        company,


                    job:
                        job,


                    category:
                        category,


                    salary:
                        salary,


                    status:
                        "Pending",


                    createdAt:
                        new Date()
                            .toISOString()

                };


                /* -----------------------------------------
                   ADD APPLICATION
                ----------------------------------------- */

                applicants.push(
                    applicant
                );


                /* -----------------------------------------
                   SAVE
                ----------------------------------------- */

                const saved =
                    saveApplicants(
                        applicants
                    );


                if (!saved) {

                    submitButton.disabled =
                        false;


                    submitButton.innerHTML =
                        `
                            <i class="bi bi-send-check me-2"></i>
                            Submit Application
                        `;

                    return;
                }


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                applyModal.hide();


                submitButton.disabled =
                    false;


                submitButton.innerHTML =
                    `
                        <i class="bi bi-send-check me-2"></i>
                        Submit Application
                    `;


                /* -----------------------------------------
                   GO HOME
                ----------------------------------------- */

                window.location.href =
                    "/home.html";

            } catch (error) {

                console.error(
                    "Application error:",
                    error
                );


                alert(
                    "Something went wrong while submitting the application."
                );


                submitButton.disabled =
                    false;


                submitButton.innerHTML =
                    `
                        <i class="bi bi-send-check me-2"></i>
                        Submit Application
                    `;

            }

        }
    );
}


/* =========================================================
   CATEGORY CLASS
========================================================= */

function getCategoryClass(category) {

    const value =
        String(
            category || ""
        ).toLowerCase();


    if (
        value.includes("cyber")
    ) {

        return "security-badge";

    }


    if (
        value.includes("web")
    ) {

        return "web-badge";

    }


    if (
        value.includes("data")
    ) {

        return "data-badge";

    }


    if (
        value.includes("mobile")
    ) {

        return "mobile-badge";

    }


    return "other-badge";
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   RENDER NEW APPLICANTS ON HOME
========================================================= */

function renderNewApplicants() {

    const table =
        document.querySelector(
            ".nexora-table"
        );


    if (!table) {
        return;
    }


    const tbody =
        table.querySelector(
            "tbody"
        );


    if (!tbody) {
        return;
    }


    const applicants =
        getApplicants();


    applicants.forEach(
        function(applicant) {

            if (!applicant.id) {
                return;
            }


            /* ---------------------------------------------
               DON'T ADD SAME ROW TWICE
            --------------------------------------------- */

            const existingRow =
                tbody.querySelector(
                    `[data-application-id="${CSS.escape(
                        applicant.id
                    )}"]`
                );


            if (existingRow) {
                return;
            }


            /* ---------------------------------------------
               CREATE ROW
            --------------------------------------------- */

            const row =
                document.createElement(
                    "tr"
                );


            row.dataset.applicationId =
                applicant.id;


            const categoryClass =
                getCategoryClass(
                    applicant.category
                );


            const photo =
                applicant.photo ||
                "https://placehold.co/80x80/png?text=N";


            row.innerHTML =
                `
                    <td>

                        <img
                            src="${escapeHTML(
                                photo
                            )}"
                            alt="Applicant"
                            class="employee-photo"
                        >

                    </td>


                    <td>

                        ${escapeHTML(
                            applicant.displayId
                        )}

                    </td>


                    <td>

                        <div class="employee-name">

                            ${escapeHTML(
                                applicant.name
                            )}

                        </div>


                        <small class="new-app-company d-block">

                            ${escapeHTML(
                                applicant.company
                            )}

                        </small>


                        <small class="d-block text-muted">

                            ${escapeHTML(
                                applicant.job
                            )}

                        </small>

                    </td>


                    <td>

                        ${escapeHTML(
                            applicant.age
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            applicant.email
                        )}

                    </td>


                    <td>

                        <span
                            class="category-badge ${categoryClass}"
                        >

                            ${escapeHTML(
                                applicant.category
                            )}

                        </span>

                    </td>


                    <td>

                        <strong>

                            ${escapeHTML(
                                applicant.salary
                            )}

                        </strong>

                    </td>


                    <td>

                        ${escapeHTML(
                            applicant.location
                        )}

                    </td>


                    <td>

                        <div class="employee-actions">


                            <button
                                type="button"
                                class="employee-action edit-btn new-app-edit"
                                data-id="${escapeHTML(
                                    applicant.id
                                )}"
                                title="Edit applicant"
                            >

                                <i class="bi bi-pencil-square"></i>

                                Edit

                            </button>


                            <button
                                type="button"
                                class="employee-action delete-btn new-app-delete"
                                data-id="${escapeHTML(
                                    applicant.id
                                )}"
                                title="Delete applicant"
                            >

                                <i class="bi bi-trash3"></i>

                                Delete

                            </button>


                        </div>

                    </td>
                `;


            tbody.appendChild(
                row
            );

        }
    );
}


/* =========================================================
   EDIT MODAL HELPERS
========================================================= */

function getEditModal() {

    const modalElement =
        document.querySelector(
            "#editEmployeeModal"
        );


    if (!modalElement) {
        return null;
    }


    return bootstrap.Modal.getOrCreateInstance(
        modalElement
    );
}


/* =========================================================
   FILL EDIT MODAL
========================================================= */

function fillEditModal({
    id,
    photo,
    name,
    email,
    age,
    location
}) {

    const idInput =
        document.querySelector(
            "#editEmployeeId"
        );


    const photoPreview =
        document.querySelector(
            "#editPhotoPreview"
        );


    const nameInput =
        document.querySelector(
            "#editName"
        );


    const emailInput =
        document.querySelector(
            "#editEmail"
        );


    const ageInput =
        document.querySelector(
            "#editAge"
        );


    const locationInput =
        document.querySelector(
            "#editLocation"
        );


    if (
        !idInput ||
        !photoPreview ||
        !nameInput ||
        !emailInput ||
        !ageInput ||
        !locationInput
    ) {
        return false;
    }


    pendingEditPhotoFile =
        null;


    const photoInput =
        document.querySelector(
            "#editPhoto"
        );


    if (photoInput) {
        photoInput.value =
            "";
    }


    idInput.value =
        id;


    photoPreview.src =
        photo || "";


    nameInput.value =
        name || "";


    emailInput.value =
        email || "";


    ageInput.value =
        age || "";


    locationInput.value =
        location || "";


    return true;
}


/* =========================================================
   FIXED EMPLOYEES EDIT / DELETE
========================================================= */

function initFixedEmployeeActions() {

    const employeesTable =
        document.querySelector(
            ".nexora-table tbody"
        );


    if (!employeesTable) {
        return;
    }


    const editModal =
        getEditModal();


    employeesTable.addEventListener(
        "click",
        function(event) {

            const row =
                event.target.closest(
                    "tr"
                );


            if (!row) {
                return;
            }


            /*
                New applicants have:
                data-application-id

                Fixed employees have:
                data-employee-id
            */

            if (
                !row.dataset.employeeId
            ) {
                return;
            }


            /* -----------------------------------------
               EDIT FIXED EMPLOYEE
            ----------------------------------------- */

            const editButton =
                event.target.closest(
                    ".edit-btn"
                );


            if (
                editButton &&
                editModal
            ) {

                const cells =
                    row.querySelectorAll(
                        "td"
                    );


                const photo =
                    cells[0]?.querySelector(
                        "img"
                    );


                const name =
                    cells[2]?.querySelector(
                        ".employee-name"
                    );


                const currentPhoto =
                    photo?.src || "";


                const currentId =
                    row.dataset.employeeId;


                const currentName =
                    name?.innerText.trim() ||
                    "";


                const currentAge =
                    cells[3]?.innerText.trim() ||
                    "";


                const currentEmail =
                    cells[4]?.innerText.trim() ||
                    "";


                const currentLocation =
                    cells[7]?.innerText.trim() ||
                    "";


                const filled =
                    fillEditModal({
                        id:
                            currentId,

                        photo:
                            currentPhoto,

                        name:
                            currentName,

                        email:
                            currentEmail,

                        age:
                            currentAge,

                        location:
                            currentLocation
                    });


                if (filled) {
                    editModal.show();
                }


                return;
            }


            /* -----------------------------------------
               DELETE FIXED EMPLOYEE
            ----------------------------------------- */

            const deleteButton =
                event.target.closest(
                    ".delete-btn"
                );


            if (deleteButton) {

                const sure =
                    confirm(
                        "Are you sure you want to delete this employee?"
                    );


                if (sure) {

                    row.remove();

                }


                return;
            }

        }
    );
}


/* =========================================================
   EDIT PHOTO PREVIEW
========================================================= */

function initEditPhotoPreview() {

    const photoInput =
        document.querySelector(
            "#editPhoto"
        );


    const photoPreview =
        document.querySelector(
            "#editPhotoPreview"
        );


    if (
        !photoInput ||
        !photoPreview
    ) {
        return;
    }


    photoInput.addEventListener(
        "change",
        function() {

            const file =
                photoInput.files[0];


            if (!file) {

                pendingEditPhotoFile =
                    null;

                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please choose a valid image."
                );


                photoInput.value =
                    "";


                pendingEditPhotoFile =
                    null;

                return;
            }


            pendingEditPhotoFile =
                file;


            photoPreview.src =
                URL.createObjectURL(
                    file
                );

        }
    );
}


/* =========================================================
   SAVE FIXED OR NEW APPLICANT
========================================================= */

function initEditSaveButton() {

    const saveButton =
        document.querySelector(
            "#saveEmployeeBtn"
        );


    if (!saveButton) {
        return;
    }


    saveButton.addEventListener(
        "click",
        async function() {

            const idInput =
                document.querySelector(
                    "#editEmployeeId"
                );


            const nameInput =
                document.querySelector(
                    "#editName"
                );


            const emailInput =
                document.querySelector(
                    "#editEmail"
                );


            const ageInput =
                document.querySelector(
                    "#editAge"
                );


            const locationInput =
                document.querySelector(
                    "#editLocation"
                );


            const photoPreview =
                document.querySelector(
                    "#editPhotoPreview"
                );


            if (
                !idInput ||
                !nameInput ||
                !emailInput ||
                !ageInput ||
                !locationInput ||
                !photoPreview
            ) {
                return;
            }


            const id =
                idInput.value;


            const name =
                nameInput.value.trim();


            const email =
                emailInput.value.trim();


            const age =
                ageInput.value.trim();


            const location =
                locationInput.value.trim();


            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (
                !name ||
                !email ||
                !age ||
                !location
            ) {

                alert(
                    "Please fill in all fields."
                );

                return;
            }


            if (
                Number(age) < 18 ||
                Number(age) > 70
            ) {

                alert(
                    "Age must be between 18 and 70."
                );

                return;
            }


            /* -----------------------------------------
               NEW APPLICANT
            ----------------------------------------- */

            if (
                id.startsWith(
                    "app:"
                )
            ) {

                const applicantId =
                    id.slice(4);


                const applicants =
                    getApplicants();


                const index =
                    applicants.findIndex(
                        function(item) {

                            return (
                                item.id ===
                                applicantId
                            );

                        }
                    );


                if (index === -1) {

                    alert(
                        "Applicant could not be found."
                    );

                    return;
                }


                let updatedPhoto =
                    applicants[index].photo;


                /* -------------------------------------
                   SAVE NEW PHOTO
                ------------------------------------- */

                if (
                    pendingEditPhotoFile
                ) {

                    try {

                        saveButton.disabled =
                            true;


                        saveButton.innerHTML =
                            `
                                <span
                                    class="spinner-border spinner-border-sm me-2"
                                ></span>

                                Saving...
                            `;


                        updatedPhoto =
                            await compressImage(
                                pendingEditPhotoFile
                            );


                    } catch (error) {

                        console.error(
                            "Edit photo error:",
                            error
                        );


                        alert(
                            "Could not update the photo."
                        );


                        saveButton.disabled =
                            false;


                        saveButton.innerHTML =
                            "Save Changes";


                        return;
                    }

                }


                /* -------------------------------------
                   UPDATE STORAGE
                ------------------------------------- */

                applicants[index].name =
                    name;


                applicants[index].email =
                    email;


                applicants[index].age =
                    age;


                applicants[index].location =
                    location;


                applicants[index].photo =
                    updatedPhoto;


                const saved =
                    saveApplicants(
                        applicants
                    );


                if (!saved) {

                    saveButton.disabled =
                        false;


                    saveButton.innerHTML =
                        "Save Changes";

                    return;
                }


                /* -------------------------------------
                   UPDATE ROW
                ------------------------------------- */

                const row =
                    document.querySelector(
                        `[data-application-id="${CSS.escape(
                            applicantId
                        )}"]`
                    );


                if (row) {

                    const cells =
                        row.querySelectorAll(
                            "td"
                        );


                    const image =
                        cells[0]?.querySelector(
                            "img"
                        );


                    const employeeName =
                        cells[2]?.querySelector(
                            ".employee-name"
                        );


                    if (image) {

                        image.src =
                            updatedPhoto;

                    }


                    if (employeeName) {

                        employeeName.innerText =
                            name;

                    }


                    if (cells[3]) {

                        cells[3].innerText =
                            age;

                    }


                    if (cells[4]) {

                        cells[4].innerText =
                            email;

                    }


                    if (cells[7]) {

                        cells[7].innerText =
                            location;

                    }

                }


                pendingEditPhotoFile =
                    null;


                saveButton.disabled =
                    false;


                saveButton.innerHTML =
                    "Save Changes";


                const editModal =
                    getEditModal();


                if (editModal) {
                    editModal.hide();
                }


                return;
            }


            /* -----------------------------------------
               FIXED EMPLOYEE
            ----------------------------------------- */

            const row =
                document.querySelector(
                    `tr[data-employee-id="${CSS.escape(
                        id
                    )}"]`
                );


            if (!row) {
                return;
            }


            const cells =
                row.querySelectorAll(
                    "td"
                );


            const image =
                cells[0]?.querySelector(
                    "img"
                );


            const employeeName =
                cells[2]?.querySelector(
                    ".employee-name"
                );


            if (image) {

                image.src =
                    photoPreview.src;

            }


            if (employeeName) {

                employeeName.innerText =
                    name;

            }


            if (cells[3]) {

                cells[3].innerText =
                    age;

            }


            if (cells[4]) {

                cells[4].innerText =
                    email;

            }


            if (cells[7]) {

                cells[7].innerText =
                    location;

            }


            pendingEditPhotoFile =
                null;


            const editModal =
                getEditModal();


            if (editModal) {
                editModal.hide();
            }

        }
    );
}


/* =========================================================
   NEW APPLICANT EDIT
========================================================= */

function editApplicant(id) {

    const applicants =
        getApplicants();


    const applicant =
        applicants.find(
            function(item) {

                return (
                    item.id ===
                    id
                );

            }
        );


    if (!applicant) {
        return;
    }


    const editModal =
        getEditModal();


    if (!editModal) {
        return;
    }


    const filled =
        fillEditModal({

            id:
                "app:" +
                applicant.id,

            photo:
                applicant.photo ||
                "https://placehold.co/80x80/png?text=N",

            name:
                applicant.name,

            email:
                applicant.email,

            age:
                applicant.age,

            location:
                applicant.location

        });


    if (filled) {
        editModal.show();
    }

}


/* =========================================================
   NEW APPLICANT DELETE
========================================================= */

function deleteApplicant(id) {

    const applicants =
        getApplicants();


    const applicant =
        applicants.find(
            function(item) {

                return (
                    item.id ===
                    id
                );

            }
        );


    if (!applicant) {
        return;
    }


    const confirmed =
        confirm(
            `Delete application for "${applicant.name}"?`
        );


    if (!confirmed) {
        return;
    }


    const updatedApplicants =
        applicants.filter(
            function(item) {

                return (
                    item.id !==
                    id
                );

            }
        );


    if (
        !saveApplicants(
            updatedApplicants
        )
    ) {
        return;
    }


    const row =
        document.querySelector(
            `[data-application-id="${CSS.escape(
                id
            )}"]`
        );


    if (row) {

        row.remove();

    }

}


/* =========================================================
   NEW APPLICANT BUTTONS
========================================================= */

function initApplicantActions() {

    document.addEventListener(
        "click",
        function(event) {


            const editButton =
                event.target.closest(
                    ".new-app-edit"
                );


            if (editButton) {

                editApplicant(
                    editButton.dataset.id
                );

                return;
            }


            const deleteButton =
                event.target.closest(
                    ".new-app-delete"
                );


            if (deleteButton) {

                deleteApplicant(
                    deleteButton.dataset.id
                );

            }

        }
    );

}


/* =========================================================
   START EVERYTHING
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initLogin();

        loadNavbar();

        loadApplyModal();

        initFixedEmployeeActions();

        initEditPhotoPreview();

        initEditSaveButton();

        initApplicantActions();

        renderNewApplicants();

    }
);