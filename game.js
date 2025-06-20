import { Application, Assets, Sprite, Graphics, Text, TextStyle, Container } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';
import { Boss } from '/boss.js';

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
    const thomasTexture = await Assets.load('assets/sprites/thomas_de_trein.png');

    // Score tracking
    let collectedCount = 0;

    const style = new TextStyle({
        fill: '#ffffff',
        fontSize: 24,
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 5,
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
    michiel.vy = 0;
    app.stage.addChild(michiel);

    const maxPlatformHeight = app.screen.height - 450;

    const platforms = [
        { x: 0, y: maxPlatformHeight + 400, width: app.screen.width, height: 50 },
        { x: 100, y: maxPlatformHeight + 200, width: 200, height: 20 },
        { x: app.screen.width - 300, y: maxPlatformHeight + 400, width: 200, height: 20 },
        { x: 300, y: maxPlatformHeight + 250, width: 200, height: 20 },
        { x: app.screen.width - 500, y: maxPlatformHeight + 223, width: 200, height: 20 },
        { x: app.screen.width / 2 - 100, y: maxPlatformHeight + 150, width: 200, height: 20 },
    ];

    const platformGraphics = new Graphics();
    platformGraphics.beginFill(0x888888);
    platforms.forEach(p => {
        platformGraphics.drawRect(p.x, p.y, p.width, p.height);
    });
    platformGraphics.endFill();
    app.stage.addChild(platformGraphics);

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
        fruit.x = plat.x + Math.random() * (plat.width - 40) + 5;
        fruit.y = plat.y - 50;
        fruit.collected = false;
        fruitSprites.push(fruit);
        app.stage.addChild(fruit);
    }

    // Voeg Boss toe
    const thomasBoss = new Boss(thomasTexture, app.screen.width - 100, maxPlatformHeight + 150);
    app.stage.addChild(thomasBoss.container);

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
        // Fruit collision detection + animatie
        fruitSprites.forEach(fruit => {
            if (!fruit.collected && Math.abs(michiel.x - fruit.x) < 30 && Math.abs(michiel.y - fruit.y) < 30) {
                fruit.collected = true;
                collectedCount++;
                scoreText.text = `Fruit: ${collectedCount}/${fruitSprites.length}`;

                let scaleUp = true;
                const animation = delta => {
                    if (scaleUp) {
                        fruit.scale.x += 0.05;
                        fruit.scale.y += 0.05;
                        if (fruit.scale.x >= 0.25) scaleUp = false;
                    } else {
                        fruit.scale.x -= 0.05;
                        fruit.scale.y -= 0.05;
                        if (fruit.scale.x <= 0.05) {
                            fruit.visible = false;
                            app.ticker.remove(animation);
                        }
                    }
                };
                app.ticker.add(animation);
            }
        });

        // Horizontal movement
        if (keys["ArrowLeft"] || keys["KeyA"]) michiel.x -= 5;
        if (keys["ArrowRight"] || keys["KeyD"]) michiel.x += 5;

        // Jump
        if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && isStandingOnPlatform(michiel)) {
            michiel.vy = jumpVelocity;
        }

        michiel.vy += gravity;
        michiel.y += michiel.vy;

        // Platform collision
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
        if (michiel.y > app.screen.height + 200) michiel.y = 0;

        // Boss update
        thomasBoss.update();
    });
}

run();
