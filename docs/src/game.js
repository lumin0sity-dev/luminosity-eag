// game.js — initializes renderer, world, player, input and runs loop
class Game {
  constructor(opts = {}) {
    this.container = opts.container || document.body;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, this.width/this.height, 0.1, 1000);
    this.camera.position.set(0, 30, 40);

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x87ceeb);
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this.onResize());

    // basic lighting
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(100, 200, 100);
    this.scene.add(dir);
    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(amb);

    // world
    this.world = new VoxelWorld({scene: this.scene});
    // player
    this.player = new Player({camera: this.camera, world: this.world});
    // input
    this.input = new Input({domElement: this.renderer.domElement, camera: this.camera, world: this.world, player: this.player});
    // inventory + save
    this.inventory = new Inventory({onSelect: (id)=> this.input.setHeldBlock(id)});
    this.saveManager = new SaveManager({world: this.world});

    // UI bindings
    document.getElementById('saveBtn').addEventListener('click', ()=> this.saveManager.save());
    document.getElementById('loadBtn').addEventListener('click', ()=> document.getElementById('loadInput').click());
    document.getElementById('loadInput').addEventListener('change', (e)=> {
      const f = e.target.files[0];
      if (f) this.saveManager.loadFile(f);
    });

    // friendly orbit control toggle for dev (press O)
    this.useOrbit = false;
    this.orbit = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enabled = false;

    this.lastTime = performance.now();
    this.fpsCounter = document.getElementById('fps');

    // initial generate
    this.world.generateTerrain(64, 64, 48);
    this.world.buildInstancedMeshes();

    // set default held block
    this.input.setHeldBlock(this.inventory.selected);
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  start() {
    this.running = true;
    this.loop();
  }

  loop() {
    if (!this.running) return;
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.player.update(dt);
    this.input.update(dt);

    this.renderer.render(this.scene, this.camera);

    // update FPS
    this.fpsCounter.textContent = `FPS: ${Math.round(1/dt)}`;

    requestAnimationFrame(()=> this.loop());
  }
}
