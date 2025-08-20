// PowerPoint-style Presentation JavaScript

class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 5;
        this.isAutoPlaying = false;
        this.autoPlayInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadImages();
        this.updateSlideIndicator();
        this.setupProfessorName();
        this.showNotification('Use as setas do teclado ou clique nos controles para navegar. Pressione "P" para apresentação automática.');
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-slide').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slideNum = parseInt(e.currentTarget.dataset.slide);
                this.goToSlide(slideNum);
            });
        });
        
        // Control buttons
        document.getElementById('prev-slide').addEventListener('click', () => {
            this.previousSlide();
        });
        
        document.getElementById('next-slide').addEventListener('click', () => {
            this.nextSlide();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    this.toggleAutoPlay();
                    break;
                case 'Escape':
                    this.stopAutoPlay();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
        });
        
        // Touch/swipe support
        this.setupTouchSupport();
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    loadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        images.forEach(img => {
            const src = img.getAttribute('data-src');
            const newImg = new Image();
            
            newImg.onload = () => {
                img.src = newImg.src;
                img.style.opacity = '1';
                img.removeAttribute('data-src');
            };
            
            newImg.onerror = () => {
                // Create a placeholder if image fails to load
                this.createImagePlaceholder(img);
            };
            
            newImg.src = src;
        });
    }
    
    createImagePlaceholder(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 300;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#27ae60');
        gradient.addColorStop(1, '#2ecc71');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('Capim Maradum', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '18px Segoe UI';
        ctx.fillText('Brachiaria brizantha', canvas.width / 2, canvas.height / 2 + 20);
        
        // Add plant icon
        ctx.font = '48px Arial';
        ctx.fillText('🌱', canvas.width / 2, canvas.height / 2 - 60);
        
        img.src = canvas.toDataURL();
        img.style.opacity = '1';
        img.removeAttribute('data-src');
    }
    
    goToSlide(slideNum) {
        if (slideNum < 1 || slideNum > this.totalSlides || slideNum === this.currentSlide) {
            return;
        }
        
        // Hide current slide
        document.querySelector('.slide.active').classList.remove('active');
        document.querySelector('.nav-slide.active').classList.remove('active');
        
        // Show new slide
        document.getElementById(`slide-${slideNum}`).classList.add('active');
        document.querySelector(`[data-slide="${slideNum}"]`).classList.add('active');
        
        this.currentSlide = slideNum;
        this.updateSlideIndicator();
        this.updateControlButtons();
        
        // Trigger slide animation
        this.animateSlideContent();
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        } else if (this.isAutoPlaying) {
            this.goToSlide(1); // Loop back to first slide in auto mode
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    updateSlideIndicator() {
        document.getElementById('current-slide').textContent = this.currentSlide;
        document.getElementById('total-slides').textContent = this.totalSlides;
    }
    
    updateControlButtons() {
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');
        
        prevBtn.disabled = this.currentSlide === 1;
        nextBtn.disabled = this.currentSlide === this.totalSlides && !this.isAutoPlaying;
    }
    
    animateSlideContent() {
        const currentSlide = document.querySelector('.slide.active');
        const contentBlocks = currentSlide.querySelectorAll('.content-block, .char-card, .feature-item');
        
        contentBlocks.forEach((block, index) => {
            block.style.opacity = '0';
            block.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                block.style.transition = 'all 0.5s ease';
                block.style.opacity = '1';
                block.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }
    
    startAutoPlay() {
        this.isAutoPlaying = true;
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 10000); // 10 seconds per slide
        
        this.showNotification('Apresentação automática iniciada (10s por slide)');
        this.updateControlButtons();
    }
    
    stopAutoPlay() {
        this.isAutoPlaying = false;
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        
        this.showNotification('Apresentação automática pausada');
        this.updateControlButtons();
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported');
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    setupTouchSupport() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            const diffTime = endTime - startTime;
            
            // Only handle swipes that are fast enough and long enough
            if (diffTime > 500 || Math.abs(diffX) < 50) return;
            
            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    // Swipe left - next slide
                    this.nextSlide();
                } else {
                    // Swipe right - previous slide
                    this.previousSlide();
                }
            }
            
            startX = 0;
            startY = 0;
        });
    }
    
    setupProfessorName() {
        const professorNameElement = document.getElementById('professor-name');
        
        // Load saved name
        const savedName = localStorage.getItem('professorName');
        if (savedName) {
            professorNameElement.textContent = savedName;
        }
        
        // Make it editable
        professorNameElement.addEventListener('click', () => {
            const currentName = professorNameElement.textContent;
            const newName = prompt('Digite o nome da professora:', currentName === '[Nome da Professora]' ? '' : currentName);
            
            if (newName && newName.trim() !== '') {
                professorNameElement.textContent = newName.trim();
                localStorage.setItem('professorName', newName.trim());
                this.showNotification('Nome da professora atualizado!');
            }
        });
        
        professorNameElement.style.cursor = 'pointer';
        professorNameElement.title = 'Clique para editar o nome da professora';
    }
    
    showNotification(message, duration = 3000) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Style notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(39, 174, 96, 0.95)',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
            zIndex: '10000',
            fontWeight: '500',
            fontSize: '14px',
            maxWidth: '300px',
            backdropFilter: 'blur(10px)',
            animation: 'slideInRight 0.3s ease-out',
            cursor: 'pointer'
        });
        
        // Add close functionality
        notification.addEventListener('click', () => {
            notification.remove();
        });
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }
    
    handleResize() {
        // Adjust layout for different screen sizes
        const container = document.querySelector('.presentation-container');
        const navigation = document.querySelector('.slide-navigation');
        
        if (window.innerWidth <= 768) {
            container.style.flexDirection = 'column';
            navigation.style.width = '100%';
            navigation.style.height = 'auto';
        } else {
            container.style.flexDirection = 'row';
            navigation.style.width = '200px';
            navigation.style.height = '100vh';
        }
    }
    
    // Export presentation as PDF (if supported)
    exportToPDF() {
        if (window.print) {
            window.print();
        } else {
            this.showNotification('Exportação para PDF não suportada neste navegador');
        }
    }
    
    // Get presentation statistics
    getStats() {
        return {
            totalSlides: this.totalSlides,
            currentSlide: this.currentSlide,
            isAutoPlaying: this.isAutoPlaying,
            imagesLoaded: document.querySelectorAll('img:not([data-src])').length,
            totalImages: document.querySelectorAll('img').length
        };
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
`;
document.head.appendChild(style);

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.presentation = new PresentationController();
    
    // Add help text
    setTimeout(() => {
        window.presentation.showNotification('Dica: Use F para tela cheia, P para auto-play, setas para navegar', 5000);
    }, 2000);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.presentation && window.presentation.isAutoPlaying) {
        window.presentation.stopAutoPlay();
    }
});

// Handle before unload
window.addEventListener('beforeunload', () => {
    if (window.presentation && window.presentation.isAutoPlaying) {
        window.presentation.stopAutoPlay();
    }
});

// Expose some functions globally for debugging
window.goToSlide = (num) => window.presentation.goToSlide(num);
window.toggleAutoPlay = () => window.presentation.toggleAutoPlay();
window.getStats = () => window.presentation.getStats();

