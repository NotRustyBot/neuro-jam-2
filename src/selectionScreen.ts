import { Container, Graphics, Text } from "pixi.js";
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

    tooltip!: Container;
    tooltipSide: number = 0;

    title!: Text;
    background!: Graphics;
    selectContainer!: Container;

    // equipment buttons
    buttonWidth = 200;
    buttonHeight = 200;
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
    }

    init() {
        this.background = new Graphics();
        this.background.rect(0, 0, game.app.screen.width, game.app.screen.height);
        this.background.fill(0x8B4513);

        this.title = new Text({ text: "", style: { fontFamily: "monospace", fontSize: 48, fill: 0xffffff } });
        this.title.position.set(game.app.screen.width / 2, 100);
        this.title.anchor.set(0.5);

        this.equipmentContainer = new Container();
        this.equipmentContainer.position.set(game.app.screen.width/2 - this.equipmentContainer.width/2, 100);

        // select button
        this.selectContainer = new Container();

        const selectButton = new Graphics();
        selectButton.roundRect(0, 0, 200, 75);
        selectButton.fill(0x00ff00);
        selectButton.interactive = true;
        selectButton.cursor = "pointer";
        selectButton.on("pointerdown", () => this.completeSelection());

        const selectText = new Text({ text: "Select", style: { fontFamily: "monospace", fontSize: 24, fill: 0x000000 } });
        selectText.position.set(selectButton.width / 2, selectButton.height / 2);
        selectText.anchor.set(0.5);


        this.selectContainer.position.set((game.app.screen.width - selectButton.width) / 2, 800);
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
        game.app.stage.addChild(game.uiContainer);

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
            const { background, text } = this.createEquipmentBackground(
                "Starting Equipment Pool", 0, 200,
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
            const { background: arcaneBackground, text: arcaneText } = this.createEquipmentBackground(
                "Arcane Pool", 0, 200,
                arcanePerRow * this.buttonWidth + (arcanePerRow - 1) * this.xPadding,
                arcaneColumns * this.buttonHeight + (arcaneColumns - 1) * this.yPadding
            );
            const { background: hitechBackground, text: hitechText } = this.createEquipmentBackground(
                "High-Tech Pool", game.app.screen.width - this.equipmentContainer.position.x, 200,
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

    createEquipmentButton(equipment: Equipment, x: number, y: number): Container {
        const button = new Container();
        button.position.set(x, y);
        button.interactive = true;
        button.cursor = "pointer";

        const buttonBackground = new Graphics();
        buttonBackground.roundRect(0, 0, 200, 200);
        buttonBackground.fill(0x404040);

        const buttonText = new Text({
            text: equipment.name,
            style: {
                fontFamily: "monospace",
                fontSize: 24,
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 2 },
                wordWrap: true,
                wordWrapWidth: 190,
                align: "center",
            }
        });
        buttonText.position.set(100, 100);
        buttonText.anchor.set(0.5);

        button.addChild(buttonBackground, buttonText);

        button.on("pointerdown", this.handleButtonPress.bind(this, buttonText, equipment));
        button.on("pointerover", this.showTooltip.bind(this, equipment));
        button.on("pointerout", () => {
            this.tooltip.removeChildren();
            game.uiManager.hideKeywords();
        });

        return button;
    }

    createEquipmentBackground(titleText: string, x: number, y: number, width: number, height: number) {
        const background = new Graphics();
        background.roundRect(0, 0, width, height);
        background.position.set(x, y);
        background.fill(0x808080);

        const text = new Text({ text: titleText, style: { fontFamily: "monospace", fontSize: 40, fill: 0xffffff } });
        text.position.set(x + width / 2, y - 50);
        text.anchor.set(0.5);

        return { background, text };
    };

    handleButtonPress(buttonText: Text, equipment: Equipment) {
        if (this.selectedEquipment.includes(equipment)) {
            buttonText.tint = 0xffffff;
            this.selectedEquipment.splice(this.selectedEquipment.indexOf(equipment), 1);
        }
        else {
            if (this.selectionMode === SelectionMode.STARTING_EQUIPMENT && this.selectedEquipment.length >= this.startingEquipmentMaximum) return;

            if (this.selectionMode === SelectionMode.POST_ENCOUNTER) {
                const arcaneSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.arcane).length;
                const hitechSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.hitech).length;
                if ((equipment.category === EquipmentCategory.arcane && arcaneSelected >= this.equipmentMaximumPerPool) ||
                    (equipment.category === EquipmentCategory.hitech && hitechSelected >= this.equipmentMaximumPerPool)) return;
            }
            buttonText.tint = 0x00ff00;
            this.selectedEquipment.push(equipment);
        }
    }

    showTooltip(equipment: Equipment) {

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
            const cardCountText = new Text({text: `${cardCounts[cardTemplate]}x`, style: { fontFamily: "monospace", fontSize: 30, fill: 0x00ffff, stroke: { color: 0x000000, width: 5 } }});
            cardCountText.anchor.set(0.5, 0)

            // positioning
            let xPosition: number = 0;
            if (this.tooltipSide === 0) {
                // left side
                xPosition = card.container.width/2 + xOffset;
            }
            else if (this.tooltipSide === 1) {
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

        game.uiManager.showKeywords(Array.from(keywords));
    }

    completeSelection() {
        if (this.selectionMode === SelectionMode.STARTING_EQUIPMENT && this.selectedEquipment.length === this.startingEquipmentMaximum) {
            this.onSelectionComplete(this.selectedEquipment);
        }
        else if (this.selectionMode === SelectionMode.POST_ENCOUNTER) {
            const arcaneSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.arcane).length;
            const hitechSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.hitech).length;

            if (arcaneSelected === this.equipmentMaximumPerPool && hitechSelected === this.equipmentMaximumPerPool) {
                this.onSelectionComplete(this.selectedEquipment);
            }
        }
    }

    update(dt: number) {
        if (!this.visible) return;
        let offset: number = 20;
        let keywordsPositionX: number = 0;

        // tooltip positioning right/left
        if (game.mouse.x > game.app.screen.width / 2) {
            // right side
            this.tooltipSide = 1;
            offset = -20;
            keywordsPositionX = this.tooltip.position.x - this.tooltip.width;
        }
        else {
            // left side
            this.tooltipSide = 0;
            offset = 20;
            keywordsPositionX = this.tooltip.position.x;
        }

        this.tooltip.position.set(game.mouse.x + offset, game.mouse.y + 20);
        game.uiManager.updateKeywords(new Vector(keywordsPositionX + 100, this.tooltip.position.y + 250));

        this.background.width = game.app.screen.width;
        this.background.height = game.app.screen.height;
        this.title.position.set(game.app.screen.width / 2, 100);
        this.selectContainer.position.set((game.app.screen.width - this.selectContainer.width) / 2, 800);
        this.equipmentContainer.position.set(game.app.screen.width/2 - this.equipmentContainer.width/2, 100);
    }
}
