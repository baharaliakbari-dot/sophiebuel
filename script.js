const token = localStorage.getItem('token');
const gallery = document.querySelector('.gallery');
const filtersContainer = document.querySelector('.filters');

// --- 1. RÉCUPÉRATION DES DONNÉES ---
async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
}

async function getCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    return await response.json();
}

// --- 2. AFFICHAGE GALERIE PRINCIPALE ---
async function displayWorks(filterId = null) {
    const works = await getWorks();
    if (!gallery) return;
    gallery.innerHTML = ""; 
    
    const filteredWorks = filterId 
        ? works.filter(work => work.categoryId === filterId) 
        : works;

    filteredWorks.forEach(work => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        gallery.appendChild(figure);
    });
}

async function displayFilters() {
    const categories = await getCategories();
    if (!filtersContainer || token) return; // Cache les filtres si admin (token présent)

    filtersContainer.innerHTML = "";
    const btnAll = document.createElement("button");
    btnAll.textContent = "Tous";
    btnAll.classList.add("filter-active"); 
    btnAll.addEventListener("click", () => displayWorks());
    filtersContainer.appendChild(btnAll);

    categories.forEach(category => {
        const btn = document.createElement("button");
        btn.textContent = category.name;
        btn.addEventListener("click", () => displayWorks(category.id));
        filtersContainer.appendChild(btn);
    });
}

// --- 3. GESTION LOGIN / ADMIN ---
function checkLogin() {
    const adminElements = document.querySelectorAll(".admin-only");
    const loginLink = document.querySelector("#login-link");

    if (token) {
        adminElements.forEach(el => el.style.display = "flex");
        if (filtersContainer) filtersContainer.style.display = "none";
        if (loginLink) {
            loginLink.textContent = "logout";
            loginLink.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                window.location.href = "index.html";
            });
        }
    }
}

// --- 4. GESTION DE LA MODALE ---
function manageModal() {
    const modal = document.querySelector('#modal1');
    const openBtn = document.querySelector('#modifier'); 
    const closeBtn = document.querySelector('.js-modal-close');
    const btnAddPhoto = document.getElementById('btn-add-photo');
    const btnBack = document.querySelector('.js-modal-back');
    const galleryView = document.getElementById('modal-gallery-view');
    const addView = document.getElementById('modal-add-view');

    // Quand tu OUUVRES la modale
openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false'); // On dit aux lecteurs d'écran : "C'est visible"
    displayModalWorks();
});

// Quand tu FERMES la modale
const closeModal = () => {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true'); // On dit aux lecteurs d'écran : "C'est caché"
    resetForm();
};

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Navigation interne modale
    if (btnAddPhoto) {
        btnAddPhoto.addEventListener('click', () => {
            galleryView.style.display = 'none';
            addView.style.display = 'block';
            btnBack.style.visibility = 'visible';
            fillModalCategories();
        });
    }

    if (btnBack) {
        btnBack.addEventListener('click', () => {
            addView.style.display = 'none';
            galleryView.style.display = 'block';
            btnBack.style.visibility = 'hidden';
        });
    }
}

// --- 5. ACTIONS MODALE (SUPPRESSION / AJOUT) ---
async function displayModalWorks() {
    const modalGallery = document.querySelector('.modal-gallery'); 
    if (!modalGallery) return; 
    const works = await getWorks(); 
    modalGallery.innerHTML = ""; 

    works.forEach(work => {
        const figure = document.createElement('figure');
        figure.classList.add('modal-item');
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <i class="fa-solid fa-trash-can" data-id="${work.id}"></i>
        `;
        modalGallery.appendChild(figure);
    });

    // Supprimer une photo
    document.querySelectorAll('.fa-trash-can').forEach(trash => {
        trash.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            const response = await fetch(`http://localhost:5678/api/works/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                displayModalWorks();
                displayWorks();
            }
        });
    });
}

async function fillModalCategories() {
    const select = document.getElementById('category');
    if (!select || select.options.length > 1) return;
    const categories = await getCategories();
    select.innerHTML = '<option value=""></option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        select.appendChild(opt);
    });
}

// --- 6. FORMULAIRE D'AJOUT ET PREVIEW ---
const inputFile = document.getElementById('file');
const previewImage = document.getElementById('image-preview');
const dropZoneContent = document.querySelectorAll('.drop-zone i, .drop-zone label, .drop-zone p');
const formAdd = document.getElementById('form-add-photo');
const btnValidate = document.getElementById('btn-validate');

if (inputFile) {
    inputFile.addEventListener('change', () => {
        const file = inputFile.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                dropZoneContent.forEach(el => el.style.display = 'none');
            };
            reader.readAsDataURL(file);
        }
        checkForm();
    });
}

function checkForm() {
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const file = document.getElementById('file').files[0];
    const btnValidate = document.getElementById('btn-validate');

    // Debug pour toi : regarde ta console F12
    console.log("Check -> Titre:", title, "| Catégorie:", category, "| Photo:", file ? "OK" : "Manquante");

    if (title.trim() !== "" && category !== "" && file !== undefined) {
        btnValidate.style.backgroundColor = "#1D6154"; // Vert
        btnValidate.disabled = false;
    } else {
        btnValidate.style.backgroundColor = "#A7A7A7"; // Gris
        btnValidate.disabled = true;
    }
}

if (formAdd) {
    formAdd.addEventListener('input', checkForm);
    formAdd.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', inputFile.files[0]);
        formData.append('title', document.getElementById('title').value);
        formData.append('category', document.getElementById('category').value);

        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            displayWorks();
            document.querySelector('.js-modal-close').click(); // Ferme la modale
        }
    });
}

function resetForm() {
    if (formAdd) formAdd.reset();
    previewImage.style.display = 'none';
    dropZoneContent.forEach(el => el.style.display = 'block');
    checkForm();
}

// --- LANCEMENT ---
displayWorks();
displayFilters(); 
checkLogin();
manageModal();
function checkForm() {
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const file = document.getElementById('file').files[0];
    const btn = document.getElementById('btn-validate');

    console.log("Titre:", title, "Cat:", category, "Photo:", file);

    if (title !== "" && category !== "" && file !== undefined) {
        btn.classList.add('active');
        btn.disabled = false;        
    } else {
        btn.classList.remove('active');
        btn.disabled = true;
    }
}