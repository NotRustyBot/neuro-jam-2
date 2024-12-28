export class Buffs {
    constructor() {}
}

export class Buff {}

export enum BuffType {
    poison,
}

export type BuffDefinition = {
    type: BuffType;
    duration: number;
};

export const buffDefinitions: Map<BuffType, BuffDefinition> = new Map();
