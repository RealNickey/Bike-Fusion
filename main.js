import * as THREE from 'three';
import './style.css';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let mixer;

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


let carModel; // Variable to store the loaded car model
let loadedShowroom = null; // Variable to store the loaded showroom
const loader = new GLTFLoader();
const showroom = new GLTFLoader();
const loaderElement = document.getElementById("meteor");

// Function to hide the loader
function hideLoader() {
  loaderElement.style.display = "none";
}

// Load 3D car model
loader.load(
  "assets/car.glb",
  function (gltf) {
    carModel = gltf.scene;
    carModel.position.y = -1; //object position change
    carModel.rotation.y = Math.PI / 4; // Set initial rotation (45 degrees)
    scene.add(carModel);
    mixer = new THREE.AnimationMixer(carModel);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, 'AllActions');
    const action = mixer.clipAction(clip);
    action.play();
    if (loadedShowroom) hideLoader(); // Hide loader if showroom is already loaded
  },
  undefined,
  function (error) {
    console.error(error);
  }
);


// Load showroom background
showroom.load('assets/showroom.glb', function (gltf) {
  gltf.scene.position.y = -1;
  scene.add(gltf.scene);
  loadedShowroom = gltf; // Store the loaded object in the constant
  if (carModel) hideLoader(); // Hide loader if car model is already loaded
}, undefined, function (error) {
  console.error(error);
});

// Animation
const animation = new THREE.AnimationClip('car_animation', 5, [
  new THREE.KeyframeTrack('.scale', [0, 1], [1, 2]),
]);

let previousScrollTop = 0; // Variable to store the previous scroll position

// Scroll Animation
function moveCamera() {
  const currentScrollTop = document.body.getBoundingClientRect().top;
  const scrollDirection = currentScrollTop - previousScrollTop;

  if (carModel) {
    if (scrollDirection < 0) {
      // Scrolling down
      carModel.rotation.y += 0.075;
      carModel.position.z += 0.2;
    } else if (scrollDirection > 0) {
      // Scrolling up
      carModel.rotation.y -= 0.075;
      carModel.position.z -= 0.2;
    }
  }

  previousScrollTop = currentScrollTop; // Update the previous scroll position
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

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
      mixer.update(clock.getDelta()); // Update the animation mixer if it is defined
  }
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  renderer.render(scene, camera);
}


animate();

const start = new Date().getTime();

const originPosition = { x: 0, y: 0 };

const last = {
  starTimestamp: start,
  starPosition: originPosition,
  mousePosition: originPosition
};

const config = {
  starAnimationDuration: 1500,
  minimumTimeBetweenStars: 250,
  minimumDistanceBetweenStars: 75,
  glowDuration: 75,
  maximumGlowPointSpacing: 10,
  colors: ["249, 146, 253", "252, 254, 255"," 0, 255, 255","255, 255, 0","0,150,0"],
  sizes: ["4.5rem", "3rem", "2rem"],
  animations: ["fall-1", "fall-2", "fall-3"]
};

let count = 0;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
      selectRandom = items => items[rand(0, items.length - 1)];

const withUnit = (value, unit) => `${value}${unit}`,
      px = value => withUnit(value, "px"),
      ms = value => withUnit(value, "ms");

const calcDistance = (a, b) => {
  const diffX = b.x - a.x,
        diffY = b.y - a.y;
  
  return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
};

const calcElapsedTime = (start, end) => end - start;

const appendElement = element => document.body.appendChild(element),
      removeElement = (element, delay) => setTimeout(() => document.body.removeChild(element), delay);

const createStar = position => {
  console.log("Creating star at position:", position);
  
  const star = document.createElement("i"),
        color = selectRandom(config.colors);
  
  star.className = "star fa-solid fa-star"; // Use a valid FontAwesome icon class
  
  star.style.left = px(position.x);
  star.style.top = px(position.y);
  star.style.fontSize = selectRandom(config.sizes);
  star.style.color = `rgb(${color})`;
  star.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.5)`;
  star.style.animationName = config.animations[count++ % 3];
  star.style.animationDuration = ms(config.starAnimationDuration);
  
  appendElement(star);
  console.log("Star appended:", star);

  removeElement(star, config.starAnimationDuration);
};

const createGlowPoint = position => {
  const glow = document.createElement("div");
  
  glow.className = "glow-point";
  
  glow.style.left = px(position.x);
  glow.style.top = px(position.y);
  
  appendElement(glow);
  
  removeElement(glow, config.glowDuration);
};

const determinePointQuantity = distance => Math.max(
  Math.floor(distance / config.maximumGlowPointSpacing),
  1
);

const createGlow = (last, current) => {
  const distance = calcDistance(last, current),
        quantity = determinePointQuantity(distance);
  
  const dx = (current.x - last.x) / quantity,
        dy = (current.y - last.y) / quantity;
  
  Array.from(Array(quantity)).forEach((_, index) => { 
    const x = last.x + dx * index, 
          y = last.y + dy * index;
    
    createGlowPoint({ x, y });
  });
};

const updateLastStar = position => {
  last.starTimestamp = new Date().getTime();
  last.starPosition = position;
};

const updateLastMousePosition = position => last.mousePosition = position;

const adjustLastMousePosition = position => {
  if (last.mousePosition.x === 0 && last.mousePosition.y === 0) {
    last.mousePosition = position;
  }
};

const handleOnMove = e => {
  const mousePosition = { x: e.clientX, y: e.clientY };
  
  adjustLastMousePosition(mousePosition);
  
  const now = new Date().getTime(),
        hasMovedFarEnough = calcDistance(last.starPosition, mousePosition) >= config.minimumDistanceBetweenStars,
        hasBeenLongEnough = calcElapsedTime(last.starTimestamp, now) > config.minimumTimeBetweenStars;
  
  if (hasMovedFarEnough || hasBeenLongEnough) {
    createStar(mousePosition);
    updateLastStar(mousePosition);
  }
  
  createGlow(last.mousePosition, mousePosition);
  updateLastMousePosition(mousePosition);
};

window.onmousemove = e => handleOnMove(e);
window.ontouchmove = e => handleOnMove(e.touches[0]);
document.body.onmouseleave = () => updateLastMousePosition(originPosition);