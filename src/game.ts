import { Application, Container, Graphics, Text } from "pixi.js";
import { Player } from "./player";
import { createCardDefinitions } from "./cardDefinitions";
import { createEquipmentDefinitions } from "./equipment";
import { UIManager } from "./uiManager";
import { Background } from "./background";
import { createBuffDefinitions } from "./buffs";
import { Encounter } from "./encounter";
import { desribeAction } from "./enemy";
import { Menu } from "./menu";
import { SelectionScreen, SelectionMode } from "./selectionScreen";
import { Equipment } from "./equipment";

export let game: Game;
export class Game {
    app: Application;
    player!: Player;
    background!: Background;
    clickableBg!: Graphics;
    backgroundContainer = new Container();
    enemyContainer = new Container();
    cardContainer = new Container();
    uiContainer = new Container();

    menu!: Menu;
    selectionScreen!: SelectionScreen;

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

    encounter!: Encounter;

    time = 0;
    get phase() {
        const phase = Math.sin(this.time * 0.003);
        return phase;
    }

    init() {
        createCardDefinitions();
        createEquipmentDefinitions();
        createBuffDefinitions();
        this.player = new Player();
        this.uiManager = new UIManager();
        this.background = new Background();

        this.menu = new Menu();
        this.menu.init();
        this.selectionScreen = new SelectionScreen();
        this.selectionScreen.init();

        this.menu.onStart = () => {
            this.menu.hide();
            this.selectionScreen.show(SelectionMode.STARTING_EQUIPMENT);
        };

        this.selectionScreen.onSelectionComplete = (selectedEquipment: Equipment[]) => {
            this.selectionScreen.hide();
            this.startGame();
        };

        this.menu.show();
    }

    startGame() {
        // mouse
        this.app.stage.interactive = true;
        this.app.stage.on("pointermove", (e) => {
            this.mouse.y = e.y;
            this.mouse.x = e.x;
        });

        this.app.stage.on("pointerdown", (e) => (this.mouse.down = true));
        this.app.stage.on("pointerup", (e) => (this.mouse.down = false));

        // background
        this.clickableBg = new Graphics();
        this.clickableBg.rect(0, 0, this.app.screen.width, this.app.screen.height);
        this.clickableBg.fill(0x000000);

        this.app.stage.addChild(this.clickableBg);
        this.app.stage.addChild(this.backgroundContainer);
        this.app.stage.addChild(this.enemyContainer);
        this.app.stage.addChild(this.cardContainer);
        this.app.stage.addChild(this.uiContainer);

        // debug encounter
        this.encounter = Encounter.createFirstEncounter();
        this.encounter.begin();

        // debug button
        const button = new Graphics();
        button.rect(0, 0, 200, 100);
        button.fill(0x00ff00);
        button.position.x = 0;
        button.position.y = 0;
        this.app.stage.addChild(button);

        button.interactive = true;
        button.on("pointerdown", () => this.player.endTurn());

        this.debugText = new Text({ text: "debug", style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff } });
        this.app.stage.addChild(this.debugText);
        this.debugText.position.x = 0;
        this.debugText.position.y = 110;
    }

    update(dt: number) {
        this.time += dt;
        this.player.update(dt);
        this.uiManager.update(dt);

        // encounter
        if (this.encounter) {
            this.background.update(dt);
            this.player.instance.enemy.update(dt);

            const deck = this.player.deck.map((card) => card.definition.name).join(", ");
            const used = this.player.usedPile.map((card) => card.definition.name).join(", ");
            const buffs = [...this.player.buffs.buffs.values()].map((buff) => buff.definition.name + " " + buff.severity).join(", ");
            const enemyBuffs = [...this.player.instance.enemy.buffs.buffs.values()].map((buff) => buff.definition.name + " " + buff.severity).join(", ");

            if (!this.debugText) return;
            this.debugText.text = "";
            this.debugText.text += `Deck: ${deck}\n`;
            this.debugText.text += `Used: ${used}\n`;
            this.debugText.text += `Buffs: ${buffs}\n`;
            this.debugText.text += `Stamina: ${this.player.stamina}\n`;
            this.debugText.text += `Hp: ${this.player.health}\n`;
            this.debugText.text += `EnemyHp: ${this.player.instance.enemy.health}/${this.player.instance.enemy.maxHealth}\n`;
            this.debugText.text += `EnemyBuffs: ${enemyBuffs}\n`;
            this.debugText.text += `EnemyActions: ${this.player.instance.enemy.actions.map((action) => desribeAction(action)).join(", ")}\n`;
            this.debugText.text += `You are in the ${this.encounter.inPast ? "past" : "future"}. Switch in ${this.encounter.countdown} turns.`;
        }
    }
}
