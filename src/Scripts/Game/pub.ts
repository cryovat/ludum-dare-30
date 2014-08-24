/// <reference path="common.ts" />

module Game.Pub {

    class GambleActionResult implements Game.Common.IActionResult {

        private description: string;

        constructor(private state: Common.IGameState, private credits: number) {
        }

        getDescription(): string {
            return this.description;
        }

        isDone(): boolean {
            return this.credits < 1;
        }

        proceed(): void {

            if (this.credits > 0) {

                var roll = Math.random(),
                    winnings = Math.floor(Math.random() * 100);

                if (roll >= 0.7) {

                    this.description = "You win " + winnings + " credits!"
                    this.credits--;

                } else if (roll >= 0.6) {

                    this.description = "You don't win anything, but you regain one credit!";

                } else {

                    this.description = "The other players grin. You lose your stake.";
                    this.credits--;

                }
            }

        }

    }

    class GambleAction implements Game.Common.IAction {

        getName(): string {
            return "Gamble";
        }

        getHint(): string {
            return "You're usually not one for hitting the tables, but why not?";
        }

        getCost(): number {
            return 5;
        }

        getCostType(): Game.Common.ResourceType {
            return Game.Common.ResourceType.Money;
        }

        isAvailable(state: Game.Common.IGameState) {
            return state.getResourceCount(Game.Common.ResourceType.Money) > 5;
        }

        perform(state: Game.Common.IGameState): Game.Common.IActionResult {
            return new GambleActionResult(state, 5);
        }
    }

    export class PubLocation implements Game.Common.ILocation {

        private actions: Game.Common.IAction[] = [];

        constructor(private owner: Game.Common.ILocation, private name: string, private description: string) {

            this.actions.push(new GambleAction());
            this.actions.push(new Common.PlainMoveAction(owner));
        }

        getName(): string {
            return this.name;
        }

        getDescription(): string {
            return this.description;
        }

        getActions(): Game.Common.IAction[] {
            return this.actions;
        }
    }

}