import * as THREE from 'three';
import { Cabinet } from './Cabinet';
import { CabinetOptions } from './Cabinet';

export class Measurements {
  private group: THREE.Group;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  attachTo(cabinet: Cabinet) {
    this.update(cabinet['options'], cabinet);
  }

  update(options: CabinetOptions, cabinet: Cabinet) {
    this.group.clear();
    const { width, height, depth } = options;
    const pos = cabinet['options'].position;

    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const textColor = '#000000';

    const createLine = (start: THREE.Vector3, end: THREE.Vector3) => {
      const points = [start, end];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, material);
    };

    const createLabel = (text: string, position: THREE.Vector3) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      context.font = '48px Arial';
      context.fillStyle = textColor;
      context.fillText(text, 10, 48);
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(10, 5, 1);
      sprite.position.copy(position);
      return sprite;
    };

    const offset = 5;

    // Width line
    const widthStart = new THREE.Vector3(pos.x - width / 2, pos.y - height / 2 - offset, pos.z + depth / 2 + 1);
    const widthEnd = new THREE.Vector3(pos.x + width / 2, pos.y - height / 2 - offset, pos.z + depth / 2 + 1);
    this.group.add(createLine(widthStart, widthEnd));
    this.group.add(createLabel(`${width}"`, new THREE.Vector3(pos.x, pos.y - height / 2 - offset, pos.z + depth / 2 + 1)));

    // Height line
    const heightStart = new THREE.Vector3(pos.x + width / 2 + offset, pos.y - height / 2, pos.z + depth / 2 + 1);
    const heightEnd = new THREE.Vector3(pos.x + width / 2 + offset, pos.y + height / 2, pos.z + depth / 2 + 1);
    this.group.add(createLine(heightStart, heightEnd));
    this.group.add(createLabel(`${height}"`, new THREE.Vector3(pos.x + width / 2 + offset + 8, pos.y, pos.z + depth / 2 + 1)));

    // Depth line
    const depthStart = new THREE.Vector3(pos.x + width / 2 + 1, pos.y - height / 2 - offset, pos.z - depth / 2);
    const depthEnd = new THREE.Vector3(pos.x + width / 2 + 1, pos.y - height / 2 - offset, pos.z + depth / 2);
    this.group.add(createLine(depthStart, depthEnd));
    this.group.add(createLabel(`${depth}"`, new THREE.Vector3(pos.x + width / 2 + 1, pos.y - height / 2 - offset, pos.z)));

    this.scene.add(this.group);
  }

  dispose() {
    this.scene.remove(this.group);
  }
}
