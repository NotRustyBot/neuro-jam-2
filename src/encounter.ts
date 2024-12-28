import { BattleInstance } from "./player";

export class Encounter {
    past: BattleInstance;
    future: BattleInstance;

    constructor(past: BattleInstance, future: BattleInstance) {
        this.past = past;
        this.future = future;
    }
}