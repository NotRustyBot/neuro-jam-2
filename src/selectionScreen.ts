import { Assets, Sprite, Container, Graphics, Text } from "pixi.js";
import { game } from "./game";
import { Equipment, EquipmentCategory, EquipmentTemplate, equipmentDefinitions } from "./equipment";
import { CardTemplate } from "./cardDefinitions";
import { Card } from "./card";
import { KeywordType } from "./cardDefinitions";
import { Vector } from "./types";

export enum SelectionMode {
    STARTING_EQUIPMENT,
    POST_ENCOUNTER
}

export class SelectionScreen {
    container: Container;
    equipmentContainer!: Container;
    selectionMode!: SelectionMode;

    selectedEquipment: Equipment[] = [];

    // max equipment from starting pool
    startingEquipmentMaximum = 3;
    // how many choices are given to the player
    startingEquipmentPoolSize = 6;

    // max equipment from each arcane/hitech pool
    equipmentMaximumPerPool = 1;
    equipmentPoolSize = 2;

    keywordsPositionX: number = 0;
    tooltip!: Container;
    tooltipSideRight: boolean = false;
    tooltipOffset: number = 1;
    tooltipHover: boolean = false;

    title!: Text;
    background!: Sprite;
    selectContainer!: Container;

    // equipment buttons
    buttonWidth = 180;
    buttonHeight = 180;
    xPadding = 60;
    yPadding = 20;

    visible: boolean = false;

    // behaviour set externally
    onSelectionComplete!: (selectedEquipment: Equipment[]) => void;

    constructor() {
        this.container = new Container();

        this.tooltip = new Container();
        this.tooltip.eventMode = "none";
        //this.tooltip.visible = false;

        this.background = new Sprite(Assets.get("menu"));
        this.background.width = game.app.screen.width;
        this.background.height = game.app.screen.height;
        this.background.texture.source.scaleMode = "nearest";
        this.container.addChild(this.background);
    }

    init() {
        //this.background = new Graphics();
        //this.background.rect(0, 0, game.app.screen.width, game.app.screen.height);
        //this.background.fill(0x8B4513);

        this.title = new Text({ text: "", style: { fontFamily: "monospace", fontSize: 48, fill: 0xffffff, stroke: {color: 0x000000, width: 6} } });
        this.title.position.set(game.app.screen.width / 2, 100);
        this.title.anchor.set(0.5);

        this.equipmentContainer = new Container();
        this.equipmentContainer.position.set(game.app.screen.width/2 - this.equipmentContainer.width/2, 100);

        // select button
        this.selectContainer = new Container();
        this.selectContainer.interactive = true;
        this.selectContainer.cursor = "pointer";
        this.selectContainer.on("pointerdown", () => this.completeSelection());
        this.selectContainer.on("pointerover", () => {
            if (this.atMaxSelected()) this.selectContainer.tint = 0x00aa00;
        });
        this.selectContainer.on("pointerout", () => {
            this.selectContainer.tint = 0x00ff00;
        });


        const selectButton = new Graphics();
        selectButton.roundRect(0, 0, 200, 75);
        selectButton.fill(0x00ff00);
        selectButton.stroke({ color: 0x000000, width: 4 });

        const selectText = new Text({ text: "Select", style: { fontFamily: "monospace", fontSize: 26, fill: 0x000000 } });
        selectText.position.set(selectButton.width / 2, selectButton.height / 2 - 2);
        selectText.anchor.set(0.5);

        //this.selectContainer.position.set((game.app.screen.width - selectButton.width) / 2, game.app.screen.height + 200);
        this.selectContainer.addChild(selectButton, selectText);

        this.container.addChild(this.background, this.title, this.equipmentContainer, this.selectContainer);
    }

    show(mode: SelectionMode) {
        this.selectionMode = mode;

        // clear from possible previous uses
        this.selectedEquipment = [];

        // clear background
        this.equipmentContainer.removeChildren();
        // reinit all buttons
        this.init();
        this.displayEquipmentOptions();
        game.app.stage.addChild(this.container);
        game.app.stage.addChild(this.tooltip);

        // keyword display
        this.container.addChild(game.uiKeywordsContainer);

        this.visible = true;
    }

    hide() {
        game.app.stage.removeChild(this.container);
        this.visible = false;
    }

    displayEquipmentOptions() {
        if (this.selectionMode === SelectionMode.STARTING_EQUIPMENT) {
            // equipment filtering
            const startingEquipmentPool = Array.from(equipmentDefinitions.values())//.filter((equipment) => equipment.category === EquipmentCategory.starting);
            const equipmentArray = startingEquipmentPool//.sort(() => Math.random() - 0.5).slice(0, this.startingEquipmentPoolSize);

            this.title.text = `Select your starting equipment (${this.startingEquipmentMaximum})`;
            // button settings
            const MAX_PER_ROW = Math.floor(game.app.screen.width / (this.buttonWidth + this.xPadding * 2));

            // row/column precalculations
            const equipmentPerRow = equipmentArray.length > MAX_PER_ROW ? MAX_PER_ROW : equipmentArray.length;
            const equipmentColumns = Math.ceil(equipmentArray.length / MAX_PER_ROW);

            // create background
            const { backgroundContainer: background, text: text } = this.createEquipmentBackground(
                EquipmentCategory.starting, "Modern-Day Equipment", 0xffffff, 0, 150,
                equipmentPerRow * this.buttonWidth + (equipmentPerRow - 1) * this.xPadding,
                equipmentColumns * this.buttonHeight + (equipmentColumns - 1) * this.yPadding
            );
            this.equipmentContainer.addChild(background, text);

            // create buttons
            equipmentArray.forEach((equipment, index) => {
                const row = Math.floor(index / MAX_PER_ROW);
                const column = index % MAX_PER_ROW;
                const x = column * (this.buttonWidth + this.xPadding) + background.position.x;
                const y = row * (this.buttonHeight + this.yPadding) + background.position.y;
                const button = this.createEquipmentButton(equipment, x, y);
                this.equipmentContainer.addChild(button);
            });
        }
        else if (this.selectionMode === SelectionMode.POST_ENCOUNTER) {
            // equipment filtering
            const arcanePool = Array.from(equipmentDefinitions.values()).filter((equipment) => equipment.category === EquipmentCategory.arcane && !game.player.equipment.includes(equipment));
            const hitechPool = Array.from(equipmentDefinitions.values()).filter((equipment) => equipment.category === EquipmentCategory.hitech && !game.player.equipment.includes(equipment));

            const arcaneEquipment = arcanePool.sort(() => Math.random() - 0.5).slice(0, this.equipmentPoolSize);
            const hitechEquipment = hitechPool.sort(() => Math.random() - 0.5).slice(0, this.equipmentPoolSize);

            this.title.text = `Select your reward (${this.equipmentMaximumPerPool} per pool)`;
            // button settings
            const MAX_PER_ROW = 2;

            // row/column precalculations
            const arcanePerRow = arcaneEquipment.length > MAX_PER_ROW ? MAX_PER_ROW : arcaneEquipment.length;
            const arcaneColumns = Math.ceil(arcaneEquipment.length / MAX_PER_ROW);

            const hitechPerRow = hitechEquipment.length > MAX_PER_ROW ? MAX_PER_ROW : hitechEquipment.length;
            const hitechColumns = Math.ceil(hitechEquipment.length / MAX_PER_ROW);

            // create background for each pool
            const { backgroundContainer: arcaneBackground, text: arcaneText } = this.createEquipmentBackground(
                EquipmentCategory.arcane, "Arcane Equipment", 0xff5555, 0, 200,
                arcanePerRow * this.buttonWidth + (arcanePerRow - 1) * this.xPadding,
                arcaneColumns * this.buttonHeight + (arcaneColumns - 1) * this.yPadding
            );
            const { backgroundContainer: hitechBackground, text: hitechText } = this.createEquipmentBackground(
                EquipmentCategory.hitech, "High-Tech Equipment", 0x55ffff,game.app.screen.width - this.equipmentContainer.position.x, 200,
                hitechPerRow * this.buttonWidth + (hitechPerRow - 1) * this.xPadding,
                hitechColumns * this.buttonHeight + (hitechColumns - 1) * this.yPadding
            );
            this.equipmentContainer.addChild(arcaneBackground, hitechBackground, arcaneText, hitechText);

            // create buttons for each pool
            arcaneEquipment.forEach((equipment, index) => {
                const row = Math.floor(index / MAX_PER_ROW);
                const column = index % MAX_PER_ROW;
                const x = column * (this.buttonWidth + this.xPadding) + arcaneBackground.position.x;
                const y = row * (this.buttonHeight + this.yPadding) + arcaneBackground.position.y;
                const button = this.createEquipmentButton(equipment, x, y);
                this.equipmentContainer.addChild(button);
            });

            hitechEquipment.forEach((equipment, index) => {
                const row = Math.floor(index / MAX_PER_ROW);
                const column = index % MAX_PER_ROW;
                const x = column * (this.buttonWidth + this.xPadding) + hitechBackground.position.x;
                const y = row * (this.buttonHeight + this.yPadding) + hitechBackground.position.y;
                const button = this.createEquipmentButton(equipment, x, y);
                this.equipmentContainer.addChild(button);
            });
        }
    }

    atMaxSelected(equipment?: Equipment): boolean {
        if (this.selectionMode === SelectionMode.STARTING_EQUIPMENT && this.selectedEquipment.length >= this.startingEquipmentMaximum) {
            return true;
        }

        if (this.selectionMode === SelectionMode.POST_ENCOUNTER) {
            const arcaneSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.arcane).length;
            const hitechSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.hitech).length;

            if (equipment) {
                if ((equipment.category === EquipmentCategory.arcane && arcaneSelected >= this.equipmentMaximumPerPool) ||
                    (equipment.category === EquipmentCategory.hitech && hitechSelected >= this.equipmentMaximumPerPool)) {
                    return true;
                }
            }
            else {
                if (arcaneSelected >= this.equipmentMaximumPerPool && hitechSelected >= this.equipmentMaximumPerPool) {
                    return true;
                }
            }
        }
        return false;
    }

    createEquipmentButton(equipment: Equipment, x: number, y: number): Container {
        let selectAsset;
        switch (equipment.category) {
            case EquipmentCategory.starting:
                selectAsset = "startingSelect";
                break;
            case EquipmentCategory.arcane:
                selectAsset = "arcaneSelect";
                break;
            case EquipmentCategory.hitech:
                selectAsset = "hitechSelect";
                break;
        }

        const button = new Container();
        button.position.set(x, y);
        button.interactive = true;
        button.cursor = "pointer";

        const buttonBackground = new Graphics();
        buttonBackground.rect(0, 0, this.buttonWidth, this.buttonHeight);
        buttonBackground.fill(0x404040);
        buttonBackground.stroke({ color: 0x000000, width: 2 });

        const icon = new Sprite();
        icon.texture = Assets.get(EquipmentTemplate[equipment.template]) ?? Assets.get("null");
        icon.texture.source.scaleMode = "nearest";
        icon.scale.set(2.5);
        icon.anchor.set(0.5);
        icon.position.set(buttonBackground.width / 2, buttonBackground.height / 2 + 20);

        const select = new Sprite(Assets.get(selectAsset) ?? Assets.get("null"));
        select.texture.source.scaleMode = "nearest";
        select.width = buttonBackground.width;
        select.height = buttonBackground.height;
        select.visible = false;

        const buttonText = new Text({
            text: equipment.name,
            style: {
                fontFamily: "monospace",
                fontSize: 20,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 2 },
                wordWrap: true,
                wordWrapWidth: 150,
                align: "center",
            }
        });
        buttonText.position.set(buttonBackground.width / 2, 30);
        buttonText.anchor.set(0.5);

        button.addChild(buttonBackground, buttonText, icon);
        button.addChild(select);

        let activated = false;
        button.on("pointerdown", () => {
            if (this.selectedEquipment.includes(equipment)) {
                activated = false;
                //select.visible = false;
                buttonText.tint = 0x00aaaa;
                //buttonBackground.tint = 0xffffff;
                this.selectedEquipment.splice(this.selectedEquipment.indexOf(equipment), 1);
                game.soundManager.play("click", 0.3);
            }
            else {
                if (this.atMaxSelected(equipment)) return;
                activated = true;
                select.visible = true;
                buttonText.tint = 0x00ff00;
                //buttonBackground.tint = 0x55dd55;
                this.selectedEquipment.push(equipment);
                game.soundManager.play("click", 0.3);
            }
        });
        button.on("pointerover", () => {
            this.showTooltip(equipment);
            if (!activated && !this.atMaxSelected(equipment)) {
                select.visible = true;
                buttonText.tint = 0x00aaaa;
                //buttonBackground.tint = 0x55aaaa;
            }
        });
        button.on("pointerout", () => {
            this.tooltip.removeChildren();
            game.uiManager.hideKeywords();
            if (!activated) {
                select.visible = false;
                buttonText.tint = 0xffffff;
                //buttonBackground.tint = 0xffffff;
            }
        });

        return button;
    }

    createEquipmentBackground(category: EquipmentCategory, titleText: string, color: number, x: number, y: number, width: number, height: number) {
        let frame = false;
        let frameAsset;
        let xOffset = 0;
        let yOffset = 0;
        switch (category) {
            case EquipmentCategory.arcane:
                frame = true;
                frameAsset = "arcaneFrame";
                xOffset = 68;
                yOffset = 76;
                break;
            case EquipmentCategory.hitech:
                frame = true;
                frameAsset = "hitechFrame";
                xOffset = 42;
                yOffset = 48;
                break;
        }

        const backgroundContainer = new Container();
        backgroundContainer.position.set(x, y);

        const background = new Graphics();
        background.rect(0, 0, width, height);
        background.fill(0x808080);
        backgroundContainer.addChild(background);

        if (frame) {
            const frameSprite = new Sprite(Assets.get(frameAsset!));
            frameSprite.texture.source.scaleMode = "nearest";
            frameSprite.position.set(-xOffset / 2, -yOffset / 2);
            frameSprite.width = background.width + xOffset;
            frameSprite.height = background.height + yOffset;

            backgroundContainer.addChild(frameSprite);
        }
        else {
            background.stroke({ color: 0x606060, width: 10 });
            let width = background.strokeStyle.width+3;
            background.width += width;
            background.height += width;
            background.position.set(-width/2, -width /2);
        }

        const text = new Text({ text: titleText, style: { fontFamily: "monospace", fontSize: 40, fill: color, stroke: {color: 0x000000, width: 3} } });
        text.position.set(x + width / 2, y - 50);
        text.anchor.set(0.5);

        return { backgroundContainer, text };
    };

    showTooltip(equipment: Equipment) {
        // tooltip positioning right/left
        if (game.mouse.x > game.app.screen.width / 2) {
            this.tooltipSideRight = true;
        }
        else {
            this.tooltipSideRight = false;
        }

        const equipmentCards = new Set<CardTemplate>();
        const keywords = new Set<KeywordType>();
        const cardCounts: { [cardTemplate: number]: number } = {};

        equipment.cards.forEach((cardTemplate) => {
            equipmentCards.add(cardTemplate);

            // count occurrences of each cardTemplate
            cardCounts[cardTemplate] = (cardCounts[cardTemplate] || 0) + 1;
        });

        let xOffset = 0;
        equipmentCards.forEach((cardTemplate) => {
            // display card
            const card = new Card(cardTemplate);
            card.container.visible = true;

            // display card counts
            const cardCountText = new Text({text: `${cardCounts[cardTemplate]}x`, style: { fontFamily: "monospace", fontSize: 30, fill: 0xffffff, stroke: { color: 0x000000, width: 5 } }});
            cardCountText.anchor.set(0.5, 0)

            // positioning
            let xPosition: number = 0;
            if (this.tooltipSideRight == false) {
                // left side
                xPosition = card.container.width/2 + xOffset;
            }
            else {
                // right side
                xPosition = -card.container.width/2 - xOffset;
            }

            card.container.position.set(xPosition, card.container.height - 100);
            cardCountText.position.set(xPosition, -35);

            // offset for next card
            xOffset += card.container.width + 10;

            // show keywords
            if (card.definition.keywords) {
                card.definition.keywords.forEach((keyword) => keywords.add(keyword));
            }

            this.tooltip.addChild(card.container, cardCountText);
        });

        if (this.tooltipSideRight == false) {
            this.tooltipOffset = 20;
            this.keywordsPositionX = 0;
        }
        else {
            this.tooltipOffset = -20;
            this.keywordsPositionX = -this.tooltip.width;
        }

        game.uiManager.showKeywords(Array.from(keywords));
    }

    completeSelection() {
        if (this.selectionMode === SelectionMode.STARTING_EQUIPMENT && this.selectedEquipment.length === this.startingEquipmentMaximum) {
            game.soundManager.play("button", 0.3);
            this.onSelectionComplete(this.selectedEquipment);
        }
        else if (this.selectionMode === SelectionMode.POST_ENCOUNTER) {
            const arcaneSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.arcane).length;
            const hitechSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.hitech).length;

            if (arcaneSelected === this.equipmentMaximumPerPool && hitechSelected === this.equipmentMaximumPerPool) {
                game.soundManager.play("button", 0.3);
                this.onSelectionComplete(this.selectedEquipment);
            }
        }
    }

    update(dt: number) {
        if (!this.visible) return;

        this.tooltip.position.set(game.mouse.x + this.tooltipOffset, game.mouse.y + 20);
        game.uiManager.updateKeywords(new Vector(this.tooltip.position.x + this.keywordsPositionX + 100, this.tooltip.position.y + 250));

        this.background.width = game.app.screen.width;
        this.background.height = game.app.screen.height;
        this.title.position.set(game.app.screen.width / 2, 100);
        this.selectContainer.position.set((game.app.screen.width - this.selectContainer.width) / 2, game.app.screen.height - 100);
        this.equipmentContainer.position.set(game.app.screen.width/2 - this.equipmentContainer.width/2, 100);
    }
}
