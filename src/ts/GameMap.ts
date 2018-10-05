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
    private _spawnPoints: Array<Point>;
    private _spawnPointIndex: number;

    constructor(scene: MainScene, mapData: JSON) {
        // Configuring world bounds
        scene.boundW = Number.parseInt(mapData["width"]);
        scene.boundH = Number.parseInt(mapData["height"]);

        // Enabling upper and lower layers
        scene.add.image(0, 0, `${mapData["name"]}_LL`)
            .setOrigin(0)
            .setDepth(0);
        scene.add.image(0, 0, `${mapData["name"]}_UL`)
            .setOrigin(0)
            .setDepth(1000);

        // Reading spawn points
        this._spawnPointIndex = mapData["SP"].length;
        this._spawnPoints = mapData["SP"].map((point) => ({
            x: Number.parseInt(point.x),
            y: Number.parseInt(point.y)
        }));

        // Adding collision objects to physics map
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

        // Enabling movement and vision obstacles
        ["MO", "VO"].forEach((key: string) => {
            this._staticGroups.set(key, scene.physics.add.staticGroup());

            mapData[key].forEach((element) => {
                const color: number = 0x000000;
                const alpha: number = 0;

                // Circle check
                if (element.r) {
                    const x: number = Number.parseInt(element.cx, 10) + scene.boundX;
                    const y: number = Number.parseInt(element.cy, 10) + scene.boundY;
                    const r: number = Number.parseInt(element.r, 10);

                    const cir = scene.add.circle(x - r / 2, y - r / 2, r, color, alpha);

                    scene.physics.add.existing(cir, true);
                    (<Phaser.Physics.Arcade.Body> cir.body)
                        .setCircle(r);
                    this._staticGroups.get(key).add(cir);

                } else {
                    const x: number = Number.parseInt(element.x, 10) + scene.boundX;
                    const y: number = Number.parseInt(element.y, 10) + scene.boundY;
                    const w: number = Number.parseInt(element.width, 10);
                    const h: number = Number.parseInt(element.height, 10);

                    const rect = scene.add.rectangle(x, y, w, h, color, alpha)
                        .setOrigin(0);

                    this._staticGroups.get(key).add(rect);

                    if (key === "VO") {
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

    get freeSpawnPoint(): Point | null {
        if (this._spawnPointIndex-- > 0) {
            this._spawnPointIndex--;
            return this._spawnPoints[this._spawnPointIndex];
        } else {
            return null;
        }
    }
}