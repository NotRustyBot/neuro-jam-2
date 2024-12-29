import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { Player } from "./player";
import { cardDefinitions, createCardDefinitions } from "./cardDefinitions";
import { createEquipmentDefinitions, equipmentDefinitions, EquipmentTemplate } from "./equipment";
import { UIManager } from "./uiManager";
import { Background } from "./background";
import { createBuffDefinitions } from "./buffs";
import { Encounter } from "./encounter";
import { desribeAction } from "./enemy";
import { Menu } from "./menu";
import { SelectionScreen, SelectionMode } from "./selectionScreen";
import { Equipment } from "./equipment";
import { Camera } from "./camera";
import { TimeManager } from "./timeManager";
import { SoundManager } from "./soundManager";
import { getDescriptionTexture } from "./card";

export let game: Game;
export class Game {
    app: Application;
    player!: Player;
    camera!: Camera;
    timeManager!: TimeManager;
    soundManager!: SoundManager;
    background!: Background;
    clickableBg!: Graphics;
    backgroundContainer = new Container();
    enemyContainer = new Container();
    playerContainer = new Container();
    cardContainer = new Container();
    uiContainer = new Container();
    uiKeywordsContainer = new Container();
    containerToReflect = new Container();
    screenReflectContainer = new Container();

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
        cardDefinitions.forEach((card) => getDescriptionTexture(card.description));
        createEquipmentDefinitions();
        createBuffDefinitions();
        this.player = new Player();
        this.camera = new Camera();
        this.background = new Background();
        this.timeManager = new TimeManager();
        this.soundManager = new SoundManager();
        this.uiManager = new UIManager();
        this.uiManager.initKeywords();


        // mouse
        this.app.stage.interactive = true;
        this.app.stage.on("pointermove", (e) => {
            this.mouse.y = e.y;
            this.mouse.x = e.x;
        });

        this.app.stage.on("pointerdown", (e) => (this.mouse.down = true));
        this.app.stage.on("pointerup", (e) => (this.mouse.down = false));

        // mouse
        this.app.stage.interactive = true;
        this.app.stage.on("pointermove", (e) => {
            this.mouse.y = e.y;
            this.mouse.x = e.x;
        });

        this.app.stage.on("pointerdown", (e) => (this.mouse.down = true));
        this.app.stage.on("pointerup", (e) => (this.mouse.down = false));


        // menu
        this.menu = new Menu();
        this.menu.init();
        this.selectionScreen = new SelectionScreen();
        this.selectionScreen.init();

        //this.startGame();
        //return;

        // functions
        this.menu.onStart = () => {
            this.menu.hide();
            this.selectionScreen.show(SelectionMode.STARTING_EQUIPMENT);
        };

        this.selectionScreen.onSelectionComplete = (selectedEquipment: Equipment[]) => {
            this.selectionScreen.hide();
            this.player.addEquipment(selectedEquipment);
            this.startGame();
        };
        //this.selectionScreen.onSelectionComplete([equipmentDefinitions.get(EquipmentTemplate.pepperSpray)!]);
        this.menu.show();
    }

    resize(){
        this.clickableBg.clear();
        this.clickableBg.rect(0, 0, window.innerWidth, window.innerHeight);
        this.clickableBg.fill(0x000000);

        this.uiManager.resize();
    }


    cursor!: Sprite;
    startGame() {
        // background
        this.clickableBg = new Graphics();
        this.clickableBg.rect(0, 0, this.app.screen.width, this.app.screen.height);
        this.clickableBg.fill(0x000000);

        this.app.stage.addChild(this.clickableBg);
        this.app.stage.addChild(this.backgroundContainer);
        this.app.stage.addChild(this.enemyContainer);
        this.app.stage.addChild(this.playerContainer);
        this.app.stage.addChild(this.containerToReflect);
        this.app.stage.addChild(this.screenReflectContainer);
        this.app.stage.addChild(this.cardContainer);

        this.containerToReflect.addChild(this.uiContainer);
        this.containerToReflect.addChild(this.uiKeywordsContainer);

        this.cursor = new Sprite(Assets.get("cursor"));
        this.cursor.eventMode = "none";
        this.cursor.anchor.set(0.2);
        //this.app.stage.addChild(this.cursor);

        window.addEventListener("contextmenu", (e) => e.preventDefault());
        window.addEventListener("resize", () => this.resize());

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
        this.selectionScreen.update(dt);
        this.camera.update(dt);
        this.timeManager.update(dt);
        this.menu.update(dt);
        //this.cursor.position.set(this.mouse.x, this.mouse.y);

        // encounter
        if (this.encounter) {
            this.background.update(dt);
            this.player.instance.enemy.update(dt);

            const deck = this.player.deck.map((card) => card.definition.name).join(", ");
            const used = this.player.usedPile.map((card) => card.definition.name).join(", ");

            if (!this.debugText) return;
            this.debugText.text = "";
            this.debugText.text += `Deck: ${deck}\n`;
            this.debugText.text += `Used: ${used}\n`;
            this.debugText.text += `EnemyActions: ${this.player.instance.enemy.actions.map((action) => desribeAction(action)).join(", ")}\n`;
            this.debugText.text += `You are in the ${this.encounter.inPast ? "past" : "future"}. Switch in ${this.encounter.countdown} turns.`;
        }
    }
}
