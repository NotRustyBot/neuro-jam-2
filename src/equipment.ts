import { CardTemplate } from "./cardDefinitions"

export enum EquipmentTemplate {
    blastRing,
    alchemyKit
}

export type Equipment = {
    template: EquipmentTemplate
    cards: CardTemplate[]
}


export const equipmentDefinitions: Map<EquipmentTemplate, Equipment> = new Map();

export function createEquipmentDefinitions() {
    equipmentDefinitions.set(EquipmentTemplate.blastRing, {
        template: EquipmentTemplate.blastRing,
        cards: [CardTemplate.fireball, CardTemplate.fireball, CardTemplate.fireball]
    });

    equipmentDefinitions.set(EquipmentTemplate.alchemyKit, {
        template: EquipmentTemplate.alchemyKit,
        cards: [CardTemplate.healingPotion, CardTemplate.poisonPotion]
    });
}
