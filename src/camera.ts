import { game } from "./game";
import { Vector } from "./types";

export class Camera {
    position: Vector = new Vector(0, 0);

    get screenCenter() {
        return new Vector(window.innerWidth / 2, window.innerHeight / 2);
    }

    movementDiff = new Vector(0, 0);

    shakePower = 0;

    update(dt: number) {
        const oldPosition = this.position.result();
        const targetPosition = new Vector(0, 0);

        const mouse = Vector.fromLike(game.mouse);

        targetPosition.add(mouse);
        targetPosition.add(Vector.fromAngle(game.time * 0.05).mult(this.shakePower));
        targetPosition.sub(this.screenCenter);
        this.position.mult(0.9).add(targetPosition.mult(0.1));
        this.position.mult(0.2);

        this.movementDiff = this.position.diff(oldPosition);
        game.enemyContainer.x = -this.position.x;
        game.enemyContainer.y = -this.position.y;

        game.backgroundContainer.x = -this.position.x - 100;
        game.backgroundContainer.y = -this.position.y - 100;

        game.uiContainer.x = -this.position.x / 2;
        game.uiContainer.y = -this.position.y / 2;

        game.playerContainer.x = -this.position.x / 3;
        game.playerContainer.y = -this.position.y / 3;

        game.backgroundContainer.scale.set(1.1);

        this.shakePower *= 0.9;
    }
}
