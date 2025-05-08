import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Chart from 'chart.js/auto';

// API configuration
const API_BASE_URL = 'http://localhost:8080/api';
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Authentication interceptor
axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Error interceptor
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

// Initialize charts and other UI components
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du menu mobile
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

    // Gestion des dropdowns
    const userDropdown = document.getElementById('userDropdown');
    const notificationsDropdown = document.getElementById('notificationsDropdown');

    if (userDropdown) {
        const userButton = userDropdown.querySelector('button');
        const userMenu = document.getElementById('userMenu');

        userButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }

    if (notificationsDropdown) {
        const notificationsButton = notificationsDropdown.querySelector('button');
        const notificationsMenu = document.getElementById('notificationsMenu');

        notificationsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsMenu.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!notificationsDropdown.contains(e.target)) {
                notificationsMenu.classList.add('hidden');
            }
        });
    }

    // Gestion du spinner de chargement
    window.showLoading = function() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
    };

    window.hideLoading = function() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    };

    // Gestion des notifications Toastify
    window.showNotification = function(message, type = 'info', duration = 3000) {
        const options = {
            text: message,
            duration: duration,
            gravity: "top",
            position: "right",
            backgroundColor: type === 'success' ? '#10B981' : 
                           type === 'error' ? '#EF4444' : 
                           type === 'warning' ? '#F59E0B' : '#3B82F6',
            onClick: function() {
                this.hideToast();
            }
        };
        Toastify(options).showToast();
    };

    // Gestion des requêtes AJAX
    window.ajaxRequest = async function(url, options = {}) {
        showLoading();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // Timeout de 30 secondes

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            hideLoading();
            return data;
        } catch (error) {
            hideLoading();
            if (error.name === 'AbortError') {
                showNotification('La requête a expiré', 'error');
            } else {
                showNotification('Une erreur est survenue', 'error');
            }
            console.error('Erreur AJAX:', error);
            throw error;
        }
    };

    // Gestion des formulaires
    document.querySelectorAll('form[data-ajax="true"]').forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitButton = form.querySelector('[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            try {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
                
                const formData = new FormData(this);
                const data = Object.fromEntries(formData.entries());

                const response = await ajaxRequest(this.action, {
                    method: this.method,
                    body: JSON.stringify(data)
                });

                if (response.success) {
                    showNotification(response.message || 'Opération réussie', 'success');
                    if (response.redirect) {
                        window.location.href = response.redirect;
                    }
                } else {
                    showNotification(response.message || 'Une erreur est survenue', 'error');
                }
            } catch (error) {
                showNotification('Une erreur est survenue', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        });
    });

    // Gestion des confirmations
    window.confirmAction = function(message, callback) {
        if (confirm(message)) {
            callback();
        }
    };

    // Gestion des tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        const text = tooltip.getAttribute('data-tooltip');
        tooltip.addEventListener('mouseenter', (e) => {
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg';
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

    const userRole = document.body.dataset.userRole;
    
    // Only initialize charts if user has access
    if (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_HR') {
        initializeCharts();
    }
    
    setupEventListeners();
});

function initializeCharts() {
    const ctx = document.getElementById('stockChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Café', 'Eau', 'Snacks'],
                datasets: [{
                    label: 'Niveau de stock',
                    data: [42, 18, 36],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.5)',
                        'rgba(59, 130, 246, 0.5)',
                        'rgba(96, 165, 250, 0.5)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'État des stocks'
                    }
                }
            }
        });
    }
}

function setupEventListeners() {
    // Add event listeners for interactive elements
    const clockInBtn = document.getElementById('clockInBtn');
    if (clockInBtn) {
        clockInBtn.addEventListener('click', handleClockIn);
    }
}

async function handleClockIn() {
    try {
        const response = await axiosInstance.post('/time-tracking/clock-in');
        if (response.data.success) {
            showNotification('Pointage enregistré avec succès');
        }
    } catch (error) {
        console.error('Erreur lors du pointage:', error);
        showNotification('Erreur lors du pointage', 'error');
    }
}

export { axiosInstance };