class Adventurer {
    constructor(advent) {
        this.adventurer=advent.adventurer
        this.atk=advent.atk
        this.def=advent.def
        this.hp=advent.hp
        this.mgc=advent.mgc
    }

    melee() {
        return(this.adventurer + '! Think of the experience!')
    }

    block() {
        return('Is not a defense against a grue!')
    }

    magic() {
        return('I cast zone of truth')
    }

    panic() {
        return('Ahhhhhhhhhh!')
    }
}

module.exports = Adventurer;