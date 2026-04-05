import { logger } from './logger.js';
import { createScene } from './scene.js';
import { Cabinet } from './cabinet.js';
import { setupUI } from './ui.js';
import { recenterCamera } from './utils.js';

const DEBUG_MODE = true;
logger.setDebugMode(DEBUG_MODE);

window.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element and create the Babylon engine
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);
    engine.setHardwareScalingLevel(.5);

    // Create the scene, camera, and utility layer
    const { scene, camera } = createScene(engine, canvas);

    const ppp = new BABYLON.PassPostProcess("pass", 1, camera);
    ppp.samples = engine.getCaps().maxMSAASamples;

    // const pipeline = new BABYLON.DefaultRenderingPipeline("defaultPipeline", true, scene, [camera]);
    // pipeline.samples = 8;
    // pipeline.fxaaEnabled = true;
    // pipeline.imageProcessingEnabled = false;

    // Create position gizmo
    const positionGizmo = new BABYLON.PositionGizmo();

    // Initialize an array to hold all cabinet instances
    const cabinets = [];
    let selectedCabinet = null;

    // Function to update cabinet dimensions
    const updateCabinet = () => {
        if (cabinets.length === 0 || !selectedCabinet) return;

        const width = parseFloat(document.getElementById('widthSlider').value);
        const height = parseFloat(document.getElementById('heightSlider').value);
        const depth = parseFloat(document.getElementById('depthSlider').value);
        const doorConfig = document.getElementById('doorConfigSelect').value;
        const handleSide = document.getElementById('handleSideSelect').value;

        cabinets[selectedCabinet].updateDimensions({
            width,
            height,
            depth,
            doorConfig,
            handleSide,
        });
    };

    // Function to add a new cabinet
    const addCabinet = () => {
        logger.info('Adding new cabinet...');

        const width = parseFloat(document.getElementById('widthSlider').value);
        const height = parseFloat(document.getElementById('heightSlider').value);
        const depth = parseFloat(document.getElementById('depthSlider').value);

        let lastCabinet, newPosition;
        
        if (selectedCabinet) {
            lastCabinet = cabinets[selectedCabinet];
            logger.info(`Last cabinet position: ${lastCabinet.options.position.x}, ${lastCabinet.options.position.y}, ${lastCabinet.options.position.z}`);
            logger.info(`Last cabinet dimensions: ${lastCabinet.options.width}, ${lastCabinet.options.height}, ${lastCabinet.options.depth}`);
            newPosition = lastCabinet.options.position.add(new BABYLON.Vector3(-lastCabinet.options.width, 0, 0));
        } else {
            newPosition = new BABYLON.Vector3(-width / 2, height / 2, depth / 2);
        }

        const newCabinet = new Cabinet(scene, cabinets.length, {
            width: width,
            height: height,
            depth: depth,
            doorConfig: document.getElementById('doorConfigSelect').value,
            handleSide: document.getElementById('handleSideSelect').value,
            position: newPosition,
        });

        cabinets.push(newCabinet);
        positionGizmo.attachedNode = newCabinet.transformNode;
        selectedCabinet = cabinets.length-1;
    };

    const deleteCabinet = () => {
        if (cabinets.length === 0 || !selectedCabinet) return;

        const cabinet = cabinets[selectedCabinet];
        cabinet.dispose();

        positionGizmo.attachedNode = null;
        selectedCabinet = null;
    };

    const toggleDoor = () => {
        if (cabinets.length === 0 || !selectedCabinet) return;

        cabinets[selectedCabinet].toggleDoor();
    };

    // Setup the UI and bind event listeners
    setupUI(cabinets, updateCabinet, addCabinet, deleteCabinet, toggleDoor);

    // Handle Pointer Pick
    scene.onPointerObservable.add(pointerInfo => {
        
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
            logger.info(`Pointer event: POINTERPICK`);
            const pickedMesh = pointerInfo.pickInfo.pickedMesh;
            if (pickedMesh) {
                logger.info(`Picked mesh: ${pickedMesh.name}`);

                for (let i = 0; i < cabinets.length; i++) {
                    const cabinet = cabinets[i];
                    if (cabinet.meshes.includes(pickedMesh)) {
                        logger.info(`Cabinet ${i} selected`);
                        selectedCabinet = i;
                        positionGizmo.attachedNode = cabinet.transformNode;
                        break;
                    }
                }

                // for (let i=0) {
                //     if (cabinet.meshes.includes(pickedMesh)) {
                //         positionGizmo.attachedNode = cabinet.transformNode;
                //         break;
                //     }
                // }
            }
        } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
            logger.info(`Pointer event: POINTERDOWN`);
            positionGizmo.attachedNode = null;
        }
    });

    // Render the scene
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        engine.resize();
        recenterCamera(scene, cabinets, engine);
    });
});
