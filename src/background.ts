import { Assets, Graphics, Sprite } from "pixi.js";
import { game } from "./game";

export class Background {
    sprite: Sprite;
    graphics: Graphics;
    skyMask: Sprite;

    constructor() {
        this.sprite = new Sprite(Assets.get("pastGround"));
        this.skyMask = new Sprite(Assets.get("skyGradient"));
        this.sprite.texture.source.scaleMode = "nearest";
        this.sprite.anchor.set(0.5, 1);

        this.graphics = new Graphics();
        this.skyMask.scale.set(2);
        this.skyMask.anchor.set(0.5, 0);
        this.graphics.mask = this.skyMask;
        this.sprite.anchor.set(0.5, 1);

        game.backgroundContainer.addChild(this.skyMask);

        game.backgroundContainer.addChild(this.graphics);
        game.backgroundContainer.addChild(this.sprite);
    }

    update(dt: number) {
        this.graphics.clear();
        this.graphics.rect(0, 0, game.app.screen.width, game.app.screen.height);
        this.skyMask.width = game.app.screen.width * 1.12;
        this.skyMask.height = game.app.screen.height * 1.12;
        this.skyMask.x = game.app.screen.width / 2;
        this.skyMask.y = -game.app.screen.height * 0.1;
        this.graphics.fill(game.encounter.backgroundData.skyColor);
        this.skyMask.rotation = game.encounter.backgroundData.skyRotation;

        this.sprite.position.x = game.app.screen.width / 2;
        this.sprite.position.y = game.app.screen.height;
        const coverRatio = Math.min(this.sprite.texture.width / game.app.screen.width, this.sprite.texture.height / game.app.screen.height);
        this.sprite.scale.set(1 / coverRatio);
    }
}
