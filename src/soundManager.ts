import { Howl } from "howler";

export class SoundManager {
    soundVolume = 0.5;
    musicVolume = 0.5;
    voiceVolume = 0.5;

    voicelines = {
        a_long_time_ago: new Howl({ src: "./voicelines/a_long_time_ago.mp3" }),
        their_rule_lasted: new Howl({ src: "./voicelines/their_rule_lasted.mp3" }),
        after_a_millennia: new Howl({ src: "./voicelines/after_a_millennia.mp3" }),
        now_you_need_1: new Howl({ src: "./voicelines/now_you_need_1.mp3" }),
        as_the_last: new Howl({ src: "./voicelines/as_the_last.mp3" }),
        you_may_rest_1: new Howl({ src: "./voicelines/you_may_rest_1.mp3" }),
    };

    sounds = {
        electronic_field: new Howl({ src: "./sounds/electronic_field.wav" }),
        explosion: new Howl({ src: "./sounds/explosion.wav" }),
        quantum_jump: new Howl({ src: "./sounds/quantum_jump.wav" }),
        select: new Howl({ src: "./sounds/select.wav" }),
        shield_up: new Howl({ src: "./sounds/shield_up.wav" }),
        sweeping_strike: new Howl({ src: "./sounds/sweeping_strike.wav" }),
        zap: new Howl({ src: "./sounds/zap.wav" }),
        blindshot: new Howl({ src: "./sounds/blindshot.wav" }),
        meditate: new Howl({ src: "./sounds/meditate.wav" }),
        slam: new Howl({ src: "./sounds/slam.wav" }),
        laser: new Howl({ src: "./sounds/laser.wav" }),
        ignite: new Howl({ src: "./sounds/ignite.wav" }),
        magic_bolt: new Howl({ src: "./sounds/magic_bolt.wav" }),
        ancestors_call: new Howl({ src: "./sounds/ancestors_call.wav" }),
        backstab: new Howl({ src: "./sounds/backstab.wav" }),
        nanite: new Howl({ src: "./sounds/nanite.wav" }),
        correctExit: new Howl({ src: "./sounds/correctExit.wav" }),
        wrongExit: new Howl({ src: "./sounds/wrongExit.wav" }),
        emStrike: new Howl({ src: "./sounds/emStrike.wav" }),
        operationalFailure: new Howl({ src: "./sounds/operationalFailure.wav" }),
        uncontrolledBot: new Howl({ src: "./sounds/uncontrolledBot.wav" }),
        soulWakeUpCall: new Howl({ src: "./sounds/soulWakeUpCall.wav" }),
        huntedHeretic: new Howl({ src: "./sounds/huntedHeretic.wav" }),

        enemyBotDeath: new Howl({ src: "./sounds/enemyBotDeath.wav" }),
        enemyBugDeath: new Howl({ src: "./sounds/enemyBugDeath.wav" }),
        enemyTurtleDeath: new Howl({ src: "./sounds/enemyTurtleDeath2.wav" }),

        player_damage: new Howl({ src: "./sounds/player_damage.wav" }),
        ticking: new Howl({ src: "./sounds/ticking.wav" }),

        defeat_theme: new Howl({ src: "./sounds/defeat_theme.mp3" }),
        victory_theme: new Howl({ src: "./sounds/victory_theme.mp3" }),

        drawCards: new Howl({ src: "./sounds/drawCards.wav" }),
        button: new Howl({ src: "./sounds/button.wav" }),
        button2: new Howl({ src: "./sounds/button2.wav" }),
        button3: new Howl({ src: "./sounds/button3.wav" }),
        button4: new Howl({ src: "./sounds/button4.wav" }),
        click: new Howl({ src: "./sounds/click.wav" }),
    };

    currentMusic: keyof typeof this.music | null = null;

    music = {
        past: new Howl({ src: "./music/past.mp3", loop: true }),
        menu: new Howl({ src: "./music/menu.mp3", loop: true }),
        future: new Howl({ src: "./music/future.mp3", loop: true }),
    };

    play(sound: keyof typeof this.sounds, volume = 1) {
        this.sounds[sound].volume(volume * this.soundVolume);
        this.sounds[sound].play();
    }

    async voice(voiceline: keyof typeof this.voicelines, volume: number) {
        return new Promise((resolve) => {
            this.voicelines[voiceline].volume(volume * this.voiceVolume);
            this.voicelines[voiceline].play();
            this.voicelines[voiceline].once("end", resolve);
            this.voicelines[voiceline].once("stop", resolve);
        });
    }

    constructor() {
        for (const key in this.music) {
            this.music[key as keyof typeof this.music].volume(0);
            this.music[key as keyof typeof this.music].play();
        }
    }

    syncable = ["future", "past"];

    setMusic(music: keyof typeof this.music) {
        if (this.currentMusic === music) return;
        if (this.syncable.includes(music) && this.syncable.includes(this.currentMusic ?? "")) {
            if (this.currentMusic) this.music[music].seek(this.music[this.currentMusic].seek());
        }
        if (this.currentMusic) this.music[this.currentMusic].fade(this.musicVolume, 0, 1000);
        this.music[music].fade(0, this.musicVolume, 1000);
        this.currentMusic = music;
    }

    cutMusic() {
        if (this.currentMusic) {
            this.music[this.currentMusic].fade(this.musicVolume, 0, 1000);
            this.currentMusic = null;
        }
    }

    updateVolumes() {
        for (const key in this.music) {
            this.music[key as keyof typeof this.music].volume(this.musicVolume);
        }

        for (const key in this.sounds) {
            this.sounds[key as keyof typeof this.sounds].volume(this.soundVolume);
        }
    }

    musicRate = 1;
    musicTargetRate = 1;

    musicSpeed() {
        this.musicTargetRate = 1.1;
    }

    update() {
        this.musicRate = this.musicRate * 0.9 + this.musicTargetRate * 0.1;

        for (const key in this.music) {
            this.music[key as keyof typeof this.music].rate(this.musicRate);
        }

        this.musicTargetRate = 1;
    }

    destroy() {
        for (const key in this.music) {
            this.music[key as keyof typeof this.music].stop();
        }

        for (const key in this.sounds) {
            this.sounds[key as keyof typeof this.sounds].stop();
        }
    }

    stopAllVoicelines() {
        for (const key in this.voicelines) {
            this.voicelines[key as keyof typeof this.voicelines].stop();
        }
    }
}
