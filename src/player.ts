import { Assets, Sprite } from "pixi.js";
import { Buff, Buffs, BuffType, Entity } from "./buffs";
import { Card } from "./card";
import { CardTemplate } from "./cardDefinitions";
import { Enemy } from "./enemy";
import { Equipment, equipmentDefinitions, EquipmentTemplate } from "./equipment";
import { game } from "./game";
import { interpolateColors } from "./utils";

export class Player {
    health: number = 20;
    maxHealth: number = 20;
    stamina: number = 3;
    maxStamina: number = 3;
    buffs: Buffs;
    instance!: BattleInstance;
    inBattle: boolean = false;
    sprite: Sprite;

    library = new Array<CardTemplate>();
    deck = new Array<Card>();
    hand = new Array<Card>();
    discardPile = new Array<Card>();
    usedPile = new Array<Card>();

    equipment = new Array<Equipment>();

    activeCard: Card | null = null;
    block = 0;

    get opponent(): Entity {
        return this.instance.enemy;
    }

    constructor() {
        this.buffs = new Buffs(this);
        game.uiContainer.addChild(this.buffs.container);
        this.sprite = new Sprite(Assets.get("player"));
        game.playerContainer.addChild(this.sprite);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.scale.set(2);
    }

    addEquipment(selectedEquipment: Equipment[]) {
        this.equipment.push(...selectedEquipment);
    }

    startBattle(instance: BattleInstance) {
        this.inBattle = true;
        this.instance = instance;

        this.clearCards();

        for (const eq of this.equipment) {
            eq.cards?.forEach((card) => this.library.push(card));
        }

        for (const template of this.library) {
            this.deck.push(new Card(template));
        }

        this.shuffleDeck();

        for (const eq of this.equipment) {
            eq.onEncounterStart?.();
        }
    }

    clearCards() {
        this.deck.forEach((card) => card.destroy());
        this.hand.forEach((card) => card.destroy());
        this.discardPile.forEach((card) => card.destroy());
        this.usedPile.forEach((card) => card.destroy());
        this.library = new Array<CardTemplate>();
        this.deck = new Array<Card>();
        this.hand = new Array<Card>();
        this.discardPile = new Array<Card>();
        this.usedPile = new Array<Card>();
    }

    update(dt: number) {
        const baseX = Math.max(200, game.app.screen.width / 5);

        this.buffs.container.position.set(baseX - 200, game.app.screen.height - 400);
        this.sprite.position.set(baseX + 200, game.app.screen.height);
        if (this.inBattle) {
            this.hand.forEach((card) => card.update(dt));
        }

        this.sprite.tint = interpolateColors(0xffffff, 0xff0000, game.uiManager.recentPlayerDamage / 3);

        if (game.uiManager.recentPlayerDamage > 1) {
            game.soundManager.musicSpeed();
        }
    }

    modifyAttackDamage(damage: number) {
        if (this.buffs.has(BuffType.bonusAttackDamage)) damage += this.buffs.getBuff(BuffType.bonusAttackDamage)!.severity;
        if (this.buffs.has(BuffType.weak)) damage = Math.floor(damage * 0.5);
        if (this.buffs.has(BuffType.strength)) damage = Math.floor(damage * 1.5);
        return damage;
    }

    handleStun() {
        // ???
    }

    heal(amount: number) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }

    startTurn() {
        this.stamina = this.maxStamina;
        this.block = 0;
        this.buffs.startTurn();
        this.drawCards(5);
        game.soundManager.play("drawCards");
    }

    endTurn(): void {
        this.buffs.endTurn();
        const count = this.hand.length;
        for (let i = 0; i < count; i++) {
            this.hand[0].discard();
        }
        game.encounter.nextTurn();
    }

    takeDamage(damage: number) {
        if (game.player.buffs.has(BuffType.immune)) return;
        if (this.block > damage) {
            this.block -= damage;
            game.soundManager.play("shield_up", 0.1);
            return;
        }

        game.soundManager.play("player_damage");

        damage -= this.block;
        this.block = 0;
        game.camera.shakePower += 100 * damage;
        game.uiManager.recentPlayerDamage += damage;
        this.health -= damage;

        if (!this.isDead) {
            game.soundManager.musicSpeed();
            if (this.health <= 0) {
                this.health = 0;
                this.isDead = true;
                game.effectsManager.fadeout();
                game.timeManager.delay(() => game.encounter.die(), 600);
            }
        }
    }

    isDead = false;

    drawCards(count: number) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length == 0) {
                this.deck = [...this.usedPile];
                this.usedPile = [];
                this.shuffleDeck();
            }

            if (this.deck.length == 0) {
                console.error("No more cards in deck");
                return;
            }

            const card = this.deck.pop()!;
            card.show();
            this.hand.push(card);
        }
    }

    shuffleDeck() {
        this.deck.sort(() => Math.random() - 0.5);
    }
}

export class BattleInstance {
    enemy: Enemy;
    player: Player;

    destroy() {
        this.enemy.destroy();
    }

    constructor(enemy: Enemy) {
        this.player = game.player;
        this.enemy = enemy;
    }
}
