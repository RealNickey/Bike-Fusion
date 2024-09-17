import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

//add background image
// const loader2 = new THREE.TextureLoader();
// loader2.load('assets/backdrop.jpg	', function (texture) {
// 	scene.background = texture;
// });

// Load 3D car model
const loader = new GLTFLoader();

loader.load('assets/car.glb', function (gltf) {
	scene.add(gltf.scene);
}, undefined, function (error) {
	console.error(error);
});

// Load HDRi background
const loader1 = new GLTFLoader();

loader1.load('assets/Beachscape 1.glb', function (gltf) {
	scene.add(gltf.scene);
}, undefined, function (error) {
	console.error(error);
});

// Animation
const animation = new THREE.AnimationClip('car_animation', 5, [
	new THREE.KeyframeTrack('.scale', [0, 1], [1, 2]),
  ]); 
  

// Add lights to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

camera.position.y = 1;
camera.position.z = 5;

function animate() {
	requestAnimationFrame(animate);
	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	renderer.render(scene, camera);
}

animate();