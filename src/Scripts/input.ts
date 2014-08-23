module Input {

    export class MouseState {

        public x: number;
        public y: number;

        public down: boolean;
        public click: boolean;

        constructor(domElement: HTMLElement) {

            domElement.addEventListener("mousemove", (ev: MouseEvent) => {

                var bounds = domElement.getBoundingClientRect(),
                    x = ev.x - bounds.left - domElement.clientLeft + domElement.scrollLeft,
                    y = ev.y - bounds.top - domElement.clientTop + domElement.scrollTop;

            });

            domElement.addEventListener("mousedown", (ev: MouseEvent) => {
                this.down = true;
                this.click = false;
            });

            domElement.addEventListener("mouseup", (ev: MouseEvent) => {
                this.click = this.down;
                this.down = false;
            });

            domElement.addEventListener("mouseout", (ev: PointerEvent) => {
                this.down = false;
                this.click = false;    
            });
        }

        public update(): void {
            this.click = false;
        }
    }

    export class InputState {

        public keyboard: THREEx.KeyboardState;
        public mouse: MouseState;

        constructor(domElement: HTMLElement) {
            this.keyboard = new THREEx.KeyboardState(domElement);
            this.mouse = new MouseState(domElement);
        }

        public update(): void {
            this.mouse.update();
        }
    }
}