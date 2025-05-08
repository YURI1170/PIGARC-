import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Chart from 'chart.js/auto';

// Configuration de base
const API_BASE_URL = '/api';

// Fonctions utilitaires
const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
};

// Gestion des requêtes API
const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            showNotification(error.message, 'error');
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            showNotification(error.message, 'error');
            throw error;
        }
    }
};

// Gestionnaire de navigation
const handleNavigation = () => {
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            // Ici, vous pouvez ajouter la logique de navigation
            console.log(`Navigation vers: ${href}`);
        });
    });
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    handleNavigation();
    console.log('Application initialisée');
});

// Configuration de l'API
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur d'authentification
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur d'erreurs
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
        const status = error.response?.status;

        switch (status) {
            case 401:
                showNotification('Session expirée. Veuillez vous reconnecter.', 'error');
                setTimeout(() => window.location.href = '/login', 2000);
                break;
            case 403:
                showNotification('Accès non autorisé', 'error');
                window.location.href = '/';
                break;
            case 404:
                showNotification('Ressource non trouvée', 'error');
                break;
            case 500:
                showNotification('Erreur serveur', 'error');
                break;
            default:
                showNotification(errorMessage, 'error');
        }
        return Promise.reject(error);
    }
);

function initializeApp() {
    setupEventListeners();
    initializeUI();
    if (isUserAdmin()) {
        initializeAdminFeatures();
    }
}

function setupEventListeners() {
    const sidebar = document.getElementById('sidebar');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');

    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    setupDropdowns();
    setupForms();
}

function setupDropdowns() {
    const dropdowns = document.querySelectorAll('[data-dropdown]');
    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button');
        const menu = dropdown.querySelector('[data-dropdown-menu]');

        if (button && menu) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('hidden');
            });

            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    menu.classList.add('hidden');
                }
            });
        }
    });
}

function setupForms() {
    document.querySelectorAll('form[data-ajax="true"]').forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('[type="submit"]');
    const originalText = submitButton?.innerHTML;

    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const response = await axiosInstance({
            method: form.method,
            url: form.action,
            data
        });

        if (response.data.success) {
            showNotification(response.data.message || 'Opération réussie', 'success');
            if (response.data.redirect) {
                window.location.href = response.data.redirect;
            }
        }
    } catch (error) {
        console.error('Erreur lors de la soumission du formulaire:', error);
        showNotification('Une erreur est survenue', 'error');
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
}

function isUserAdmin() {
    const userRole = document.body.dataset.userRole;
    return userRole === 'ROLE_ADMIN';
}

function initializeAdminFeatures() {
    initializeCharts();
    // Autres fonctionnalités d'administration...
}

function initializeCharts() {
    const chartElements = document.querySelectorAll('[data-chart]');
    chartElements.forEach(element => {
        const chartType = element.dataset.chart;
        const chartData = JSON.parse(element.dataset.chartData || '{}');
        
        new Chart(element, {
            type: chartType,
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    });
}

function initializeUI() {
    // Initialisation des tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        const text = tooltip.getAttribute('data-tooltip');
        tooltip.addEventListener('mouseenter', (e) => {
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip';
            tooltipEl.textContent = text;
            tooltipEl.style.top = `${e.target.offsetTop - 30}px`;
            tooltipEl.style.left = `${e.target.offsetLeft + (e.target.offsetWidth / 2)}px`;
            tooltipEl.style.transform = 'translateX(-50%)';
            document.body.appendChild(tooltipEl);
            tooltip.tooltipEl = tooltipEl;
        });

        tooltip.addEventListener('mouseleave', () => {
            if (tooltip.tooltipEl) {
                tooltip.tooltipEl.remove();
            }
        });
    });
}

export { axiosInstance, showNotification }; 