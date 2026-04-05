/**
 * Recenters the camera to focus on the bounding box of all cabinets.
 * @param {BABYLON.Scene} scene - The current Babylon.js scene.
 * @param {Array} cabinets - Array of cabinet instances.
 * @param {BABYLON.Engine} engine - The Babylon.js engine.
 */
export const recenterCamera = (scene, cabinets, engine) => {
    if (cabinets.length === 0) return;

    let min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    let max = new BABYLON.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

    // Calculate bounding box for all cabinets
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

    // Adjust camera target and orthographic bounds
    camera.target = center;

    const aspectRatio = engine.getRenderWidth() / engine.getRenderHeight();
    const maxDim = Math.max(size.x, size.y * aspectRatio) * 0.75;

    camera.orthoLeft = -maxDim * aspectRatio;
    camera.orthoRight = maxDim * aspectRatio;
    camera.orthoTop = maxDim;
    camera.orthoBottom = -maxDim;
};

/**
 * Converts inches to millimeters.
 * @param {number} inches - Value in inches to be converted.
 * @returns {number} Value in millimeters.
 */
export const inchesToMillimeters = (inches) => {
    return inches * 25.4;
};

/**
 * Converts millimeters to inches.
 * @param {number} millimeters - Value in millimeters to be converted.
 * @returns {number} Value in inches.
 */
export const millimetersToInches = (millimeters) => {
    return millimeters / 25.4;
};