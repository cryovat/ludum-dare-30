/// <reference path="Scripts/input.ts"/>
/// <reference path="Scripts/ui.ts"/>
/// <reference path="Scripts/gamescreen.ts"/>

class GameMain {
    element: HTMLElement;
    renderer: THREE.Renderer;

    bgCamera: THREE.Camera;
    uiCamera: THREE.Camera;

    input: Input.InputState;

    screen: GameScreen.AbstractScreen;

    constructor(element: HTMLElement) {

        var width = element.clientWidth;
        var height = element.clientHeight;
        var aspect = width / height;

        // Renderer initialization

        this.element = element;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.element.appendChild(this.renderer.domElement);

        this.renderer.domElement.setAttribute("tabindex", "0");
        this.renderer.domElement.focus();

        // Camera initialization

        this.bgCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.uiCamera = new THREE.OrthographicCamera(- width / 2, width / 2, height / 2, - height / 2, 1, 10);
        
        this.bgCamera.position.z = 3;
        this.uiCamera.position.z = 10;

        // Input initialization

        this.input = new Input.InputState(this.element);

        // Bootstrapping

        this.screen = new GameScreen.PlanetScreen();
    }
    
    private render() {
        requestAnimationFrame(() => this.render());

        this.screen = this.screen.update(this.input, 0);

        if (!this.screen) {
            throw new Error("Critical error: Screen update method returned invalid value!");
        }

        this.screen.render(this.renderer, this.bgCamera, this.uiCamera);

        this.input.update();
    }

    start() {
        this.render();
    }
}

window.onload = () => {
    var el = document.getElementById('game');
   
    var game = new GameMain(el);
    game.start();
};