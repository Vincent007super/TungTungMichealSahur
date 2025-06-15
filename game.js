import { Application, Assets, Sprite, Graphics } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';

async function run() {
    const app = new Application();
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x333333,
    });

    document.body.appendChild(app.canvas);

run();
