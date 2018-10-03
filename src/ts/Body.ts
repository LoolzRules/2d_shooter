export interface BodyProps {
    armor: number,
    speedModifier: number,
    textureKey: Array<string>
}

export class Body {
    private _sprite: Phaser.GameObjects.Sprite;

    private constructor(readonly armor: number,
                        readonly speedModifier: number,
                        readonly textureKey: Array<string>) {
    }

    public static makeBody(type: BodyProps, scene: Phaser.Scene, num: number = 0): Body {
        let body: Body = new Body(type.armor, type.speedModifier, type.textureKey);
        body._sprite = scene.add.sprite(10, 0, body.textureKey[num]);
        return body;
    }

    public setSprite(num: number) {
        this._sprite.setTexture(this.textureKey[num]);
        this._sprite.setOrigin(0.5);
    }

    get sprite(): Phaser.GameObjects.Sprite {
        return this._sprite;
    }
}

export type BodyType =
    "NONE" |
    "LIGHT" |
    "HEAVY";

export const BodyEnum = new Map<BodyType, BodyProps>([
    ["NONE", {
        armor: 0,
        speedModifier: 1,
        textureKey: ['b_none_1', 'b_none_2'],
    }],
    ["LIGHT", {
        armor: 1,
        speedModifier: 0.9,
        textureKey: ['b_light_1', 'b_light_2'],
    }],
    ["HEAVY", {
        armor: 2,
        speedModifier: 0.8,
        textureKey: ['b_heavy_1', 'b_heavy_2'],
    }],
]);