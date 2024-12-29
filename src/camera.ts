import { CardType } from "./cardDefinitions";
import { game } from "./game";
import { Vector } from "./types";

export class Camera {
    position: Vector = new Vector(0, 0);

    get screenCenter() {
        return new Vector(window.innerWidth / 2, window.innerHeight / 2);
    }

    movementDiff = new Vector(0, 0);

    shakePower = 0;

    targetZoom = 1;
    zoom = 1;

    update(dt: number) {
        const oldPosition = this.position.result();
        const targetPosition = new Vector(0, 0);

        const mouse = Vector.fromLike(game.mouse);

        targetPosition.add(mouse);
        targetPosition.add(Vector.fromAngle(game.time * 0.05).mult(this.shakePower));
        targetPosition.sub(this.screenCenter);

        if (game.encounter != undefined) {
            if (game.encounter.instance.enemy.myTurn) {
                this.targetZoom = 1.3;
                targetPosition.x += 3 * window.innerWidth;
            } else if (game.player.activeCard != null && game.player.activeCard.definition.family == CardType.attack) {
                this.targetZoom = 1.2 - (game.player.activeCard.containerPosition.y / window.innerHeight) * 0.2;
            }
        }

        this.position.mult(0.9).add(targetPosition.mult(0.1));
        this.position.mult(0.2);
        this.zoom = (this.targetZoom + this.zoom * 9) / 10;
        this.targetZoom = 1;
        this.position.add(this.screenCenter.mult(this.zoom - 1));
        this.movementDiff = this.position.diff(oldPosition);
        game.enemyContainer.x = -this.position.x;
        game.enemyContainer.y = -this.position.y;

        game.backgroundContainer.x = -this.position.x - 100;
        game.backgroundContainer.y = -this.position.y - 100;

        game.uiContainer.x = -this.position.x / 2;
        game.uiContainer.y = -this.position.y / 2;

        game.playerContainer.x = -this.position.x / 3;
        game.playerContainer.y = -this.position.y / 3;

        game.backgroundContainer.scale.set(1.1 * this.zoom);
        game.enemyContainer.scale.set(this.zoom);
        game.uiContainer.scale.set((this.zoom - 1) / 2 + 1);
        game.playerContainer.scale.set(this.zoom);

        this.shakePower *= 0.9;
    }
}
