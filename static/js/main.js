// Global utilities and navigation logic
const App = {
    init() {
        this.cacheDOM();
        this.bindEvents();
    },
    
    cacheDOM() {
        // Toast
        this.toastContainer = document.getElementById('toast-container');
    },
    
    bindEvents() {
        // Global events can go here
    },
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
        toast.innerHTML = `
            <i data-lucide="${icon}"></i>
            <div style="font-weight: 500;">${message}</div>
        `;
        
        this.toastContainer.appendChild(toast);
        lucide.createIcons();
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
