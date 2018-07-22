"use strict"
import planetData from './content/planets.js'

const dump = document.querySelector('pre.dump')

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
camera.position.x = 21
camera.position.y = 15
camera.position.z = 200
camera.rotation.x = -0.59
camera.rotation.y = -0.46
camera.rotation.z = -0.38
scene.add(camera)


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
  saturnRings: loaders.texture.load('./textures/saturn_ring_alt.png'),
}


const universe = new THREE.Mesh(
  new THREE.SphereGeometry(5000, 100, 100),
  new THREE.MeshBasicMaterial({
    color: '#fff',
    map: textures.universe,
  })
)
universe.scale.x = -1

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(20, 15, 15),
  new THREE.MeshBasicMaterial({
    color: '#ff0',
    map: textures.sun,
  })
)

const planets = planetData.reduce((output, p) => {
  const { name, planet, layers } = p
  const { r , x, y, z } = planet
  let update = output

  const createPlanet = new THREE.Mesh(
    new THREE.SphereGeometry(r, 50, 50),
    new THREE.MeshPhongMaterial({
      color: p.planet.color,
      map: loaders.texture.load(`./textures/${p.planet.map}`),
      bumpMap: p.planet.bumpMap ? loaders.texture.load(`./textures/${p.planet.bumpMap}`) : null ,
      alphaMap: p.planet.alphaMap || null,
      bumpScale: p.planet.bumpScale || 0,
      transparent: p.planet.transparent || false,
      opacity: p.planet.opacity || 1,
      shininess: p.planet.shininess || 0,
    })
  )

  let createLayers = !layers ? null : layers.reduce((allLayers, l) => {
    console.log('this layer', l)
    let layerOutput = allLayers
    layerOutput[l.name] = new THREE.Mesh(
      new THREE.SphereGeometry(r * l.r, 50, 50),
      new THREE.MeshPhongMaterial({
        color: l.color,
        map: l.map ? loaders.texture.load(`./textures/${l.map}`) : null,
        alphaMap: l.alphaMap ? loaders.texture.load(`./textures/${l.alphaMap}`) : null,
        bumpMap: l.bumpMap ? loaders.texture.load(`./textures/${l.bumpMap}`) : null ,
        bumpScale: l.bumpScale || 0,
        transparent: l.transparent || false,
        opacity: l.opacity || 1,
        shininess: l.shininess || 0,
      })
    )
    return layerOutput
  }, {})

  console.log({ createLayers })

  createPlanet.position.set(x, y, z)
  update[name] = {
    planet: createPlanet,
    layers : createLayers,
  }

  return update
}, {})

console.log({ planets })


Object.keys(planets).forEach(k => {
  const p = planets[k]
  scene.add(p.planet)
  if (p.layers) {
    const { layers } = p
    console.log({ layers })
    Object.keys(layers).forEach(k => {
      console.log(layers[k])
      p.planet.add(layers[k])
    })
  }
})

scene.add(universe)
scene.add(sun)

const controls = new THREE.OrbitControls(camera)

function update () {
  const cameraInfo = {
    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    },
    rotation: {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z,
    },
  }

  dump.innerText = JSON.stringify(cameraInfo, 'utf-8', 2)
  renderer.render(scene, camera)
  requestAnimationFrame(update)
  sun.rotation.y += 0.001
  
  Object.keys(planets).forEach(k => {
    const planet = planetData.filter(p => p.name === k)[0].planet
    planets[k].planet.rotation.y += planet.spin
    if (planet.orbit >= 360) planet.orbit = 0

    planet.orbit += planet.orbitSpeed
    planets[k].planet.position.x = planet.x * Math.sin(planet.orbit)
    planets[k].planet.position.z = planet.x * Math.cos(planet.orbit)
  })

}

update()

