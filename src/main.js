import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';

const CHEMICAL_ELEMENTS = {
	'Agua': ['H', 'O'],
	'Metano': ['C', 'H'],
	'Dióxido de Carbono': ['C', 'O'],
};

let gameState = {
	timeRemaining: 30,
	element: 'Agua',
	targetsCurrentlyVisible: new Set(), 
	gameActive: false,
	gameEnded: false,
	timer: null,
	requiredTargets: 0,
	currentElementIndex: 0,
	totalScore: 0,
	elementsArray: Object.keys(CHEMICAL_ELEMENTS),
	totalElements: Object.keys(CHEMICAL_ELEMENTS).length
};

document.addEventListener('DOMContentLoaded', () => {
	initializeGame();
	createGameUI();
	startCurrentElement();
});

function initializeGame() {
	gameState.elementsArray = Object.keys(CHEMICAL_ELEMENTS);
	gameState.totalElements = gameState.elementsArray.length;
	gameState.currentElementIndex = 0;
	gameState.totalScore = 0;
	selectCurrentElement();
}

function selectCurrentElement() {
	if (gameState.currentElementIndex < gameState.elementsArray.length) {
		const currentElement = gameState.elementsArray[gameState.currentElementIndex];
		gameState.element = currentElement;
		gameState.requiredTargets = CHEMICAL_ELEMENTS[currentElement].length;
	}
}

/**
 * Selecciona un elemento específico
 * @param {string} elementName - Nombre del elemento químico
 */
function selectElement(elementName) {
	if (CHEMICAL_ELEMENTS[elementName]) {
		gameState.element = elementName;
		gameState.requiredTargets = CHEMICAL_ELEMENTS[elementName].length;
	}
}

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
		min-width: 250px;
	`;
	
	gameUI.innerHTML = `
		<div id="timer">Tiempo: <span id="time-display">30</span>s</div>
		<div id="element">Elemento: <span id="element-display">${gameState.element}</span></div>
		<div id="progress">Visibles: <span id="found-count">0</span>/${gameState.requiredTargets}</div>
		<div id="score">Score: <span id="score-display">${gameState.totalScore}</span>/${gameState.totalElements}</div>
		<div style="font-size: 14px; color: #cccccc; margin-top: 5px;">Muestra todos los átomos a la vez</div>
		<div id="game-status"></div>
	`;
	
	document.body.appendChild(gameUI);
}

/**
 * Obtiene la fórmula química en formato legible
 * @param {string} elementName - Nombre del elemento
 * @returns {string} Fórmula química
 */
function getChemicalFormula(elementName) {
	const formulas = {
		'Agua': 'H₂O',
		'Metano': 'CH₄',
		'Dióxido de Carbono': 'CO₂',
		'Amoníaco': 'NH₃',
		'Metanol': 'CH₃OH'
	};
	return formulas[elementName] || '';
}

/**
 * Cambia el elemento químico y reinicia el juego
 * @param {string} newElement - Nuevo elemento químico
 */
function changeElement(newElement) {
	if (!gameState.gameActive) {
		selectElement(newElement);
		
		// Limpiar la escena actual
		const existingScene = document.querySelector('a-scene');
		if (existingScene) {
			existingScene.remove();
		}
		
		// Actualizar UI
		updateElementUI();
		
		// Crear nueva escena y reiniciar
		createSceneForCurrentElement();
		startGame();
	}
}

/**
 * Actualiza la UI con el elemento actual
 */
function updateElementUI() {
	document.getElementById('element-display').textContent = gameState.element;
	document.getElementById('score-display').textContent = gameState.totalScore;
	document.getElementById('game-status').innerHTML = '';
	
	// Actualizar el contador de progreso
	const progressElement = document.getElementById('progress');
	progressElement.innerHTML = `Visibles: <span id="found-count">0</span>/${gameState.requiredTargets}`;
}

/**
 * Crea la escena AR para el elemento químico actual
 */
function createSceneForCurrentElement() {
	const components = CHEMICAL_ELEMENTS[gameState.element];
	if (components) {
		createSceneFor(components);
	}
}

function startCurrentElement() {
	selectCurrentElement();
	updateElementUI();
	createSceneForCurrentElement();
	startGame();
}

function startGame() {
	gameState.gameActive = true;
	gameState.timeRemaining = 30;
	gameState.targetsCurrentlyVisible.clear(); 
	gameState.gameEnded = false;
	
	// Actualizar el contador de progreso
	document.getElementById('found-count').textContent = gameState.targetsCurrentlyVisible.size;
	
	updateUI();
	
	if (gameState.timer) {
		clearInterval(gameState.timer);
	}
	
	gameState.timer = setInterval(() => {
		gameState.timeRemaining--;
		updateUI();
		
		if (gameState.timeRemaining <= 0) {
			endCurrentElement(false); // Tiempo agotado
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
 * Termina el elemento actual y avanza al siguiente
 * @param {boolean} won - Si el jugador completó este elemento
 */
function endCurrentElement(won) {
	if (gameState.gameEnded) return;
	
	gameState.gameActive = false;
	gameState.gameEnded = true;
	clearInterval(gameState.timer);
	
	// Actualizar score si ganó
	if (won) {
		gameState.totalScore++;
	}
	
	const statusElement = document.getElementById('game-status');
	if (won) {
		statusElement.innerHTML = '<div style="color: #44ff44; font-weight: bold;">¡COMPLETADO! 🎉</div>';
	} else {
		statusElement.innerHTML = '<div style="color: #ff4444; font-weight: bold;">TIEMPO AGOTADO ⏰</div>';
	}
	
	// Actualizar score display
	document.getElementById('score-display').textContent = gameState.totalScore;
	
	// Avanzar al siguiente elemento después de 2 segundos
	setTimeout(() => {
		gameState.currentElementIndex++;
		
		if (gameState.currentElementIndex >= gameState.totalElements) {
			// Terminar juego completo
			showFinalScore();
		} else {
			// Continuar con el siguiente elemento
			proceedToNextElement();
		}
	}, 2000);
}

/**
 * Procede al siguiente elemento
 */
function proceedToNextElement() {
	// Limpiar la escena actual
	const existingScene = document.querySelector('a-scene');
	if (existingScene) {
		existingScene.remove();
	}
	
	// Iniciar el siguiente elemento
	startCurrentElement();
}

/**
 * Muestra el score final
 */
function showFinalScore() {
	const statusElement = document.getElementById('game-status');
	const percentage = Math.round((gameState.totalScore / gameState.totalElements) * 100);
	
	let message = '';
	let color = '';
	
	if (percentage === 100) {
		message = '¡PERFECTO! 🏆';
		color = '#FFD700';
	} else if (percentage >= 80) {
		message = '¡EXCELENTE! 🌟';
		color = '#44ff44';
	} else if (percentage >= 60) {
		message = '¡BIEN HECHO! 👍';
		color = '#ffaa44';
	} else {
		message = '¡SIGUE PRACTICANDO! 💪';
		color = '#ff4444';
	}
	
	statusElement.innerHTML = `
		<div style="color: ${color}; font-weight: bold; font-size: 20px; text-align: center;">
			${message}<br>
			SCORE FINAL: ${gameState.totalScore}/${gameState.totalElements}<br>
			(${percentage}%)
		</div>
	`;
	
	// Agregar botón de reinicio
	setTimeout(() => {
		statusElement.innerHTML += `
			<button id="restart-btn" style="
				margin-top: 15px; 
				padding: 10px 20px; 
				background: #4CAF50; 
				color: white; 
				border: none; 
				border-radius: 5px; 
				cursor: pointer;
				font-size: 16px;
				width: 100%;
			">Jugar de nuevo</button>
		`;
		document.getElementById('restart-btn').addEventListener('click', restartCompleteGame);
	}, 2000);
}

/**
 * Reinicia todo el juego desde el principio
 */
function restartCompleteGame() {
	// Limpiar la escena actual
	const existingScene = document.querySelector('a-scene');
	if (existingScene) {
		existingScene.remove();
	}
	
	// Reinicializar el estado del juego
	initializeGame();
	updateElementUI();
	startCurrentElement();
}

/**
 * Reinicia solo el elemento actual (función legacy)
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
	
	// Verificar si se han encontrado todos los targets requeridos
	if (gameState.targetsCurrentlyVisible.size >= gameState.requiredTargets) {
		endCurrentElement(true); // Elemento completado exitosamente
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
 * @param {Array} elements - Array de elementos (ej: ['H', 'H', 'O'])
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
		imageTargetSrc: '/ar/elements.mind',
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
		'O': -0.1,
		'C': 0,
		'N': 0
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
		'O': {x: 0.12, y: 0.12, z: 0.12},
		'C': {x: 0.10, y: 0.10, z: 0.10},
		'N': {x: 0.09, y: 0.09, z: 0.09}
	};
	return scales[element] || {x: 0.1, y: 0.1, z: 0.1};
}