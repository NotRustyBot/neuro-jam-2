import { BuffType } from "./buffs";
import { Enemy, EnemyTemplate } from "./enemy";
import { game } from "./game";
import { BattleInstance } from "./player";

export class Encounter {
    past: BattleInstance;
    future: BattleInstance;
    pastBackground: {
        skyColor: string;
        skyRotation: number;
    }
    futureBackground: {
        skyColor: string;
        skyRotation: number;
    }
    inPast = true;

    countdown = 3;

    get backgroundData() {
        return this.inPast ? this.pastBackground : this.futureBackground;
    }

    get instance(){
        return this.inPast ? this.past : this.future;
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
        game.player.startBattle(this.instance);
        game.player.startTurn();
        this.instance.enemy.show();
    }

    nextTurn() {
        this.countdown -= 1;
        if (this.countdown === 0) {
            this.switch();
            this.countdown = 3;
        }
    }

    switch(){
        this.inPast = !this.inPast;
        game.player.hand.forEach((card) => card.hide());
        game.player.instance.enemy.hide();
        game.player.instance = this.inPast ? this.past : this.future;
        game.player.hand.forEach((card) => card.show());
        game.player.instance.enemy.show();
    }
}

type EncounterTemplate = {
    pastEnemy: EnemyTemplate;
    futureEnemy: EnemyTemplate;

    pastBackground: {
        skyColor: string;
        skyRotation: number;
    }

    futureBackground: {
        skyColor: string;
        skyRotation: number;
    }
};

const firstEncounter: EncounterTemplate = {
    pastEnemy: {
        name: "enemy1",
        health: 15,
        sprite: "enemy1_p",
        actions: [{
            type: "attack",
            damage: 2,
            quantity: 1,
        },
    {
        type: "debuff",
        severity: 1,
        buff: BuffType.poison,
    }],
    },
    futureEnemy: {
        name: "spiderbot",
        health: 50,
        sprite: "enemy1_f",
        actions: [{
            type: "attack",
            damage: 4,
            quantity: 1,
        },
    {
        type: "debuff",
        severity: 2,
        buff: BuffType.poison,
    }],
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
