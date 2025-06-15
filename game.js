import { Application, Assets, Sprite, Graphics, Text, TextStyle } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';

async function run() {
    const app = new Application();
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x333333,
    });

    document.body.appendChild(app.canvas);

    const michielTexture = await Assets.load('assets/sprites/michiel.png');
    const fruitTexture = await Assets.load('assets/sprites/strawberry.png');

    // Score tracking
    let collectedCount = 0;

    const style = new TextStyle({
        fill: '#ffffff',
        fontSize: 24,
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4,
    });

    const fruitSprites = [];
    const fruitsToSpawn = 2;
    const fruitPlatformIndexes = [];

    const scoreText = new Text(`Fruit: 0/${fruitSprites.length}`, style);
    scoreText.x = 20;
    scoreText.y = 20;
    app.stage.addChild(scoreText);

    const michiel = new Sprite(michielTexture);
    michiel.anchor.set(0.5);
    michiel.scale.set(0.3);
    michiel.x = app.screen.width / 2;
    michiel.y = 0;
    michiel.vy = 0; // vertical speed/gravity effect
    app.stage.addChild(michiel);

    // Platforms (uiteindelijk moet dit random gegenereerd worden, maar voor nu hardcoded)
    // const midY = app.screen.heighth/2; // Dit is de hoogte van het midden van het scherm, hiermee kunnen we later de platformen op goede hoogte forceren.
    const platforms = [
        { x: 0, y: app.screen.height - 50, width: app.screen.width, height: 50 }, // Vloer
        { x: 100, y: 685, width: 200, height: 20 },
        { x: app.screen.width - 300, y: 536, width: 200, height: 20 },
        { x: 300, y: 636, width: 200, height: 20 },
        { x: app.screen.width - 500, y: 840, width: 200, height: 20 },
        { x: app.screen.width / 2 - 100, y: 550, width: 200, height: 20 },
    ];

    const platformGraphics = new Graphics();
    platformGraphics.beginFill(0x888888);
    platforms.forEach(p => {
        platformGraphics.drawRect(p.x, p.y, p.width, p.height);
    });
    platformGraphics.endFill();
    app.stage.addChild(platformGraphics);

    // Pick unique random platforms (excluding floor)
    while (fruitPlatformIndexes.length < fruitsToSpawn) {
        const index = Math.floor(Math.random() * (platforms.length - 1)) + 1;
        if (!fruitPlatformIndexes.includes(index)) {
            fruitPlatformIndexes.push(index);
        }
    }

    for (const index of fruitPlatformIndexes) {
        const plat = platforms[index];
        const fruit = new Sprite(fruitTexture);
        fruit.anchor.set(0.5);
        fruit.scale.set(0.15);
        fruit.x = plat.x + Math.random() * (plat.width - 40) + 5; // small margin
        fruit.y = plat.y - 50;
        fruit.collected = false;
        fruitSprites.push(fruit);
        app.stage.addChild(fruit);
    }

    // Keyboard input
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

        // Fruit collision detection
        fruitSprites.forEach(fruit => {
            if (!fruit.collected && Math.abs(michiel.x - fruit.x) < 30 && Math.abs(michiel.y - fruit.y) < 30) {
                fruit.collected = true;
                fruit.visible = false;
                collectedCount++;
                scoreText.text = `Fruit: ${collectedCount}/${fruitSprites.length}`;
            }
        });

        // Horizontal movement
        if (keys["ArrowLeft"]) michiel.x -= 5;
        if (keys["ArrowRight"]) michiel.x += 5;

        // Jump
        if (keys["Space"] && isStandingOnPlatform(michiel)) {
            michiel.vy = jumpVelocity;
        }

        // Grivity toepassen
        michiel.vy += gravity;
        michiel.y += michiel.vy;

        // Platform logica (checkt voor collision tussen michiel en platforms)
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
        if (michiel.x < 35) michiel.x = 35;
        if (michiel.x > app.screen.width - 35) michiel.x = app.screen.width - 35;
        if (michiel.y > app.screen.height + 200) michiel.y = 0; // Als je teveel naar beneden vaalt respawn je. Wel knap als dat je lukt
    });
}

run();
