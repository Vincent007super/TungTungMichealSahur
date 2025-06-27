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

        const gfx = new Graphics();
        gfx.beginFill(0x2d2d2d);
        gfx.drawCircle(0, 0, 8);
        gfx.endFill();
        this.addChild(gfx);
    }

    update(delta) {
        this.vy += this.gravity;
        this.x += this.vx * delta;
        this.y += this.vy * delta;

        // Trigger split if hits ground or passes X threshold
        if (!this.hasSplit && (this.y > 400 || this.x < 100)) {
            this.hasSplit = true;
            if (this.onSplit) this.onSplit(this.x, this.y);
            this.parent.removeChild(this);
        }
    }
}
