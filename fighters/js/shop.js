function buyItem(id) {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (!item) return;
    if (item.effect === 'background' && gameState.playerInventory[id]) {
        // Already owned: apply this background
        gameState.customBackground = item.bgId;
        localStorage.setItem('customBackground', item.bgId);
        applyCustomBackground();
        loadShopItems(); // refresh to show active state
        showPurchaseSuccess(`${item.name} activated!`);
        return;
    }
    if (gameState.playerInventory[id] && item.effect !== 'background') { alert('You already own this item!'); return; }
    if (gameState.coins < item.price) { alert('Not enough coins!'); return; }
    gameState.coins -= item.price;
    if (item.type === 'permanent') {
        gameState.playerInventory[id] = true;
        if (id === 'bossUnlock') {
            gameState.bossUnlocked = true;
            localStorage.setItem('boss67Unlocked', 'true');
            alert('67 BOSS UNLOCKED! You can now play 67 BOSS Survival Mode!');
            // Refresh character select screen if open to add the difficulty option
            if (gameState.currentScreen === 'characterSelect') {
                renderCharacterSelect();
                const diffSelect = document.getElementById('difficultySelect');
                if (!Array.from(diffSelect.options).some(opt => opt.value === 'sixtyseven')) {
                    const option = document.createElement('option');
                    option.value = 'sixtyseven';
                    option.textContent = '67 BOSS - SURVIVAL';
                    diffSelect.appendChild(option);
                }
            }
        } else if (item.effect === 'background') {
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
