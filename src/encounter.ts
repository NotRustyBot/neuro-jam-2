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
        return new Encounter(firstEncounter);
    }

    begin() {
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
            this.countdown = 3;
            this.instance.player.startTurn();
        } else {
            this.instance.enemy.startTurn();
        }
    }

    switch() {
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
    }

    win() {
        game.selectionScreen.show(SelectionMode.POST_ENCOUNTER);

        game.selectionScreen.onSelectionComplete = (newEquipment) => {
            game.player.addEquipment(newEquipment);
            game.selectionScreen.hide();
            this.future.destroy();
            this.past.destroy();

            game.encounter = new Encounter(secondEncounter);
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

const firstEncounter: EncounterTemplate = {
    pastEnemy: {
        name: "spider",
        health: 15,
        sprite: "enemy1_p",
        actions: [
            {
                type: "attack",
                damage: 2,
                quantity: 1,
            },
            {
                type: "debuff",
                severity: 1,
                buff: BuffType.burn,
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
                damage: 4,
                quantity: 1,
            },
            {
                type: "debuff",
                severity: 2,
                buff: BuffType.burn,
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
};

const secondEncounter: EncounterTemplate = {
    pastEnemy: {
        name: "bee",
        health: 20,
        sprite: "enemy1_p",
        actions: [
            {
                type: "attack",
                damage: 2,
                quantity: 1,
            },
            {
                type: "debuff",
                severity: 1,
                buff: BuffType.burn,
            },
        ],
    },
    futureEnemy: {
        name: "drone",
        health: 50,
        sprite: "healingBot",
        actions: [
            {
                type: "attack",
                damage: 4,
                quantity: 1,
            },
            {
                type: "debuff",
                severity: 2,
                buff: BuffType.burn,
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
};
