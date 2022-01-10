import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { BufferGeometry } from "three";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Parametrs
 */
const parameters = {};
parameters.count = 50000;
parameters.size = 0.02;
parameters.radius = 6;
parameters.branches = 5;
parameters.spin = 0.8;
parameters.randomness = 2;
parameters.insideColor = "#400ee3";
parameters.outsideColor = "#de0d1b";
/**
 * constants
 */
let particleGeo = null;
let particleMat = null;
let particles = null;

const galaxyGenerator = () => {
  /////disposing of the previous data
  if (particles !== null) {
    particleGeo.dispose();
    particleMat.dispose();
    scene.remove(particles);
  }

  /**
   * Geometry
   */
  particleGeo = new BufferGeometry();

  const verData = new Float32Array(parameters.count * 3);
  const verColorData = new Float32Array(parameters.count * 3);
  const insideColor = new THREE.Color(parameters.insideColor);
  const outsideColor = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // positioning
    const radius = Math.pow(Math.random() * 0.85 + 0.15, 2) * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randx = Math.pow((Math.random() - 0.5) * parameters.randomness, 3);
    const randy = Math.pow((Math.random() - 0.5) * parameters.randomness, 3);
    const randz = Math.pow((Math.random() - 0.5) * parameters.randomness, 3);

    verData[i3] = Math.sin(branchAngle + spinAngle) * radius + randx;
    verData[i3 + 1] = randy;
    verData[i3 + 2] = Math.cos(branchAngle + spinAngle) * radius + randz;

    // adding color data
    const mixedColor = insideColor.clone();
    mixedColor.lerp(outsideColor, radius / parameters.radius);

    verColorData[i3] = mixedColor.r;
    verColorData[i3 + 1] = mixedColor.g;
    verColorData[i3 + 2] = mixedColor.b;
  }

  particleGeo.setAttribute("position", new THREE.BufferAttribute(verData, 3));
  particleGeo.setAttribute("color", new THREE.BufferAttribute(verColorData, 3));

  /**
   * Material
   */
  particleMat = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  /**
   * Points
   */
  particleMat.wireframe = true;
  particles = new THREE.Points(particleGeo, particleMat);

  scene.add(particles);
};
galaxyGenerator();

/**
 * gui
 */
gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "radius")
  .min(0.1)
  .max(10)
  .step(0.1)
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "branches")
  .min(1)
  .max(12)
  .step(1)
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.01)
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(3.5)
  .step(0.01)
  .onChange(galaxyGenerator);
gui.addColor(parameters, "insideColor").onChange(galaxyGenerator);
gui.addColor(parameters, "outsideColor").onChange(galaxyGenerator);

/**
 * gsap
 */

gsap.from(parameters, {
  radius: 0,
  randomness: 0,
  count: 100,
  delay: 0,
  duration: 10,
  onUpdate: () => {
    console.log(parameters.radius);
    galaxyGenerator();
  },
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 4;
camera.position.z = 4;
scene.add(camera);

gsap.from(camera.position, {
  x: 1,
  y: 1,
  z: 1,
  duration: 5,
  onUpdate: () => {
    camera.lookAt(new THREE.Vector3());
  },
  repeat: -1,
  yoyo: true,
});

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // spining the galazy
  particles.rotation.y = elapsedTime * 0.3;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
