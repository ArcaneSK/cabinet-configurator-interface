window.addEventListener("DOMContentLoaded", function () {
    // Create Babylon.js Engine and Scene
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

    // Global Variables
    let gizmoManager = new BABYLON.GizmoManager(scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = false;
    gizmoManager.rotationGizmoEnabled = false;

    let selectedGroup = null;

    // Helper Function: Create a group of meshes with TransformNode
    function createGroup(name, position) {
        const groupNode = new BABYLON.TransformNode(name, scene);

        const box = BABYLON.MeshBuilder.CreateBox(name + "_box", { size: 1 }, scene);
        box.parent = groupNode;
        box.position.y = 0.5;

        const sphere = BABYLON.MeshBuilder.CreateSphere(name + "_sphere", { diameter: 1 }, scene);
        sphere.parent = groupNode;
        sphere.position.y = 1.5;

        groupNode.position = position;

        return { groupNode, meshes: [box, sphere] };
    }

    // Helper Function: Compute bounding box for a group of meshes
    function createBoundingBoxForGroup(groupNode, meshes) {
        let min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        let max = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

        meshes.forEach(mesh => {
            mesh.computeWorldMatrix(true);
            const boundingBox = mesh.getBoundingInfo().boundingBox;

            min = BABYLON.Vector3.Minimize(min, boundingBox.minimumWorld);
            max = BABYLON.Vector3.Maximize(max, boundingBox.maximumWorld);
        });

        const size = max.subtract(min);
        const center = BABYLON.Vector3.Center(min, max);

        // Create a bounding box mesh
        const boundingBoxMesh = BABYLON.MeshBuilder.CreateBox("boundingBox", {
            width: size.x,
            height: size.y,
            depth: size.z
        }, scene);
        boundingBoxMesh.isPickable = false; // Not interactive
        boundingBoxMesh.visibility = 0.3; // Semi-transparent
        boundingBoxMesh.position = center;
        boundingBoxMesh.parent = groupNode;

        return boundingBoxMesh;
    }

    // Create Groups of Meshes
    const group1 = createGroup("group1", new BABYLON.Vector3(-3, 0, 0));
    const group2 = createGroup("group2", new BABYLON.Vector3(3, 0, 0));

    // Add bounding boxes
    const group1BoundingBox = createBoundingBoxForGroup(group1.groupNode, group1.meshes);
    const group2BoundingBox = createBoundingBoxForGroup(group2.groupNode, group2.meshes);

    // Store last valid position for collision revert
    let lastValidPosition = new BABYLON.Vector3.Zero();

    // Collision Detection Function
    function checkCollision(draggedBoundingBox, otherBoundingBox) {
        return draggedBoundingBox.intersectsMesh(otherBoundingBox, false);
    }

    // Handle Pointer Pick
    scene.onPointerObservable.add(pointerInfo => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
            const pickedMesh = pointerInfo.pickInfo.pickedMesh;
            if (pickedMesh) {
                if (group1.meshes.includes(pickedMesh)) {
                    attachGizmoToGroup(group1.groupNode);
                } else if (group2.meshes.includes(pickedMesh)) {
                    attachGizmoToGroup(group2.groupNode);
                }
            }
        }
    });

    // Attach Gizmo to Group
    function attachGizmoToGroup(groupNode) {
        gizmoManager.attachToNode(groupNode);
        selectedGroup = groupNode;
        lastValidPosition.copyFrom(groupNode.position);
    }

    // Update Bounding Boxes Dynamically
    scene.onBeforeRenderObservable.add(() => {
        if (selectedGroup) {
            if (selectedGroup === group1.groupNode) {
                group1BoundingBox.position = group1.groupNode.position;
            } else if (selectedGroup === group2.groupNode) {
                group2BoundingBox.position = group2.groupNode.position;
            }

            // Collision Detection Logic
            if (selectedGroup === group1.groupNode && checkCollision(group1BoundingBox, group2BoundingBox)) {
                selectedGroup.position.copyFrom(lastValidPosition);
            } else if (selectedGroup === group2.groupNode && checkCollision(group2BoundingBox, group1BoundingBox)) {
                selectedGroup.position.copyFrom(lastValidPosition);
            } else {
                lastValidPosition.copyFrom(selectedGroup.position);
            }
        }
    });

    // Render Loop
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Resize Handler
    window.addEventListener("resize", () => {
        engine.resize();
    });
});
