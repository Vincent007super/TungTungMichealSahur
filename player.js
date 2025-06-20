import { Sprite, Graphics } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';

export class Player {
    constructor(texture, x, y){
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.3);
        this.sprite.x = x;
        this.sprite.y = y;
        this.vy = 0;
        this.health = 100;

        // Healthbar graphics
        this.healthBar = new Graphics();
    }

    update(keys, gravity, jumpVelocity, platforms){
        // Links/rechts bewegen
        if(keys["ArrowLeft"] || keys["KeyA"]) this.sprite.x -= 5;
        if(keys["ArrowRight"] || keys["KeyD"]) this.sprite.x += 5;

        // Springen
        if((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && this.isStandingOnPlatform(platforms)){
            this.vy = jumpVelocity;
        }

        this.vy += gravity;
        this.sprite.y += this.vy;

        // Platform collision
        const platform = platforms.find(p => {
            const feetX = this.sprite.x;
            const feetY = this.sprite.y + this.sprite.height / 2;
            const falling = this.vy >= 0;
            const withinX = feetX > p.x && feetX < p.x + p.width;
            const hittingTop = feetY >= p.y && feetY <= p.y + p.height;
            return withinX && hittingTop && falling;
        });

        if(platform){
            this.vy = 0;
            this.sprite.y = platform.y - this.sprite.height / 2;
        }

        // Binnen scherm houden
        this.sprite.x = Math.min(Math.max(this.sprite.x, 20), window.innerWidth - 20);

        if(this.sprite.y > window.innerHeight + 200){
            this.health -= 10;
            this.sprite.y = 0; // respawn
            console.log("Michiel valt! HP:", this.health);
        }

        // Update healthbar
        this.drawHealthBar();
    }

    isStandingOnPlatform(platforms){
        const feetX = this.sprite.x;
        const feetY = this.sprite.y + this.sprite.height / 2;
        return platforms.some(p => {
            const withinX = feetX > p.x && feetX < p.x + p.width;
            const onTop = feetY >= p.y && feetY <= p.y + p.height;
            return withinX && onTop;
        });
    }

    drawHealthBar(){
        this.healthBar.clear();
        this.healthBar.beginFill(0x000000);
        this.healthBar.drawRect(this.sprite.x - 41, this.sprite.y - 70, 82, 12);
        this.healthBar.beginFill(0xff0000);
        this.healthBar.drawRect(this.sprite.x - 40, this.sprite.y - 69, 80 * (this.health / 100), 10);
        this.healthBar.endFill();
    }
}
