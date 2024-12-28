import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { game } from "./game";
import { buffDefinitions, Buffs, BuffType } from "./buffs";

export class Enemy {
    health: number = 15;
    maxHealth: number = 15;
    container: Container;
    sprite!: Sprite;
    buffs: Buffs;

    hpBar = new Graphics();
    uiContainer = new Container();

    actions: EnemyAction[] = [];
    template: EnemyTemplate;
    constructor(template: EnemyTemplate) {
        this.template = template;
        this.buffs = new Buffs(this);
        this.container = new Container();
        this.container.addChild(this.uiContainer);
        this.uiContainer.addChild(this.hpBar);
        this.sprite = new Sprite(Assets.get(template.sprite));
        this.container.addChild(this.sprite);
        game.enemyContainer.addChild(this.container);
        this.health = template.health;
        this.maxHealth = template.health;
        this.actions = template.actions;
        this.container.visible = false;
        if (template.name === "spiderbot") this.spiderBotSetup();
    }

    hide() {
        this.container.visible = false;
    }

    show() {
        this.container.visible = true;
    }

    update(dt: number) {
        this.container.position.x = (game.app.screen.width / 3) * 2;
        this.container.position.y = game.app.screen.height / 2;

        if (this.template.name == "spiderbot") this.updateSpiderBot(dt);

        this.updateUi();
    }

    sprites = new Array<Sprite>();

    spiderBotSetup() {
        this.sprite.visible = false;
        this.sprites[0] = new Sprite(Assets.get("spiderbot_body"));
        this.sprites[1] = new Sprite(Assets.get("spiderbot_cannon"));
        this.sprites[1].anchor.set(0.6, 1);
        this.sprites[1].position.set(70, 30);
        this.sprites[2] = new Sprite(Assets.get("spiderbot_leg1"));
        this.sprites[2].anchor.set(0.5, 1);
        this.sprites[2].position.set(35, 180);
        this.sprites[3] = new Sprite(Assets.get("spiderbot_leg2"));
        this.sprites[3].anchor.set(0.5, 1);
        this.sprites[3].position.set(180, 180);
        this.container.addChild(this.sprites[0]);
        this.sprites[0].addChild(this.sprites[1]);
        this.container.addChild(this.sprites[2]);
        this.container.addChild(this.sprites[3]);
    }

    time = 0;
    updateSpiderBot(dt: number) {
        this.time += dt;
        const phase = Math.sin(this.time * 0.003);
        this.sprites[2].rotation = phase * 0.1 - 0.2;
        this.sprites[3].rotation = phase * 0.1 + 0.2;
        this.sprites[0].x = phase * 20;
        this.sprites[1].rotation = phase * 0.2 + 0.1;
        this.sprites[1].scale.x = 1 + phase * 0.1;
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

    updateUi() {
        this.hpBar.clear();
        const hpRatio = this.health / this.maxHealth;
        this.hpBar.arc(100, 50, 200, -1, 0.2);
        this.hpBar.stroke({ width: 20, color: 0x330033 });
        if(hpRatio >= 0){
            this.hpBar.arc(100, 50, 200, - hpRatio, 0.2);
            this.hpBar.stroke({ width: 20, color: 0xee3333 });
        }
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
