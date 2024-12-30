import { Assets, Sprite, Container, Graphics, Text } from "pixi.js";
import { game } from "./game";

export class Menu {
    container: Container;
    background: Sprite;

    titleContainer: Container;
    title!: Sprite;
    titleExtra!: Sprite;

    //titleText!: Text;
    startButton!: Container;
    introButton!: Container;
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

        this.titleContainer = new Container();

        this.container.addChild(this.titleContainer);
        this.container.addChild(this.background);
    }

    init() {
        //this.titleText = new Text({ text: "Game Title", style: { fontFamily: "monospace", fontSize: 48, fill: 0xffffff, stroke: {color: 0x000000, width: 6} } });
        //this.titleText.position.set(game.app.screen.width / 2, 200);
        //this.titleText.anchor.set(0.5);
        //this.container.addChild(this.titleText);

        this.title = new Sprite(Assets.get("gameTitle"));
        this.title.texture.source.scaleMode = "nearest";
        this.title.scale.set(2.5);
        this.title.anchor.set(0.5);

        this.titleExtra = new Sprite(Assets.get("titleExtra"));
        this.titleExtra.texture.source.scaleMode = "nearest";
        this.titleExtra.scale = this.title.scale;
        this.titleExtra.anchor = this.title.anchor;

        this.titleContainer.addChild(this.title, this.titleExtra);
        this.container.addChild(this.titleContainer);

        this.startButton = this.createButton("Start", 0x0000ff, 0x00aaff, () => {
            this.onStart();
        });

        this.introButton = this.createButton("Intro",  0x00ff00, 0x00ffaa, () => {
            game.effectsManager.playIntro();
            game.app.stage.addChild(game.temporaryContainer);
        });

        //this.settingsButton = this.createButton("Settings", 0x0000ff, 500, () => {
        //});

        //this.quitButton = this.createButton("Quit", 0xff0000, 600, () => {
        //});

        this.container.addChild(this.startButton);
        this.container.addChild(this.introButton);
        //this.container.addChild(this.settingsButton);
        //this.container.addChild(this.quitButton);
    }

    show() {
        game.app.stage.addChild(this.container);
        this.visible = true;
    }

    hide() {
        game.app.stage.removeChild(this.container);
        this.visible = false;
    }

    createButton(text: string, idleColor: number, hoverColor: number, onClick: () => void) {
        const buttonContainer = new Container();
        buttonContainer.interactive = true;
        buttonContainer.cursor = "pointer";
        // play sound on press
        buttonContainer.on("pointerdown", () => {
            onClick();
            game.soundManager.play("button3");
        });

        const button = new Graphics();
        button.roundRect(0, 0, 200, 75);
        button.fill(0xffffff);
        button.tint = idleColor;
        button.stroke({ color: 0x000000, width: 5 });

        const buttonText = new Text({ text: text, style: { fontFamily: "monospace", fontSize: 30, fill: 0xffffff, stroke: {color: 0x000000, width: 3} } });
        buttonText.position.set(button.width / 2, button.height / 2 - 3);
        buttonText.anchor.set(0.5);

        buttonContainer.on("pointerover", () => {
            button.tint = hoverColor;
        })
        buttonContainer.on("pointerout", () => {
            button.tint = idleColor;
        })

        buttonContainer.position.set((game.app.screen.width) / 2 - button.width/2, 0)
        buttonContainer.addChild(button, buttonText);
        return buttonContainer;
    }

    update(dt: number) {
        if (!this.visible) return;
        this.background.width = game.app.screen.width;
        this.background.height = game.app.screen.height

        this.titleContainer.position.set(game.app.screen.width / 2, 400);
        this.startButton.position.set((game.app.screen.width) / 2 - 100, game.app.screen.height/2 + 100);
        this.introButton.position.set((game.app.screen.width) / 2 - 100, game.app.screen.height/2 + 200);
        //this.settingsButton.position.set((game.app.screen.width) / 2 - 100, this.settingsButton.position.y);
        //this.quitButton.position.set((game.app.screen.width) / 2 - 100, this.quitButton.position.y);
    }
}
