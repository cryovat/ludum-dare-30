﻿class Game {
    element: HTMLElement;
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.Renderer;

    cube: THREE.Mesh;

    keyboard: THREEx.KeyboardState;

    constructor(element: HTMLElement) {
        this.element = element;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, element.clientWidth / element.clientHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(element.clientWidth, element.clientHeight);
        this.element.appendChild(this.renderer.domElement);

        this.keyboard = new THREEx.KeyboardState(this.renderer.domElement);

        this.renderer.domElement.setAttribute("tabindex", "0");
        this.renderer.domElement.focus();
        
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        this.camera.position.z = 5;
    }

    private render() {
        requestAnimationFrame(() => this.render());

        if (this.keyboard.pressed("left")) {
            this.cube.rotation.y += 0.1;
        } else if (this.keyboard.pressed("right")) {
            this.cube.rotation.y -= 0.1;
        }

        //this.cube.rotation.y += 0.01;

        this.renderer.render(this.scene, this.camera);
    }

    start() {
        this.render();
    }
}

window.onload = () => {
    var el = document.getElementById('game');
   
    var game = new Game(el);
    game.start();
};