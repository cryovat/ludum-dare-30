declare module THREEx {

    export class KeyboardState {

        constructor(domElement : HTMLElement);

        pressed(keyDesc : string) : boolean;
    }

} 