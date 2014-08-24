module Game.Common {

    export enum ResourceType {
        None,
        Money,
        Fuel
    }

    export interface IGameState {

        getPlayerName(): string;
        getScore(): number;

        getLocation(): ILocation;
        setLocation(location: ILocation): boolean;

        getResourceCount(type: ResourceType): number;
        addResource(type: ResourceType, count: number);
        removeResource(type: ResourceType, count: number);

        save(): void;
    }

    export enum Faction {
        Federation,
        Pirate,
        Neutral
    }

    export enum CargoType {
        Food,
        Medicine,
        Electronics,
        Luxury,
        Drugs
    }

    export interface ICargo {
        getType(): CargoType;
        getName(): string;
        getBasePrice(): number;
        isLegal(): boolean;
    }

    export enum WeaponType {
        Kinetic,
        Energy,
        Nuclear
    }

    export interface IWeapon {
        getType(): WeaponType;
        getName(): string;
        getBasePrice(): number;
        isLegal(): boolean;
    }

    export interface IPerson {
        getGender(): string;
        getName(): string;
        getAge(): number;
        isWantedBy(faction: Faction);
    }

    export interface IShip {
        getBrand(): string;
        getModel(): string;

        getAttack(): number;
        getDefense(): number;
        getAgility(): number;

        getCargoCapacity(): number;
        getPassengerCapacity(): number;
        getHardpointCount(): number;

        getBasePrice(): number;
    }

    export interface IActionResult {
        getDescription(): string;
        isDone(): boolean;
        proceed(): void;
    }

    export interface IAction {
        getName(): string;
        getHint(): string;
        getCost(): number;
        getCostType(): ResourceType;

        isAvailable(state: IGameState): boolean;
        perform(state: IGameState): IActionResult;
    }

    export interface ILocation {
        getName(): string;
        getDescription(): string;
        getActions(): IAction[];
    }

    class PlainMoveActionResult implements IActionResult {

        private i: number = 0;

        constructor(private state: IGameState, private destination: ILocation, private flavorText: string[]) {
        }

        getDescription(): string {
            if (this.flavorText && this.i < this.flavorText.length) {
                return this.flavorText[this.i];
            }

            return null;
        }

        isDone(): boolean {
            return !this.flavorText || this.flavorText.length === this.i;
        }

        proceed(): void {

            if (this.flavorText && this.flavorText.length < this.i) {
                this.i++;
            } else {
                this.state.setLocation(this.destination);
            }
        }
    }

    export class PlainMoveAction implements IAction {

        constructor(private destination: ILocation, private flavorText: string[] = null) {

        }

        getName(): string {
            return "Go to [" + this.destination.getName() + "]";
        }

        getHint(): string {
            return "Changes location to " + this.destination.getName();
        }

        getCost(): number {
            return 0;
        }

        getCostType(): ResourceType {
            return ResourceType.None;
        }

        isAvailable(state: IGameState): boolean {
            return true;
        }

        perform(state: IGameState): IActionResult {
            return new PlainMoveActionResult(state, this.destination, this.flavorText);
        }
    }

    export class PlayerShip {

        private passengers: IPerson[];
        private cargo: ICargo[];
        private hardpoints: IWeapon[];

        constructor(private ship: IShip, private name: string) {

        }
    }



}