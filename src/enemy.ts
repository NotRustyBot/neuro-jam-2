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
        this.sprite.anchor.set(0.5);
        this.sprite.x = 100;
        this.container.addChild(this.sprite);
        game.enemyContainer.addChild(this.container);
        this.health = template.health;
        this.maxHealth = template.health;
        this.actions = template.actions;
        this.container.visible = false;
        if (template.name.includes("spiderbot")) this.spiderBotSetup();
        if (this.template.name == "spider") this.spiderSetup();
        if (this.template.name == "bee") this.beeSetup();
        if (this.template.name == "drone") this.droneSetup();

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
        if (this.health <= 0) return;
        this.health -= damage * quantity;
        if (this.health <= 0) {
            game.camera.shakePower = 1000;
            this.health = 0;
            this.die();
            game.encounter.countdown = 0;
        }

        this.recentDamage += startingHealth - this.health;
    }

    dyingProgress = 0;
    isDead = false;
    update(dt: number) {
        if (this.isDead) return;
        this.container.position.x = (game.app.screen.width / 3) * 2;
        this.container.position.y = (game.app.screen.height / 5) * 3;

        this.uiContainer.position.x = this.container.position.x;
        this.uiContainer.position.y = this.container.position.y;

        if (this.template.name.includes("spiderbot")) this.spiderBotUpdate(dt);
        if (this.template.name == "spider") this.spiderUpdate();
        if (this.template.name == "bee") this.beeUpdate();
        if (this.template.name == "drone") this.droneUpdate();

        this.updateUi(dt);

        this.helperContainer.tint = interpolateColors(0xffffff, 0xff0000, this.recentDamage / 3);
        this.sprite.tint = interpolateColors(0xffffff, 0xff0000, this.recentDamage / 3);

        if (this.isDying) {
            this.dyingProgress -= dt / 1000;
            this.container.alpha = this.dyingProgress;
            if (this.dyingProgress <= 0) {
                this.destroy();
                this.isDead = true;
                if (game.encounter.otherInstance.enemy.health <= 0) {
                    game.encounter.win();
                }
            }
        }
    }

    isStunned = false;
    handleStun() {
        this.isStunned = true;
    }

    sprites = new Array<Sprite>();

    helperContainer = new Container();
    spiderSetup() {
        this.sprite.visible = false;
        this.sprites[0] = new Sprite(Assets.get("spider_body"));
        this.sprites[1] = new Sprite(Assets.get("spider_head"));
        this.sprites[2] = new Sprite(Assets.get("spider_leg1"));
        this.sprites[3] = new Sprite(Assets.get("spider_leg2"));
        for (const sprite of this.sprites) {
            sprite.texture.source.scaleMode = "nearest";
            sprite.anchor.set(0.5);
            sprite.scale.set(4);
        }
        this.helperContainer.addChild(this.sprites[2]);
        this.helperContainer.addChild(this.sprites[0]);
        this.helperContainer.addChild(this.sprites[3]);
        this.helperContainer.addChild(this.sprites[1]);
        this.helperContainer.position.set(50, 100);
        this.container.addChild(this.helperContainer);
    }

    spiderUpdate() {
        this.sprites[2].rotation = game.phase * 0.05 - 0.1;
        this.sprites[3].rotation = -game.phase * 0.05 - 0.1;
        this.sprites[1].position.y = -(Math.abs(game.phase) - 0.5) * 3;
        this.sprites[1].rotation = game.phase * 0.05;
        this.helperContainer.y = game.phase * 5;
    }

    beeSetup() {
        this.sprite.visible = false;
        this.sprites[0] = new Sprite(Assets.get("bee_body"));
        this.sprites[1] = new Sprite(Assets.get("bee_legs"));
        this.sprites[2] = new Sprite(Assets.get("bee_wing1"));
        this.sprites[3] = new Sprite(Assets.get("bee_wing2"));
        for (const sprite of this.sprites) {
            sprite.texture.source.scaleMode = "nearest";
            sprite.anchor.set(0.5);
            sprite.scale.set(4);
        }
        this.helperContainer.addChild(this.sprites[1]);
        this.helperContainer.addChild(this.sprites[0]);
        this.helperContainer.addChild(this.sprites[2]);
        this.helperContainer.addChild(this.sprites[3]);
        this.helperContainer.position.set(50, 100);
        this.container.addChild(this.helperContainer);
    }

    beeUpdate() {
        this.sprites[2].rotation = game.phase * 0.05 - 0.1;
        this.sprites[3].rotation = -game.phase * 0.05 - 0.1;
        this.sprites[1].y = -(Math.abs(game.phase) - 0.5) * 3;
        this.helperContainer.y = game.phase * 5;
    }

    droneSetup() {
        this.sprite.visible = false;
        this.sprites[0] = new Sprite(Assets.get("healingBot"));
        for (const sprite of this.sprites) {
            sprite.texture.source.scaleMode = "nearest";
            sprite.anchor.set(0.5);
            sprite.scale.set(4);
        }

        this.helperContainer.addChild(this.sprites[0]);
        this.container.addChild(this.helperContainer);
    }

    droneUpdate() {
        this.sprites[0].rotation = game.phase * 0.2;
        this.helperContainer.x = Math.cos(game.phase * Math.PI * 2) * 10 + 50;
        this.helperContainer.y = Math.sin(game.phase * Math.PI * 2) * 10 -50;
    }

    spiderBotSetup() {
        this.sprite.visible = false;
        this.sprites[0] = new Sprite(Assets.get("spiderbot_body"));
        this.sprites[1] = new Sprite(Assets.get("spiderbot_head"));
        this.sprites[2] = new Sprite(Assets.get("spiderbot_leg1"));
        this.sprites[3] = new Sprite(Assets.get("spiderbot_leg2"));
        for (const sprite of this.sprites) {
            sprite.texture.source.scaleMode = "nearest";
            sprite.anchor.set(0.5);
            sprite.scale.set(4);
        }
        this.helperContainer.addChild(this.sprites[2]);
        this.helperContainer.addChild(this.sprites[0]);
        this.helperContainer.addChild(this.sprites[3]);
        this.helperContainer.addChild(this.sprites[1]);
        this.helperContainer.position.set(50, 100);
        this.container.addChild(this.helperContainer);
    }

    spiderBotUpdate(dt: number) {
        this.sprites[2].rotation = game.phase * 0.05 - 0.1;
        this.sprites[3].rotation = -game.phase * 0.05 - 0.1;
        this.sprites[1].position.y = -(Math.abs(game.phase) - 0.5) * 3;
        this.sprites[1].rotation = game.phase * 0.05;
        this.helperContainer.y = game.phase * 5;
    }

    async doAction() {
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

    isDying = false;
    die() {
        if (this.isDying || this.isDead) return;
        this.isDying = true;
        this.dyingProgress = 1;
    }

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

    myTurn = false;
    async startTurn() {
        this.myTurn = true;
        this.buffs.startTurn();
        if (this.isStunned) {
            this.isStunned = false;
            game.timeManager.delay(() => {
                this.buffs.endTurn();
                game.player.startTurn();
                this.myTurn = false;
            }, 200);
        } else {
            await game.timeManager.wait(200);
            await this.doAction();
            await game.timeManager.wait(200);
            this.buffs.endTurn();
            game.player.startTurn();
            this.myTurn = false;
        }
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
