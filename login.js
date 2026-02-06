// 1. On sélectionne le formulaire dans le HTML
const loginForm = document.getElementById('login-form');

// 2. On écoute quand l'utilisateur clique sur le bouton "Se connecter"
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // On empêche la page de se recharger

    // 3. On récupère l'email et le mot de passe tapés
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // 4. On prépare le message pour le serveur
    const user = {
        email: email,
        password: password
    };

    // 5. On envoie le message au serveur (ta fenêtre noire !)
    const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });

    // 6. On regarde la réponse du serveur
    if (response.ok) {
        const data = await response.json();
        // On range le Badge (Token) dans le portefeuille (LocalStorage)
        localStorage.setItem('token', data.token);
        // On redirige vers la page d'accueil
        window.location.href = 'index.html';
    } else {
        alert("Erreur dans l’identifiant ou le mot de passe");
    }
});