import { Game } from "./game";
import "./style.css";
import { Application } from "pixi.js";

async function main() {
    const app = new Application();
    await app.init({ resizeTo: window, backgroundColor: 0x1099bb });
    document.body.appendChild(app.canvas);
    const game = new Game(app);
    game.init();
}

main();
