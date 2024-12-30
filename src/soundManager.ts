import { Howl } from "howler";

export class SoundManager {
    soundVolume = 0.5;
    musicVolume = 0.5;
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
        player_damage: new Howl({ src: "./sounds/player_damage.wav" }),
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
}
