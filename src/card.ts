import { Assets, Sprite, Container, Graphics, HTMLText, Text } from "pixi.js";
import { CardDefinition, cardDefinitions, CardTemplate } from "./cardDefinitions";
import { game } from "./game";
import { BattleInstance } from "./player";
import { EquipmentCategory, equipmentDefinitions } from "./equipment";

export class Card {
    type: CardTemplate;
    container: Container;
    graphic: Graphics;
    sprite: Sprite;
    inHand = true;
    name: Text;
    description: HTMLText;
    usageCost: Text;

    containerPosition = { x: 0, y: 0 };

    isHovered = false;
    get isActive() {
        return game.player.activeCard == this;
    }

    set isActive(value: boolean) {
        game.player.activeCard = value ? this : null;
    }

    definition: CardDefinition;
    get instance(): BattleInstance {
        return game.player.instance;
    }

    constructor(type: CardTemplate) {
        this.type = type;
        this.definition = cardDefinitions.get(this.type)!;
        this.container = new Container();

        // hacky implementation to get category of card (first occurence)
        let asset!: string;
        const equipment = Array.from(equipmentDefinitions.values()).find(equipment => equipment.cards.includes(this.type));
        if (equipment) {
            switch (equipment.category) {
                case EquipmentCategory.starting:
                    asset = "basicCard";
                    break;
                case EquipmentCategory.arcane:
                    asset = "arcaneCard";
                    break;
                case EquipmentCategory.hitech:
                    asset = "hitechCard";
                    break;
            }
        }

        this.sprite = new Sprite(Assets.get(asset ?? "basicCard"));
        this.sprite.position.set(-100, -250)
        this.sprite.scale.set(0.55);
        //this.sprite.anchor.set(0.5, 0.8);

        this.graphic = new Graphics();
        this.container.addChild(this.graphic);
        this.graphic.clear();
        this.graphic.rect(this.sprite.position.x, this.sprite.position.y, this.sprite.width+1, this.sprite.height+1);
        //this.graphic.fill(0xffffff);
        this.graphic.stroke({ color: 0x404040, width: 3 });
        this.container.visible = false;
        game.cardContainer.addChild(this.container);


        this.container.addChild(this.sprite);
        this.container.addChild(this.graphic);
        game.cardContainer.addChild(this.container);

        this.container.interactive = true;


        this.name = new Text({
            text: this.definition.name,
            style: {
                fontFamily: "Arial",
                fontSize: 20,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 5 },
                wordWrap: true,
                wordWrapWidth: 180,
                align: "center",
            },
        });
        this.name.anchor.set(0.5, 0.5);
        this.name.position.set(0, -120);

        this.description = new HTMLText({
            text: this.definition.description,
            style: {
                fontFamily: "Arial",
                fontSize: 18,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 2 },
                wordWrap: true,
                wordWrapWidth: 180,
                align: "center",
            },
        });
        this.description.anchor.set(0.5, 0.5);
        this.description.position.set(0, -40);

        // show stamina cost
        this.usageCost = new Text({
            text: this.definition.cost,
            style: {
                fontFamily: "Arial",
                fontSize: 30,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 3 },
                wordWrap: true,
                wordWrapWidth: 200,
                align: "center",
            },
        });
        //this.usageCost.anchor.set(0.5, 0.5);
        this.usageCost.position.set(-95, -250);

        this.container.addChild(this.usageCost);
        this.container.addChild(this.description);
        this.container.addChild(this.name);

        this.container.addEventListener("pointerover", () => (this.isHovered = true));
        this.container.addEventListener("pointerout", () => (this.isHovered = false));
    }

    update(dt: number) {
        const myIndex = game.player.hand.indexOf(this);
        const cardCount = game.player.hand.length;
        const halfCount = Math.floor(cardCount / 2);
        const cardWidth = 230 - 10 * (cardCount - 1);

        // angle towards the center (+0.5) cause it was irritating me
        let targetAngle = (myIndex + 0.5) * 0.1 - halfCount * 0.1 + game.phase * 0.03;

        if (this.isHovered && game.player.activeCard == null) {
            targetAngle = 0;
            game.cardContainer.setChildIndex(this.container, game.cardContainer.children.length - 1);
            if (game.mouse.down) {
                this.isActive = true;
                if (this.definition.keywords) game.uiManager.showKeywords(this.definition.keywords);
            }
        } else {
            game.cardContainer.setChildIndex(this.container, cardCount - myIndex - 1);
        }

        if (this.isActive && !game.mouse.down) {
            this.isActive = false;
            game.uiManager.hideKeywords();
            if (game.mouse.y < game.app.canvas.height / 2) {
                if (this.definition.cost == undefined || game.player.stamina >= this.definition.cost) {
                    game.player.stamina -= this.definition.cost ?? 0;
                    this.play();
                }
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

        if (this.isActive || this.isHovered) {
            this.container.scale.set(1);
        } else {
            this.container.scale.set(0.9);
        }

        this.container.position.x = (this.containerPosition.x + this.container.position.x) / 2;
        this.container.position.y = (this.containerPosition.y + this.container.position.y) / 2;
        this.container.rotation = (targetAngle + this.container.rotation) / 2;
    }

    play() {
        game.player.usedPile.push(this);
        game.player.hand.splice(game.player.hand.indexOf(this), 1);
        this.hide();
        this.definition.onPlayed?.(game.player, this.instance.enemy);
    }

    discard() {
        game.player.usedPile.push(this);
        game.player.hand.splice(game.player.hand.indexOf(this), 1);
        this.hide();
    }

    hide() {
        this.container.visible = false;
        this.inHand = false;
        this.isHovered = false;
        this.isActive = false;
    }

    show() {
        this.container.visible = true;
        this.inHand = true;
        this.container.position.x = 0;
        this.container.position.y = 1000;
    }

    destroy(): void {
        this.container.destroy();
    }
}
