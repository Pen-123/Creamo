class TouchControls {
    constructor() {
        this.movementBtns = document.querySelectorAll('.movement-btn');
        this.actionBtns = document.querySelectorAll('.touch-btn');
        this.active = { left: false, right: false };
        this.init();
    }
    init() {
        this.setupMovement();
        this.setupActions();
    }
    setupMovement() {
        this.movementBtns.forEach(btn => {
            const dir = btn.dataset.direction;
            const start = (e) => { e.preventDefault(); this.handleMovement(dir, true); btn.classList.add('active'); };
            const end = (e) => { e.preventDefault(); this.handleMovement(dir, false); btn.classList.remove('active'); };
            btn.addEventListener('touchstart', start);
            btn.addEventListener('touchend', end);
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        });
    }
    handleMovement(dir, pressed) {
        this.active[dir] = pressed;
        gameState.keys['arrowleft'] = this.active.left;
        gameState.keys['arrowright'] = this.active.right;
    }
    setupActions() {
        this.actionBtns.forEach(btn => {
            const action = btn.dataset.action;
            const start = (e) => { e.preventDefault(); if (btn.disabled) return; this.handleAction(action, true); btn.classList.add('active'); };
            const end = (e) => { e.preventDefault(); if (btn.disabled) return; this.handleAction(action, false); btn.classList.remove('active'); };
            btn.addEventListener('touchstart', start);
            btn.addEventListener('touchend', end);
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        });
    }
    handleAction(action, pressed) {
        const map = { punch: ['z','x'], kick: ['a','s'], special: ['c'], parry: [' '] };
        if (map[action]) {
            map[action].forEach(key => {
                gameState.keys[key] = pressed;
                if (pressed && gameState.gameActive && gameState.player.attackCooldown <= 0) {
                    if (action === 'punch') doPlayerAttack('punch');
                    else if (action === 'kick') doPlayerAttack('kick');
                    else if (action === 'special') doPlayerAttack('special');
                    else if (action === 'parry') doPlayerAttack('parry');
                }
            });
        }
    }
}
let touchControls = null;
function initTouchControls() {
    if (gameState.deviceType === 'tablet') touchControls = new TouchControls();
}
const originalShowScreen = window.showScreen;
window.showScreen = function(screenId) {
    originalShowScreen(screenId);
    if (screenId === 'gameScreen' && gameState.deviceType === 'tablet') {
        setTimeout(() => { if (!touchControls) initTouchControls(); }, 100);
    }
};
