import { BuffType } from "./buffs";
import { Enemy } from "./enemy";
import { Player } from "./player";

export enum CardTemplate {
    fireball,
    healingPotion,
    poisonPotion,
}

export enum CardType {
    attack,
}

export type CardDefinition = {
    template: CardTemplate;
    name: string;
    description: string;
    startingUses?: number;
    onGameStart?: (player: Player, enemy: Enemy) => void;
    onTurnStart?: (player: Player, enemy: Enemy) => void;
    onTurnEnd?: (player: Player, enemy: Enemy) => void;
    onPlayed?: (player: Player, enemy: Enemy) => void;
    keywords?: KeywordType[];
};

export const cardDefinitions: Map<CardTemplate, CardDefinition> = new Map();


export function createCardDefinitions() {
    createKeywordDefinitions();
    cardDefinitions.set(CardTemplate.fireball, {
        template: CardTemplate.fireball,
        startingUses: 0,
        name: "Fireball",
        description: `Deal <b>3</b> damage to the enemy`,
        onPlayed: (player: Player, enemy: Enemy) => {
            enemy.health -= 3;
        },
    });

    cardDefinitions.set(CardTemplate.healingPotion, {
        template: CardTemplate.healingPotion,
        startingUses: 0,
        name: "Healing Potion",
        description: `Gain <b>2</b> health`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.health += 2;
        },
    });

    cardDefinitions.set(CardTemplate.poisonPotion, {
        template: CardTemplate.poisonPotion,
        keywords: [KeywordType.poison],
        startingUses: 0,
        name: "Poison Potion",
        description: `Apply <b>3</b> #poison to the enemy`,
        onPlayed: (player: Player, enemy: Enemy) => {
            enemy.buffs.add(BuffType.poison, 3);
        },
    });


    for (const [type, card] of cardDefinitions) {
        for (const [keyword, definition] of keywordDefinitions) {
            if (card.keywords?.includes(keyword)) {
                card.description = card.description.replace("#" + definition.name.toLowerCase(), `<b style="color: ${definition.color}">${definition.name}</b>`);
            }
        }
    }
}

export enum KeywordType {
    poison,
}

export type KeywordDefinition = {
    template: KeywordType;
    name: string;
    description: string;
    color: string;
}


export const keywordDefinitions: Map<KeywordType, KeywordDefinition> = new Map();


function createKeywordDefinitions() {
    keywordDefinitions.set(KeywordType.poison, {
        template: KeywordType.poison,
        name: "Poison",
        description: `At the end of turn, deal 1 damage, lower severity by 1.`,
        color: "#990099"
    });
}