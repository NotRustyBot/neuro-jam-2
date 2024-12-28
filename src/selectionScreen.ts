import { Application, Container, Graphics, Text } from "pixi.js";
import { game } from "./game";
import { Equipment, EquipmentCategory, EquipmentTemplate, equipmentDefinitions } from "./equipment";

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

    // behaviour set externally
    onSelectionComplete!: (selectedEquipment: Equipment[]) => void;

    constructor() {
        this.container = new Container();
        this.container.width = game.app.screen.width;
        this.container.height = game.app.screen.height;
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
    }

    hide() {
        game.app.stage.removeChild(this.container);
    }

    displayEquipmentOptions() {
        if (this.selectionMode === SelectionMode.STARTING_EQUIPMENT) {
            const MAX_PER_ROW = 6;

            const startingEquipmentPool = Array.from(equipmentDefinitions.values()).filter((equipment) => equipment.category === EquipmentCategory.starting);

            // shuffle pool and grab [startingEquipmentPoolSize] indexes
            const equipmentArray = startingEquipmentPool.sort(() => Math.random() - 0.5).slice(0, this.startingEquipmentPoolSize);

            this.title.text = `Select your starting equipment (${this.startingEquipmentMaximum})`;
            const buttonWidth = 200;
            const buttonHeight = 200;
            const xPadding = 60;
            const yPadding = 20;

            // single background
            const equipmentPerRow = equipmentArray.length > MAX_PER_ROW ? MAX_PER_ROW : equipmentArray.length
            const equipmentColumns = Math.ceil(equipmentArray.length / MAX_PER_ROW);

            const equipmentBackground = new Graphics();
            equipmentBackground.roundRect(0, 0, equipmentPerRow * buttonWidth + (equipmentPerRow-1) * xPadding, equipmentColumns * buttonHeight + (equipmentColumns-1) * yPadding);
            equipmentBackground.position.set(0, 200)
            equipmentBackground.fill(0x808080);

            const equipmentText = new Text({ text: "Starting Equipment Pool", style: { fontFamily: "monospace", fontSize: 40, fill: 0xffffff } });
            equipmentText.position.set(equipmentBackground.x + equipmentBackground.width/2, equipmentBackground.y - 50);
            equipmentText.anchor.set(0.5);

            this.equipmentContainer.addChild(equipmentBackground, equipmentText);

            // create buttons
            var row = 0;
            var column = 0;
            equipmentArray.forEach((equipment) => {
                if (column % MAX_PER_ROW === 0 && column !== 0) {
                    row++
                    column = 0;
                };

                const button = new Graphics();
                button.roundRect(0, 0, buttonWidth, buttonHeight);
                button.fill(0x404040);
                button.position.set(column * (buttonWidth + xPadding) + equipmentBackground.position.x, row * (buttonHeight + yPadding) + equipmentBackground.position.y);
                button.interactive = true;
                button.cursor = "pointer";

                const buttonText = new Text({ text: equipment.name, style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff } });
                buttonText.position.set(buttonWidth / 2, buttonHeight / 2);
                buttonText.anchor.set(0.5);
                button.addChild(buttonText);

                button.on("pointerdown", () => {
                    if (this.selectedEquipment.includes(equipment)) {
                        buttonText.tint = 0xffffff;
                        this.selectedEquipment.splice(this.selectedEquipment.indexOf(equipment), 1);
                    }
                    else {
                        if (this.selectedEquipment.length >= this.startingEquipmentMaximum) return;
                        buttonText.tint = 0x00ff00;
                        this.selectedEquipment.push(equipment);
                    }
                });

                this.equipmentContainer.addChild(button);
                column++;
            });
        }
        else if (this.selectionMode === SelectionMode.POST_ENCOUNTER) {
            const MAX_PER_ROW = 2;

            const arcanePool = Array.from(equipmentDefinitions.values()).filter((equipment) => {
                return equipment.category === EquipmentCategory.arcane && !game.player.equipment.includes(equipment);
            });
            const hitechPool = Array.from(equipmentDefinitions.values()).filter((equipment) => {
                return equipment.category === EquipmentCategory.hitech && !game.player.equipment.includes(equipment);
            });

            // shuffle pool and grab [equipmentPoolSize] indexes
            const arcaneEquipment = arcanePool.sort(() => Math.random() - 0.5).slice(0, this.equipmentPoolSize);
            const hitechEquipment = hitechPool.sort(() => Math.random() - 0.5).slice(0, this.equipmentPoolSize);

            this.title.text = `Select your reward (${this.equipmentMaximumPerPool} per pool)`;
            const buttonWidth = 200;
            const buttonHeight = 200;
            const xPadding = 60;
            const yPadding = 20;

            // double background
            const arcanePerRow = arcaneEquipment.length > MAX_PER_ROW ? MAX_PER_ROW : arcaneEquipment.length
            const arcaneColumns = Math.ceil(arcaneEquipment.length / MAX_PER_ROW);

            const arcaneBackground = new Graphics();
            arcaneBackground.roundRect(0, 0, arcanePerRow * buttonWidth + (arcanePerRow-1) * xPadding, arcaneColumns * buttonHeight + (arcaneColumns-1) * yPadding);
            arcaneBackground.position.set(100, 200)
            arcaneBackground.fill(0x808080);

            const arcaneText = new Text({ text: "Arcane Pool", style: { fontFamily: "monospace", fontSize: 40, fill: 0xffffff } });
            arcaneText.position.set(arcaneBackground.x + arcaneBackground.width/2, arcaneBackground.y - 50);
            arcaneText.anchor.set(0.5);

            const hitechPerRow = hitechEquipment.length > MAX_PER_ROW ? MAX_PER_ROW : hitechEquipment.length
            const hitechColumns = Math.ceil(hitechEquipment.length / MAX_PER_ROW);

            const hitechBackground = new Graphics();
            hitechBackground.roundRect(0, 0, hitechPerRow * buttonWidth + (hitechPerRow-1) * xPadding, hitechColumns * buttonHeight + (hitechColumns-1) * yPadding);
            hitechBackground.position.set(900, 200)
            hitechBackground.fill(0x808080);

            const hitechText = new Text({ text: "High-Tech Pool", style: { fontFamily: "monospace", fontSize: 40, fill: 0xffffff } });
            hitechText.position.set(hitechBackground.x + hitechBackground.width/2, hitechBackground.y - 50);
            hitechText.anchor.set(0.5);

            this.equipmentContainer.addChild(arcaneBackground, hitechBackground, arcaneText, hitechText);

            // display arcane pool on the left
            var row = 0;
            var column = 0;
            arcaneEquipment.forEach((equipment) => {
                if (column % MAX_PER_ROW === 0 && column !== 0) {
                    row++
                    column = 0;
                };

                const button = new Graphics();
                button.roundRect(0, 0, buttonWidth, buttonHeight);
                button.fill(0x404040);
                button.position.set(column * (buttonWidth + xPadding) + arcaneBackground.position.x, row * (buttonHeight + yPadding) + arcaneBackground.position.y);
                button.interactive = true;
                button.cursor = "pointer";

                const buttonText = new Text({ text: equipment.name, style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff } });
                buttonText.position.set(buttonWidth / 2, buttonHeight / 2);
                buttonText.anchor.set(0.5);
                button.addChild(buttonText);

                button.on("pointerdown", () => {
                    if (this.selectedEquipment.includes(equipment)) {
                        buttonText.tint = 0xffffff;
                        this.selectedEquipment.splice(this.selectedEquipment.indexOf(equipment), 1);
                    }
                    else {
                        if (this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.arcane).length >= this.equipmentMaximumPerPool) return;
                        buttonText.tint = 0x00ff00;
                        this.selectedEquipment.push(equipment);
                    }
                });

                this.equipmentContainer.addChild(button);
                column++;
            });

            // display hitech pool on the right
            row = 0;
            column = 0;
            hitechEquipment.forEach((equipment) => {
                if (column % MAX_PER_ROW === 0 && column !== 0) {
                    row++
                    column = 0;
                };

                const button = new Graphics();
                button.roundRect(0, 0, buttonWidth, buttonHeight);
                button.fill(0x404040);
                button.position.set(column * (buttonWidth + xPadding) + hitechBackground.position.x, row * (buttonHeight + yPadding) + hitechBackground.position.y);
                button.interactive = true;
                button.cursor = "pointer";

                const buttonText = new Text({ text: equipment.name, style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff } });
                buttonText.position.set(buttonWidth / 2, buttonHeight / 2);
                buttonText.anchor.set(0.5);
                button.addChild(buttonText);

                button.on("pointerdown", () => {
                    if (this.selectedEquipment.includes(equipment)) {
                        buttonText.tint = 0xffffff;
                        this.selectedEquipment.splice(this.selectedEquipment.indexOf(equipment), 1);
                    }
                    else {
                        if (this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.hitech).length >= this.equipmentMaximumPerPool) return;
                        buttonText.tint = 0x00ff00;
                        this.selectedEquipment.push(equipment);
                    }
                });

                this.equipmentContainer.addChild(button);
                column++;
            });
        }
    }

    completeSelection() {
        if (this.selectionMode === SelectionMode.STARTING_EQUIPMENT && this.selectedEquipment.length === this.startingEquipmentMaximum) {
            this.onSelectionComplete(this.selectedEquipment);
        } else if (this.selectionMode === SelectionMode.POST_ENCOUNTER) {
            const arcaneSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.arcane).length;
            const hitechSelected = this.selectedEquipment.filter(eq => eq.category === EquipmentCategory.hitech).length;
            if (arcaneSelected === this.equipmentMaximumPerPool && hitechSelected === this.equipmentMaximumPerPool) {
                this.onSelectionComplete(this.selectedEquipment);
            }
        }
    }
}
