/// <reference path="Scripts/input.ts"/>
/// <reference path="Scripts/ui.ts"/>
/// <reference path="Scripts/gamescreen.ts"/>

class Game {
    element: HTMLElement;
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;

    cube: THREE.Mesh;

    input: Input.InputState;

    screen: GameScreen.AbstractScreen;

    constructor(element: HTMLElement) {
        this.element = element;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, element.clientWidth / element.clientHeight, 0.1, 1000);
        
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(element.clientWidth, element.clientHeight);
        this.element.appendChild(this.renderer.domElement);

        this.input = new Input.InputState(this.element);

        this.renderer.domElement.setAttribute("tabindex", "0");
        this.renderer.domElement.focus();
        
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        this.camera.position.z = 5;

        this.screen = new GameScreen.AbstractScreen;
    }
    
    private render() {
        requestAnimationFrame(() => this.render());

        this.screen = this.screen.update(this.input, 0);

        if (!this.screen) {
            throw new Error("Critical error: Screen update method returned invalid value!");
        }

        this.screen.render(this.camera, this.camera);

        this.input.update();
    }

    start() {
        this.render();
    }
}

window.onload = () => {
    var el = document.getElementById('game');
   
    var game = new Game(el);
    game.start();

    var w = new Ui.Widget();
    w.draw();
};