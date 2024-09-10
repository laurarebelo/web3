import { createInitialDeck } from "../../__test__/utils/test_adapter";
export class Hand {
    theDiscardPile = new DiscardPile();
    players;
    playerCount;
    dealer;
    shuffler;
    cardsPerPlayer;
    constructor(players, whoDealer, shuffler, cardsPerPlayer) {
        this.players = players;
        this.playerCount = players.length;
        this.dealer = whoDealer;
        this.shuffler = shuffler;
        this.cardsPerPlayer = cardsPerPlayer;
    }
    player(who) {
        // TODO IMPLEMENT
        return 0;
    }
    static createHand(props) {
        return new Hand(props.players, props.dealer, props.shuffler, props.cardsPerPlayer);
    }
    draw() {
        //TODO IMPLEMENT
    }
    play(who, color) {
        //TODO IMPLEMENT
    }
    playerHand(who) {
        //TODO IMPLEMENT
        return [];
    }
    playerInTurn() {
        //TODO IMPLEMENT
        return 0;
    }
    canPlay(who) {
        //TODO IMPLEMENT
        return false;
    }
    catchUnoFailure(whoToWho) {
        // TODO figure out type, implement
    }
    // the pile from which the players draw cards
    drawPile() {
        // TODO IMPLEMENT
        return createInitialDeck();
    }
    sayUno(who) {
        // TODO IMPLEMENT
    }
    // the pile to which the players play cards in the middle
    discardPile() {
        // TODO IMPLEMENT
        return this.theDiscardPile;
    }
    score() {
        // TODO IMPLEMENT
        return 0;
    }
    hasEnded() {
        // TODO IMPLEMENT
        return false;
    }
    winner() {
        // TODO IMPLEMENT
        return 0;
    }
    canPlayAny() {
        // TODO IMPLEMENT
        return false;
    }
    // TODO look into whatever type this is supposed to be
    onEnd(e) {
    }
}
export class DiscardPile {
    cards = [];
    size() {
        return this.cards.length;
    }
    top() {
        return this.cards[this.size() - 1];
    }
    add(card) {
        this.cards.push(card);
    }
    reset() {
        const discardedCards = [...this.cards];
        this.cards = [];
        return discardedCards;
    }
}
//# sourceMappingURL=hand.js.map