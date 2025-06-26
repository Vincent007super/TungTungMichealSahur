import { Application, Assets, Sprite, Text, TextStyle } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';
import { Boss } from '/boss.js';
import { PlatformManager } from './Platform.js';

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
    let bossStarted = false;
    let cherepanov;

    // Score tracking
    let reachedMaxFruits = false;
    let maxFruits = 3;
    let collectedCount = 0;

    const style = new TextStyle({
        fill: '#ffffff',
        fontSize: 24,
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 5,
    });

    const platformManager = new PlatformManager(app, fruitTexture, maxFruits);
    function updateFruitLimits() {
        platformManager.setFruitLimits(collectedCount, maxFruits);
    }
    const scoreText = new Text(`Fruit: 0`, style);
    scoreText.x = 20;
    scoreText.y = 20;
    app.stage.addChild(scoreText);

    const michiel = new Sprite(michielTexture);
    michiel.anchor.set(0.5);
    michiel.scale.set(0.3);
    michiel.x = app.screen.width / 2;
    michiel.y = 0;
    michiel.vy = 0;
    michiel.width = 250;
    app.stage.addChild(michiel);

    // Keyboard input
    const keys = {};
    window.addEventListener("keydown", e => keys[e.code] = true);
    window.addEventListener("keyup", e => keys[e.code] = false);

    const gravity = 0.5;
    const jumpVelocity = -20;

    function isStanding(michiel, platforms, floor) {
        const feetX = michiel.x;
        const feetY = michiel.y + michiel.height / 2;
    
        const onPlatform = platforms.some(p => {
            return (
                feetX > p.x &&
                feetX < p.x + p.width &&
                feetY >= p.y &&
                feetY <= p.y + p.height
            );
        });
    
        const onFloor =
            feetX > floor.x &&
            feetX < floor.x + floor.width &&
            feetY >= floor.y &&
            feetY <= floor.y + floor.height;
    
        return onPlatform || onFloor;
    }

    app.ticker.add(() => {
        platformManager.update();

        const platforms = platformManager.getPlatforms();
        const fruitSprites = platformManager.getFruits();

        // Fruit collection logic
        fruitSprites.forEach(fruit => {
            const dx = michiel.x - fruit.x;
            const dy = michiel.y - fruit.y;
            if (!fruit.collected && Math.abs(dx) < 30 && Math.abs(dy) < 30 && !reachedMaxFruits) {
                fruit.collected = true;
                collectedCount++;
                updateFruitLimits();
            
                if (collectedCount == 1 && !bossStarted) {
                    bossStarted = true;
                    cherepanov = new Boss(app, michiel); // Pass app and player to boss logic
                    cherepanov.spawn();
                }
                scoreText.text = `Fruit: ${collectedCount}/${maxFruits}`;

                // Animate collection
                let scaleUp = true;
                const animation = () => {
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
        if (keys["ArrowLeft"] || keys["KeyA"]) michiel.x -= 7.5;
        if (keys["ArrowRight"] || keys["KeyD"]) michiel.x += 7.5;

        // Jump
        if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && isStanding(michiel, platforms, platformManager.getFloor())) {
            michiel.vy = jumpVelocity;
        }
        
        michiel.vy += gravity;
        michiel.y += michiel.vy;

        // Platform collision
        const platform = platforms.find(p => {
            const feetX = michiel.x;
            const feetY = michiel.y + michiel.height / 2;
            const wasFalling = michiel.vy >= 0;
            const withinX = feetX > p.x && feetX < p.x + p.width;
            const hittingTop = feetY >= p.y && feetY <= p.y + p.height;
            return withinX && hittingTop && wasFalling;
        });

        const floor = platformManager.getFloor();
        const feetX = michiel.x;
        const feetY = michiel.y + michiel.height / 2;
        
        const onFloor =
            michiel.vy >= 0 &&
            feetX > floor.x &&
            feetX < floor.x + floor.width &&
            feetY >= floor.y &&
            feetY <= floor.y + floor.height;
        
        if (platform || onFloor) {
            michiel.vy = 0;
            michiel.y = (platform || floor).y - michiel.height / 2;
        }

        // Basic bounds
        if (michiel.x < 35) michiel.x = 35;
        if (michiel.x > app.screen.width - 35) michiel.x = app.screen.width - 35;
        if (michiel.y > app.screen.height + 200) michiel.y = 0;

        if (bossStarted && cherepanov) {
            cherepanov.update(1); // Or delta time if you're using it
        }
    });
}

run();
