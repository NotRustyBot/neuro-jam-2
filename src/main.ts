import { Game } from "./game";
import "./style.css";
import { Application, Assets } from "pixi.js";
import bundle from "./bundle.json";

async function main() {
    const app = new Application();
    await app.init({ resizeTo: window, backgroundColor: 0x1099bb });
    document.body.appendChild(app.canvas);

    for (const key in bundle) {
        Assets.add({ alias: key, src: bundle[key as keyof typeof bundle] });
    }
    await Assets.load(Object.keys(bundle), (e) => {});

    const game = new Game(app);
    game.init();
}

main();
