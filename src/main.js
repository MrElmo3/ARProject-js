import 'aframe';
import 'mind-ar/dist/mindar-image-aframe.prod.js';


document.addEventListener('DOMContentLoaded', () => {
	initARScene();
});

function initARScene() {
	const scene = document.createElement('a-scene');
	
	scene.setAttribute('mindar-image', {
		imageTargetSrc: '/ar/targets.mind'
	});
	scene.setAttribute('vr-mode-ui', {
		enabled: false
	});
	scene.setAttribute('device-orientation-permission-ui', {
		enabled: false
	});
	
	const assets = document.createElement('a-assets');
	
	// const cardImg = document.createElement('img');
	// cardImg.setAttribute('id', 'card');
	// cardImg.setAttribute('src', '../public/assets/Images/Identificator.jpeg');
	
	const plantModel = document.createElement('a-asset-item');
	plantModel.setAttribute('id', 'Plant');
	plantModel.setAttribute('src', 'Assets/Models/Plant/Plant.json');
	
	assets.appendChild(plantModel);
	scene.appendChild(assets);
	
	// Create camera
	const camera = document.createElement('a-camera');
	camera.setAttribute('position', {x: 0, y: 0, z: 0});
	camera.setAttribute('look-controls', {enabled: false});
	scene.appendChild(camera);
	
	// Create target entity with children
	const targetEntity = document.createElement('a-entity');
	targetEntity.setAttribute('mindar-image-target', {targetIndex: 0});
	
	const Model = document.createElement('a-gltf-model');
	Model.setAttribute('rotation', {x: 0, y: 0, z: 0});
	Model.setAttribute('position', {x: 0, y: 0, z: 0});
	Model.setAttribute('scale', {x: 0.1, y: 0.1, z: 0.1});
	Model.setAttribute('src', '#Plant');
	
	targetEntity.appendChild(Model);
	scene.appendChild(targetEntity);
	
	document.getElementById('body').appendChild(scene);
}

// Utility functions for dynamic content management
// const ARUtils = {
// 	// Add new target dynamically
// 	addTarget: function(targetIndex, content) {
// 		const scene = document.querySelector('a-scene');
// 		const newTarget = document.createElement('a-entity');
// 		newTarget.setAttribute('mindar-image-target', {targetIndex: targetIndex});
		
// 		if (content) {
// 			content.forEach(element => {
// 				newTarget.appendChild(element);
// 			});
// 		}
		
// 		scene.appendChild(newTarget);
// 		return newTarget;
// 	},
	
// 	// Remove target
// 	removeTarget: function(targetIndex) {
// 		const target = document.querySelector(`[mindar-image-target="targetIndex: ${targetIndex}"]`);
// 		if (target) {
// 			target.remove();
// 		}
// 	},
	
// 	// Update model source
// 	updateModelSource: function(modelId, newSrc) {
// 		const model = document.querySelector(`#${modelId}`);
// 		if (model) {
// 			model.setAttribute('src', newSrc);
// 		}
// 	}
// };

// Make utilities available globally
// window.ARUtils = ARUtils;
