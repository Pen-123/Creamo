// Homepage JavaScript with fixed button functionality
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
        this.createBackgroundBinary();
    }

    setupButtonAnimations() {
        const buttons = document.querySelectorAll('.home-btn');
        
        buttons.forEach(btn => {
            // Add ripple effect
            btn.addEventListener('click', (e) => {
                this.createRipple(e, btn);
                this.triggerBinaryAnimation(e);
            });

            // Add keyboard accessibility
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }

    setupEventListeners() {
        // CreamoCrypt button - navigate to cipher suite
        document.getElementById('creamocryptBtn').addEventListener('click', (e) => {
            console.log('CreamoCrypt clicked');
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.location.href = 'cipher-suite.html'; // Updated path
            }, 800);
        });

        // Pen Archives button - show modal
        document.getElementById('archivesBtn').addEventListener('click', (e) => {
            console.log('Archives clicked');
            this.triggerBinaryAnimation(e);
            this.showArchivesModal();
        });

        // Deluxtable button - navigate to external site
        document.getElementById('deluxtableBtn').addEventListener('click', (e) => {
            console.log('Deluxtable clicked');
            this.triggerBinaryAnimation(e);
            setTimeout(() => {
                window.open('https://deluxtable.pages.dev', '_blank');
            }, 800);
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
            if (e.key === 'Escape' && this.archivesModal.style.display === 'block') {
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
            background: rgba(58, 95, 200, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1;
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

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    triggerBinaryAnimation(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const startX = rect.left + (rect.width / 2);
        const startY = rect.bottom;
        
        // Create multiple binary streams
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                this.createBinaryStream(startX, startY, i);
            }, i * 80);
        }
    }

    createBinaryStream(startX, startY, index) {
        const binaryElement = document.createElement('div');
        binaryElement.className = 'binary-code';
        
        // Generate random binary string with more 1s and 0s
        let binaryString = '';
        const length = 15 + Math.floor(Math.random() * 10);
        for (let i = 0; i < length; i++) {
            binaryString += Math.random() > 0.5 ? '1' : '0';
        }
        
        binaryElement.textContent = binaryString;
        
        // Randomize animation properties
        const duration = 1.5 + Math.random() * 1;
        const delay = index * 0.08;
        const rotation = -20 + Math.random() * 40;
        const endX = (Math.random() * 200) - 100;
        
        binaryElement.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            transform: rotate(${rotation}deg);
            color: ${this.getRandomBlueColor()};
            font-size: ${12 + Math.random() * 8}px;
            opacity: ${0.7 + Math.random() * 0.3};
        `;
        
        this.binaryContainer.appendChild(binaryElement);
        
        // Remove element after animation completes
        setTimeout(() => {
            if (binaryElement.parentNode) {
                binaryElement.parentNode.removeChild(binaryElement);
            }
        }, (duration + delay) * 1000);
    }

    getRandomBlueColor() {
        const colors = [
            '#1a3c8b', '#2d4b8f', '#3a5fc8', '#4a6fc9', '#5b7fd0'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createBackgroundBinary() {
        // Create occasional background binary effects
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.createBinaryStream(
                    Math.random() * window.innerWidth,
                    window.innerHeight + 50,
                    Math.floor(Math.random() * 3)
                );
            }
        }, 2000);
    }

    animateGiantText() {
        const giantText = document.getElementById('giantCreamo');
        let scale = 1;
        let growing = true;
        
        setInterval(() => {
            if (growing) {
                scale += 0.001;
                if (scale >= 1.015) growing = false;
            } else {
                scale -= 0.001;
                if (scale <= 0.985) growing = true;
            }
            giantText.style.transform = `scale(${scale})`;
        }, 50);
    }

    async showArchivesModal() {
        this.archivesModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Load archives content
        await this.loadArchivesContent();
    }

    hideArchivesModal() {
        this.archivesModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    async loadArchivesContent() {
        try {
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const archivesData = this.getPlaceholderArchives();
            
            this.archivesContent.innerHTML = `
                <pre>${archivesData}</pre>
            `;
            
        } catch (error) {
            this.archivesContent.innerHTML = `
                <div class="error">
                    [ERROR] Failed to load archives. Connection timeout.
                    Please try again later.
                </div>
            `;
        }
    }

    getPlaceholderArchives() {
        return `// PEN ARCHIVES - DIRECTIVE 001
// Last Updated: 2025-01-25 14:32:17 UTC

[SYSTEM BOOT]
> Initializing Creamo Protocol...
> Loading cipher modules...
> Establishing secure connection...

[PROJECT LOGS]
[2025-01-15] CREAMOCRYPTH v1.0 DEPLOYED
    - Advanced cipher suite: 13 encryption methods
    - AES-256 with PBKDF2 key derivation
    - Real-time typewriter output
    - Secure encryption protocols

[2025-01-20] DELUXTABLE INTEGRATION
    - 7B class timetable system
    - Live countdown timers
    - Cloudflare-inspired UI
    - Mobile-responsive design

[2025-01-25] HOMEPAGE ARCHITECTURE
    - Binary animation engine
    - Modal interface system
    - Dark blue color scheme
    - Code-like typography

[ACTIVE MODULES]
✓ Encryption Engine
✓ Animation System  
✓ UI Framework
✓ Security Protocols

[DIRECTIVES]
1. The pen writes again
2. Code with purpose
3. Encrypt everything
4. Animate the interface

[TECHNICAL SPECS]
- Frontend: HTML5, CSS3, ES6+
- Encryption: CryptoJS Integration
- Animations: CSS3 + JavaScript
- Typography: Monospace Stack

[STATUS: OPERATIONAL]
All systems nominal. Ready for encryption tasks.

// END OF TRANSMISSION`;
    }
}

// Initialize the homepage when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Creamo Homepage Initialized');
    new CreamoHomepage();
});

// Add console-style welcome message
console.log(`
%cCREAMO SYSTEMS - ONLINE
%cDirective 001: The Pen Writes Again
%cAll systems operational. Ready for encryption tasks.
`, 
'color: #3a5fc8; font-size: 18px; font-weight: bold;',
'color: #8a9bb8; font-size: 14px;',
'color: #8a9bb8; font-size: 12px;'
);