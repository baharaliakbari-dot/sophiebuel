// 1. VARIABLES GLOBALES
const token = localStorage.getItem('token');
const gallery = document.querySelector('.gallery');
const filtersContainer = document.querySelector('.filters');

// 2. RÉCUPÉRATION DES TRAVAUX DEPUIS L'API
async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    return await response.json();
}

// 3. AFFICHAGE DE LA GALERIE PRINCIPALE
async function displayWorks(filterId = null) {
    const works = await getWorks();
    gallery.innerHTML = ""; // On vide la galerie
    
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

// 4. GESTION DU MODE ADMINISTRATEUR
function checkAdminMode() {
    if (token) {
        // Afficher la barre noire et le bouton modifier
        if(document.querySelector('.admin-bar')) document.querySelector('.admin-bar').style.display = 'flex';
        if(document.querySelector('.js-modal')) document.querySelector('.js-modal').style.display = 'inline-block';
        if(document.querySelector('.filters')) document.querySelector('.filters').style.display = 'none';

        // Changer Login en Logout
        const loginLink = document.querySelector('nav ul li:nth-child(3)');
        if (loginLink) {
            loginLink.innerHTML = '<a href="#" id="logout">logout</a>';
            document.getElementById('logout').addEventListener('click', () => {
                localStorage.removeItem('token');
                window.location.reload();
            });
        }
    }
}

// 5. GESTION DE LA MODALE (Ouverture/Fermeture)
function manageModal() {
    const modal = document.querySelector('#modal1');
    const openBtn = document.querySelector('.js-modal');
    const closeBtn = document.querySelector('.js-modal-close');

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            displayModalWorks(); // On charge les photos + poubelles
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Fermer en cliquant à côté de la boîte blanche
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
}

// 6. AFFICHAGE DES PHOTOS DANS LA MODALE (AVEC POUBELLES)
async function displayModalWorks() {
    const modalGallery = document.querySelector('.modal-gallery'); // On cherche la div
    if (!modalGallery) return; // Si elle n'existe pas, on arrête pour éviter l'erreur
    
    const works = await getWorks(); // On récupère les photos de l'API
    modalGallery.innerHTML = ""; // On vide pour éviter les doublons

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

// 7. LANCEMENT AU CHARGEMENT DE LA PAGE
displayWorks();
checkAdminMode();
manageModal();