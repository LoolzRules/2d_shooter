import {MainScene} from "./MainScene";
import {Raycaster} from "./Raycaster";
import {Point} from "./GameMap";
import {Body, BodyEnum} from "./Body";
import {Head, HeadEnum} from "./Head";
import {Weapon, WeaponEnum} from "./Weapon";

export class Player {

    private readonly scene: MainScene;
    private readonly body: Body;
    private readonly weapon: Weapon;
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

        this.body = Body.makeBody(BodyEnum.get("LIGHT"), scene);
        this.weapon = Weapon.makeWeapon(WeaponEnum.get("ASSAULT_RIFLE"), scene);
        this.head = Head.makeHead(HeadEnum.get("NONE"), scene);

        this._container = scene.add.container(x, y);
        this._container
            .add([this.body.sprite, this.weapon.sprite, this.head.sprite])
            .setDepth(100);

        scene.physics.world.enableBody(this._container);
        this.containerBody
            .setCircle(36, -36, -36)
            .setCollideWorldBounds(true);

        this.raycaster = raycaster;
        this.makeRaycast();
    }

    update(w, a, s, d, x, y): void {
        this.modifyAngle(x, y);
        this.modifyPosition(w, a, s, d);
        this.fovPolygon.destroy();
        this.makeRaycast();
    }

    modifyPosition(w, a, s, d) {
        if (d && !a) this.containerBody.setVelocityX(this.speed);
        else if (a && !d) this.containerBody.setVelocityX(-this.speed);
        else this.containerBody.setVelocityX(0);

        if (s && !w) this.containerBody.setVelocityY(this.speed);
        else if (w && !s) this.containerBody.setVelocityY(-this.speed);
        else this.containerBody.setVelocityY(0);

        // // Smooth as hell but no collisions
        // if ( d && !a ) {
        //     this.container.x += this.speed / 60;
        //     this.container.body.x += this.speed / 60;
        // }
        // else if ( a && !d ) {
        //     this.container.x -= this.speed / 60;
        //     this.container.body.x -= this.speed / 60;
        // }
        //
        // if ( s && !w ) {
        //     this.container.y += this.speed / 60;
        //     this.container.body.y += this.speed / 60;
        // } else if ( w && !s ) {
        //     this.container.y -= this.speed / 60;
        //     this.container.body.y -= this.speed / 60;
        // }
    }

    modifyAngle(x, y) {

        this.angle = Phaser.Math.Angle.Between(
            this._container.x + this.scene.cameraProps.offset,
            this._container.y + 0,
            x, y
        );

        // console.log(
        //     this.container.x + this.scene.cameraProps.offset,
        //     this.container.y + 0,
        //     x,
        //     y,
        //     this.container.body.touching.none
        // );

        this._container.setRotation(this.angle);
    }

    makeRaycast() {
        const fovPolygonPoints: Array<Point> = this.raycaster.generateIntersectionPoints(
            this._container.x,
            this._container.y,
            this.angle,
            this.fov
        );
        this.fovPolygon = this.scene.add.polygon(0, 0, fovPolygonPoints, 0xffffff, 0.3)
            .setOrigin(0);
    }

    get container() {
        return this._container;
    }

    get containerBody(): Phaser.Physics.Arcade.Body {
        return (<Phaser.Physics.Arcade.Body> this._container.body);
    }

    get fov(): number {
        return this.head.fov;
    }

    get speed(): number {
        return this.baseSpeed * this.body.speedModifier;
    }

    get armor(): number {
        return this.body.armor + this.head.armor;
    }
}