// game-ui.js

function detectDevice() {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|tablet|ipad|iphone/.test(ua);
    const isTablet = /tablet|ipad|playbook|silk|kindle|(android(?!.*mobile))/.test(ua);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    gameState.deviceType = (isTablet || (isMobile && hasTouch && window.innerWidth >= 768)) ? 'tablet' : 'desktop';
    document.getElementById('deviceType').textContent = gameState.deviceType === 'tablet' ? 'TABLET MODE' : 'DESKTOP MODE';
    // Automatically proceed to loading after a short delay
    setTimeout(() => {
        document.getElementById('deviceDetection').classList.remove('active');
        document.getElementById('loading').classList.add('active');
        simulateLoading();
    }, 1500);
}

function simulateLoading() {
    let progress = 0;
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    const stages = ["INITIALIZING BRAINROT ENGINE...","LOADING BRAINROTTERS...","SETTING UP ARENA...","CALIBRATING CONTROLS...","READY TO BRAINROT!"];
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => showScreen('mainMenu'), 500);
        }
        loadingBar.style.width = `${progress}%`;
        loadingText.textContent = stages[Math.min(Math.floor(progress / 20), stages.length - 1)];
    }, 200);
}

function showScreen(screenId) {
    console.log('Showing screen:', screenId);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    else { console.error('Screen not found:', screenId); return; }
    gameState.currentScreen = screenId;
    const bossMusic = document.getElementById('bossMusic');
    const menuMusic = document.getElementById('menuMusic');
    if (screenId === 'gameScreen' && gameState.isBossFight) {
        if (menuMusic && !menuMusic.paused) menuMusic.pause();
        if (bossMusic) { bossMusic.currentTime = 0; bossMusic.volume = 0.7; bossMusic.play().catch(e=>console.log("Boss music play failed:", e)); }
    } else if (screenId !== 'gameScreen') {
        if (bossMusic && !bossMusic.paused) { bossMusic.pause(); bossMusic.currentTime = 0; }
        if (menuMusic && menuMusic.paused) { menuMusic.currentTime = 0; menuMusic.volume = 0.7; menuMusic.play().catch(e=>console.log("Menu music play failed:", e)); }
    }
    if (screenId === 'gameScreen') {
        setTimeout(() => { if (typeof initThreeJS === 'function') initThreeJS(); startGame(); }, 100);
    } else if (screenId === 'characterSelect') {
        renderCharacterSelect();
        // Add boss difficulty option if unlocked and not already present
        const diffSelect = document.getElementById('difficultySelect');
        if (gameState.bossUnlocked && !Array.from(diffSelect.options).some(opt => opt.value === 'sixtyseven')) {
            const option = document.createElement('option');
            option.value = 'sixtyseven';
            option.textContent = '67 BOSS - SURVIVAL';
            diffSelect.appendChild(option);
        }
    } else if (screenId === 'shopScreen') {
        setTimeout(() => { if (typeof loadShopItems === 'function') loadShopItems(); }, 100);
    }
    const touchControls = document.getElementById('touchControls');
    if (touchControls) touchControls.classList.toggle('active', screenId === 'gameScreen' && gameState.deviceType === 'tablet');
}

function renderCharacterSelect() {
    const grid = document.getElementById('characterGrid');
    const diffSelect = document.getElementById('difficultySelect');
    if (!grid) return;
    grid.innerHTML = '';
    CHARACTERS.forEach((char, idx) => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="character-icon" style="background: ${char.color}20; border-color: ${char.color}">${char.icon}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-style">${char.style}</div>
            <div class="character-stats">
                <div class="stat"><div class="stat-value">${char.moves.punch}</div><div class="stat-label">PUNCH</div></div>
                <div class="stat"><div class="stat-value">${char.moves.kick}</div><div class="stat-label">KICK</div></div>
                <div class="stat"><div class="stat-value">${char.hp}</div><div class="stat-label">HP</div></div>
            </div>
        `;
        card.addEventListener('click', () => {
            document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            gameState.selectedCharacter = idx;
            document.getElementById('confirmBtn').disabled = false;
            document.getElementById('previewName').textContent = char.name;
            document.getElementById('previewStyle').textContent = char.style;
            document.getElementById('previewDesc').textContent = char.description;
            document.getElementById('previewModel').textContent = char.icon;
            document.getElementById('previewModel').style.borderColor = char.color;
            const bossUnlockInfo = document.getElementById('bossUnlockInfo');
            const bossUnlockedInfo = document.getElementById('bossUnlockedInfo');
            const bossWarningInfo = document.getElementById('bossWarningInfo');
            if (bossUnlockInfo && bossUnlockedInfo && bossWarningInfo) {
                if (gameState.bossUnlocked) {
                    bossUnlockInfo.style.display = 'none';
                    bossUnlockedInfo.style.display = 'block';
                    const difficulty = diffSelect.value;
                    bossWarningInfo.style.display = (difficulty === 'sixtyseven') ? 'block' : 'none';
                } else {
                    bossUnlockInfo.style.display = 'block';
                    bossUnlockedInfo.style.display = 'none';
                    bossWarningInfo.style.display = 'none';
                }
            }
        });
        grid.appendChild(card);
    });
    diffSelect.addEventListener('change', () => {
        const difficulty = diffSelect.value;
        const bossWarningInfo = document.getElementById('bossWarningInfo');
        if (bossWarningInfo) bossWarningInfo.style.display = (difficulty === 'sixtyseven' && gameState.bossUnlocked) ? 'block' : 'none';
    });
}

function startGame() {
    console.log('Starting game... Mode:', gameState.gameMode);
    if (gameState.selectedCharacter === null) { showScreen('characterSelect'); return; }
    const playerChar = CHARACTERS[gameState.selectedCharacter];
    const difficulty = DIFFICULTY_SETTINGS[gameState.difficulty];
    let cpuChar, isBossFight = false;
    if (gameState.isBossFight) {
        cpuChar = BOSS_67;
        isBossFight = true;
        startBossCutscene();
    } else {
        let cpuIdx;
        do { cpuIdx = Math.floor(Math.random() * CHARACTERS.length); } while (cpuIdx === gameState.selectedCharacter && CHARACTERS.length > 1);
        cpuChar = CHARACTERS[cpuIdx];
    }
    const memKey = `${gameState.selectedCharacter}_${gameState.difficulty}`;
    if (!gameState.cpuMemory[memKey]) {
        gameState.cpuMemory[memKey] = { playerMoves: {punch:1,kick:1,special:1,parry:1}, comboPatterns: {}, dodgeChance:0.1, counterChance:0.1, fights:0 };
    }
    const cpuMemory = gameState.cpuMemory[memKey];
    cpuMemory.fights++;
    gameState.parryCooldownActive = false;
    gameState.parryCooldownEnd = 0;
    gameState.bossSpecialAttackCooldown = 0;
    gameState.bossStunTimer = 0;
    gameState.isBossStunned = false;
    gameState.bossSelfDamageTimer = 0;
    gameState.playerHiddenHealTimer = 0;
    gameState.playerFakeHP = 100;
    gameState.playerRealHP = 100;
    gameState.survivalPhase = 0;
    gameState.secondLifeUsed = false;
    gameState.dashCooldown = 0; // for player dash
    const parryBtns = document.querySelectorAll('[data-action="parry"]');
    parryBtns.forEach(btn => { btn.disabled = false; btn.style.opacity = '1'; btn.style.background = 'rgba(100,255,100,0.7)'; btn.textContent = 'PARRY'; });
    gameState.player = {
        character: playerChar,
        x: -5, z: 0,
        health: playerChar.hp,
        maxHealth: playerChar.hp,
        facing: 1,
        state: 'idle', stateTimer: 0,
        attackCooldown: 0,
        parryCooldown: 0,
        parryAvailable: true,
        items: gameState.playerInventory,
        dashCooldown: 0
    };
    gameState.cpu = {
        character: cpuChar,
        x: 5, z: 0,
        health: Math.floor(cpuChar.hp * difficulty.cpuHpMultiplier),
        maxHealth: Math.floor(cpuChar.hp * difficulty.cpuHpMultiplier),
        facing: -1,
        state: 'idle', stateTimer: 0,
        attackCooldown: 0,
        memory: cpuMemory,
        difficulty: difficulty,
        lastPlayerMove: null,
        isBoss: isBossFight
    };
    document.getElementById('p1Name').textContent = playerChar.name;
    document.getElementById('p2Name').textContent = isBossFight ? "67 BOSS" : cpuChar.name;
    if (isBossFight) document.getElementById('p2Name').style.color = "#1a3c8b";
    document.getElementById('roundText').textContent = isBossFight ? "SURVIVAL MODE" : `ROUND ${gameState.round || 1}`;
    document.getElementById('roundTimer').textContent = gameState.roundTime;
    updateHealthBars();
    gameState.gameActive = true;
    gameState.roundTime = 99;
    gameState.comboCount = 0;
    gameState.score = 0;
    if (!gameState.cutsceneActive) animate();
}

function updateHealthBars() {
    const p1Health = document.getElementById('p1Health');
    const p2Health = document.getElementById('p2Health');
    const p1Text = document.getElementById('p1HealthText');
    const p2Text = document.getElementById('p2HealthText');
    if (!p1Health || !p2Health) return;
    const p1Percent = gameState.player.health / gameState.player.maxHealth;
    const p2Percent = gameState.cpu.health / gameState.cpu.maxHealth;
    p1Health.style.width = `${p1Percent * 100}%`;
    p2Health.style.width = `${p2Percent * 100}%`;
    if (gameState.isBossFight) p1Text.textContent = `${Math.round(gameState.playerFakeHP)}%`;
    else p1Text.textContent = `${Math.round(p1Percent * 100)}%`;
    p2Text.textContent = `${Math.round(p2Percent * 100)}%`;
    if (gameState.isBossFight) {
        if (gameState.playerFakeHP < 20) p1Health.style.background = 'linear-gradient(90deg, #ff0000 0%, #cc0000 100%)';
        else if (gameState.playerFakeHP < 50) p1Health.style.background = 'linear-gradient(90deg, #ff9900 0%, #cc6600 100%)';
        else p1Health.style.background = 'linear-gradient(90deg, #1a3c8b 0%, #d4af37 100%)';
    } else {
        if (p1Percent < 0.3) p1Health.style.background = 'linear-gradient(90deg, #ff0000 0%, #cc0000 100%)';
        else if (p1Percent < 0.6) p1Health.style.background = 'linear-gradient(90deg, #ff9900 0%, #cc6600 100%)';
        else p1Health.style.background = 'linear-gradient(90deg, #1a3c8b 0%, #d4af37 100%)';
    }
    if (p2Percent < 0.3) p2Health.style.background = 'linear-gradient(90deg, #ff0000 0%, #cc0000 100%)';
    else if (p2Percent < 0.6) p2Health.style.background = 'linear-gradient(90deg, #ff9900 0%, #cc6600 100%)';
    else p2Health.style.background = 'linear-gradient(90deg, #1a3c8b 0%, #d4af37 100%)';
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    document.getElementById('arcadeBtn').addEventListener('click', () => showScreen('characterSelect'));
    document.getElementById('shopBtn').addEventListener('click', () => showScreen('shopScreen'));
    document.getElementById('controlsBtn').addEventListener('click', () => showScreen('controlsScreen'));
    document.getElementById('updatesBtn').addEventListener('click', () => showScreen('updatesScreen'));
    document.getElementById('creditsBtn').addEventListener('click', () => showScreen('creditsScreen'));
    document.getElementById('exitToCreamoBtn').addEventListener('click', () => exitToCreamo());
    document.getElementById('backBtn').addEventListener('click', () => showScreen('mainMenu'));
    document.getElementById('exitBattleBtn').addEventListener('click', () => showScreen('characterSelect'));
    document.getElementById('controlsBackBtn').addEventListener('click', () => showScreen('mainMenu'));
    document.getElementById('shopBackBtn').addEventListener('click', () => showScreen('mainMenu'));
    document.getElementById('updatesBackBtn').addEventListener('click', () => showScreen('mainMenu'));
    document.getElementById('creditsBackBtn').addEventListener('click', () => showScreen('mainMenu'));
    document.getElementById('confirmBtn').addEventListener('click', () => startBattle('arcade'));
    document.addEventListener('keydown', (e) => {
        if (gameState.cutsceneActive) return;
        const key = e.key.toLowerCase();
        gameState.keys[key] = true;
        // Handle dash key (L) only in boss fight
        if (key === 'l' && gameState.gameActive && gameState.isBossFight && gameState.player.dashCooldown <= 0) {
            doPlayerAttack('dash');
            e.preventDefault();
        }
        if (['arrowleft','arrowright','z','x','a','s',' ','c'].includes(key)) {
            const keyMap = { 'arrowleft':'left','arrowright':'right','z':'punch','x':'punch','a':'kick','s':'kick',' ':'parry','c':'special' };
            const now = Date.now();
            if (now - gameState.lastKeyTime > 1000) gameState.combo = [];
            if (keyMap[key]) { gameState.combo.push(keyMap[key]); gameState.lastKeyTime = now; checkCombos(); }
        }
        if (gameState.gameActive && gameState.player.attackCooldown <= 0) {
            if (key === 'z' || key === 'x') doPlayerAttack('punch');
            else if (key === 'a' || key === 's') doPlayerAttack('kick');
            else if (key === ' ') doPlayerAttack('parry');
            else if (key === 'c') doPlayerAttack('special');
        }
    });
    document.addEventListener('keyup', (e) => { gameState.keys[e.key.toLowerCase()] = false; });
    window.addEventListener('resize', () => {
        if (window.camera && window.renderer) {
            const canvas = document.getElementById('gameCanvas');
            window.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            window.camera.updateProjectionMatrix();
            window.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        }
    });
}

function startBattle(mode = 'arcade') {
    if (gameState.selectedCharacter === null) { alert('Please select a character first!'); return; }
    gameState.gameMode = mode;
    gameState.difficulty = document.getElementById('difficultySelect').value;
    gameState.isBossFight = (gameState.difficulty === 'sixtyseven' && CHARACTERS[gameState.selectedCharacter].id === 67);
    if (gameState.isBossFight) console.log('STARTING 67 BOSS SURVIVAL MODE!');
    showScreen('gameScreen');
}

function showBossDefeatedDialogue() {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:1000; color:#d4af37; font-size:2rem; text-align:center; padding:2rem;`;
    div.innerHTML = `<div style="margin-bottom:2rem; font-size:3rem; color:#1a3c8b; text-shadow:0 0 20px #1a3c8b;">67 BOSS DEFEATED!</div><div style="margin-bottom:3rem; font-size:1.5rem;">"What just happened...?"<br>The true power of 67 has been unleashed...<br>But at what cost?</div><div style="margin-bottom:2rem; font-size:1.2rem; color:#2ecc71;">Reward: 500 COINS + 50 Bonus!</div><button id="continueBtn" style="font-size:1.5rem; padding:1rem 2rem; background:#1a3c8b; color:#fff; border:2px solid #d4af37; cursor:pointer; border-radius:10px;">CONTINUE</button>`;
    document.body.appendChild(div);
    document.getElementById('continueBtn').addEventListener('click', () => { div.remove(); showScreen('characterSelect'); });
}

function exitToCreamo() { window.location.href = 'index.html'; }

// Initialization
function init() {
    console.log('Brainrot Fighters initializing...');
    detectDevice();
    setupEventListeners();
}
