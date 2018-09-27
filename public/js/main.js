window.onload = function () {

    class Weapon {
        constructor( type ) {
            Object.keys( Weapon.Stats[type] ).forEach( ( key ) => {
                this[key] = stats[key];
            } );
        }

        static get Enum() {
            return Object.freeze( {
                PISTOL: 0,
                SILENCED_PISTOL: 1,
                UZI: 2,
                ASSAULT_RIFLE: 3,
                SHOTGUN: 4,
                TASER: 5,
                GAS_MARKER: 6,
            } )
        }

        static get Stats() {
            return {
                [Weapon.Enum.PISTOL]: {
                    fire_rate: 2,
                    damage: 15,
                    spread: 5,
                    range: Infinity,
                    textureKey: 'w_pistol',
                },
                [Weapon.Enum.SILENCED_PISTOL]: {
                    fire_rate: 2,
                    damage: 10,
                    spread: 0,
                    range: Infinity,
                    textureKey: 'w_suppressed_pistol',
                },
                [Weapon.Enum.UZI]: {
                    fire_rate: 4,
                    damage: 10,
                    spread: 30,
                    range: Infinity,
                    textureKey: 'w_uzi',
                },
                [Weapon.Enum.ASSAULT_RIFLE]: {
                    fire_rate: 3,
                    damage: 10,
                    spread: 8,
                    range: Infinity,
                    textureKey: 'w_assault_rifle',
                },
                [Weapon.Enum.SHOTGUN]: {
                    fire_rate: 1,
                    damage: 15,
                    spread: 30,
                    range: 1000,
                    textureKey: 'w_shotgun',
                },
                [Weapon.Enum.TASER]: {
                    fire_rate: 1,
                    damage: 0,
                    spread: 2,
                    range: 200,
                    textureKey: 'w_taser',
                },
                [Weapon.Enum.GAS_MARKER]: {
                    fire_rate: 2,
                    damage: 0,
                    spread: 8,
                    range: 2000,
                    textureKey: 'w_gas_marker',
                },
            };
        }
    }

    class Head {
        constructor( type ) {
            Object.keys( Head.Stats[type] ).forEach( ( key ) => {
                this[key] = stats[key];
            } );
        }

        static get Enum() {
            return Object.freeze( {
                NONE: 0,
                HELMET: 1,
                GAS_MASK: 2,
                NIGHT_VISION: 3,
            } )
        }

        static get Stats() {
            return {
                [Head.Enum.NONE]: {
                    armor: 0,
                    fov: 120,
                    key: 'h_none',
                },
                [Head.Enum.HELMET]: {
                    armor: 1,
                    fov: 90,
                    key: 'h_helmet',
                },
                [Head.Enum.GAS_MASK]: {
                    armor: 0,
                    fov: 60,
                    key: 'h_gas',
                },
                [Head.Enum.NIGHT_VISION]: {
                    armor: 0,
                    fov: 90,
                    key: 'h_night',
                },
            };
        }
    }

    class Body {
        constructor( type ) {
            Object.keys( Body.Stats[type] ).forEach( ( key ) => {
                this[key] = stats[key];
            } );
        }

        static get Enum() {
            return Object.freeze( {
                NONE: 0,
                LIGHT: 1,
                HEAVY: 2,
            } )
        }

        static get Stats() {
            return {
                [Body.Enum.NONE]: {
                    armor: 0,
                    speed: 1,
                    textureKey: ['b_none_1', 'b_none_2'],
                },
                [Body.Enum.LIGHT]: {
                    armor: 1,
                    speed: 0.9,
                    textureKey: ['b_light_1', 'b_light_2'],
                },
                [Body.Enum.HEAVY]: {
                    armor: 2,
                    speed: 0.8,
                    textureKey: ['b_heavy_1', 'b_heavy_2'],
                },
            };
        }
    }

    class Player {
        constructor( scene, x, y, raycaster ) {
            this.scene = scene;
            this.angle = 0;
            this.speed = 300;
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
                .setCollideWorldBounds( true );

            this.raycaster = raycaster;
            this.makeRaycast();
        }

        update( w, a, s, d, x, y ) {
            this.modifyAngle( x, y );
            this.modifyPosition( w, a, s, d );
            this.fovPolygon.destroy();
            this.makeRaycast();
        }

        modifyPosition( w, a, s, d ) {
            if ( d && !a ) this.container.body.setVelocityX( this.speed );
            else if ( a && !d ) this.container.body.setVelocityX( -this.speed );
            else this.container.body.setVelocityX( 0 );

            if ( s && !w ) this.container.body.setVelocityY( this.speed );
            else if ( w && !s ) this.container.body.setVelocityY( -this.speed );
            else this.container.body.setVelocityY( 0 );

            // // Smooth as hell but no collisions
            // if ( d && !a ) {
            //     this.container.x += this.speed / 60;
            //     this.container.body.x += this.speed / 60;
            // }
            // else if ( a && !d ) {
            //     this.container.x -= this.speed / 60;
            //     this.container.body.x -= this.speed / 60;
            // }
            //
            // if ( s && !w ) {
            //     this.container.y += this.speed / 60;
            //     this.container.body.y += this.speed / 60;
            // } else if ( w && !s ) {
            //     this.container.y -= this.speed / 60;
            //     this.container.body.y -= this.speed / 60;
            // }
        }

        modifyAngle( x, y ) {

            this.angle = Phaser.Math.Angle.Between(
                this.container.x + this.scene.cameraProps.offset,
                this.container.y + 0,
                x, y
            );

            // console.log(
            //     this.container.x + this.scene.cameraProps.offset,
            //     this.container.y + 0,
            //     x,
            //     y,
            //     this.container.body.touching.none
            // );

            this.container.setRotation( this.angle );
        }

        makeRaycast() {
            let fovPolygonPoints = this.raycaster.generateIntersectionPoints(
                this.container.x,
                this.container.y,
                this.angle,
                this.fov
            );
            this.fovPolygon = this.scene.add.polygon( 0, 0, fovPolygonPoints, 0xffffff, 0.3 )
                .setOrigin( 0 );
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
        constructor( uniquePoints, segments ) {
            this.uniquePoints = uniquePoints;
            this.segments = segments;
        }

        generateIntersectionPoints( x, y, playerAngle, fov ) {

            let availablePoints = this.uniquePoints;

            let edgeAngles = [
                playerAngle - fov / 2,
                playerAngle + fov / 2
            ];

            let intersectionPoints = [{
                x, y, angle: -Infinity
            }];

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
                if ( !(initAngle > coeff + edgeAngles[0] && initAngle < coeff + edgeAngles[1]) &&
                    !(initAngle > edgeAngles[0] && initAngle < edgeAngles[1]) ) return;

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
                Phaser.Math.Angle.Normalize( Phaser.Math.Angle.Normalize( a.angle ) - playerAngle + fov ) -
                Phaser.Math.Angle.Normalize( Phaser.Math.Angle.Normalize( b.angle ) - playerAngle + fov )
            );
        }

        getClosestIntersection( ray ) {
            let closestIntersection = null;
            this.segments.forEach( ( segment ) => {
                let intersection = Raycaster.getIntersection( ray, segment );
                if ( !intersection ) return;
                if ( !closestIntersection || intersection.param < closestIntersection.param ) {
                    closestIntersection = intersection;
                }
            } );

            return closestIntersection;
        }

        static getIntersection( r, s ) {

            if ( r.dx / r.mag === s.dx / s.mag && r.dy / r.mag === s.dy / s.mag )
                return null;


            let T2 = (r.dx * (s.y - r.y) + r.dy * (r.x - s.x)) / (s.dx * r.dy - s.dy * r.dx);
            if ( T2 < 0 || T2 > 1 )
                return null;

            let T1 = (s.x + s.dx * T2 - r.x) / r.dx;
            if ( T1 < 0 )
                return null;

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

            let maincamSize = window.innerHeight;
            let maincamOffset = (window.innerWidth - window.innerHeight) / 2;

            this.cameraProps = {
                size: maincamSize,
                offset: maincamOffset,
                zoom: Math.round( maincamSize / 70 ) / 10,
                lerp: 1,
                minimapCoefficient: maincamOffset / maincamSize,
            };

            this.boundX = -900;
            this.boundY = -600;
            this.boundW = -2 * this.boundX;
            this.boundH = -2 * this.boundY;

        }

        preload() {
            this.load.setBaseURL( 'http://localhost:3000' );
            this.load.svg( 'body', 'assets/body/b_light_1.svg' );
            this.load.svg( 'rifle', 'assets/weapon/w_assault_rifle.svg' );
            this.load.svg( 'head', 'assets/head/h_gas.svg' );
            this.load.json( 'map', 'assets/maps/1.json' );
        };

        create() {

            // Building maps
            let { map, uniquePoints, segments } = Map.generate( this, this.cache.json.get( 'map' ) );
            this.map = map;

            // Enabling world bounds
            this.physics.world.setBounds(
                this.boundX, this.boundY,
                this.boundW, this.boundH,
                true, true, true, true );

            // Adding player
            this.player = new Player( this, 0, 0, new Raycaster( uniquePoints, segments ) );

            // Enabling collisions
            Object.keys( this.map ).forEach( ( key ) => {
                this.physics.world.addCollider( this.player.container, this.map[key] );
            } );

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
            this.player.update(
                this.controls.w.isDown,
                this.controls.a.isDown,
                this.controls.s.isDown,
                this.controls.d.isDown,
                this.controls.cursorX + this.cameras.main.scrollX,
                this.controls.cursorY + this.cameras.main.scrollY,
            );
        };

        setupMainCamera() {
            this.cameras.main
                .setName( 'main' )
                .setZoom( this.cameraProps.zoom )
                .setBounds( this.boundX, this.boundY, this.boundW, this.boundH )
                .setSize( this.cameraProps.size, this.cameraProps.size )
                .setPosition( this.cameraProps.offset, 0 )
                .startFollow( this.player.container, false, this.cameraProps.lerp );
        };

        setupMinimap() {
            let coeff = this.cameraProps.minimapCoefficient;
            this.minimap
                .setName( 'mini' )
                .setZoom( coeff * this.cameraProps.zoom )
                .setBounds( this.boundX, this.boundY, this.boundW, this.boundH )
                .setSize( coeff * this.cameraProps.size, coeff * this.cameraProps.size )
                .setPosition( window.innerWidth - this.cameraProps.offset, 0 )
                .setBackgroundColor( 0x002244 )
                .startFollow( this.player.container, false, this.cameraProps.lerp );
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

    // TODO: remove camera shaking - deal with velocity, huh

    const game = new Phaser.Game( config );
};