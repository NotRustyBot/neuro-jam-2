import { Card } from "./card";
import { KeywordType } from "./cardDefinitions";
import { Enemy } from "./enemy";
import { Player } from "./player";

export type Entity = Player | Enemy;
export class Buffs {

    buffs = new Set<Buff>();
    target: Entity;
    constructor(target: Entity) {
        this.target = target;
    }

    add(buffType: BuffType, severity: number = 0) {
        const definition = buffDefinitions.get(buffType)!;
        if (definition.stacks) {
            for (const buff of this.buffs) {
                if (buff.type === buffType) {
                    buff.severity += severity;
                    return;
                }
            }
        }
        
        this.buffs.add(new Buff(buffType, severity, this.target));
    }

    startTurn() {
        for (const buff of this.buffs) {
            buff.onTurnStart();
        }
    }

    endTurn() {
        for (const buff of this.buffs) {
            buff.onTurnEnd();
        }
    }

    cardPlayed(card: Card) {
        for (const buff of this.buffs) {
            buff.onCardPlayed(card);
        }
    }

    delete(buff: Buff) {
        this.buffs.delete(buff);
    }
}

export class Buff {
    severity: number = 0;
    type: BuffType;
    target: Entity;
    definition: BuffDefinition;

    constructor(type: BuffType, severity: number = 0, target: Entity) {
        this.type = type;
        this.severity = severity;
        this.target = target;
        this.definition = buffDefinitions.get(type)!;

        this.definition.onApply?.(this, target);
    }

    onTurnStart() {
        this.definition.onTurnStart?.(this, this.target);
    }

    onCardPlayed(card: Card) {
        this.definition.onCardPlayed?.(this, this.target, card);
    }

    onTurnEnd() {
        this.definition.onTurnEnd?.(this, this.target);
        if (this.definition.modifySeverity) {
            this.severity += this.definition.modifySeverity;
            if (this.severity <= 0) {
                this.target.buffs.delete(this);
            }
        }
    }
}

export enum BuffType {
    poison,
}

export type BuffDefinition = {
    type: BuffType;
    name: string;
    description: string;
    keywords?: KeywordType[];
    onApply?: (buff: Buff, target: Entity) => void;
    onTurnStart?: (buff: Buff, target: Entity) => void;
    onCardPlayed?: (buff: Buff, target: Entity, card: Card) => void;
    onTurnEnd?: (buff: Buff, target: Entity) => void;
    modifySeverity?: number;
    stacks?: boolean;
};

export const buffDefinitions: Map<BuffType, BuffDefinition> = new Map();

export function createBuffDefinitions() {
    buffDefinitions.set(BuffType.poison, {
        type: BuffType.poison,
        name: "Poison",
        description: `At the end of turn, deal 1 damage, lower severity by 1.`,
        modifySeverity: -1,
        onTurnEnd(buff, target) {
            target.health -= 1;
        },
        stacks: true,
    });
}
