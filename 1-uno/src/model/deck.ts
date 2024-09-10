import { CardPredicate } from "../../__test__/utils/predicates";

export const colors: Color[] = ["RED", "YELLOW", "GREEN", "BLUE"]

export class Deck {

    private cards: Card[]

    private constructor(cards: Card[]) {
        this.cards = cards
    }

    public static newDrawPile(discardPile : Card[], shufflerFunction? : Function) {
        const newDeck = new Deck(discardPile)
        if (shufflerFunction) {
            newDeck.shuffle(shufflerFunction)
        }
        return newDeck
    }

    public get size(): number {
        return this.cards.length
    }

    public push(card : Card) {
        this.cards.push(card)
    }

    public filter(cardPredicate: CardPredicate): Deck {
        return new Deck(this.cards.filter(cardPredicate))
    }

    public shuffle(shufflerFunction: Function) {
        return shufflerFunction(this.cards)
    }

    public deal() {
        return this.cards.shift();
    }

    private static initialCards() {
        let cards: Card[] = []
        cards.push(...Card.allNumberedAllColors())
        cards.push(...Card.oneTypeAllColors(2, "SKIP"))
        cards.push(...Card.oneTypeAllColors(2, "REVERSE"))
        cards.push(...Card.oneTypeAllColors(2, "DRAW"))
        cards.push(...Card.wildTypeCertainAmount(4, "WILD"))
        cards.push(...Card.wildTypeCertainAmount(4, "WILD DRAW"))
        return cards;
    }

    public static createInitialDeck(): Deck {
        return new Deck(Deck.initialCards())
    }
}

export class Card {
    type: Type
    color?: Color
    number?: number

    constructor(type: Type, color?: Color, number?: number) {
        this.type = type
        this.color = color
        this.number = number
    }

    public equals(other: Card): boolean {
        return (this.type == other.type && this.color == other.color && this.number == other.number)
    }

    public toString(): string {
        return `${this.type} ${this.color} ${this.number}`
    }

    public scoreValue(): number {
        switch (this.type) {
            case "DRAW":
            case "REVERSE":
            case "SKIP":
                return 20;
            case "WILD":
            case "WILD DRAW":
                return 50
            case "NUMBERED":
                return this.number!
        }
    }

    public static allNumberedOneColor(color: Color) {
        let cards: Card[] = []
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        cards.push(new Card("NUMBERED", color, 0))
        numbers.forEach(number => {
            cards.push(new Card("NUMBERED", color, number))
            cards.push(new Card("NUMBERED", color, number))
        })
        return cards;
    }

    public static allNumberedAllColors(): Card[] {
        let cards: Card[] = []
        colors.forEach(color => {
            cards.push(...Card.allNumberedOneColor(color))
        });
        return cards;
    }

    public static oneTypeAllColors(howManyEachColor: number, type: ColoredType) {
        let cards: Card[] = []
        colors.forEach(color => {
            for (let i = 0; i < howManyEachColor; i++) {
                cards.push(new Card(type, color))
            }
        });
        return cards;
    }

    public static wildTypeCertainAmount(amount: number, wildType: WildType) {
        let cards: Card[] = []
        for (let i = 0; i < amount; i++) {
            cards.push(new Card(wildType))
        }
        return cards;
    }
}

export type ColoredType = "NUMBERED" | "SKIP" | "REVERSE" | "DRAW"
export type WildType = "WILD" | "WILD DRAW"
export type Type = ColoredType | WildType
export type Color = "RED" | "YELLOW" | "GREEN" | "BLUE"