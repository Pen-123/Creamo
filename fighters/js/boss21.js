// fighters/js/boss21.js
// 21 Boss - Turn-Based with Timing Bar and Dialogue

class Boss21Fight {
    constructor() {
        this.boss = BOSS_21;
        this.playerChar = CHARACTERS[gameState.selectedCharacter];
        this.dialogueTimeline = [
            { time: 10,  text: "You're not winning this one." },
            { time: 30,  text: "You may have defeated 67, but this is different." },
            { time: 60,  text: "I WILL WIN." },
            { time: 90,  text: "You know, we weren't always here. Somebody forced us to fight you to this day." },
            { time: 120, text: "We called him 'Death' — quite literally death, the physical manifestation." }
        ];
        this.fightDuration = 160; // seconds (2:40 = 160s)
        this.fightTimer = this.fightDuration;
        this.fightActive = false;
        this.dialoguePlayed = new Set();
        this.playerTurn = true;
        this.charges = 0;
        this.timingBarActive = false;
        this.timingBarProgress = 0;
        this.timingBarDirection = 1;
        this.targetZoneStart = 0.4;
        this.targetZoneEnd = 0.6;
        this.bossCharges = 0;
        this.dialogueContainer = null;
        this.dialogueTextEl = null;
        this.yesNoContainer = null;
        this.endDialogueActive = false;
        this.rewardGiven = false;
    }

    start() {
        gameState.is21BossFight = true;
        gameState.turnBased = true;
        gameState.gameActive = true;

        // Setup UI
        document.getElementById('turnBasedUI').style.display = 'block';
        document.getElementById('touchControls').style.display = 'none';
        this.createDialogueUI();

        // Play boss music
        const boss21Music = document.getElementById('boss21Music');
        if (boss21Music) {
            boss21Music.currentTime = 0;
            boss21Music.volume = 0.7;
            boss21Music.play().catch(e => console.log("21 Boss music play failed:", e));
        }

        // Initialize health
        gameState.player.health = this.playerChar.hp;
        gameState.player.maxHealth = this.playerChar.hp;
        gameState.cpu.health = this.boss.hp;
        gameState.cpu.maxHealth = this.boss.hp;
        gameState.cpu.character = this.boss;
        gameState.cpu.is21Boss = true;
        updateHealthBars();

        this.updateChargeCounter();
        this.updateTurnIndicator();
        this.startFightTimer();
        this.startDialogueTimer();

        if (!gameState.animateStarted) {
            animate();
            gameState.animateStarted = true;
        }
    }

    createDialogueUI() {
        const gameScreen = document.getElementById('gameScreen');
        const existing = document.getElementById('boss21Dialogue');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'boss21Dialogue';
        container.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            border: 2px solid #00ccff;
            border-radius: 12px;
            padding: 15px 30px;
            color: #00ccff;
            font-family: 'Courier New', monospace;
            font-size: 1.5rem;
            text-align: center;
            z-index: 200;
            display: none;
            box-shadow: 0 0 20px #00ccff;
            max-width: 80%;
        `;
        const textEl = document.createElement('span');
        textEl.id = 'boss21DialogueText';
        container.appendChild(textEl);
        gameScreen.appendChild(container);

        this.dialogueContainer = container;
        this.dialogueTextEl = textEl;
    }

    showDialogue(text, duration = 4000) {
        if (!this.dialogueContainer || !this.dialogueTextEl) return;
        this.dialogueTextEl.textContent = text;
        this.dialogueContainer.style.display = 'block';
        clearTimeout(this.dialogueTimeout);
        this.dialogueTimeout = setTimeout(() => {
            this.dialogueContainer.style.display = 'none';
        }, duration);
    }

    startDialogueTimer() {
        this.dialogueInterval = setInterval(() => {
            if (!this.fightActive) return;
            const elapsed = this.fightDuration - this.fightTimer;
            for (const item of this.dialogueTimeline) {
                if (!this.dialoguePlayed.has(item.time) && elapsed >= item.time) {
                    this.dialoguePlayed.add(item.time);
                    this.showDialogue(item.text, 4000);
                }
            }
        }, 500);
    }

    startFightTimer() {
        this.fightActive = true;
        this.fightTimerInterval = setInterval(() => {
            if (!this.fightActive) return;
            this.fightTimer--;
            document.getElementById('roundTimer').textContent = this.fightTimer;
            if (this.fightTimer <= 0) {
                this.endFight(true); // Player survived the time limit
            }
        }, 1000);
    }

    updateChargeCounter() {
        const counter = document.getElementById('chargeCounter');
        if (counter) counter.textContent = `CHARGES: ${this.charges}`;
        const fightBtn = document.getElementById('fightBtn');
        const healBtn = document.getElementById('healBtn');
        if (fightBtn) fightBtn.disabled = this.charges < 1 || !this.playerTurn;
        if (healBtn) healBtn.disabled = this.charges < 1 || !this.playerTurn;
    }

    updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator');
        if (indicator) {
            indicator.textContent = this.playerTurn ? "YOUR TURN" : "BOSS TURN";
            indicator.style.color = this.playerTurn ? "#00ff00" : "#ff0033";
        }
        const chargeBtn = document.getElementById('chargeBtn');
        if (chargeBtn) chargeBtn.disabled = !this.playerTurn;
    }

    playerCharge() {
        if (!this.playerTurn) return;
        this.charges++;
        this.updateChargeCounter();
        showMessage(`CHARGED! (${this.charges} charges)`, '#00ccff');
        this.endPlayerTurn();
    }

    playerFight() {
        if (!this.playerTurn || this.charges < 1) return;
        this.charges--;
        this.updateChargeCounter();

        this.timingBarActive = true;
        this.timingBarProgress = 0;
        this.timingBarDirection = 1;
        this.spacePressed = false;

        const timingBar = document.getElementById('timingBar');
        if (timingBar) timingBar.style.display = 'block';

        this.targetZoneStart = 0.3 + Math.random() * 0.4;
        this.targetZoneEnd = this.targetZoneStart + 0.15;

        const target = document.getElementById('timingBarTarget');
        if (target) {
            target.style.left = `${this.targetZoneStart * 100}%`;
            target.style.width = `${(this.targetZoneEnd - this.targetZoneStart) * 100}%`;
        }
    }

    updateTimingBar() {
        if (!this.timingBarActive) return;

        if (this.spacePressed) {
            const success = (this.timingBarProgress >= this.targetZoneStart && 
                             this.timingBarProgress <= this.targetZoneEnd);
            this.executeTimingAttack(success);
            this.spacePressed = false;
            return;
        }

        this.timingBarProgress += 0.015 * this.timingBarDirection;
        if (this.timingBarProgress >= 1) {
            this.timingBarProgress = 1;
            this.timingBarDirection = -1;
        } else if (this.timingBarProgress <= 0) {
            this.timingBarProgress = 0;
            this.timingBarDirection = 1;
        }

        const fill = document.getElementById('timingBarFill');
        if (fill) fill.style.width = `${this.timingBarProgress * 100}%`;
    }

    executeTimingAttack(success) {
        this.timingBarActive = false;
        document.getElementById('timingBar').style.display = 'none';

        if (success) {
            const damage = Math.floor((this.playerChar.moves.special || 50) * 2.2);
            gameState.cpu.health = Math.max(0, gameState.cpu.health - damage);
            showMessage(`PERFECT HIT! ${damage} DAMAGE!`, '#00ff00');
            createBloodEffect(gameState.cpu.x, 1, 0);
            applyDamageFlash('cpu');
        } else {
            const damage = Math.floor((this.playerChar.moves.punch || 30) * 0.6);
            gameState.cpu.health = Math.max(0, gameState.cpu.health - damage);
            showMessage(`WEAK HIT! ${damage} DAMAGE`, '#ff9900');
        }

        updateHealthBars();
        if (gameState.cpu.health <= 0) {
            this.endFight(false); // Player defeated boss early
        } else {
            this.endPlayerTurn();
        }
    }

    playerHeal() {
        if (!this.playerTurn || this.charges < 1) return;
        this.charges--;
        const healAmount = Math.floor(this.playerChar.hp * 0.25);
        gameState.player.health = Math.min(this.playerChar.hp, gameState.player.health + healAmount);
        updateHealthBars();
        showMessage(`HEALED ${healAmount} HP!`, '#00ff00');
        this.updateChargeCounter();
        this.endPlayerTurn();
    }

    endPlayerTurn() {
        this.playerTurn = false;
        this.updateTurnIndicator();
        this.updateChargeCounter();

        setTimeout(() => {
            this.executeBossTurn();
        }, 1200);
    }

    executeBossTurn() {
        const bossAction = document.getElementById('bossAction');
        this.bossCharges++;

        if (this.bossCharges >= 2) {
            const actions = ['GUN', 'CHARGE', 'DASH'];
            const action = actions[Math.floor(Math.random() * actions.length)];
            if (bossAction) {
                bossAction.textContent = `BOSS USES ${action}!`;
                bossAction.style.display = 'block';
            }

            setTimeout(() => {
                showDodgeWarning();
                gameState.dodgeWindow = true;

                setTimeout(() => {
                    hideDodgeWarning();
                    gameState.dodgeWindow = false;

                    if (!gameState.dodgeSuccessful) {
                        const damage = Math.floor((this.boss.moves.special || 60) * 1.3);
                        gameState.player.health = Math.max(0, gameState.player.health - damage);
                        updateHealthBars();
                        showMessage(`BOSS HIT! ${damage} DAMAGE!`, '#ff0033');
                        createBloodEffect(gameState.player.x, 1, 0);
                        applyDamageFlash('player');
                    }
                    gameState.dodgeSuccessful = false;
                    this.bossCharges = 0;
                    if (bossAction) bossAction.style.display = 'none';

                    if (gameState.player.health <= 0) {
                        this.endFight(false, true); // Player lost
                    } else {
                        this.playerTurn = true;
                        this.updateTurnIndicator();
                        this.updateChargeCounter();
                    }
                }, 2000);
            }, 1000);
        } else {
            if (bossAction) {
                bossAction.textContent = `BOSS CHARGES! (${this.bossCharges}/2)`;
                bossAction.style.display = 'block';
            }
            setTimeout(() => {
                if (bossAction) bossAction.style.display = 'none';
                this.playerTurn = true;
                this.updateTurnIndicator();
                this.updateChargeCounter();
            }, 1500);
        }
    }

    endFight(timeoutWin, playerLost = false) {
        this.fightActive = false;
        clearInterval(this.fightTimerInterval);
        clearInterval(this.dialogueInterval);
        gameState.gameActive = false;

        const boss21Music = document.getElementById('boss21Music');
        if (boss21Music) boss21Music.pause();

        if (playerLost) {
            alert('You were defeated...');
            showScreen('characterSelect');
            return;
        }

        this.showEndDialogue();
    }

    showEndDialogue() {
        document.getElementById('turnBasedUI').style.display = 'none';
        this.dialogueContainer.style.display = 'block';
        this.dialogueTextEl.textContent = "That was a good song, yeah?";

        const gameScreen = document.getElementById('gameScreen');
        const btnContainer = document.createElement('div');
        btnContainer.id = 'yesNoContainer';
        btnContainer.style.cssText = `
            position: absolute;
            top: 120px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 20px;
            z-index: 201;
        `;

        const yesBtn = document.createElement('button');
        yesBtn.textContent = 'YES';
        yesBtn.className = 'nav-btn';
        yesBtn.style.background = '#00ccff';
        yesBtn.onclick = () => this.handleEndChoice(true);

        const noBtn = document.createElement('button');
        noBtn.textContent = 'NO';
        noBtn.className = 'nav-btn';
        noBtn.style.background = '#ff0033';
        noBtn.onclick = () => this.handleEndChoice(false);

        btnContainer.appendChild(yesBtn);
        btnContainer.appendChild(noBtn);
        gameScreen.appendChild(btnContainer);
        this.yesNoContainer = btnContainer;
        this.endDialogueActive = true;
    }

    handleEndChoice(choseYes) {
        if (!this.endDialogueActive) return;
        this.endDialogueActive = false;
        if (this.yesNoContainer) this.yesNoContainer.remove();

        let finalText = '';
        if (choseYes) {
            finalText = "THANK YOU! I'll be helping you in the shadows defeat the other bosses, but you'll help me defeat 'Death' and free me and '67'. But 201 does not want to defeat death, he wants to torture him, so DO NOT TELL HIM.";
            if (!this.rewardGiven) {
                gameState.coins += 2000;
                localStorage.setItem('brainrotCoins', gameState.coins);
                this.rewardGiven = true;
                gameState.boss21Defeated = true;
                localStorage.setItem('boss21Defeated', 'true');
            }
        } else {
            finalText = "I spent a lot of time on that.";
        }

        this.dialogueTextEl.textContent = finalText;
        setTimeout(() => {
            this.dialogueContainer.style.display = 'none';
            alert(`Victory! ${choseYes ? '2000 coins awarded!' : ''}`);
            showScreen('characterSelect');
        }, 5000);
    }

    handleSpacePress() {
        if (this.timingBarActive) {
            this.spacePressed = true;
        }
    }

    attemptDodge() {
        if (gameState.dodgeWarningActive || gameState.dodgeWindow) {
            gameState.dodgeSuccessful = true;
            hideDodgeWarning();
            showMessage('PERFECT DODGE!', '#00ff00');
        }
    }
}

let boss21Fight = null;

function start21BossFight() {
    boss21Fight = new Boss21Fight();
    boss21Fight.start();
}

const originalUpdate = window.update || function() {};
window.update = function() {
    originalUpdate();
    if (boss21Fight && boss21Fight.fightActive) {
        if (boss21Fight.timingBarActive) {
            boss21Fight.updateTimingBar();
        }
    }
};

window.boss21PlayerCharge = () => boss21Fight?.playerCharge();
window.boss21PlayerFight = () => boss21Fight?.playerFight();
window.boss21PlayerHeal = () => boss21Fight?.playerHeal();
window.boss21AttemptDodge = () => boss21Fight?.attemptDodge();
window.boss21HandleSpace = () => boss21Fight?.handleSpacePress();
