// Platforms.js
import { Graphics, Sprite } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';

export class PlatformManager {
    constructor(app, fruitTexture, platformSpeed = 5) {
        this.app = app;
        this.platformSpeed = platformSpeed;
        this.fruitTexture = fruitTexture;
        this.spawnCooldown = 2005;

        this.platforms = [];
        this.fruitSprites = [];
        this.platformGraphics = new Graphics();
        this.reachedMaxFruits = false;
        this.collectedCount = 0;
        this.maxFruits = 5;

        // Add static floor
        this.floor = {
            x: 0,
            y: app.screen.height - 50,
            width: app.screen.width,
            height: 50
        };

        this.maxHeight = app.screen.height - 450;

        if (this.platforms.length < 6) {
            this.spawnPlatform(this.reachedMaxFruits);
        }

        app.stage.addChild(this.platformGraphics);
    }

    setFruitLimits(collectedCount, maxFruits) {
        this.collectedCount = collectedCount;
        this.maxFruits = maxFruits;
        this.reachedMaxFruits = collectedCount >= maxFruits;
    }    

    setReachedMaxFruits(state) {
        this.reachedMaxFruits = state;
    }

    spawnPlatform(reachedMaxFruits) {
        const minDistance = 250; // Minimum horizontal distance between platforms

        const width = 150 + Math.random() * 100;
        const height = 20;
        let x = this.app.screen.width + 200 + Math.random() * 400;
        const y = this.maxHeight + Math.random() * 100 - 50;

        // If there's a previous platform, space out
        if (this.platforms.length > 0) {
            const lastPlatform = this.platforms[this.platforms.length - 1];
            if (x - (lastPlatform.x + lastPlatform.width) < minDistance) {
                x = lastPlatform.x + lastPlatform.width + minDistance;
            }
        }

        const platform = { x, y, width, height };
        this.platforms.push(platform);

        // 20% chance to spawn fruit
        if (this.fruitSprites.length + this.collectedCount < this.maxFruits && Math.random() < 0.2) {
            const fruit = new Sprite(this.fruitTexture);
            fruit.anchor.set(0.5);
            fruit.scale.set(0.15);
            fruit.x = x + width / 2;
            fruit.y = y - 40;
            fruit.collected = false;
            this.fruitSprites.push(fruit);
            this.app.stage.addChild(fruit);
        } else {
            console.log("No fruit spawned on this platform.");
        }

        if (reachedMaxFruits) {
            console.log("Reached max fruits, no more will spawn.");
        }
    }

    getFloor() {
        return this.floor;
    }

    update() {
        // Decrease spawn cooldown
        this.spawnCooldown--;

        if (this.platforms.length < 6 && this.spawnCooldown <= 0) {
            this.spawnPlatform(this.reachedMaxFruits);
            this.spawnCooldown = 30 + Math.floor(Math.random() * 50); // Delay between spawns
        }

        // Move all platforms and fruits left
        this.platforms.forEach(p => p.x -= this.platformSpeed);
        this.fruitSprites.forEach(f => f.x -= this.platformSpeed);

        // Remove off-screen objects
        this.platforms = this.platforms.filter(p => p.x + p.width > 0);
        this.fruitSprites = this.fruitSprites.filter(f => f.x > -50 && !f.collected);

        // Ensure enough platforms on screen
        if (this.platforms.length < 6) this.spawnPlatform();

        // Redraw
        this.redrawPlatforms();
    }

    redrawPlatforms() {
        this.platformGraphics.clear();
        this.platformGraphics.beginFill(0x888888);

        // Draw floor
        const f = this.floor;
        this.platformGraphics.drawRect(f.x, f.y, f.width, f.height);

        // Draw all other platforms
        this.platforms.forEach(p => this.platformGraphics.drawRect(p.x, p.y, p.width, p.height));
        this.platformGraphics.endFill();
    }

    getPlatforms() {
        return this.platforms;
    }

    getFruits() {
        return this.fruitSprites;
    }
}
