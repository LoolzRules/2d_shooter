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
        private speed: number;
        private radius: number;

        private constructor(type: Props) {
            this.textureKey = type.textureKey;
            this.speed = type.speed;
            this.radius = type.radius
        }

        private _container: Phaser.GameObjects.Container;

        get container(): Phaser.GameObjects.Container {
            return this._container;
        }

        get containerBody(): Phaser.Physics.Arcade.Body {
            return (<Phaser.Physics.Arcade.Body> this._container.body);
        }

        public static makeBullet(x: number,
                                 y: number,
                                 angle: number,
                                 type: Props,
                                 scene: MainScene): Instance {
            let bullet = new Instance(type);

            bullet.body = scene.add.image(0, 0, type.textureKey)
                .setOrigin(0.5);
            bullet._container = scene.add.container(x, y);
            bullet._container.add(bullet.body);

            scene.physics.add.existing(bullet._container);
            bullet.containerBody.setCircle(type.radius);

            bullet._container.setRotation(angle);
            bullet.containerBody.setVelocity(
                Math.cos(angle) * bullet.speed,
                Math.sin(angle) * bullet.speed
            );

            return bullet;
        }

    }

    export const Enum = new Map<Weapon.Type, Props>([
        ["PISTOL", {
            textureKey: 'b_pistol',
            speed: 600,
            radius: 1,
        }],
        ["SILENCED_PISTOL", {
            textureKey: 'b_pistol',
            speed: 600,
            radius: 1,
        }],
        ["UZI", {
            textureKey: 'b_uzi',
            speed: 600,
            radius: 1,
        }],
        ["ASSAULT_RIFLE", {
            textureKey: 'b_assault_rifle',
            speed: 600,
            radius: 1,
        }],
        ["SHOTGUN", {
            textureKey: 'b_shotgun',
            speed: 600,
            radius: 1,
        }],
        ["TASER", {
            textureKey: 'b_taser',
            speed: 600,
            radius: 1,
        }],
        ["GAS_MARKER", {
            textureKey: 'b_gas_marker',
            speed: 600,
            radius: 2,
        }],
    ]);
}




