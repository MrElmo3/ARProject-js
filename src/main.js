import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';

let gameState = {
	timeRemaining: 30,
	targetsCurrentlyVisible: new Set(), 
	gameActive: false,
	gameEnded: false,
	timer: null
};

document.addEventListener('DOMContentLoaded', () => {
	createGameUI();
	createSceneFor(['Plant', 'Plant2']);
	startGame();
});


function createGameUI() {
	const gameUI = document.createElement('div');
	gameUI.id = 'game-ui';
	gameUI.style.cssText = `
		position: fixed;
		top: 20px;
		left: 20px;
		z-index: 1000;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 15px 20px;
		border-radius: 10px;
		font-family: Arial, sans-serif;
		font-size: 18px;
		min-width: 200px;
	`;
	
	gameUI.innerHTML = `
		<div id="timer">Tiempo: <span id="time-display">30</span>s</div>
		<div id="progress">Visibles: <span id="found-count">0</span>/2</div>
		<div style="font-size: 14px; color: #cccccc; margin-top: 5px;">Muestra ambos objetos a la vez</div>
		<div id="game-status"></div>
	`;
	
	document.body.appendChild(gameUI);
}

function startGame() {
	gameState.gameActive = true;
	gameState.timeRemaining = 30;
	gameState.targetsCurrentlyVisible.clear(); 
	gameState.gameEnded = false;
	
	updateUI();
	
	gameState.timer = setInterval(() => {
		gameState.timeRemaining--;
		updateUI();
		
		if (gameState.timeRemaining <= 0) {
			endGame(false); 
		}
	}, 1000);
}

function updateUI() {
	document.getElementById('time-display').textContent = gameState.timeRemaining;
	document.getElementById('found-count').textContent = gameState.targetsCurrentlyVisible.size;
	
	const timerElement = document.getElementById('timer');
	if (gameState.timeRemaining <= 10) {
		timerElement.style.color = '#ff4444';
	} else if (gameState.timeRemaining <= 20) {
		timerElement.style.color = '#ffaa44';
	} else {
		timerElement.style.color = 'white';
	}
}

/**
 * Termina el juego
 * @param {boolean} won - Si el jugador ganó o perdió
 */
function endGame(won) {
	if (gameState.gameEnded) return;
	
	gameState.gameActive = false;
	gameState.gameEnded = true;
	clearInterval(gameState.timer);
	
	const statusElement = document.getElementById('game-status');
	if (won) {
		statusElement.innerHTML = '<div style="color: #44ff44; font-weight: bold;">¡GANASTE! 🎉</div>';
	} else {
		statusElement.innerHTML = '<div style="color: #ff4444; font-weight: bold;">PERDISTE 😔</div>';
	}
	
	// Agregar botón de reinicio
	setTimeout(() => {
		statusElement.innerHTML += '<button id="restart-btn" style="margin-top: 10px; padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Jugar de nuevo</button>';
		document.getElementById('restart-btn').addEventListener('click', restartGame);
	}, 2000);
}

/**
 * Reinicia el juego
 */
function restartGame() {
	document.getElementById('game-status').innerHTML = '';
	startGame();
}

/**
 * Maneja cuando se encuentra un target
 * @param {number} targetIndex - Índice del target encontrado
 */
function onTargetFound(targetIndex) {
	if (!gameState.gameActive) return;
	
	gameState.targetsCurrentlyVisible.add(targetIndex);
	updateUI();
	
	if (gameState.targetsCurrentlyVisible.size >= 2) {
		endGame(true); 
	}
}

/**
 * Maneja cuando se pierde un target
 * @param {number} targetIndex - Índice del target perdido
 */
function onTargetLost(targetIndex) {
	if (!gameState.gameActive) return;
	
	gameState.targetsCurrentlyVisible.delete(targetIndex);
	updateUI();
}

/**
 * Función principal para crear una escena AR escalable
 * @param {Array} elements - Array de elementos (ej: ['Plant', 'Plant2'])
 */
function createSceneFor(elements) {
	const uniqueElements = [...new Set(elements)]; 
	const maxTrack = elements.length; 
	
	const scene = createScene(maxTrack);
	const assets = createAssets(uniqueElements);
	const entities = createEntities(elements, uniqueElements);
	
	scene.appendChild(assets);
	entities.forEach((entity, index) => {
		entity.addEventListener('targetFound', () => onTargetFound(index));
		entity.addEventListener('targetLost', () => onTargetLost(index));
		scene.appendChild(entity);
	});
	scene.appendChild(createCamera());
	
	document.getElementById('body').appendChild(scene);
}

/**
 * Crea el elemento a-scene con sus atributos
 * @param {number} maxTrack - Número máximo de targets a trackear
 * @returns {HTMLElement} Elemento a-scene configurado
 */
function createScene(maxTrack) {
	const scene = document.createElement('a-scene');
	
	scene.setAttribute('mindar-image', {
		imageTargetSrc: '/ar/targets2.mind',
		maxTrack: maxTrack
	});
	scene.setAttribute('vr-mode-ui', {
		enabled: false
	});
	scene.setAttribute('device-orientation-permission-ui', {
		enabled: false
	});
	
	return scene;
}

/**
 * Crea el contenedor a-assets con todos los a-asset-item únicos
 * @param {Array} uniqueElements - Array de elementos únicos
 * @returns {HTMLElement} Elemento a-assets con todos los asset-items
 */
function createAssets(uniqueElements) {
	const assets = document.createElement('a-assets');
	
	uniqueElements.forEach(element => {
		const assetItem = document.createElement('a-asset-item');
		assetItem.setAttribute('id', element);
		assetItem.setAttribute('src', `Assets/Models/${element}/${element}.json`);
		assets.appendChild(assetItem);
	});
	
	return assets;
}

/**
 * Crea todos los entities para cada elemento del array
 * @param {Array} elements - Array completo de elementos
 * @param {Array} uniqueElements - Array de elementos únicos
 * @returns {Array} Array de elementos a-entity configurados
 */
function createEntities(elements, uniqueElements) {
	const entities = [];
	
	elements.forEach((element, index) => {
		const entity = createSingleEntity(element, index);
		entities.push(entity);
	});
	
	return entities;
}

/**
 * Crea un solo entity con su modelo
 * @param {string} element - Nombre del elemento
 * @param {number} targetIndex - Índice del target
 * @returns {HTMLElement} Elemento a-entity configurado
 */
function createSingleEntity(element, targetIndex) {
	const targetEntity = document.createElement('a-entity');
	targetEntity.setAttribute('mindar-image-target', {targetIndex: targetIndex});
	
	const modelEntity = document.createElement('a-gltf-model');
	modelEntity.setAttribute('rotation', {x: 0, y: 0, z: 0});
	modelEntity.setAttribute('position', {x: 0, y: getPositionY(element), z: 0});
	modelEntity.setAttribute('scale', getScale(element));
	modelEntity.setAttribute('src', `#${element}`);
	
	targetEntity.appendChild(modelEntity);
	return targetEntity;
}

/**
 * Crea la cámara
 * @returns {HTMLElement} Elemento a-camera configurado
 */
function createCamera() {
	const camera = document.createElement('a-camera');
	camera.setAttribute('position', {x: 0, y: 0, z: 0});
	camera.setAttribute('look-controls', {enabled: false});
	return camera;
}

/**
 * Obtiene la posición Y basada en el elemento
 * @param {string} element - Nombre del elemento
 * @returns {number} Posición Y
 */
function getPositionY(element) {
	const positions = {
		'Plant': 0,
		'Plant2': 0,
		'Words': -0.25,
		'H': 0,
		'O': -0.1
	};
	return positions[element] || 0;
}

/**
 * Obtiene la escala basada en el elemento
 * @param {string} element - Nombre del elemento
 * @returns {Object} Objeto con x, y, z para la escala
 */
function getScale(element) {
	const scales = {
		'Plant': {x: 0.1, y: 0.1, z: 0.1},
		'Plant2': {x: 0.1, y: 0.1, z: 0.1},
		'Words': {x: 0.05, y: 0.05, z: 0.05},
		'H': {x: 0.08, y: 0.08, z: 0.08},
		'O': {x: 0.12, y: 0.12, z: 0.12}
	};
	return scales[element] || {x: 0.1, y: 0.1, z: 0.1};
}