import { Application, Container, Graphics, Text } from "pixi.js";
import { game } from "./game";

export class Menu {
    container: Container;

    // behaviour set externally
    onStart!: () => void;

    constructor() {
        this.container = new Container();
        this.container.width = game.app.screen.width;
        this.container.height = game.app.screen.height;
    }

    init() {
        const titleText = new Text({ text: "Game Title", style: { fontFamily: "monospace", fontSize: 48, fill: 0xffffff } });
        titleText.position.set(game.app.screen.width / 2, 200);
        titleText.anchor.set(0.5);
        this.container.addChild(titleText);

        const startButton = this.createButton("Start", 0x00ff00, 400, () => {
            this.onStart();
        });

        const settingsButton = this.createButton("Settings", 0x0000ff, 500, () => {
            // nothing rn
        });

        const quitButton = this.createButton("Quit", 0xff0000, 600, () => {
            // nothing rn
        });

        this.container.addChild(startButton);
        this.container.addChild(settingsButton);
        this.container.addChild(quitButton);
    }

    show() {
        game.app.stage.addChild(this.container);
    }

    hide() {
        game.app.stage.removeChild(this.container);
    }

    createButton(text: string, color: number, y: number, onClick: () => void) {
        const button = new Graphics();
        button.roundRect(0, 0, 200, 75);
        button.fill(color);
        button.position.set((game.app.screen.width - button.width) / 2, y);

        button.interactive = true;
        button.cursor = "pointer";
        button.on("pointerdown", onClick);


        const buttonText = new Text({ text: text, style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff } });
        buttonText.position.set(button.width / 2, button.height / 2);
        buttonText.anchor.set(0.5);
        button.addChild(buttonText);

        return button;
    }
}
