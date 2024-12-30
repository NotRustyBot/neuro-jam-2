import { Buff, BuffType } from "./buffs";
import { Enemy } from "./enemy";
import { game } from "./game";
import { Player } from "./player";
import { SoundManager } from "./soundManager";
import { roll } from "./utils";

export enum CardTemplate {
    exhaustion,
    operationalConfusion,
    operationalFailure,
    lightHisEyes,
    soulWakeUpCall,
    huntedHeretic,
    smallBang,
    uncontrolledBot,
    wrongExit,
    correctExit,
    // starting
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
    ancestorsCall,
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
    failure
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
    cardDefinitions.set(CardTemplate.exhaustion, {
        template: CardTemplate.exhaustion,
        family: CardType.failure,
        startingUses: 0,
        name: "Exhaustion",
        cost: 0,
        description: `<i>Sometimes you just need to chill out</i>`,
    });

    cardDefinitions.set(CardTemplate.operationalConfusion, {
        template: CardTemplate.operationalConfusion,
        family: CardType.failure,
        startingUses: 0,
        name: "Operational Confusion",
        cost: 0,
        description: `<i>Take some time to read the instructions before using this complex weapon</i>`,
    });

    cardDefinitions.set(CardTemplate.operationalFailure, {
        template: CardTemplate.operationalFailure,
        family: CardType.failure,
        startingUses: 0,
        name: "Operational Failure",
        cost: 0,
        description: `<i>The weapon sputters uselessly</i>`,
        onPlayed: (player: Player, enemy: Enemy) => {
            game.soundManager.play("operationalFailure");
        },
    });

    cardDefinitions.set(CardTemplate.lightHisEyes, {
        template: CardTemplate.lightHisEyes,
        family: CardType.attack,
        startingUses: 0,
        name: "Light his eyes!",
        cost: 0,
        description: `Deal 2 damage`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 2;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage);
            game.soundManager.play("laser");
        },
    });

    cardDefinitions.set(CardTemplate.soulWakeUpCall, {
        template: CardTemplate.soulWakeUpCall,
        family: CardType.failure,
        startingUses: 0,
        name: "Soul with Wake-Up Call",
        cost: 0,
        description: `Soothe your ancestors before you get their help`,
    });

    cardDefinitions.set(CardTemplate.huntedHeretic, {
        template: CardTemplate.huntedHeretic,
        family: CardType.failure,
        startingUses: 0,
        name: "Hunted Heretic",
        cost: 0,
        description: `<i>Try to evade the Order before using this evil dagger again</i>`,
    });

    cardDefinitions.set(CardTemplate.smallBang, {
        template: CardTemplate.smallBang,
        family: CardType.skill,
        name: "Small Bang",
        cost: 2,
        description: `Deal 2 damage\nTake 2 damage`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 2;
            enemy.takeDamage(damage);
            player.takeDamage(damage);
            game.soundManager.play("explosion");
        },
    });

    cardDefinitions.set(CardTemplate.uncontrolledBot, {
        template: CardTemplate.uncontrolledBot,
        family: CardType.failure,
        startingUses: 0,
        name: "Uncontrolled Bot",
        cost: 0,
        description: `<i>Nanobots want a paycheck too</i>`,
        onPlayed: (player: Player, enemy: Enemy) => {
            game.soundManager.play("uncontrolledBot");
        }
    });


    // starting
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
            game.soundManager.play("blindshot");
        },
    });

    cardDefinitions.set(CardTemplate.sweepStrike, {
        template: CardTemplate.sweepStrike,
        family: CardType.attack,
        keywords: [KeywordType.vulnerable, KeywordType.weakness],
        startingUses: 0,
        name: "Sweep Strike",
        cost: 1,
        description: `Deal 1 damage\n50% chance to inflict #vulnerable\n50% chance to inflict #weakness`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 1;
            damage = player.modifyAttackDamage(damage);
            game.soundManager.play("sweeping_strike");
            enemy.takeDamage(damage);
            if (roll(0.5)) enemy.buffs.add(BuffType.vulnerable);
            if (roll(0.5)) enemy.buffs.add(BuffType.weak);
        },
    });

    cardDefinitions.set(CardTemplate.zap, {
        template: CardTemplate.zap,
        family: CardType.attack,
        keywords: [KeywordType.stun],
        startingUses: 0,
        name: "Zap",
        cost: 2,
        description: `Deal 1 damage\nInflict #stun`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 1;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage);
            enemy.buffs.add(BuffType.stun);
            game.soundManager.play("zap");
        },
    });

    cardDefinitions.set(CardTemplate.meditate, {
        template: CardTemplate.meditate,
        family: CardType.skill,
        name: "Meditate",
        cost: 1,
        description: `Gain 4 #block and draw a card`,
        keywords: [KeywordType.block],
        onPlayed: (player: Player, enemy: Enemy) => {
            player.block += 4;
            player.drawCards(1);
            game.soundManager.play("meditate");
        },
    });

    cardDefinitions.set(CardTemplate.slam, {
        template: CardTemplate.slam,
        family: CardType.attack,
        name: "Slam",
        keywords: [KeywordType.stun, KeywordType.weakness],
        cost: 3,
        description: `Deal 4 damage\nIf the enemy has #weakness or #stun, deal 6 extra damage `,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 4;
            damage = player.modifyAttackDamage(damage);
            if (enemy.buffs.has(BuffType.stun) || enemy.buffs.has(BuffType.weak)) damage += 6;
            enemy.takeDamage(damage);
            game.soundManager.play("slam");
        },
    });

    cardDefinitions.set(CardTemplate.distract, {
        template: CardTemplate.distract,
        family: CardType.skill,
        name: "Distract",
        keywords: [KeywordType.weakness],
        cost: 1,
        description: `Inflict 1 #weakness`,
        onPlayed: (player: Player, enemy: Enemy) => {
            enemy.buffs.add(BuffType.weak, 1);
            game.soundManager.play("laser");
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
            game.soundManager.play("ignite");
        },
    });

    cardDefinitions.set(CardTemplate.magicBolt, {
        template: CardTemplate.magicBolt,
        family: CardType.attack,
        name: "Magic Bolt",
        cost: 1,
        description: `Deal 4 damage`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 4;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage);
            game.soundManager.play("magic_bolt");
        },
    });

    cardDefinitions.set(CardTemplate.frostShield, {
        template: CardTemplate.frostShield,
        family: CardType.skill,
        name: "Frost Shield",
        keywords: [KeywordType.block],
        cost: 2,
        description: `Gain 10 #block`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.block += 10;
            game.soundManager.play("shield_up");
        },
    });

    cardDefinitions.set(CardTemplate.ancestorsCall, {
        template: CardTemplate.ancestorsCall,
        family: CardType.skill,
        keywords: [KeywordType.strength, KeywordType.weakness],
        name: "Ancestor's Call",
        cost: 1,
        description: `Gain 2 #strength\nInflict 1 #weakness`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.buffs.add(BuffType.strength, 2);
            enemy.buffs.add(BuffType.weak, 1);
            game.soundManager.play("ancestors_call");
        },
    });

    cardDefinitions.set(CardTemplate.backstab, {
        template: CardTemplate.backstab,
        family: CardType.attack,
        name: "Bloodthirsty Backstab",
        cost: 2,
        description: `Deal 3 damage\nHeal for damage dealt`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 3;
            damage = player.modifyAttackDamage(damage);
            const oldHealth = enemy.health;
            enemy.takeDamage(damage);
            player.heal(oldHealth - enemy.health);
            game.soundManager.play("backstab");
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
            game.soundManager.play("explosion");
        },
    });

    //hitech
    cardDefinitions.set(CardTemplate.laserBeam, {
        template: CardTemplate.laserBeam,
        family: CardType.attack,
        name: "Laser Beam",
        cost: 1,
        description: `Deal 6 damage\nIgnore defense`,
        onPlayed: (player: Player, enemy: Enemy) => {
            let damage = 6;
            damage = player.modifyAttackDamage(damage);
            enemy.takeDamage(damage, true);
            game.soundManager.play("laser");
        },
    });

    cardDefinitions.set(CardTemplate.naniteRepair, {
        template: CardTemplate.naniteRepair,
        family: CardType.skill,
        name: "Nanite Repair",
        keywords: [KeywordType.strength],
        cost: 1,
        description: `Heal 3 health\nGain 1 #strength`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.heal(3);
            player.buffs.add(BuffType.strength, 1);
            game.soundManager.play("nanite");
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
            enemy.buffs.add(BuffType.vulnerable, 2);
            game.soundManager.play("emStrike");
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
            enemy.buffs.add(BuffType.vulnerable, 1);
            game.soundManager.play("explosion", 0.5);
        },
    });

    cardDefinitions.set(CardTemplate.forceField, {
        template: CardTemplate.forceField,
        family: CardType.skill,
        keywords: [KeywordType.block],
        name: "Electronic Field",
        cost: 1,
        description: `Gain 4 #block`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.block += 4;
            game.soundManager.play("electronic_field");
        },
    });

    cardDefinitions.set(CardTemplate.quantumJump, {
        template: CardTemplate.quantumJump,
        family: CardType.skill,
        name: "Quantum Jump",
        keywords: [KeywordType.immune],
        cost: 2,
        description: `Gain #immune until next turn`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.buffs.add(BuffType.immune);
            game.soundManager.play("quantum_jump");
        },
    });
    cardDefinitions.set(CardTemplate.wrongExit, {
        template: CardTemplate.wrongExit,
        family: CardType.failure,
        name: "Wrong Exit",
        cost: 0,
        description: `<i>You managed to evade the attack, but you're closer to the enemy</i>`,
        onPlayed: (player: Player, enemy: Enemy) => {
            game.soundManager.play("wrongExit");
        },
    });
    cardDefinitions.set(CardTemplate.correctExit, {
        template: CardTemplate.correctExit,
        family: CardType.failure,
        name: "Correct Exit",
        cost: 0,
        description: `<i>Heal 2 health</i>`,
        onPlayed: (player: Player, enemy: Enemy) => {
            player.heal(2);
            game.soundManager.play("correctExit");
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
    immune,
    block,
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
        color: "#ff2a00",
    });

    keywordDefinitions.set(KeywordType.weakness, {
        template: KeywordType.weakness,
        name: "Weakness",
        description: `Reduces damage by 50%`,
        color: "#0044ff",
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
        color: "#ff7700",
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
        description: `Ignore incoming damage`,
        color: "#20e8de",
    });

    keywordDefinitions.set(KeywordType.block, {
        template: KeywordType.block,
        name: "Block",
        description: `Blocks incoming damage, lasts one turn`,
        color: "#30ff6e",
    });
}
