import { Assets, Container, Graphics, Sprite } from "pixi.js";
import { game } from "./game";

export class Background {
    spriteForeground: Sprite;
    spriteBackground: Sprite;
    graphics: Graphics;
    skyMask: Sprite;

    constructor() {
        this.spriteForeground = new Sprite(Assets.get("past_fg"));
        this.spriteForeground.texture.source.scaleMode = "nearest";
        this.spriteForeground.anchor.set(0.5, 1);

        this.spriteBackground = new Sprite(Assets.get("past_bg"));
        this.spriteBackground.texture.source.scaleMode = "nearest";
        this.spriteBackground.anchor.set(0.5, 1);

        this.skyMask = new Sprite(Assets.get("skyGradient"));
        this.graphics = new Graphics();
        this.skyMask.scale.set(2);
        this.skyMask.anchor.set(0.5, 0);
        this.graphics.mask = this.skyMask;
        this.spriteForeground.anchor.set(0.5, 3 / 4);
        this.spriteBackground.anchor.set(0.5, 3 / 4);

        game.backgroundContainer.addChild(this.graphics);
        game.backgroundContainer.addChild(this.spriteBackground);
        game.backgroundContainer.addChild(this.spriteForeground);
        game.backgroundContainer.addChild(this.skyMask);
    }

    resize() {
        this.graphics.clear();
        this.graphics.rect(0, 0, game.app.screen.width, game.app.screen.height);
        this.graphics.fill(game.encounter.backgroundData.skyColor);
        this.skyMask.width = game.app.screen.width * 1.12;
        this.skyMask.height = game.app.screen.height * 1.5;
        this.skyMask.x = game.app.screen.width / 2;
        this.skyMask.y = -game.app.screen.height * 0.1;
        this.skyMask.rotation = game.encounter.backgroundData.skyRotation;
        this.graphics.mask = this.skyMask;
    }

    updateAssets() {
        if (game.encounter.inPast) {
            this.spriteForeground.texture = Assets.get("past_fg");
            this.spriteForeground.texture.source.scaleMode = "nearest";
            this.spriteBackground.texture = Assets.get("past_bg");
            this.spriteBackground.texture.source.scaleMode = "nearest";
        } else {
            this.spriteForeground.texture = Assets.get("future_fg");
            this.spriteForeground.texture.source.scaleMode = "nearest";
            this.spriteBackground.texture = Assets.get("future_bg");
            this.spriteBackground.texture.source.scaleMode = "nearest";
        }
    }

    update(dt: number) {
        this.resize();
        this.spriteForeground.position.x = game.app.screen.width / 2;
        this.spriteForeground.position.y = (game.app.screen.height / 3) * 2;
        this.spriteBackground.position.x = game.app.screen.width / 2 + game.camera.position.x / 3;
        this.spriteBackground.position.y = (game.app.screen.height / 3) * 2 + game.camera.position.y / 3;
        const coverRatio = Math.min(this.spriteForeground.texture.width / game.app.screen.width, this.spriteForeground.texture.height / game.app.screen.height);
        this.spriteForeground.scale.set(1 / coverRatio * 1.3);
        this.spriteBackground.scale.set(1 / coverRatio);
    }
}
