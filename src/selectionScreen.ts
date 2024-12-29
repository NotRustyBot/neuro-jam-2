import { Container, Graphics, Text } from "pixi.js";
import { game } from "./game";
import { Equipment, EquipmentCategory, EquipmentTemplate, equipmentDefinitions } from "./equipment";
import { cardDefinitions, CardTemplate } from "./cardDefinitions";
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

    background!: Graphics;
    title!: Text;
    tooltip!: Container;

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
        this.equipmentContainer.position.set(200, 150);

        // select button
        const selectButton = new Graphics();
        selectButton.roundRect(0, 0, 200, 75);
        selectButton.fill(0x00ff00);
        selectButton.position.set((game.app.screen.width - selectButton.width) / 2, 800);
        selectButton.interactive = true;
        selectButton.cursor = "pointer";
        selectButton.on("pointerdown", () => this.completeSelection());

        const selectText = new Text({ text: "Select", style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff } });
        selectText.position.set(selectButton.width / 2, selectButton.height / 2);
        selectText.anchor.set(0.5);
        selectButton.addChild(selectText);

        this.container.addChild(this.background, this.title, this.equipmentContainer, selectButton);
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
            const MAX_PER_ROW = 6;
            const startingEquipmentPool = Array.from(equipmentDefinitions.values())//.filter((equipment) => equipment.category === EquipmentCategory.starting);
            const equipmentArray = startingEquipmentPool//.sort(() => Math.random() - 0.5).slice(0, this.startingEquipmentPoolSize);

            this.title.text = `Select your starting equipment (${this.startingEquipmentMaximum})`;
            // button settings
            const buttonWidth = 200;
            const buttonHeight = 200;
            const xPadding = 60;
            const yPadding = 20;

            // row/column precalculations
            const equipmentPerRow = equipmentArray.length > MAX_PER_ROW ? MAX_PER_ROW : equipmentArray.length;
            const equipmentColumns = Math.ceil(equipmentArray.length / MAX_PER_ROW);

            // create background
            const { background, text } = this.createEquipmentBackground(
                "Starting Equipment Pool", 0, 200,
                equipmentPerRow * buttonWidth + (equipmentPerRow - 1) * xPadding,
                equipmentColumns * buttonHeight + (equipmentColumns - 1) * yPadding
            );
            this.equipmentContainer.addChild(background, text);

            // create buttons
            equipmentArray.forEach((equipment, index) => {
                const row = Math.floor(index / MAX_PER_ROW);
                const column = index % MAX_PER_ROW;
                const x = column * (buttonWidth + xPadding) + background.position.x;
                const y = row * (buttonHeight + yPadding) + background.position.y;
                const button = this.createEquipmentButton(equipment, x, y);
                this.equipmentContainer.addChild(button);
            });
        }
        else if (this.selectionMode === SelectionMode.POST_ENCOUNTER) {
            // equipment filtering
            const MAX_PER_ROW = 2;
            const arcanePool = Array.from(equipmentDefinitions.values()).filter((equipment) => equipment.category === EquipmentCategory.arcane && !game.player.equipment.includes(equipment));
            const hitechPool = Array.from(equipmentDefinitions.values()).filter((equipment) => equipment.category === EquipmentCategory.hitech && !game.player.equipment.includes(equipment));

            const arcaneEquipment = arcanePool.sort(() => Math.random() - 0.5).slice(0, this.equipmentPoolSize);
            const hitechEquipment = hitechPool.sort(() => Math.random() - 0.5).slice(0, this.equipmentPoolSize);

            this.title.text = `Select your reward (${this.equipmentMaximumPerPool} per pool)`;
            // button settings
            const buttonWidth = 200;
            const buttonHeight = 200;
            const xPadding = 60;
            const yPadding = 20;

            // row/column precalculations
            const arcanePerRow = arcaneEquipment.length > MAX_PER_ROW ? MAX_PER_ROW : arcaneEquipment.length;
            const arcaneColumns = Math.ceil(arcaneEquipment.length / MAX_PER_ROW);

            const hitechPerRow = hitechEquipment.length > MAX_PER_ROW ? MAX_PER_ROW : hitechEquipment.length;
            const hitechColumns = Math.ceil(hitechEquipment.length / MAX_PER_ROW);

            // create background for each pool
            const { background: arcaneBackground, text: arcaneText } = this.createEquipmentBackground(
                "Arcane Pool", 100, 200,
                arcanePerRow * buttonWidth + (arcanePerRow - 1) * xPadding,
                arcaneColumns * buttonHeight + (arcaneColumns - 1) * yPadding
            );
            const { background: hitechBackground, text: hitechText } = this.createEquipmentBackground(
                "High-Tech Pool", 900, 200,
                hitechPerRow * buttonWidth + (hitechPerRow - 1) * xPadding,
                hitechColumns * buttonHeight + (hitechColumns - 1) * yPadding
            );
            this.equipmentContainer.addChild(arcaneBackground, hitechBackground, arcaneText, hitechText);

            // create buttons for each pool
            arcaneEquipment.forEach((equipment, index) => {
                const row = Math.floor(index / MAX_PER_ROW);
                const column = index % MAX_PER_ROW;
                const x = column * (buttonWidth + xPadding) + arcaneBackground.position.x;
                const y = row * (buttonHeight + yPadding) + arcaneBackground.position.y;
                const button = this.createEquipmentButton(equipment, x, y);
                this.equipmentContainer.addChild(button);
            });

            hitechEquipment.forEach((equipment, index) => {
                const row = Math.floor(index / MAX_PER_ROW);
                const column = index % MAX_PER_ROW;
                const x = column * (buttonWidth + xPadding) + hitechBackground.position.x;
                const y = row * (buttonHeight + yPadding) + hitechBackground.position.y;
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

        const buttonText = new Text({ text: equipment.name, style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff } });
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
            card.container.position.set(xOffset + card.container.width / 2, card.container.height - 50);
            card.container.visible = true;

            // display card counts
            const cardCountText = new Text({text: `${cardCounts[cardTemplate]}x`, style: { fontFamily: "monospace", fontSize: 30, fill: 0xffffff, stroke: { color: 0x000000, width: 5 } }});
            cardCountText.position.set(xOffset, -35);

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
        const offset = 20;
        this.tooltip.position.set(game.mouse.x + offset, game.mouse.y + offset);
        game.uiManager.updateKeywords(new Vector(this.tooltip.position.x + 100, this.tooltip.position.y + 250));
    }
}
