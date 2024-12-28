import { Buff, BuffType } from "./buffs";
import { Enemy } from "./enemy";
import { Player } from "./player";
import { roll } from "./utils";

export enum CardTemplate {
    blindshot,
    sweepStrike,
    zap,
    meditate,
    slam,
    distract,
}

export enum CardType {
    attack,
    skill,
}

export type CardDefinition = {
    template: CardTemplate;
    family: CardType;
    name: string;
    description: string;
    cost?: number;
    startingUses?: number;
    onPlayed?: (player: Player, enemy: Enemy) => void;
    keywords?: KeywordType[];
};

export const cardDefinitions: Map<CardTemplate, CardDefinition> = new Map();

export function createCardDefinitions() {
    createKeywordDefinitions();
    cardDefinitions.set(CardTemplate.blindshot, {
        template: CardTemplate.blindshot,
        family: CardType.attack,
        startingUses: 0,
        name: "Blindshot",
        keywords: [KeywordType.burn, KeywordType.weakness],
        cost: 2,
        description: `Deal 2 damage\nInflict 2 #burn\nInflict 1 #weakness`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 2;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage);
            enemy.buffs.add(BuffType.burn, 2);
            enemy.buffs.add(BuffType.weak, 1);
        },
    });

    cardDefinitions.set(CardTemplate.sweepStrike, {
        template: CardTemplate.sweepStrike,
        family: CardType.attack,
        keywords: [KeywordType.stun],
        startingUses: 0,
        name: "Sweep Strike",
        cost: 1,
        description: `Deal 2 damage\n50% chance to inflict #stun`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 2;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage);
            if (roll(0.5)) enemy.buffs.add(BuffType.stun);
        },
    });

    cardDefinitions.set(CardTemplate.zap, {
        template: CardTemplate.zap,
        family: CardType.attack,
        keywords: [KeywordType.stun],
        startingUses: 0,
        name: "Zap",
        cost: 2,
        description: `Deal 3 damage\nInflict #stun`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 3;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage);
        },
    });

    cardDefinitions.set(CardTemplate.meditate, {
        template: CardTemplate.meditate,
        family: CardType.skill,
        name: "Meditate",
        cost: 1,
        description: `Gain 5 block and draw a card`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.block += 5;
            player.drawCards(1);
        },
    });

    cardDefinitions.set(CardTemplate.slam, {
        template: CardTemplate.slam,
        family: CardType.attack,
        name: "Slam",
        keywords: [KeywordType.stun, KeywordType.weakness],
        cost: 2,
        description: `Deal 4 damage\nDeal 2 extra damage if the enemy has #weakness or #stun`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 4;
            damage = player.modifyAttackDamage(damage);
            if (enemy.buffs.has(BuffType.stun) || enemy.buffs.has(BuffType.weak)) damage += 2;
            enemy.takeDamage(damage);
        },
    });


    cardDefinitions.set(CardTemplate.distract, {
        template: CardTemplate.distract,
        family: CardType.skill,
        name: "Distract",
        keywords: [KeywordType.weakness],
        cost: 1,
        description: `Inflict 2 #weakness`,
        onPlayed: (player: Player, enemy: Enemy) => {
            enemy.buffs.add(BuffType.weak, 2);
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
    burn,
    weakness,
    stun,
}

export type KeywordDefinition = {
    template: KeywordType;
    name: string;
    description: string;
    color: string;
};

export const keywordDefinitions: Map<KeywordType, KeywordDefinition> = new Map();

function createKeywordDefinitions() {
    keywordDefinitions.set(KeywordType.burn, {
        template: KeywordType.burn,
        name: "Burn",
        description: `At the end of turn, deal 1 damage, lower severity by 1.`,
        color: "#990000",
    });

    keywordDefinitions.set(KeywordType.weakness, {
        template: KeywordType.weakness,
        name: "Weakness",
        description: `Reduces damage by 25%`,
        color: "#000099",
    });

    keywordDefinitions.set(KeywordType.stun, {
        template: KeywordType.stun,
        name: "Stun",
        description: `Skip a trun.`,
        color: "#ff9900",
    });
}
