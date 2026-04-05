// Wait for the DOM to be ready
window.addEventListener("DOMContentLoaded", () => {
    // Get the canvas element
    const canvas = document.getElementById("renderCanvas");

    // Create the Babylon.js engine
    const engine = new BABYLON.Engine(canvas, true);

    // Create the scene
    const scene = new BABYLON.Scene(engine);

    // Create a camera
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 4,
        20,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);

    // Add a light source
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    // Create a ground plane
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);

    // Create two transform nodes to act as groups
    const group1 = new BABYLON.TransformNode("group1", scene);
    const group2 = new BABYLON.TransformNode("group2", scene);

    // Add meshes to group 1
    const box1 = BABYLON.MeshBuilder.CreateBox("box1", { size: 2 }, scene);
    const sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere1", { diameter: 2 }, scene);
    box1.position.x = -1;
    sphere1.position.x = 1;

    box1.parent = group1;
    sphere1.parent = group1;

    group1.position.x = -5; // Move the first group

    // Add meshes to group 2
    const box2 = BABYLON.MeshBuilder.CreateBox("box2", { size: 2 }, scene);
    const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere2", { diameter: 2 }, scene);
    box2.position.x = -1;
    sphere2.position.x = 1;

    box2.parent = group2;
    sphere2.parent = group2;

    group2.position.x = 5; // Move the second group

    // Enable collision detection
    scene.collisionsEnabled = true;

    // Function to create a bounding box for a group
    function createBoundingBoxForGroup(parentNode) {
        const childMeshes = parentNode.getChildMeshes();
        if (childMeshes.length === 0) return null;

        // Compute bounding box
        const boundingInfo = BABYLON.BoundingInfo.CreateFromMeshes(childMeshes);
        const boundingBox = BABYLON.MeshBuilder.CreateBox(
            `${parentNode.name}_boundingBox`,
            { size: 1 },
            scene
        );

        boundingBox.scaling = boundingInfo.boundingBox.extendSizeWorld.scale(2);
        boundingBox.position = boundingInfo.boundingBox.centerWorld.clone();
        boundingBox.isVisible = false;
        boundingBox.checkCollisions = true;

        return boundingBox;
    }

    // Add Gizmo Manager
    const gizmoManager = new BABYLON.GizmoManager(scene);
    gizmoManager.positionGizmoEnabled = true;

    // Collision detection during dragging
    gizmoManager.gizmos.positionGizmo.onDragObservable.add(() => {
        const draggedParentNode = gizmoManager.gizmos.positionGizmo.attachedMesh;

        if (!draggedParentNode) return;

        // Create or update bounding box
        if (!draggedParentNode.boundingBoxMesh) {
            draggedParentNode.boundingBoxMesh = createBoundingBoxForGroup(draggedParentNode);
        }

        const boundingBox = draggedParentNode.boundingBoxMesh;
        boundingBox.position.copyFrom(draggedParentNode.position);

        // Check for collisions with other meshes
        scene.meshes.forEach((targetMesh) => {
            if (targetMesh === boundingBox || !targetMesh.checkCollisions) return;

            if (boundingBox.intersectsMesh(targetMesh, false)) {
                console.log(`Collision detected between ${boundingBox.name} and ${targetMesh.name}!`);

                // Revert the group position
                draggedParentNode.position.subtractInPlace(gizmoManager.gizmos.positionGizmo._lastDragDelta);
            }
        });
    });

    // Event listener to attach the gizmo to the parent group when a child mesh is clicked
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
            const pickResult = pointerInfo.pickInfo;
            if (pickResult && pickResult.hit && pickResult.pickedMesh) {
                const pickedMesh = pickResult.pickedMesh;

                // Find the parent TransformNode of the clicked mesh
                const parentNode = pickedMesh.parent;
                if (parentNode && parentNode instanceof BABYLON.TransformNode) {
                    console.log(`Attaching gizmo to ${parentNode.name}`);
                    gizmoManager.gizmos.positionGizmo.attachedMesh = parentNode;
                }
            }
        }
    });

    // Render loop
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Handle window resize
    window.addEventListener("resize", () => {
        engine.resize();
    });
});
