import { Assets, Container, Graphics, Point, Sprite, Text } from "pixi.js";
import { game } from "./game";
import { buffDefinitions, Buffs, BuffType, Entity } from "./buffs";
import { Vector } from "./types";
import { interpolateColors } from "./utils";

export class Enemy {
    health: number = 15;
    maxHealth: number = 15;
    container: Container;
    sprite!: Sprite;
    buffs: Buffs;

    enemyName: Text;
    hpText: Text;
    hpBar = new Graphics();
    uiContainer = new Container();

    get opponent(): Entity {
        return game.player;
    }

    actions: EnemyAction[] = [];
    template: EnemyTemplate;
    constructor(template: EnemyTemplate) {
        this.template = template;
        this.buffs = new Buffs(this);
        this.container = new Container();
        this.container.addChild(this.uiContainer);
        game.uiContainer.addChild(this.uiContainer);
        this.uiContainer.addChild(this.hpBar);
        this.sprite = new Sprite(Assets.get(template.sprite));
        this.container.addChild(this.sprite);
        game.enemyContainer.addChild(this.container);
        this.health = template.health;
        this.maxHealth = template.health;
        this.actions = template.actions;
        this.container.visible = false;
        if (template.name.includes("spiderbot")) this.spiderBotSetup();

        this.hpText = new Text({
            text: ``,
            style: {
                fontFamily: "Arial",
                fontSize: 24,
                fill: 0xffffff,
                align: "center",
            },
        });

        this.hpText.anchor.set(0.5, 1);

        this.uiContainer.addChild(this.hpText);

        this.enemyName = new Text({
            text: template.name,
            style: {
                fontFamily: "Arial",
                fontSize: 60,
                fill: 0xffffff,
                align: "center",
            },
        });

        this.enemyName.anchor.set(0.5, 1);
        this.enemyName.position.set(100, -200);

        this.uiContainer.addChild(this.enemyName);

        this.uiContainer.addChild(this.buffs.container);
        this.buffs.container.y = -300;
    }

    hide() {
        this.container.visible = false;
        this.uiContainer.visible = false;
    }

    show() {
        this.container.visible = true;
        this.uiContainer.visible = true;
    }

    destroy() {
        this.container.destroy();
        this.uiContainer.destroy();
    }

    takeDamage(damage: number, quantity = 1, bypass = false) {
        const startingHealth = this.health;
        if(this.health <= 0) return;
        this.health -= damage * quantity;
        if (this.health <= 0) {
            game.camera.shakePower = 1000;
            this.health = 0;
            game.encounter.countdown = 0;
            if (game.encounter.otherInstance.enemy.health <= 0) {
                game.encounter.win();
            }
        }

        this.recentDamage += startingHealth - this.health;
    }

    update(dt: number) {
        this.container.position.x = (game.app.screen.width / 3) * 2;
        this.container.position.y = game.app.screen.height / 2;

        this.uiContainer.position.x = this.container.position.x;
        this.uiContainer.position.y = this.container.position.y;

        if (this.template.name.includes("spiderbot")) this.updateSpiderBot(dt);

        this.updateUi(dt);
    }

    isStunned = false;
    handleStun() {
        this.isStunned = true;
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
        this.sprites[2].rotation = game.phase * 0.1 - 0.2;
        this.sprites[3].rotation = game.phase * 0.1 + 0.2;
        this.sprites[0].x = game.phase * 20;
        this.sprites[1].rotation = game.phase * 0.2 + 0.1;
        this.sprites[1].scale.x = 1 + game.phase * 0.1;

        if(this.template.name.includes("2")){
            this.sprites.forEach(sprite => sprite.tint = 0xccffcc);
        }
    }

    doAction() {
        if (this.health <= 0) {
            return;
        }

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

    recentDamage = 0;

    updateUi(dt: number) {
        this.recentDamage *= 0.9;
        this.hpBar.clear();
        const hpRatio = (this.health + this.recentDamage) / this.maxHealth;
        this.hpText.text = `${this.health}`;

        this.hpBar.arc(100, 50, 200, -1, 0.2);
        this.hpBar.stroke({ width: 20, color: 0x330033 });
        if (this.health >= 0) {
            this.hpBar.arc(100, 50, 200, -(hpRatio * 1.2) + 0.2, 0.2);
            this.hpBar.stroke({ width: 20, color: 0xee3333 });
        }
        const hpAngle = Math.PI * 2 - (hpRatio * 1.2 - 0.2);
        const positon = Vector.fromAngle(hpAngle).mult(210).add({ x: 100, y: 50 });
        this.hpText.position.set(positon.x, positon.y);
        this.hpText.rotation = hpAngle + Math.PI / 2;
        this.hpText.scale.set(1 + this.recentDamage * 0.5);
        this.hpText.style.fill = interpolateColors(0xffaaaa, 0xff0000, this.recentDamage / 3);

        this.uiContainer.alpha = 0.75 + this.recentDamage * 0.5;
    }

    startTurn() {
        this.buffs.startTurn();
        if (this.isStunned) {
        } else {
            setTimeout(() => {
                this.doAction();
            }, 100);
        }

        setTimeout(() => {
            this.buffs.endTurn();
            game.player.startTurn();
        }, 200);
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
        return `Attack for ${action.damage} x ${action.quantity} damage`;
    } else if (action.type === "buff") {
        return `Buff ${buffDefinitions.get(action.buff)!.name} by ${action.severity}`;
    } else if (action.type === "debuff") {
        return `Debuff ${buffDefinitions.get(action.buff)!.name} by ${action.severity}`;
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
