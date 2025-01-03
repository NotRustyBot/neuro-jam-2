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
    onEncounterStart?: () => void;
    category: EquipmentCategory;
};

export const equipmentDefinitions: Map<EquipmentTemplate, Equipment> = new Map();

export function createEquipmentDefinitions() {
    equipmentDefinitions.set(EquipmentTemplate.pepperSpray, {
        category: EquipmentCategory.starting,
        name: "Pepper Spray",
        template: EquipmentTemplate.pepperSpray,
        cards: [CardTemplate.blindshot, CardTemplate.blindshot],
        onEncounterStart() {
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
        cards: [CardTemplate.zap, CardTemplate.operationalFailure, CardTemplate.operationalFailure],
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
        cards: [CardTemplate.distract, CardTemplate.distract, CardTemplate.lightHisEyes, CardTemplate.lightHisEyes],
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
        onEncounterStart() {
            game.player.buffs.add(BuffType.voicesOfThePast);
        },
        name: "Summoning Sigil",
        template: EquipmentTemplate.summoningSigil,
        cards: [CardTemplate.ancestorsCall, CardTemplate.ancestorsCall, CardTemplate.soulWakeUpCall, CardTemplate.soulWakeUpCall],
    });

    equipmentDefinitions.set(EquipmentTemplate.vampiricDagger, {
        category: EquipmentCategory.arcane,
        name: "Vampiric Dagger",
        template: EquipmentTemplate.vampiricDagger,
        cards: [CardTemplate.backstab, CardTemplate.huntedHeretic, CardTemplate.huntedHeretic],
    });

    equipmentDefinitions.set(EquipmentTemplate.unstableAlchemyBomb, {
        category: EquipmentCategory.arcane,
        name: "Unstable Alchemy Bomb",
        template: EquipmentTemplate.unstableAlchemyBomb,
        cards: [CardTemplate.bigBang, CardTemplate.smallBang, CardTemplate.smallBang],
        onEncounterStart() {
            game.player.buffs.add(BuffType.alchemist);
        },
    });

    //hitech
    equipmentDefinitions.set(EquipmentTemplate.laserGun, {
        category: EquipmentCategory.hitech,
        name: "Laser Gun",
        template: EquipmentTemplate.laserGun,
        cards: [CardTemplate.laserBeam, CardTemplate.laserBeam, CardTemplate.operationalConfusion, CardTemplate.operationalConfusion],
    });

    equipmentDefinitions.set(EquipmentTemplate.healingBot, {
        category: EquipmentCategory.hitech,
        name: "Healing Bot",
        template: EquipmentTemplate.healingBot,
        cards: [CardTemplate.naniteRepair, CardTemplate.naniteRepair, CardTemplate.uncontrolledBot, CardTemplate.uncontrolledBot],
    });

    equipmentDefinitions.set(EquipmentTemplate.emGauntlet, {
        category: EquipmentCategory.hitech,
        name: "EM Gauntlet",
        template: EquipmentTemplate.emGauntlet,
        cards: [CardTemplate.emStrike, CardTemplate.emStrike],
        onEncounterStart() {
            game.player.buffs.add(BuffType.persistency);
        },
    });

    equipmentDefinitions.set(EquipmentTemplate.antimatterGrenade, {
        category: EquipmentCategory.hitech,
        name: "Antimatter Grenade",
        template: EquipmentTemplate.antimatterGrenade,
        cards: [CardTemplate.antimatterExplosion, CardTemplate.antimatterExplosion],
    });

    equipmentDefinitions.set(EquipmentTemplate.forceField, {
        category: EquipmentCategory.hitech,
        name: "Force Field",
        template: EquipmentTemplate.forceField,
        cards: [CardTemplate.forceField, CardTemplate.forceField],
    });

    equipmentDefinitions.set(EquipmentTemplate.quantumTeleporter, {
        category: EquipmentCategory.hitech,
        name: "Quantum Teleporter",
        template: EquipmentTemplate.quantumTeleporter,
        cards: [CardTemplate.quantumJump, CardTemplate.wrongExit, CardTemplate.wrongExit, CardTemplate.wrongExit, CardTemplate.correctExit],
    });
}
