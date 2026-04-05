// Babylon.js script

// Create the Babylon.js engine and scene
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Create a basic camera and light
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 4, 10, new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas, true);
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

// Highlight layer for glowing effect
const highlightLayer = new BABYLON.HighlightLayer("highlightLayer", scene);

// Add XYZ gizmo for orientation using utility layer
const utilLayer = new BABYLON.UtilityLayerRenderer(scene);
const positionGizmo = new BABYLON.PositionGizmo(utilLayer);
positionGizmo.updateGizmoRotationToMatchAttachedMesh = false;
positionGizmo.updateGizmoPositionToMatchAttachedMesh = true;

const scaleGizmo = new BABYLON.ScaleGizmo(utilLayer);
scaleGizmo.updateGizmoRotationToMatchAttachedMesh = false;
scaleGizmo.updateGizmoPositionToMatchAttachedMesh = true;

// State tracking for cube interactions
let selectedFace = null;
let selectedMesh = null;

let sideSelectPlane = null;

// Function to create a cube
function createCube(position, name = "cube") {
    const cube = BABYLON.MeshBuilder.CreateBox(name, { size: 1 }, scene);
    cube.position = position;
    const material = new BABYLON.StandardMaterial(`${name}Material`, scene);
    material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    cube.material = material;
    console.log(`Created cube: ${name} at position ${position}`);

    return cube;
}

// Create a highlight plane for the selected face
function createHighlightFace(mesh, normal) {
    if (sideSelectPlane) {
        sideSelectPlane.dispose();
        sideSelectPlane = null;
    }

    sideSelectPlane = BABYLON.MeshBuilder.CreatePlane("highlight", { size: 1 }, scene);
    sideSelectPlane.position = mesh.position.add(normal.scale(0.51)); // Slightly offset the plane
    sideSelectPlane.setDirection(normal.negate());
    sideSelectPlane.isPickable = false;

    const material = new BABYLON.StandardMaterial("highlightMaterial", scene);
    material.diffuseColor = new BABYLON.Color3(0, 0, 1);
    material.emissiveColor = new BABYLON.Color3(0, 0, 1);
    material.alpha = 0.5;
    sideSelectPlane.material = material;

    highlightLayer.addMesh(sideSelectPlane, BABYLON.Color3.Blue());
}

// Create the initial cube
const initialCube = createCube(new BABYLON.Vector3(0, 0, 0));

// Handle click events to highlight cube sides
scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
        const pickResult = pointerInfo.pickInfo;
        console.log(`Clicked on: ${pickResult.pickedMesh?.name}`);
        if (pickResult.hit) {
            const pickedMesh = pickResult.pickedMesh;
            const pickedFaceId = pickResult.faceId;

            highlightLayer.removeAllMeshes();

            if (pickedMesh && pickedFaceId !== null) {
                const faceNormals = [
                    new BABYLON.Vector3(0, 0, 1), // Right
                    new BABYLON.Vector3(0, 0, -1), // Left
                    new BABYLON.Vector3(1, 0, 0), // Front
                    new BABYLON.Vector3(-1, 0, 0), // Back
                    new BABYLON.Vector3(0, 1, 0), // Top
                    new BABYLON.Vector3(0, -1, 0), // Bottom
                ];

                const faceIndex = Math.floor(pickedFaceId / 2);
                const normal = faceNormals[faceIndex];

                selectedFace = normal;
                selectedMesh = pickedMesh;

                // highlightLayer.addMesh(pickedMesh, BABYLON.Color3.Blue());
                createHighlightFace(pickedMesh, selectedFace);

                positionGizmo.attachedMesh = pickedMesh;
                scaleGizmo.attachedMesh = pickedMesh;
                console.log(`Selected face normal: ${normal}, on mesh: ${pickedMesh.name}`);
            }
        }
    } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
        if (sideSelectPlane) {
            sideSelectPlane.dispose();
            sideSelectPlane = null;
        }

        selectedFace = null;
        selectedMesh = null;
        positionGizmo.attachedMesh = null;
        scaleGizmo.attachedMesh = null;

        console.log("Deselected cube or clicked elsewhere.");
    }
});

// Handle keypress events to add duplicate cubes
window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "a" && selectedFace !== null && selectedMesh !== null) {
        const newCubePosition = selectedMesh.position.add(selectedFace);
        createCube(newCubePosition, `cube_${Math.random().toString(36).substr(2, 9)}`);
        console.log(`Added new cube at position ${newCubePosition}, adjacent to ${selectedMesh.name}`);
    } else if (event.key.toLowerCase() === "d" && selectedMesh !== null) {
        selectedMesh.dispose();
        positionGizmo.attachedMesh = null;
        scaleGizmo.attachedMesh = null;
        console.log(`Deleted cube: ${selectedMesh.name}`);
    }
});

// Render the scene
engine.runRenderLoop(() => {
    scene.render();
});

// Resize the engine on window resize
window.addEventListener("resize", () => {
    engine.resize();
});