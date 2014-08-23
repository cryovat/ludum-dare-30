/// <reference path="input.ts"/>

module GameScreen {

    export class AbstractScreen {

        update(input: Input.InputState, elapsedTime: number): AbstractScreen {

            if (input.mouse.click) {
                console.log("click!");
            }

            return this;
        }

        render(sceneCamera : THREE.Camera, uiCamera : THREE.Camera) {
        }

    }

}