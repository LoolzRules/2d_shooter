import {MainScene} from "./MainScene";
import {Bullet} from "./Bullet";
import {Player} from "./Player";

export namespace Weapon {

    export class Instance {

        readonly fireRate: number;
        readonly damage: number;
        readonly spread: number;
        readonly range: number;
        readonly textureKey: string;
        readonly bodyType: number;
        fire: (scene: MainScene) => void;
        private _millisUntilNextFire: number;
        private _player: Player;

        constructor(readonly type: Type, scene: MainScene, player: Player) {
            const props = Enum.get(type);

            this.fireRate = props.fireRate;
            this.damage = props.damage;
            this.spread = props.spread;
            this.range = props.range;
            this.textureKey = props.textureKey;
            this.bodyType = props.bodyType;

            this._sprite = scene.add.sprite(props.x, props.y, props.textureKey);
            this._bullets = scene.add.group();
            this._millisUntilNextFire = 0;
            this._player = player;
        }

        private _sprite: Phaser.GameObjects.Sprite;

        get sprite(): Phaser.GameObjects.Sprite {
            return this._sprite;
        }

        private _bullets: Phaser.GameObjects.Group;

        get bullets(): Phaser.GameObjects.Group {
            return this._bullets;
        }

        get canFire(): boolean {
            return this._millisUntilNextFire === 0;
        }

        update(delta) {
            this._millisUntilNextFire = Math.max(0, this._millisUntilNextFire - delta);
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
            textureKey: 'w_pistol',
            bodyType: 1,
            x: 20,
            y: 0,
        }],
        ["SILENCED_PISTOL", {
            fireRate: 200,
            damage: 10,
            spread: 0,
            range: 1000,
            textureKey: 'w_suppressed_pistol',
            bodyType: 1,
            x: 20,
            y: 0,
        }],
        ["UZI", {
            fireRate: 50,
            damage: 10,
            spread: 30,
            range: 1500,
            textureKey: 'w_uzi',
            bodyType: 1,
            x: 20,
            y: 0,
        }],
        ["ASSAULT_RIFLE", {
            fireRate: 30,
            damage: 10,
            spread: 8,
            range: 2000,
            textureKey: 'w_assault_rifle',
            bodyType: 0,
            x: 20,
            y: 0,
        }],
        ["SHOTGUN", {
            fireRate: 700,
            damage: 15,
            spread: 30,
            range: 750,
            textureKey: 'w_shotgun',
            bodyType: 0,
            x: 20,
            y: 0,
        }],
        ["TASER", {
            fireRate: 1500,
            damage: 0,
            spread: 2,
            range: 250,
            textureKey: 'w_taser',
            bodyType: 1,
            x: 20,
            y: 0,
        }],
        ["GAS_MARKER", {
            fireRate: 30,
            damage: 0,
            spread: 8,
            range: 2000,
            textureKey: 'w_gas_marker',
            bodyType: 0,
            x: 20,
            y: 0,
        }],
    ]);

    export class Builder {
        public static makeWeapon(type: Type, scene: MainScene, player: Player): Instance {
            let weapon = new Instance(type, scene, player);

            switch (type) {
                case "PISTOL":
                    weapon.fire = function (scene: MainScene) {
                        if (!this.canFire) return;

                        const spreadShift = (Math.random() - 0.5) * this.spread * Math.PI / 180;

                        const x = this._player.container.x;
                        const y = this._player.container.y;
                        const angle = this._player.container.rotation + spreadShift;
                        const type = Bullet.Enum.get(this.type);

                        const bullet = Bullet.Instance.makeBullet(x, y, angle, type, scene);
                        bullet.containerBody.setCollideWorldBounds(true);

                        scene.map.staticGroups.forEach((staticGroup) => {
                            scene.physics.add.collider(bullet.container, staticGroup, (blt, grp) => {
                                blt.destroy();
                            });
                        });

                        this.bullets.add(bullet.container);

                        this._millisUntilNextFire = this.fireRate;
                    };
                    break;
                case "SILENCED_PISTOL":
                    weapon.fire = function (scene: MainScene) {
                        if (!this.canFire) return;

                        const spreadShift = (Math.random() - 0.5) * this.spread * Math.PI / 180;

                        const x = this._player.container.x;
                        const y = this._player.container.y;
                        const angle = this._player.container.rotation + spreadShift;
                        const type = Bullet.Enum.get(this.type);

                        const bullet = Bullet.Instance.makeBullet(x, y, angle, type, scene);
                        bullet.containerBody.setCollideWorldBounds(true);

                        scene.map.staticGroups.forEach((staticGroup) => {
                            scene.physics.collide(bullet.container, staticGroup, (blt, grp) => {
                                blt.destroy();
                            });
                        });

                        this.bullets.add(bullet.container);

                        this._millisUntilNextFire = this.fireRate;
                    };
                    break;
                case "UZI":
                    weapon.fire = function (scene: MainScene) {
                        if (!this.canFire) return;

                        const spreadShift = (Math.random() - 0.5) * this.spread * Math.PI / 180;

                        const x = this._player.container.x;
                        const y = this._player.container.y;
                        const angle = this._player.container.rotation + spreadShift;
                        const type = Bullet.Enum.get(this.type);

                        const bullet = Bullet.Instance.makeBullet(x, y, angle, type, scene);
                        bullet.containerBody.setCollideWorldBounds(true);

                        scene.map.staticGroups.forEach((staticGroup) => {
                            scene.physics.collide(bullet.container, staticGroup, (blt, grp) => {
                                blt.destroy();
                            });
                        });

                        this.bullets.add(bullet.container);

                        this._millisUntilNextFire = this.fireRate;
                    };
                    break;
                case "ASSAULT_RIFLE":
                    weapon.fire = function (scene: MainScene) {
                        if (!this.canFire) return;

                        const spreadShift = (Math.random() - 0.5) * this.spread * Math.PI / 180;

                        const x = this._player.container.x;
                        const y = this._player.container.y;
                        const angle = this._player.container.rotation + spreadShift;
                        const type = Bullet.Enum.get(this.type);

                        const bullet = Bullet.Instance.makeBullet(x, y, angle, type, scene);
                        bullet.containerBody.setCollideWorldBounds(true);

                        scene.map.staticGroups.forEach((staticGroup) => {
                            scene.physics.collide(bullet.container, staticGroup, (blt, grp) => {
                                blt.destroy();
                            });
                        });

                        this.bullets.add(bullet.container);

                        this._millisUntilNextFire = this.fireRate;
                    };
                    break;
                case "SHOTGUN":
                    weapon.fire = function (scene: MainScene) {
                        if (!this.canFire) return;

                        const spreadShift = (Math.random() - 0.5) * this.spread * Math.PI / 180;

                        const x = this._player.container.x;
                        const y = this._player.container.y;
                        const angle = this._player.container.rotation + spreadShift;
                        const type = Bullet.Enum.get(this.type);

                        const bullet = Bullet.Instance.makeBullet(x, y, angle, type, scene);
                        bullet.containerBody.setCollideWorldBounds(true);

                        scene.map.staticGroups.forEach((staticGroup) => {
                            scene.physics.collide(bullet.container, staticGroup, (blt, grp) => {
                                blt.destroy();
                            });
                        });

                        this.bullets.add(bullet.container);

                        this._millisUntilNextFire = this.fireRate;
                    };
                    break;
                case "TASER":
                    weapon.fire = function (scene: MainScene) {
                        if (!this.canFire) return;

                        const spreadShift = (Math.random() - 0.5) * this.spread * Math.PI / 180;

                        const x = this._player.container.x;
                        const y = this._player.container.y;
                        const angle = this._player.container.rotation + spreadShift;
                        const type = Bullet.Enum.get(this.type);

                        const bullet = Bullet.Instance.makeBullet(x, y, angle, type, scene);
                        bullet.containerBody.setCollideWorldBounds(true);

                        scene.map.staticGroups.forEach((staticGroup) => {
                            scene.physics.collide(bullet.container, staticGroup, (blt, grp) => {
                                blt.destroy();
                            });
                        });

                        this.bullets.add(bullet.container);

                        this._millisUntilNextFire = this.fireRate;
                    };
                    break;
                case "GAS_MARKER":
                    weapon.fire = function (scene: MainScene) {
                        if (!this.canFire) return;

                        const spreadShift = (Math.random() - 0.5) * this.spread * Math.PI / 180;

                        const x = this._player.container.x;
                        const y = this._player.container.y;
                        const angle = this._player.container.rotation + spreadShift;
                        const type = Bullet.Enum.get(this.type);

                        const bullet = Bullet.Instance.makeBullet(x, y, angle, type, scene);
                        bullet.containerBody.setCollideWorldBounds(true);

                        scene.map.staticGroups.forEach((staticGroup) => {
                            scene.physics.collide(bullet.container, staticGroup, (blt, grp) => {
                                blt.destroy();
                            });
                        });

                        this.bullets.add(bullet.container);

                        this._millisUntilNextFire = this.fireRate;
                    };
                    break;
            }

            return weapon;
        }
    }

}