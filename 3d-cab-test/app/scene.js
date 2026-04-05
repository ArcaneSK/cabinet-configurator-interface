export const createScene = (engine, canvas) => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.White();
    scene.collisionsEnabled = true;
    
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2.5, Math.PI / 2.5, 150, new BABYLON.Vector3(0, 40, 0), scene);
    // camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    camera.attachControl(canvas, true);
    camera.wheelDeltaPercentage = 0.1;
    camera.inputs.attached.pointers.panningSensibility = 100;

    const ambientLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
    ambientLight.intensity = 0.9;
    ambientLight.shadowEnabled = true;

    // Ground
    const width = 1000
    const height = 1000
    const subdivisions = 10
    
    var grid = new BABYLON.GridMaterial("ground", scene);
    grid.gridRatio = 10;
    grid.mainColor = new BABYLON.Color3(1, 1, 1);
    grid.lineColor = new BABYLON.Color3(0.7, 0.7, 0.7);

    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width, height, subdivisions }, scene, false);
    ground.position.z = 500;
    ground.isPickable = false;
    ground.checkCollisions = true;
    ground.material = grid;
    ground.updateFacetData();

    const wall = BABYLON.MeshBuilder.CreatePlane("wall", {
        width: width,
        height: height,
    });
    wall.position.y = 500;
    wall.isPickable = false;
    wall.checkCollisions = true;
    wall.rotation.y = BABYLON.Tools.ToRadians(180);
    wall.material = grid;

    return { scene, camera };
};
