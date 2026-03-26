const CHARACTERS = [
    {
        id: 67,
        name: "67",
        style: "Meme Style",
        hp: 1200,
        color: "#d4af37",
        icon: "67",
        description: "Legendary meme fighter with unpredictable moves and devastating combos. Harnesses the power of the golden number.",
        moves: { punch: 40, kick: 35, special: 80 },
        combos: [
            { input: ["right", "right", "punch"], name: "DRAGON UPPERCUT", damage: 120 },
            { input: ["down", "right", "punch"], name: "FIREBALL", damage: 100 },
            { input: ["punch", "punch"], name: "DOUBLE PUNCH", damage: 90 },
            { input: ["punch", "right", "punch", "kick"], name: "GOLDEN COMBO", damage: 200 }
        ]
    },
    {
        id: 41,
        name: "41",
        style: "Thunder God Style",
        hp: 1400,
        color: "#1a3c8b",
        icon: "⚡",
        description: "A powerful striker with lightning-fast attacks and overwhelming power. Each strike carries thunderous force.",
        moves: { punch: 45, kick: 30, special: 75 },
        combos: [
            { input: ["down", "down", "kick"], name: "LOW SWEEP", damage: 110 },
            { input: ["left", "left", "kick"], name: "BACK KICK", damage: 95 },
            { input: ["kick", "kick"], name: "SPIN KICK", damage: 85 },
            { input: ["down", "punch", "kick"], name: "THUNDER STRIKE", damage: 150 }
        ]
    },
    {
        id: 21,
        name: "21",
        style: "Wind Style",
        hp: 1000,
        color: "#3498db",
        icon: "🌀",
        description: "Swift and agile fighter with incredible speed. Uses wind-based techniques to overwhelm opponents.",
        moves: { punch: 35, kick: 45, special: 90 },
        combos: [
            { input: ["right", "down", "punch"], name: "WIND SLASH", damage: 130 },
            { input: ["punch", "kick"], name: "QUICK STRIKE", damage: 80 },
            { input: ["down", "up", "kick"], name: "TORNADO", damage: 140 },
            { input: ["kick", "punch", "kick"], name: "CYCLONE", damage: 160 }
        ]
    },
    {
        id: 201,
        name: "201",
        style: "Earth Style",
        hp: 1600,
        color: "#5dade2",
        icon: "⛰️",
        description: "A defensive powerhouse with incredible endurance. Slow but devastating when connecting attacks.",
        moves: { punch: 50, kick: 40, special: 70 },
        combos: [
            { input: ["down", "punch"], name: "EARTH SMASH", damage: 150 },
            { input: ["left", "right", "punch"], name: "CHARGE PUNCH", damage: 125 },
            { input: ["punch", "punch", "kick"], name: "TITAN COMBO", damage: 160 },
            { input: ["down", "down", "punch", "kick"], name: "MOUNTAIN CRUSHER", damage: 180 }
        ]
    }
];

const BOSS_67 = {
    id: 6667,
    name: "67 BOSS",
    style: "Final Brainrot",
    hp: 4000,
    color: "#1a3c8b",
    icon: "💀",
    description: "The ultimate 67 manifestation. Defeat it to uncover the truth.",
    moves: { punch: 40, kick: 55, special: 120 },
    isBoss: true,
    combos: [
        { input: ["right", "right", "punch"], name: "ULTIMATE UPPERCUT", damage: 150 },
        { input: ["down", "right", "punch"], name: "MEGA FIREBALL", damage: 180 }
    ]
};
