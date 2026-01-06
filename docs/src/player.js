// player.js — FPS-style player with basic collision
class Player {
  constructor({camera, world}) {
    this.camera = camera;
    this.world = world;
    this.velocity = new THREE.Vector3();
    this.speed = 8;
    this.gravity = -30;
    this.onGround = false;

    this.position = new THREE.Vector3(0, 25, 0);
    this.pitch = 0; this.yaw = 0;
    this.camera.position.copy(this.position);

    // look sensitivity
    this.sensitivity = 0.002;
  }

  setRotation(deltaYaw, deltaPitch) {
    this.yaw -= deltaYaw * this.sensitivity;
    this.pitch -= deltaPitch * this.sensitivity;
    this.pitch = Math.max(-Math.PI/2+0.01, Math.min(Math.PI/2-0.01, this.pitch));
    // update camera quaternion
    const quat = new THREE.Quaternion();
    quat.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
    this.camera.quaternion.copy(quat);
  }

  teleportTo(x,y,z) {
    this.position.set(x,y,z);
    this.camera.position.copy(this.position);
    this.velocity.set(0,0,0);
  }

  update(dt) {
    // apply gravity
    this.velocity.y += this.gravity * dt;

    // integrate
    const next = this.position.clone().addScaledVector(this.velocity, dt);

    // simple collision with blocks: sample the player's feet and head positions
    const footY = Math.floor(next.y);
    const footBlock = this.world.getBlock(Math.floor(next.x), footY-1, Math.floor(next.z));

    if (footBlock) {
      // stand on block
      next.y = Math.ceil(next.y);
      this.velocity.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    // TODO: more robust collision on X/Z — skip for basic demo
    this.position.copy(next);
    this.camera.position.copy(this.position);
  }

  moveLocal(forward, right, dt) {
    // forward/right are in [-1,1]
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const rightVec = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), dir).normalize();
    const move = dir.multiplyScalar(forward).add(rightVec.multiplyScalar(right)).multiplyScalar(this.speed);
    this.velocity.x = move.x;
    this.velocity.z = move.z;
  }
}
