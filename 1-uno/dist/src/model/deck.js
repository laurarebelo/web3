export const colors = ["RED", "YELLOW", "GREEN", "BLUE"];
export class Deck {
    cards;
    constructor(cards) {
        this.cards = cards;
    }
    get size() {
        return this.cards.length;
    }
    filter(cardPredicate) {
        return new Deck(this.cards.filter(cardPredicate));
    }
    shuffle(shufflerFunction) {
        return shufflerFunction(this.cards);
    }
    deal() {
        return this.cards.shift();
    }
    static initialCards() {
        let cards = [];
        cards.push(...Card.allNumberedAllColors());
        cards.push(...Card.oneTypeAllColors(2, "SKIP"));
        cards.push(...Card.oneTypeAllColors(2, "REVERSE"));
        cards.push(...Card.oneTypeAllColors(2, "DRAW"));
        cards.push(...Card.wildTypeCertainAmount(4, "WILD"));
        cards.push(...Card.wildTypeCertainAmount(4, "WILD DRAW"));
        return cards;
    }
    static createInitialDeck() {
        return new Deck(Deck.initialCards());
    }
}
export class Card {
    type;
    color;
    number;
    constructor(type, color, number) {
        this.type = type;
        this.color = color;
        this.number = number;
    }
    static allNumberedOneColor(color) {
        let cards = [];
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        cards.push(new Card("NUMBERED", color, 0));
        numbers.forEach(number => {
            cards.push(new Card("NUMBERED", color, number));
            cards.push(new Card("NUMBERED", color, number));
        });
        return cards;
    }
    static allNumberedAllColors() {
        let cards = [];
        colors.forEach(color => {
            cards.push(...Card.allNumberedOneColor(color));
        });
        return cards;
    }
    static oneTypeAllColors(howManyEachColor, type) {
        let cards = [];
        colors.forEach(color => {
            for (let i = 0; i < howManyEachColor; i++) {
                cards.push(new Card(type, color));
            }
        });
        return cards;
    }
    static wildTypeCertainAmount(amount, wildType) {
        let cards = [];
        for (let i = 0; i < amount; i++) {
            cards.push(new Card(wildType));
        }
        return cards;
    }
}
//# sourceMappingURL=deck.js.map