# Eagler — Voxel demo (1.20 inspired)

This repository contains a lightweight web demo inspired by Minecraft 1.20. The playable demo is located in the `play/` folder and can be served via GitHub Pages at:

https://lumin0sity-dev.github.io/luminosity-eag/play

Features:
- Procedural terrain generation (Simplex noise)
- Player movement (FPS-style)
- Block placing and breaking (raycast-based)
- Inventory UI and block selection
- Instanced rendering for improved performance
- Save / Load world JSON

How to run locally
1. Clone the repo
2. Serve the `play` folder with a static server (e.g., `npx http-server play -p 8080`)

License: MIT
