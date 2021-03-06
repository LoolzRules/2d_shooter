import {GameMap} from "./GameMap";
import {Player} from "./Player";
import {Raycaster} from "./Raycaster";
import assetInfo from "./assetInfo.json";

interface ViewportSize {
    height: number,
    width: number
}

interface CameraProps {
    size: number,
    offsetX: number,
    zoom: number,
    lerp: number,
    minimapCoefficient: number,
}

interface Controls {
    w: Phaser.Input.Keyboard.Key,
    a: Phaser.Input.Keyboard.Key,
    s: Phaser.Input.Keyboard.Key,
    d: Phaser.Input.Keyboard.Key,
    r: Phaser.Input.Keyboard.Key,
    pointer: Phaser.Input.Pointer,
}


export class MainScene extends Phaser.Scene {

    private maincam: Phaser.Cameras.Scene2D.Camera;
    private minimap: Phaser.Cameras.Scene2D.Camera;
    private player: Player;
    private fps: Phaser.GameObjects.Text;
    public cameraProps: CameraProps;

    readonly boundX: number;
    readonly boundY: number;
    readonly boundW: number;
    readonly boundH: number;

    private _map: GameMap;

    private viewportSize: ViewportSize;
    private controls: Controls;
    private _ricochetParticleEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {

        const maincamSize = window.innerHeight;
        const maincamOffset = (window.innerWidth - window.innerHeight) / 2;

        super({
            key: 'main',
            active: true,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: true
                }
            },
        });

        this.viewportSize = {
            height: window.innerHeight,
            width: window.innerWidth,
        };
        this.cameraProps = {
            size: maincamSize,
            offsetX: maincamOffset,
            zoom: Math.round(maincamSize / 70) / 10,
            lerp: 1,
            minimapCoefficient: maincamOffset / maincamSize,
        };

        this.boundX = -900;
        this.boundY = -600;
        this.boundW = -2 * this.boundX;
        this.boundH = -2 * this.boundY;

    }

    preload() {
        const current_path = window.location.pathname;
        const current_url = window.location.href;
        const n = current_url.lastIndexOf(current_path);
        const ASSET_PATH = current_url.slice(0, n) + '/assets';

        this.load.setBaseURL(ASSET_PATH);

        const loadingText = this.make.text({
            x: this.viewportSize.width / 2,
            y: this.viewportSize.height / 2 - 25,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        }).setOrigin(0.5, 0.5);

        const assetText = this.make.text({
            x: this.viewportSize.width / 2,
            y: this.viewportSize.height / 2 + 5,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        }).setOrigin(0.5, 0.5);

        this.load.on('progress', function (value): void {
            loadingText.setText(`Loading: ${Math.round(value * 10000) / 100}`);
        });

        this.load.on('fileprogress', function (file): void {
            assetText.setText(`Loading asset: .../${file.url}`);
        });

        this.load.on('complete', function (): void {
            loadingText.destroy();
            assetText.destroy();
        });

        Object.keys(assetInfo).forEach((fileType: string) => {
            Object.keys(assetInfo[fileType]).forEach((assetFolder: string) => {
                assetInfo[fileType][assetFolder].forEach((key: string) => {
                    this.load[fileType](`${key}`, `${assetFolder}/${key}.${fileType}`);
                });
            });
        });
    };

    create() {
        // Adding input
        this.controls = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            r: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
            pointer: this.input.activePointer,
        };

        // Building maps
        this._map = new GameMap(this, this.cache.json.get('1'));

        // Enabling world bounds
        this.physics.world.setBounds(
            this.boundX, this.boundY,
            this.boundW, this.boundH,
            true, true, true, true);

        // Adding player
        this.player = new Player(this, 0, 0, new Raycaster(this._map));

        // Enabling player collisions
        this._map.staticGroups.forEach((group, key) => {
            this.physics.world.addCollider(
                this.player.container,
                this._map.staticGroups.get(key));
        });

        // Enabling particle emitter manager
        this._ricochetParticleEmitter = this.add.particles('p_ricochet').createEmitter({
            on: false,
            angle: {min: 0, max: 360},
            speed: {start: 10, end: 0, ease: 'Back.easeOut'},
            scale: {min: 0.9, max: 1},
            alpha: {start: 1, end: 0},
            lifespan: 500,
            maxParticles: 60,
        });

        // Setting up main camera
        this.maincam = this.cameras.main;
        this.setupMainCamera();

        // Adding minimap
        this.minimap = this.cameras.add();
        this.setupMinimap();

        this.fps = this.make.text({
            x: 0,
            y: 0,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
    };

    update(time, delta) {
        this.fps.text = (1 / delta * 1000).toFixed(2);
        this.player.update(
            this.controls.w.isDown,
            this.controls.a.isDown,
            this.controls.s.isDown,
            this.controls.d.isDown,
            this.controls.r.isDown,
            this.controls.pointer.justMoved ? (this.controls.pointer.x + this.cameras.main.scrollX) : null,
            this.controls.pointer.justMoved ? (this.controls.pointer.y + this.cameras.main.scrollY) : null,
            this.controls.pointer.justDown,
            this.controls.pointer.isDown,
            delta,
        );
    };

    setupMainCamera() {
        this.maincam
            .startFollow(this.player.container, false, this.cameraProps.lerp)
            .setName('main')
            .setZoom(this.cameraProps.zoom)
            .setBounds(this.boundX - this.cameraProps.size,
                this.boundY - this.cameraProps.size,
                this.boundW + 2 * this.cameraProps.size,
                this.boundH + 2 * this.cameraProps.size)
            .setSize(this.cameraProps.size, this.cameraProps.size)
            .setPosition(this.cameraProps.offsetX, 0);
    };

    setupMinimap() {
        let coeff = this.cameraProps.minimapCoefficient;
        this.minimap
            .startFollow(this.player.container, false, this.cameraProps.lerp)
            .setName('mini')
            .setZoom(coeff * this.cameraProps.zoom)
            .setBounds(this.boundX - this.cameraProps.size,
                this.boundY - this.cameraProps.size,
                this.boundW + 2 * this.cameraProps.size,
                this.boundH + 2 * this.cameraProps.size)
            .setSize(coeff * this.cameraProps.size, coeff * this.cameraProps.size)
            .setPosition(window.innerWidth - this.cameraProps.offsetX, 0);
    };

    get map(): GameMap {
        return this._map;
    }

    get ricochetParticleEmitter(): Phaser.GameObjects.Particles.ParticleEmitter {
        return this._ricochetParticleEmitter;
    }

}