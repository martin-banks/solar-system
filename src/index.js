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
  100000
)
scene.add(camera)
camera.position.z = 150
camera.position.y = 50
camera.rotation.x = -20

const lights = {
  ambient: new THREE.AmbientLight('#fff', 0.1),
  sun: new THREE.PointLight('#fff', 1),
}

scene.add(lights.ambient)

lights.sun.position.set(0, 0, 0)
lights.sun.castShadow = true
scene.add(lights.sun)

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
  universe: loaders.texture.load('./textures/stars_milky_way_2k.jpg'),
  sun: loaders.texture.load('./textures/sun_2k.jpg'),
  mercury: loaders.texture.load('./textures/mercury_2k.jpg'),
  venus: loaders.texture.load('./textures/venus_2k.jpg'),
  earth: {
    land: loaders.texture.load('./textures/earth_daymap_2k.jpg'),
    clouds: loaders.texture.load('./textures/earth_clouds_2k.jpg'),
  },
  saturn: loaders.texture.load('./textures/saturn_2k.jpg'),
  saturnRings: loaders.texture.load('./textures/saturn_ring_2k.png'),
}


const universe = new THREE.Mesh(
  new THREE.SphereGeometry(5000, 100, 100),
  new THREE.MeshBasicMaterial({
    color: '#fff',
    map: textures.universe,
  })
)
// universe.position.x = -50
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

const earth = {
  land: new THREE.Mesh(
    new THREE.SphereBufferGeometry(11, 20, 20),
    new THREE.MeshPhongMaterial({
      color: '#fff',
      map: textures.earth.land,
    })
  ),
  cloud: new THREE.Mesh(
    new THREE.SphereBufferGeometry(11.5, 20, 20),
    new THREE.MeshPhongMaterial({
      color: '#fff',
      alphaMap: textures.earth.clouds,
      transparent: true,
      // opacity: 0.1
    })
  ),
}






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
    transparent: true,
    opacity: 1
  })
)
saturnRings.receiveShadow = true


scene.add(universe)
scene.add(sun)
scene.add(mercury)
scene.add(venus)
scene.add(saturn)
scene.add(earth.land)
earth.land.add(earth.cloud)
saturn.add(saturnRings)

mercury.position.x = 40
venus.position.x = 100
earth.land.position.x = 120
saturn.position.x = 150
// saturnRings.position.x = 150
saturnRings.rotation.x = angle(60)



const controls = new THREE.OrbitControls(camera)


let orbit = 0
const orbits = {
  venus: 0,
  saturn: 1,
  earth: 3
}
let direction = 1

function update () {
  renderer.render(scene, camera)
  requestAnimationFrame(update)
  sun.rotation.y += 0.001
  mercury.rotation.y += 0.003
  venus.rotation.y += 0.003
  earth.land.rotation.y += 0.0005
  earth.cloud.rotation.y -= 0.003
  earth.cloud.rotation.y += 0.001
  saturn.rotation.y += 0.003

  if (orbit >= 360) {
    orbit = 0
    orbits.venus = 0
    orbits.saturn = 0
  } 
  orbit += 0.01
  orbits.venus += 0.002
  orbits.earth += 0.001
  orbits.saturn += 0.001

  mercury.position.x = 50 * Math.sin(orbit)
  mercury.position.z = 50 * Math.cos(orbit)

  venus.position.x = 100 * Math.sin(orbits.venus)
  venus.position.z = 100 * Math.cos(orbits.venus)

  earth.land.position.x = 120 * Math.sin(orbits.earth)
  earth.land.position.z = 120 * Math.cos(orbits.earth)

  saturn.position.x = 150 * Math.sin(orbits.saturn)
  saturn.position.z = 150 * Math.cos(orbits.saturn)
}

update()

