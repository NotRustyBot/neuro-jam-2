import { Assets, Sprite, Container, Graphics, Text } from "pixi.js";
import { game } from "./game";

export class Menu {
    container: Container;
    background: Sprite;

    titleText!: Text;
    startButton!: Container;
    settingsButton!: Container;
    quitButton!: Container;

    visible: boolean = false;

    // behaviour set externally
    onStart!: () => void;

    constructor() {
        this.container = new Container();

        this.background = new Sprite(Assets.get("menu"));
        this.background.width = game.app.screen.width;
        this.background.height = game.app.screen.height;
        this.background.texture.source.scaleMode = "nearest";
        this.container.addChild(this.background);
    }

    init() {
        this.titleText = new Text({ text: "Game Title", style: { fontFamily: "monospace", fontSize: 48, fill: 0xffffff } });
        this.titleText.position.set(game.app.screen.width / 2, 200);
        this.titleText.anchor.set(0.5);
        this.container.addChild(this.titleText);

        this.startButton = this.createButton("Start", 0x00ff00, 400, () => {
            this.onStart();
        });

        this.settingsButton = this.createButton("Settings", 0x0000ff, 500, () => {
            // nothing rn
        });

        this.quitButton = this.createButton("Quit", 0xff0000, 600, () => {
            // nothing rn
        });

        this.container.addChild(this.startButton);
        this.container.addChild(this.settingsButton);
        this.container.addChild(this.quitButton);
    }

    show() {
        game.app.stage.addChild(this.container);
        this.visible = true;
    }

    hide() {
        game.app.stage.removeChild(this.container);
        this.visible = false;
    }

    createButton(text: string, color: number, y: number, onClick: () => void) {
        const buttonContainer = new Container();
        buttonContainer.interactive = true;
        buttonContainer.cursor = "pointer";
        buttonContainer.on("pointerdown", onClick);

        const button = new Graphics();
        button.roundRect(0, 0, 200, 75);
        button.fill(color);
        button.stroke({ color: 0x000000, width: 5 });

        const buttonText = new Text({ text: text, style: { fontFamily: "monospace", fontSize: 30, fill: 0xffffff, stroke: {color: 0x000000, width: 3} } });
        buttonText.position.set(button.width / 2, button.height / 2 - 3);
        buttonText.anchor.set(0.5);

        buttonContainer.position.set((game.app.screen.width) / 2 - button.width/2, y)
        buttonContainer.addChild(button, buttonText);
        return buttonContainer;
    }

    update(dt: number) {
        if (!this.visible) return;
        this.background.width = game.app.screen.width;
        this.background.height = game.app.screen.height

        this.titleText.position.set(game.app.screen.width / 2, 200);
        this.startButton.position.set((game.app.screen.width) / 2 - 100, this.startButton.position.y);
        this.settingsButton.position.set((game.app.screen.width) / 2 - 100, this.settingsButton.position.y);
        this.quitButton.position.set((game.app.screen.width) / 2 - 100, this.quitButton.position.y);
    }
}
