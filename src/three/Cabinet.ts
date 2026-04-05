import * as THREE from 'three';

export type CabinetOptions = {
  width?: number;
  height?: number;
  depth?: number;
  thickness?: number;
  doorConfig?: 'single' | 'double';
  handleSide?: 'left' | 'right';
  position?: THREE.Vector3;
};

export class Cabinet {
  public meshes: THREE.Mesh[] = [];
  private scene: THREE.Scene;
  private options: Required<CabinetOptions>;

  constructor(scene: THREE.Scene, opts: CabinetOptions = {}) {
    this.scene = scene;
    this.options = {
      width: 30,
      height: 72,
      depth: 24,
      thickness: 0.75,
      doorConfig: 'single',
      handleSide: 'right',
      position: new THREE.Vector3(0, 0, 0),
      ...opts,
    };

    this.createCabinet();
  }

  private createBoard(name: string, width: number, height: number, depth: number, pos: THREE.Vector3): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.copy(pos);
    
    // Add edge outline
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    );
    mesh.add(line);

    this.scene.add(mesh);
    return mesh;
  }

  private createCabinet() {
    const { width, height, depth, thickness, doorConfig, handleSide, position } = this.options;

    const boards: THREE.Mesh[] = [];

    boards.push(this.createBoard('leftSide', thickness, height, depth - thickness, new THREE.Vector3(-width / 2 + thickness / 2, 0, -thickness / 2)));
    boards.push(this.createBoard('rightSide', thickness, height, depth - thickness, new THREE.Vector3(width / 2 - thickness / 2, 0, -thickness / 2)));
    boards.push(this.createBoard('topSide', width - thickness * 2, thickness, depth - thickness, new THREE.Vector3(0, height / 2 - thickness / 2, -thickness / 2)));
    boards.push(this.createBoard('bottomSide', width - thickness * 2, thickness, depth - thickness, new THREE.Vector3(0, -height / 2 + thickness / 2, -thickness / 2)));
    boards.push(this.createBoard('backSide', width - thickness * 2, height - thickness * 2, thickness, new THREE.Vector3(0, 0, -depth / 2 + thickness / 2)));

    // Shelf
    boards.push(this.createBoard('shelf', width - thickness * 2, thickness, depth - (thickness * 2) - 1.5, new THREE.Vector3(0, thickness / 2, -(thickness) - 0.75)));

    // Doors
    // if (doorConfig === 'single') {
    //   const door = this.createBoard('door', width - 0.1, height, thickness, new THREE.Vector3(0, 0, depth / 2 - thickness / 2));
    //   if (handleSide === 'left') {
    //     door.rotation.y = Math.PI;
    //     door.position.x = -door.position.x;
    //   }
    //   boards.push(door);
    // } else {
    //   const doorWidth = width / 2 - 0.05;
    //   boards.push(this.createBoard('doorLeft', doorWidth, height, thickness, new THREE.Vector3(-doorWidth / 2, 0, depth / 2 - thickness / 2)));
    //   boards.push(this.createBoard('doorRight', doorWidth, height, thickness, new THREE.Vector3(doorWidth / 2, 0, depth / 2 - thickness / 2)));
    // }

    // Materials
    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    boards.forEach(mesh => {
      mesh.material = mesh.name.includes('door') ? woodMaterial : whiteMaterial;
      mesh.position.add(position);
    });

    this.meshes = boards;
  }

  public update(options: CabinetOptions) {
    this.meshes.forEach(mesh => mesh.removeFromParent());
    this.options = { ...this.options, ...options };
    this.createCabinet();
  }
}
