import { Application, Assets, Sprite, Text, TextStyle, Graphics } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';
import { Boss } from '/boss.js';
import { PlatformManager } from './Platform.js';
import { Player } from './player.js';

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

    // Gebruik de Player klasse in plaats van alleen een Sprite
    const michiel = new Player(michielTexture, app.screen.width / 2, 0);
    app.stage.addChild(michiel.sprite);
    app.stage.addChild(michiel.healthBar);

    // Keyboard input
    const keys = {};
    window.addEventListener("keydown", e => keys[e.code] = true);
    window.addEventListener("keyup", e => keys[e.code] = false);

    const gravity = 0.5;
    const jumpVelocity = -20;

    function isStanding(michiel, platforms, floor) {
        const feetX = michiel.x;
        const feetY = michiel.y + michiel.sprite.height / 2;
    
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
            
                // if (collectedCount == 1 && !bossStarted) {
                //     bossStarted = true;
                //     cherepanov = new Boss(app, michiel);
                //     cherepanov.spawn();
                // }

                if (collectedCount === 2) {
                    // Create a semi-transparent background
                    const background = new Graphics();
                    background.beginFill(0x000000, 0.7);
                    background.drawRect(0, 0, app.screen.width, app.screen.height);
                    background.endFill();
                    app.stage.addChild(background);

                    // Create the popup text
                    const popupText = new Text('Ga naar het volgende spel!', { fill: 'white', fontSize: 36, align: 'center' });
                    popupText.anchor.set(0.5);
                    popupText.x = app.screen.width / 2;
                    popupText.y = app.screen.height / 2 - 50;
                    app.stage.addChild(popupText);

                    // Create the button
                    const button = new Graphics();
                    button.beginFill(0x4CAF50);
                    button.drawRect(-100, -25, 200, 50);
                    button.endFill();
                    button.x = app.screen.width / 2;
                    button.y = app.screen.height / 2 + 50;
                    button.interactive = true;
                    button.buttonMode = true;
                    button.on('pointerdown', () => {
                        window.location.href = 'https://michielmobiel.vercel.app/';
                    });
                    app.stage.addChild(button);

                    const buttonText = new Text('Klik hier', { fill: 'white', fontSize: 24 });
                    buttonText.anchor.set(0.5);
                    button.addChild(buttonText);
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

        // Update player met nieuwe Player klasse
        michiel.update(keys, gravity, jumpVelocity, platforms.concat([platformManager.getFloor()]));

        // Boss update en collision detection - GEFIXTE VERSIE
        // if (bossStarted && cherepanov) {
        //     cherepanov.update(1);
            
        //     // Check collision tussen coals en Michiel - ALLEEN MICHIEL KRIJGT DAMAGE
        //     const coalsToRemove = [];
            
        //     for (let i = cherepanov.projectiles.length - 1; i >= 0; i--) {
        //         const coal = cherepanov.projectiles[i];
                
        //         // Simpelere checks - alleen controleren of coal bestaat
        //         if (!coal || !coal.parent) {
        //             coalsToRemove.push(i);
        //             continue;
        //         }
                
        //         let coalHit = false;
                
        //         // Check collision met Michiel
        //         if (!coalHit && coal.checkCollision && typeof coal.checkCollision === 'function' && michiel.health > 0) {
        //             try {
        //                 if (coal.checkCollision(michiel)) {
        //                     // Coal raakt Michiel
        //                     michiel.takeDamage(coal.damage || 10);
        //                     coalHit = true;
        //                 }
        //             } catch (error) {
        //                 console.warn("Michiel collision detection error:", error);
        //                 coalHit = true; // Verwijder problematische coal
        //             }
        //         }
                
        //         // Als coal iets heeft geraakt, markeer voor verwijdering
        //         if (coalHit) {
        //             coalsToRemove.push(i);
                    
        //             // Verwijder de coal van het scherm
        //             if (coal.parent) {
        //                 coal.parent.removeChild(coal);
        //             }
        //         }
        //     }
            
        //     // Verwijder alle gemarkeerde coals uit de projectiles array
        //     // Sorteer indices van hoog naar laag om array corruption te voorkomen
        //     coalsToRemove.sort((a, b) => b - a).forEach(index => {
        //         if (index >= 0 && index < cherepanov.projectiles.length) {
        //             cherepanov.projectiles.splice(index, 1);
        //         }
        //     });
        // }
    });
}

run();
