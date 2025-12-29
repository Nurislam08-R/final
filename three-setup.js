// ================================================
// THREE.JS 3D SETUP & FIGURINE GENERATION
// ================================================

let scene, camera, renderer, figurine, controls;
let isRotating = true;
let animationId;

/**
 * Инициализирует Three.js сцену
 */
function initThreeJS() {
    const canvas = document.getElementById('canvas3d');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9ff);
    
    // Camera setup
    const width = canvas.parentElement.clientWidth;
    const height = 400;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x667eea, 0.5);
    pointLight.position.set(-5, 3, 5);
    scene.add(pointLight);
    
    // Базовая 3D фигурка (дефолт)
    createDefaultFigurine();
    
    // Mouse controls
    setupMouseControls(canvas);
    
    // Start animation loop
    animate();
}

/**
 * Создает базовую 3D фигурку
 */
function createDefaultFigurine() {
    // Удаляем старую фигурку
    if (figurine) {
        scene.remove(figurine);
    }
    
    figurine = new THREE.Group();
    
    // Тело (цилиндр)
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.35, 1.2, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x667eea,
        roughness: 0.7,
        metalness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.2;
    body.castShadow = true;
    body.receiveShadow = true;
    figurine.add(body);
    
    // Голова (сфера)
    const headGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5deb3,
        roughness: 0.8,
        metalness: 0
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.3;
    head.castShadow = true;
    head.receiveShadow = true;
    figurine.add(head);
    
    // Левое плечо
    const leftArmGeometry = new THREE.CylinderGeometry(0.15, 0.12, 0.8, 16);
    const armMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5deb3,
        roughness: 0.8
    });
    const leftArm = new THREE.Mesh(leftArmGeometry, armMaterial);
    leftArm.position.set(-0.55, 0.6, 0);
    leftArm.rotation.z = Math.PI / 6;
    leftArm.castShadow = true;
    figurine.add(leftArm);
    
    // Правое плечо
    const rightArm = leftArm.clone();
    rightArm.position.x = 0.55;
    rightArm.castShadow = true;
    figurine.add(rightArm);
    
    // Левая нога
    const leftLegGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.9, 16);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.8
    });
    const leftLeg = new THREE.Mesh(leftLegGeometry, legMaterial);
    leftLeg.position.set(-0.25, -0.6, 0);
    leftLeg.castShadow = true;
    figurine.add(leftLeg);
    
    // Правая нога
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.25;
    rightLeg.castShadow = true;
    figurine.add(rightLeg);
    
    scene.add(figurine);
}

/**
 * Обновляет 3D фигурку на основе параметров
 */
function updateFigurine(formData) {
    if (!figurine) {
        createDefaultFigurine();
        return;
    }
    
    // Обновляем цвет тела в зависимости от выбранной схемы
    const colorMap = {
        vibrant: 0xFF6B6B,
        professional: 0x667eea,
        pastel: 0xFFB6C1,
        dark: 0x2C3E50
    };
    
    const bodyColor = colorMap[formData.color] || colorMap.professional;
    const body = figurine.children[0];
    if (body) {
        body.material.color.setHex(bodyColor);
    }
    
    // Изменяем позу
    if (formData.pose === 'sitting') {
        figurine.children[0].scale.y = 0.7;
        figurine.position.y = 0.3;
    } else if (formData.pose === 'dynamic') {
        figurine.rotation.z = Math.PI / 12;
    } else {
        figurine.children[0].scale.y = 1;
        figurine.position.y = 0;
        figurine.rotation.z = 0;
    }
    
    // Добавляем аксессуары
    addAccessories(formData.accessories);
}

/**
 * Добавляет аксессуары к фигурке
 */
function addAccessories(accessories) {
    // Удаляем старые аксессуары
    const accessoriesToRemove = figurine.children.filter(child => child.userData.isAccessory);
    accessoriesToRemove.forEach(accessory => figurine.remove(accessory));
    
    accessories.forEach(accessory => {
        let accessoryMesh;
        
        switch(accessory) {
            case 'glasses':
                // Очки
                const glassesGroup = new THREE.Group();
                const glassGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16);
                const glassMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x000000,
                    metalness: 0.7,
                    roughness: 0.3
                });
                
                const leftGlass = new THREE.Mesh(glassGeometry, glassMaterial);
                leftGlass.position.set(-0.15, 1.45, 0.3);
                leftGlass.rotation.y = Math.PI / 4;
                glassesGroup.add(leftGlass);
                
                const rightGlass = leftGlass.clone();
                rightGlass.position.x = 0.15;
                glassesGroup.add(rightGlass);
                
                const bridgeGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.05);
                const bridge = new THREE.Mesh(bridgeGeometry, glassMaterial);
                bridge.position.set(0, 1.45, 0.3);
                glassesGroup.add(bridge);
                
                glassesGroup.userData.isAccessory = true;
                figurine.add(glassesGroup);
                break;
                
            case 'cap':
                // Кепка
                const capGeometry = new THREE.ConeGeometry(0.4, 0.3, 32);
                const capMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0xff6b6b,
                    roughness: 0.7
                });
                const cap = new THREE.Mesh(capGeometry, capMaterial);
                cap.position.set(0, 1.6, 0);
                cap.castShadow = true;
                cap.userData.isAccessory = true;
                figurine.add(cap);
                break;
                
            case 'laptop':
                // Ноутбук в руке
                const laptopGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.05);
                const laptopMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x333333,
                    metalness: 0.5
                });
                const laptop = new THREE.Mesh(laptopGeometry, laptopMaterial);
                laptop.position.set(-0.6, 0.4, 0);
                laptop.rotation.z = Math.PI / 6;
                laptop.castShadow = true;
                laptop.userData.isAccessory = true;
                figurine.add(laptop);
                break;
                
            case 'coffee':
                // Кружка кофе
                const cupGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.15, 16);
                const cupMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x8b4513,
                    roughness: 0.6
                });
                const cup = new THREE.Mesh(cupGeometry, cupMaterial);
                cup.position.set(0.6, 0.3, 0);
                cup.castShadow = true;
                cup.userData.isAccessory = true;
                figurine.add(cup);
                break;
                
            case 'beard':
                // Борода
                const beardGeometry = new THREE.SphereGeometry(0.25, 16, 16);
                const beardMaterial = new THREE.MeshStandardMaterial({ 
                    color: 0x8b6f47,
                    roughness: 0.8
                });
                const beard = new THREE.Mesh(beardGeometry, beardMaterial);
                beard.position.set(0, 1.0, 0.3);
                beard.scale.set(0.6, 0.4, 0.3);
                beard.castShadow = true;
                beard.userData.isAccessory = true;
                figurine.add(beard);
                break;
        }
    });
}

/**
 * Настраивает управление мышкой
 */
function setupMouseControls(canvas) {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        isRotating = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging && figurine) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            figurine.rotation.y += deltaX * 0.005;
            figurine.rotation.x += deltaY * 0.005;
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        isRotating = true;
    });
    
    canvas.addEventListener('mouseout', () => {
        isDragging = false;
        isRotating = true;
    });
    
    // Zoom с скроллом
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            camera.position.z -= 0.2;
        } else {
            camera.position.z += 0.2;
        }
        camera.position.z = Math.max(1.5, Math.min(6, camera.position.z));
    });
}

/**
 * Animation loop
 */
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // Auto-rotate когда не перетягиваем
    if (isRotating && figurine) {
        figurine.rotation.y += 0.005;
    }
    
    renderer.render(scene, camera);
}

/**
 * Останавливает анимацию
 */
function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

/**
 * Обновляет размер renderer при изменении окна
 */
function onWindowResize() {
    if (!canvas3d || !renderer) return;
    
    const canvas = document.getElementById('canvas3d');
    const width = canvas.parentElement.clientWidth;
    const height = 400;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
}

window.addEventListener('resize', onWindowResize);
