import { Sprite, Text } from "pixi.js";
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

    has(buffType: BuffType) {
        for (const buff of this.buffs) {
            if (buff.type === buffType) {
                return true;
            }
        }
        return false;
    }

    getBuff(buffType: BuffType) {
        for (const buff of this.buffs) {
            if (buff.type === buffType) {
                return buff;
            }
        }
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

    onMyBuff(buff: Buff) {
        this.definition.onMyBuff?.(this, this.target, buff);
    }

    onEnemyBuff(buff: Buff) {
        this.definition.onEnemyBuff?.(this, this.target, buff);
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
    burn,
    weak,
    stun,
    pyromaniac,
    bonusAttackDamage,
}

export type BuffDefinition = {
    type: BuffType;
    name: string;
    description: string | ((severity: number) => string);
    keywords?: KeywordType[];
    onApply?: (buff: Buff, target: Entity) => void;
    onTurnStart?: (buff: Buff, target: Entity) => void;
    onCardPlayed?: (buff: Buff, target: Entity, card: Card) => void;
    onTurnEnd?: (buff: Buff, target: Entity) => void;
    onMyBuff?: (buff: Buff, target: Entity, newBuff: Buff) => void;
    onEnemyBuff?: (buff: Buff, target: Entity, newBuff: Buff) => void;
    modifySeverity?: number;
    stacks?: boolean;
};

export const buffDefinitions: Map<BuffType, BuffDefinition> = new Map();

export function createBuffDefinitions() {
    buffDefinitions.set(BuffType.burn, {
        type: BuffType.burn,
        name: "Burn",
        description: `At the end of turn, deal 1 damage`,
        modifySeverity: -1,
        onTurnEnd(buff, target) {
            target.health -= 1;
        },
        stacks: true,
    });

    buffDefinitions.set(BuffType.weak, {
        type: BuffType.weak,
        name: "Weak",
        description: `Reduces damage by 25%`,
        modifySeverity: -1,
        stacks: true,
    });

    buffDefinitions.set(BuffType.stun, {
        type: BuffType.stun,
        name: "Stun",
        description: `Skip a trun.`,
        onTurnEnd(buff, target) {
            target.buffs.delete(buff);
            target.handleStun();
        },
    });

    buffDefinitions.set(BuffType.pyromaniac, {
        type: BuffType.pyromaniac,
        name: "Pyromaniac",
        description: `If the opponent was burning when your turn started, attacks deal 1 extra damage.`,
        onTurnStart(buff, target) {
            if (target.opponent.buffs.has(BuffType.burn)) {
                target.buffs.add(BuffType.bonusAttackDamage, 1);
            }
        },
        stacks: true,
    });

    buffDefinitions.set(BuffType.bonusAttackDamage, {
        type: BuffType.bonusAttackDamage,
        name: "Extra attack damage",
        description: (severity: number) => `Attacks deal ${severity} extra damage this turn.`,
        onTurnEnd(buff, target) {
            target.buffs.delete(buff);
        },
        stacks: true,
    });
}
