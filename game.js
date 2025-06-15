import { Application, Assets, Sprite, Graphics } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';

async function run() {
    const app = new Application();
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x333333,
    });

    document.body.appendChild(app.canvas);

    const michielTexture = await Assets.load('assets/sprites/michiel.png');

    const michiel = new Sprite(michielTexture);
    michiel.anchor.set(0.5);
    michiel.scale.set(0.3); // Make sure he's visible
    michiel.x = app.screen.width / 2;
    michiel.y = 0;
    michiel.vy = 0; // vertical speed
    app.stage.addChild(michiel);
    const keys = {};
    window.addEventListener("keydown", e => keys[e.code] = true);
    window.addEventListener("keyup", e => keys[e.code] = false);
    app.ticker.add(() => {
        // Horizontal movement
        if (keys["ArrowLeft"]) michiel.x -= 5;
        if (keys["ArrowRight"]) michiel.x += 5;
run();
