import { Container, Graphics, HTMLText, Text } from "pixi.js";
import { CardDefinition, cardDefinitions, CardTemplate } from "./cardDefinitions";
import { game } from "./game";
import { BattleInstance } from "./player";

export class Card {
    type: CardTemplate;
    container: Container;
    graphic: Graphics;
    inHand = true;
    name: Text;
    description: HTMLText;

    containerPosition = { x: 0, y: 0 };

    isHovered = false;
    get isActive() {
        return game.player.instance.activeCard == this;
    }

    set isActive(value: boolean) {
        game.player.instance.activeCard = value ? this : null;
    }

    definition: CardDefinition;
    instance: BattleInstance;

    constructor(type: CardTemplate, instance: BattleInstance) {
        this.instance = instance;
        this.type = type;
        this.definition = cardDefinitions.get(this.type)!;
        this.container = new Container();
        this.graphic = new Graphics();
        this.container.addChild(this.graphic);
        this.graphic.rect(-100, -250, 200, 300);
        this.graphic.fill(0xffffff);
        this.graphic.stroke({ color: 0xffaa00, width: 2 });

        this.container.interactive = true;

        this.name = new Text({
            text: this.definition.name,
            style: {
                fontFamily: "Arial",
                fontSize: 24,
                fill: 0x000000,
            },
        });

        this.name.position.x = -90;
        this.name.position.y = -240;

        this.description = new HTMLText({
            text: this.definition.description,
            style: {
                fontFamily: "Arial",
                fontSize: 16,
                fill: 0x000000,
                wordWrap: true,
                wordWrapWidth: 200,
                align: "center",
            },
        });

        this.description.anchor.set(0.5, 0);
        this.description.position.y = -100;

        this.container.addChild(this.description);
        this.container.addChild(this.name);

        this.container.addEventListener("pointerover", () => (this.isHovered = true));
        this.container.addEventListener("pointerout", () => (this.isHovered = false));
    }

    update(dt: number) {
        if (!this.inHand) {
            return;
        }
        const myIndex = this.instance.hand.indexOf(this);
        const cardCount = this.instance.hand.length;
        const halfCount = Math.floor(cardCount / 2);
        const cardWidth = 230 - 10 * (cardCount - 1);

        let targetAngle = myIndex * 0.1 - halfCount * 0.1;

        if (this.isHovered && this.instance.activeCard == null) {
            targetAngle = 0;
            game.cardContainer.setChildIndex(this.container, cardCount - 1);
            if (game.mouse.down) {
                this.isActive = true;
                game.uiManager.showKeywords(this.definition.keywords);
            }
        } else {
            game.cardContainer.setChildIndex(this.container, cardCount - myIndex - 1);
        }

        if (this.isActive && !game.mouse.down) {
            this.isActive = false;
            game.uiManager.hideKeywords();
            if (game.mouse.y < game.app.canvas.height / 2) {
                this.play();
            }
        }

        if (this.isActive) {
            targetAngle = 0;
            this.containerPosition.x = game.mouse.x;
            this.containerPosition.y = game.mouse.y;
        } else {
            this.containerPosition.x = game.app.canvas.width / 2 + myIndex * cardWidth - (halfCount * cardWidth) / 2 - cardWidth / 2;
            this.containerPosition.y = game.app.canvas.height - 50;
        }

        this.container.position.x = (this.containerPosition.x + this.container.position.x) / 2;
        this.container.position.y = (this.containerPosition.y + this.container.position.y) / 2;
        this.container.rotation = (targetAngle + this.container.rotation) / 2;
    }

    play() {
        this.definition.onPlayed?.(game.player, this.instance.enemy);
        this.instance.usedPile.push(this);
        this.instance.hand.splice(this.instance.hand.indexOf(this), 1);
        this.hide();
    }

    hide() {
        game.cardContainer.removeChild(this.container);
        this.inHand = false;
        this.isHovered = false;
        this.isActive = false;
    }

    show() {
        game.cardContainer.addChild(this.container);
        this.inHand = true;
        this.container.position.x = 0;
        this.container.position.y = 1000;
    }
}