import { Howl } from "howler";

export class SoundManager {
    masterVolume = 1;
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
    };

    play(sound: keyof typeof this.sounds, volume = 1) {
        this.sounds[sound].volume(volume * this.masterVolume);
        this.sounds[sound].play();
    }
}
