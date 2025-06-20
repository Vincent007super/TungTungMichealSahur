import { Container, Sprite, Graphics, Text, TextStyle } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.0.0/dist/pixi.mjs';

export class Boss {
    constructor(texture, x, y) {
        this.container = new Container();

        // Sprite voor Thomas de Trein
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.4);
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.container.addChild(this.sprite);

        // Positionering van de hele boss-container
        this.container.x = x;
        this.container.y = y;

        // Stats
        this.maxHealth = 100;
        this.currentHealth = 100;
        this.attackPower = 10;

        // Health bar achtergrond
        this.healthBarBack = new Graphics();
        this.healthBarBack.beginFill(0x660000);
        this.healthBarBack.drawRect(-50, -70, 100, 10);
        this.healthBarBack.endFill();
        this.container.addChild(this.healthBarBack);

        // Health bar voorgrond
        this.healthBar = new Graphics();
        this.healthBar.beginFill(0xff0000);
        this.healthBar.drawRect(-50, -70, 100, 10);
        this.healthBar.endFill();
        this.container.addChild(this.healthBar);

        // Naam label
        const style = new TextStyle({
            fill: '#ffffff',
            fontSize: 12,
            fontWeight: 'bold',
        });

        const name = new Text("Thomas de Trein", style);
        name.anchor.set(0.5);
        name.y = -85;
        this.container.addChild(name);
    }

    // Update wordt aangeroepen in app.ticker
    update() {
        this.updateHealthBar();
        // Hier kun je later aanvallen toevoegen
    }

    // Pas de healthbar aan op basis van huidige health
    updateHealthBar() {
        const healthPercent = this.currentHealth / this.maxHealth;
        this.healthBar.clear();
        this.healthBar.beginFill(0xff0000);
        this.healthBar.drawRect(-50, -70, 100 * healthPercent, 10);
        this.healthBar.endFill();
    }

    // Boss kan schade nemen
    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) this.currentHealth = 0;
    }
}
