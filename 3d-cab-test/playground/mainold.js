window.addEventListener('DOMContentLoaded', function () {
    // Get canvas element
    const canvas = document.getElementById('renderCanvas');

    // Create Babylon.js engine
    const engine = new BABYLON.Engine(canvas, true);

    let selectedMesh = null; // Track the currently selected mesh
    let handleMesh = null;

    // Create the scene function
    const createScene = function () {
        const scene = new BABYLON.Scene(engine);

        // Create a camera (orthographic)
        const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2.5, Math.PI / 2.5, 50, BABYLON.Vector3.Zero(), scene);
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        camera.attachControl(canvas, true);

        // Initial orthographic size setup
        let size = 40; // Base size
        const updateCameraOrtho = () => {
            const aspectRatio = engine.getRenderWidth() / engine.getRenderHeight();
            camera.orthoLeft = -size * aspectRatio;
            camera.orthoRight = size * aspectRatio;
            camera.orthoTop = size;
            camera.orthoBottom = -size;
        };
        updateCameraOrtho(); // Initial call to set up orthographic bounds

        // Configure zoom and clipping properties
        camera.wheelDeltaPercentage = 0.01; // Adjusts the zoom speed with mouse wheel
        camera.minZ = 0.001;
        camera.maxZ = 10000;

        // Add zoom functionality with mouse wheel
        canvas.addEventListener("wheel", function (event) {
            event.preventDefault(); // Prevent default scroll behavior
            const zoomFactor = 1.05;

            size *= (event.deltaY < 0) ? (1 / zoomFactor) : zoomFactor;
            updateCameraOrtho(); // Update camera orthographic bounds on zoom
        });

        // Create a light
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
        light.intensity = 0.9;

        // Function to create a cabinet board with edges
        const createBoard = function (side, width, height, depth, position) {
            const board = BABYLON.MeshBuilder.CreateBox(side+"_board", { width: width, height: height, depth: depth }, scene);
            board.position = position;

            // Add edges renderer to display the edges
            board.enableEdgesRendering();
            board.edgesWidth = 3.0;
            board.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

            // Add an action manager to the board to handle user interaction
            board.actionManager = new BABYLON.ActionManager(scene);

            // Add an action to handle click events
            board.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
                    // Handle the board selection
                    const clickedMesh = evt.meshUnderPointer;

                    // Deselect previously selected mesh if it's different
                    if (selectedMesh && selectedMesh !== clickedMesh) {
                        selectedMesh.material.emissiveColor = BABYLON.Color3.Black(); // Reset color or other properties
                    }

                    // Select the new mesh
                    selectedMesh = clickedMesh;
                    selectedMesh.material.emissiveColor = new BABYLON.Color3(1, 0, 0); // Highlight the selected part
                })
            );

            board.isVisible = true;

            return board;
        };

        // Dimensions (in inches converted to Babylon units, assuming 1 unit = 1 inch)
        const thickness = 0.75;
        const cabinetWidth = 30;
        const cabinetHeight = 72;
        const cabinetDepth = 24;

        const centerAdjust = cabinetHeight / 2;

        // Create cabinet parts
        const leftSide = createBoard("left", thickness, cabinetHeight, cabinetDepth - thickness, new BABYLON.Vector3(-cabinetWidth / 2 + thickness / 2, (cabinetHeight / 2) - centerAdjust, -thickness / 2));
        const rightSide = createBoard("right", thickness, cabinetHeight, cabinetDepth - thickness, new BABYLON.Vector3(cabinetWidth / 2 - thickness / 2, (cabinetHeight / 2) - centerAdjust, -thickness / 2));
        const topSide = createBoard("top", cabinetWidth - (thickness * 2), thickness - 0.1, cabinetDepth - thickness, new BABYLON.Vector3(0, (cabinetHeight - thickness / 2) - centerAdjust, -thickness / 2));
        const bottomSide = createBoard("bottom", cabinetWidth - (thickness * 2) - 0.1, thickness, cabinetDepth - thickness, new BABYLON.Vector3(0, (thickness / 2) - centerAdjust, -thickness / 2));
        const backSide = createBoard("back", cabinetWidth - (thickness * 2), cabinetHeight - (thickness * 2), thickness, new BABYLON.Vector3(0, (cabinetHeight / 2) - centerAdjust, -cabinetDepth / 2 + thickness / 2));
        const frontDoor = createBoard("front", cabinetWidth-1, cabinetHeight, thickness, new BABYLON.Vector3(0-0.5, (cabinetHeight / 2) - centerAdjust, cabinetDepth / 2 - thickness / 2));
        const shelf = createBoard("shelf", cabinetWidth - (thickness * 2), thickness, cabinetDepth - thickness - 2.5, new BABYLON.Vector3(0, cabinetHeight / 2 - thickness / 2 - centerAdjust, (-thickness / 2) - 0.4));

        // Load the OBJ model
        BABYLON.SceneLoader.ImportMesh("", "", "channel_pull_segment.obj", scene, function (meshes) {
            if (meshes.length > 0) {
                handleMesh = meshes[0]; // Access the first mesh of the imported model

                // Optional: Adjust the scale, position, or rotation of the imported mesh
                handleMesh.scaling = new BABYLON.Vector3(50, cabinetHeight*20, 50); // Example: Scale along the x-axis
                handleMesh.position.x = (cabinetWidth / 2) - 1.7 // Move the mesh up
                handleMesh.position.y = cabinetHeight / 2; // Move the mesh up
                handleMesh.position.z = 11.25; // Move the mesh up
                handleMesh.rotation.y = Math.PI / 2; // Rotate the mesh
                handleMesh.rotation.x = Math.PI; // Rotate the mesh
            }
        });

        // Create a semi-glossy PBR material
        const semiGlossyMaterial = new BABYLON.PBRMaterial("semiGlossyMaterial", scene);
        semiGlossyMaterial.albedoColor = new BABYLON.Color3(1, 1, 1);
        semiGlossyMaterial.metallic = 0.0;
        semiGlossyMaterial.roughness = 0.8;

        const texturedMaterial = new BABYLON.StandardMaterial("texturedMaterial", scene);
        texturedMaterial.diffuseTexture = new BABYLON.Texture("/cabinet-tile-black-forest.jpg", scene);
        texturedMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        texturedMaterial.diffuseTexture.level = 2.5;
        texturedMaterial.roughness = 0.8;

        // Apply material to front door
        frontDoor.material = texturedMaterial;

        // Apply material to all cabinet parts
        [leftSide, rightSide, topSide, bottomSide, backSide].forEach(part => {
            part.material = semiGlossyMaterial;
        });

        return { scene, frontDoor };
    };

    // Create the scene
    const { scene, frontDoor } = createScene();

    // Run the render loop
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Resize the engine and update camera view on window resize
    window.addEventListener('resize', function () {
        engine.resize();
        const aspectRatio = engine.getRenderWidth() / engine.getRenderHeight();
        const camera = scene.activeCamera;
        if (camera && camera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            const size = 40;
            camera.orthoLeft = -size * aspectRatio;
            camera.orthoRight = size * aspectRatio;
            camera.orthoTop = size;
            camera.orthoBottom = -size;
        }
    });

    // Button interaction: Toggle visibility of the front door
    document.getElementById('toggleDoorButton').addEventListener('click', function () {
        frontDoor.isVisible = !frontDoor.isVisible; // Toggle visibility
        handleMesh.isVisible = !handleMesh.isVisible; // Toggle visibility
    });

    document.getElementById('clearSelectionButton').addEventListener('click', function () {
        selectedMesh = null;
    });
});
