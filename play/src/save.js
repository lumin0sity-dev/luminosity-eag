// save.js — export/import world
class SaveManager {
  constructor({world}) {
    this.world = world;
  }

  save() {
    const json = JSON.stringify(this.world.toJSON());
    const blob = new Blob([json], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `voxel-world-${Date.now()}.json`;
    a.click();
  }

  loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const obj = JSON.parse(e.target.result);
        this.world.fromJSON(obj);
      } catch (err) {
        alert('Failed to load world: ' + err.message);
      }
    };
    reader.readAsText(file);
  }
}
