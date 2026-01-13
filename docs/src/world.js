// world.js — voxel world with terrain generation and block management
// TextureLoader: load block textures
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('textures/grass.png');
const dirtTexture = textureLoader.load('textures/dirt.png');
const stoneTexture = textureLoader.load('textures/stone.png');

grassTexture.magFilter = THREE.NearestFilter;
grassTexture.minFilter = THREE.NearestMipMapNearestFilter;
dirtTexture.magFilter = THREE.NearestFilter;
dirtTexture.minFilter = THREE.NearestMipMapNearestFilter;
stoneTexture.magFilter = THREE.NearestFilter;
stoneTexture.minFilter = THREE.NearestMipMapNearestFilter;

// Block type definitions
const blockTypes = {
  0: { name: 'air', solid: false },
  1: { name: 'grass', solid: true, texture: grassTexture, color: 0x4c6a24 },
  2: { name: 'dirt',  solid: true, texture: dirtTexture, color: 0x8b5a2b },
  3: { name: 'stone', solid: true, texture: stoneTexture, color: 0x808080 },
};

class VoxelWorld {
  constructor(opts = {}) {
    this.scene = opts.scene;
    this.blocks = {}; // {x,y,z} -> blockTypeId
  }

  setBlock(x, y, z, typeId) {
    const key = `${x},${y},${z}`;
    if (typeId === 0) {
      delete this.blocks[key];
    } else {
      this.blocks[key] = typeId;
    }
  }

  getBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    return this.blocks[key] || 0;
  }

  generateTerrain(sizeX, sizeZ, maxHeight) {
    // Simple terrain generation
    for (let x = 0; x < sizeX; x++) {
      for (let z = 0; z < sizeZ; z++) {
        // Create height variation using simple noise-like pattern
        const height = Math.floor(maxHeight * 0.3 + 
          Math.sin(x * 0.1) * 5 + 
          Math.cos(z * 0.1) * 5 +
          Math.sin((x + z) * 0.05) * 3);
        
        for (let y = 0; y < height; y++) {
          if (y === height - 1) {
            this.setBlock(x, y, z, 1); // grass on top
          } else if (y > height - 4) {
            this.setBlock(x, y, z, 2); // dirt below grass
          } else {
            this.setBlock(x, y, z, 3); // stone at bottom
          }
        }
      }
    }
  }

  buildInstancedMeshes() {
    // Clear existing meshes
    if (this.meshGroup) {
      this.scene.remove(this.meshGroup);
    }
    
    this.meshGroup = new THREE.Group();
    
    // Create individual meshes for each block
    for (const [key, typeId] of Object.entries(this.blocks)) {
      const [x, y, z] = key.split(',').map(Number);
      const blockType = blockTypes[typeId];
      
      if (!blockType || !blockType.solid) continue;
      
      const geom = new THREE.BoxGeometry(1, 1, 1);
      let mat;
      
      if (blockType.texture) {
        mat = new THREE.MeshLambertMaterial({ map: blockType.texture });
      } else if (blockType.color) {
        mat = new THREE.MeshLambertMaterial({ color: blockType.color });
      } else {
        mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      }
      
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      this.meshGroup.add(mesh);
    }
    
    this.scene.add(this.meshGroup);
  }

  toJSON() {
    return {
      blocks: this.blocks
    };
  }

  fromJSON(data) {
    this.blocks = data.blocks || {};
    this.buildInstancedMeshes();
  }

  addBlock(x, y, z, typeId) {
    this.setBlock(x, y, z, typeId);
    this.buildInstancedMeshes();
  }

  removeBlock(x, y, z) {
    this.setBlock(x, y, z, 0);
    this.buildInstancedMeshes();
  }

  raycast(origin, direction, maxDistance) {
    // Simple DDA raycast through voxel grid
    const step = 0.1;
    let t = 0;
    
    while (t < maxDistance) {
      const x = Math.floor(origin.x + direction.x * t);
      const y = Math.floor(origin.y + direction.y * t);
      const z = Math.floor(origin.z + direction.z * t);
      
      const blockId = this.getBlock(x, y, z);
      if (blockId !== 0) {
        return {
          hit: true,
          block: { x, y, z },
          point: new THREE.Vector3(
            origin.x + direction.x * t,
            origin.y + direction.y * t,
            origin.z + direction.z * t
          ),
          distance: t
        };
      }
      
      t += step;
    }
    
    return { hit: false };
  }
}
