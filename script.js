const token = localStorage.getItem('token');
const gallery = document.querySelector('.gallery');
const filtersContainer = document.querySelector('.filters');

// 1. Récupérer les travaux
async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
}

// 2. Afficher la galerie principale
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

// 3. Gérer le LOGIN 
const loginForm = document.querySelector("form");
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token); 
            window.location.href = "index.html"; 
        } else {
            alert("Email ou mot de passe incorrect");
        }
    });
}

// 4. Gérer le mode ADMIN et LOGOUT
function checkLogin() {
    const adminElements = document.querySelectorAll(".admin-only");
    const loginLink = document.querySelector("#login-link");
    const filters = document.querySelector(".filters");

    if (token) {
        // AFFICHER les éléments admin
        adminElements.forEach(el => {
            el.style.display = "flex";
        });

        // CACHER les filtres (Optionnel, selon la maquette)
        if (filters) filters.style.display = "none";

        // Changer LOGIN en LOGOUT
        if (loginLink) {
            loginLink.textContent = "logout";
            loginLink.addEventListener("click", (e) => {
                e.preventDefault(); 
                localStorage.removeItem("token");
                window.location.href = "index.html"; // Recharge et cache tout
            });
        }
    } else {
        // S'il n'y a pas de token, on s'assure que tout est caché
        adminElements.forEach(el => {
            el.style.display = "none";
        });
    }
}
// 5. Gérer la MODALE
// 5. Gérer la MODALE
function manageModal() {
    const modal = document.querySelector('#modal1');
    // On cherche l'ID "modifier" que tu as mis dans ton HTML
    const openBtn = document.querySelector('#modifier'); 
    const closeBtn = document.querySelector('.js-modal-close');

    if (openBtn && modal) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            displayModalWorks(); // Charge les photos + poubelles
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Fermer en cliquant à côté
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}

// 6. Afficher les photos dans la modale
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
}

// LANCEMENT
displayWorks();
displayFilters(); 
checkLogin();
manageModal();

async function displayFilters() {
    const categories = await fetch("http://localhost:5678/api/categories").then(res => res.json());
    const filtersContainer = document.querySelector(".filters");
    if (!filtersContainer) return;

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
const btnAddPhoto = document.getElementById('btn-add-photo');
const btnBack = document.querySelector('.js-modal-back');
const galleryView = document.getElementById('modal-gallery-view');
const addView = document.getElementById('modal-add-view');

// Aller vers le formulaire d'ajout
if (btnAddPhoto) {
    btnAddPhoto.addEventListener('click', () => {
        galleryView.style.display = 'none';
        addView.style.display = 'block';
        // ON AFFICHE LA FLÈCHE ICI
        btnBack.style.visibility = 'visible'; 
    });
}

// Revenir à la galerie
if (btnBack) {
    btnBack.addEventListener('click', () => {
        addView.style.display = 'none';
        galleryView.style.display = 'block';
        // ON CACHE LA FLÈCHE ICI
        btnBack.style.visibility = 'hidden';
    });
}
const inputFile = document.getElementById('file');
const previewImage = document.getElementById('image-preview');
const dropZoneContent = document.querySelectorAll('.drop-zone i, .drop-zone label, .drop-zone p');

inputFile.addEventListener('change', () => {
    const file = inputFile.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            // Cacher les icônes et le texte
            dropZoneContent.forEach(el => el.style.display = 'none');
        };
        reader.readAsDataURL(file);
    }
});