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

// --- 3. FILTRES ---
async function displayFilters() {
    const categories = await getCategories();
    if (!filtersContainer || token) {
        if (filtersContainer) filtersContainer.style.display = "none";
        return;
    } 

    filtersContainer.innerHTML = "";
    const btnAll = document.createElement("button");
    btnAll.textContent = "Tous";
    btnAll.classList.add("filter-active"); 
    btnAll.addEventListener("click", () => {
        displayWorks();
        updateActiveFilter(btnAll);
    });
    filtersContainer.appendChild(btnAll);

    categories.forEach(category => {
        const btn = document.createElement("button");
        btn.textContent = category.name;
        btn.addEventListener("click", () => {
            displayWorks(category.id);
            updateActiveFilter(btn);
        });
        filtersContainer.appendChild(btn);
    });
}

function updateActiveFilter(clickedButton) {
    const allButtons = document.querySelectorAll('.filters button');
    allButtons.forEach(btn => btn.classList.remove('filter-active'));
    clickedButton.classList.add('filter-active');
}

// --- 4. GESTION LOGIN / LOGOUT (CORRIGÉ) ---
function checkLogin() {
    const loginLink = document.querySelector("#login-link");
    const adminBar = document.querySelector(".admin-banner"); 
    const editButtons = document.querySelectorAll(".admin-only"); 
    
    if (token) {
        // Mode ADMIN
        if (loginLink) {
            loginLink.textContent = "logout";
            loginLink.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token"); // On vide le badge
                window.location.href = "index.html"; // On force le retour à l'état visiteur
            });
        }
        if (adminBar) adminBar.style.display = "flex";
        editButtons.forEach(el => el.style.display = "flex");
    } else {
        // Mode VISITEUR (On s'assure que tout est caché)
        if (adminBar) adminBar.style.display = "none";
        editButtons.forEach(el => el.style.display = "none");
    }
}

// --- 5. GESTION DE LA MODALE (CORRIGÉ POUR LA CONSOLE) ---
function manageModal() {
    const modal = document.querySelector('#modal1');
    const openBtn = document.querySelector('#modifier'); 
    const closeBtns = document.querySelectorAll('.js-modal-close');
    const btnAddPhoto = document.getElementById('btn-add-photo');
    const btnBack = document.querySelector('.js-modal-back');
    const galleryView = document.getElementById('modal-gallery-view');
    const addView = document.getElementById('modal-add-view');

    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        modal.removeAttribute('aria-hidden'); // Supprime l'erreur ARIA
        displayModalWorks();
    });

    const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true'); // Remet l'état caché
        resetForm();
    };

    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    if (btnAddPhoto) {
        btnAddPhoto.addEventListener('click', () => {
            galleryView.style.display = 'none';
            addView.style.display = 'block';
            if (btnBack) btnBack.style.visibility = 'visible';
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

// --- 6. ACTIONS MODALE (SUPPRESSION) ---
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

// --- 7. FORMULAIRE D'AJOUT PHOTO ---
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

const inputFile = document.getElementById('file');
const previewImage = document.getElementById('image-preview');
const dropZoneContent = document.querySelectorAll('.drop-zone i, .drop-zone label, .drop-zone p');
const formAdd = document.getElementById('form-add-photo');

function checkForm() {
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const file = document.getElementById('file').files[0];
    const btn = document.getElementById('btn-validate');

    if (btn) {
        if (title !== "" && category !== "" && file !== undefined) {
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.style.backgroundColor = "#1D6154";
        } else {
            btn.disabled = true;
            btn.style.cursor = "not-allowed";
            btn.style.backgroundColor = "#A7A7A7";
        }
    }
}

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
            document.querySelector('.js-modal-close').click();
            resetForm(); // On nettoie le formulaire après succès
        }
    });
}

function resetForm() {
    if (formAdd) formAdd.reset();
    if (previewImage) {
        previewImage.style.display = 'none';
        previewImage.src = "";
    }
    dropZoneContent.forEach(el => el.style.display = 'block');
    checkForm();
}

// --- LANCEMENT ---
displayWorks();
displayFilters(); 
checkLogin();
manageModal();