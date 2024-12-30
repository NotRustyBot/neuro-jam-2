import { Application, Assets, assignWithIgnore, Container, Graphics, Sprite, Text, TickerCallback } from "pixi.js";
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
import { EffectsManager } from "./temporaryScreens";
import { ParticleManager } from "./particleManger";

export let game: Game;
export class Game {
    app: Application;
    player!: Player;
    camera!: Camera;
    timeManager!: TimeManager;
    effectsManager!: EffectsManager;
    soundManager!: SoundManager;
    background!: Background;
    particleManager!: ParticleManager;
    clickableBg!: Graphics;
    backgroundContainer = new Container();
    enemyContainer = new Container();
    playerContainer = new Container();
    cardContainer = new Container();
    uiContainer = new Container();
    uiKeywordsContainer = new Container();
    containerToReflect = new Container();
    screenReflectContainer = new Container();
    buttonContainer = new Container();
    temporaryContainer = new Container();
    particleContainer = new Container();

    menu!: Menu;
    selectionScreen!: SelectionScreen;

    uiManager!: UIManager;
    encounterIndex = 0;

    private updateReference: TickerCallback<any>;
    constructor(app: Application) {
        this.app = app;

        this.updateReference = (delta) => {
            this.update(delta.deltaMS);
        };
        app.ticker.add(this.updateReference);

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
        this.effectsManager = new EffectsManager();
        this.particleManager = new ParticleManager();
        this.uiManager.initKeywords();

        this.soundManager.setMusic("menu");

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
        //this.selectionScreen.onSelectionComplete([equipmentDefinitions.get(EquipmentTemplate.pepperSpray)!, equipmentDefinitions.get(EquipmentTemplate.quantumTeleporter)!]);
        this.menu.show();
    }

    resize() {
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
        this.app.stage.addChild(this.particleContainer);
        this.app.stage.addChild(this.containerToReflect);
        this.app.stage.addChild(this.screenReflectContainer);
        this.app.stage.addChild(this.cardContainer);
        this.app.stage.addChild(this.temporaryContainer);

        this.containerToReflect.addChild(this.uiContainer);
        this.containerToReflect.addChild(this.uiKeywordsContainer);

        this.cursor = new Sprite(Assets.get("cursor"));
        this.cursor.eventMode = "none";
        this.cursor.anchor.set(0.2);
        //this.app.stage.addChild(this.cursor);

        window.addEventListener("contextmenu", (e) => e.preventDefault());
        window.addEventListener("resize", () => this.resize());

        // next turn button
        const idleTint = 0xff2222;
        const hoverTint = 0x22ff22;
        const clickTint = 0x00ffff;

        const button = new Sprite(Assets.get("nextTurn"));
        button.texture.source.scaleMode = "nearest";
        button.scale.set(5);
        button.anchor.set(1);
        button.tint = idleTint;

        const buttonOuter = new Sprite(Assets.get("nextTurnOuter"));
        buttonOuter.texture.source.scaleMode = "nearest";
        buttonOuter.scale = button.scale;
        buttonOuter.anchor = button.anchor;
        buttonOuter.position = button.position;

        this.buttonContainer.cursor = "pointer";
        this.buttonContainer.interactive = true;
        this.buttonContainer.on("pointerdown", () => {
            this.player.endTurn();
            button.tint = clickTint;
            setTimeout(() => (button.tint = idleTint), 500);
        });
        this.buttonContainer.on("pointerover", () => {
            if (button.tint === idleTint) button.tint = hoverTint;
        });
        this.buttonContainer.on("pointerout", () => {
            if (button.tint === hoverTint) button.tint = idleTint;
        });

        this.buttonContainer.addChild(button, buttonOuter);
        this.app.stage.addChild(this.buttonContainer);

        // debug encounter
        this.encounter = Encounter.createFirstEncounter();
        this.encounter.begin();

        // debug text
        this.debugText = new Text({ text: "debug", style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff } });
        this.app.stage.addChild(this.debugText);
        this.debugText.position.x = 0;
        this.debugText.position.y = 110;
        this.debugText.visible = false;
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

        this.buttonContainer.position.set(this.app.screen.width - 50, this.app.screen.height - 50);

        // encounter
        if (this.encounter) {
            this.background.update(dt);
            this.player.instance.enemy.update(dt);
            this.effectsManager.update(dt);
            this.soundManager.update();

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

    restart() {
        this.app.stage.removeChildren();
        this.app.ticker.remove(this.updateReference);
        this.soundManager.destroy();

        const newGame = new Game(this.app);
        newGame.init();
    }
}
