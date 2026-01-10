// (minimal code change) Wire up texture support for grass, dirt, stone blocks
import * as THREE from 'three';

// TextureLoader: load block textures
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('docs/textures/grass.png');
const dirtTexture = textureLoader.load('docs/textures/dirt.png');
const stoneTexture = textureLoader.load('docs/textures/stone.png');

grasstexture.magFilter = THREE.NearestFilter;
grasstexture.minFilter = THREE.NearestMipMapNearestFilter;
dirtTexture.magFilter = THREE.NearestFilter;
dirtTexture.minFilter = THREE.NearestMipMapNearestFilter;
stoneTexture.magFilter = THREE.NearestFilter;
stoneTexture.minFilter = THREE.NearestMipMapNearestFilter;

// Block type definitions (minimal: only 1–3 are affected)
export const blockTypes = {
  0: { name: 'air', solid: false },
  1: { name: 'grass', solid: true, texture: grassTexture },
  2: { name: 'dirt',  solid: true, texture: dirtTexture },
  3: { name: 'stone', solid: true, texture: stoneTexture },
};

// When creating a block mesh:
// Use texture if available, else fall back to original color logic
export function createBlockMesh(typeId) {
  const blockType = blockTypes[typeId];
  const geom = new THREE.BoxGeometry(1, 1, 1);
  let mat;
  if (blockType && blockType.texture) {
    mat = new THREE.MeshBasicMaterial({ map: blockType.texture });
  } else if (blockType && blockType.color) {
    mat = new THREE.MeshBasicMaterial({ color: blockType.color });
  } else {
    mat = new THREE.MeshBasicMaterial({ visible: false });
  }
  return new THREE.Mesh(geom, mat);
}
