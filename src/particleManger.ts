import { Assets, Sprite, BLEND_MODES} from "pixi.js";
import { game } from "./game";

type particleType = {
    textures: string[],
    tints: number[],
    blending: BLEND_MODES,
    particleScaleRange: number[],
    alphaMode: string,
    lifespan: number,
    velocity: (x: number, y: number) => {
        x: number,
        y: number
    },
}

const effectsList:Record <string, particleType> = {
    fire: {
        textures: ["fire"],
        tints: [0xFF8000, 0xFF4000, 0xFF0000],
        blending: "add",
        particleScaleRange: [3.0, 3.5],
        alphaMode: "fadeInOut",
        lifespan: 800,
        velocity: (x: number, y: number) => {
            return {
                x: (Math.random() - 0.5) * 0.6,
                y: -1.0 - Math.random() * 0.5,
            };
        },
    },
    frost: {
        textures: ["frost"],
        tints: [0x88CCFF, 0x99DDFF, 0x77AAFF],
        blending: "normal",
        particleScaleRange: [3.2, 3.8],
        alphaMode: "fadeInOut",
        lifespan: 1000,
        velocity: (x: number, y: number) => {
            return {
                x: (Math.random() - 0.5) * 0.2,
                y: -0.3 - Math.random() * 0.2,
            };
        },
    },
    stun: {
        textures: ["stun"],
        tints: [0xFFFF00, 0xDDDD00],
        blending: "add",
        particleScaleRange: [2.8, 3.2],
        alphaMode: "pulse",
        lifespan: 600,
        velocity: (x: number, y: number) => {
          return {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
          };
        },
    },
    magic: {
        textures: ["magic"],
        tints: [0xFF00FF, 0xAA00FF, 0xCC66FF],
        blending: "add",
        particleScaleRange: [3.0, 3.5],
        alphaMode: "fadeInOut",
        lifespan: 1200,
        velocity: (x: number, y: number) => {
          return {
            x: (Math.random() - 0.5) * 0.8,
            y: (Math.random() - 0.5) * 0.8,
          };
        },
      },
    smoke: {
        textures: ["smoke1", "smoke2", "smoke3"],
        tints: [0xFFFFFF, 0xDDDDDD, 0xBBBBBB, 0x999999, 0x777777],
        blending: "multiply",
        particleScaleRange: [2.5, 3.5],
        alphaMode: "fadeInOut",
        lifespan: 1000,
        velocity: (x: number, y: number) => {
          return {
            x: (Math.random() - 0.5) * 0.4,
            y: -0.5 - Math.random() * 0.2,
          };
        },
    }
}

export class ParticleManager {
    particles: Set <Particles> = new Set();
    spawnEffect(
        effectType: keyof typeof effectsList,
        x: number,
        y: number,
        count = 10) {
            const config = effectsList[effectType];
            for (let i = 0; i < count; i++) {
                const particle = new Particles(config, x, y);
                this.particles.add(particle)
            }
        }
        update(dt: number) {
            for (const particle of this.particles) {
                particle.update(dt);
                if (particle.isDead) {
                    this.particles.delete(particle);
                }
            }
        }
           
}

class Particles {
    graphic: Sprite;
    isDead = false;

    config: typeof effectsList[keyof typeof effectsList];
    timeToLive: number;
    initialTTL: number;
    scale: number;
    velocity = { x: 0, y: 0 };

    constructor(config: typeof effectsList[keyof typeof effectsList], x: number, y: number) {
            this.config = config;
            const {textures, tints, blending, particleScaleRange, lifespan} = config;
            const textureName = textures[Math.floor(Math.random() * textures.length)];
            this.graphic = new Sprite(Assets.get(textureName))
            this.graphic.position.set(x,y);
            this.graphic.anchor.set(0.5);
            this.graphic.blendMode = blending ;
            game.particleContainer.addChild(this.graphic);
            this.timeToLive = lifespan;
            this.initialTTL = lifespan;
            const minScale = particleScaleRange[0];
            const maxScale = particleScaleRange[1];
            this.scale = minScale + Math.random() * (maxScale - minScale);
            this.graphic.scale.set(this.scale);

            if(tints && tints.length > 0) {
                this.graphic.tint = tints[Math.floor(Math.random() * tints.length)];
            }
            else {
                this.graphic.tint = 0xFFFFFF;
            }
            this.graphic.alpha = 0;
            this.velocity = config.velocity(0,0);
            this.graphic.rotation = Math.random() * Math.PI * 2;
        }
        update(dt: number) {
            this.graphic.position.x += this.velocity.x;
            this.graphic.position.y += this.velocity.y;
            this.timeToLive -= dt;
            if (this.timeToLive <= 0) {
                this.isDead = true;
                this.graphic.destroy();
                return;
            }
            this.updateAlpha();
        }
        updateAlpha() {
            const lifeRatio = 1 - this.timeToLive / this.initialTTL;
            switch (this.config.alphaMode) {
                case "fadeInOut":
                    this.graphic.alpha = 1 - Math.abs(1 - 2 * lifeRatio);
                    break;
                case "pulse":
                    this.graphic.alpha = 0.5 + 0.5 * Math.sin(lifeRatio * Math.PI * 4);
                    break;
                default:
                    this.graphic.alpha = 1 - lifeRatio;
                    break;
                }
        }
    }