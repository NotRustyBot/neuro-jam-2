import { Assets, BlurFilter, ColorMatrixFilter, Container, Graphics, RenderTexture, Sprite, Text } from "pixi.js";
import { KeywordDefinition, keywordDefinitions, KeywordType } from "./cardDefinitions";
import { game } from "./game";
import { interpolateColors } from "./utils";
import { Vector, Vectorlike } from "./types";
import { Buff, buffDefinitions, BuffType } from "./buffs";

export class UIManager {
    keywords = new Set<UiKeywordDefinition>();
    keywordContainer = new Container();
    screenReflectionTexture: RenderTexture;
    reflectionSprite: Sprite;

    playerUiContainer = new Container();
    playerGraphics: Graphics;
    playerHpText: Text;

    blockContainer: Container;
    blockText: Text;
    blockSprite: Sprite;

    buffText: Text;
    constructor() {
        this.screenReflectionTexture = RenderTexture.create({
            width: game.app.screen.width,
            height: game.app.screen.height,
            resolution: 0.25,
        });
        this.screenReflectionTexture.dynamic = true;
        this.reflectionSprite = new Sprite(this.screenReflectionTexture);
        game.screenReflectContainer.addChild(this.reflectionSprite);
        game.screenReflectContainer.interactiveChildren = false;
        this.reflectionSprite.alpha = 0.25;
        this.reflectionSprite.anchor.set(0.5);
        const filter = new ColorMatrixFilter();
        const brightness = 0.25;
        filter.matrix = [1, 0, 0, 0, brightness, 0, 1, 0, 0, brightness, 0, 0, 1, 0, brightness, 0, 0, 0, 1, 0];
        this.reflectionSprite.filters = [new BlurFilter({ strength: 10 }), filter];

        this.playerGraphics = new Graphics();
        this.playerUiContainer.addChild(this.playerGraphics);
        this.playerHpText = new Text({ text: "hp", style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff } });
        this.playerHpText.anchor.set(0.5, 1);
        this.playerUiContainer.addChild(this.playerHpText);
        game.uiContainer.addChild(this.playerUiContainer);

        this.buffText = new Text({ text: "", style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff, align: "center", wordWrap: true, wordWrapWidth: 300 } });
        this.buffText.anchor.set(0.5, 1);
        game.uiContainer.addChild(this.buffText);

        this.blockContainer = new Container();
        this.blockText = new Text({ text: "", style: { fontFamily: "Arial", fontSize: 40, fill: 0xffffff } });
        this.blockText.anchor.set(0.5, 0.5);
        this.blockSprite = new Sprite(Assets.get("block"));
        this.blockSprite.anchor.set(0.5);
        this.blockSprite.scale.set(0.5);
        this.blockSprite.position.x = -80;
        this.blockText.position.x = -80;
        this.blockContainer.addChild(this.blockSprite);
        this.blockContainer.addChild(this.blockText);
        this.playerUiContainer.addChild(this.blockContainer);
        this.blockContainer.visible = false;
    }

    recentPlayerDamage = 0;
    updatePlayerUi(dt: number) {
        this.playerUiContainer.y = game.app.screen.height - 200;
        this.playerUiContainer.x = Math.max(200, game.app.screen.width / 5);

        this.playerGraphics.clear();

        const hpRatio = (game.player.health + this.recentPlayerDamage) / game.player.maxHealth;

        const offset = 2.5;
        this.playerGraphics.arc(0, 0, 200, offset, 1.2 + offset);
        this.playerGraphics.stroke({ width: 20, color: 0x330033 });
        this.playerGraphics.arc(0, 0, 200, offset, hpRatio * 1.2 + offset);
        this.playerGraphics.stroke({ width: 20, color: 0xee3333 });

        const sliceSize = 1.2 / game.player.maxStamina;
        for (let index = 0; index < game.player.maxStamina; index++) {
            const sliceOffset = offset + sliceSize * index;
            this.playerGraphics.arc(0, 0, 150, sliceOffset, sliceOffset + sliceSize * 0.9);

            if (game.player.activeCard != null) {
                const cost = game.player.activeCard.definition.cost ?? 0;
                const resultingStamina = game.player.stamina - cost;

                if (resultingStamina > 0) {
                    if (resultingStamina <= index && game.player.stamina > index) {
                        this.playerGraphics.stroke({ width: 30, color: interpolateColors(0x55aaff, 0xffaa00, Math.abs(game.phase)) });
                        continue;
                    }
                } else {
                    if (cost > index) {
                        if (game.player.stamina > index) {
                            this.playerGraphics.stroke({ width: 30, color: interpolateColors(0x55aaff, 0xffaa00, Math.abs(game.phase)) });
                            continue;
                        }
                        this.playerGraphics.stroke({ width: 30, color: interpolateColors(0x224455, 0xff0000, Math.abs(game.phase)) });
                        continue;
                    }
                }
            }

            if (game.player.stamina > index) {
                this.playerGraphics.stroke({ width: 30, color: 0x55aaff });
                continue;
            }
            this.playerGraphics.stroke({ width: 30, color: 0x224455 });
        }

        const textAngle = hpRatio * 1.2 + offset;
        this.playerHpText.text = `${game.player.health}`;
        this.playerHpText.rotation = textAngle + Math.PI / 2;
        const textPosition = Vector.fromAngle(textAngle).mult(210);
        this.playerHpText.position.set(textPosition.x, textPosition.y);
        this.playerHpText.style.fill = interpolateColors(0xffaaaa, 0xff0000, this.recentPlayerDamage / 3);
        this.playerHpText.scale.set(1 + this.recentPlayerDamage * 0.5);
        this.recentPlayerDamage *= 0.9;

        if(game.player.block > 0) {
            this.blockContainer.visible = true;
            this.blockText.text = `${game.player.block}`;
        }else {
            this.blockContainer.visible = false;
        }
    }

    update(dt: number) {
        this.screenReflectionTexture.resize(window.innerWidth, window.innerHeight);
        this.reflectionSprite.width = window.innerWidth + 200;
        this.reflectionSprite.height = window.innerHeight + 200;
        game.app.renderer.render({ container: game.uiContainer, target: this.screenReflectionTexture });
        const pos = game.camera.movementDiff.result().mult(3);
        pos.x += window.innerWidth / 2;
        pos.y += window.innerHeight / 2;
        this.reflectionSprite.position.set(pos.x, pos.y);

        if (game.player.activeCard != null) {
            this.keywordContainer.position.set(game.player.activeCard.containerPosition.x, game.player.activeCard.containerPosition.y);
        }
        this.updatePlayerUi(dt);
        this.buffText.position.set(game.mouse.x, game.mouse.y - 10);
    }

    resize() {
    }

    initKeywords() {
        game.uiContainer.addChild(this.keywordContainer);
    }

    updateKeywords(position: Vector) {
        this.keywordContainer.position.set(position.x, position.y);
    }

    showKeywords(keywords: KeywordType[], position?: Vector) {
        this.keywords.forEach((keyword) => keyword.destroy());
        this.keywords.clear();

        new Set(keywords).forEach((keyword, index) => {
            const uiKeyword = new UiKeywordDefinition(keyword);
            this.keywords.add(uiKeyword);
            uiKeyword.container.position.y = 80 * this.keywords.size - 300;
            uiKeyword.container.position.x = -420;
        });
    }

    hideKeywords() {
        this.keywords.forEach((keyword) => keyword.destroy());
    }

    showBuff(buff: Buff, coords: Vectorlike) {
        this.buffText.text = buff.definition.name + ": " + buff.description;
    }

    hideBuff() {
        this.buffText.text = "";
    }
}

class UiKeywordDefinition {
    container: Container;
    name: Text;
    description: Text;

    keyword: KeywordDefinition;

    constructor(type: KeywordType) {
        this.keyword = keywordDefinitions.get(type)!;
        this.container = new Container();
        this.name = new Text({
            text: this.keyword.name,
            style: {
                fontFamily: "Arial",
                fontSize: 24,
                fill: this.keyword.color,
                stroke: { color: 0x000000, width: 2 },
                wordWrap: true,
                wordWrapWidth: 300
            }
        });

        this.name.anchor.set(1, 0);
        this.name.x = 300;
        this.description = new Text({
            text: this.keyword.description,
            style: {
                fontFamily: "Arial",
                fontSize: 24,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 2 },
                wordWrap: true,
                wordWrapWidth: 300,
                align: "right",
            },
        });
        this.description.y = 27;
        this.description.anchor.set(1, 0);
        this.description.x = 300;

        this.container.addChild(this.name);
        this.container.addChild(this.description);

        game.uiManager.keywordContainer.addChild(this.container);
    }

    destroy() {
        this.container.destroy();
    }
}
