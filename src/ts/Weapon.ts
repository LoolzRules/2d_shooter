export interface WeaponProps {
    fireRate: number,
    damage: number,
    spread: number,
    range: number,
    textureKey: string,
    bodyType: number,
    x: number,
    y: number,
}

export class Weapon {
    private _sprite: Phaser.GameObjects.Sprite;

    private constructor(readonly fireRate: number,
                        readonly damage: number,
                        readonly spread: number,
                        readonly range: number,
                        readonly textureKey: string,
                        readonly bodyType: number,
                        readonly x: number,
                        readonly y: number) {
    }

    public static makeWeapon(type: WeaponProps, scene: Phaser.Scene): Weapon {
        let weapon = new Weapon(type.fireRate, type.damage,
            type.spread, type.range, type.textureKey,
            type.bodyType, type.x, type.y);
        weapon._sprite = scene.add.sprite(weapon.x, weapon.y, weapon.textureKey);
        return weapon;
    }

    get sprite(): Phaser.GameObjects.Sprite {
        return this._sprite;
    }
}

export const WeaponEnum = new Map<string, WeaponProps>([
    ["PISTOL", {
        fireRate: 2,
        damage: 15,
        spread: 5,
        range: 1000,
        textureKey: 'w_pistol',
        bodyType: 1,
        x: 20,
        y: 0,
    }],
    ["SILENCED_PISTOL", {
        fireRate: 2,
        damage: 10,
        spread: 0,
        range: 1000,
        textureKey: 'w_suppressed_pistol',
        bodyType: 1,
        x: 20,
        y: 0,
    }],
    ["UZI", {
        fireRate: 4,
        damage: 10,
        spread: 30,
        range: 1500,
        textureKey: 'w_uzi',
        bodyType: 1,
        x: 20,
        y: 0,
    }],
    ["ASSAULT_RIFLE", {
        fireRate: 3,
        damage: 10,
        spread: 8,
        range: 2000,
        textureKey: 'w_assault_rifle',
        bodyType: 0,
        x: 20,
        y: 0,
    }],
    ["SHOTGUN", {
        fireRate: 1,
        damage: 15,
        spread: 30,
        range: 750,
        textureKey: 'w_shotgun',
        bodyType: 0,
        x: 20,
        y: 0,
    }],
    ["TASER", {
        fireRate: 1,
        damage: 0,
        spread: 2,
        range: 250,
        textureKey: 'w_taser',
        bodyType: 1,
        x: 20,
        y: 0,
    }],
    ["GAS_MARKER", {
        fireRate: 2,
        damage: 0,
        spread: 8,
        range: 2000,
        textureKey: 'w_gas_marker',
        bodyType: 0,
        x: 20,
        y: 0,
    }],
]);