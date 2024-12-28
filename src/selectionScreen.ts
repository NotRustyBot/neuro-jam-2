import { Application, Container, Graphics, Text } from "pixi.js";
import { game } from "./game";
import { Equipment, EquipmentTemplate, equipmentDefinitions } from "./equipment";

export enum SelectionMode {
    STARTING_EQUIPMENT,
    POST_ENCOUNTER
}

export class SelectionScreen {
    container: Container;
    equipmentContainer!: Container;
    selectedEquipment: Equipment[] = [];
    selectionMode!: SelectionMode;

    maximumStartingEquipment = 3;

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

        this.container.addChild(this.background);
        this.container.addChild(this.title);

        this.equipmentContainer = new Container();
        this.equipmentContainer.position.set(200, 150);

        const equipmentBackground = new Graphics();
        equipmentBackground.roundRect(0, 0, 1500, 640);
        equipmentBackground.fill(0x808080);

        this.equipmentContainer.addChild(equipmentBackground);
        this.container.addChild(this.equipmentContainer);

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

        this.container.addChild(selectButton);
    }

    show(mode: SelectionMode) {
        this.selectionMode = mode;
        this.displayEquipmentOptions();
        game.app.stage.addChild(this.container);
    }

    hide() {
        game.app.stage.removeChild(this.container);
    }

    displayEquipmentOptions() {
        if (this.selectionMode === SelectionMode.STARTING_EQUIPMENT) {
            const MAX_PER_ROW = 6;

            const equipmentArray = Array.from(equipmentDefinitions.values());

            const buttonWidth = 200;
            const buttonHeight = 200;
            const xPadding = 60;
            const yPadding = 20;

            this.title.text = `Select your starting equipment (${this.maximumStartingEquipment})`;

            var row = 0;
            var column = 0;
            equipmentArray.forEach((equipment) => {
                if (column % MAX_PER_ROW === 0 && column !== 0) {
                    row++
                    column = 0;
                };

                const button = new Graphics();
                button.roundRect(0, 0, buttonWidth, buttonHeight);
                // slioghtly gray
                button.fill(0x404040);
                button.position.set(column * (buttonWidth + xPadding), row * (buttonHeight + yPadding));
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
                        if (this.selectedEquipment.length >= this.maximumStartingEquipment) return;
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
        if (this.selectionMode === SelectionMode.STARTING_EQUIPMENT && this.selectedEquipment.length === this.maximumStartingEquipment) {
            this.onSelectionComplete(this.selectedEquipment);
        }
    }
}
