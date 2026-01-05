// inventory.js — simple inventory UI
class Inventory {
  constructor({onSelect}) {
    this.items = [
      {id:1, label:'Grass'},
      {id:2, label:'Dirt'},
      {id:3, label:'Stone'},
      {id:4, label:'Wood'},
      {id:5, label:'Leaves'}
    ];
    this.selected = 1;
    this.onSelect = onSelect;
    this.render();
  }

  render() {
    const container = document.getElementById('inventory');
    container.innerHTML = '';
    this.items.forEach(it => {
      const slot = document.createElement('div');
      slot.className = 'inv-slot' + (it.id === this.selected ? ' selected' : '');
      slot.textContent = it.label;
      slot.onclick = () => { this.selected = it.id; this.updateUI(); this.onSelect?.(it.id); };
      container.appendChild(slot);
    });
  }

  updateUI() { this.render(); }
}
