import {MainScene} from "./MainScene";
import {Bullet} from "./Bullet";
import {Player} from "./Player";
import {SPEED_COEFF} from "./Constants";

export namespace Weapon {

    export class Instance {

        readonly fireRate: number;
        readonly damage: number;
        readonly spread: number;
        readonly range: number;
        readonly isAutomatic: boolean;
        readonly clipSize: number;
        readonly bulletsPerShot: number;
        readonly reloadTime: number;
        readonly textureKey: string;
        readonly bodyType: number;

        private timesFired: number;
        private scene: MainScene;
        private _millisUntilNextFire: number;
        private _player: Player;
        private _sprite: Phaser.GameObjects.Sprite;
        private _bullets: Array<Bullet.Instance>;
        private _bulletsGroup: Phaser.GameObjects.Group;
        private _tipShiftMagnitude: number;
        private _tipShiftAngle: number;

        constructor(readonly type: Type, scene: MainScene, player: Player) {
            const props = Enum.get(type);

            this.fireRate = props.fireRate;
            this.damage = props.damage;
            this.spread = props.spread;
            this.range = props.range;
            this.isAutomatic = props.isAutomatic;
            this.clipSize = props.clipSize;
            this.bulletsPerShot = props.bulletsPerShot;
            this.reloadTime = props.reloadTime;
            this.textureKey = props.textureKey;
            this.bodyType = props.bodyType;
            this.timesFired = 0;
            this.scene = scene;
            this._sprite = scene.add.sprite(props.x, props.y, props.textureKey)
                .setOrigin(1, 0.5);
            this._bulletsGroup = scene.add.group();
            this._bullets = [];
            this._millisUntilNextFire = 0;
            this._player = player;

            player.setBodyTexture(this.bodyType);

            this._tipShiftMagnitude = Phaser.Math.Distance.Between(
                player.container.x,
                player.container.y,
                props.x,
                props.y
            );
            this._tipShiftAngle = Phaser.Math.Angle.Between(
                player.container.x,
                player.container.y,
                props.x,
                props.y
            );
        }

        update(reloadPressed, justPressed, isPressed, delta) {
            if (reloadPressed) {
                this.reload();
                return;
            }

            this._millisUntilNextFire = Math.max(0, this._millisUntilNextFire - delta);
            if (this._millisUntilNextFire === 0) this._sprite.clearTint();

            this._bullets = this._bullets.filter((bullet) => {
                // Case 1: bullet was destroyed upon collision
                if (!bullet.containerBody) return false;

                // Case 2: check if bullet got out of range
                const dist: number = Phaser.Math.Distance.Between(
                    bullet.originX,
                    bullet.originY,
                    bullet.containerBody.position.x,
                    bullet.containerBody.position.y
                );
                const shouldBeDestroyed: boolean = dist > this.range;
                if (shouldBeDestroyed)
                    bullet.container.destroy();
                else
                    bullet.containerBody.setVelocity(
                        Math.cos(bullet.angle) * bullet.speed * SPEED_COEFF / delta,
                        Math.sin(bullet.angle) * bullet.speed * SPEED_COEFF / delta,
                    );
                return !shouldBeDestroyed;
            });

            if (justPressed || isPressed) this.fire(justPressed, isPressed);
        }

        private reload(): void {
            this._millisUntilNextFire = this.reloadTime;
            this._sprite.setTintFill(0xff0000);
            this.timesFired = 0;
        }

        private fire = function (justPressed: boolean, isPressed: boolean) {
            if (!this.canFire) return;
            if (!justPressed && isPressed && !this.isAutomatic) return;

            for (let i = 0; i < this.bulletsPerShot; i++) {
                // Add spread
                const spreadShift = (Math.random() - 0.5) * this.spread * Math.PI / 180;
                const angle = this._player.container.rotation + spreadShift;

                const bullet = Bullet.Instance.makeBullet(this.firePointX, this.firePointY,
                    angle, this.type, this.scene);
                bullet.containerBody.setCollideWorldBounds(false);

                this.scene.map.staticGroups.forEach((staticGroup, key) => {
                    // TODO: add group interactions by key
                    this.scene.physics.add.collider(bullet.container, staticGroup,
                        // TODO: set particle bounds by group member? Not sure
                        (bullet: Phaser.GameObjects.Image, groupMember) => {
                            this.scene.ricochetParticleEmitter.emitParticleAt(
                                bullet.x,
                                bullet.y,
                                Phaser.Math.Between(2, 5)
                            );
                            bullet.destroy();
                        });
                });

                this.bulletsGroup.add(bullet.container);
                this._bullets.push(bullet);

                this._millisUntilNextFire = this.fireRate;
            }
            this.timesFired++;
        };

        get sprite(): Phaser.GameObjects.Sprite {
            return this._sprite;
        }

        get bulletsGroup(): Phaser.GameObjects.Group {
            return this._bulletsGroup;
        }

        private get canFire(): boolean {
            return (this._millisUntilNextFire === 0 && this.timesFired < this.clipSize);
        }

        private get firePointX(): number {
            return this._player.container.x +
                this._tipShiftMagnitude *
                Math.cos(this._player.container.rotation + this._tipShiftAngle);
        }

        private get firePointY(): number {
            return this._player.container.y +
                this._tipShiftMagnitude *
                Math.sin(this._player.container.rotation + this._tipShiftAngle);
        }
    }

    export type Type =
        "PISTOL" |
        "SILENCED_PISTOL" |
        "UZI" |
        "ASSAULT_RIFLE" |
        "SHOTGUN" |
        "TASER" |
        "GAS_MARKER";

    export interface Props {
        fireRate: number,
        damage: number,
        spread: number,
        range: number,
        isAutomatic: boolean,
        clipSize: number,
        bulletsPerShot: number,
        reloadTime: number,
        textureKey: string,
        bodyType: number,
        x: number,
        y: number,
    }

    export const Enum = new Map<Type, Props>([
        ["PISTOL", {
            fireRate: 200,
            damage: 15,
            spread: 5,
            range: 1000,
            isAutomatic: false,
            clipSize: 10,
            bulletsPerShot: 1,
            reloadTime: 1000,
            textureKey: 'w_pistol',
            bodyType: 1,
            x: 60,
            y: 4,
        }],
        ["SILENCED_PISTOL", {
            fireRate: 200,
            damage: 10,
            spread: 0,
            range: 1000,
            isAutomatic: false,
            clipSize: 10,
            bulletsPerShot: 1,
            reloadTime: 1100,
            textureKey: 'w_suppressed_pistol',
            bodyType: 1,
            x: 80,
            y: 4,
        }],
        ["UZI", {
            fireRate: 50,
            damage: 10,
            spread: 15,
            range: 1500,
            isAutomatic: true,
            clipSize: 20,
            bulletsPerShot: 1,
            reloadTime: 1500,
            textureKey: 'w_uzi',
            bodyType: 1,
            x: 60,
            y: 4,
        }],
        ["ASSAULT_RIFLE", {
            fireRate: 90,
            damage: 10,
            spread: 2,
            range: 2000,
            isAutomatic: true,
            clipSize: 30,
            bulletsPerShot: 1,
            reloadTime: 2000,
            textureKey: 'w_assault_rifle',
            bodyType: 0,
            x: 72,
            y: 0,
        }],
        ["SHOTGUN", {
            fireRate: 700,
            damage: 15,
            spread: 20,
            range: 750,
            isAutomatic: false,
            clipSize: 5,
            bulletsPerShot: 8,
            reloadTime: 4000,
            textureKey: 'w_shotgun',
            bodyType: 0,
            x: 65,
            y: 0,
        }],
        ["TASER", {
            fireRate: 1500,
            damage: 0,
            spread: 2,
            range: 250,
            isAutomatic: false,
            clipSize: 2,
            bulletsPerShot: 1,
            reloadTime: 3000,
            textureKey: 'w_taser',
            bodyType: 1,
            x: 60,
            y: 4,
        }],
        ["GAS_MARKER", {
            fireRate: 100,
            damage: 0,
            spread: 5,
            range: 2000,
            isAutomatic: true,
            clipSize: 200,
            bulletsPerShot: 1,
            reloadTime: 10000,
            textureKey: 'w_gas_marker',
            bodyType: 0,
            x: 65,
            y: 0,
        }],
    ]);

    export class Builder {
        public static makeWeapon(type: Type, scene: MainScene, player: Player): Instance {
            return new Instance(type, scene, player);
        }
    }

}