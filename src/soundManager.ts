import { Howl } from "howler"

export class SoundManager {
    masterVolume = 1;
    sounds = {
        electronic_field: new Howl({src: "./sounds/electronic_field.wav"}),
        explosion: new Howl({src: "./sounds/explosion.wav"}),
        quantum_ump: new Howl({src: "./sounds/quantum_jump.wav"}),
        select: new Howl({src: "./sounds/select.wav"}),
        shield_up: new Howl({src: "./sounds/shield_up.wav"}),
        sweeping_strike: new Howl({src: "./sounds/sweeping_strike.wav"}),
        zap: new Howl({src: "./sounds/zap.wav"}),
    }

    play(sound : keyof typeof this.sounds, volume = 1) {
        this.sounds[sound].volume(volume * this.masterVolume);
        this.sounds[sound].play();
    }
}