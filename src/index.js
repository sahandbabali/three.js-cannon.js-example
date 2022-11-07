// Test import of styles
import '@/styles/index.scss'



import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
const axesHelper = new THREE.AxesHelper(1);
import CannonDebugger from 'cannon-es-debugger'

/**
 * Debug
 */
// const gui = new dat.GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x3CA9EE);


/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader()



// physics
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const concretematerial = new CANNON.Material('concrete');
const plasticmaterial = new CANNON.Material('plastic')

const contactmaterial = new CANNON.ContactMaterial(concretematerial, plasticmaterial, {
    friction: 0.1,
    restitution: 0.7
})

world.addContactMaterial(contactmaterial)


// create the shape
const sphereshape = new CANNON.Sphere(1)

// create the body
const spherebody = new CANNON.Body({
    mass: 5,
    position: new CANNON.Vec3(-5, 1, 0),
    shape: sphereshape,
    material: plasticmaterial
})

// spherebody.applyLocalForce(new CANNON.Vec3(150,0,0), new CANNON.Vec3(0,0,0))

world.addBody(spherebody)

// +++++++++++++++++++++++++++++++++++++++++++++++++
// add cube body
// +++++++++++++++++++++++++++++++++++++++++++++++++

// // create the shape
// const cubeshape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));

// // create the body
// const cubebody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(5, 1, 0),
//     shape: cubeshape,
//     material: plasticmaterial
// })

// world.addBody(cubebody)

const cubesarray = [];


for (let j = 0; j < 5; j++) {
    for (let index = 0; index < 5; index++) {

        // create the shape
        const cubeshape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));

        // create the body
        const cubebody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(5, j + 1 * 1.1, -2 + index * 1.1),
            shape: cubeshape,
            material: plasticmaterial
        })

        world.addBody(cubebody)
        cubesarray.push(cubebody)



    }
}










// adding the floor body
const floorshape = new CANNON.Plane();

const floorbody = new CANNON.Body();
floorbody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0,), Math.PI * 0.5)

floorbody.mass = 0
floorbody.addShape(floorshape)
floorbody.material = concretematerial
world.addBody(floorbody)




/**
 * Test sphere
 */
const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
    })
)
sphere.castShadow = true
// sphere.position.y = 3
scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)




const cubesarraythree = [];


for (let j = 0; j < 5; j++) {
    for (let index = 0; index < 5; index++) {

        const box = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({
                metalness: 0.3,
                roughness: 1,
                color: 0xffffff
            })
        )
        box.castShadow = true
        scene.add(box)
        cubesarraythree.push(box)



    }
}






/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-10, 6, 6)
scene.add(camera)
camera.lookAt(sphere.position)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



scene.add(axesHelper);

// grid helper
const size = 20;
const divisions = 20;

// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);




window.onkeypress = function (event) {

    // console.log(event.keyCode)
    if (event.keyCode == 115) {
        spherebody.applyLocalForce(new CANNON.Vec3(5000, 2000, 0), new CANNON.Vec3(0, 0, 0))
    }
}


// const cannonDebugger = new CannonDebugger(scene, world, {
//     // options...
// })


/**
 * Animate
 */
const clock = new THREE.Clock()
let oldelapsedtime = 0;
const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltatime = elapsedTime - oldelapsedtime;
    oldelapsedtime = elapsedTime;



    // update the physics world
    world.step(1 / 60, deltatime, 3)
    camera.lookAt(sphere.position)


    // console.log(spherebody.position.y)

    sphere.position.copy(spherebody.position)


    cubesarraythree.forEach(cubereposition)

    function cubereposition(item, index, arr) {
        cubesarraythree[index].position.copy(cubesarray[index].position)
        cubesarraythree[index].quaternion.copy(cubesarray[index].quaternion)


    }



    // Update controls
    controls.update()

    // cannonDebugger.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()