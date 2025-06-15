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

    // Platforms
    const platforms = [
        { x: 0, y: app.screen.height - 50, width: app.screen.width, height: 50 },
        { x: 150, y: app.screen.height - 150, width: 200, height: 20 },
        { x: 500, y: app.screen.height - 250, width: 150, height: 20 },
    ];

    const platformGraphics = new Graphics();
    platformGraphics.beginFill(0x888888);
    platforms.forEach(p => {
        platformGraphics.drawRect(p.x, p.y, p.width, p.height);
    });
    platformGraphics.endFill();
    app.stage.addChild(platformGraphics);

    // Input
    const keys = {};
    window.addEventListener("keydown", e => keys[e.code] = true);
    window.addEventListener("keyup", e => keys[e.code] = false);

    const gravity = 0.5;
    const jumpVelocity = -12;

    function isStandingOnPlatform(sprite) {
        const feetX = sprite.x;
        const feetY = sprite.y + sprite.height / 2;
        return platforms.some(p => {
            const withinX = feetX > p.x && feetX < p.x + p.width;
            const onTop = feetY >= p.y && feetY <= p.y + p.height;
            return withinX && onTop;
        });
    }

    app.ticker.add(() => {
        // Horizontal movement
        if (keys["ArrowLeft"]) michiel.x -= 5;
        if (keys["ArrowRight"]) michiel.x += 5;

        // Jump
        if (keys["Space"] && isStandingOnPlatform(michiel)) {
            michiel.vy = jumpVelocity;
        }

        // Apply gravity
        michiel.vy += gravity;
        michiel.y += michiel.vy;

        // Check for collision with platforms
        const platform = platforms.find(p => {
            const feetX = michiel.x;
            const feetY = michiel.y + michiel.height / 2;
            const wasAbove = michiel.vy >= 0;
            const withinX = feetX > p.x && feetX < p.x + p.width;
            const hittingTop = feetY >= p.y && feetY <= p.y + p.height;
            return withinX && hittingTop && wasAbove;
        });

        if (platform) {
            michiel.vy = 0;
            michiel.y = platform.y - michiel.height / 2;
        }

        // Basic bounds
        if (michiel.x < 0) michiel.x = 0;
        if (michiel.x > app.screen.width) michiel.x = app.screen.width;
        if (michiel.y > app.screen.height + 200) michiel.y = 0; // Respawn if fallen too far
    });
}

run();
