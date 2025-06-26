import { Boss } from '../Boss.js';
import { Sprite } from 'pixi.js';

export class CherepanovBoss extends Boss {
    constructor(app, player, platformManager) {
        super(app, player, platformManager);
        this.foodThreshold = 5;
        this.health = 30;
        this.attackCooldown = 150; // frames
        this.specialCooldown = 600; // every ~10 seconds
        this.timeSinceLastSpecial = 0;
    }

    normalAttack() {
        this.fireCoal();
    }

    fireCoal() {
        const coal = new Sprite.from('assets/sprites/coal.png');
        coal.x = this.sprite.x;
        coal.y = this.sprite.y;
        coal.vx = (this.player.x - coal.x) / 20;
        coal.vy = -10;
        coal.gravity = 0.5;

        this.app.stage.addChild(coal);

        coal.update = () => {
            coal.vy += coal.gravity;
            coal.x += coal.vx;
            coal.y += coal.vy;

            if (coal.y > this.app.screen.height - 100) {
                this.splitCoal(coal.x, coal.y);
                this.app.stage.removeChild(coal);
                this.app.ticker.remove(coal.update);
            }
        };

        this.app.ticker.add(coal.update);
    }

    splitCoal(x, y) {
        for (let i = 0; i < 6; i++) {
            const piece = new Sprite.from('assets/sprites/tiny_coal.png');
            piece.x = x;
            piece.y = y;
            piece.vx = (Math.random() - 0.5) * 6;
            piece.vy = (Math.random() - 0.5) * 6;
            piece.gravity = 0.3;

            this.app.stage.addChild(piece);

            piece.update = () => {
                piece.vy += piece.gravity;
                piece.x += piece.vx;
                piece.y += piece.vy;

                if (piece.y > this.app.screen.height) {
                    this.app.stage.removeChild(piece);
                    this.app.ticker.remove(piece.update);
                }
            };

            this.app.ticker.add(piece.update);
        }
    }

    specialAttack(delta) {
        // Move offscreen, rush across floor like a death train
        // You could tween or animate this with GSAP or use a ticker-based lerp
    }
}
