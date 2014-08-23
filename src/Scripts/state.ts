module State {

    "use strict";

    export class GameState {

        constructor(public captainName: string = "Joe Hazard", public balance: number = 100) {

        }

        save(): void {

            var saveObj = {
                captainName: this.captainName,
                balance: this.balance
            };

            localStorage.setItem("savedGameState", JSON.stringify(saveObj));
        }

    }

    export function loadState(): GameState {

        var save: string = localStorage.getItem("savedGameState"),
            saveObj: Object;

        if (save) {
            saveObj = JSON.parse(save);

            return new GameState(
                saveObj["captainName"],
                saveObj["balance"]);
        }

        return new GameState();

    }

}