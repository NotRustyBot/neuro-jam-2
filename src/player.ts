import { Buffs } from "./buffs";
import { Card } from "./card";
import { CardTemplate } from "./cardDefinitions";
import { Enemy } from "./enemy";
import { Equipment, equipmentDefinitions, EquipmentTemplate } from "./equipment";
import { game } from "./game";

export class Player {
    health: number = 20;
    stamina: number = 3;
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

    constructor() {
        const equipment = [EquipmentTemplate.blastRing, EquipmentTemplate.alchemyKit]; 
        this.buffs = new Buffs(this);
        this.equipment = equipment.map((eq) => equipmentDefinitions.get(eq)!);


    }

    startBattle(instance: BattleInstance) {
        this.inBattle = true;
        this.instance = instance;
        for (const eq of this.equipment) {
            eq.cards.forEach((card) => this.library.push(card));
        }

        for (const template of this.library) {
            this.deck.push(new Card(template, this.instance));
        }

        this.shuffleDeck();
    }

    update(dt: number) {
        if(this.inBattle){
            this.hand.forEach((card) => card.update(dt));
        }
    }

    startTurn() {
        game.encounter.nextTurn();
        this.buffs.startTurn();
        this.drawCards(2);
    }

    endTurn(): void {
        this.buffs.endTurn();
        this.instance.enemy.startTurn();
    }

    takeDamage(damage: number, quantity: number) {
        for (let i = 0; i < quantity; i++) {
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

            const card = this.deck.pop()!
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
