import {MainScene} from "./MainScene";
import {Weapon} from "./Weapon";

export namespace Bullet {

    export interface Props {
        textureKey: string,
        speed: number,
        radius: number
    }

    export class Instance {

        private body: Phaser.GameObjects.Image;
        private textureKey: string;
        private radius: number;
        public originX: number;
        public originY: number;

        private _angle: number;
        private _speed: number;
        private _container: Phaser.GameObjects.Container;

        private constructor(props: Props) {
            this.textureKey = props.textureKey;
            this._speed = props.speed;
            this.radius = props.radius;
        }

        get container(): Phaser.GameObjects.Container {
            return this._container;
        }

        get containerBody(): Phaser.Physics.Arcade.Body {
            return (<Phaser.Physics.Arcade.Body> this._container.body);
        }

        get speed(): number {
            return this._speed;
        }

        get angle(): number {
            return this._angle;
        }

        public static makeBullet(x: number,
                                 y: number,
                                 angle: number,
                                 type: Weapon.Type,
                                 scene: MainScene): Instance {
            const props = Bullet.Enum.get(type);
            let bullet = new Instance(props);

            bullet.originX = x;
            bullet.originY = y;
            bullet._angle = angle;

            bullet.body = scene.add.image(0, 0, props.textureKey)
                .setOrigin(0.5);
            bullet._container = scene.add.container(x, y);
            bullet._container.add(bullet.body);

            scene.physics.add.existing(bullet._container);
            bullet.containerBody.setCircle(
                props.radius,
                -props.radius / 2,
                -props.radius / 2
            );

            bullet._container.setRotation(angle).setDepth(100);

            return bullet;
        }

    }

    export const Enum = new Map<Weapon.Type, Props>([
        ["PISTOL", {
            textureKey: 'b_pistol',
            speed: 800,
            radius: 1,
        }],
        ["SILENCED_PISTOL", {
            textureKey: 'b_pistol',
            speed: 800,
            radius: 1,
        }],
        ["UZI", {
            textureKey: 'b_uzi',
            speed: 800,
            radius: 1,
        }],
        ["ASSAULT_RIFLE", {
            textureKey: 'b_assault_rifle',
            speed: 800,
            radius: 1,
        }],
        ["SHOTGUN", {
            textureKey: 'b_shotgun',
            speed: 800,
            radius: 1,
        }],
        ["TASER", {
            textureKey: 'b_taser',
            speed: 800,
            radius: 1,
        }],
        ["GAS_MARKER", {
            textureKey: 'b_gas_marker',
            speed: 800,
            radius: 2,
        }],
    ]);
}




