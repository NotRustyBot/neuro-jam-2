import { BuffType } from "./buffs";
import { CardTemplate } from "./cardDefinitions";
import { game } from "./game";

export enum EquipmentTemplate {
    pepperSpray,
    selfieStick,
    stunBaton,
    yogaMat,
    fryingPan,
    laserPointer,
    //arcane
    flameWand,
    arcaneStaff,
    frostGem,
    summoningSigil,
    vampiricDagger,
    unstableAlchemyBomb,
    //hitech
    laserGun,
    healingBot,
    emGauntlet,
    antimatterGrenade,
    forceField,
    quantumTeleporter,
}

export enum EquipmentCategory {
    starting,
    arcane,
    hitech,
}

export type Equipment = {
    name: string;
    template: EquipmentTemplate;
    cards: CardTemplate[];
    onGameStart?: () => void;
    category: EquipmentCategory;
};

export const equipmentDefinitions: Map<EquipmentTemplate, Equipment> = new Map();

export function createEquipmentDefinitions() {
    equipmentDefinitions.set(EquipmentTemplate.pepperSpray, {
        category: EquipmentCategory.starting,
        name: "Pepper Spray",
        template: EquipmentTemplate.pepperSpray,
        cards: [CardTemplate.blindshot, CardTemplate.blindshot],
        onGameStart() {
            game.player.buffs.add(BuffType.pyromaniac);
        },
    });

    equipmentDefinitions.set(EquipmentTemplate.selfieStick, {
        category: EquipmentCategory.starting,
        name: "Selfie Stick",
        template: EquipmentTemplate.selfieStick,
        cards: [CardTemplate.sweepStrike, CardTemplate.sweepStrike],
    });

    equipmentDefinitions.set(EquipmentTemplate.stunBaton, {
        category: EquipmentCategory.starting,
        name: "Stun Baton",
        template: EquipmentTemplate.stunBaton,
        cards: [CardTemplate.zap, CardTemplate.zap],
    });

    equipmentDefinitions.set(EquipmentTemplate.yogaMat, {
        category: EquipmentCategory.starting,
        name: "Yoga Mat",
        template: EquipmentTemplate.yogaMat,
        cards: [CardTemplate.meditate, CardTemplate.meditate],
    });

    equipmentDefinitions.set(EquipmentTemplate.fryingPan, {
        category: EquipmentCategory.starting,
        name: "Frying Pan",
        template: EquipmentTemplate.fryingPan,
        cards: [CardTemplate.slam, CardTemplate.slam],
    });

    equipmentDefinitions.set(EquipmentTemplate.laserPointer, {
        category: EquipmentCategory.starting,
        name: "Laser Pointer",
        template: EquipmentTemplate.laserPointer,
        cards: [CardTemplate.distract, CardTemplate.distract],
    });

    //arcane
    equipmentDefinitions.set(EquipmentTemplate.flameWand, {
        category: EquipmentCategory.arcane,
        name: "Flame Wand",
        template: EquipmentTemplate.flameWand,
        cards: [CardTemplate.ignite, CardTemplate.ignite],
    });

    equipmentDefinitions.set(EquipmentTemplate.arcaneStaff, {
        category: EquipmentCategory.arcane,
        name: "Arcane Staff",
        template: EquipmentTemplate.arcaneStaff,
        cards: [CardTemplate.magicBolt, CardTemplate.magicBolt],
    });

    equipmentDefinitions.set(EquipmentTemplate.frostGem, {
        category: EquipmentCategory.arcane,
        name: "Frost Gem",
        template: EquipmentTemplate.frostGem,
        cards: [CardTemplate.frostShield, CardTemplate.frostShield],
    });

    equipmentDefinitions.set(EquipmentTemplate.summoningSigil, {
        category: EquipmentCategory.arcane,

        name: "Summoning Sigil",
        template: EquipmentTemplate.summoningSigil,
        cards: [CardTemplate.ansestorsCall, CardTemplate.ansestorsCall],
    });

    equipmentDefinitions.set(EquipmentTemplate.vampiricDagger, {
        category: EquipmentCategory.arcane,
        name: "Vampiric Dagger",
        template: EquipmentTemplate.vampiricDagger,
        cards: [CardTemplate.backstab, CardTemplate.backstab],
    });

    equipmentDefinitions.set(EquipmentTemplate.unstableAlchemyBomb, {
        category: EquipmentCategory.arcane,
        name: "Unstable Alchemy Bomb",
        template: EquipmentTemplate.unstableAlchemyBomb,
        cards: [CardTemplate.bigBang, CardTemplate.bigBang],
    });

    //hitech
    equipmentDefinitions.set(EquipmentTemplate.laserGun, {
        category: EquipmentCategory.arcane,
        name: "Laser Gun",
        template: EquipmentTemplate.laserGun,
        cards: [CardTemplate.laserBeam, CardTemplate.laserBeam],
    });

    equipmentDefinitions.set(EquipmentTemplate.healingBot, {
        category: EquipmentCategory.arcane,
        name: "Healing Bot",
        template: EquipmentTemplate.healingBot,
        cards: [CardTemplate.naniteRepair, CardTemplate.naniteRepair],
    });

    equipmentDefinitions.set(EquipmentTemplate.emGauntlet, {
        category: EquipmentCategory.arcane,
        name: "EM Gauntlet",
        template: EquipmentTemplate.emGauntlet,
        cards: [CardTemplate.emStrike, CardTemplate.emStrike],
    });

    equipmentDefinitions.set(EquipmentTemplate.antimatterGrenade, {
        category: EquipmentCategory.arcane,
        name: "Antimatter Grenade",
        template: EquipmentTemplate.antimatterGrenade,
        cards: [CardTemplate.antimatterExplosion, CardTemplate.antimatterExplosion],
    });

    equipmentDefinitions.set(EquipmentTemplate.forceField, {
        category: EquipmentCategory.arcane,
        name: "Force Field",
        template: EquipmentTemplate.forceField,
        cards: [CardTemplate.forceField, CardTemplate.forceField],
    });

    equipmentDefinitions.set(EquipmentTemplate.quantumTeleporter, {
        category: EquipmentCategory.arcane,
        name: "Quantum Teleporter",
        template: EquipmentTemplate.quantumTeleporter,
        cards: [CardTemplate.quantumJump, CardTemplate.quantumJump],
    });
}
