import {MainScene} from "./MainScene";

export interface Point {
    readonly x: number;
    readonly y: number;
}

export interface Segment {
    readonly x: number;
    readonly y: number;
    readonly dx: number;
    readonly dy: number;
    readonly mag: number;
}

export class GameMap {

    private _points: Array<Point>;
    private _segments: Array<Segment>;
    private _staticGroups: Map<string, Phaser.Physics.Arcade.StaticGroup>;

    constructor(scene: MainScene, mapData: JSON) {
        this._staticGroups = new Map();
        this._points = [
            {x: scene.boundX, y: scene.boundY},
            {x: scene.boundX + scene.boundW, y: scene.boundY},
            {x: scene.boundX + scene.boundW, y: scene.boundY + scene.boundH},
            {x: scene.boundX, y: scene.boundY + scene.boundH}
        ];
        this._segments = [
            {
                x: scene.boundX,
                y: scene.boundY,
                dx: scene.boundW,
                dy: 0,
                mag: scene.boundW
            },
            {
                x: scene.boundX + scene.boundW,
                y: scene.boundY,
                dx: 0,
                dy: scene.boundH,
                mag: scene.boundH
            },
            {
                x: scene.boundX + scene.boundW,
                y: scene.boundY + scene.boundH,
                dx: -scene.boundW,
                dy: 0,
                mag: scene.boundW
            },
            {
                x: scene.boundX,
                y: scene.boundY + scene.boundH,
                dx: 0,
                dy: -scene.boundH,
                mag: scene.boundH
            }
        ];


        Object.keys(mapData).forEach((key: string) => {
            this._staticGroups.set(key, scene.physics.add.staticGroup());

            mapData[key].forEach((element) => {
                const color: number = Number.parseInt(element.fill, 16);
                const alpha: number = Number.parseFloat(element.fillOpacity) || 1;

                const x: number = Number.parseInt(element.x, 10) + scene.boundX;
                const y: number = Number.parseInt(element.y, 10) + scene.boundY;
                const w: number = Number.parseInt(element.width, 10);
                const h: number = Number.parseInt(element.height, 10);

                const rect = scene.add.rectangle(x, y, w, h, color, alpha)
                        .setOrigin(0);

                this._staticGroups.get(key).add(rect);

                if (key !== "wn") {
                    this._points.push(
                        {x, y},
                        {x: x + w, y},
                        {x: x + w, y: y + h},
                        {x, y: y + h},
                    );
                    this._segments.push(
                        {x: x, y: y, dx: w, dy: 0, mag: w},
                        {x: x + w, y: y, dx: 0, dy: h, mag: h},
                        {x: x + w, y: y + h, dx: -w, dy: 0, mag: w},
                        {x: x, y: y + h, dx: 0, dy: -h, mag: h}
                    );
                }

            });
        });

        // Leave only unique points
        this._points.sort((a: Point, b: Point) => {
            return a.x - b.x || a.y - b.y;
        });

        let uniquePoints: Array<Point> = [this._points[0]];

        this._points.forEach((currentPoint: Point) => {
            let lastPoint = uniquePoints[uniquePoints.length - 1];
            if (lastPoint.x !== currentPoint.x || lastPoint.y !== currentPoint.y)
                uniquePoints.push(currentPoint);
        });

        this._points = uniquePoints;
    }

    get staticGroups(): Map<string, Phaser.Physics.Arcade.StaticGroup> {
        return this._staticGroups;
    }

    get points(): Array<Point> {
        return this._points;
    }

    get segments(): Array<Segment> {
        return this._segments;
    }
}