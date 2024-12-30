import { Assets, Graphics, Sprite, Text, Texture } from "pixi.js";
import { game } from "./game";

export class EffectsManager {
    blackBars: Graphics;
    graphics: Graphics;
    subtitles: Text;
    gameoverText: Text;
    slide: Sprite;

    constructor() {
        this.blackBars = new Graphics();
        this.graphics = new Graphics();
        this.slide = new Sprite(Texture.EMPTY);
        this.slide.visible = false;
        game.temporaryContainer.addChild(this.blackBars);
        game.temporaryContainer.addChild(this.graphics);
        game.temporaryContainer.addChild(this.slide);
        this.subtitles = new Text({ text: "", style: { fontFamily: "FunnelDisplay", fontSize: 20, fill: 0xffffff } });
        this.gameoverText = new Text({ text: "", style: { fontFamily: "FunnelDisplay", fontSize: 20, fill: 0xffffff } });
        game.temporaryContainer.addChild(this.subtitles);
        game.temporaryContainer.addChild(this.gameoverText);
    }

    update(dt: number) {
        this.blackBars.clear();
        this.graphics.clear();
        this.blackBarsRatio = this.blackBarsRatio * 0.9 + this.targetBlackBarsRatio * 0.1;
        if (this.blackBarsRatio > 0) this.handleBlackBars(dt);
        if (this.inTimewarp) this.handleTimewarp(dt);
        if (this.inFadeout) this.handleFadeout(dt);
        if (this.isVictory) this.handleVictory(dt);
        if (this.isDefeat) this.handleDefeat(dt);
        if (this.isIntro) this.handleIntro(dt);
    }

    blackBarsRatio = 0;

    targetBlackBarsRatio = 0;

    setBars(ratio: number) {
        this.targetBlackBarsRatio = ratio;
    }
    handleBlackBars(dt: number) {
        this.blackBars.rotation = -0.1;

        const offset = (this.blackBarsRatio * game.app.screen.height) / 4;
        this.blackBars.rect(-game.app.screen.width, -1000 + offset, game.app.screen.width * 2, 1000);
        this.blackBars.fill(0x000000);
        this.blackBars.rect(-game.app.screen.width, game.app.screen.height + 200 - offset, game.app.screen.width * 2, 1000);
        this.blackBars.fill(0x000000);
    }

    timewarpProgress = 0;
    inTimewarp = false;

    startTimewarp() {
        this.inTimewarp = true;
        this.timewarpProgress = 0;
        game.soundManager.play("ticking");
    }

    handleTimewarp(dt: number) {
        this.timewarpProgress += dt / 1000;

        if (this.timewarpProgress > 1) {
            this.inTimewarp = false;
            this.timewarpProgress = 0;
            return;
        }

        this.graphics.rect(this.timewarpProgress * game.app.screen.width * 3 - game.app.screen.width, 0, game.app.screen.width, game.app.screen.height);
        this.graphics.fill({
            color: 0xffffff,
            alpha: (0.5 - Math.abs(0.5 - this.timewarpProgress)) * 2,
        });
    }

    fadeoutProgress = 0;
    inFadeout = false;
    fadeout() {
        this.inFadeout = true;
        this.fadeoutProgress = 0;
    }

    handleFadeout(dt: number) {
        this.fadeoutProgress += dt / 1000;

        if (this.fadeoutProgress > 1) {
            this.inFadeout = false;
            this.fadeoutProgress = 0;
            return;
        }

        this.graphics.rect(0, 0, game.app.screen.width, game.app.screen.height);
        this.graphics.fill({
            color: 0x000000,
            alpha: Math.min(this.fadeoutProgress * 1.5, 1),
        });
    }

    isVictory = false;
    outroLineIndex = 0;
    async victory() {

        this.gameoverText.text = "Victory";
        this.gameoverText.style.fontSize = 72;
        this.gameoverText.style.fill = 0xcccc00;
        this.gameoverText.anchor.set(0.5, 0.5);
        this.gameoverText.position.set(game.app.screen.width / 2, game.app.screen.height / 3);

        this.isVictory = true;
        game.buttonContainer.visible = false;
        await game.timeManager.wait(3000);
        this.outroLineIndex = 1;
        await game.soundManager.voice("as_the_last", 0.5);
        this.outroLineIndex = 2;
        await game.soundManager.voice("you_may_rest_1", 0.5);
        game.restart();
    }

    handleVictory(dt: number) {
        this.graphics.rect(0, 0, game.app.screen.width, game.app.screen.height);
        this.graphics.fill({
            color: 0xffffff,
        });

        this.subtitles.style.fill = 0x000000;
        this.subtitles.style.wordWrap = true;
        this.subtitles.style.align = "center";
        this.subtitles.style.fontSize = "24";
        this.subtitles.style.dropShadow = {
            distance: 2,
            color: 0xffffff,
            alpha: 1,
            blur: 4,
            angle: 0,
        };
        this.subtitles.style.wordWrapWidth = game.app.screen.width / 2;

        this.subtitles.anchor.set(0.5, 0.5);
        this.subtitles.position.set(game.app.screen.width / 2, game.app.screen.height - 200);
        this.subtitles.text = outroLines[this.outroLineIndex];
    }

    isDefeat = false;
    defeatProgress = 0;
    defeat() {
        game.buttonContainer.visible = false;
        this.gameoverText.text = "Defeated";
        this.gameoverText.style.fontSize = 72;
        this.gameoverText.style.fill = 0xffaaaa;
        this.gameoverText.anchor.set(0.5, 0.5);
        this.gameoverText.position.set(game.app.screen.width / 2, game.app.screen.height / 3);

        this.isDefeat = true;
        this.defeatProgress = 0;
    }

    handleDefeat(dt: number) {
        this.defeatProgress += dt / 1000;
        this.graphics.rect(0, 0, game.app.screen.width, game.app.screen.height);
        this.graphics.fill({
            color: 0x000000,
        });

        this.gameoverText.alpha = 1 - Math.abs(this.defeatProgress - 3) / 3;

        if (this.defeatProgress > 6) {
            game.restart();
        }
    }

    isIntro = false;
    introLinesIndex = 0;
    async playIntro() {
        this.isIntro = true;
        this.introLinesIndex = 0;
        game.soundManager.cutMusic();
        this.slide.texture = Assets.get("intro1");
        this.slide.visible = true;
        await game.soundManager.voice("a_long_time_ago", 0.4);
        this.introLinesIndex++;
        game.soundManager.voice("their_rule_lasted", 0.4).then(async () => {
            this.introLinesIndex++;
            game.soundManager.voice("after_a_millennia", 0.4).then(async () => {
                this.introLinesIndex++;
                this.slide.texture = Assets.get("intro1");
                await game.soundManager.voice("now_you_need_1", 0.4);
                game.timeManager.delay(() => this.skipIntro(), 100);
                this.slide.visible = false;
                game.soundManager.setMusic("menu");
            });
            await game.timeManager.wait(3000);
            this.slide.texture = Assets.get("intro4");
            await game.timeManager.wait(1000);
            this.slide.texture = Assets.get("intro5");
            await game.timeManager.wait(500);
            this.slide.alpha = 0;
            this.slide.texture = Assets.get("intro6");
        });
        await game.timeManager.wait(4000);
        this.slide.texture = Assets.get("intro2");
        await game.timeManager.wait(1000);
        this.slide.texture = Assets.get("intro3");
    }

    handleIntro(dt: number) {
        this.graphics.rect(0, 0, game.app.screen.width, game.app.screen.height);
        this.graphics.fill({
            color: 0xffffff,
        });

        this.subtitles.anchor.set(0.5, 0.5);
        this.subtitles.position.set(game.app.screen.width / 2, game.app.screen.height - 50);
        this.subtitles.style.fill = 0x000000;
        this.subtitles.style.wordWrap = true;
        this.subtitles.style.align = "center";
        this.subtitles.style.fontSize = "30";
        this.subtitles.style.dropShadow = {
            distance: 2,
            color: 0xffffff,
            alpha: 1,
            blur: 4,
            angle: 0,
        };
        this.subtitles.style.wordWrapWidth = game.app.screen.width / 2;
        this.subtitles.text = introData[this.introLinesIndex].text;
        this.slide.position.x = game.app.screen.width / 2;
        this.slide.position.y = game.app.screen.height / 2;
        this.slide.anchor.set(0.5, 0.5);
        const ratio = (game.app.screen.height - 200) / 720;
        this.slide.scale.set(ratio);

        if (this.slide.alpha < 1) {
            this.slide.alpha = (this.slide.alpha * 99 + 1) / 100;
        }
    }

    skipIntro() {
        this.isIntro = false;
        this.subtitles.text = "";
    }
}

const introData = [
    { text: `A long time ago, the Turtle Empire ruled the world, with an army of monsters they conjured.` },
    { text: `Their rule lasted a thousand years, until humans managed to seal them away, with a help of a powerful magical Artifact.` },
    { text: `After millennia, the Remnants of the Turtle Empire managed to break free, shattering the Artifact across the threads of time.` },
    { text: `Now you need to defeat the Remnants of the Turtle empire, both in the past, and in the future, or humanity will serve under their reign once more.` },
];

const outroLines = ["", `As the last of Remnants of the Turtle Empire are defeated, and Artifact pieces recombined, the threads of time fall back into their rightful places.`, `Now, you may rest.`];
