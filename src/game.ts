import { Application, Container, Graphics, Text } from "pixi.js";
import { Player } from "./player";
import { createCardDefinitions } from "./cardDefinitions";
import { createEquipmentDefinitions } from "./equipment";
import { UIManager } from "./uiManager";
import { Background } from "./background";

export let game: Game;
export class Game {
    app: Application;
    player!: Player;
    bakcground!: Background;
    clickableBg!: Graphics;
    backgroundContainer = new Container();
    enemyContainer = new Container();
    cardContainer = new Container();
    uiContainer = new Container();

    uiManager!: UIManager;

    constructor(app: Application) {
        this.app = app;

        app.ticker.add((delta) => {
            this.update(delta.deltaMS);
        });

        game = this;
    }

    mouse = { x: 0, y: 0, down: false };

    debugText!: Text;

    init() {
        createCardDefinitions();
        createEquipmentDefinitions();
        this.clickableBg = new Graphics();
        this.clickableBg.rect(0, 0, this.app.screen.width, this.app.screen.height);
        this.clickableBg.fill(0x000000);

        this.app.stage.addChild(this.clickableBg);
        this.app.stage.addChild(this.backgroundContainer);
        this.app.stage.addChild(this.enemyContainer);
        this.app.stage.addChild(this.cardContainer);
        this.app.stage.addChild(this.uiContainer);
        this.player = new Player();
        this.uiManager = new UIManager();
        this.bakcground = new Background();

        this.app.stage.interactive = true;
        this.app.stage.on("pointermove", (e) => {
            this.mouse.y = e.y;
            this.mouse.x = e.x;
        });

        this.app.stage.on("pointerdown", (e) => (this.mouse.down = true));
        this.app.stage.on("pointerup", (e) => (this.mouse.down = false));

        const button = new Graphics();
        button.rect(0, 0, 200, 100);
        button.fill(0x00ff00);
        button.position.x = 0;
        button.position.y = 0;
        this.app.stage.addChild(button);

        button.interactive = true;
        button.on("pointerdown", () => this.player.instance.drawCards(1));

        this.debugText = new Text({ text: "debug", style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff } });
        this.app.stage.addChild(this.debugText);
        this.debugText.position.x = 0;
        this.debugText.position.y = 110;
    }

    update(dt: number) {
        this.player.update(dt);
        this.uiManager.update(dt);
        this.bakcground.update(dt);

        const deck = this.player.instance.deck.map((card) => card.definition.name).join(", ");
        const used = this.player.instance.usedPile.map((card) => card.definition.name).join(", ");
        this.debugText.text = `Deck: ${deck}\nUsed: ${used}`;
    }
}
