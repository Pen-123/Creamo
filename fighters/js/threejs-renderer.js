function initThreeJS() {
    try {
        console.log('Initializing Three.js...');
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        window.scene = new THREE.Scene();
        window.scene.background = new THREE.Color(0x000000);
        window.camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        window.camera.position.set(0, 8, 15);
        window.camera.lookAt(0, 0, 0);
        window.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
        window.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        window.renderer.setPixelRatio(1);
        window.renderer.shadowMap.enabled = true;
        const ambient = new THREE.AmbientLight(0x404040, 0.6);
        window.scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 15, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        window.scene.add(dirLight);
        const backLight = new THREE.DirectionalLight(0x4444ff, 0.3);
        backLight.position.set(-5, 5, -5);
        window.scene.add(backLight);
        const arenaGeo = new THREE.BoxGeometry(25, 1, 12);
        const arenaMat = new THREE.MeshPhongMaterial({ color: 0x1a1a2a, shininess: 50, specular: 0x222244 });
        window.arena = new THREE.Mesh(arenaGeo, arenaMat);
        window.arena.position.y = -1;
        window.arena.receiveShadow = true;
        window.scene.add(window.arena);
        const grid = new THREE.GridHelper(25, 25, 0x1a3c8b, 0x222244);
        grid.position.y = 0.01;
        window.scene.add(grid);
        const borderGeo = new THREE.BoxGeometry(26, 0.5, 13);
        const borderMat = new THREE.MeshPhongMaterial({ color: 0x1a3c8b, emissive: 0x0a1a3a });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.y = -0.75;
        window.scene.add(border);
        createHumanoidFighters();
        window.clock = new THREE.Clock();
        console.log('Three.js initialized');
    } catch (e) { console.error('Three.js init error:', e); }
}
function createHumanoidFighters() {
    if (!window.gameState || !window.gameState.player || !window.gameState.cpu) { createPlaceholderFighters(); return; }
    const playerChar = gameState.player.character;
    const cpuChar = gameState.cpu.character;
    if (window.playerModel) window.scene.remove(window.playerModel);
    if (window.cpuModel) window.scene.remove(window.cpuModel);
    window.playerModel = createHumanoidModel(playerChar.color, gameState.player.x, 0);
    window.scene.add(window.playerModel);
    if (gameState.cpu.isBoss) window.cpuModel = createBoss67Model(gameState.cpu.x, 0);
    else window.cpuModel = createHumanoidModel(cpuChar.color, gameState.cpu.x, 0);
    window.cpuModel.rotation.y = Math.PI;
    window.scene.add(window.cpuModel);
}
function createHumanoidModel(color, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const mainCol = new THREE.Color(color);
    const skin = new THREE.Color(0xffcc99);
    const pants = new THREE.Color(0x333366);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), new THREE.MeshPhongMaterial({ color: skin }));
    head.position.y = 1.6; head.castShadow = true; group.add(head);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.2, 8), new THREE.MeshPhongMaterial({ color: mainCol }));
    body.position.y = 0.7; body.castShadow = true; group.add(body);
    const armGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
    const armMat = new THREE.MeshPhongMaterial({ color: mainCol });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-0.7, 0.7, 0); leftArm.rotation.z = Math.PI / 6; leftArm.castShadow = true; group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(0.7, 0.7, 0); rightArm.rotation.z = -Math.PI / 6; rightArm.castShadow = true; group.add(rightArm);
    const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
    const legMat = new THREE.MeshPhongMaterial({ color: pants });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-0.25, -0.8, 0); leftLeg.castShadow = true; group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(0.25, -0.8, 0); rightLeg.castShadow = true; group.add(rightLeg);
    const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMat = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat); leftEye.position.set(-0.15, 1.65, 0.35); group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat); rightEye.position.set(0.15, 1.65, 0.35); group.add(rightEye);
    return group;
}
function createBoss67Model(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const mainCol = new THREE.Color(0x1a3c8b);
    const glowCol = new THREE.Color(0x2ecc71);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.5, 8), new THREE.MeshPhongMaterial({ color: mainCol, emissive: glowCol, emissiveIntensity: 0.3 }));
    body.position.y = 0.9; body.castShadow = true; group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), new THREE.MeshPhongMaterial({ color: mainCol, emissive: glowCol, emissiveIntensity: 0.2 }));
    head.position.y = 1.9; head.castShadow = true; group.add(head);
    const eyeGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71, emissive: 0x2ecc71, emissiveIntensity: 0.8 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat); leftEye.position.set(-0.2, 1.95, 0.5); group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat); rightEye.position.set(0.2, 1.95, 0.5); group.add(rightEye);
    const armGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 8);
    const armMat = new THREE.MeshPhongMaterial({ color: mainCol });
    const leftArm = new THREE.Mesh(armGeo, armMat); leftArm.position.set(-0.9, 0.9, 0); leftArm.rotation.z = Math.PI / 6; group.add(leftArm);
    const rightArm = new THREE.Mesh(armGeo, armMat); rightArm.position.set(0.9, 0.9, 0); rightArm.rotation.z = -Math.PI / 6; group.add(rightArm);
    const legGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.4, 8);
    const legMat = new THREE.MeshPhongMaterial({ color: 0xd4af37 });
    const leftLeg = new THREE.Mesh(legGeo, legMat); leftLeg.position.set(-0.3, -0.9, 0); group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, legMat); rightLeg.position.set(0.3, -0.9, 0); group.add(rightLeg);
    const aura = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0x1a3c8b, transparent: true, opacity: 0.2, side: THREE.DoubleSide }));
    aura.position.y = 0.8; group.add(aura);
    function animateAura() { if (aura) { aura.scale.x = 1 + Math.sin(Date.now() * 0.005) * 0.1; aura.scale.y = 1 + Math.cos(Date.now() * 0.005) * 0.1; aura.scale.z = 1 + Math.sin(Date.now() * 0.005) * 0.1; requestAnimationFrame(animateAura); } }
    animateAura();
    return group;
}
function createPlaceholderFighters() {
    if (window.playerModel) window.scene.remove(window.playerModel);
    if (window.cpuModel) window.scene.remove(window.cpuModel);
    window.playerModel = createHumanoidModel(0x1a3c8b, -5, 0);
    window.scene.add(window.playerModel);
    window.cpuModel = createHumanoidModel(0xd4af37, 5, 0);
    window.cpuModel.rotation.y = Math.PI;
    window.scene.add(window.cpuModel);
}
function createBloodEffect(x, y, z) {
    if (!window.scene) return;
    const blood = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true, opacity: 0.8 }));
    blood.position.set(x, y, z); blood.castShadow = true; window.scene.add(blood);
    const start = Date.now();
    const animate = () => { const elapsed = Date.now() - start; const prog = elapsed / 500; if (prog < 1) { blood.scale.set(1 + prog, 1 + prog, 1 + prog); blood.material.opacity = 0.8 * (1 - prog); requestAnimationFrame(animate); } else window.scene.remove(blood); };
    animate();
}
function applyDamageFlash(character, color = 0xff0000) {
    let model = character === 'player' ? window.playerModel : window.cpuModel;
    if (!model) return;
    model.children.forEach(child => {
        if (child.material) {
            const orig = child.material.color.clone();
            child.material.color.set(color);
            setTimeout(() => { if (child.material) child.material.color.copy(orig); }, 200);
        }
    });
}
function createParryEffect(x, y, z) {
    if (!window.scene) return;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.5, 16), new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
    ring.position.set(x, y, z); ring.rotation.x = Math.PI / 2; window.scene.add(ring);
    const start = Date.now();
    const animate = () => { const elapsed = Date.now() - start; const prog = elapsed / 500; if (prog < 1) { ring.scale.set(1 + prog * 2, 1 + prog * 2, 1); ring.material.opacity = 0.8 * (1 - prog); requestAnimationFrame(animate); } else window.scene.remove(ring); };
    animate();
}
function createShockwaveEffect(x) {
    if (!window.scene) return;
    const wave = new THREE.Mesh(new THREE.RingGeometry(0.5, 3, 32), new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
    wave.position.set(x, 0.1, 0); wave.rotation.x = Math.PI / 2; window.scene.add(wave);
    const start = Date.now();
    const animate = () => { const elapsed = Date.now() - start; const prog = elapsed / 1000; if (prog < 1) { wave.scale.set(1 + prog * 3, 1 + prog * 3, 1); wave.material.opacity = 0.7 * (1 - prog); requestAnimationFrame(animate); } else window.scene.remove(wave); };
    animate();
}
function createDashEffect(fromX, toX) {
    if (!window.scene) return;
    const length = Math.abs(toX - fromX);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(length, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0066, transparent: true, opacity: 0.8 }));
    bar.position.set((fromX + toX) / 2, 1, 0); window.scene.add(bar);
    const start = Date.now();
    const animate = () => { const elapsed = Date.now() - start; const prog = elapsed / 300; if (prog < 1) { bar.material.opacity = 0.8 * (1 - prog); requestAnimationFrame(animate); } else window.scene.remove(bar); };
    animate();
}
