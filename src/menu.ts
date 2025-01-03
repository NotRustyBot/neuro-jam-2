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
    settingsButton!: Container;

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

        const settingsBackground = new Graphics().roundRect(0, 0, 300, 190).fill({ color: 0x000000, alpha: 0.7 }).stroke({ color: 0x000000, width: 5 });
        settingsBackground.eventMode = 'static';

        const masterVolumeText = new Text({ text: `Master Volume [${game.soundManager.masterVolume * 100}%]`, style: { fontFamily: "monospace", fontSize: 20, fill: 0xffffff, stroke: {color: 0x000000, width: 3} } });
        masterVolumeText.position.set(settingsBackground.width / 2, 20);
        masterVolumeText.anchor.set(0.5);
        const masterVolumeSlider = this.createSlider(game.soundManager.masterVolume, (value) => {
            game.soundManager.masterVolume = value;
            game.soundManager.updateVolumes();
            masterVolumeText.text = `Master Volume [${Math.round(value * 100)}%]`;
        });
        masterVolumeSlider.position.set(settingsBackground.width/2 - 100, masterVolumeText.position.y + 20);

        const musicVolumeText = new Text({ text: `Music Volume [${game.soundManager.masterVolume * 100}%]`, style: { fontFamily: "monospace", fontSize: 20, fill: 0xffffff, stroke: {color: 0x000000, width: 3} } });
        musicVolumeText.position.set(settingsBackground.width / 2, 80);
        musicVolumeText.anchor.set(0.5);
        const musicVolumeSlider = this.createSlider(game.soundManager.musicVolume, (value) => {
            game.soundManager.musicVolume = value;
            game.soundManager.updateVolumes();
            musicVolumeText.text = `Music Volume [${Math.round(value * 100)}%]`;
        });
        musicVolumeSlider.position.set(settingsBackground.width/2 - 100, musicVolumeText.position.y + 20);

        const soundVolumeText = new Text({ text: `Sound Volume [${game.soundManager.masterVolume * 100}%]`, style: { fontFamily: "monospace", fontSize: 20, fill: 0xffffff, stroke: {color: 0x000000, width: 3} } });
        soundVolumeText.position.set(settingsBackground.width / 2, 140);
        soundVolumeText.anchor.set(0.5);
        const soundVolumeSlider = this.createSlider(game.soundManager.soundVolume, (value) => {
            game.soundManager.soundVolume = value;
            game.soundManager.updateVolumes();
            soundVolumeText.text = `Sound Volume [${Math.round(value * 100)}%]`;
        });
        soundVolumeSlider.position.set(settingsBackground.width/2 - 100, soundVolumeText.position.y + 20);

        game.settingsContainer = new Container();
        game.settingsContainer.addChild(settingsBackground);
        game.settingsContainer.addChild(masterVolumeText, masterVolumeSlider);
        game.settingsContainer.addChild(musicVolumeText, musicVolumeSlider);
        game.settingsContainer.addChild(soundVolumeText, soundVolumeSlider);
        this.container.addChild(game.settingsContainer);
        game.settingsContainer.visible = false;

        this.startButton = this.createButton("Start", 0x0000ff, 0x00aaff, async () => {
            this.onStart();
        });
        this.settingsButton = this.createButton("Settings", 0x0000ff, 0x00aaff, () => {
            game.settingsContainer.visible = !game.settingsContainer.visible;
        });

        this.container.addChild(this.startButton);
        this.container.addChild(this.settingsButton);
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

        buttonContainer.on("pointerdown", () => {
            onClick();
            game.soundManager.play("button3");
        });

        const button = new Graphics();
        button.roundRect(0, 0, 200, 75);
        button.fill(0xffffff);
        button.tint = idleColor;
        button.stroke({ color: 0x000000, width: 5 });

        const buttonText = new Text({ text: text, style: { fontFamily: "monospace", fontSize: 24, fill: 0xffffff, stroke: {color: 0x000000, width: 3} } });
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

    createSlider(initialValue: number, onChange: (value: number) => void): Container {
        const sliderContainer = new Container();

        const slider = new Graphics().roundRect(0, 0, 200, 10, 3).fill(0x404040);
        slider.eventMode = 'static';
        slider.cursor = 'pointer';

        const handle = new Graphics().circle(0, 0, 8).fill(0x808080);
        handle.y = slider.height / 2;
        handle.x = initialValue * slider.width;
        handle.eventMode = 'none';

        const onPointerMove = (event: any) => this.onSliderDrag(event, slider, handle, onChange);
        slider.on('pointerdown', (event) => {
            this.onSliderDrag(event, slider, handle, onChange);
            game.app.stage.addEventListener('pointermove', onPointerMove);
        });
        slider.on('pointerup', () => {
            game.app.stage.removeEventListener('pointermove', onPointerMove);
        });
        slider.on('pointerupoutside', () => {
            game.app.stage.removeEventListener('pointermove', onPointerMove);
        });

        sliderContainer.addChild(slider, handle);
        return sliderContainer;
    }

    onSliderDrag(event: any, slider: Graphics, handle: Graphics, onChange: (value: number) => void): void {
        handle.x = Math.max(0, Math.min(slider.toLocal(event.global).x, slider.width));
        const value = handle.x / slider.width;
        onChange(value);
    }

    update(dt: number) {
        if (!this.visible) return;
        this.background.width = game.app.screen.width;
        this.background.height = game.app.screen.height

        this.titleContainer.position.set(game.app.screen.width / 2, 400);
        this.startButton.position.set(game.app.screen.width/2 - 100, game.app.screen.height/2 + 100);
        this.settingsButton.position.set(game.app.screen.width/2 - 100, game.app.screen.height/2 + 200);
    }
}
