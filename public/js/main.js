window.onload = function () {

    class Player {
        constructor( scene, x, y ) {
            this.angle = 0;
            this.maxSpeed = 200;

            this.body = scene.add.sprite( 0, 10, 'body' );
            this.rifle = scene.add.sprite( 0, 20, 'rifle' );
            this.head = scene.add.sprite( 5, -5, 'head' );

            this.container = scene.add.container( x, y );
            this.container.add( [this.body, this.rifle, this.head] );

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
            this.container.setRotation( this.angle - Math.PI / 2 );
        }
    }

    class Map {
        static generate( scene, mapData ) {
            let map = {};
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
                } );
            } );

            return map;
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
                        debug: true
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

            // Building map with physics
            this.map = Map.generate(this, this.cache.json.get( 'map' ));

            // Enabling world bounds
            this.physics.world.setBounds(
                this.boundX, this.boundY,
                this.boundW, this.boundH,
                true, true, true, true );

            // Adding player
            this.player = new Player( this,
                this.boundX + this.boundW / 2,
                this.boundY + this.boundH / 2 );

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