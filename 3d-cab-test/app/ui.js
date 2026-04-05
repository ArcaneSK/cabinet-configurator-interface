export const setupUI = (cabinets, updateCabinet, addCabinet, deleteCabinet, toggleDoor) => {
    const toggleDoorButton = document.getElementById('toggleDoorButton');
    const widthSlider = document.getElementById('widthSlider');
    const heightSlider = document.getElementById('heightSlider');
    const depthSlider = document.getElementById('depthSlider');
    const addCabinetButton = document.getElementById('addCabinetButton');
    const deleteCabinetButton = document.getElementById('deleteCabinetButton');
    const doorConfigSelect = document.getElementById('doorConfigSelect');
    const handleSideSelect = document.getElementById('handleSideSelect');

    toggleDoorButton.addEventListener('click', toggleDoor);
    widthSlider.addEventListener('input', updateCabinet);
    heightSlider.addEventListener('input', updateCabinet);
    depthSlider.addEventListener('input', updateCabinet);
    doorConfigSelect.addEventListener('change', updateCabinet);
    handleSideSelect.addEventListener('change', updateCabinet);

    addCabinetButton.addEventListener('click', addCabinet);
    deleteCabinetButton.addEventListener('click', deleteCabinet);
};
