import { Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { Card } from "./card";
import { CardType, KeywordType } from "./cardDefinitions";
import { Enemy } from "./enemy";
import { Player } from "./player";
import { game } from "./game";

export type Entity = Player | Enemy;
export class Buffs {
    buffs = new Set<Buff>();
    target: Entity;
    container: Container;
    sprites = new Array<{ destroy: () => void }>();
    constructor(target: Entity) {
        this.target = target;
        this.container = new Container();
    }

    render() {
        let x = 0;
        const size = 80;
        this.sprites.forEach((sprite) => sprite.destroy());
        this.sprites = [];
        game.uiManager.hideBuff();
        for (const buff of this.buffs) {
            const buffContainer = new Container();

            const graphics = new Graphics();
            graphics.moveTo(0, 0);
            graphics.lineTo(size / 2, size / 2);
            graphics.lineTo(size, 0);
            graphics.lineTo(size / 2, -size / 2);
            graphics.lineTo(0, 0);
            graphics.fill(0xffffff);
            graphics.alpha = 0.5;
            graphics.stroke({ color: 0x000000, width: 3 });

            buffContainer.addChild(graphics);

            buffContainer.interactive = true;
            buffContainer.on("mouseenter", () => {
                game.uiManager.showBuff(buff, buffContainer.position);
            });

            buffContainer.on("mouseleave", () => {
                game.uiManager.hideBuff();
            });
            graphics.position.set(x, 0);

            const sprite = new Sprite(Assets.get(BuffType[buff.type]));
            sprite.anchor.set(0.5);
            sprite.position.set(x + size / 2, 0);
            sprite.texture.source.scaleMode = "nearest";
            sprite.scale.set(1.5);

            this.sprites.push(sprite);
            this.sprites.push(graphics);
            buffContainer.addChild(sprite);
            this.container.addChild(buffContainer);


            if (buff.severity > 0) {
                const text = new Text({ text: buff.severity.toString(), style: { fontFamily: "monospace", fontSize: 30, fill: 0xffffff, stroke: {color: 0x000000, width: 2} } });
                text.position.set(x + size / 2, 0);
                text.anchor.set(0.5);
                this.container.addChild(text);
                this.sprites.push(text);
            }

            x += 100;
        }
    }

    add(buffType: BuffType, severity: number = 0) {
        const definition = buffDefinitions.get(buffType)!;
        if (definition.stacks) {
            for (const buff of this.buffs) {
                if (buff.type === buffType) {
                    buff.severity += severity;
                    this.render();
                    return;
                }
            }
        }

        this.buffs.add(new Buff(buffType, severity, this.target));

        this.render();
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
        this.render();
    }

    endTurn() {
        for (const buff of this.buffs) {
            buff.onTurnEnd();
        }
        this.render();
    }

    cardPlayed(card: Card) {
        for (const buff of this.buffs) {
            buff.onCardPlayed(card);
        }
        this.render();
    }

    delete(buff: Buff) {
        this.buffs.delete(buff);
        this.render();
    }
}

export class Buff {
    severity: number = 0;
    type: BuffType;
    target: Entity;
    definition: BuffDefinition;
    get description() {
        if (typeof this.definition.description === "string") {
            return this.definition.description;
        } else {
            return this.definition.description(this.severity);
        }
    }

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
    strength,
    vulnerable,
    immune,
    voicesOfThePast,
    alchemist,
    persistency,
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
            target.takeDamage(1);
        },
        stacks: true,
    });

    buffDefinitions.set(BuffType.weak, {
        type: BuffType.weak,
        name: "Weakness",
        description: `Reduces damage by 50%`,
        modifySeverity: -1,
        stacks: true,
    });

    buffDefinitions.set(BuffType.stun, {
        type: BuffType.stun,
        name: "Stun",
        description: `Skip a turn`,
        onTurnEnd(buff, target) {
            target.buffs.delete(buff);
            target.handleStun();
        },
    });

    buffDefinitions.set(BuffType.pyromaniac, {
        type: BuffType.pyromaniac,
        name: "Pyromaniac",
        description: `If the opponent was burning when your turn started, attacks deal 1 extra damage`,
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
        description: (severity: number) => `Attacks deal ${severity} extra damage this turn`,
        onTurnEnd(buff, target) {
            target.buffs.delete(buff);
        },
        stacks: true,
    });

    buffDefinitions.set(BuffType.strength, {
        type: BuffType.strength,
        name: "Strength",
        description: `Attacks deal 50% more damage`,
        modifySeverity: -1,
        stacks: true,
    });

    buffDefinitions.set(BuffType.vulnerable, {
        type: BuffType.vulnerable,
        name: "Vulnerable",
        description: `Incoming damage is increased by 50%`,
        modifySeverity: -1,
        stacks: true,
    });

    buffDefinitions.set(BuffType.immune, {
        type: BuffType.immune,
        name: "Immune",
        description: `Ignore incoming damage`,
        onTurnStart(buff, target) {
            target.buffs.delete(buff);
        },
    });
    buffDefinitions.set(BuffType.voicesOfThePast, {
        type: BuffType.voicesOfThePast,
        name: "Voices of the past",
        description: `Every 5th skill played, gain 1 Strength`,
        onCardPlayed(buff, target, card) {
            if(card.definition.family === CardType.skill) {
                buff.severity += 1;
                if(buff.severity === 5) {
                    target.buffs.add(BuffType.strength, 1);
                    buff.severity = 0;
                    target.buffs.render();
                }
            }
        },
        stacks: true,
    });

    buffDefinitions.set(BuffType.alchemist, {
        type: BuffType.alchemist,
        name: "Alchemist",
        description: `Every 5th skill played, gain 1 energy`,
        onCardPlayed(buff, target, card) {
            if(card.definition.family === CardType.skill) {
                buff.severity += 1;
                if(buff.severity === 5) {
                    game.player.stamina += 1;
                    buff.severity = 0;
                    target.buffs.render();
                }
            }
        },
        stacks: true,
    });

    buffDefinitions.set(BuffType.persistency, {
        type: BuffType.persistency,
        name: "Persistency",
        description: `Every 10th attack inflicts stun`,
        onCardPlayed(buff, target, card) {
            if(card.definition.family === CardType.attack) {
                buff.severity += 1;
                if(buff.severity === 10) {
                    target.buffs.add(BuffType.stun);
                    buff.severity = 0;
                    target.buffs.render();
                }
            }
        },
        stacks: true,
    });
}
