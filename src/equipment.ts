import { BuffType } from "./buffs";
import { CardTemplate } from "./cardDefinitions"
import { game } from "./game";

export enum EquipmentTemplate {
    pepperSpray,
    selfieStick,
    stunBaton,
    yogaMat,
    fryingPan,
    laserPointer,

}

export type Equipment = {
    name: string,
    template: EquipmentTemplate
    cards: CardTemplate[],
    onGameStart?: () => void
}


export const equipmentDefinitions: Map<EquipmentTemplate, Equipment> = new Map();

export function createEquipmentDefinitions() {
    equipmentDefinitions.set(EquipmentTemplate.pepperSpray, {
        name: "Pepper Spray",
        template: EquipmentTemplate.pepperSpray,
        cards: [CardTemplate.blindshot, CardTemplate.blindshot],
        onGameStart() {
            game.player.buffs.add(BuffType.pyromaniac);
        },
    });

    equipmentDefinitions.set(EquipmentTemplate.selfieStick, {
        name: "Selfie Stick",
        template: EquipmentTemplate.selfieStick,
        cards: [CardTemplate.sweepStrike, CardTemplate.sweepStrike]
    });

    equipmentDefinitions.set(EquipmentTemplate.stunBaton, {
        name: "Stun Baton",
        template: EquipmentTemplate.stunBaton,
        cards: [CardTemplate.zap, CardTemplate.zap]

    });

    equipmentDefinitions.set(EquipmentTemplate.yogaMat, {
        name: "Yoga Mat",
        template: EquipmentTemplate.yogaMat,
        cards: [CardTemplate.meditate, CardTemplate.meditate]
    });

    equipmentDefinitions.set(EquipmentTemplate.fryingPan, {
        name: "Frying Pan",
        template: EquipmentTemplate.fryingPan,
        cards: [CardTemplate.slam, CardTemplate.slam]
    });

    equipmentDefinitions.set(EquipmentTemplate.laserPointer, {
        name: "Laser Pointer",
        template: EquipmentTemplate.laserPointer,
        cards: [CardTemplate.distract, CardTemplate.distract]
    });
}
