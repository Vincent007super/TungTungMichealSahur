import { Sprite, Assets } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';
import { Coal } from './bosses/attacks/coal.js';

export class Boss {
    constructor(app, player) {
        this.app = app;
        this.player = player;
        this.sprite = null;
        this.attackTimer = 0;
        this.attackCooldown = 200; // Ticks
        this.projectiles = [];
    }

    async spawn() {
        const texture = await Assets.load('assets/sprites/cherepanov.png');
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.app.screen.width - 150;
        this.sprite.y = 150;
        this.sprite.scale.set(0.6);
        this.app.stage.addChild(this.sprite);
    }

    update(delta) {
        this.attackTimer += delta;
        if (this.attackTimer >= this.attackCooldown) {
            this.attackTimer = 0;
            this.shootCoal();
        }

        // Update projectiles
        this.projectiles.forEach(p => p.update(delta));
    }

    shootCoal() {
        const vx = -4 + Math.random() * -1;
        const vy = -8 + Math.random() * -2;

        const coal = new Coal(this.sprite.x, this.sprite.y, vx, vy, (x, y) => {
            this.spawnSplitCoal(x, y);
        });

        this.projectiles.push(coal);
        this.app.stage.addChild(coal);
    }

    spawnSplitCoal(x, y) {
        const angles = [0, 60, 120, 180, 240, 300].map(a => a * (Math.PI / 180));
        angles.forEach(angle => {
            const vx = Math.cos(angle) * 3;
            const vy = Math.sin(angle) * 3;
            const miniCoal = new Coal(x, y, vx, vy, null);
            this.projectiles.push(miniCoal);
            this.app.stage.addChild(miniCoal);
        });
    }
}
