window.onload = function () {

    class Player {
        constructor( scene, x, y ) {
            this.angle = 0;
            this.maxSpeed = 200;
            this.fov = Math.PI / 2;

            this.body = scene.add.sprite( 10, 0, 'body' );
            this.rifle = scene.add.sprite( 20, 0, 'rifle' );
            this.head = scene.add.sprite( -5, -5, 'head' );

            this.container = scene.add.container( x, y );
            this.container
                .add( [this.body, this.rifle, this.head] )
                .setDepth( 100 );

            scene.physics.world.enable( this.container );
            this.container.body
                .setCircle( 36, -36, -36 )
                .setMaxVelocity( this.maxSpeed )
                .setCollideWorldBounds( true );
        }

        update( w, a, s, d, x, y ) {
            this.modifyPosition( w, a, s, d );
            this.modifyAngle( x, y );
        }

        modifyPosition( w, a, s, d ) {
            if ( d && !a )
                this.container.body.setVelocityX( 300 );
            else if ( a && !d )
                this.container.body.setVelocityX( -300 );
            else
                this.container.body.setVelocityX( 0 );

            if ( s && !w )
                this.container.body.setVelocityY( 300 );
            else if ( w && !s )
                this.container.body.setVelocityY( -300 );
            else
                this.container.body.setVelocityY( 0 );
        }

        modifyAngle( x, y ) {
            this.angle = Phaser.Math.Angle.Between(
                this.container.x + (window.innerWidth - window.innerHeight) / 2,
                this.container.y + 0,
                x, y
            );
            this.container.setRotation( this.angle );
        }
    }

    class Map {
        static generate( scene, mapData ) {
            let map = {};
            let points = [
                { x: scene.boundX, y: scene.boundY },
                { x: scene.boundX + scene.boundW, y: scene.boundY },
                { x: scene.boundX + scene.boundW, y: scene.boundY + scene.boundH },
                { x: scene.boundX, y: scene.boundY + scene.boundH }
            ];
            let segments = [
                { x: scene.boundX, y: scene.boundY, dx: scene.boundW, dy: 0, mag: scene.boundW },
                { x: scene.boundX + scene.boundW, y: scene.boundY, dx: 0, dy: scene.boundH, mag: scene.boundH },
                {
                    x: scene.boundX + scene.boundW,
                    y: scene.boundY + scene.boundH,
                    dx: -scene.boundW,
                    dy: 0,
                    mag: scene.boundW
                },
                { x: scene.boundX, y: scene.boundY + scene.boundH, dx: 0, dy: -scene.boundH, mag: scene.boundH }
            ];

            Object.keys( mapData ).forEach( ( key ) => {
                map[key] = scene.physics.add.staticGroup();

                mapData[key].forEach( ( element ) => {
                    let color = Number.parseInt( element.fill, 16 );
                    let alpha = Number.parseFloat( element.fillOpacity ) || 1;

                    let x = Number.parseInt( element.x, 10 ) + scene.boundX;
                    let y = Number.parseInt( element.y, 10 ) + scene.boundY;
                    let w = Number.parseInt( element.width, 10 );
                    let h = Number.parseInt( element.height, 10 );

                    let rect = scene.add.rectangle( x, y, w, h, color, alpha )
                        .setOrigin( 0 );

                    map[key].add( rect );

                    if ( key !== "wn" ) {
                        points.push(
                            { x, y },
                            { x: x + w, y },
                            { x: x + w, y: y + h },
                            { x, y: y + h },
                        );
                        segments.push(
                            { x: x, y: y, dx: w, dy: 0, mag: w },
                            { x: x + w, y: y, dx: 0, dy: h, mag: h },
                            { x: x + w, y: y + h, dx: -w, dy: 0, mag: w },
                            { x: x, y: y + h, dx: 0, dy: -h, mag: h }
                        );
                    }

                } );
            } );

            points.sort( ( a, b ) => {
                return a.x - b.x || a.y - b.y;
            } );

            let uniquePoints = [points[0]];

            points.forEach( ( obj ) => {
                if ( uniquePoints[uniquePoints.length - 1].x !== obj.x ||
                    uniquePoints[uniquePoints.length - 1].y !== obj.y )
                    uniquePoints.push( obj );
            } );

            return { map, uniquePoints, segments };
        }
    }

    class Raycaster {
        constructor( scene ) {
            this.scene = scene;
        }

        generateIntersectionPoints( x, y, playerAngle, fov, dist ) {

            let availablePoints = this.scene.uniquePoints;

            let edgeAngles = [
                playerAngle - fov / 2,
                playerAngle - fov / 2 + 0.00001,
                playerAngle + fov / 2 - 0.00001,
                playerAngle + fov / 2
            ];

            // console.log( "I", edgeAngles[3] );

            let intersectionPoints = [{
                x, y, angle: -Infinity
            }];

            // let intersectionPoints = [];

            // Intersections of FOV edges
            edgeAngles.forEach( ( angle ) => {
                let ray = Raycaster.makeRay( x, y, angle );
                let closestIntersection = this.getClosestIntersection( ray );

                if ( closestIntersection !== null ) {
                    closestIntersection.angle = angle;
                    intersectionPoints.push( closestIntersection );
                }
            } );

            // Intersections of rays to corners
            availablePoints.forEach( ( point ) => {
                let initAngle = (Math.PI + Phaser.Math.Angle.Between( point.x, point.y, x, y ));

                let coeff = 2 * Math.PI;
                if ( !(initAngle > coeff + edgeAngles[0] && initAngle < coeff + edgeAngles[3]) &&
                    !(initAngle > edgeAngles[0] && initAngle < edgeAngles[3]) ) return;

                for ( let i = -1; i < 2; i++ ) {
                    let angle = initAngle + i * 0.00001;

                    let ray = Raycaster.makeRay( x, y, angle );
                    let closestIntersection = this.getClosestIntersection( ray );

                    if ( closestIntersection !== null ) {
                        closestIntersection.angle = angle;
                        intersectionPoints.push( closestIntersection );
                    }
                }
            } );


            return intersectionPoints.sort( ( a, b ) =>
                Phaser.Math.Angle.Normalize(Phaser.Math.Angle.Normalize(a.angle) - playerAngle + fov) -
                Phaser.Math.Angle.Normalize(Phaser.Math.Angle.Normalize(b.angle) - playerAngle + fov)
            );
        }

        getClosestIntersection( ray ) {
            let segments = this.scene.segments;

            let closestIntersection = null;
            segments.forEach( ( segment ) => {
                let intersection = Raycaster.getIntersection( ray, segment );
                if ( !intersection ) return;
                if ( !closestIntersection || intersection.param < closestIntersection.param ) {
                    closestIntersection = intersection;
                }
            } );

            return closestIntersection;
        }

        static getIntersection( r, s ) {

            if ( r.dx / r.mag === s.dx / s.mag && r.dy / r.mag === s.dy / s.mag ) {
                return null;
            }


            let T2 = (r.dx * (s.y - r.y) + r.dy * (r.x - s.x)) / (s.dx * r.dy - s.dy * r.dx);
            if ( T2 < 0 || T2 > 1 ) {
                return null;
            }

            let T1 = (s.x + s.dx * T2 - r.x) / r.dx;
            if ( T1 < 0 ) {
                return null;
            }

            return {
                x: r.x + r.dx * T1,
                y: r.y + r.dy * T1,
                param: T1,
            };
        }

        static makeRay( x, y, angle ) {
            return {
                x, y, mag: 1,
                dx: Math.cos( angle ),
                dy: Math.sin( angle )
            };
        }
    }

    class MainScene extends Phaser.Scene {
        constructor() {
            super( {
                key: 'mainScene',
                active: true,
                physics: {
                    default: 'arcade',
                    arcade: {
                        // debug: true
                    }
                },
            } );

            this.maincamSize = window.innerHeight;
            this.maincamOffset = (window.innerWidth - window.innerHeight) / 2;

            this.boundX = -900;
            this.boundY = -600;
            this.boundW = -2 * this.boundX;
            this.boundH = -2 * this.boundY;

        }

        preload() {
            this.load.setBaseURL( 'http://localhost:3000' );
            this.load.svg( 'body', 'assets/pose_1_heavy.svg' );
            this.load.svg( 'rifle', 'assets/assault_rifle.svg' );
            this.load.svg( 'head', 'assets/gas.svg' );
            this.load.json( 'map', 'assets/maps/1.json' );
        };

        create() {

            // Building maps
            let { map, uniquePoints, segments } = Map.generate( this, this.cache.json.get( 'map' ) );
            this.map = map;
            this.uniquePoints = uniquePoints;
            this.segments = segments;

            // Enabling world bounds
            this.physics.world.setBounds(
                this.boundX, this.boundY,
                this.boundW, this.boundH,
                true, true, true, true );

            // Adding player
            this.player = new Player( this,
                this.boundX + this.boundW / 2,
                this.boundY + this.boundH / 2 );


            this.raycaster = new Raycaster( this, this.uniquePoints, this.player );
            // this.dots = this.raycaster.generateIntersectionPoints(
            //     this.player.container.x,
            //     this.player.container.y,
            //     this.player.angle,
            //     this.player.fov );
            // console.log( this.dots );
            // this.dots.forEach( ( dot ) => {
            //     this.add.rectangle( dot.x, dot.y, 4, 4, 0x00ff00 ).setOrigin( 0.5 );
            // } );


            this.view = this.add.polygon( 0, 0,
                this.raycaster.generateIntersectionPoints(
                    this.player.container.x,
                    this.player.container.y,
                    this.player.angle,
                    this.player.fov
                ), 0xffffff, 0.3 ).setOrigin( 0 );

            // Setting up main camera
            this.setupMainCamera();

            // Adding minimap
            this.minimap = this.cameras.add();
            this.setupMinimap();

            // Adding input
            this.controls = {
                w: this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.W ),
                a: this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.A ),
                s: this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.S ),
                d: this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.D ),
                cursorX: 0,
                cursorY: 0,
            };

            this.input.on( 'pointermove', function ( pointer ) {
                this.controls.cursorX = pointer.x;
                this.controls.cursorY = pointer.y;
            }, this );
        };

        update() {
            Object.keys( this.map ).forEach( ( key ) => {
                this.physics.world.collide( this.player.container, this.map[key] );
            } );
            this.player.update(
                this.controls.w.isDown,
                this.controls.a.isDown,
                this.controls.s.isDown,
                this.controls.d.isDown,
                this.controls.cursorX + this.cameras.main.scrollX,
                this.controls.cursorY + this.cameras.main.scrollY
            );
            this.view.destroy();
            let pts = this.raycaster.generateIntersectionPoints(
                this.player.container.x,
                this.player.container.y,
                this.player.angle,
                this.player.fov
            );
            // console.log( "R", pts[1].angle, pts[pts.length-1].angle );
            this.view = this.add.polygon( 0, 0,
                pts, 0xffffff, 0.3 )
                .setOrigin( 0 );
        };

        setupMainCamera() {
            this.cameras.main
                .setName( 'main' )
                .setBounds( this.boundX, this.boundY, this.boundW, this.boundH )
                .setSize( this.maincamSize, this.maincamSize )
                .setPosition( this.maincamOffset, 0 )
                .setBackgroundColor( 0x444444 )
                .startFollow( this.player.container, false, 0.1, 0.1 );
        };

        setupMinimap() {
            this.minimap
                .setName( 'mini' )
                .setZoom( 0.1 )
                .setSize( this.maincamOffset, this.maincamOffset )
                .setPosition( window.innerWidth - this.maincamOffset, 0 )
                .setBackgroundColor( 0x002244 );
        };

    }

    const config = {
        type: Phaser.AUTO,
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
        backgroundColor: '#000000',
        scene: [MainScene],
        fps: 30,
    };

    const game = new Phaser.Game( config );
};