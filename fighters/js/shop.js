const SHOP_ITEMS = [
    { id: 'damageBoost', name: 'Damage Boost', description: 'Permanently increase your damage by 20%', price: 100, type: 'permanent', effect: 'damage' },
    { id: 'healthBoost', name: 'Health Boost', description: 'Permanently increase your health by 15%', price: 150, type: 'permanent', effect: 'health' },
    { id: 'comboMaster', name: 'Combo Master', description: 'Combo damage increased by 25%', price: 200, type: 'permanent', effect: 'combo' },
    { id: 'parryCharm', name: 'Parry Charm', description: 'Reduces CPU parry chance by 20%', price: 120, type: 'permanent', effect: 'parry' },
    { id: 'doubleCoins', name: 'Double Coins', description: 'Earn double coins for 5 matches', price: 80, type: 'temporary', duration: 5, effect: 'coins' },
    { id: 'bossUnlock', name: '67 BOSS Unlock', description: 'Instantly unlock 67 BOSS mode', price: 500, type: 'permanent', effect: 'boss' },
    { id: 'bgSpace', name: 'Space Background', description: 'Unlock cosmic space background theme', price: 300, type: 'permanent', effect: 'background', bgId: 'space' },
    { id: 'bgNeon', name: 'Neon City Background', description: 'Unlock vibrant neon city background', price: 350, type: 'permanent', effect: 'background', bgId: 'neon' },
    { id: 'bgMatrix', name: 'Matrix Background', description: 'Unlock digital matrix code background', price: 400, type: 'permanent', effect: 'background', bgId: 'matrix' },
    { id: 'bgFire', name: 'Fire Arena Background', description: 'Unlock fiery lava arena background', price: 450, type: 'permanent', effect: 'background', bgId: 'fire' },
    { id: 'bgIce', name: 'Ice Palace Background', description: 'Unlock frozen ice palace background', price: 450, type: 'permanent', effect: 'background', bgId: 'ice' }
];

// Missing function – add this
function initShop() {
    if (!window.gameState) return;
    if (!gameState.coins) gameState.coins = parseInt(localStorage.getItem('brainrotCoins')) || 1000;
    if (!gameState.playerInventory) gameState.playerInventory = JSON.parse(localStorage.getItem('playerInventory')) || {};
}

function loadShopItems() {
    const container = document.getElementById('shopItems');
    if (!container) return;
    initShop();  // now defined
    container.innerHTML = '';
    
    SHOP_ITEMS.forEach(item => {
        const owned = gameState.playerInventory[item.id];
        const canAfford = gameState.coins >= item.price;
        const isBackground = item.effect === 'background';
        const activeBackground = (isBackground && gameState.customBackground === item.bgId);
        
        let buttonDisabled = owned || (isBackground && owned);
        let buttonText = owned ? (isBackground ? (activeBackground ? 'ACTIVE' : 'OWNED') : 'OWNED') : (canAfford ? 'BUY NOW' : 'NEED COINS');
        
        if (isBackground && owned) {
            buttonDisabled = true;
            buttonText = 'OWNED';
        }
        
        const div = document.createElement('div');
        div.className = 'shop-item' + (activeBackground ? ' active-background' : '');
        div.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-desc">${item.description}</div>
            <div class="item-price">${item.price} COINS</div>
            <button class="buy-btn" data-id="${item.id}" ${buttonDisabled ? 'disabled' : ''}>${buttonText}</button>
            ${owned ? `<div class="owned-badge">${isBackground ? (activeBackground ? 'ACTIVE' : 'OWNED') : 'OWNED'}</div>` : ''}
        `;
        container.appendChild(div);
    });
    
    document.querySelectorAll('.buy-btn').forEach(btn => btn.addEventListener('click', (e) => buyItem(e.target.dataset.id)));
    updateCoinsDisplay();
}

function updateCoinsDisplay() {
    const el = document.getElementById('coinsAmount');
    if (el) el.textContent = gameState.coins;
}

function buyItem(id) {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (!item) return;
    
    if (item.effect === 'background' && gameState.playerInventory[id]) {
        return;
    }
    
    if (gameState.playerInventory[id] && item.effect !== 'background') {
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
        else if (item.effect === 'background') {
            gameState.customBackground = item.bgId;
            localStorage.setItem('customBackground', item.bgId);
            applyCustomBackground();
        }
    } else {
        if (!gameState.playerInventory[id]) gameState.playerInventory[id] = 0;
        gameState.playerInventory[id] += item.duration;
    }
    
    localStorage.setItem('brainrotCoins', gameState.coins);
    localStorage.setItem('playerInventory', JSON.stringify(gameState.playerInventory));
    loadShopItems();
    showPurchaseSuccess(item.name);
}

function showPurchaseSuccess(itemName) {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:1000;`;
    div.innerHTML = `<div class="success-message" style="background:#000; border:2px solid #1a3c8b; border-radius:10px; padding:20px; text-align:center;"><h3>✅ PURCHASE SUCCESSFUL!</h3><p>You bought: ${itemName}</p><button class="nav-btn" id="closeSuccess">CLOSE</button></div>`;
    document.body.appendChild(div);
    document.getElementById('closeSuccess').addEventListener('click', () => div.remove());
}
