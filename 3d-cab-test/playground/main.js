window.addEventListener('DOMContentLoaded', function () {
    // Get canvas element
    const canvas = document.getElementById('renderCanvas');

    // Create Babylon.js engine
    const engine = new BABYLON.Engine(canvas, true);

    // Scene and camera setup
    const createScene = () => {
        const scene = new BABYLON.Scene(engine);

        // Create an orthographic camera
        const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2.5, Math.PI / 2.5, 50, BABYLON.Vector3.Zero(), scene);
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        camera.attachControl(canvas, true);

        // Configure zoom and clipping properties
        camera.wheelDeltaPercentage = 0.01;
        camera.minZ = -100;
        camera.maxZ = 10000;

        // Add zoom functionality with mouse wheel
        canvas.addEventListener("wheel", event => {
            event.preventDefault();
            const zoomFactor = 1.05;
            camera.orthoLeft *= event.deltaY < 0 ? 1 / zoomFactor : zoomFactor;
            camera.orthoRight *= event.deltaY < 0 ? 1 / zoomFactor : zoomFactor;
            camera.orthoTop *= event.deltaY < 0 ? 1 / zoomFactor : zoomFactor;
            camera.orthoBottom *= event.deltaY < 0 ? 1 / zoomFactor : zoomFactor;
        });

        // Create a light
        new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene).intensity = 0.9;

        return scene;
    };

    const scene = createScene();
    const cabinets = [];

    const selectCabinet = (cabIndex) => {

    };

    // Cabinet class
    class Cabinet {
        constructor(index, options) {
            this.scene = scene;
            this.index = index || 0;
            this.options = Object.assign({
                width: 30,
                height: 72,
                depth: 24,
                thickness: 0.75,
                doorConfig: 'single', // 'single' or 'double'
                handleSide: 'right',   // 'left' or 'right'
                position: new BABYLON.Vector3(0, 0, 0)
            }, options);

            this.meshes = [];
            this.createCabinet();
        }

        createBoard(name, width, height, depth, position) {
            let self = this;

            const board = BABYLON.MeshBuilder.CreateBox(name, { width, height, depth }, this.scene);
            board.position = position;

            // Edge rendering
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

                    console.log(self.meshes);


                })
            );

            console.log(board.edgesWidth);

            return board;
        }

        createCabinet() {
            const { width, height, depth, thickness, doorConfig, handleSide, position } = this.options;
            const centerAdjust = height / 2;

            const leftSide = this.createBoard("leftSide"+Date.now(), thickness, height, depth - thickness, new BABYLON.Vector3(-width / 2 + thickness / 2, (height / 2) - centerAdjust, -thickness / 2));
            const rightSide = this.createBoard("rightSide"+Date.now(), thickness, height, depth - thickness, new BABYLON.Vector3(width / 2 - thickness / 2, (height / 2) - centerAdjust, -thickness / 2));
            const topSide = this.createBoard("topSide"+Date.now(), width - (thickness * 2), thickness - 0.1, depth - thickness, new BABYLON.Vector3(0, (height - thickness / 2) - centerAdjust, -thickness / 2));
            const bottomSide = this.createBoard("bottomSide"+Date.now(), width - (thickness * 2) - 0.1, thickness, depth - thickness, new BABYLON.Vector3(0, (thickness / 2) - centerAdjust, -thickness / 2));
            const backSide = this.createBoard("backSide"+Date.now(), width - (thickness * 2), height - (thickness * 2), thickness, new BABYLON.Vector3(0, (height / 2) - centerAdjust, -depth / 2 + thickness / 2));

            this.meshes.push(leftSide, rightSide, topSide, bottomSide, backSide);

            // Shelves
            const shelf = this.createBoard("shelf", width - (thickness * 2), thickness, depth - thickness - 2.5, new BABYLON.Vector3(0, height / 2 - thickness / 2 - centerAdjust, (-thickness / 2) - 0.4));

            this.meshes.push(shelf);

            // Doors
            if (doorConfig === 'single') {
                const door = this.createBoard("door", width-0.1, height, thickness, new BABYLON.Vector3(0, (height / 2) - centerAdjust, depth / 2 - thickness / 2));
                door.isVisible = true;

                // Handle side adjustment
                if (handleSide === 'left') {
                    door.rotation.y = Math.PI;
                    door.position.x = -door.position.x;
                }

                this.meshes.push(door);
            } else if (doorConfig === 'double') {
                const doorWidth = (width) / 2;
                const doorLeft = this.createBoard("doorLeft", doorWidth-0.1, height, thickness, new BABYLON.Vector3(-doorWidth / 2, (height / 2) - centerAdjust, depth / 2 - thickness / 2));
                const doorRight = this.createBoard("doorRight", doorWidth-0.1, height, thickness, new BABYLON.Vector3(doorWidth / 2, (height / 2) - centerAdjust, depth / 2 - thickness / 2));

                this.meshes.push(doorLeft, doorRight);
            }

            // Apply position offset
            this.meshes.forEach(mesh => {
                mesh.position.addInPlace(position);
            });

            // White Material
            const material = new BABYLON.PBRMaterial("cabinetMaterial", this.scene);
            material.albedoColor = new BABYLON.Color3(1, 1, 1);
            material.metallic = 0.0;
            material.roughness = 0.8;

            // Textured Material
            const texturedMaterial = new BABYLON.StandardMaterial("texturedMaterial", scene);
            texturedMaterial.diffuseTexture = new BABYLON.Texture("/cabinet-tile-black-forest.jpg", scene);
            texturedMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            texturedMaterial.diffuseTexture.level = 2.5;
            texturedMaterial.roughness = 0.8;

            this.meshes.forEach(mesh => {
                if (mesh.name === "door" || mesh.name === "doorLeft" || mesh.name === "doorRight") {
                    mesh.material = texturedMaterial;
                } else {
                    mesh.material = material;
                }

                console.log(mesh.name);
            });

            scene.
        }

        updateDimensions(newOptions) {
            this.options = Object.assign(this.options, newOptions);
            this.meshes.forEach(mesh => {
                if (mesh) mesh.dispose();
            });
            this.meshes = [];
            this.createCabinet();
        }
    }

    // Add initial cabinet
    const initialCabinet = new Cabinet(0, {});
    cabinets.push(initialCabinet);

    // Camera reorientation
    const recenterCamera = () => {
        if (cabinets.length === 0) return;

        let min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        let max = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

        cabinets.forEach(cabinet => {
            cabinet.meshes.forEach(mesh => {
                const boundingBox = mesh.getBoundingInfo().boundingBox;
                min = BABYLON.Vector3.Minimize(min, boundingBox.minimumWorld);
                max = BABYLON.Vector3.Maximize(max, boundingBox.maximumWorld);
            });
        });

        const center = min.add(max).scale(0.5);
        const size = max.subtract(min);
        const camera = scene.activeCamera;

        camera.target = center;
        const aspectRatio = engine.getRenderWidth() / engine.getRenderHeight();
        const maxDim = Math.max(size.x, size.y * aspectRatio) * 0.75;

        camera.orthoLeft = -maxDim * aspectRatio;
        camera.orthoRight = maxDim * aspectRatio;
        camera.orthoTop = maxDim;
        camera.orthoBottom = -maxDim;
    };

    recenterCamera();

    // UI Elements
    const widthSlider = document.getElementById('widthSlider');
    const heightSlider = document.getElementById('heightSlider');
    const depthSlider = document.getElementById('depthSlider');
    const doorConfigSelect = document.getElementById('doorConfigSelect');
    const handleSideSelect = document.getElementById('handleSideSelect');
    const addCabinetButton = document.getElementById('addCabinetButton');

    // Update cabinet dimensions
    const updateCabinet = () => {
        const width = parseFloat(widthSlider.value);
        const height = parseFloat(heightSlider.value);
        const depth = parseFloat(depthSlider.value);
        const doorConfig = doorConfigSelect.value;
        const handleSide = handleSideSelect.value;

        console.log(width, height, depth, doorConfig, handleSide);

        cabinets[cabinets.length - 1].updateDimensions({ width, height, depth, doorConfig, handleSide });
        //recenterCamera();
    };

    widthSlider.addEventListener('input', updateCabinet);
    heightSlider.addEventListener('input', updateCabinet);
    depthSlider.addEventListener('input', updateCabinet);
    doorConfigSelect.addEventListener('change', updateCabinet);
    handleSideSelect.addEventListener('change', updateCabinet);

    // Add new cabinet
    addCabinetButton.addEventListener('click', () => {
        const lastCabinet = cabinets[cabinets.length - 1];
        const newPosition = lastCabinet.options.position.add(new BABYLON.Vector3(lastCabinet.options.width + 10, 0, 0));

        const newCabinet = new Cabinet(cabinets.length, {
            width: parseFloat(widthSlider.value),
            height: parseFloat(heightSlider.value),
            depth: parseFloat(depthSlider.value),
            doorConfig: doorConfigSelect.value,
            handleSide: handleSideSelect.value,
            position: newPosition
        });

        cabinets.push(newCabinet);
        //recenterCamera();
    });

    // Render loop
    engine.runRenderLoop(() => scene.render());

    // Handle window resize
    window.addEventListener('resize', () => {
        engine.resize();
        recenterCamera();
    });
});
