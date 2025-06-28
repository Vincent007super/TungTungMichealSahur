import { Graphics, Container } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';

export class Coal extends Container {
    constructor(x, y, vx, vy, onSplit) {
        super();
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.gravity = 0.4;
        this.onSplit = onSplit;
        this.hasSplit = false;
        this.damage = 10; // Damage die de coal doet
        this.radius = 8; // Voor collision detection
        this.isDestroyed = false; // Nieuwe flag om dubbele verwijdering te voorkomen

        const gfx = new Graphics();
        gfx.beginFill(0x2d2d2d);
        gfx.drawCircle(0, 0, this.radius);
        gfx.endFill();
        this.addChild(gfx);
    }

    destroy() {
        if (this.isDestroyed) return; // Voorkom dubbele verwijdering
        this.isDestroyed = true;
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }

    update(delta) {
        if (this.isDestroyed) return; // Skip update als coal al vernietigd is

        this.vy += this.gravity;
        this.x += this.vx * delta;
        this.y += this.vy * delta;
        
        // Verwijder coals die HEEL ver buiten het scherm gaan
        if (this.x < -200 || this.x > window.innerWidth + 200 || this.y > window.innerHeight + 200) {
            this.destroy(); // Gebruik de nieuwe destroy methode
            return;
        }

        // Alleen splitsen als het de echte grond raakt (onderkant van het scherm)
        if (!this.hasSplit && this.y > window.innerHeight) {
            this.hasSplit = true;
            if (this.onSplit) this.onSplit(this.x, this.y);
            this.destroy(); // Gebruik de nieuwe destroy methode
        }
    }
    
    // Collision detection met een andere object
    checkCollision(target) {
        if (this.isDestroyed) return false; // Geen collision als coal al vernietigd is
        const dx = this.x - target.x;
        const dy = this.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + target.radius);
    }
}
