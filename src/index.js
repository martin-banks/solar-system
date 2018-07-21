"use strict"
// import makeApp from './scripts/makeapp.js'
// makeApp()

function angle (degree) {
  return degree * (Math.PI / 180)
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
)
scene.add(camera)
camera.position.z = 150
camera.position.y = 50
camera.rotation.x = -20

const lights = {
  ambient: new THREE.AmbientLight('#fff', 0.2)
}
scene.add(lights.ambient)

const light = new THREE.PointLight('#fff', 1)
light.position.set(0, 0, 0)
light.castShadow = true
scene.add(light)

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
// default THREE.PCFShadowMap
renderer.shadowMap.type = THREE.PCFShadowMap 
document.body.appendChild(renderer.domElement)

const loaders = {
  texture: new THREE.TextureLoader()
}
const textures = {
  universe: new THREE.TextureLoader().load('./textures/stars_milky_way_2k.jpg'),
  sun: loaders.texture.load('./textures/sun_2k.jpg'),
  mercury: loaders.texture.load('./textures/mercury_2k.jpg'),
  venus: loaders.texture.load('./textures/venus_2k.jpg'),
  saturn: loaders.texture.load('./textures/saturn_2k.jpg'),
  saturnRings: loaders.texture.load('./textures/saturn_ring_2k.png'),
}


const universe = new THREE.Mesh(
  new THREE.SphereGeometry(1000, 100, 100),
  new THREE.MeshBasicMaterial({
    color: '#333',
    map: textures.universe,
  })
)
universe.scale.x = -1

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(20, 15, 15),
  new THREE.MeshBasicMaterial({
    color: '#ff0',
    map: textures.sun,
    // bumpMap: textures.sun,
    // bumpSize: 1
  })
)

const mercury = new THREE.Mesh(
  new THREE.SphereBufferGeometry(5, 15, 15),
  new THREE.MeshPhongMaterial({
    color: '#fff',
    shininess: 0,
    map: textures.mercury,
    bumpMap: textures.mercury,
    bumpScale: 0.4,
  })
)

const venus = new THREE.Mesh(
  new THREE.SphereBufferGeometry(7, 15, 15),
  new THREE.MeshPhongMaterial({
    color: '#fff',
    shininess: 0,
    map: textures.venus,
    bumpMap: textures.venus,
    bumpScale: 0.4,
  })
)

const saturn = new THREE.Mesh(
  new THREE.SphereBufferGeometry(15, 20, 20),
  new THREE.MeshPhongMaterial({
    color: '#ddd',
    map: textures.saturn,
  })
)
saturn.castShadow = true

const ringGeometry = new THREE.RingBufferGeometry(20, 40, 100, 100, Math.PI * 2)
const saturnRings = new THREE.Mesh(
  ringGeometry,
  new THREE.MeshPhongMaterial({
    // color: 0xffff00,
    map: textures.saturnRings,
    side: THREE.DoubleSide,
  })
)
saturnRings.receiveShadow = true


scene.add(universe)
scene.add(sun)
scene.add(mercury)
scene.add(venus)
scene.add(saturn)
saturn.add(saturnRings)

mercury.position.x = 40
venus.position.x = 100
saturn.position.x = 150
// saturnRings.position.x = 150
saturnRings.rotation.x = angle(60)



const controls = new THREE.OrbitControls(camera)


let orbit = 0
const orbits = {
  venus: 0,
  saturn: 0,
}
let direction = 1

function update () {
  renderer.render(scene, camera)
  requestAnimationFrame(update)
  sun.rotation.y += 0.001
  mercury.rotation.y += 0.003
  venus.rotation.y += 0.003
  saturn.rotation.y += 0.003

  if (orbit >= 360) {
    orbit = 0
    orbits.venus = 0
    orbits.saturn = 0
  } 
  orbit += 0.01
  orbits.venus += 0.002
  orbits.saturn += 0.001

  mercury.position.x = 50 * Math.sin(orbit)
  mercury.position.z = 50 * Math.cos(orbit)

  venus.position.x = 100 * Math.sin(orbits.venus)
  venus.position.z = 100 * Math.cos(orbits.venus)

  saturn.position.x = 150 * Math.sin(orbits.saturn)
  saturn.position.z = 150 * Math.cos(orbits.saturn)
}

update()

