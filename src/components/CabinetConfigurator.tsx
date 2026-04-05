// File: src/components/CabinetConfigurator.tsx

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Accordion, Form } from 'react-bootstrap';
import { Cabinet } from '../three/Cabinet';
import { Measurements } from '../three/Measurements';

const CabinetConfigurator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);

  const [options, setOptions] = useState({
    width: 30,
    height: 72,
    depth: 24,
    doorConfig: 'single',
    handleSide: 'right',
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    setScene(scene);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(100, 100, 100);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 36, 0);
    controls.update();

    const light = new THREE.HemisphereLight(0xffffff, 0xcccccc, 2.3);
    scene.add(light);

    const newCabinet = new Cabinet(scene, {
      ...options,
      position: new THREE.Vector3(0, 36, 0),
    });
    setCabinet(newCabinet);

    const newMeasurements = new Measurements(scene);
    // newMeasurements.attachTo(newCabinet);
    // setMeasurements(newMeasurements);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      newCabinet.meshes.forEach(m => m.removeFromParent());
      newMeasurements.dispose();
    };
  }, []);

  useEffect(() => {
    if (cabinet) {
      cabinet.update(options);
    }
    if (measurements && cabinet) {
      measurements.update(options, cabinet);
    }
  }, [options]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: name === 'width' || name === 'height' || name === 'depth' ? parseFloat(value) : value,
    }));
  };

  return (
    <div className="configurator">
      <div className="sidebar">
        <h4 className="mb-3">Cabinet Configurator</h4>
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Dimensions</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-2">
                <Form.Label>Width (in)</Form.Label>
                <Form.Control type="number" name="width" value={options.width} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Height (in)</Form.Label>
                <Form.Control type="number" name="height" value={options.height} onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Depth (in)</Form.Label>
                <Form.Control type="number" name="depth" value={options.depth} onChange={handleChange} />
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Doors</Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-2">
                <Form.Label>Door Configuration</Form.Label>
                <Form.Select name="doorConfig" value={options.doorConfig} onChange={handleChange}>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Handle Side</Form.Label>
                <Form.Select name="handleSide" value={options.handleSide} onChange={handleChange}>
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </Form.Select>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>
      <div className="canvas-container">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
};

export default CabinetConfigurator;