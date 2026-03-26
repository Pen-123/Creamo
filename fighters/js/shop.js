const SHOP_ITEMS = [
    { id: 'damageBoost', name: 'Damage Boost', description: 'Permanently increase your damage by 20%', price: 100, type: 'permanent', effect: 'damage' },
    { id: 'healthBoost', name: 'Health Boost', description: 'Permanently increase your health by 15%', price: 150, type: 'permanent', effect: 'health' },
    { id: 'comboMaster', name: 'Combo Master', description: 'Combo damage increased by 25%', price: 200, type: 'permanent', effect: 'combo' },
    { id: 'parryCharm', name: 'Parry Charm', description: 'Reduces CPU parry chance by 20%', price: 120, type: 'permanent', effect: 'parry' },
    { id: 'doubleCoins', name: 'Double Coins', description: 'Earn double coins for 5 matches', price: 80, type: 'temporary', duration: 5, effect: 'coins' },
    { id: 'bossUnlock', name: '67 BOSS Unlock', description: 'Instantly unlock 67 BOSS mode', price: 500, type: 'permanent', effect: 'boss' },
    { id: 'bgSpace', name: 'Space Background', description: 'Cosmic space background theme', price: 300, type: 'background', effect: 'background', bgId: 'space' },
    { id: 'bgNeon', name: 'Neon City Background', description: 'Vibrant neon city background', price: 350, type: 'background', effect: 'background', bgId: 'neon' },
    { id: 'bgMatrix', name: 'Matrix Background', description: 'Digital matrix code background', price: 400, type: 'background', effect: 'background', bgId: 'matrix' },
    { id: 'bgFire', name: 'Fire Arena Background', description: 'Fiery lava arena background', price: 450, type: 'background', effect: 'background', bgId: 'fire' },
    { id: 'bgIce', name: 'Ice Palace Background', description: 'Frozen ice palace background', price: 450, type: 'background', effect: 'background', bgId: 'ice' }
];

function initShop() {
    if (!window.gameState) return;
    if (!gameState.coins) gameState.coins = parseInt(localStorage.getItem('brainrotCoins')) || 1000;
    if (!gameState.playerInventory) gameState.playerInventory = JSON.parse(localStorage.getItem('playerInventory')) || {};
    if (!gameState.ownedBackgrounds) {
        gameState.ownedBackgrounds = JSON.parse(localStorage.getItem('ownedBackgrounds')) || {};
    }
}

function loadShopItems() {
    const container = document.getElementById('shopItems');
    if (!container) return;
    initShop();
    container.innerHTML = '';
    
    SHOP_ITEMS.forEach(item => {
        const isBackground = item.type === 'background';
        const owned = isBackground ? gameState.ownedBackgrounds[item.bgId] : gameState.playerInventory[item.id];
        const canAfford = gameState.coins >= item.price;
        const isActive = (isBackground && gameState.customBackground === item.bgId);
        
        let buttonText = '';
        let buttonDisabled = false;
        
        if (isBackground) {
            if (owned) {
                buttonText = isActive ? 'ACTIVE' : 'SELECT';
                buttonDisabled = false;  // Can still select if owned
            } else {
                buttonText = canAfford ? `BUY (${item.price} COINS)` : `NEED ${item.price} COINS`;
                buttonDisabled = !canAfford;
            }
        } else {
            buttonDisabled = owned || !canAfford;
            buttonText = owned ? 'OWNED' : (canAfford ? `BUY (${item.price} COINS)` : `NEED ${item.price} COINS`);
        }
        
        const div = document.createElement('div');
        div.className = 'shop-item' + (isActive ? ' active-background' : '');
        div.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-desc">${item.description}</div>
            <div class="item-price">${item.price} COINS</div>
            <button class="buy-btn" data-id="${item.id}" data-bg-id="${item.bgId || ''}" data-type="${item.type}" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button>
            ${owned && !isBackground ? `<div class="owned-badge">OWNED</div>` : ''}
            ${isActive ? `<div class="owned-badge">ACTIVE</div>` : ''}
        `;
        container.appendChild(div);
    });
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const bgId = btn.dataset.bgId;
            const type = btn.dataset.type;
            if (type === 'background') {
                handleBackgroundAction(id, bgId);
            } else {
                buyItem(id);
            }
        });
    });
    updateCoinsDisplay();
}

function handleBackgroundAction(itemId, bgId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    
    const owned = gameState.ownedBackgrounds[bgId];
    
    if (owned) {
        // Already owned – just select it
        gameState.customBackground = bgId;
        localStorage.setItem('customBackground', bgId);
        applyCustomBackground();
        loadShopItems(); // Refresh to show "ACTIVE" badge
        showPurchaseSuccess(`${item.name} activated!`);
    } else {
        // Not owned – buy it first
        if (gameState.coins < item.price) {
            alert('Not enough coins!');
            return;
        }
        
        gameState.coins -= item.price;
        gameState.ownedBackgrounds[bgId] = true;
        gameState.customBackground = bgId; // Auto-activate on purchase
        
        localStorage.setItem('brainrotCoins', gameState.coins);
        localStorage.setItem('ownedBackgrounds', JSON.stringify(gameState.ownedBackgrounds));
        localStorage.setItem('customBackground', bgId);
        applyCustomBackground();
        loadShopItems();
        showPurchaseSuccess(`${item.name} purchased and activated!`);
    }
}

function buyItem(id) {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (!item) return;
    
    if (gameState.playerInventory[id]) {
        alert('You already own this item!');
        return;
    }
    
    if (gameState.coins < item.price) {
        alert('Not enough coins!');
        return;
    }
    
    gameState.coins -= item.price;
    
    if (item.type === 'permanent') {
        gameState.playerInventory[id] = true;
        
        if (id === 'bossUnlock') {
            gameState.bossUnlocked = true;
            localStorage.setItem('boss67Unlocked', 'true');
            alert('67 BOSS UNLOCKED!');
        }
    } else if (item.type === 'temporary') {
        if (!gameState.playerInventory[id]) gameState.playerInventory[id] = 0;
        gameState.playerInventory[id] += item.duration;
    }
    
    localStorage.setItem('brainrotCoins', gameState.coins);
    localStorage.setItem('playerInventory', JSON.stringify(gameState.playerInventory));
    loadShopItems();
    showPurchaseSuccess(item.name);
}

function updateCoinsDisplay() {
    const el = document.getElementById('coinsAmount');
    if (el) el.textContent = gameState.coins;
}

function showPurchaseSuccess(itemName) {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:1000;`;
    div.innerHTML = `<div class="success-message" style="background:#000; border:2px solid #1a3c8b; border-radius:10px; padding:20px; text-align:center;"><h3>✅ SUCCESS!</h3><p>${itemName}</p><button class="nav-btn" id="closeSuccess">CLOSE</button></div>`;
    document.body.appendChild(div);
    document.getElementById('closeSuccess').addEventListener('click', () => div.remove());
}
