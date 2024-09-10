import { Hand } from "./hand";
export class Game {
    playerCount;
    targetScore;
    constructor() {
        // TODO IMPLEMENT
        this.playerCount = 0;
        this.targetScore = 0;
    }
    player(who) {
        // TODO IMPLEMENT
        return 0;
    }
    score(who) {
        // TODO IMPLEMENT
    }
    winner() {
        // TODO IMPLEMENT
    }
    currentHand() {
        // TODO IMPLEMENT
        return Hand.createHand({
            players: ["haha", "dada"],
            dealer: 0
        });
    }
    // TODO IMPLEMENT
    static createGame() {
        return new Game();
    }
}
//# sourceMappingURL=uno.js.map