// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const user = getLoggedInUser(); // Défini dans main.js

    // Si l'utilisateur est déjà connecté, le rediriger vers son tableau de bord
    if (user) {
        redirectToDashboard(user.role);
        return; // Empêcher l'exécution du reste du script si déjà connecté
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

function handleLogin(event) {
    event.preventDefault(); // Empêcher le rechargement de la page

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const messageContainerId = 'login-message-container';

    // Vider les messages précédents
    const messageContainer = document.getElementById(messageContainerId);
    if(messageContainer) messageContainer.innerHTML = '';


    // La fonction loginUser est définie dans main.js et utilise MOCK_USERS
    const loggedInUser = loginUser(email, password, role);

    if (loggedInUser) {
        // Afficher un message de succès (optionnel, car redirection rapide)
        showMessage(messageContainerId, 'Connexion réussie ! Redirection...', 'success');

        // Mettre à jour la navbar après la connexion
        updateNavbar(); // Fonction de main.js

        // Rediriger vers le tableau de bord approprié après un court délai
        setTimeout(() => {
            redirectToDashboard(loggedInUser.role);
        }, 1000); // Délai de 1 seconde
    } else {
        // Afficher un message d'erreur
        showMessage(messageContainerId, 'Email, mot de passe ou rôle incorrect. Veuillez réessayer.', 'error');
    }
}

function redirectToDashboard(role) {
    if (role === 'student') {
        window.location.href = 'student-dashboard.html';
    } else if (role === 'teacher') {
        window.location.href = 'teacher-dashboard.html';
    } else if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else {
        // Fallback si le rôle n'est pas reconnu (ne devrait pas arriver avec le select)
        window.location.href = 'index.html';
    }
}