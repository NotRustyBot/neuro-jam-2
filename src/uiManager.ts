import { Container, Text } from "pixi.js";
import { KeywordDefinition, keywordDefinitions, KeywordType } from "./cardDefinitions";
import { game } from "./game";

export class UIManager {
    keywords = new Set<UiKeywordDefinition>();
    keywordContainer = new Container();
    constructor() {
        game.uiContainer.addChild(this.keywordContainer);
    }

    update(dt: number) {}

    showKeywords(keywords?: KeywordType[]) {
        console.log("show keywords", keywords);

        this.keywords.forEach((keyword) => keyword.destroy());
        this.keywords.clear();
        new Set(keywords).forEach((keyword) => {
            const uiKeyword = new UiKeywordDefinition(keyword);
            this.keywords.add(uiKeyword);
            uiKeyword.container.position.y = 100 * this.keywords.size + 100;
        });
    }

    hideKeywords() {
        this.keywords.forEach((keyword) => keyword.destroy());
    }
}

class UiKeywordDefinition {
    container: Container;
    name: Text;
    description: Text;

    keyword: KeywordDefinition;

    constructor(type: KeywordType) {
        this.keyword = keywordDefinitions.get(type)!;
        this.container = new Container();
        this.name = new Text({ text: this.keyword.name, style: { fontFamily: "Arial", fontSize: 24, fill: this.keyword.color } });
        this.description = new Text({ text: this.keyword.description, style: { fontFamily: "Arial", fontSize: 24, fill: 0xffffff } });
        this.description.y = 30;

        this.container.addChild(this.name);
        this.container.addChild(this.description);

        game.uiManager.keywordContainer.addChild(this.container);
    }

    destroy() {
        this.container.destroy();
    }
}
