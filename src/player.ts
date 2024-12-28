import { Buff, Buffs, BuffType, Entity } from "./buffs";
import { Card } from "./card";
import { CardTemplate } from "./cardDefinitions";
import { Enemy } from "./enemy";
import { Equipment, equipmentDefinitions, EquipmentTemplate } from "./equipment";
import { game } from "./game";

export class Player {
    health: number = 20;
    maxHealth: number = 20;
    stamina: number = 3;
    maxStamina: number = 3;
    buffs: Buffs;
    instance!: BattleInstance;
    inBattle: boolean = false;

    library = new Array<CardTemplate>();
    deck = new Array<Card>();
    hand = new Array<Card>();
    discardPile = new Array<Card>();
    usedPile = new Array<Card>();

    equipment: Equipment[];

    activeCard: Card | null = null;
    block = 0;

    get opponent(): Entity {
        return this.instance.enemy;
    }

    constructor() {
        const equipment = [EquipmentTemplate.pepperSpray, EquipmentTemplate.selfieStick, EquipmentTemplate.stunBaton, EquipmentTemplate.yogaMat, EquipmentTemplate.fryingPan, EquipmentTemplate.laserPointer];
        this.buffs = new Buffs(this);
        this.equipment = equipment.map((eq) => equipmentDefinitions.get(eq)!);
    }

    startBattle(instance: BattleInstance) {
        this.inBattle = true;
        this.instance = instance;
        for (const eq of this.equipment) {
            eq.cards?.forEach((card) => this.library.push(card));
        }

        for (const template of this.library) {
            this.deck.push(new Card(template));
        }

        this.shuffleDeck();

        for (const eq of this.equipment) {
            eq.onGameStart?.();
        }
    }

    update(dt: number) {
        if (this.inBattle) {
            this.hand.forEach((card) => card.update(dt));
        }
    }

    modifyAttackDamage(damage: number) {
        if (this.buffs.has(BuffType.bonusAttackDamage)) damage += this.buffs.getBuff(BuffType.bonusAttackDamage)!.severity;
        if (this.buffs.has(BuffType.weak)) damage = Math.floor(damage * 0.5);
        return damage;
    }

    handleStun() {
        // ???
    }

    startTurn() {
        game.encounter.nextTurn();
        this.stamina = this.maxStamina;
        this.block = 0;
        this.buffs.startTurn();
        this.drawCards(2);
    }

    endTurn(): void {
        this.buffs.endTurn();
        this.instance.enemy.startTurn();
    }

    takeDamage(damage: number, quantity: number) {
        for (let i = 0; i < quantity; i++) {
            if(this.block > damage){
                this.block -= damage;
                continue;
            }

            damage -= this.block;
            this.block = 0;

            this.health -= damage;
        }
    }

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

    constructor(enemy: Enemy) {
        this.player = game.player;
        this.enemy = enemy;
    }
}
