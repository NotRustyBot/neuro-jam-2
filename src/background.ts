import { Assets, Sprite } from "pixi.js";
import { game } from "./game";

export class Background {
    sprite: Sprite;
    constructor() {
        this.sprite = new Sprite(Assets.get("past1"));
        this.sprite.texture.source.scaleMode = "nearest";
        this.sprite.anchor.set(0.5, 1);
        game.backgroundContainer.addChild(this.sprite);
    }

    update(dt: number) {
        this.sprite.position.x = game.app.screen.width / 2;
        this.sprite.position.y = game.app.screen.height;
        const coverRatio = Math.min(this.sprite.texture.width / game.app.screen.width, this.sprite.texture.height / game.app.screen.height);
        this.sprite.scale.set(1 / coverRatio);
        console.log(1 / coverRatio);
    }
}
