/// <reference path="input.ts"/>

module GameScreen {

    export class AbstractScreen {

        bgScene: THREE.Scene;
        uiScene: THREE.Scene;

        constructor() {
            this.bgScene = new THREE.Scene();
            this.uiScene = new THREE.Scene();
        }

        update(input: Input.InputState, elapsedTime: number): AbstractScreen {

            if (input.mouse.click) {
                console.log("click!");
            }

            return this;
        }

        render(renderer: THREE.Renderer, sceneCamera: THREE.Camera, uiCamera: THREE.Camera) {
            renderer.render(this.bgScene, sceneCamera);
            //renderer.render(this.uiScene, uiCamera);
        }

    }

    export class PlanetScreen extends AbstractScreen {

        private planet: THREE.Mesh;

        constructor() {
            super();

            var planetSize = Math.min(1, Math.max(0.25, Math.random() * 1.5));

            var linesH = planetSize < 0.5 ? planetSize < 0.25 ? 6 : 8 : 12;
            var linesV = planetSize < 0.5 ? planetSize < 0.25 ? 4 : 6 : 10;

            var geometry = new THREE.SphereGeometry(planetSize, linesH, linesV);
            var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, shading: THREE.FlatShading });
           

            this.planet = new THREE.Mesh(geometry, material);

            this.bgScene.add(this.planet);
        }

        update(input: Input.InputState, elapsedTime: number): AbstractScreen {

            this.planet.rotateY(0.01);

            return super.update(input, elapsedTime);
        }
    }

}