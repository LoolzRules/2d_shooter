import {MainScene} from "./MainScene";
import {Raycaster} from "./Raycaster";
import {Point} from "./GameMap";
import {Body, BodyEnum} from "./Body";
import {Head, HeadEnum} from "./Head";
import {Weapon} from "./Weapon";
import {SPEED_COEFF} from "./Constants";

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
        this.baseSpeed = 200;

        this._container = scene.add.container(x, y);
        this.body = Body.makeBody(BodyEnum.get("NONE"), scene);
        this.head = Head.makeHead(HeadEnum.get("NONE"), scene);
        this.weapon = Weapon.Builder.makeWeapon("ASSAULT_RIFLE", scene, this);
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

    update(w: boolean,
           a: boolean,
           s: boolean,
           d: boolean,
           r: boolean,
           pointerX: number,
           pointerY: number,
           justPressed: boolean,
           isPressed: boolean,
           delta: number): void {

        // Position
        this.modifyPosition(w, a, s, d, delta);
        // Angle
        if (pointerX !== null && pointerY !== null) this.modifyAngle(pointerX, pointerY);
        // FOV
        this.fovPolygon.destroy();
        this.makeRaycast();
        // Weapon
        this.weapon.update(r, justPressed, isPressed, delta);
    }

    modifyPosition(w, a, s, d, delta): void {
        if (d && !a) this.containerBody.setVelocityX(this.speed * SPEED_COEFF / delta);
        else if (a && !d) this.containerBody.setVelocityX(-this.speed * SPEED_COEFF / delta);
        else this.containerBody.setVelocityX(0);

        if (s && !w) this.containerBody.setVelocityY(this.speed * SPEED_COEFF / delta);
        else if (w && !s) this.containerBody.setVelocityY(-this.speed * SPEED_COEFF / delta);
        else this.containerBody.setVelocityY(0);

        this.containerBody.velocity.normalize().scale(this.speed * SPEED_COEFF / delta);
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


    get container(): Phaser.GameObjects.Container {
        return this._container;
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

    setBodyTexture(n: number): void {
        this.body.setSprite(n);
    }
}