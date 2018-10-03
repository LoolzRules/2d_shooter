import {MainScene} from "./MainScene";
import {Raycaster} from "./Raycaster";
import {Point} from "./GameMap";
import {Body, BodyEnum} from "./Body";
import {Head, HeadEnum} from "./Head";
import {Weapon} from "./Weapon";

export class Player {

    private readonly scene: MainScene;
    private readonly body: Body;
    private readonly weapon: Weapon.Instance;
    private readonly head: Head;
    private readonly _container: Phaser.GameObjects.Container;
    private readonly raycaster: Raycaster;

    private angle: number;
    private baseSpeed: number;

    private fovPolygon: Phaser.GameObjects.Polygon;

    constructor(scene: MainScene, x: number, y: number, raycaster: Raycaster) {
        this.scene = scene;
        this.angle = 0;
        this.baseSpeed = 300;

        this.body = Body.makeBody(BodyEnum.get("NONE"), scene);
        this.head = Head.makeHead(HeadEnum.get("NONE"), scene);
        this.weapon = Weapon.Builder.makeWeapon("PISTOL", scene, this);

        this._container = scene.add.container(x, y);
        this._container
            .add([this.body.sprite, this.weapon.sprite, this.head.sprite])
            .setDepth(100);

        scene.physics.add.existing(this._container);
        this.containerBody
            .setCircle(36, -36, -36)
            .setCollideWorldBounds(true);

        this.raycaster = raycaster;
        this.makeRaycast();
    }

    get container(): Phaser.GameObjects.Container {
        return this._container;
    }

    update(w, a, s, d, x, y, delta): void {
        this.fovPolygon.destroy();
        this.modifyPosition(w, a, s, d, delta);
        if (x !== null && y !== null) this.modifyAngle(x, y);
        this.makeRaycast();
        this.weapon.update(delta);
    }

    modifyPosition(w, a, s, d, delta): void {
        const COEFF = 20;

        if (d && !a) this.containerBody.setVelocityX(this.speed * COEFF / delta);
        else if (a && !d) this.containerBody.setVelocityX(-this.speed * COEFF / delta);
        else this.containerBody.setVelocityX(0);

        if (s && !w) this.containerBody.setVelocityY(this.speed * COEFF / delta);
        else if (w && !s) this.containerBody.setVelocityY(-this.speed * COEFF / delta);
        else this.containerBody.setVelocityY(0);

        this.containerBody.velocity.normalize().scale(this.speed * COEFF / delta);
    }

    modifyAngle(x, y): void {

        this.angle = Phaser.Math.Angle.Between(
            this.container.x + this.scene.cameraProps.offsetX,
            this.container.y,
            x,
            y
        );

        this._container.setRotation(this.angle);
    }

    makeRaycast(): void {
        const fovPolygonPoints: Array<Point> = this.raycaster.generateIntersectionPoints(
            this._container.x,
            this._container.y,
            this.angle,
            this.fov
        );
        this.fovPolygon = this.scene.add.polygon(0, 0, fovPolygonPoints, 0xffffff, 0.3)
            .setOrigin(0);
    }

    get containerBody(): Phaser.Physics.Arcade.Body {
        return (<Phaser.Physics.Arcade.Body> this._container.body);
    }

    get fov(): number {
        return this.head.fov / 180 * Math.PI;
    }

    get speed(): number {
        return this.baseSpeed * this.body.speedModifier;
    }

    get armor(): number {
        return this.body.armor + this.head.armor;
    }
}