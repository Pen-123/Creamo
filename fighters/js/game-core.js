// fighters/js/game-core.js

window.gameState = {
    currentScreen: 'deviceDetection',
    selectedCharacter: null,
    player: null,
    cpu: null,
    keys: {},
    combo: [],
    lastKeyTime: 0,
    gameActive: false,
    roundTime: 99,
    comboCount: 0,
    score: 0,
    coins: parseInt(localStorage.getItem('brainrotCoins')) || 1000,
    highScore: localStorage.getItem('brainrotHighScore') || 0,
    deviceType: 'desktop',
    gameMode: 'arcade',
    difficulty: 'medium',
    cpuMemory: JSON.parse(localStorage.getItem('cpuMemory')) || {},
    playerInventory: JSON.parse(localStorage.getItem('playerInventory')) || {},
    practiceStats: { comboCount: 0, damageDealt: 0, startTime: 0 },
    parryCooldownActive: false,
    parryCooldownEnd: 0,
    bossUnlocked: localStorage.getItem('boss67Unlocked') === 'true',
    bossDefeated: localStorage.getItem('boss67Defeated') === 'true',
    boss21Unlocked: localStorage.getItem('boss21Unlocked') === 'true',
    boss21Defeated: localStorage.getItem('boss21Defeated') === 'true',
    isBossFight: false,
    is21BossFight: false,
    turnBased: false,
    bossSpecialAttackCooldown: 0,
    bossStunTimer: 0,
    dashCooldown: 0,
    isBossStunned: false,
    bossSelfDamageTimer: 0,
    playerHiddenHealTimer: 0,
    playerFakeHP: 100,
    playerRealHP: 100,
    survivalPhase: 0,
    cutsceneActive: false,
    cutsceneTimer: 0,
    currentCutsceneText: "",
    cutsceneTextIndex: 0,
    adminMode: false,
    infiniteParry: false,
    infiniteHP: false,
    secondLifeUsed: false,
    bossDamageMultiplier: 1.0,
    bossStunPhase: 0,
    globalMessage: "",
    customBackground: localStorage.getItem('customBackground') || 'default',
    customBackgroundUrl: localStorage.getItem('customBackgroundUrl') || '',
    dodgeWindow: false,
    dodgeWarningActive: false,
    dodgeSuccessful: false
};

function initAdminPanel() {
    console.log('Initializing admin panel...');
    let adminCode = '';
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.altKey) return;
        adminCode += e.key;
        if (adminCode.length > 6) adminCode = adminCode.slice(1);
        if (adminCode === '231214') { toggleAdminPanel(); adminCode = ''; }
    });
}

function toggleAdminPanel() {
    const existingPanel = document.getElementById('adminPanel');
    if (existingPanel) { existingPanel.remove(); gameState.adminMode = false; return; }
    const adminPanel = document.createElement('div');
    adminPanel.id = 'adminPanel';
    adminPanel.style.cssText = `position:fixed; top:10px; right:10px; background:rgba(0,0,0,0.9); border:2px solid #1a3c8b; padding:15px; z-index:10000; color:#fff; border-radius:10px; min-width:300px;`;
    adminPanel.innerHTML = `
        <div style="margin-bottom:10px; color:#1a3c8b; font-weight:bold; text-align:center;">ADMIN PANEL</div>
        <div style="margin-bottom:10px;"><label><input type="checkbox" id="infiniteParryCheckbox" ${gameState.infiniteParry ? 'checked' : ''}> Infinite Parry</label></div>
        <div style="margin-bottom:10px;"><label><input type="checkbox" id="infiniteHPCheckbox" ${gameState.infiniteHP ? 'checked' : ''}> Infinite HP</label></div>
        <div style="margin-bottom:10px;"><input type="text" id="globalMessageInput" placeholder="Global Message" style="width:100%; padding:5px; background:#222; color:#fff; border:1px solid #1a3c8b;"></div>
        <div style="margin-bottom:10px;"><input type="text" id="customBgInput" placeholder="Custom Background URL" value="${gameState.customBackgroundUrl}" style="width:100%; padding:5px; background:#222; color:#fff; border:1px solid #1a3c8b;"></div>
        <button id="sendGlobalMessage" style="width:100%; padding:8px; background:#1a3c8b; color:#fff; border:none; border-radius:5px; cursor:pointer;">SEND GLOBAL MESSAGE</button>
        <button id="setCustomBg" style="width:100%; padding:8px; background:#1a3c8b; color:#fff; border:none; border-radius:5px; cursor:pointer; margin-top:5px;">SET CUSTOM BG</button>
        <button id="closeAdminPanel" style="width:100%; padding:8px; background:#333; color:#fff; border:none; border-radius:5px; cursor:pointer; margin-top:5px;">CLOSE</button>
    `;
    document.body.appendChild(adminPanel);
    gameState.adminMode = true;
    document.getElementById('infiniteParryCheckbox').addEventListener('change', (e) => {
        gameState.infiniteParry = e.target.checked;
        if (gameState.infiniteParry) {
            const parryBtns = document.querySelectorAll('[data-action="parry"]');
            parryBtns.forEach(btn => { btn.disabled = false; btn.style.opacity = '1'; btn.style.background = 'rgba(100,255,100,0.7)'; btn.textContent = 'PARRY'; });
        }
    });
    document.getElementById('infiniteHPCheckbox').addEventListener('change', (e) => {
        gameState.infiniteHP = e.target.checked;
        if (gameState.infiniteHP && gameState.player) {
            gameState.player.health = gameState.player.maxHealth;
            gameState.playerRealHP = 100; gameState.playerFakeHP = 100;
            updateHealthBars();
        }
    });
    document.getElementById('sendGlobalMessage').addEventListener('click', () => {
        const msg = document.getElementById('globalMessageInput').value;
        if (msg.trim()) showGlobalMessage(msg);
    });
    document.getElementById('setCustomBg').addEventListener('click', () => {
        const url = document.getElementById('customBgInput').value;
        if (url.trim()) setCustomBackground(url);
    });
    document.getElementById('closeAdminPanel').addEventListener('click', () => { adminPanel.remove(); gameState.adminMode = false; });
}

function setCustomBackground(url) {
    gameState.customBackgroundUrl = url;
    gameState.customBackground = 'custom';
    localStorage.setItem('customBackgroundUrl', url);
    localStorage.setItem('customBackground', 'custom');
    applyCustomBackground();
    showGlobalMessage('Custom background set!');
}

function showGlobalMessage(message) {
    gameState.globalMessage = message;
    const msgDiv = document.createElement('div');
    msgDiv.id = 'globalMessage';
    msgDiv.style.cssText = `position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.9); color:#d4af37; padding:20px 40px; border:3px solid #1a3c8b; border-radius:10px; font-size:2rem; font-weight:bold; text-align:center; z-index:10001; text-shadow:0 0 10px #1a3c8b; animation:pulseGlow 2s infinite;`;
    msgDiv.textContent = message;
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 5000);
}

function applyCustomBackground() {
    const body = document.body;
    body.classList.remove('bg-space','bg-neon','bg-matrix','bg-fire','bg-ice','bg-custom');
    body.style.backgroundImage = '';
    if (gameState.customBackground === 'custom' && gameState.customBackgroundUrl) {
        body.classList.add('bg-custom');
        body.style.backgroundImage = `url('${gameState.customBackgroundUrl}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundRepeat = 'no-repeat';
    } else if (gameState.customBackground !== 'default') {
        body.classList.add(`bg-${gameState.customBackground}`);
    }
}

let fightAnimRequest = null;
function animate() {
    if (!gameState.gameActive) return;
    requestAnimationFrame(animate);
    const delta = window.clock ? window.clock.getDelta() : 0.016;
    try {
        updateGame();
        renderGame();
        if (window.mixerPlayer) window.mixerPlayer.update(delta);
        if (window.mixerCpu) window.mixerCpu.update(delta);
    } catch (error) { console.error('Game loop error:', error); }
}

function updateGame() {
    if (!gameState.player || !gameState.cpu) return;
    if (gameState.cutsceneActive) return;
    if (gameState.player.attackCooldown > 0) gameState.player.attackCooldown--;
    if (gameState.cpu.attackCooldown > 0) gameState.cpu.attackCooldown--;
    if (gameState.player.dashCooldown > 0) gameState.player.dashCooldown--;
    if (gameState.player.parryCooldown > 0) gameState.player.parryCooldown--;
    if (gameState.bossSpecialAttackCooldown > 0) gameState.bossSpecialAttackCooldown--;
    if (gameState.isBossFight) updateBossSurvival();
    if (gameState.player.parryCooldown <= 0) {
        if (gameState.keys["arrowleft"]) {
            gameState.player.x = Math.max(-8, gameState.player.x - 0.1);
            gameState.player.facing = -1;
            if (window.playerModel) { window.playerModel.position.x = gameState.player.x; window.playerModel.rotation.y = Math.PI; }
        }
        if (gameState.keys["arrowright"]) {
            gameState.player.x = Math.min(8, gameState.player.x + 0.1);
            gameState.player.facing = 1;
            if (window.playerModel) { window.playerModel.position.x = gameState.player.x; window.playerModel.rotation.y = 0; }
        }
    }
    updateCPUAI();
    if (gameState.roundTime > 0 && Math.random() < 0.01) {
        gameState.roundTime--;
        const timerElem = document.getElementById('roundTimer');
        if (timerElem) timerElem.textContent = gameState.roundTime;
    }
    if (gameState.player.health <= 0 || gameState.cpu.health <= 0 || gameState.roundTime <= 0) endRound();
}

function renderGame() {
    if (window.renderer && window.scene && window.camera) window.renderer.render(window.scene, window.camera);
}

function endRound() {
    gameState.gameActive = false;
    const bossMusic = document.getElementById('bossMusic');
    const menuMusic = document.getElementById('menuMusic');
    if (bossMusic && !bossMusic.paused) { bossMusic.pause(); bossMusic.currentTime = 0; }
    if (menuMusic && menuMusic.paused) { menuMusic.currentTime = 0; menuMusic.volume = 0.7; menuMusic.play().catch(e=>console.log("Menu music play failed:", e)); }
    let message = "TIME OVER!";
    let isBossDefeated = false;
    if (gameState.player.health <= 0) message = "CPU WINS!";
    else if (gameState.cpu.health <= 0) {
        message = "PLAYER WINS!";
        gameState.score += 1000;
        gameState.coins += 50;
        if (gameState.difficulty === 'insane' && CHARACTERS[gameState.selectedCharacter].id === 67) {
            localStorage.setItem('insaneCompletedWith67', 'true');
            checkBossUnlock();
        }
        if (gameState.difficulty === 'hard' && CHARACTERS[gameState.selectedCharacter].id === 21) {
            localStorage.setItem('hardCompletedWith21', 'true');
            checkBossUnlock();
        }
        if (gameState.isBossFight) {
            isBossDefeated = true;
            gameState.bossDefeated = true;
            localStorage.setItem('boss67Defeated', 'true');
            message = "67 BOSS DEFEATED!";
            gameState.coins += 500;
        }
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('brainrotHighScore', gameState.highScore);
            const hsElem = document.getElementById('highScore');
            if (hsElem) hsElem.textContent = gameState.highScore;
        }
        localStorage.setItem('brainrotCoins', gameState.coins);
        const coinsElem = document.getElementById('coinsAmount');
        if (coinsElem) coinsElem.textContent = gameState.coins;
        spawn67();
    }
    localStorage.setItem('cpuMemory', JSON.stringify(gameState.cpuMemory));
    setTimeout(() => {
        if (isBossDefeated) showBossDefeatedDialogue();
        else if (gameState.gameMode === 'practice') showScreen('practiceScreen');
        else {
            alert(`${message}\nScore: ${gameState.score}\nCoins Earned: ${isBossDefeated ? 550 : 50}`);
            showScreen('characterSelect');
        }
    }, 1000);
}

function spawn67() {
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'secret-67';
            el.textContent = '67';
            el.style.left = `${Math.random() * 80 + 10}%`;
            el.style.top = `${Math.random() * 80 + 10}%`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 2000);
        }, i * 100);
    }
}

function checkBossUnlock() {
    if (localStorage.getItem('insaneCompletedWith67') === 'true' && !gameState.bossUnlocked) {
        gameState.bossUnlocked = true;
        localStorage.setItem('boss67Unlocked', 'true');
    }
    if (localStorage.getItem('hardCompletedWith21') === 'true' && !gameState.boss21Unlocked) {
        gameState.boss21Unlocked = true;
        localStorage.setItem('boss21Unlocked', 'true');
    }
}

function exitToCreamo() { window.location.href = 'index.html'; }
