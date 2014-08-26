// Based on http://threejs.org/examples/webgl_particles_sprites.html

class Starfield {

    private container: HTMLDivElement;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;

    private renderer : THREE.Renderer;

    constructor(document: HTMLDocument, private clouds : number = 5) {

        this.container = document.createElement("div");
        this.container.className = "cluster";
        document.body.appendChild(this.container);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
        this.camera.position.z = 1000;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);

        var geometry = new THREE.Geometry();

        for (var i = 0; i < 1000; i++) {

            var vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 2000 - 1000;

            geometry.vertices.push(vertex);

        }

        var tex = THREE.ImageUtils.loadTexture("Content/star.png");

        var sprite = tex;
        var size = 10;

        var material = new THREE.PointCloudMaterial({ size: size, map: tex, blending: THREE.AdditiveBlending, depthTest: false, transparent: true });
        material.color.setHSL(1, 0.2, 0.5);

        for (i = 0; i < clouds; i++) {

            var cloud = new THREE.PointCloud(geometry, material);

            cloud.rotation.x = Math.random() * 6;
            cloud.rotation.y = Math.random() * 6;
            cloud.rotation.z = Math.random() * 6;

            this.scene.add(cloud);
        }

        this.renderer = new THREE.WebGLRenderer({ clearAlpha: 1 });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        requestAnimationFrame(() => this.render());

        window.addEventListener("resize", () => {

            var halfX = window.innerWidth / 2;
            var halfY = window.innerHeight / 2;

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);

        }, false);

    }

    render() {

        var time = Date.now() * 0.00005;

        for (var i = 0; i < this.scene.children.length; i++) {

            var obj = this.scene.children[i];

            if (obj instanceof THREE.PointCloud) {
                obj.rotation.y = time * 0.05 * (i < this.clouds / 2 ? i + 1 : - (i + 1));
            }
        };


        this.renderer.render(this.scene, this.camera);



        requestAnimationFrame(() => this.render());

    }

}