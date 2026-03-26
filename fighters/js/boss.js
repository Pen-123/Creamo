const BOSS_CUTSCENE_TEXTS = [
    "THE LEGEND OF 67...", "A FORCE BEYOND COMPREHENSION...", "IT CORRUPTS EVERYTHING IT TOUCHES...",
    "YOU CANNOT DEFEAT IT...", "YOU CAN ONLY SURVIVE...", "BUT EVEN IN DARKNESS...", "THERE IS HOPE...",
    "A SECOND CHANCE AWAITS...", "WHEN ALL SEEMS LOST...", "THE LEGEND WILL PROTECT YOU...",
    "THE LEGEND OF THE BLOODROT...", "FIGHT!"
];

let lastStunTime = 0;   // <-- ADD THIS LINE

function startBossCutscene() {
    gameState.cutsceneActive = true;
    gameState.cutsceneStartTime = null;
    gameState.secondLifeUsed = false;
    gameState.bossDamageMultiplier = 0.2;
    gameState.bossStunPhase = 0;
    gameState.bossStunTimer = 0;
    document.getElementById('gameCanvas').style.opacity = '0.3';
    document.querySelector('.hud').style.opacity = '0.3';
    const touch = document.getElementById('touchControls');
    if (touch) touch.style.opacity = '0.3';
    let overlay = document.getElementById('cutsceneOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'cutsceneOverlay';
        overlay.style.cssText = `position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:50; color:#d4af37; font-size:3rem; text-align:center; padding:2rem;`;
        const textDiv = document.createElement('div');
        textDiv.id = 'cutsceneText';
        textDiv.style.cssText = `font-size:3rem; text-shadow:0 0 10px #1a3c8b; letter-spacing:3px; line-height:1.5; max-width:80%;`;
        overlay.appendChild(textDiv);
        document.getElementById('gameScreen').appendChild(overlay);
    }
    overlay.style.display = 'flex';
    animateCutscene();
}

function animateCutscene() {
    if (!gameState.cutsceneActive) return;
    const textElem = document.getElementById('cutsceneText');
    const totalDuration = 19000;
    const textDuration = totalDuration / BOSS_CUTSCENE_TEXTS.length;
    const now = Date.now();
    if (!gameState.cutsceneStartTime) gameState.cutsceneStartTime = now;
    const elapsed = now - gameState.cutsceneStartTime;
    const idx = Math.floor(elapsed / textDuration);
    if (idx < BOSS_CUTSCENE_TEXTS.length) {
        if (idx !== gameState.cutsceneTextIndex) {
            gameState.cutsceneTextIndex = idx;
            gameState.currentCutsceneText = BOSS_CUTSCENE_TEXTS[idx];
            textElem.textContent = gameState.currentCutsceneText;
            textElem.style.opacity = '0';
            setTimeout(() => textElem.style.opacity = '1', 100);
        }
        const prog = (elapsed % textDuration) / textDuration;
        if (prog > 0.8) textElem.style.opacity = (1 - ((prog - 0.8) * 5)).toString();
        else if (prog < 0.2) textElem.style.opacity = (prog * 5).toString();
        else textElem.style.opacity = '1';
        requestAnimationFrame(animateCutscene);
    } else endCutscene();
}

function endCutscene() {
    gameState.cutsceneActive = false;
    gameState.cutsceneStartTime = null;
    const overlay = document.getElementById('cutsceneOverlay');
    if (overlay) overlay.style.display = 'none';
    document.getElementById('gameCanvas').style.opacity = '1';
    document.querySelector('.hud').style.opacity = '1';
    const touch = document.getElementById('touchControls');
    if (touch) touch.style.opacity = '1';
    animate();
    const disp = document.getElementById('comboDisplay');
    if (disp) { disp.textContent = "SURVIVE! Boss stuns every 40s with 1% damage!"; disp.classList.add('active'); setTimeout(() => disp.classList.remove('active'), 3000); }
}

function updateBossSurvival() {
    const now = Date.now();
    if (!gameState.isBossStunned && (now - lastStunTime) >= 4000) {
        gameState.isBossStunned = true;
        lastStunTime = now;
        const damage = gameState.cpu.maxHealth * 0.05;
        gameState.cpu.health = Math.max(0, gameState.cpu.health - damage);
        createBossStunEffect();
        const disp = document.getElementById('comboDisplay');
        if (disp) {
            disp.textContent = `67 BOSS STUNNED! -5% HP`;
            disp.classList.add('active');
            setTimeout(() => disp.classList.remove('active'), 2000);
        }
        setTimeout(() => { gameState.isBossStunned = false; }, 500);
    }
    gameState.playerHiddenHealTimer++;
    if (gameState.playerHiddenHealTimer >= 150) {
        gameState.playerHiddenHealTimer = 0;
        gameState.playerRealHP = 100;
        createPlayerHealEffect();
    }
    if (gameState.playerFakeHP > 1) {
        const adrenaline = 1 - (gameState.playerRealHP / 100);
        const fakeHPDamage = 0.1 * (1 - adrenaline * 0.7);
        gameState.playerFakeHP = Math.max(1, gameState.playerFakeHP - fakeHPDamage);
    }
    gameState.player.health = gameState.player.maxHealth * (gameState.playerFakeHP / 100);
    if (gameState.playerRealHP <= 0) gameState.player.health = 0;
    if (!gameState.isBossStunned) updateBossAI();
}

function updateBossAI() {
    const dist = gameState.cpu.x - gameState.player.x;
    if (Math.abs(dist) > 2.5) {
        gameState.cpu.x += (dist > 0 ? -0.08 : 0.08);
        if (window.cpuModel) { window.cpuModel.position.x = gameState.cpu.x; window.cpuModel.rotation.y = (dist > 0 ? Math.PI : 0); }
    }
    if (gameState.bossSpecialAttackCooldown <= 0) {
        if (Math.random() < 0.15) { doBossStompAttack(); gameState.bossSpecialAttackCooldown = 120; return; }
        if (Math.random() < 0.3) { doBossDashAttack(); gameState.bossSpecialAttackCooldown = 90; return; }
    }
    if (gameState.cpu.attackCooldown <= 0 && Math.abs(dist) < 4) {
        const attacks = ['punch','kick','special'];
        const attack = attacks[Math.floor(Math.random() * attacks.length)];
        doCpuAttack(attack);
        gameState.cpu.attackCooldown = 20;
    }
}

function doBossStompAttack() {
    console.log("BOSS STOMP ATTACK!");
    if (window.cpuModel) {
        window.cpuModel.position.y = 3;
        setTimeout(() => { if (window.cpuModel) { window.cpuModel.position.y = 0; createShockwaveEffect(gameState.cpu.x); } }, 600);
    }
    const disp = document.getElementById('comboDisplay');
    if (disp) { disp.textContent = "67 BOSS: MEGA STOMP!"; disp.classList.add('active'); setTimeout(() => disp.classList.remove('active'), 2000); }
    const distance = Math.abs(gameState.player.x - gameState.cpu.x);
    if (distance < 3) {
        const base = gameState.player.maxHealth * 0.30;
        const phaseMul = 1 + (gameState.survivalPhase * 0.1);
        const dmg = base * phaseMul;
        applyPlayerDamage(dmg);
    }
}

function doBossDashAttack() {
    console.log("BOSS DASH ATTACK!");
    const origX = gameState.cpu.x;
    gameState.cpu.x = gameState.player.x + (gameState.cpu.facing * 1.5);
    if (window.cpuModel) createDashEffect(origX, gameState.cpu.x);
    const disp = document.getElementById('comboDisplay');
    if (disp) { disp.textContent = "67 BOSS: SPEED DASH!"; disp.classList.add('active'); setTimeout(() => disp.classList.remove('active'), 1500); }
    const distance = Math.abs(gameState.player.x - gameState.cpu.x);
    if (distance < 2) {
        const base = gameState.player.maxHealth * 0.20;
        const phaseMul = 1 + (gameState.survivalPhase * 0.05);
        const dmg = base * phaseMul;
        applyPlayerDamage(dmg);
    }
    setTimeout(() => { gameState.cpu.x = origX; if (window.cpuModel) window.cpuModel.position.x = origX; }, 300);
}

function checkSecondLife() {
    if (gameState.isBossFight && !gameState.secondLifeUsed && (gameState.playerRealHP <= 5|| (gameState.playerRealHP - 10 <= 0))) {
        gameState.secondLifeUsed = true;
        gameState.playerRealHP = 100;
        gameState.playerFakeHP = 100;
        gameState.player.health = gameState.player.maxHealth;
        createSecondLifeEffect();
        const disp = document.getElementById('comboDisplay');
        if (disp) { disp.textContent = "SECOND LIFE ACTIVATED! FULL HEALTH RESTORED!"; disp.classList.add('active'); setTimeout(() => disp.classList.remove('active'), 3000); }
        return true;
    }
    return false;
}

function createBossStunEffect() {
    const el = document.createElement('div');
    el.className = 'boss-stun-effect';
    el.textContent = 'BOSS STUNNED!';
    el.style.left = '50%'; el.style.top = '40%';
    document.getElementById('gameScreen').appendChild(el);
    setTimeout(() => el.remove(), 500);
}

function createPlayerHealEffect() {
    const el = document.createElement('div');
    el.className = 'player-heal-effect';
    el.textContent = '+';
    el.style.left = '50%'; el.style.top = '20%';
    document.getElementById('gameScreen').appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function createSecondLifeEffect() {
    const el = document.createElement('div');
    el.className = 'second-life-effect';
    el.textContent = 'SECOND LIFE!';
    el.style.cssText = `position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:4rem; color:#00ff00; text-shadow:0 0 20px #00ff00; z-index:100; animation:secondLifePulse 2s infinite;`;
    document.getElementById('gameScreen').appendChild(el);
    setTimeout(() => el.remove(), 2000);
}
