import { Assets, Container, Sprite } from "pixi.js";
import { game } from "./game";
import { buffDefinitions, Buffs, BuffType } from "./buffs";

export class Enemy {
    health: number = 15;
    maxHealth: number = 15;
    container: Container;
    sprite: Sprite;
    buffs: Buffs;

    actions: EnemyAction[] = [];

    constructor(template: EnemyTemplate) {
        this.buffs = new Buffs(this);
        this.container = new Container();
        this.sprite = new Sprite(Assets.get(template.sprite));
        this.container.addChild(this.sprite);
        this.health = template.health;
        this.maxHealth = template.health;
        this.actions = template.actions;
    }

    hide() {
        game.enemyContainer.removeChild(this.container);
    }

    show() {
        game.enemyContainer.addChild(this.container);
    }

    update(dt: number) {
        this.container.position.x = (game.app.screen.width / 3) * 2;
        this.container.position.y = game.app.screen.height / 2;
    }

    doAction() {
        const action = this.actions.shift()!;

        if (action.type === "attack") {
            game.player.takeDamage(action.damage, action.quantity);
        } else if (action.type === "buff") {
            this.buffs.add(action.buff, action.severity);
        } else if (action.type === "debuff") {
            game.player.buffs.add(action.buff, action.severity);
        }

        this.actions.push(action);
    }

    startTurn() {
        this.buffs.startTurn();
        this.doAction();
        this.buffs.endTurn();
        game.player.startTurn();
    }
}

export type EnemyTemplate = {
    name: string;
    health: number;
    sprite: string;
    actions: EnemyAction[];
};

export function desribeAction(action: EnemyAction) {
    if (action.type === "attack") {
        return `Attack for ${action.damage} x ${action.quantity} damage.`;
    } else if (action.type === "buff") {
        return `Buff ${buffDefinitions.get(action.buff)!.name} by ${action.severity}.`;
    } else if (action.type === "debuff") {
        return `Debuff ${buffDefinitions.get(action.buff)!.name} by ${action.severity}.`;
    }
}

type EnemyAction = EnemyAttack | EnemyBuff | EnemyDebuff;

type EnemyAttack = {
    type: "attack";
    damage: number;
    quantity: number;
};

type EnemyBuff = {
    type: "buff";
    buff: BuffType;
    severity: number;
};

type EnemyDebuff = {
    type: "debuff";
    buff: BuffType;
    severity: number;
};
