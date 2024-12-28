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
    template: EquipmentTemplate
    cards: CardTemplate[],
    onGameStart?: () => void
}


export const equipmentDefinitions: Map<EquipmentTemplate, Equipment> = new Map();

export function createEquipmentDefinitions() {
    equipmentDefinitions.set(EquipmentTemplate.pepperSpray, {
        template: EquipmentTemplate.pepperSpray,
        cards: [CardTemplate.blindshot, CardTemplate.blindshot],
        onGameStart() {
            game.player.buffs.add(BuffType.pyromaniac);
        },
    });

    equipmentDefinitions.set(EquipmentTemplate.selfieStick, {
        template: EquipmentTemplate.selfieStick,
        cards: [CardTemplate.sweepStrike, CardTemplate.sweepStrike]
    });

    equipmentDefinitions.set(EquipmentTemplate.stunBaton, {
        template: EquipmentTemplate.stunBaton,
        cards: [CardTemplate.zap, CardTemplate.zap]
    });

    equipmentDefinitions.set(EquipmentTemplate.yogaMat, {
        template: EquipmentTemplate.yogaMat,
        cards: [CardTemplate.meditate, CardTemplate.meditate]
    });

    equipmentDefinitions.set(EquipmentTemplate.fryingPan, {     
        template: EquipmentTemplate.fryingPan,
        cards: [CardTemplate.slam, CardTemplate.slam]
    });

    equipmentDefinitions.set(EquipmentTemplate.laserPointer, {
        template: EquipmentTemplate.laserPointer,
        cards: [CardTemplate.distract, CardTemplate.distract]
    });
}
