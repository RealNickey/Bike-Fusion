import * as THREE from 'three';
import './style.css';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
  });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 2;
controls.enableZoom=false;

// Load 3D car model
const car = new GLTFLoader();

car.load('assets/car.glb', function (gltf) {
	gltf.scene.position.y=-1; //object position change
	scene.add(gltf.scene);
}, undefined, function (error) {
	console.error(error);
});

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const torus = new THREE.Mesh(geometry, material);

// Load showroom background
const showroom = new GLTFLoader();
let loadedShowroom = null;

showroom.load('assets/showroom.glb', function (gltf) {
	gltf.scene.position.y = -1;
	scene.add(gltf.scene);
	loadedShowroom = gltf; // Store the loaded object in the constant
}, undefined, function (error) {
	console.error(error);
});

// Later in your code, you can use loadedShowroom
// Example: console.log(loadedShowroom);

// Animation
const animation = new THREE.AnimationClip('car_animation', 5, [
	new THREE.KeyframeTrack('.scale', [0, 1], [1, 2]),
  ]);
  
 // Scroll Animation

function moveCamera() {
	const t = document.body.getBoundingClientRect().top;
	loadedShowroom.rotation.x += 0.05;
	loadedShowroom.rotation.y += 0.075;
	loadedShowroom.rotation.z += 0.05;
  
  }
  
  document.body.onscroll = moveCamera;
  moveCamera();

// Add lights to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff); // soft white light
scene.add(ambientLight);

camera.position.y = 1;
camera.position.z = 4;



//sound
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'src/sound.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
	
	setTimeout(() => {
       sound.stop(); 
    }, 4000);
});

function animate() {
	requestAnimationFrame(animate);
	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	renderer.render(scene, camera);
}

animate();