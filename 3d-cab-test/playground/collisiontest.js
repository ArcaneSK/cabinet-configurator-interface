// Create the Babylon.js engine and scene
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.collisionsEnabled = true;

// Create a basic camera and light
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 4, 10, new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas, true);
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

// Create two boxes
const box1 = BABYLON.MeshBuilder.CreateBox("box1", { size: 2 }, scene);
const box2 = BABYLON.MeshBuilder.CreateBox("box2", { size: 2 }, scene);

box1.position.x = -3;
box2.position.x = 3;

box1.checkCollisions = true;
box2.checkCollisions = true;

// Add GizmoManager for dragging
const gizmoManager = new BABYLON.GizmoManager(scene);
gizmoManager.positionGizmoEnabled = true;

// Enable collision checking during dragging
gizmoManager.gizmos.positionGizmo.onDragObservable.add((test) => {
    const draggedMesh = gizmoManager.gizmos.positionGizmo.attachedMesh;

    if (!draggedMesh) return; // No mesh is being dragged, exit early

    console.log("Dragging mesh:", draggedMesh.name);

    // Iterate through all meshes in the scene
    scene.meshes.forEach((mesh) => {
        if (mesh !== draggedMesh && mesh.checkCollisions) {
            // Check for intersections
            if (draggedMesh.intersectsMesh(mesh, false)) {
                console.log(`Collision detected between ${draggedMesh.name} and ${mesh.name}!`);

                // Stop further movement by reverting to the previous position
                // draggedMesh.position.subtractInPlace(gizmoManager.gizmos.positionGizmo._lastDragDelta);
            }
        }
    });
});


// Render the scene
engine.runRenderLoop(() => {
    scene.render();
});