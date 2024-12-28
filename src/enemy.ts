import { Container, Sprite } from "pixi.js";
import { game } from "./game";

export class Enemy {
    health: number = 5;
    container: Container;
    sprite: Sprite;

    constructor() {
        this.container = new Container();
        this.sprite = new Sprite();
        this.container.addChild(this.sprite);
    }


    
    hide() {
        game.enemyContainer.removeChild(this.container);
    }

    show() {
        game.enemyContainer.addChild(this.container);
    }
}
