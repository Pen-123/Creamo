// Homepage JavaScript with animations and binary effects

class CreamoHomepage {
    constructor() {
        this.binaryContainer = document.getElementById('binaryContainer');
        this.archivesModal = document.getElementById('archivesModal');
        this.archivesContent = document.getElementById('archivesContent');
        this.init();
    }

    init() {
        this.setupButtonAnimations();
        this.setupEventListeners();
        this.animateGiantText();
    }

    setupButtonAnimations() {
        const buttons = document.querySelectorAll('.home-btn');
        
        buttons.forEach(btn => {
            // Add ripple effect
            btn.addEventListener('click', (e) => {
                this.createRipple(e, btn);
                this.triggerBinaryAnimation(e);
            });

            // Add hover sound effect (simulated)
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-8px) scale(1.05)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupEventListeners() {
        // CreamoCrypt button - navigate to cipher suite
        document.getElementById('creamocryptBtn').addEventListener('click', () => {
            setTimeout(() => {
                window.location.href = 'creamocrypt.html';
            }, 1200);
        });

        // Pen Archives button - show modal
        document.getElementById('archivesBtn').addEventListener('click', () => {
            this.showArchivesModal();
        });

        // Deluxtable button - navigate to external site
        document.getElementById('deluxtableBtn').addEventListener('click', () => {
            setTimeout(() => {
                window.open('https://deluxtable.pages.dev', '_blank');
            }, 1200);
        });

        // Close archives modal
        document.getElementById('closeArchives').addEventListener('click', () => {
            this.hideArchivesModal();
        });

        // Close modal when clicking outside
        this.archivesModal.addEventListener('click', (e) => {
            if (e.target === this.archivesModal) {
                this.hideArchivesModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.archivesModal.classList.contains('hidden')) {
                this.hideArchivesModal();
            }
        });
    }

    createRipple(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
        `;

        button.appendChild(ripple);

        // Add ripple animation to styles if not already present
        if (!document.getElementById('ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => ripple.remove(), 600);
    }

    triggerBinaryAnimation(event) {
        const rect = event.target.getBoundingClientRect();
        const startX = rect.left;
        const startY = rect.bottom;
        
        // Create multiple binary streams
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createBinaryStream(startX, startY, i);
            }, i * 100);
        }
    }

    createBinaryStream(startX, startY, index) {
        const binaryElement = document.createElement('div');
        binaryElement.className = 'binary-code';
        
        // Generate random binary string
        let binaryString = '';
        for (let i = 0; i < 20; i++) {
            binaryString += Math.random() > 0.5 ? '1' : '0';
        }
        
        binaryElement.textContent = binaryString;
        
        // Randomize animation properties
        const duration = 2 + Math.random() * 1;
        const delay = index * 0.1;
        const rotation = -15 + Math.random() * 30;
        
        binaryElement.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            transform: rotate(${rotation}deg);
            color: ${this.getRandomBinaryColor()};
            font-size: ${14 + Math.random() * 10}px;
        `;
        
        this.binaryContainer.appendChild(binaryElement);
        
        // Remove element after animation completes
        setTimeout(() => {
            if (binaryElement.parentNode) {
                binaryElement.parentNode.removeChild(binaryElement);
            }
        }, (duration + delay) * 1000);
    }

    getRandomBinaryColor() {
        const colors = [
            '#36D1DC', '#5B86E5', '#667eea', '#764ba2', '#f093fb', '#f5576c'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animateGiantText() {
        const giantText = document.getElementById('giantCreamo');
        let scale = 1;
        let growing = true;
        
        setInterval(() => {
            if (growing) {
                scale += 0.002;
                if (scale >= 1.02) growing = false;
            } else {
                scale -= 0.002;
                if (scale <= 0.98) growing = true;
            }
            giantText.style.transform = `scale(${scale})`;
        }, 50);
    }

    async showArchivesModal() {
        this.archivesModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Load archives content
        await this.loadArchivesContent();
        
        // Add entrance animation
        this.archivesModal.classList.add('active');
    }

    hideArchivesModal() {
        this.archivesModal.classList.remove('active');
        setTimeout(() => {
            this.archivesModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    async loadArchivesContent() {
        try {
            // This would normally fetch from GitHub
            // For now, we'll use placeholder content
            const archivesData = this.getPlaceholderArchives();
            
            this.archivesContent.innerHTML = `
                <pre>${archivesData}</pre>
            `;
            
        } catch (error) {
            this.archivesContent.innerHTML = `
                <div class="error">
                    Failed to load archives. Please try again later.
                </div>
            `;
        }
    }

    getPlaceholderArchives() {
        return `PEN ARCHIVES - DIRECTIVE 001

[2025-01-15] Project CreamoCrypt initialized
    - Advanced cipher suite deployed
    - 13 encryption methods implemented
    - Typewriter animation system online

[2025-01-20] DeluxeTable integration
    - Timetable system for 7B class
    - Real-time countdown features
    - Cloudflare-inspired design

[2025-01-25] Homepage architecture
    - Binary animation system
    - Modal interface for archives
    - Responsive design patterns

[SYSTEM LOGS]
- Encryption protocols: ACTIVE
- Animation systems: OPERATIONAL
- UI/UX frameworks: STABLE

[DIRECTIVES]
1. The pen writes again
2. Code with purpose
3. Animate everything
4. Secure all communications

[UPCOMING FEATURES]
- Enhanced cipher algorithms
- Mobile optimization
- Additional animation layers
- Performance improvements

END OF TRANSMISSION`;
    }
}

// Initialize the homepage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CreamoHomepage();
});

// Add some random binary code in the background occasionally
setInterval(() => {
    if (Math.random() > 0.7) {
        const home = new CreamoHomepage();
        home.createBinaryStream(
            Math.random() * window.innerWidth,
            window.innerHeight + 50,
            Math.floor(Math.random() * 5)
        );
    }
}, 3000);