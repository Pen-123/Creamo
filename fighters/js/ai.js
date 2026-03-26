const DIFFICULTY_SETTINGS = {
    easy: { cpuHpMultiplier: 0.8, parryChance: 0.2, aggression: 0.3, learningRate: 0.1 },
    medium: { cpuHpMultiplier: 1.0, parryChance: 0.5, aggression: 0.6, learningRate: 0.3 },
    hard: { cpuHpMultiplier: 1.3, parryChance: 0.8, aggression: 0.9, learningRate: 0.5 },
    insane: { cpuHpMultiplier: 1.5, parryChance: 1.0, aggression: 1.0, learningRate: 0.8 },
    sixtyseven: { cpuHpMultiplier: 2.5, parryChance: 0.0, aggression: 0.9, learningRate: 0.7, isBoss: true }
};
function updateCPUAI() {
    if (!gameState.cpu || gameState.cpu.isBoss) return;
    const dist = Math.abs(gameState.cpu.x - gameState.player.x);
    if (dist > 2.5) {
        gameState.cpu.x += (gameState.cpu.x - gameState.player.x > 0 ? -0.05 : 0.05);
        if (window.cpuModel) { window.cpuModel.position.x = gameState.cpu.x; window.cpuModel.rotation.y = (gameState.cpu.x - gameState.player.x > 0 ? Math.PI : 0); }
    }
    if (Math.random() < gameState.cpu.difficulty.aggression * 0.02 && gameState.cpu.attackCooldown <= 0 && dist < 3) {
        const attacks = ['punch','kick','special'];
        const attack = attacks[Math.floor(Math.random() * attacks.length)];
        doCpuAttack(attack);
        gameState.cpu.attackCooldown = 25 / gameState.cpu.difficulty.aggression;
    }
}
