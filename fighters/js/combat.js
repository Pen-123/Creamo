function doPlayerAttack(type) {
    if (!gameState.gameActive || gameState.player.attackCooldown > 0) return;
    if (type === 'parry') {
        if (!gameState.infiniteParry && gameState.parryCooldownActive) {
            const display = document.getElementById('comboDisplay');
            if (display) {
                const timeLeft = Math.ceil((gameState.parryCooldownEnd - Date.now()) / 1000);
                display.textContent = `PARRY COOLDOWN: ${timeLeft}s`;
                display.classList.add('active');
                setTimeout(() => display.classList.remove('active'), 1000);
            }
            return;
        }
        const heal = gameState.player.maxHealth * 0.10;
        const damage = gameState.cpu.maxHealth * 0.20;
        if (!gameState.isBossFight) gameState.cpu.health = Math.max(0, gameState.cpu.health - damage);
        gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + heal);
        if (!gameState.infiniteParry) {
            gameState.player.parryCooldown = 90;
            gameState.parryCooldownActive = true;
            gameState.parryCooldownEnd = Date.now() + 10000;
            const parryBtns = document.querySelectorAll('[data-action="parry"]');
            parryBtns.forEach(btn => { btn.disabled = true; btn.style.opacity = '0.5'; btn.style.background = 'rgba(100,100,100,0.7)'; btn.textContent = 'COOLDOWN'; });
            const interval = setInterval(() => {
                const left = Math.ceil((gameState.parryCooldownEnd - Date.now()) / 1000);
                if (left <= 0) {
                    clearInterval(interval);
                    gameState.parryCooldownActive = false;
                    parryBtns.forEach(btn => { btn.disabled = false; btn.style.opacity = '1'; btn.style.background = 'rgba(100,255,100,0.7)'; btn.textContent = 'PARRY'; });
                    const disp = document.getElementById('comboDisplay');
                    if (disp) { disp.textContent = "PARRY READY!"; disp.classList.add('active'); setTimeout(() => disp.classList.remove('active'), 1000); }
                } else { parryBtns.forEach(btn => btn.textContent = left + 's'); }
            }, 1000);
        }
        createParryEffect(gameState.player.x, 1, 0);
        applyDamageFlash('player', 0x00ff00);
        if (!gameState.isBossFight) applyDamageFlash('cpu');
        updateHealthBars();
        const display = document.getElementById('comboDisplay');
        if (display) { display.textContent = "PERFECT PARRY! +10% HP"; display.classList.add('active'); setTimeout(() => display.classList.remove('active'), 1500); }
        return;
    }
    const distance = Math.abs(gameState.player.x - gameState.cpu.x);
    if (distance > 3) return;
    gameState.player.attackCooldown = 20;
    if (gameState.cpu && gameState.cpu.memory) {
        gameState.cpu.lastPlayerMove = type;
        if (!gameState.cpu.memory.playerMoves[type]) gameState.cpu.memory.playerMoves[type] = 0;
        gameState.cpu.memory.playerMoves[type]++;
    }
    let parryChance = gameState.cpu.difficulty.parryChance;
    if (gameState.cpu.isBoss) parryChance = 0.0;
    if (Math.random() < parryChance) {
        createParryEffect(gameState.cpu.x, 1, 0);
        applyDamageFlash('cpu', 0x00ff00);
        if (Math.random() < 0.3 || gameState.difficulty === 'insane') setTimeout(() => doCpuAttack('special'), 300);
        return;
    }
    if (window.playerModel) { window.playerModel.position.z = -0.5; setTimeout(() => { if (window.playerModel) window.playerModel.position.z = 0; }, 100); }
    let damage = 0, multiplier = 1;
    if (gameState.player.items && gameState.player.items.damageBoost) multiplier += 0.2;
    if (type === 'punch') damage = (gameState.player.character.moves.punch + Math.floor(Math.random() * 10)) * multiplier;
    else if (type === 'kick') damage = (gameState.player.character.moves.kick + Math.floor(Math.random() * 10)) * multiplier;
    else if (type === 'special') damage = (gameState.player.character.moves.special + Math.floor(Math.random() * 15)) * multiplier;
    if (gameState.isBossFight) {
        createBloodEffect(gameState.cpu.x, 1, 0);
        applyDamageFlash('cpu');
        if (window.cpuModel) { const knock = 0.3; window.cpuModel.position.x += knock; setTimeout(() => window.cpuModel.position.x -= knock * 0.5, 100); }
        return;
    }
    gameState.cpu.health = Math.max(0, gameState.cpu.health - damage);
    updateHealthBars();
    if (gameState.gameMode === 'practice') { gameState.practiceStats.damageDealt += damage; updatePracticeStats(); }
    createBloodEffect(gameState.cpu.x, 1, 0);
    applyDamageFlash('cpu');
    if (window.cpuModel) { const knock = 0.3; window.cpuModel.position.x += knock; setTimeout(() => window.cpuModel.position.x -= knock * 0.5, 100); }
    gameState.score += damage;
}
function doCpuAttack(type) {
    gameState.cpu.state = 'attack';
    gameState.cpu.stateTimer = 20;
    if (window.cpuModel) { window.cpuModel.position.z = -0.5; setTimeout(() => { if (window.cpuModel) window.cpuModel.position.z = 0; }, 100); }
    let damage = 0;
    const diff = gameState.cpu.difficulty;
    if (type === 'punch') damage = (gameState.cpu.character.moves.punch + Math.floor(Math.random() * 8)) * diff.aggression;
    else if (type === 'kick') damage = (gameState.cpu.character.moves.kick + Math.floor(Math.random() * 8)) * diff.aggression;
    else if (type === 'special') damage = (gameState.cpu.character.moves.special + Math.floor(Math.random() * 12)) * diff.aggression;
    applyPlayerDamage(damage);
    applyDamageFlash('player');
    createBloodEffect(gameState.player.x, 1, 0);
    if (window.playerModel) { const knock = 0.3; window.playerModel.position.x -= knock; setTimeout(() => window.playerModel.position.x += knock * 0.5, 100); }
}
function applyPlayerDamage(damage) {
    if (gameState.infiniteHP) return;
    if (gameState.isBossFight) {
        if (checkSecondLife()) return;
        const realHPdamage = (damage / gameState.player.maxHealth * 100) * gameState.bossDamageMultiplier;
        gameState.playerRealHP = Math.max(0, gameState.playerRealHP - realHPdamage);
        const adrenaline = 1 - (gameState.playerRealHP / 100);
        const fakeHPdamage = realHPdamage * (1 - adrenaline * 0.7);
        gameState.playerFakeHP = Math.max(1, gameState.playerFakeHP - fakeHPdamage);
        gameState.player.health = gameState.player.maxHealth * (gameState.playerFakeHP / 100);
    } else {
        gameState.player.health = Math.max(0, gameState.player.health - damage);
    }
    updateHealthBars();
}
function checkCombos() {
    if (!gameState.player) return;
    const char = gameState.player.character;
    if (gameState.cpu && gameState.cpu.memory && gameState.combo.length > 2) {
        const key = gameState.combo.slice(-3).join('-');
        if (!gameState.cpu.memory.comboPatterns[key]) gameState.cpu.memory.comboPatterns[key] = 0;
        gameState.cpu.memory.comboPatterns[key]++;
    }
    if (gameState.combo.length >= 3 && Math.random() > 0.7) { executeRandomCombo(); gameState.combo = []; return; }
    for (const combo of char.combos) {
        if (gameState.combo.length < combo.input.length) continue;
        const recent = gameState.combo.slice(-combo.input.length);
        if (JSON.stringify(recent) === JSON.stringify(combo.input)) { executeCombo(combo); gameState.combo = []; break; }
    }
}
function executeRandomCombo() {
    const rand = [{name:"RANDOM BRAINROT",damage:80+Math.floor(Math.random()*50)},{name:"SPAM ATTACK",damage:60+Math.floor(Math.random()*40)},{name:"CHAOS STRIKE",damage:100+Math.floor(Math.random()*30)},{name:"MEME COMBO",damage:70+Math.floor(Math.random()*60)}];
    const combo = rand[Math.floor(Math.random()*rand.length)];
    executeCombo(combo);
}
function executeCombo(combo) {
    gameState.comboCount++;
    const display = document.getElementById('comboDisplay');
    if (display) { display.textContent = `${combo.name} x${gameState.comboCount}`; display.classList.add('active'); }
    let parryChance = gameState.cpu.difficulty.parryChance;
    if (gameState.cpu.isBoss) parryChance = 0.0;
    if (Math.random() < parryChance) {
        createParryEffect(gameState.cpu.x, 1, 0);
        applyDamageFlash('cpu', 0x00ff00);
        if (display) display.textContent = `${combo.name} PARRY!`;
    } else {
        if (!gameState.isBossFight) gameState.cpu.health = Math.max(0, gameState.cpu.health - combo.damage);
        updateHealthBars();
        if (gameState.gameMode === 'practice') { gameState.practiceStats.comboCount++; if (!gameState.isBossFight) gameState.practiceStats.damageDealt += combo.damage; updatePracticeStats(); }
        if (!gameState.isBossFight) gameState.score += combo.damage * gameState.comboCount;
        if (window.playerModel) { window.playerModel.position.z = -0.8; setTimeout(() => { if (window.playerModel) window.playerModel.position.z = 0; }, 150); }
        createBloodEffect(gameState.cpu.x, 1, 0);
        applyDamageFlash('cpu');
        if (combo.damage > 100) {
            const canvas = document.getElementById('gameCanvas');
            if (canvas) { const orig = canvas.style.transform || ''; canvas.style.transform = 'translateX(-5px)'; setTimeout(() => { canvas.style.transform = 'translateX(5px)'; setTimeout(() => canvas.style.transform = orig, 50); }, 50); }
        }
        if (combo.damage > 100 && Math.random() > 0.7) spawn67();
    }
    if (gameState.cpu.memory) gameState.cpu.memory.dodgeChance = Math.min(0.6, gameState.cpu.memory.dodgeChance + 0.02);
    setTimeout(() => { if (display) display.classList.remove('active'); }, 1000);
    // Dash function
function doPlayerDash() {
    if (!gameState.gameActive || gameState.player.dashCooldown > 0) return;
    
    // Determine dash direction (use arrow keys if pressed, otherwise face direction)
    let dir = 0;
    if (gameState.keys["arrowleft"]) dir = -1;
    else if (gameState.keys["arrowright"]) dir = 1;
    else dir = gameState.player.facing;
    
    if (dir === 0) dir = 1; // default dash forward
    
    const dashDistance = 3.5;
    let newX = gameState.player.x + (dir * dashDistance);
    newX = Math.min(8, Math.max(-8, newX)); // clamp to arena bounds
    gameState.player.x = newX;
    
    // Visual effect: create a dash trail
    createDashEffect(gameState.player.x - (dir * dashDistance), gameState.player.x);
    
    // Update 3D model position if exists
    if (window.playerModel) {
        window.playerModel.position.x = gameState.player.x;
        window.playerModel.rotation.y = dir === 1 ? 0 : Math.PI;
    }
    
    gameState.player.dashCooldown = 30; // frames cooldown (approx 0.5s at 60fps)
    
    // Show combo display message
    const disp = document.getElementById('comboDisplay');
    if (disp) {
        disp.textContent = "⚡ SPEED DASH!";
        disp.classList.add('active');
        setTimeout(() => disp.classList.remove('active'), 500);
    }
}
}
