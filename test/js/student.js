// js/student.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Vérifier l'authentification et le rôle
    const currentUser = checkAuth('student', 'login.html'); // checkAuth est dans main.js
    if (!currentUser) return; // Arrêter si non authentifié ou mauvais rôle

    // 2. Mettre à jour le nom de l'étudiant dans la sidebar
    const studentNameSidebar = document.getElementById('student-name-sidebar');
    if (studentNameSidebar && currentUser.name) {
        studentNameSidebar.textContent = currentUser.name;
    }

    // 3. Gérer la navigation dans les sections du tableau de bord
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a[data-section]');
    const contentSections = document.querySelectorAll('.main-content .content-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = link.getAttribute('data-section');

            // Gérer le lien profil différemment s'il redirige
            if (sectionId === 'profile' && link.href.includes('profile.html')) {
                window.location.href = link.href; // Rediriger vers profile.html
                return;
            }

            // Cacher toutes les sections et enlever la classe 'active' des liens
            contentSections.forEach(section => section.classList.remove('active'));
            sidebarLinks.forEach(slink => slink.classList.remove('active'));

            // Afficher la section cible et marquer le lien comme actif
            const targetSection = document.getElementById(sectionId + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
                link.classList.add('active');
            }

            // Charger les données pour la section active
            loadSectionData(sectionId, currentUser);
        });
    });

    // 4. Charger les données pour la section active par défaut (Mon Binôme)
    loadSectionData('my-binome', currentUser);
    document.querySelector('.sidebar-nav a[data-section="my-binome"]').classList.add('active');
    document.getElementById('my-binome-section').classList.add('active');

    // 5. Initialiser les écouteurs d'événements pour les filtres (si nécessaire plus tard)
    const searchStudentNameInput = document.getElementById('search-student-name');
    if(searchStudentNameInput) {
        searchStudentNameInput.addEventListener('keyup', () => loadSectionData('available-students', currentUser));
    }
    // ... autres filtres
});

// Fonction pour charger les données de la section appropriée
function loadSectionData(sectionId, user) {
    switch (sectionId) {
        case 'my-binome':
            loadMyBinomeStatus(user);
            loadBinomeRequests(user);
            break;
        case 'available-students':
            loadAvailableStudents(user);
            break;
        case 'project-subjects':
            loadProjectSubjects(user);
            break;
        case 'my-applications':
            loadMyApplications(user);
            break;
        case 'messages':
            loadStudentNotifications(user);
            break;
        // Pas besoin de charger des données pour 'profile' car c'est une redirection
    }
}

// ----- DONNÉES MOCK ET FONCTIONS SPÉCIFIQUES -----
// (Normalement, ces données viendraient d'un serveur/API)

let mockStudentsData = [
    { id: "std001", name: "Alice Étudiante", email: "alice@pfa.com", hasBinome: true, binomePartnerId: "std002", pfaSubjectId: "pfa001" },
    { id: "std002", name: "Bob Camarade", email: "bob@pfa.com", hasBinome: true, binomePartnerId: "std001", pfaSubjectId: "pfa001" },
    { id: "std003", name: "Charlie SansBinome", email: "charlie@pfa.com", hasBinome: false },
    { id: "std004", name: "David Dispo", email: "david@pfa.com", hasBinome: false },
    { id: "std005", name: "Eve Intéressée", email: "eve@pfa.com", hasBinome: false },
];

let mockBinomeRequests = [
    { id: "req001", fromStudentId: "std004", toStudentId: "std003", status: "pending" }, // David a demandé à Charlie
    { id: "req002", fromStudentId: "std001", toStudentId: "std005", status: "pending" }, // Alice a demandé à Eve (pas logique si Alice a déjà un binôme, mais pour tester)
];

let mockPFAProjects = [
    { id: "pfa001", title: "Application Web de Gestion de Bibliothèque", teacher: "M. Dupont", description: "Développer une application web complète pour la gestion des prêts et du catalogue d'une bibliothèque.", prerequisites: "HTML, CSS, JavaScript, Base de données", maxBinomes: 2, currentBinomes: 1, binomeIds: [["std001", "std002"]]},
    { id: "pfa002", title: "Analyse de Sentiments sur les Réseaux Sociaux", teacher: "Mme. Durand", description: "Utiliser des techniques de NLP pour analyser les sentiments exprimés dans des tweets.", prerequisites: "Python, NLP, Machine Learning", maxBinomes: 1, currentBinomes: 0, binomeIds: [] },
    { id: "pfa003", title: "Système IoT de Surveillance Agricole", teacher: "M. Leclerc", description: "Concevoir et prototyper un système basé sur des capteurs IoT pour surveiller des parcelles agricoles.", prerequisites: "Électronique, Programmation embarquée (C/C++ ou MicroPython), Réseaux", maxBinomes: 3, currentBinomes: 0, binomeIds: [] },
];

let mockStudentApplications = [
    // { applicationId: "app001", studentId: "std001", subjectId: "pfa001", date: "2025-04-15", status: "accepted" }, // Alice pour PFA001
    // (Si l'étudiant a déjà un sujet via son binôme, il n'aurait pas d'autres candidatures en attente/acceptées)
    { applicationId: "app002", studentId: "std003", subjectId: "pfa002", date: "2025-05-01", status: "pending" }, // Charlie pour PFA002
];

let mockNotifications = [
    { id: "notif001", userId: "std001", message: "Votre binôme avec Bob Camarade pour le sujet 'Application Web de Gestion de Bibliothèque' a été validé par M. Dupont.", date: "2025-04-20", read: false },
    { id: "notif002", userId: "std003", message: "Nouvelle demande de binôme reçue de David Dispo.", date: "2025-05-08", read: false },
    { id: "notif003", userId: "std001", message: "M. Dupont a posté un commentaire sur votre sujet PFA.", date: "2025-05-05", read: true },
];


// 1. Section "Mon Binôme"
function loadMyBinomeStatus(currentUser) {
    const container = document.getElementById('binome-status-container');
    const studentData = mockStudentsData.find(s => s.id === currentUser.id);
    container.innerHTML = ''; // Vider

    if (!studentData) {
        container.innerHTML = "<p>Erreur : informations utilisateur non trouvées.</p>";
        return;
    }

    if (studentData.hasBinome && studentData.binomePartnerId) {
        const partner = mockStudentsData.find(s => s.id === studentData.binomePartnerId);
        const subject = studentData.pfaSubjectId ? mockPFAProjects.find(p => p.id === studentData.pfaSubjectId) : null;

        let html = `<p>Vous êtes en binôme avec : <strong class="binome-partner">${partner ? partner.name : 'N/A'}</strong>.</p>`;
        if (subject) {
            html += `<p>Sujet attribué : <strong>${subject.title}</strong> (Encadrant: ${subject.teacher})</p>`;
            html += `<p><button class="action-btn view" onclick="viewSubjectDetails('${subject.id}')">Voir détails du sujet</button></p>`;
        } else {
            html += `<p>Votre binôme n'a pas encore de sujet attribué.</p>`;
            html += `<p>Vous pouvez <a href="#" onclick="navigateToSection('project-subjects')">consulter les sujets disponibles</a> et postuler.</p>`;
            html += `<button class="action-btn btn-cancel" onclick="cancelMyBinome('${currentUser.id}')" title="Cette action doit être confirmée par votre binôme">Annuler le Binôme</button>`;
        }
        container.innerHTML = html;
    } else {
        container.innerHTML = `
            <p>Vous n'avez pas encore de binôme.</p>
            <p>Vous pouvez <a href="#" onclick="navigateToSection('available-students')">voir les étudiants disponibles</a> et proposer une formation de binôme,
            ou attendre de recevoir une proposition.</p>
        `;
    }
}

function loadBinomeRequests(currentUser) {
    const receivedList = document.getElementById('received-binome-requests');
    const sentList = document.getElementById('sent-binome-requests');
    receivedList.innerHTML = '';
    sentList.innerHTML = '';

    // Demandes reçues par l'utilisateur courant
    mockBinomeRequests.filter(req => req.toStudentId === currentUser.id && req.status === 'pending').forEach(req => {
        const fromStudent = mockStudentsData.find(s => s.id === req.fromStudentId);
        if (fromStudent) {
            const li = document.createElement('li');
            li.innerHTML = `Demande de <strong>${fromStudent.name}</strong>
                            <button class="action-btn approve" onclick="acceptBinomeRequest('${req.id}', '${currentUser.id}', '${fromStudent.id}')">Accepter</button>
                            <button class="action-btn reject" onclick="rejectBinomeRequest('${req.id}')">Refuser</button>`;
            receivedList.appendChild(li);
        }
    });
    if (receivedList.children.length === 0) receivedList.innerHTML = '<li>Aucune demande reçue.</li>';


    // Demandes envoyées par l'utilisateur courant
    mockBinomeRequests.filter(req => req.fromStudentId === currentUser.id && req.status === 'pending').forEach(req => {
        const toStudent = mockStudentsData.find(s => s.id === req.toStudentId);
        if (toStudent) {
            const li = document.createElement('li');
            li.innerHTML = `Demande envoyée à <strong>${toStudent.name}</strong> - Statut: <span class="status-pending">En attente</span>
                           <button class="action-btn btn-cancel" onclick="cancelBinomeRequest('${req.id}')">Annuler</button>`;
            sentList.appendChild(li);
        }
    });
    if (sentList.children.length === 0) sentList.innerHTML = '<li>Aucune demande envoyée en attente.</li>';
}

// 2. Section "Étudiants Disponibles"
function loadAvailableStudents(currentUser) {
    const container = document.getElementById('students-list-container');
    const searchTerm = document.getElementById('search-student-name').value.toLowerCase();
    container.innerHTML = ''; // Vider

    const studentData = mockStudentsData.find(s => s.id === currentUser.id);
    const hasCurrentUserBinome = studentData ? studentData.hasBinome : true; // Sécurité: si user non trouvé, on empêche de proposer

    const available = mockStudentsData.filter(s =>
        s.id !== currentUser.id &&
        !s.hasBinome &&
        s.name.toLowerCase().includes(searchTerm)
    );

    if (available.length === 0) {
        container.innerHTML = "<p>Aucun étudiant disponible correspondant à votre recherche.</p>";
        return;
    }

    available.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card card';
        let proposeButton = '';
        if (!hasCurrentUserBinome) { // Ne peut proposer que s'il n'a pas de binôme
             // Vérifier si une demande existe déjà avec cet étudiant
            const existingRequest = mockBinomeRequests.find(
                req => (req.fromStudentId === currentUser.id && req.toStudentId === student.id && req.status === 'pending') ||
                       (req.toStudentId === currentUser.id && req.fromStudentId === student.id && req.status === 'pending')
            );
            if (existingRequest) {
                proposeButton = `<button class="action-btn" disabled title="Une demande est déjà en cours avec cet étudiant">Demande en cours</button>`;
            } else {
                proposeButton = `<button class="action-btn btn-propose" onclick="proposeBinome('${currentUser.id}', '${student.id}')">Proposer Binôme</button>`;
            }
        }

        card.innerHTML = `
            <h4>${student.name}</h4>
            <p class="student-email">${student.email}</p>
            ${proposeButton}
        `;
        container.appendChild(card);
    });
}

// 3. Section "Sujets de PFA"
function loadProjectSubjects(currentUser) {
    const container = document.getElementById('subjects-grid-container');
    container.innerHTML = '';

    const studentData = mockStudentsData.find(s => s.id === currentUser.id);
    const canApply = studentData && studentData.hasBinome && !studentData.pfaSubjectId;
    // L'étudiant ne peut postuler que s'il a un binôme ET que son binôme n'a pas déjà un sujet.

    mockPFAProjects.forEach(subject => {
        const card = document.createElement('div');
        card.className = 'subject-card card';
        let applyButton = '';
        const placesTaken = subject.binomeIds.length;
        const placesAvailable = subject.maxBinomes - placesTaken > 0;

        if (canApply && placesAvailable) {
            // Vérifier si déjà candidat à ce sujet
            const existingApplication = mockStudentApplications.find(app => app.studentId === currentUser.id && app.subjectId === subject.id && (app.status === 'pending' || app.status === 'accepted'));
            if (existingApplication) {
                 applyButton = `<button class="action-btn" disabled title="Vous avez déjà une candidature pour ce sujet">${existingApplication.status === 'pending' ? 'Candidature en cours' : 'Sujet Obtenu'}</button>`;
            } else {
                applyButton = `<button class="action-btn btn-apply" onclick="applyForSubject('${currentUser.id}', '${subject.id}')">Postuler (en binôme)</button>`;
            }
        } else if (canApply && !placesAvailable) {
            applyButton = `<button class="action-btn" disabled title="Aucune place disponible pour ce sujet">Complet</button>`;
        } else if (!canApply && studentData && !studentData.hasBinome) {
            applyButton = `<button class="action-btn" disabled title="Vous devez former un binôme pour postuler">Former un binôme d'abord</button>`;
        }


        card.innerHTML = `
            <h4>${subject.title}</h4>
            <p class="subject-teacher">Proposé par : <strong>${subject.teacher}</strong></p>
            <p class="subject-details">${subject.description.substring(0,100)}...</p>
            <p class="subject-details">Prérequis: <em>${subject.prerequisites || "Aucun"}</em></p>
            <p class="subject-details">Binômes autorisés: ${subject.maxBinomes} | Places prises: ${placesTaken}</p>
            ${applyButton}
            <button class="action-btn view" onclick="viewSubjectDetails('${subject.id}')" style="margin-left:5px;">Voir Détails</button>
        `;
        container.appendChild(card);
    });
     // Populate teacher filter
    const teacherFilter = document.getElementById('filter-subject-teacher');
    if (teacherFilter && teacherFilter.options.length <=1) { // Populate only once
        const teachers = [...new Set(mockPFAProjects.map(p => p.teacher))];
        teachers.forEach(t => {
            const option = document.createElement('option');
            option.value = t;
            option.textContent = t;
            teacherFilter.appendChild(option);
        });
    }
}

// 4. Section "Mes Candidatures"
function loadMyApplications(currentUser) {
    const tbody = document.getElementById('student-applications-list');
    const noAppsMessage = document.getElementById('no-applications-message');
    tbody.innerHTML = '';

    const applications = mockStudentApplications.filter(app => app.studentId === currentUser.id || (mockStudentsData.find(s => s.id === currentUser.id)?.binomePartnerId && app.studentId === mockStudentsData.find(s => s.id === currentUser.id)?.binomePartnerId ));
    // On affiche les candidatures de l'étudiant ou de son binôme s'il en a un

    if (applications.length === 0) {
        noAppsMessage.style.display = 'block';
        document.getElementById('student-applications-table').style.display = 'none';
        return;
    }
    document.getElementById('student-applications-table').style.display = 'table';
    noAppsMessage.style.display = 'none';


    applications.forEach(app => {
        const subject = mockPFAProjects.find(p => p.id === app.subjectId);
        if (subject) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${subject.title}</td>
                <td>${subject.teacher}</td>
                <td>${new Date(app.date).toLocaleDateString()}</td>
                <td class="status-${app.status}">${app.status === 'pending' ? 'En attente' : (app.status === 'accepted' ? 'Acceptée' : 'Refusée')}</td>
                <td>
                    ${app.status === 'pending' ? `<button class="action-btn btn-withdraw" onclick="withdrawApplication('${app.applicationId}')">Retirer</button>` : ''}
                    <button class="action-btn view" onclick="viewSubjectDetails('${subject.id}')">Voir Sujet</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
    });
}

// 5. Section "Messagerie & Notifications"
function loadStudentNotifications(currentUser) {
    const ul = document.getElementById('student-notifications-list');
    const noNotifsMessage = document.getElementById('no-notifications-message');
    ul.innerHTML = '';

    const notifications = mockNotifications.filter(n => n.userId === currentUser.id && !n.read).sort((a,b) => new Date(b.date) - new Date(a.date)); // Non lues, plus récentes d'abord

    if (notifications.length === 0) {
        noNotifsMessage.style.display = 'block';
        return;
    }
    noNotifsMessage.style.display = 'none';

    notifications.forEach(notif => {
        const li = document.createElement('li');
        li.innerHTML = `${notif.message} <small>(${new Date(notif.date).toLocaleString()})</small> <button class="action-btn" style="float:right; padding:2px 5px; font-size:0.7rem;" onclick="markNotificationAsRead('${notif.id}')">Lu</button>`;
        ul.appendChild(li);
    });
}


// ----- Fonctions d'Action (Simulations) -----
function proposeBinome(fromStudentId, toStudentId) {
    // Vérifier si une demande inverse existe déjà
    const inverseRequest = mockBinomeRequests.find(req => req.fromStudentId === toStudentId && req.toStudentId === fromStudentId && req.status === 'pending');
    if (inverseRequest) {
        if (confirm(`L'étudiant ${mockStudentsData.find(s=>s.id===toStudentId).name} vous a déjà envoyé une demande. Voulez-vous l'accepter directement ?`)) {
            acceptBinomeRequest(inverseRequest.id, fromStudentId, toStudentId);
        }
        return;
    }

    const newRequestId = "req" + (mockBinomeRequests.length + 100);
    mockBinomeRequests.push({ id: newRequestId, fromStudentId: fromStudentId, toStudentId: toStudentId, status: 'pending' });
    alert(`Demande de binôme envoyée à ${mockStudentsData.find(s => s.id === toStudentId).name}.`);
    loadSectionData('available-students', {id: fromStudentId}); // Recharger pour mettre à jour les boutons
    loadSectionData('my-binome', {id: fromStudentId}); // Mettre à jour la section binôme
}

function acceptBinomeRequest(requestId, user1Id, user2Id) {
    const request = mockBinomeRequests.find(req => req.id === requestId);
    if (request) {
        request.status = 'accepted'; // Marquer la demande comme acceptée

        // Mettre à jour les statuts des deux étudiants
        const student1 = mockStudentsData.find(s => s.id === user1Id);
        const student2 = mockStudentsData.find(s => s.id === user2Id);
        if (student1 && student2) {
            student1.hasBinome = true; student1.binomePartnerId = user2Id;
            student2.hasBinome = true; student2.binomePartnerId = user1Id;

            // Supprimer les autres demandes en attente pour ces deux étudiants
            mockBinomeRequests = mockBinomeRequests.filter(req =>
                !( (req.fromStudentId === user1Id || req.toStudentId === user1Id || req.fromStudentId === user2Id || req.toStudentId === user2Id) && req.status === 'pending')
            );

            alert(`Binôme formé avec ${student2.name} !`);
            // Ajouter une notification pour les deux
            mockNotifications.unshift({id: "notif"+Date.now(), userId: user1Id, message: `Vous êtes maintenant en binôme avec ${student2.name}.`, date: new Date().toISOString(), read: false});
            mockNotifications.unshift({id: "notif"+Date.now()+1, userId: user2Id, message: `Vous êtes maintenant en binôme avec ${student1.name}.`, date: new Date().toISOString(), read: false});

        } else {
            alert("Erreur lors de la mise à jour des étudiants.");
        }
    }
    loadSectionData('my-binome', {id: user1Id});
    loadSectionData('available-students', {id: user1Id}); // Pour que l'utilisateur ne puisse plus proposer
}

function rejectBinomeRequest(requestId) {
    const request = mockBinomeRequests.find(req => req.id === requestId);
    if (request) request.status = 'rejected'; // ou supprimer la demande: mockBinomeRequests = mockBinomeRequests.filter(r => r.id !== requestId);
    alert("Demande de binôme refusée.");
    const currentUser = getLoggedInUser();
    loadSectionData('my-binome', currentUser);
}
function cancelBinomeRequest(requestId) {
    mockBinomeRequests = mockBinomeRequests.filter(req => req.id !== requestId);
    alert("Demande de binôme annulée.");
    const currentUser = getLoggedInUser();
    loadSectionData('my-binome', currentUser);
    loadSectionData('available-students', currentUser);
}


function cancelMyBinome(studentId) {
    if (!confirm("Êtes-vous sûr de vouloir annuler votre binôme ? Cette action est irréversible et notifiera votre partenaire.")) return;

    const student = mockStudentsData.find(s => s.id === studentId);
    if (student && student.hasBinome && student.binomePartnerId) {
        const partner = mockStudentsData.find(s => s.id === student.binomePartnerId);
        const subjectId = student.pfaSubjectId;

        student.hasBinome = false; student.binomePartnerId = null; student.pfaSubjectId = null;
        if (partner) {
            partner.hasBinome = false; partner.binomePartnerId = null; partner.pfaSubjectId = null;
            mockNotifications.unshift({id: "notif"+Date.now(), userId: partner.id, message: `${student.name} a annulé votre binôme.`, date: new Date().toISOString(), read: false});
        }
        // Si un sujet était assigné, le libérer
        if(subjectId) {
            const subject = mockPFAProjects.find(p => p.id === subjectId);
            if(subject) {
                subject.binomeIds = subject.binomeIds.filter(pair => !pair.includes(studentId));
            }
        }
        alert("Votre binôme a été annulé.");
    }
    loadSectionData('my-binome', {id: studentId});
}

function applyForSubject(studentId, subjectId) {
    const student = mockStudentsData.find(s => s.id === studentId);
    const partner = student ? mockStudentsData.find(s => s.id === student.binomePartnerId) : null;

    if (!student || !partner) {
        alert("Erreur: binôme non trouvé pour postuler.");
        return;
    }

    const newAppId = "app" + (mockStudentApplications.length + 100);
    // Une candidature est pour le binôme, mais on peut la lier à l'étudiant qui a cliqué
    mockStudentApplications.push({ applicationId: newAppId, studentId: studentId, binomePartnerId: partner.id, subjectId: subjectId, date: new Date().toISOString(), status: 'pending' });

    // (Optionnel) Ajouter aussi une candidature pour le partenaire pour la visibilité dans "Mes candidatures"
    // mockStudentApplications.push({ applicationId: newAppId+"_p", studentId: partner.id, binomePartnerId: studentId, subjectId: subjectId, date: new Date().toISOString(), status: 'pending' });


    alert("Votre candidature (avec votre binôme) pour le sujet a été soumise. Vous recevrez une notification une fois traitée par l'enseignant.");
    loadSectionData('project-subjects', {id: studentId});
    loadSectionData('my-applications', {id: studentId});
}

function withdrawApplication(applicationId) {
    const appIndex = mockStudentApplications.findIndex(app => app.applicationId === applicationId);
    if (appIndex > -1) {
        // Si on avait créé une application dupliquée pour le partenaire, la retirer aussi
        // const partnerAppId = applicationId.endsWith("_p") ? applicationId.slice(0, -2) : applicationId + "_p";
        // mockStudentApplications = mockStudentApplications.filter(a => a.applicationId !== partnerAppId);
        mockStudentApplications.splice(appIndex, 1);
        alert("Votre candidature a été retirée.");
        const currentUser = getLoggedInUser();
        loadSectionData('my-applications', currentUser);
        loadSectionData('project-subjects', currentUser); // Mettre à jour les boutons sur les sujets
    }
}

function markNotificationAsRead(notificationId) {
    const notif = mockNotifications.find(n => n.id === notificationId);
    if (notif) notif.read = true;
    loadStudentNotifications(getLoggedInUser()); // Recharger
}

function viewSubjectDetails(subjectId) {
    const subject = mockPFAProjects.find(p => p.id === subjectId);
    if (subject) {
        // Pour une version simple, on peut utiliser alert() ou créer un modal.
        // Un modal serait mieux pour afficher plus d'informations.
        alert(`Détails du Sujet : ${subject.title}\n\nDescription : ${subject.description}\n\nEnseignant : ${subject.teacher}\n\nPrérequis : ${subject.prerequisites}\n\nBinômes max : ${subject.maxBinomes}`);
    } else {
        alert("Détails du sujet non trouvés.");
    }
}

// Fonction utilitaire pour naviguer vers une section (appelée depuis un lien <a> par exemple)
function navigateToSection(sectionId) {
    const link = document.querySelector(`.sidebar-nav a[data-section="${sectionId}"]`);
    if (link) {
        link.click(); // Simuler un clic sur le lien de la sidebar
    }
}