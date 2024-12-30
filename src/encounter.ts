import { BuffType } from "./buffs";
import { Enemy, EnemyTemplate } from "./enemy";
import { game } from "./game";
import { BattleInstance } from "./player";
import { SelectionMode } from "./selectionScreen";

export class Encounter {
    past: BattleInstance;
    future: BattleInstance;
    pastBackground: {
        skyColor: string;
        skyRotation: number;
    };
    futureBackground: {
        skyColor: string;
        skyRotation: number;
    };
    inPast = true;

    countdown = 3;

    get backgroundData() {
        return this.inPast ? this.pastBackground : this.futureBackground;
    }

    get instance() {
        return this.inPast ? this.past : this.future;
    }

    get otherInstance() {
        return this.inPast ? this.future : this.past;
    }

    constructor(template: EncounterTemplate) {
        this.past = new BattleInstance(new Enemy(template.pastEnemy));
        this.future = new BattleInstance(new Enemy(template.futureEnemy));

        this.pastBackground = template.pastBackground;
        this.futureBackground = template.futureBackground;
    }

    static createFirstEncounter(): Encounter {
        return new Encounter(encounters[game.encounterIndex]);
    }

    begin() {
        game.player.buffs.clear();
        this.inPast = true;
        game.player.startBattle(this.instance);
        game.player.startTurn();
        this.instance.enemy.show();

        if (this.inPast) {
            game.soundManager.setMusic("past");
        } else {
            game.soundManager.setMusic("future");
        }

        game.background.updateAssets();
    }

    nextTurn() {
        this.countdown -= 1;
        if (this.countdown <= 0 && this.otherInstance.enemy.health > 0) {
            this.switch();
        } else {
            this.instance.enemy.startTurn();
        }
    }

    die() {
        game.soundManager.cutMusic();
        game.soundManager.play("defeat_theme");
        //tf we gonna do
    }

    switch() {
        game.effectsManager.startTimewarp();
        game.timeManager.delay(() => {
            this.inPast = !this.inPast;
            game.player.instance.enemy.hide();
            game.player.instance = this.inPast ? this.past : this.future;
            game.player.instance.enemy.show();

            if (this.inPast) {
                game.soundManager.setMusic("past");
            } else {
                game.soundManager.setMusic("future");
            }

            game.background.updateAssets();
            this.countdown = 3;
            this.instance.player.startTurn();
        }, 500);
    }

    win() {
        if (this.instance.player.isDead) return;
        game.encounterIndex++;

        if (game.encounterIndex == encounters.length) {
            game.effectsManager.victory();
            game.soundManager.cutMusic();
            game.soundManager.play("victory_theme");
            return;
        }

        game.selectionScreen.show(SelectionMode.POST_ENCOUNTER);
        game.soundManager.setMusic("menu");

        game.selectionScreen.onSelectionComplete = (newEquipment) => {
            game.player.addEquipment(newEquipment);
            game.selectionScreen.hide();
            this.future.destroy();
            this.past.destroy();

            game.encounter = new Encounter(encounters[game.encounterIndex]);
            game.encounter.begin();
        };
    }
}

type EncounterTemplate = {
    pastEnemy: EnemyTemplate;
    futureEnemy: EnemyTemplate;

    pastBackground: {
        skyColor: string;
        skyRotation: number;
    };

    futureBackground: {
        skyColor: string;
        skyRotation: number;
    };
};

const encounters: EncounterTemplate[] = [
    // encounter 1
    {
        pastEnemy: {
            name: "spider",
            health: 18,
            sprite: "enemy1_p",
            actions: [
                {
                    type: "attack",
                    description: "Attack for 6",
                    async action(enemy: Enemy) {
                        enemy.attack(6);
                    },
                },
                {
                    type: "skill",
                    description: "Heal 6",
                    async action(enemy: Enemy) {
                        enemy.takeDamage(-6);
                    },
                },
            ],
        },
        futureEnemy: {
            name: "spiderbot",
            health: 20,
            sprite: "enemy1_f",
            actions: [
                {
                    type: "attack",
                    description: "Attack for 6",
                    async action(enemy: Enemy) {
                        enemy.attack(6);
                    },
                },
                {
                    type: "skill",
                    description: "Inflict weakness",
                    async action(enemy: Enemy) {
                        enemy.opponent.buffs.add(BuffType.weak, 3);
                        game.soundManager.play("ancestors_call", 0.25);
                    },
                },
            ],
        },

        pastBackground: {
            skyColor: "#5075EF",
            skyRotation: 0.05,
        },

        futureBackground: {
            skyColor: "#ccaa96",
            skyRotation: -0.05,
        },
    },
    // encounter 2
    {
        pastEnemy: {
            name: "bee",
            health: 20,
            sprite: "enemy1_p",
            actions: [
                {
                    type: "skill",
                    description: "Inflict burn",
                    async action(enemy: Enemy) {
                        enemy.opponent.buffs.add(BuffType.burn, 4);
                    },
                },
                {
                    type: "attack",
                    description: "Gain vunerable, attack for 10",
                    async action(enemy: Enemy) {
                        enemy.buffs.add(BuffType.vulnerable, 1);
                        await game.timeManager.wait(200);
                        enemy.attack(10);
                    },
                },
            ],
        },
        futureEnemy: {
            name: "drone",
            health: 25,
            sprite: "drone",
            actions: [
                {
                    type: "skill",
                    description: "Inflict burn",
                    async action(enemy: Enemy) {
                        enemy.opponent.buffs.add(BuffType.burn, 1);
                    },
                },
                {
                    type: "attack",
                    description: "Gain strength, attack for 4",
                    async action(enemy: Enemy) {
                        enemy.buffs.add(BuffType.strength, 3);
                        await game.timeManager.wait(200);
                        enemy.attack(8);
                    },
                },
            ],
        },
        pastBackground: {
            skyColor: "#4065DF",
            skyRotation: 0.1,
        },

        futureBackground: {
            skyColor: "#666633",
            skyRotation: -0.1,
        },
    },
    // encounter 3
    {
        pastEnemy: {
            name: "turtle",
            health: 30,
            sprite: "cultist_turtle",
            actions: [
                {
                    type: "skill",
                    description: "Hide in shell",
                    async action(enemy: Enemy) {
                        enemy.buffs.add(BuffType.immune);
                    },
                },
                {
                    type: "attack",
                    description: "Attack for 6",
                    async action(enemy: Enemy) {
                        enemy.attack(6);
                    },
                },
            ],
        },
        futureEnemy: {
            name: "turtle bot",
            health: 35,
            sprite: "tech_turtle",
            actions: [
                {
                    type: "skill",
                    description: "Hide in shell",
                    async action(enemy: Enemy) {
                        enemy.buffs.add(BuffType.immune);
                    },
                },
                {
                    type: "attack",
                    description: "Attack for 6",
                    async action(enemy: Enemy) {
                        enemy.attack(6);
                    },
                },
            ],
        },
        pastBackground: {
            skyColor: "#4065DF",
            skyRotation: 0.1,
        },

        futureBackground: {
            skyColor: "#666633",
            skyRotation: -0.1,
        },
    },
];
