export interface HeadProps {
    armor: number,
    fov: number,
    textureKey: string
}

export class Head {
    private _sprite: Phaser.GameObjects.Sprite;

    private constructor(readonly armor: number,
                        readonly fov: number,
                        readonly textureKey: string) {
    }

    public static makeHead(type: HeadProps, scene: Phaser.Scene): Head {
        let head: Head = new Head(type.armor, type.fov, type.textureKey);
        head._sprite = scene.add.sprite(-5, -2, head.textureKey);
        return head;
    }

    get sprite(): Phaser.GameObjects.Sprite {
        return this._sprite;
    }
}

export type HeadType =
    "NONE" |
    "GAS_MASK" |
    "HELMET" |
    "NIGHT_VISION";

export const HeadEnum = new Map<HeadType, HeadProps>([
    ["NONE", {
        armor: 0,
        fov: 120,
        textureKey: 'h_none',
    }],
    ["GAS_MASK", {
        armor: 0,
        fov: 60,
        textureKey: 'h_gas',
    }],
    ["HELMET", {
        armor: 1,
        fov: 90,
        textureKey: 'h_helmet',
    }],
    ["NIGHT_VISION", {
        armor: 0,
        fov: 90,
        textureKey: 'h_night',
    }],
]);