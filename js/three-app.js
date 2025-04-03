import * as THREE from '../node_modules/three/build/three.module.js';

class PixelEffect {
    constructor() {
        this.container = document.getElementById('canvasContainer');
        this.image = this.container.querySelector('img');
        
        // Get parameters from data attributes
        this.gridSize = parseInt(this.container.dataset.grid) || 15;
        this.mouseStrength = parseFloat(this.container.dataset.mouse) || 0.13;
        this.distortStrength = parseFloat(this.container.dataset.strength) || 0.15;

        this.setup();
        this.createMesh();
        this.handleEvents();
        this.render();
    }

    setup() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(
            this.container.offsetWidth / -2,
            this.container.offsetWidth / 2,
            this.container.offsetHeight / 2,
            this.container.offsetHeight / -2,
            1,
            1000
        );
        this.camera.position.z = 1;

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Mouse coordinates
        this.mouse = new THREE.Vector2(0, 0);
    }

    createMesh() {
        // Create texture from image
        const loader = new THREE.TextureLoader();
        this.texture = loader.load(this.image.src);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.generateMipmaps = false;

        // Create geometry and material
        const geometry = new THREE.PlaneGeometry(
            this.container.offsetWidth,
            this.container.offsetHeight,
            this.gridSize,
            this.gridSize
        );

        const material = new THREE.MeshBasicMaterial({
            map: this.texture,
            wireframe: false
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    handleEvents() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        });
    }

    render() {
        // Update vertices based on mouse position
        const positions = this.mesh.geometry.attributes.position;
        const count = positions.count;

        for (let i = 0; i < count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const distance = Math.sqrt(
                Math.pow(x - this.mouse.x * this.container.offsetWidth / 2, 2) +
                Math.pow(y - this.mouse.y * this.container.offsetHeight / 2, 2)
            );
            
            const z = Math.exp(-distance * this.mouseStrength) * this.distortStrength * 100;
            positions.setZ(i, z);
        }

        positions.needsUpdate = true;

        // Render scene
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new PixelEffect();
}); 