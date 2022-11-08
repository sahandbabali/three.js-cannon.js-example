// Test import of styles
import '@/styles/index.scss'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import * as CANNON from 'cannon-es'
const axesHelper = new THREE.AxesHelper(1);
import CannonDebugger from 'cannon-es-debugger'
import Stats from 'three/examples/jsm/libs/stats.module'

const stats = Stats()
document.body.appendChild(stats.dom)


/**
 * Debug
 */
const gui = new dat.GUI({ width: 500 })

var guivalues = {
    velocityx: 25,
    velocityy: 7,
    spheremass: 5,
    boxmass: 1
}

gui.add(guivalues, 'velocityx', 0, 200, 1).name('Sphere Velocity X')
gui.add(guivalues, 'velocityy', 0, 200, 1).name('Sphere Velocity Y')
gui.add(guivalues, 'spheremass', 0, 100, 1).name('Sphere Mass')
gui.add(guivalues, 'boxmass', 0, 100, 1).name('Box Mass')


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xADD9F7);


/**
 * Textures
 */
const texture = new THREE.TextureLoader().load('/boxtexture.jpg');


// physics
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
gui.add(world.gravity, 'y', -20, 20, 0.1).name('Gravity')

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
    mass: guivalues.spheremass,
    position: new CANNON.Vec3(-5, 1, 0),
    shape: sphereshape,
    material: plasticmaterial
})

// spherebody.applyLocalForce(new CANNON.Vec3(150,0,0), new CANNON.Vec3(0,0,0))
spherebody.addEventListener('collide', (event) => {

    if(event.body.arrayindex != undefined){
        console.log(event.body.arrayindex)
        cubesarraythree[event.body.arrayindex].material = new THREE.MeshLambertMaterial({

            color: 0xff0000,
            //  map: texture 
        })


    }


 
  })
world.addBody(spherebody)

// +++++++++++++++++++++++++++++++++++++++++++++++++
// add cube body
// +++++++++++++++++++++++++++++++++++++++++++++++++

const cubesarray = [];

for (let k = 5; k < 10; k++) {
    for (let j = 0; j < 5; j++) {
        for (let index = 0; index < 5; index++) {

            // create the shape
            const cubeshape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));

            // create the body
            const cubebody = new CANNON.Body({
                mass: guivalues.boxmass,
                position: new CANNON.Vec3(k * 1.1, j + 1 * 1.1, -2 + index * 1.1),
                shape: cubeshape,
                material: plasticmaterial
            })

            cubebody.arrayindex = cubesarray.length;
            

            world.addBody(cubebody)
            cubesarray.push(cubebody)



        }
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
    new THREE.MeshLambertMaterial({
        color: '#ff0000'
    })
)
sphere.castShadow = true
// sphere.position.y = 3
scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 100),
    new THREE.MeshLambertMaterial({
        color: '#777777',

    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)


const cubesarraythree = [];

for (let k = 5; k < 10; k++) {

    for (let j = 0; j < 5; j++) {
        for (let index = 0; index < 5; index++) {

            const box = new THREE.Mesh(
                new THREE.BoxBufferGeometry(1, 1, 1),
                new THREE.MeshLambertMaterial({

                    color: 0xffffff,
                    //  map: texture 
                })
            )
            box.castShadow = true
            scene.add(box)
            cubesarraythree.push(box)



        }
    }
}


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 50
directionalLight.shadow.camera.left = - 50
directionalLight.shadow.camera.top = 50
directionalLight.shadow.camera.right = 50
directionalLight.shadow.camera.bottom = - 50
directionalLight.position.set(10, 10, 10)
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
// controls.target.copy(sphere.position)

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



// scene.add(axesHelper);

// grid helper
// const size = 20;
// const divisions = 20;

// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);


window.onkeypress = function (event) {

    // console.log(event.keyCode)
    if (event.keyCode == 115) {
        // spherebody.applyLocalForce(new CANNON.Vec3(5000, 2000, 0), new CANNON.Vec3(0, 0, 0))
        spherebody.velocity = new CANNON.Vec3(guivalues.velocityx, guivalues.velocityy, 0);


    }
}

// const cannonDebugger = new CannonDebugger(scene, world, {
//     // options...
// })

// ++++++++++++++++++++++++++++++++++++++++++++++++++++
// collision detection
// ++++++++++++++++++++++++++++++++++++++++++++++++++++





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
    sphere.quaternion.copy(spherebody.quaternion)


    cubesarraythree.forEach(cubereposition)

    function cubereposition(item, index, arr) {
        arr[index].position.copy(cubesarray[index].position)
        arr[index].quaternion.copy(cubesarray[index].quaternion)


    }

    // Update controls
    // controls.target.copy(sphere.position)

    controls.update()
    stats.update()

    // cannonDebugger.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()