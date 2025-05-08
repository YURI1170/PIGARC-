import { showNotification } from './main.js';

// Gestion du modal
const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
let currentProjectId = null;

function openProjectModal(projectId = null) {
    currentProjectId = projectId;
    projectModal.classList.remove('hidden');
    
    if (projectId) {
        // Charger les données du projet
        fetchProject(projectId);
    } else {
        projectForm.reset();
        document.getElementById('modalTitle').textContent = 'Nouveau Projet';
    }
}

function closeProjectModal() {
    projectModal.classList.add('hidden');
    currentProjectId = null;
    projectForm.reset();
}

async function fetchProject(id) {
    try {
        const response = await fetch(`/api/projects/${id}`);
        const project = await response.json();
        
        // Remplir le formulaire
        projectForm.name.value = project.name;
        projectForm.description.value = project.description;
        projectForm.startDate.value = project.startDate;
        projectForm.endDate.value = project.endDate;
        projectForm.priority.value = project.priority;
        
        document.getElementById('modalTitle').textContent = 'Modifier le Projet';
    } catch (error) {
        showNotification('Erreur lors du chargement du projet', 'error');
    }
}

// Gestion du formulaire
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(projectForm);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const url = currentProjectId ? 
            `/api/projects/${currentProjectId}` : 
            '/api/projects';
            
        const method = currentProjectId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            showNotification(
                currentProjectId ? 
                'Projet mis à jour avec succès' : 
                'Projet créé avec succès',
                'success'
            );
            closeProjectModal();
            // Recharger la liste des projets
            window.location.reload();
        } else {
            throw new Error('Erreur lors de l\'enregistrement');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Gestion de la suppression
async function deleteProject(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            showNotification('Projet supprimé avec succès', 'success');
            // Recharger la liste des projets
            window.location.reload();
        } else {
            throw new Error('Erreur lors de la suppression');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Gestion des filtres
const filterForm = document.querySelector('.bg-white.p-4');
if (filterForm) {
    const inputs = filterForm.querySelectorAll('select, input');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const filters = {
                status: filterForm.querySelector('select[name="status"]').value,
                priority: filterForm.querySelector('select[name="priority"]').value,
                search: filterForm.querySelector('input[name="search"]').value,
            };
            
            // Mettre à jour l'URL avec les filtres
            const params = new URLSearchParams(filters);
            window.location.href = `/projects?${params.toString()}`;
        });
    });
}

// Exporter les fonctions pour l'utilisation dans le HTML
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.deleteProject = deleteProject; 