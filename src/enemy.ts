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
    intent: Text;
    intentSprite: Sprite;
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
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(4);
        this.sprite.x = 100;
        this.sprite.y = 100;
        this.sprite.texture.source.scaleMode = "nearest";
        this.container.addChild(this.sprite);
        game.enemyContainer.addChild(this.container);
        this.health = template.health;
        this.maxHealth = template.health;
        this.actions = template.actions;
        this.container.visible = false;
        if (this.template.name == "Spider Bot") this.spiderBotSetup();
        if (this.template.name == "Spider") this.spiderSetup();
        if (this.template.name == "Bee") this.beeSetup();
        if (this.template.name == "Drone") this.droneSetup();


        this.hpText = new Text({
            text: ``,
            style: {
                fontFamily: "FunnelDisplay",
                fontSize: 24,
                fill: 0xffffff,
                align: "center",
            },
        });

        this.intentSprite = new Sprite();
        this.intentSprite.anchor.set(0, 1);
        this.intentSprite.position.set(0, -170);
        this.intentSprite.scale.set(0.5);
        this.uiContainer.addChild(this.intentSprite);

        this.intent = new Text({
            text: ``,
            style: {
                fontFamily: "FunnelDisplay",
                fontSize: 24,
                fill: 0xffffff,
            },
        });

        this.hpText.anchor.set(0.5, 1);

        this.uiContainer.addChild(this.hpText);

        this.enemyName = new Text({
            text: template.name,
            style: {
                fontFamily: "FunnelDisplay",
                fontSize: 60,
                fill: 0xffffff,
                align: "center",
            },
        });

        this.enemyName.anchor.set(0, 1);
        this.enemyName.position.set(0, -200);

        this.uiContainer.addChild(this.enemyName);

        this.intent.anchor.set(0, 1);
        this.intent.position.set(40, -170);
        this.uiContainer.addChild(this.intent);

        this.uiContainer.addChild(this.buffs.container);
        this.buffs.container.y = -300;
        this.updateIntent();
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

    takeDamage(damage: number, bypass = false) {
        const startingHealth = this.health;
        if (this.health <= 0) return;
        if (this.buffs.has(BuffType.immune)) {
            if (!bypass) {
                return;
            }
        }

        if (this.buffs.has(BuffType.vulnerable)) {
            damage = Math.floor(damage * 1.5);
        }

        this.health -= damage;

        if (this.health <= 0) {
            game.camera.shakePower = 1000;
            this.health = 0;
            this.die();
            if (this.template.name.includes("Spider Bot")) game.soundManager.play("enemyBotDeath", 0.4);
            if (this.template.name == "Drone") game.soundManager.play("enemyBotDeath", 0.4);
            if (this.template.name == "Turtle Bot") game.soundManager.play("enemyBotDeath", 0.4);
            if (this.template.name == "spider") game.soundManager.play("enemyBugDeath");
            if (this.template.name == "Bee") game.soundManager.play("enemyBugDeath");
            if (this.template.name == "Turtle") game.soundManager.play("enemyTurtleDeath", 0.8);
            game.encounter.countdown = 0;
        }

        this.recentDamage += startingHealth - this.health;
    }

    dyingProgress = 0;
    isDead = false;
    update(dt: number) {
        if (this.isDead) return;
        this.container.position.x = (game.app.screen.width / 3) * 2;
        this.container.position.y = (game.app.screen.height / 7) * 4;

        this.uiContainer.position.x = this.container.position.x;
        this.uiContainer.position.y = this.container.position.y;

        if (this.template.name == "Spider Bot") this.spiderBotUpdate(dt);
        if (this.template.name == "Spider") this.spiderUpdate();
        if (this.template.name == "Bee") this.beeUpdate();
        if (this.template.name == "Drone") this.droneUpdate();

        this.sprite.skew.x = game.phase * 0.05;

        this.updateUi(dt);

        if (this.recentDamage > 0) {
            this.helperContainer.tint = interpolateColors(0xffffff, 0xff0000, this.recentDamage / 3);
            this.sprite.tint = interpolateColors(0xffffff, 0xff0000, this.recentDamage / 3);
        } else {
            this.helperContainer.tint = interpolateColors(0xffffff, 0x00ff00, -this.recentDamage / 3);
            this.sprite.tint = interpolateColors(0xffffff, 0x00ff00, -this.recentDamage / 3);
        }

        if (this.isDying) {
            game.soundManager.musicSpeed();
            this.dyingProgress -= dt / 1000;
            game.effectsManager.setBars(this.dyingProgress);
            this.container.alpha = this.dyingProgress;
            if (this.dyingProgress <= 0) {
                this.destroy();
                this.isDead = true;
                if (game.encounter.otherInstance.enemy.health <= 0) {
                    game.nextTurnDisabled = true;
                    game.effectsManager.fadeout();
                    game.timeManager.delay(() => game.encounter.win(), 800);
                } else {
                    game.encounter.countdown = 0;
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
        this.sprites[0] = new Sprite(Assets.get("drone"));
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
        this.helperContainer.y = Math.sin(game.phase * Math.PI * 2) * 10 - 50;
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

        await action.action(this);

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
        if (this.recentDamage > 0) {
            this.hpText.style.fill = interpolateColors(0xffaaaa, 0xff0000, this.recentDamage / 3);
        } else {
            this.hpText.style.fill = interpolateColors(0xffaaaa, 0x00ff00, -this.recentDamage / 3);
        }

        this.uiContainer.alpha = 0.75 + this.recentDamage * 0.5;
    }

    attack(damage: number) {
        if (this.buffs.has(BuffType.strength)) {
            damage = Math.floor(damage * 1.5);
        }

        if (this.buffs.has(BuffType.weak)) {
            damage = Math.floor(damage * 0.5);
        }

        this.opponent.takeDamage(damage);
    }

    updateIntent() {
        this.intent.text = this.actions[0].description;
        this.intentSprite.texture = Assets.get(intentTextureLookup[this.actions[0].type]);
    }

    myTurn = false;
    async startTurn() {
        if (this.isDying || this.isDead) {
            game.encounter.enemyEndTurn();
        }
        
        this.myTurn = true;
        this.buffs.startTurn();
        if (this.isStunned) {
            this.isStunned = false;
            game.timeManager.delay(() => {
                this.buffs.endTurn();
                game.encounter.enemyEndTurn();
                this.myTurn = false;
            }, 200);
        } else {
            await game.timeManager.wait(400);
            await this.doAction();
            await game.timeManager.wait(400);
            this.buffs.endTurn();
            game.encounter.enemyEndTurn();
            this.myTurn = false;
        }
        this.updateIntent();
    }
}

export type EnemyTemplate = {
    name: string;
    health: number;
    sprite: string;
    actions: EnemyAction[];
};

export function desribeAction(action: EnemyAction) {
    return action.description;
}

type EnemyAction = {
    type: "attack" | "skill";
    action: (enemy: Enemy) => Promise<void>;
    description: string;
};

const intentTextureLookup = {
    attack: "attackType",
    skill: "skillType",
};
