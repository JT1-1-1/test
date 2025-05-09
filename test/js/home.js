// js/home.js
document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
    loadTeamMembers();

    const user = getLoggedInUser();
    const addReviewFormContainer = document.getElementById('add-review-form-container');
    const reviewForm = document.getElementById('review-form');

    if (user && addReviewFormContainer) { // Afficher le formulaire d'avis si l'utilisateur est connecté
        addReviewFormContainer.style.display = 'block';
        const reviewNameField = document.getElementById('review-name');
        if (reviewNameField && user.name) {
            reviewNameField.value = user.name; // Pré-remplir le nom
        }
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', handleAddReview);
    }
});

// Données Mock pour les avis et l'équipe
const mockReviews = [
    {
        name: "Jean Dupont",
        avatar: "images/avatars/user_placeholder.png", // Remplacez par de vraies images
        rating: 4,
        comment: "Super plateforme, très intuitive et facile à utiliser pour la gestion de nos PFA !"
    },
    {
        name: "Alice Martin",
        avatar: "images/avatars/user_placeholder.png",
        rating: 5,
        comment: "La fonctionnalité de gestion des binômes est vraiment un plus. Ça simplifie énormément les choses."
    },
    {
        name: "Omar Chafik",
        avatar: "images/avatars/user_placeholder.png",
        rating: 4,
        comment: "J'apprécie la clarté des informations et la facilité pour contacter les encadrants."
    }
];

const mockTeam = [
    {
        name: "Prénom NOM 1",
        role: "Chef de Projet / Développeur Full-Stack",
        photo: "images/team/member_placeholder.png" // Remplacez par de vraies images
    },
    {
        name: "Prénom NOM 2",
        role: "Développeur Front-End / UI-UX Designer",
        photo: "images/team/member_placeholder.png"
    },
    {
        name: "Prénom NOM 3",
        role: "Développeur Back-End / Base de Données",
        photo: "images/team/member_placeholder.png"
    }
    // Ajoutez d'autres membres si nécessaire
];

function generateRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
    }
    return stars;
}

function loadReviews() {
    const reviewsContainer = document.getElementById('reviews-container');
    if (!reviewsContainer) return;

    reviewsContainer.innerHTML = ''; // Vider le conteneur

    mockReviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card card'; // Ajout de la classe card
        reviewCard.innerHTML = `
            <div class="review-header">
                <img src="${review.avatar}" alt="Avatar de ${review.name}" class="review-avatar">
                <div>
                    <span class="review-name">${review.name}</span>
                    <div class="review-rating">${generateRatingStars(review.rating)}</div>
                </div>
            </div>
            <p class="review-comment">"${review.comment}"</p>
        `;
        reviewsContainer.appendChild(reviewCard);
    });
}

function loadTeamMembers() {
    const teamContainer = document.getElementById('team-container');
    if (!teamContainer) return;

    teamContainer.innerHTML = ''; // Vider le conteneur

    mockTeam.forEach(member => {
        const memberCard = document.createElement('div');
        memberCard.className = 'team-member-card'; // Pas besoin de 'card' ici, il a déjà son propre style
        memberCard.innerHTML = `
            <img src="${member.photo}" alt="Photo de ${member.name}" class="team-avatar">
            <h3 class="team-member-name">${member.name}</h3>
            <p class="team-member-role">${member.role}</p>
        `;
        teamContainer.appendChild(memberCard);
    });
}

function handleAddReview(event) {
    event.preventDefault();
    const name = document.getElementById('review-name').value;
    const rating = parseInt(document.getElementById('review-rating').value);
    const comment = document.getElementById('review-comment').value;
    const user = getLoggedInUser(); // Pour la photo de profil si disponible

    if (!name || !comment || isNaN(rating)) {
        alert("Veuillez remplir tous les champs du formulaire d'avis.");
        return;
    }

    const newReview = {
        name: name,
        avatar: user && user.avatar ? user.avatar : "images/avatars/user_placeholder.png", // Utiliser l'avatar de l'utilisateur si disponible
        rating: rating,
        comment: comment
    };

    // Ajouter le nouvel avis au début du tableau mockReviews (pour l'affichage immédiat)
    mockReviews.unshift(newReview);
    loadReviews(); // Recharger les avis pour afficher le nouveau

    // Réinitialiser le formulaire
    document.getElementById('review-form').reset();
    const reviewNameField = document.getElementById('review-name');
     if (reviewNameField && user && user.name) {
            reviewNameField.value = user.name; // Pré-remplir le nom à nouveau après reset
        }


    // Normalement, ici, vous enverriez l'avis à un serveur.
    // Pour cette démo, il est juste ajouté localement.
    // Vous pouvez ajouter un message de succès
    const reviewFormContainer = document.getElementById('add-review-form-container');
    let successMsg = reviewFormContainer.querySelector('.success-message-review');
    if (!successMsg) {
        successMsg = document.createElement('p');
        successMsg.className = 'success-message success-message-review'; // Classe spécifique si besoin
        reviewFormContainer.insertBefore(successMsg, document.getElementById('review-form'));
    }
    successMsg.textContent = 'Merci pour votre avis ! Il a été ajouté.';
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 4000);

    console.log("Nouvel avis soumis (simulation) :", newReview);
}