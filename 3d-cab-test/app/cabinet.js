import { logger } from './logger.js';

export class Cabinet {
    constructor(scene, index, options) {
        this.scene = scene;
        this.index = index || 0;
        this.options = Object.assign({
            width: 30,
            height: 72,
            depth: 24,
            thickness: 0.75,
            doorConfig: 'single', // 'single' or 'double'
            handleType: 'bar',
            handleSide: 'right',   // 'left' or 'right'
            position: new BABYLON.Vector3(0, 0, 0),
        }, options);

        this.transformNode = new BABYLON.TransformNode("transformNode", scene);
        this.transformNode.position = this.options.position;

        this.meshes = [];
        this.doorMeshes = [];
        this.createCabinet();
    }

    createBoard(name, width, height, depth, position) {
        const board = BABYLON.MeshBuilder.CreateBox(name, { width, height, depth }, this.scene);
        board.position = position;

        // Enable edge rendering for a cleaner look
        board.enableEdgesRendering();
        board.edgesWidth = 10.0;
        board.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

        // // Add interaction functionality to the board
        // board.actionManager = new BABYLON.ActionManager(this.scene);
        // board.actionManager.registerAction(
        //     new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (evt) => {
        //         const clickedMesh = evt.meshUnderPointer;
        //         logger.info(`Board clicked: ${clickedMesh.name}`);
        //     })
        // );

        this.addMesh(board);

        return board;
    }

    createBarPull(position, height) {
        let pull = BABYLON.MeshBuilder.CreateCylinder("barPull", { diameter: 0.6, height: height, tessellation: 24 }, this.scene);
        pull.position = position;
        
        // Enable edge rendering for a cleaner look
        pull.enableEdgesRendering();
        pull.edgesWidth = 10.0;
        pull.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

        const pullPostTop = BABYLON.MeshBuilder.CreateCylinder("barPullPostTop", { diameter: 0.4, height: 2, tessellation: 24 }, this.scene);
        pullPostTop.position = new BABYLON.Vector3(position.x, (position.y + height / 2) - 2, position.z - 1);
        pullPostTop.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
        
        const pullPostBottom = BABYLON.MeshBuilder.CreateCylinder("barPullPostBottom", { diameter: 0.4, height: 2, tessellation: 24 }, this.scene);
        pullPostBottom.position = new BABYLON.Vector3(position.x, (position.y - height / 2) + 2, position.z - 1);
        pullPostBottom.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

        this.addMesh(pull);
        this.addMesh(pullPostTop);
        this.addMesh(pullPostBottom);

        this.addDoorMesh(pull);
        this.addDoorMesh(pullPostTop);
        this.addDoorMesh(pullPostBottom);
    }

    createCabinet() {
        const { width, height, depth, thickness, doorConfig, handleSide, position } = this.options;
        const centerAdjust = height / 2;

        // Create sides
        this.createBoard("leftSide", thickness, height, depth - thickness, 
            new BABYLON.Vector3(-width / 2 + thickness / 2, (height / 2) - centerAdjust, -thickness / 2));
        this.createBoard("rightSide", thickness, height, depth - thickness, 
            new BABYLON.Vector3(width / 2 - thickness / 2, (height / 2) - centerAdjust, -thickness / 2));

        // Create top, bottom, and back
        this.createBoard("topSide", width - (thickness * 2), thickness, depth - thickness, 
            new BABYLON.Vector3(0, (height - thickness / 2) - centerAdjust, -thickness / 2));
        this.createBoard("bottomSide", width - (thickness * 2), thickness, depth - thickness, 
            new BABYLON.Vector3(0, (thickness / 2) - centerAdjust, -thickness / 2));
        this.createBoard("backSide", width - (thickness * 2), height - (thickness * 2), thickness, 
            new BABYLON.Vector3(0, (height / 2) - centerAdjust, -depth / 2 + thickness / 2));

        // Add a shelf
        this.createBoard("shelf", width - (thickness * 2), thickness, depth - thickness - 2.5, 
            new BABYLON.Vector3(0, height / 2 - thickness / 2 - centerAdjust, (-thickness / 2) - 0.4));

        // Create doors and pulls
        const handleHeight = 20;

        if (doorConfig === 'single') {
            const door = this.createBoard("door", width - 0.2, height, thickness, 
                new BABYLON.Vector3(0, (height / 2) - centerAdjust, depth / 2 - thickness / 2));
            if (handleSide === 'left') {
                door.rotation.y = Math.PI;
                door.position.x = -door.position.x;
            }
            this.addDoorMesh(door);

            this.createBarPull(new BABYLON.Vector3(this.options.handleSide == 'left' ? ((width / 2) - 3) : -((width / 2) - 3), (height / 2) - centerAdjust, depth / 2 + thickness + 1), handleHeight);
        } else if (doorConfig === 'double') {
            const doorWidth = width / 2;
            const doorLeft = this.createBoard("doorLeft", doorWidth - 0.1, height, thickness, 
                new BABYLON.Vector3(-doorWidth / 2, (height / 2) - centerAdjust, depth / 2 - thickness / 2));
            const doorRight = this.createBoard("doorRight", doorWidth - 0.1, height, thickness, 
                new BABYLON.Vector3(doorWidth / 2, (height / 2) - centerAdjust, depth / 2 - thickness / 2));
            this.addDoorMesh(doorLeft, doorRight);

            this.createBarPull(new BABYLON.Vector3(-3, (height / 2) - centerAdjust, depth / 2 + thickness + 1), handleHeight);
            this.createBarPull(new BABYLON.Vector3(3, (height / 2) - centerAdjust, depth / 2 + thickness + 1), handleHeight);
        }

        // Materials
        const material = new BABYLON.PBRMaterial("cabinetMaterial", this.scene);
        material.albedoColor = new BABYLON.Color3(1, 1, 1);
        material.metallic = 0.0;
        material.roughness = 0.8;

        const texturedMaterial = new BABYLON.StandardMaterial("texturedMaterial", this.scene);
        texturedMaterial.diffuseTexture = new BABYLON.Texture("/assets/img/cabinet-tile-black-forest.jpg", this.scene);
        texturedMaterial.diffuseTexture.uScale = 2; // Scale horizontally
        texturedMaterial.diffuseTexture.vScale = 1; // Scale vertically
        texturedMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        texturedMaterial.diffuseTexture.level = 2.5;
        texturedMaterial.roughness = 0.8;

        // Create the PBR material
        const brushedAluminumMaterial = new BABYLON.PBRMaterial("brushedAluminum", this.scene);
        brushedAluminumMaterial.albedoColor = new BABYLON.Color3(1, 1, 1);
        brushedAluminumMaterial.metallic = 0.8; // 1.0; // Fully metallic
        brushedAluminumMaterial.roughness = 0.5; // Semi-rough surface for brushed look

        // Add a noise texture for the brushed effect
        const noiseTexture = new BABYLON.NoiseProceduralTexture("noise", 256, this.scene);
        noiseTexture.octaves = 5;
        noiseTexture.persistence = 0.6;
        noiseTexture.animationSpeedFactor = 0;
        noiseTexture.brightness = 1;
        noiseTexture.contrast = 2.0;
        noiseTexture.uScale = 2; // Scale horizontally
        noiseTexture.vScale = 2; // Scale vertically
        
        brushedAluminumMaterial.albedoTexture = noiseTexture; // Use the noise texture as the albedo texture
        brushedAluminumMaterial.metallicTexture = noiseTexture; // Use the noise texture to modify the roughness for a streaky effect

        // Assign materials to meshes
        this.meshes.forEach(mesh => {
            logger.info(`Mesh: ${mesh.name}`);

            switch (mesh.name) {
                case "barPull":
                case "barPullPostTop":
                case "barPullPostBottom":
                    mesh.material = brushedAluminumMaterial;
                    break;
                case "door":
                case "doorLeft":
                case "doorRight":
                    mesh.material = texturedMaterial;
                    break;
                default:
                    mesh.material = material;
            }
        });
    }

    dispose = () => {
        this.transformNode.dispose();

        this.meshes.forEach(mesh => {
            if (mesh) mesh.dispose();
        });
        this.meshes = [];
    }

    updateDimensions(newOptions) {
        this.options = Object.assign(this.options, newOptions);

        // Dispose of old meshes
        this.meshes.forEach(mesh => {
            if (mesh) mesh.dispose();
        });
        this.meshes = [];

        // Dispose of old door meshes
        this.doorMeshes.forEach(mesh => {
            if (mesh) mesh.dispose();
        });

        // Recreate the cabinet with updated dimensions
        this.createCabinet();
    }

    addMesh(...mesh) {
        mesh.forEach(m => {
            if (m) {
                m.parent = this.transformNode;
                this.meshes.push(m);
            }
        });
    }

    addDoorMesh(...mesh) {
        mesh.forEach(m => {
            if (m) {
                this.doorMeshes.push(m);
            }
        });
    }

    toggleDoor() {
        this.doorMeshes.forEach(mesh => {
            mesh.setEnabled(!mesh.isEnabled());
        });
    }
}
