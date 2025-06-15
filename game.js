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
    const enemyTexture = michielTexture; // Tijdelijk: gebruik Michiel sprite als vijand
    const projectileTexture = await Assets.load('assets/sprites/strawberry.png'); // Tijdelijk als kogel

    let collectedCount = 0;
    let lives = 3;

    const style = new TextStyle({
        fill: '#ffffff',
        fontSize: 24,
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4,
    });

    const scoreText = new Text(`Fruit: 0`, style);
    scoreText.x = 20;
    scoreText.y = 20;
    app.stage.addChild(scoreText);

    const livesText = new Text(`Lives: ${lives}`, style);
    livesText.x = 20;
    livesText.y = 50;
    app.stage.addChild(livesText);

    const michiel = new Sprite(michielTexture);
    michiel.anchor.set(0.5);
    michiel.scale.set(0.3);
    michiel.x = app.screen.width / 2;
    michiel.y = 0;
    michiel.vy = 0;
    app.stage.addChild(michiel);

    const platforms = [
        { x: 0, y: app.screen.height - 50, width: app.screen.width, height: 50 },
        { x: 100, y: 685, width: 200, height: 20 },
        { x: app.screen.width - 300, y: 536, width: 200, height: 20 },
        { x: 300, y: 636, width: 200, height: 20 },
        { x: app.screen.width - 500, y: 840, width: 200, height: 20 },
        { x: app.screen.width / 2 - 100, y: 550, width: 200, height: 20 },
    ];

    const platformGraphics = new Graphics();
    platformGraphics.beginFill(0x888888);
    platforms.forEach(p => platformGraphics.drawRect(p.x, p.y, p.width, p.height));
    platformGraphics.endFill();
    app.stage.addChild(platformGraphics);

    const fruitSprites = [];
    const fruitsToSpawn = 2;
    const fruitPlatformIndexes = [];

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

    // 👹 Enemy rechts, zelfde hoogte als Michiel
    const enemy = new Sprite(enemyTexture);
    enemy.anchor.set(0.5);
    enemy.scale.set(0.6); // groter
    enemy.x = app.screen.width - 100;
    enemy.y = michiel.y; // tijdelijk, wordt constant bijgewerkt
    app.stage.addChild(enemy);

    const projectiles = [];

    function shootProjectile() {
        const proj = new Sprite(projectileTexture);
        proj.anchor.set(0.5);
        proj.scale.set(0.1);
        proj.x = enemy.x - 60;
        proj.y = enemy.y;
        proj.vx = -6;
        projectiles.push(proj);
        app.stage.addChild(proj);
    }

    // Enemy schiet elke 1.5 seconden
    setInterval(() => {
        shootProjectile();
    }, 1500);

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
        // Beweeg Michiel
        if (keys["ArrowLeft"]) michiel.x -= 5;
        if (keys["ArrowRight"]) michiel.x += 5;
        if (keys["Space"] && isStandingOnPlatform(michiel)) {
            michiel.vy = jumpVelocity;
        }

        michiel.vy += gravity;
        michiel.y += michiel.vy;

        const platform = platforms.find(p => {
            const feetX = michiel.x;
            const feetY = michiel.y + michiel.height / 2;
            const wasFalling = michiel.vy >= 0;
            const withinX = feetX > p.x && feetX < p.x + p.width;
            const hittingTop = feetY >= p.y && feetY <= p.y + p.height;
            return withinX && hittingTop && wasFalling;
        });

        if (platform) {
            michiel.vy = 0;
            michiel.y = platform.y - michiel.height / 2;
        }

        // Enemy op gelijke hoogte als Michiel
        enemy.y = michiel.y;

        // Fruit verzamelen
        fruitSprites.forEach(fruit => {
            if (!fruit.collected && Math.abs(michiel.x - fruit.x) < 30 && Math.abs(michiel.y - fruit.y) < 30) {
                fruit.collected = true;
                fruit.visible = false;
                collectedCount++;
                scoreText.text = `Fruit: ${collectedCount}`;
            }
        });

        // Projectielen updaten
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const proj = projectiles[i];
            proj.x += proj.vx;

            if (Math.abs(proj.x - michiel.x) < 30 && Math.abs(proj.y - michiel.y) < 30) {
                lives--;
                livesText.text = `Lives: ${lives}`;
                app.stage.removeChild(proj);
                projectiles.splice(i, 1);

                if (lives <= 0) {
                    alert("Game Over 😵");
                    window.location.reload();
                }
                continue;
            }

            if (proj.x < -100) {
                app.stage.removeChild(proj);
                projectiles.splice(i, 1);
            }
        }

        // Grenschecks
        if (michiel.x < 35) michiel.x = 35;
        if (michiel.x > app.screen.width - 35) michiel.x = app.screen.width - 35;
        if (michiel.y > app.screen.height + 200) michiel.y = 0;
    });
}

run();
