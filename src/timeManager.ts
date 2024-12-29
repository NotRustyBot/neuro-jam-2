type DelayData = {
    ms: number;
    callback: () => void;
};

export class TimeManager {
    timeRate: number = 1;
    targetTimeRate: number = 1;

    actualDt = 0;
    get dt() {
        return this.actualDt * this.timeRate;
    }

    delays: Set<DelayData> = new Set();

    setTargetRate(rate: number) {
        this.targetTimeRate = Math.min(rate, this.targetTimeRate);
    }

    update(dt: number) {
        this.timeRate = (this.targetTimeRate + this.timeRate * 9) / 10;
        this.actualDt = dt;

        for (const d of this.delays) {
            d.ms -= this.dt;
            if (d.ms <= 0) {
                d.callback();
                this.delays.delete(d);
            }
        }
    }

    async wait(ms: number) {
        return new Promise<void>((resolve) => {
            this.delay(resolve, ms);
        });
    }

    delay(callback: () => void, ms: number) {
        this.delays.add({ ms, callback });
        return callback;
    }

    cancelDelay(callback: () => void) {
        for (const d of this.delays) {
            if (d.callback === callback) {
                this.delays.delete(d);
                return;
            }
        }
    }
}
