import { Shuffler } from "../utils/random_utils"
import { Card } from "./deck"
import { Hand, Player } from "./hand"

export class Game {

    playerCount: number
    targetScore: number
    players: Player[]
    private winnerPlayer: number | undefined
    hand!: Hand | undefined
    dealer: number
    shuffler?: Shuffler<Card>
    cardsPerPlayer?: number

    constructor(props: Props) {
        this.playerCount = props.players.length
        this.players = Hand.initializePlayers(props.players)
        this.targetScore = props.targetScore
        this.dealer = 0
        this.shuffler = props.shuffler
        this.cardsPerPlayer = props.cardsPerPlayer
        if (props.randomizer) {
            console.log("Calling randomizer")
            this.dealer = props.randomizer()
        }
        this.resetHand()
    }

    public resetHand() {
        this.hand = Hand.createHand(this.playersStringArray,this.dealer,this.shuffler,this.cardsPerPlayer,this.onHandEnd.bind(this)
        )
    }

    player(who: number): Player {
        if (who < 0 || who >= this.players.length) {
            throw new Error("Player index out of bounds!")
        }
        return this.players[who]
    }

    get playersStringArray(): string[] {
        let playerNames = []
        for (let i = 0; i < this.players.length; i++) {
            const curr = this.players[i]
            playerNames.push(curr.name)
        }
        return playerNames
    }

    score(who: number) {
        const player: Player = this.player(who)
        return player.score
    }

    winner() {
        return this.winnerPlayer
    }

    currentHand(): Hand {
        return this.hand!
    }

    private checkForWinner(winner: number): boolean {
        if (this.score(winner) >= this.targetScore) {
            this.winnerPlayer = winner
            return true
        }
        return false
    }

    onHandEnd(winner: number, score: number) {
        console.log("OnHandEnd called")
        this.player(winner).increaseScore(score)
        console.log(`Score of player: ${this.score(winner)}`)
        if (!this.checkForWinner(winner)) {
            this.resetHand()
        }
        else {
            this.hand = undefined
        }
    }

    public static createGame(props: Partial<Props>) {
        if (props.targetScore != undefined && props.targetScore <= 0) {
            throw new Error("Target score must be over 0")
        }
        const propsObj: Props = {
            players: props.players || ['A', 'B'],
            targetScore: props.targetScore || 500,
            randomizer: props.randomizer,
            shuffler: props.shuffler,
            cardsPerPlayer: props.cardsPerPlayer,
        }
        if (propsObj.players.length < 2) {
            throw new Error("Game must have at least two players")
        }
        return new Game(propsObj)
    }
}

export type Props = {
    players: string[],
    targetScore: number,
    randomizer?: Function,
    shuffler?: Shuffler<Card>,
    cardsPerPlayer?: number
}