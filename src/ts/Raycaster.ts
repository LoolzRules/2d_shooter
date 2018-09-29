import {GameMap, Point, Segment} from "./GameMap";


export interface IntersectionPoint extends Point {
    readonly param: number;
    angle: number;
}

export class Raycaster {
    constructor(private map: GameMap) {
    }

    generateIntersectionPoints(x: number, y: number, playerAngle: number, fov: number) {

        const availablePoints: Array<Point> = this.map.points;

        const edgeAngles: Array<number> = [
            playerAngle - fov / 2,
            playerAngle + fov / 2
        ];

        let intersectionPoints: Array<IntersectionPoint> = [{
            x, y, param: 0, angle: -Infinity
        }];

        // Intersections of rays casted to FOV edges
        edgeAngles.forEach((angle: number) => {
            const ray = Raycaster.makeRay(x, y, angle);
            const closestIntersection = this.getClosestIntersection(ray);

            if (closestIntersection !== null) {
                closestIntersection.angle = angle;
                intersectionPoints.push(closestIntersection);
            }
        });

        // Intersections of rays casted to corners
        availablePoints.forEach((point: Point) => {
            const initAngle: number = (Math.PI + Phaser.Math.Angle.Between(point.x, point.y, x, y));

            const coeff: number = 2 * Math.PI;
            if (!(initAngle > coeff + edgeAngles[0] && initAngle < coeff + edgeAngles[1]) &&
                !(initAngle > edgeAngles[0] && initAngle < edgeAngles[1])) return;

            for (let i = -1; i < 2; i++) {
                const angle: number = initAngle + i * 0.00001;

                const ray: Segment = Raycaster.makeRay(x, y, angle);
                const closestIntersection: IntersectionPoint = this.getClosestIntersection(ray);

                if (closestIntersection !== null) {
                    closestIntersection.angle = angle;
                    intersectionPoints.push(closestIntersection);
                }
            }
        });


        return intersectionPoints.sort((a: IntersectionPoint, b: IntersectionPoint) =>
            Phaser.Math.Angle.Normalize(Phaser.Math.Angle.Normalize(a.angle) - playerAngle + fov) -
            Phaser.Math.Angle.Normalize(Phaser.Math.Angle.Normalize(b.angle) - playerAngle + fov)
        );
    }

    getClosestIntersection(ray: Segment): IntersectionPoint | null {
        let closestIntersection: IntersectionPoint = null;
        this.map.segments.forEach((segment: Segment) => {
            let intersection = Raycaster.getIntersection(ray, segment);
            if (!intersection) return;
            if (!closestIntersection || intersection.param < closestIntersection.param) {
                closestIntersection = intersection;
            }
        });

        return closestIntersection;
    }

    static getIntersection(r: Segment, s: Segment): IntersectionPoint | null {

        if (r.dx / r.mag === s.dx / s.mag && r.dy / r.mag === s.dy / s.mag)
            return null;


        const T2 = (r.dx * (s.y - r.y) + r.dy * (r.x - s.x)) / (s.dx * r.dy - s.dy * r.dx);
        if (T2 < 0 || T2 > 1)
            return null;

        const T1 = (s.x + s.dx * T2 - r.x) / r.dx;
        if (T1 < 0)
            return null;

        return {
            x: r.x + r.dx * T1,
            y: r.y + r.dy * T1,
            param: T1,
            angle: -Infinity
        };
    }

    static makeRay(x: number, y: number, angle: number): Segment {
        return {
            x, y, mag: 1,
            dx: Math.cos(angle),
            dy: Math.sin(angle)
        };
    }
}