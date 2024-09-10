import { createInitialDeck, HandProps } from "../../__test__/utils/test_adapter";
import { Shuffler } from "../utils/random_utils";
import { Card, Color, Deck } from "./deck";

export class Hand {

    theDiscardPile!: DiscardPile
    players: Player[]
    playerCount: number
    dealer: number
    shuffler?: Shuffler<Card>
    cardsPerPlayer: number
    private theDrawPile!: Deck
    private currPlayer: number | undefined
    private unoJustCaught: boolean = false
    private openUnoCatch: boolean = false
    private handEnded: boolean = false
    private winnerPlayer: number | undefined = undefined
    private handScore: number | undefined = undefined
    private direction: number
    private onEndFunction?: Function
    private drewPlayableCard = false

    constructor(players: string[], whoDealer: number, shuffler?: Shuffler<Card>, cardsPerPlayer: number = 7, onEndCallback?: Function) {
        this.direction = 1
        this.playerCount = players.length
        this.dealer = whoDealer
        this.shuffler = shuffler
        this.cardsPerPlayer = cardsPerPlayer
        this.players = Hand.initializePlayers(players)
        this.serveCards()
        this.onEndFunction = onEndCallback
    }

    public static initializePlayers(players: string[]): Player[] {
        let playerObjs: Player[] = []
        players.forEach(player => {
            playerObjs.push(new Player(player))
        })
        return playerObjs
    }

    private resetEverything() {
        this.theDiscardPile = new DiscardPile()
        this.theDrawPile = Deck.createInitialDeck();
        if (this.shuffler) {
            this.theDrawPile.shuffle(this.shuffler);
        }
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i]
            player.cards = []
        }
    }

    serveCards() {
        this.resetEverything()
        for (let i = 0; i < this.playerCount; i++) {
            for (let j = 0; j < this.cardsPerPlayer; j++) {
                const nextCard = this.drawPile().deal()
                if (nextCard) {
                    this.player(i).cards.push(nextCard)
                }
            }
        }
        let startingCard = this.drawPile().deal()!
        if (startingCard.type.includes("WILD")) {
            this.serveCards();
            return;
        }
        this.theDiscardPile.add(startingCard)
        this.currPlayer = this.dealer
        this.applyLastCardEffects()
        this.nextTurn()
    }

    dealCardsToPlayer(who: number, numCards: number) {
        console.log(`current size of the draw pile: ${this.theDrawPile.size}`)
        console.log(`dealing ${numCards} cards to player ${who}`)
        const player = this.player(who)
        for (let i = 0; i < numCards; i++) {
            const nextCard = this.drawPile().deal()
            console.log(`removed card ${nextCard} from the draw pile`)
            if (nextCard == undefined) {
                throw new Error(`Tried to deal more cards to the player ${who} than there were cards available in the draw pile.`)
            }
            player.cards.push(nextCard)
            this.checkForDrawPileFinish()
        }
    }

    player(who: number) {
        if (who < 0 || who >= this.players.length) {
            throw new Error("Player index out of bounds!")
        }
        return this.players[who]
    }

    public static createHand(players: string[], dealer : number, shuffler?: Shuffler<Card>, cardsPerPlayer? : number, onEndFunction? : Function) {
        if (players.length < 2) {
            throw new Error("Needs at least two players to play!")
        }
        if (players.length > 10) {
            throw new Error("Maximum number of players is 10!")
        }
        const newHand = new Hand(players, dealer, shuffler, cardsPerPlayer, onEndFunction)
        return newHand
    }

    private currentPlayer(): Player {
        return this.player(this.playerInTurn()!);
    }

    public printEverything() {
        console.log(`draw pile: ${JSON.stringify(this.theDrawPile)}`)
        console.log(`discard pile: ${JSON.stringify(this.theDiscardPile)}`)
        for (let i = 0; i < this.players.length; i++) {
            console.log(`player ${i} hand: ${JSON.stringify(this.playerHand(i))}`)
        }
    }

    public draw() {
        if (this.handEnded) {
            throw new Error("Cannot keep drawing after hand has ended")
        }
        const nextCard = this.drawPile().deal()
        if (nextCard) {
            const currentPlayer = this.currentPlayer()
            console.log(`player ${this.playerInTurn()} drew the card ${nextCard}.`)
            currentPlayer.resetUno()
            currentPlayer.cards.push(nextCard)
        }
        if (!this.canPlayAny()) {
            console.log(`it was deemeded that the player could not play so the turn moved on.`)
            this.nextTurn()
        }
        else {
            this.drewPlayableCard = true
        }
        this.openUnoCatch = false
    }

    private checkForDrawPileFinish() {
        if (this.drawPile().size == 0) {
            this.theDrawPile = Deck.newDrawPile(this.discardPile().reset(), this.shuffler)
        }
    }

    private cardOnTop() {
        return this.theDiscardPile.top()
    }

    private nextTurn() {
        this.drewPlayableCard = false
        this.currPlayer = this.currPlayer! + (1 * this.direction)
        this.unoJustCaught = false;
        this.checkForDrawPileFinish()
        if (this.currPlayer == this.playerCount) {
            this.currPlayer = 0
        }
        if (this.currPlayer == -1) {
            this.currPlayer = this.playerCount - 1
        }
    }

    public play(cardIndex: number, color?: Color): Card {
        if (this.hasEnded()) {
            throw new Error("Cannot keep playing after hand is over")
        }

        const playerOfPlay = this.currentPlayer()
        const cardInHand = playerOfPlay.cards[cardIndex]

        if (cardInHand.type.includes("WILD")) {
            if (color == undefined) {
                throw new Error("If you play a wild card, you must specify its color")
            }
            cardInHand.color = color;
        }
        else {
            if (color != undefined) {
                throw new Error("If you play a colored card, you cannot specify its color")
            }
        }

        console.log(`The player ${this.playerInTurn()} tried to play the card ${cardInHand.type} ${cardInHand.color} ${cardInHand.number} on top of ${this.cardOnTop().type} ${this.cardOnTop().color} ${this.cardOnTop().number}`)

        if (this.isCardPlayable(this.cardOnTop(), cardInHand)) {
            playerOfPlay.cards = playerOfPlay.cards.filter(c => !c.equals(cardInHand))
            this.discardPile().add(cardInHand)
            if (playerOfPlay.cards.length == 0) {
                this.applyLastCardEffects(false)
                this.endHand()
                return cardInHand;
            }
            else {
                this.applyLastCardEffects()
            }
            if (playerOfPlay.cards.length == 1) {
                this.openUnoCatch == true
            }
            else {
                this.openUnoCatch = false
            }

            this.nextTurn()
        }
        else {
            throw new Error("Tried to play illegal card :p")
        }
        return cardInHand;
    }

    private applyLastCardEffects(skipTurn: boolean = true) {
        const lastCard = this.discardPile().top();
        console.log(`applying top card effects... the card on top is: ${lastCard}`)
        const nextPlayer = this.playerAfter(this.currPlayer!)
        switch (lastCard.type) {
            case "DRAW":
                this.dealCardsToPlayer(nextPlayer, 2)
                if (skipTurn) this.nextTurn()
                return
            case "REVERSE":
                if (this.playerCount > 2) {
                    this.invertDirection()
                    return
                }
                else {
                    if (skipTurn) this.nextTurn()
                    return
                }
            case "SKIP":
                if (skipTurn) this.nextTurn()
                return
            case "WILD DRAW":
                this.dealCardsToPlayer(nextPlayer, 4)
                if (skipTurn) this.nextTurn()
                return
        }
        return false;
    }

    private invertDirection() {
        this.direction = this.direction * -1
    }

    private endHand() {
        this.handEnded = true;
        this.winnerPlayer = this.currPlayer
        this.handScore = this.calculateScore()
        this.currPlayer = undefined
        this.onEnd()
    }

    public playerHand(who: number): Card[] {
        return this.player(who).cards;
    }

    public playerInTurn(): number | undefined {
        return this.currPlayer
    }

    private isCardPlayable(drawCard: Card, cardAttempt: Card) {
        if (cardAttempt.type == "WILD" || cardAttempt.type == "WILD DRAW") {
            return true
        }
        else if (cardAttempt.color == drawCard.color) {
            return true
        }
        else if (drawCard.type == "NUMBERED" && cardAttempt.type == "NUMBERED") {
            return (drawCard.number == cardAttempt.number)
        }
        else if (drawCard.type == cardAttempt.type) {
            return true
        }
        return false
    }

    public catchUnoFailure(whoToWho: UnoFailurePair): boolean {

        console.log(`player ${whoToWho.accuser} accused player ${whoToWho.accused} of not saying UNO!`)
        console.log(`the current turn is: ${this.currPlayer}`)

        const accusedPlayer: Player = this.player(whoToWho.accused)
        const whoseTurn = this.currPlayer
        const canUnoFailureBeCaught = (this.playerAfter(whoToWho.accused) == whoseTurn)
        if
            (!this.drewPlayableCard &&
            !this.unoJustCaught &&
            canUnoFailureBeCaught &&
            accusedPlayer.cards.length == 1 &&
            accusedPlayer.getHasSaidUno() == false) {
            this.dealCardsToPlayer(whoToWho.accused, 4);
            this.unoJustCaught = true
            return true;
        }
        return false;
    }

    public drawPile(): Deck {
        return this.theDrawPile
    }

    private playerAfter(playerNum: number) {
        let next = playerNum + 1 * this.direction
        if (next == this.playerCount) {
            next = 0
        }
        if (next == -1) {
            next = this.playerCount - 1
        }
        return next
    }

    public sayUno(who: number) {
        const player = this.player(who)
        if (this.hasEnded()) {
            throw new Error("Cannot say UNO! after hand has ended")
        }
        if (this.currPlayer == who || this.currPlayer == this.playerAfter(who)) {
            console.log(`player ${who} said uno`)
            player.sayUno()
        }
        else {
            console.log(`player ${who} tried to say uno but it was not their turn`)
        }
    }

    private calculateScore(): number {
        let sum = 0
        console.log(`Calculating score of hand!`)
        for (let i = 0; i < this.playerCount; i++) {
            console.log(`Looking at player ${i}`)
            const player = this.player(i)
            for (let j = 0; j < player.cards.length; j++) {
                const card = player.cards[j]
                sum += card.scoreValue()
            }
        }
        return sum
    }

    public discardPile(): DiscardPile {
        return this.theDiscardPile
    }

    public score(): number | undefined {
        return this.handScore
    }

    public hasEnded(): boolean {
        return this.handEnded
    }

    public winner(): number | undefined {
        return this.winnerPlayer
    }

    public canPlay(cardIndex: number): boolean {
        if (!this.hasEnded()) {
            const cardOnTop = this.cardOnTop()
            const card = this.currentPlayer().cards[cardIndex]
            if (card == undefined) {
                return false
            }
            console.log(`checking if player ${this.currPlayer} can play card ${card} on top of ${cardOnTop}`)
            if (card.type == "WILD DRAW" && this.doesPlayerHandsHaveMatchingColor()) {
                return false
            }
            if (this.isCardPlayable(cardOnTop, card)) {
                return true;
            }
        }
        return false;
    }

    public canPlayAny(): boolean {
        if (!this.handEnded) {
            const cardOnTop = this.cardOnTop()
            console.log(`the card on top is: ${cardOnTop}`)
            for (let i = 0; i < this.currentPlayer().cards.length; i++) {
                const card = this.currentPlayer().cards[i]
                if (this.isCardPlayable(cardOnTop, card)) {
                    return true;
                }
            }
        }
        return false;
    }

    private doesPlayerHandsHaveMatchingColor(): boolean {
        const cardOnTop = this.cardOnTop()
        if (cardOnTop.color == undefined) {
            return true
        }
        for (let i = 0; i < this.currentPlayer().cards.length; i++) {
            const card = this.currentPlayer().cards[i]
            if (cardOnTop.color == card.color) {
                return true;
            }
        }
        return false
    }

    public onEnd() {
        console.log("Entering onEnd hand function")
        if (this.onEndFunction) {
            this.onEndFunction(this.winnerPlayer, this.handScore)
        }
    }

}

export class DiscardPile {
    private cards: Card[] = []
    public get size() {
        return this.cards.length
    }

    public top() {
        return this.cards[this.size - 1]
    }

    public add(card: Card) {
        this.cards.push(card)
    }

    public reset(): Card[] {
        const discardedCards = this.cards.slice(0, this.cards.length - 1)
        this.cards = [this.top()]
        return discardedCards
    }
}

export type UnoFailurePair = { accuser: number, accused: number }
export class Player {
    name: string
    public cards: Card[] = []
    private hasSaidUno = false;
    private playerScore = 0
    constructor(name: string) {
        this.name = name;
    }

    public get score() {
        return this.playerScore
    }

    public increaseScore(howMuch: number) {
        this.playerScore += howMuch
    }

    public sayUno() {
        this.hasSaidUno = true;
    }

    public resetUno() {
        this.hasSaidUno = false;
    }

    public getHasSaidUno(): boolean {
        return this.hasSaidUno
    }
}
