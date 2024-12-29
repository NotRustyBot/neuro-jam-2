import { Assets, Sprite, Container, Graphics, HTMLText, Text, RenderTexture } from "pixi.js";
import { CardDefinition, cardDefinitions, CardTemplate } from "./cardDefinitions";
import { game } from "./game";
import { BattleInstance } from "./player";
import { EquipmentCategory, equipmentDefinitions } from "./equipment";

export class Card {
    type: CardTemplate;
    container: Container;
    cardSprite: Sprite;
    usageCostSprite: Sprite;
    inHand = true;
    name: Text;
    usageCost: Text;
    description!: Sprite;

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
        const equipment = Array.from(equipmentDefinitions.values()).find((equipment) => equipment.cards.includes(this.type));
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
        this.cardSprite = new Sprite(Assets.get(asset ?? "basicCard"));
        this.cardSprite.texture.source.scaleMode = "nearest";
        this.cardSprite.position.set(-100, -250);
        this.cardSprite.scale.set(3.15);

        const usageCostOutlineSprite = new Sprite(Assets.get("cardCostOutline"));
        usageCostOutlineSprite.position.set(-101, -251);

        this.usageCostSprite = new Sprite(Assets.get("cardCost"));
        this.usageCostSprite.position.set(-101, -251);
        this.usageCostSprite.tint = 0xff6700;

        this.container.interactive = true;
        this.container.visible = false;

        const originCircle = new Graphics();
        const cardOutline = new Graphics();
        originCircle.roundRect(-5, -5, 10, 10)
        originCircle.stroke({ color: 0x000000, width: 3 });
        originCircle.fill(0xffffff);

        cardOutline.roundRect(this.cardSprite.position.x, this.cardSprite.position.y, this.cardSprite.width + 1, this.cardSprite.height + 1, 2);
        cardOutline.stroke({ color: 0x808080, width: 3 });

        this.container.addChild(this.cardSprite);
        this.container.addChild(originCircle, cardOutline);
        this.container.addChild(this.usageCostSprite, usageCostOutlineSprite);
        game.cardContainer.addChild(this.container);

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

        this.createDescription();

        // show stamina cost
        this.usageCost = new Text({
            text: this.definition.cost,
            style: {
                fontFamily: "Arial",
                fontSize: 25,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 2 },
                wordWrap: true,
                wordWrapWidth: 200,
                align: "center",
            },
        });
        this.usageCost.anchor.set(0.5, 0.5);
        this.usageCost.position.set(this.usageCostSprite.position.x + this.usageCostSprite.width/2, this.usageCostSprite.position.y + this.usageCostSprite.height/2);

        this.container.addChild(this.usageCost);
        this.container.addChild(this.description);
        this.container.addChild(this.name);

        this.container.addEventListener("pointerover", () => (this.isHovered = true));
        this.container.addEventListener("pointerout", () => (this.isHovered = false));
    }

    createDescription() {
        this.description = new Sprite(getDescriptionTexture(this.definition.description));
        this.description.anchor.set(0.5, 0.5);
        this.description.position.set(0, 10);

        this.container.addChild(this.description);
    }

    wasHovered = false;
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
                game.soundManager.play("select", 0.25);
                if (this.definition.keywords) game.uiManager.showKeywords(this.definition.keywords);
            }
        } else {
            game.cardContainer.setChildIndex(this.container, cardCount - myIndex - 1);
        }

        //if (this.isHovered && !this.wasHovered) {
        //    if (!this.isActive) {
        //        game.soundManager.play("select", 0.1);
        //    }
        //}

        if (game.player.stamina < (this.definition.cost ?? 0)) {
            this.usageCost.style.fill = 0xff0000;
            this.usageCostSprite.tint = 0x600000;
        } else {
            this.usageCost.style.fill = 0xffffff;
            this.usageCostSprite.tint = 0xff6700;
        }

        this.wasHovered = this.isHovered;

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

const descriptionRenderCache = new Map<string, RenderTexture>();

export function getDescriptionTexture(text: string): RenderTexture {
    if (descriptionRenderCache.has(text)) return descriptionRenderCache.get(text)!;
    const container = new Container();
    const width = 180;
    const description = new HTMLText({
        text: text,
        style: {
            fontFamily: "Arial",
            fontSize: 18,
            fill: 0x000000,
            wordWrap: true,
            wordWrapWidth: 180,
            align: "center",
        },
    });

    container.addChild(description);
    description.anchor.set(0.5, 0);
    description.position.set(width / 2, 0);
    const texture = RenderTexture.create({
        width: width,
        height: 200,
    });

    // the following is an unholy abomination. viewer discretion is advised     // fixed your comment for you ;)
    setTimeout(() => {
        game.app.renderer.render({ target: texture, container });
    }, 100);

    game.app.renderer.render({ target: texture, container });
    descriptionRenderCache.set(text, texture);
    return texture;
}
