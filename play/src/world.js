// world.js — voxel world generation and instanced rendering
class VoxelWorld {
  constructor({scene}) {
    this.scene = scene;
    this.blocks = new Map(); // key "x,y,z" -> id
    this.chunkSize = 64;
    this.blockTypes = {
      1: {name:'Grass', color:0x55aa44},
      2: {name:'Dirt', color:0x8b5a2b},
      3: {name:'Stone', color:0x888888},
      4: {name:'Wood', color:0x8b6b2b},
      5: {name:'Leaves', color:0x2f9b2f}
    };
    this.instancedMeshes = {};
  }

  key(x,y,z){ return `${x},${y},${z}`; }
  setBlock(x,y,z,id){
    if (id===0) { this.blocks.delete(this.key(x,y,z)); return; }
    this.blocks.set(this.key(x,y,z), id);
  }
  getBlock(x,y,z){
    return this.blocks.get(this.key(x,y,z)) || 0;
  }

  generateTerrain(width=64, depth=64, maxHeight=40) {
    // Use Simplex Noise for heightmap
    const noise = new SimplexNoise();
    for(let x=-(width/2); x<width/2; x++){
      for(let z=-(depth/2); z<depth/2; z++){
        const nx = x/50, nz = z/50;
        const e = noise.noise2D(nx, nz) * 0.5 + 0.5;
        const hill = Math.floor(e * (maxHeight-6)) + 6;
        for(let y=0; y<=hill; y++){
          if (y === hill) {
            this.setBlock(x,y,z,1); // grass
          } else if (y > hill-4) {
            this.setBlock(x,y,z,2); // dirt
          } else {
            this.setBlock(x,y,z,3); // stone
          }
        }
        // add a few trees
        if (Math.random() < 0.02) this._placeTree(x, hill+1, z);
      }
    }
  }

  _placeTree(x, y, z) {
    const height = 4 + Math.floor(Math.random()*2);
    for(let i=0;i<height;i++) this.setBlock(x, y+i, z, 4);
    for(let dx=-2; dx<=2; dx++){
      for(let dz=-2; dz<=2; dz++){
        for(let dy=0; dy<=2; dy++){
          if (Math.abs(dx)+Math.abs(dz)+dy <= 3) this.setBlock(x+dx, y+height-1+dy, z+dz, 5);
        }
      }
    }
  }

  buildInstancedMeshes() {
    // Remove previous
    for (const m of Object.values(this.instancedMeshes)) {
      this.scene.remove(m.mesh);
    }
    this.instancedMeshes = {};
    // Count instances per type
    const counts = {};
    for (const id of this.blocks.values()) { counts[id] = (counts[id]||0)+1; }
    // Create instanced meshes
    const boxGeo = new THREE.BoxGeometry(1,1,1);
    for (const idStr of Object.keys(counts)) {
      const id = parseInt(idStr);
      const color = this.blockTypes[id]?.color || 0xffffff;
      const mat = new THREE.MeshLambertMaterial({color});
      const inst = new THREE.InstancedMesh(boxGeo, mat, counts[id]);
      inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.instancedMeshes[id] = {mesh: inst, nextIndex:0};
      this.scene.add(inst);
    }
    // Set instance matrices
    for (const [key, id] of this.blocks) {
      const [x,y,z] = key.split(',').map(Number);
      const data = this.instancedMeshes[id];
      if (!data) continue;
      const idx = data.nextIndex++;
      const m = new THREE.Object3D();
      m.position.set(x + 0.5, y + 0.5, z + 0.5);
      m.updateMatrix();
      data.mesh.setMatrixAt(idx, m.matrix);
    }
    // mark needs update
    for (const d of Object.values(this.instancedMeshes)) {
      d.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  // raycast utility: iterate along ray and find first block hit (simple stepping)
  raycast(origin, direction, maxDist=100) {
    const pos = origin.clone();
    const step = 0.2;
    for (let t=0; t<maxDist; t+=step){
      pos.addScaledVector(direction, step);
      const bx = Math.floor(pos.x);
      const by = Math.floor(pos.y);
      const bz = Math.floor(pos.z);
      const id = this.getBlock(bx,by,bz);
      if (id && id !== 0) {
        return {hit: true, block: {x:bx,y:by,z:bz,id}, point: pos.clone()};
      }
    }
    return {hit:false};
  }

  addBlock(x,y,z,id) {
    // prevent placing in negative heights if needed
    this.setBlock(x,y,z,id);
    this.buildInstancedMeshes();
  }

  removeBlock(x,y,z) {
    this.setBlock(x,y,z,0);
    this.buildInstancedMeshes();
  }

  toJSON() {
    // export block list and dims
    const arr = [];
    for (const [k, id] of this.blocks) arr.push({k, id});
    return {blocks: arr};
  }

  fromJSON(json) {
    this.blocks.clear();
    for (const e of json.blocks) {
      const [x,y,z] = e.k.split(',').map(Number);
      this.setBlock(x,y,z,e.id);
    }
    this.buildInstancedMeshes();
  }
}
