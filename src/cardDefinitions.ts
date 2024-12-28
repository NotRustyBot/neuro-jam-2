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
    //arcane
    ignite,
    magicBolt,
    frostShield,
    ansestorsCall,
    backstab,
    bigBang,
    //hitech
    laserBeam,
    naniteRepair,
    emStrike,
    antimatterExplosion,
    forceField,
    quantumJump,
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

    //arcane
    cardDefinitions.set(CardTemplate.ignite, {
        template: CardTemplate.ignite,
        family: CardType.attack,
        name: "Ignite",
        keywords: [KeywordType.burn],
        cost: 2,
        description: `Deal 4 damage\nIf the enemy has #burn, deal 4 extra damage\nInflict 2 #burn`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 4;
            damage = player.modifyAttackDamage(damage);
            if (enemy.buffs.has(BuffType.burn)) damage += 4;
            enemy.takeDamage(damage);
            enemy.buffs.add(BuffType.burn, 2);
        },
    });

    cardDefinitions.set(CardTemplate.magicBolt, {
        template: CardTemplate.magicBolt,
        family: CardType.attack,
        name: "Magic Bolt",
        cost: 1,
        description: `Deal 4 damage`,
        onPlayed: (player: Player, enemy: Enemy) => {},
    });

    cardDefinitions.set(CardTemplate.frostShield, {
        template: CardTemplate.frostShield,
        family: CardType.skill,
        name: "Frost Shield",
        cost: 1,
        description: `Gain 8 block`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.block += 8;
        },
    });

    cardDefinitions.set(CardTemplate.ansestorsCall, {
        template: CardTemplate.ansestorsCall,
        family: CardType.skill,
        keywords: [KeywordType.strength, KeywordType.weakness],
        name: "Ansestor's Call",
        cost: 1,
        description: `Gain 2 #strength\n inflict 1 #weakness`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.buffs.add(BuffType.strength, 2);
            enemy.buffs.add(BuffType.weak, 1);
        },
    });

    cardDefinitions.set(CardTemplate.backstab, {
        template: CardTemplate.backstab,
        family: CardType.attack,
        name: "Bloodthirsty Backstab",
        cost: 1,
        description: `Deal 3 damage\nHeal for damage dealt`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 3;
            damage = player.modifyAttackDamage(damage);
            player.heal(damage);
            enemy.takeDamage(damage);
        },
    });

    cardDefinitions.set(CardTemplate.bigBang, {
        template: CardTemplate.bigBang,
        family: CardType.skill,
        name: "Big Bang",
        cost: 2,
        description: `Deal 8 damage\nTake 8 damage`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 8;
            enemy.takeDamage(damage);
            player.takeDamage(damage);
        },
    });

    //hitech
    cardDefinitions.set(CardTemplate.laserBeam, {
        template: CardTemplate.laserBeam,
        family: CardType.attack,
        name: "Laser Beam",
        cost: 1,
        description: `Deal 6 damage, ignore defense`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 6;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage, 1, true);
        },
    });

    cardDefinitions.set(CardTemplate.naniteRepair, {
        template: CardTemplate.naniteRepair,
        family: CardType.skill,
        name: "Nanite Repair",
        keywords: [KeywordType.strength],
        cost: 1,
        description: `Heal 3 health\ngain 1 #strength`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.heal(3);
            player.buffs.add(BuffType.strength, 1);
        },
    });

    cardDefinitions.set(CardTemplate.emStrike, {
        template: CardTemplate.emStrike,
        family: CardType.attack,
        name: "EM Strike",
        keywords: [KeywordType.vulnerable],
        cost: 2,
        description: `Deal 3 damage\nInflict 2 #vulnerable`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 3;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage);
            enemy.buffs.add(BuffType.vuenerable, 2);
        },
    });

    cardDefinitions.set(CardTemplate.antimatterExplosion, {
        template: CardTemplate.antimatterExplosion,
        family: CardType.attack,
        name: "Antimatter Explosion",
        keywords: [KeywordType.vulnerable],
        cost: 2,
        description: `Deal 6 damage\nInflict 1 #vulnerable`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 6;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage);
            enemy.buffs.add(BuffType.vuenerable, 1);
        },
    });

    cardDefinitions.set(CardTemplate.forceField, {
        template: CardTemplate.forceField,
        family: CardType.skill,
        name: "Electronic Field",
        cost: 1,
        description: `Gain 4 block`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.block += 4;
        },
    });

    cardDefinitions.set(CardTemplate.quantumJump, {
        template: CardTemplate.quantumJump,
        family: CardType.skill,
        name: "Quantum Jump",
        keywords: [KeywordType.immune],
        cost: 1,
        description: `Gain #immune until next turn`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.buffs.add(BuffType.immune);
        },
    });

    for (const [type, card] of cardDefinitions) {
        for (const [keyword, definition] of keywordDefinitions) {
            if (card.keywords?.includes(keyword)) {
                card.description = card.description.replaceAll("#" + definition.name.toLowerCase(), `<b style="color: ${definition.color}">${definition.name}</b>`);
            }
        }
    }
}

export enum KeywordType {
    burn,
    weakness,
    stun,
    strength,
    vulnerable,
    immune
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
        description: `At the end of turn, deal 1 damage`,
        color: "#990000",
    });

    keywordDefinitions.set(KeywordType.weakness, {
        template: KeywordType.weakness,
        name: "Weakness",
        description: `Reduces damage by 50%`,
        color: "#000099",
    });

    keywordDefinitions.set(KeywordType.stun, {
        template: KeywordType.stun,
        name: "Stun",
        description: `Skip a turn`,
        color: "#ff9900",
    });

    keywordDefinitions.set(KeywordType.strength, {
        template: KeywordType.strength,
        name: "Strength",
        description: `Increases damage by 50%`,
        color: "#cc9900",
    });

    keywordDefinitions.set(KeywordType.vulnerable, {
        template: KeywordType.vulnerable,
        name: "Vulnerable",
        description: `Incoming damage is increased by 50%`,
        color: "#996666",
    });

    keywordDefinitions.set(KeywordType.immune, {
        template: KeywordType.immune,
        name: "Immune",
        description: `Igonore incoming damage`,
        color: "#339999",
    });
}
