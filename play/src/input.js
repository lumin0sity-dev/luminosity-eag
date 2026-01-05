// input.js — keyboard + mouse + block interactions
class Input {
  constructor({domElement, camera, world, player}) {
    this.dom = domElement;
    this.camera = camera;
    this.world = world;
    this.player = player;

    this.keys = {};
    this.mouse = {x:0,y:0};
    this.heldBlock = 1; // default grass

    // pointer lock
    this.dom.addEventListener('click', ()=> {
      this.dom.requestPointerLock?.();
    });
    document.addEventListener('pointerlockchange', ()=> {
      this.locked = document.pointerLockElement === this.dom;
    });

    document.addEventListener('mousemove', (e)=> {
      if (this.locked) this.onMouseMove(e.movementX, e.movementY);
    });

    document.addEventListener('keydown', (e)=> this.keys[e.code] = true);
    document.addEventListener('keyup', (e)=> this.keys[e.code] = false);

    // mouse buttons for block interactions
    this.dom.addEventListener('mousedown', (e)=> {
      if (!this.locked) return;
      if (e.button === 0) this.breakBlock();
      if (e.button === 2) this.placeBlock();
    });

    // prevent context menu
    this.dom.addEventListener('contextmenu', (e)=> e.preventDefault());
  }

  setHeldBlock(id) { this.heldBlock = id; }

  onMouseMove(dx,dy) {
    this.player.setRotation(dx, dy);
  }

  update(dt) {
    // movement
    const forward = (this.keys['KeyW']?1:0) - (this.keys['KeyS']?1:0);
    const right = (this.keys['KeyD']?1:0) - (this.keys['KeyA']?1:0);
    this.player.moveLocal(forward, right, dt);
  }

  breakBlock() {
    // raycast
    const origin = this.camera.position.clone();
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const hit = this.world.raycast(origin, dir, 100);
    if (hit.hit) {
      const {x,y,z} = hit.block;
      this.world.removeBlock(x,y,z);
    }
  }

  placeBlock() {
    const origin = this.camera.position.clone();
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const hit = this.world.raycast(origin, dir, 100);
    if (hit.hit) {
      // place adjacent: step back along direction a bit to find empty spot
      const p = hit.point.clone().addScaledVector(dir, -0.6);
      const px = Math.floor(p.x), py = Math.floor(p.y), pz = Math.floor(p.z);
      // don't place inside player height — quick check
      this.world.addBlock(px, py, pz, this.heldBlock);
    } else {
      // place in front at some distance
      const p = origin.clone().addScaledVector(dir, 5);
      const px = Math.floor(p.x), py = Math.floor(p.y), pz = Math.floor(p.z);
      this.world.addBlock(px, py, pz, this.heldBlock);
    }
  }
}
