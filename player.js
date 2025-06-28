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
        this.maxHealth = 100;
        this.radius = 25; // Hitbox radius voor collision detection
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.lastDamageTime = 0; // Extra bescherming tegen spam damage

        // Healthbar graphics
        this.healthBar = new Graphics();
    }

    update(keys, gravity, jumpVelocity, platforms){
        // Invulnerability timer met extra checks
        if (this.invulnerable && this.invulnerabilityTime > 0) {
            this.invulnerabilityTime--;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
                this.sprite.alpha = 1; // Herstel normale zichtbaarheid
            } else {
                // Knipperen tijdens invulnerability - veiligere berekening
                const flickerSpeed = 0.3;
                this.sprite.alpha = (Math.sin(this.invulnerabilityTime * flickerSpeed) + 1) * 0.3 + 0.4;
            }
        } else {
            this.invulnerable = false;
            this.sprite.alpha = 1;
        }

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
            this.takeDamage(10);
            this.sprite.y = 0; // respawn
            console.log("Michiel valt! HP:", this.health);
        }

        // Update healthbar - met error handling
        try {
            this.drawHealthBar();
        } catch (error) {
            console.warn("Healthbar drawing error:", error);
        }
    }

    // Verbeterde damage methode met extra bescherming
    takeDamage(amount) {
        const currentTime = Date.now();
        
        // Voorkom spam damage (minimaal 100ms tussen hits)
        if (currentTime - this.lastDamageTime < 100) {
            return;
        }
        
        if (!this.invulnerable && this.health > 0) {
            this.health = Math.max(0, this.health - amount);
            this.invulnerable = true;
            this.invulnerabilityTime = 90; // 1.5 seconde bij 60 FPS
            this.lastDamageTime = currentTime;
            
            console.log(`Michiel krijgt ${amount} damage! HP: ${this.health}/${this.maxHealth}`);
            
            if (this.health <= 0) {
                this.health = 0;
                console.log("Michiel is verslagen!");
                // Game over logica kan hier toegevoegd worden
                this.sprite.alpha = 0.5; // Maak speler semi-transparant
            }
        }
    }

    // Getter voor positie (voor collision detection)
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    isStandingOnPlatform(platforms){
        if (!platforms || platforms.length === 0) return false;
        
        const feetX = this.sprite.x;
        const feetY = this.sprite.y + this.sprite.height / 2;
        return platforms.some(p => {
            if (!p) return false;
            const withinX = feetX > p.x && feetX < p.x + p.width;
            const onTop = feetY >= p.y && feetY <= p.y + p.height;
            return withinX && onTop;
        });
    }

    drawHealthBar(){
        if (!this.healthBar) return;
        
        try {
            this.healthBar.clear();
            
            // Zorg ervoor dat health binnen grenzen blijft
            const safeHealth = Math.max(0, Math.min(this.maxHealth, this.health));
            const healthPercentage = safeHealth / this.maxHealth;
            
            // Zwarte achtergrond
            this.healthBar.beginFill(0x000000);
            this.healthBar.drawRect(this.sprite.x - 41, this.sprite.y - 70, 82, 12);
            this.healthBar.endFill();
            
            // Rode health bar
            if (healthPercentage > 0) {
                this.healthBar.beginFill(0xff0000);
                this.healthBar.drawRect(this.sprite.x - 40, this.sprite.y - 69, 80 * healthPercentage, 10);
                this.healthBar.endFill();
            }
        } catch (error) {
            console.warn("Error drawing health bar:", error);
        }
    }
}