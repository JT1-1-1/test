// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // Gestion de l'année dans le footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Menu Burger pour mobile
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');
    if (burgerMenu && navLinks) {
        burgerMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Mise à jour de la barre de navigation en fonction de l'état de connexion
    updateNavbar();

    // (Optionnel) Fermer le menu mobile si on clique sur un lien
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
        });
    });
});

// ----- Simulation d'Authentification & Gestion de Session -----
// Utilisateurs mock (normalement, ceci viendrait d'un backend)
const MOCK_USERS = {
    "etudiant@pfa.com": { password: "password123", role: "student", name: "Alice Étudiante", id: "std001" },
    "prof@pfa.com": { password: "password123", role: "teacher", name: "Bob Enseignant", id: "prof001" },
    "admin@pfa.com": { password: "password123", role: "admin", name: "Charlie Admin", id: "adm001" }
};

function loginUser(email, password, role) {
    const user = MOCK_USERS[email];
    if (user && user.password === password && user.role === role) {
        const userData = {
            email: user.email,
            role: user.role,
            name: user.name,
            id: user.id,
            // Simuler un token
            // token: 'fake-jwt-token-' + Math.random().toString(36).substring(7)
        };
        localStorage.setItem('loggedInUser', JSON.stringify(userData));
        return userData;
    }
    return null;
}

function logoutUser() {
    localStorage.removeItem('loggedInUser');
    updateNavbar(); // Mettre à jour la navbar immédiatement
    // Rediriger vers la page d'accueil si on n'y est pas déjà
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = 'index.html';
    }
}

function getLoggedInUser() {
    const user = localStorage.getItem('loggedInUser');
    return user ? JSON.parse(user) : null;
}

function checkAuth(requiredRole = null, redirectPath = 'login.html') {
    const user = getLoggedInUser();
    if (!user) {
        window.location.href = redirectPath;
        return null;
    }
    if (requiredRole && user.role !== requiredRole) {
        alert('Accès non autorisé pour votre rôle.');
        window.location.href = 'index.html'; // Ou une page d'erreur dédiée
        return null;
    }
    return user;
}

// Mettre à jour la barre de navigation (liens Connexion/Tableau de bord/Déconnexion)
function updateNavbar() {
    const user = getLoggedInUser();
    const navLinksContainer = document.querySelector('.nav-links');
    if (!navLinksContainer) return;

    // Retirer les anciens boutons dynamiques pour éviter les doublons
    navLinksContainer.querySelectorAll('.dynamic-nav-item').forEach(item => item.remove());

    const heroCtaButton = document.getElementById('hero-cta-button');

    if (user) {
        // L'utilisateur est connecté
        let dashboardLink = '';
        let dashboardText = '';
        if (user.role === 'student') {
            dashboardLink = 'student-dashboard.html';
            dashboardText = 'Tableau de Bord Étudiant';
        } else if (user.role === 'teacher') {
            dashboardLink = 'teacher-dashboard.html';
            dashboardText = 'Tableau de Bord Enseignant';
        } else if (user.role === 'admin') {
            dashboardLink = 'admin-dashboard.html';
            dashboardText = 'Tableau de Bord Admin';
        }

        // Créer le lien vers le tableau de bord
        const dashboardLi = document.createElement('li');
        dashboardLi.className = 'dynamic-nav-item';
        dashboardLi.innerHTML = `<a href="${dashboardLink}" class="nav-dashboard-btn">${dashboardText}</a>`;
        navLinksContainer.appendChild(dashboardLi);

        // Créer le message de bienvenue (optionnel, peut être encombrant sur la nav)
        /*
        const welcomeLi = document.createElement('li');
        welcomeLi.className = 'dynamic-nav-item';
        welcomeLi.innerHTML = `<span style="color: #ffc107; padding: 0.5rem 0;">Bonjour, ${user.name}</span>`;
        navLinksContainer.appendChild(welcomeLi);
        */

        // Créer le bouton de déconnexion
        const logoutLi = document.createElement('li');
        logoutLi.className = 'dynamic-nav-item';
        const logoutButton = document.createElement('a');
        logoutButton.href = '#';
        logoutButton.textContent = 'Déconnexion';
        logoutButton.className = 'nav-logout-btn';
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
        logoutLi.appendChild(logoutButton);
        navLinksContainer.appendChild(logoutLi);

        if (heroCtaButton && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
            heroCtaButton.textContent = 'Accéder à mon Espace';
            heroCtaButton.href = dashboardLink;
        }

    } else {
        // L'utilisateur n'est pas connecté
        const loginLi = document.createElement('li');
        loginLi.className = 'dynamic-nav-item';
        loginLi.innerHTML = `<a href="login.html" class="nav-login-btn">Connexion</a>`;
        navLinksContainer.appendChild(loginLi);

        if (heroCtaButton && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
            heroCtaButton.textContent = 'Commencer';
            heroCtaButton.href = 'login.html';
        }
    }
}

// Fonction utilitaire pour afficher des messages (erreurs, succès)
function showMessage(containerId, message, type = 'error') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.textContent = message;
    container.className = ''; // Réinitialiser les classes
    container.classList.add(type === 'error' ? 'error-message' : 'success-message');
    container.style.display = 'block';

    // Cacher le message après quelques secondes
    setTimeout(() => {
        container.style.display = 'none';
    }, 5000);
}