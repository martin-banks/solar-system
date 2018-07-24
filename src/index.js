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
  ambient: new THREE.AmbientLight('#fff', 0.07),
  sun: new THREE.PointLight('#fff', 1, 350, 1),
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
  new THREE.SphereGeometry(20, 50, 50),
  new THREE.MeshBasicMaterial({
    color: '#ff0',
    map: textures.sun,
  })
)

const planets = planetData.reduce((output, p) => {
  const { name, planet, layers, rings, satelites } = p
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

  const createLayers = !layers ? null : layers.reduce((allLayers, l) => {
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

  const createRings = !rings ? null : rings.reduce((allRings, ring, i) => {
    const { inner, outer, map } = ring
    const ringOutput = allRings
    const newRing = new THREE.Mesh(
      new THREE.XRingGeometry(r * inner, r * outer, 100),
      new THREE.MeshBasicMaterial({
        color: ring.color,
        map: ring.map ? loaders.texture.load(`./textures/${ring.map}`) : null,
        // alphaMap: ring.alphsMap ? loaders.texture.load(`./textures/${ring.alphaMap}`) : null,
        transparent: true,
        side: THREE.DoubleSide,
      })
    )
    // newRing.rotation.x = angle(10)
    ringOutput[`ring-${i}`] = newRing
    
    return ringOutput
  }, {})

  const createSatelites = !satelites ? null : satelites.reduce((allSatelites, satelite, i) => {
    const { inner, outer, map } = satelite
    const sateliteOutput = allSatelites
    const newSatelite = new THREE.Mesh(
      new THREE.SphereGeometry(satelite.r, 100),
      new THREE.MeshPhongMaterial({
        color: satelite.color || '#fff',
        map: satelite.map ? loaders.texture.load(`./textures/${satelite.map}`) : null,
        bumpMap: satelite.alphsMap ? loaders.texture.load(`./textures/${satelite.alphaMap}`) : null,
        bumpScale: 0.3,
      })
    )
    // newsatelite.rotation.x = angle(10)
    sateliteOutput[`satelite-${i}`] = newSatelite
    newSatelite.position.x = satelite.x
    return sateliteOutput
  }, {})



  createPlanet.position.set(x, y, z)
  update[name] = {
    planet: createPlanet,
    layers : createLayers,
    rings: createRings,
    satelites: createSatelites,
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
    Object.keys(layers).forEach(l => {
      console.log(layers[l])
      p.planet.add(layers[l])
    })
  }
  if (p.rings) {
    const { rings } = p
    console.log({ rings })
    Object.keys(rings).forEach(r => {
      console.log(rings[r])
      p.planet.add(rings[r])
    })
  }
  if (p.satelites) {
    const { satelites } = p
    console.log({ satelites })
    Object.keys(satelites).forEach(s => {
      console.log(satelites[s])
      p.planet.add(satelites[s])
    })
  }
  
})

scene.add(universe)
scene.add(sun)

const controls = new THREE.OrbitControls(camera)
const speed = 0.05
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
  sun.rotation.y += speed / 27
  universe.rotation.y += 0.0001
  universe.rotation.x += 0.0001
  universe.rotation.z += 0.00005
  
  Object.keys(planets).forEach(k => {
    const planet = planetData.filter(p => p.name === k)[0].planet
    planets[k].planet.rotation.y += speed / planet.spin
    if (planet.orbit >= 360) planet.orbit = 0

    planet.orbit += speed / (planet.orbitSpeed)
    planets[k].planet.position.x = planet.x * Math.sin(planet.orbit)
    planets[k].planet.position.z = planet.x * Math.cos(planet.orbit)
  })

}

update()

