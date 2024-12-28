import { Card } from "./card";
import { CardTemplate } from "./cardDefinitions";
import { Enemy } from "./enemy";
import { Equipment, equipmentDefinitions, EquipmentTemplate } from "./equipment";

export class Player {
    health: number = 5;
    stamina: number = 5;

    instance: BattleInstance;

    constructor() {
        this.instance = new BattleInstance([EquipmentTemplate.blastRing, EquipmentTemplate.alchemyKit], new Enemy());
        this.instance.drawCards(2);
    }

    update(dt: number) {
        this.instance.hand.forEach((card) => card.update(dt));
    }
}

export class BattleInstance {
    enemy: Enemy;

    library = new Array<CardTemplate>();
    deck = new Array<Card>();
    hand = new Array<Card>();
    discardPile = new Array<Card>();
    usedPile = new Array<Card>();

    equipment: Equipment[];

    activeCard: Card | null = null;

    constructor(equipment: EquipmentTemplate[], enemy: Enemy) {
        this.equipment = equipment.map((eq) => equipmentDefinitions.get(eq)!);

        for (const eq of this.equipment) {
            eq.cards.forEach((card) => this.library.push(card));
        }

        for (const template of this.library) {
            this.deck.push(new Card(template, this));
        }

        this.shuffleDeck();

        this.enemy = enemy;
    }

    drawCards(count: number) {
        for (let i = 0; i < count; i++) {
            if (this.deck.length == 0) {
                this.deck = [...this.usedPile];
                this.usedPile = [];
                this.shuffleDeck();
            }

            if (this.deck.length == 0) {
                throw new Error("No more cards in deck");
            }

            const card =this.deck.pop()!
            card.show();
            this.hand.push(card);
        }
    }

    shuffleDeck() {
        this.deck.sort(() => Math.random() - 0.5);
    }
}
