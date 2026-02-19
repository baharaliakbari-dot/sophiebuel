const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // On force le vidage de toute alerte précédente
    errorMessage.textContent = "";

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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
        // ON ÉCRIT ICI, SUR LA PAGE
        errorMessage.textContent = "Erreur dans l'identifiant ou le mot de passe";
        errorMessage.style.color = "red";
        errorMessage.style.fontWeight = "bold";
        errorMessage.style.textAlign = "center";
    }
});