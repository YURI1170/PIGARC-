import { showNotification } from './main.js';

// Gestion du modal
const resourceModal = document.getElementById('resourceModal');
const resourceForm = document.getElementById('resourceForm');
let currentResourceId = null;

function openResourceModal(resourceId = null) {
    currentResourceId = resourceId;
    resourceModal.classList.remove('hidden');
    
    if (resourceId) {
        // Charger les données de la ressource
        fetchResource(resourceId);
    } else {
        resourceForm.reset();
        document.getElementById('modalTitle').textContent = 'Nouvelle Ressource';
    }
}

function closeResourceModal() {
    resourceModal.classList.add('hidden');
    currentResourceId = null;
    resourceForm.reset();
}

async function fetchResource(id) {
    try {
        const response = await fetch(`/api/resources/${id}`);
        const resource = await response.json();
        
        // Remplir le formulaire
        resourceForm.name.value = resource.name;
        resourceForm.type.value = resource.type;
        resourceForm.description.value = resource.description;
        
        document.getElementById('modalTitle').textContent = 'Modifier la Ressource';
    } catch (error) {
        showNotification('Erreur lors du chargement de la ressource', 'error');
    }
}

// Gestion du formulaire
resourceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(resourceForm);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const url = currentResourceId ? 
            `/api/resources/${currentResourceId}` : 
            '/api/resources';
            
        const method = currentResourceId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            showNotification(
                currentResourceId ? 
                'Ressource mise à jour avec succès' : 
                'Ressource créée avec succès',
                'success'
            );
            closeResourceModal();
            // Recharger la liste des ressources
            window.location.reload();
        } else {
            throw new Error('Erreur lors de l\'enregistrement');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Gestion de la suppression
async function deleteResource(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/resources/${id}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            showNotification('Ressource supprimée avec succès', 'success');
            // Recharger la liste des ressources
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
                type: filterForm.querySelector('select[name="type"]').value,
                status: filterForm.querySelector('select[name="status"]').value,
                search: filterForm.querySelector('input[name="search"]').value,
            };
            
            // Mettre à jour l'URL avec les filtres
            const params = new URLSearchParams(filters);
            window.location.href = `/resources?${params.toString()}`;
        });
    });
}

// Exporter les fonctions pour l'utilisation dans le HTML
window.openResourceModal = openResourceModal;
window.closeResourceModal = closeResourceModal;
window.deleteResource = deleteResource; 