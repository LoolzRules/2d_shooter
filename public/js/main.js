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

            this.assets = [
                {
                    "key": "iw_1",
                    "path": "/assets/inner_walls/1.svg",
                    "x": 494,
                    "y": 888,
                    "angle": 0
                },
                {
                    "key": "iw_2",
                    "path": "/assets/inner_walls/2.svg",
                    "x": 317,
                    "y": 888,
                    "angle": 0
                },
                {
                    "key": "iw_3",
                    "path": "/assets/inner_walls/3.svg",
                    "x": 584,
                    "y": 888,
                    "angle": 0
                },
                {
                    "key": "iw_4",
                    "path": "/assets/inner_walls/4.svg",
                    "x": 305,
                    "y": 888,
                    "angle": 0
                },
                {
                    "key": "iw_5",
                    "path": "/assets/inner_walls/5.svg",
                    "x": 357,
                    "y": 620,
                    "angle": 0
                },
                {
                    "key": "iw_6",
                    "path": "/assets/inner_walls/6.svg",
                    "x": 1062,
                    "y": 740,
                    "angle": 0
                },
                {
                    "key": "iw_7",
                    "path": "/assets/inner_walls/7.svg",
                    "x": 596,
                    "y": 728,
                    "angle": 0
                },
                {
                    "key": "iw_8",
                    "path": "/assets/inner_walls/8.svg",
                    "x": 1229,
                    "y": 728,
                    "angle": 0
                },
                {
                    "key": "iw_9",
                    "path": "/assets/inner_walls/9.svg",
                    "x": 768,
                    "y": 728,
                    "angle": 0
                },
                {
                    "key": "iw_10",
                    "path": "/assets/inner_walls/10.svg",
                    "x": 584,
                    "y": 336,
                    "angle": 0
                },
                {
                    "key": "iw_11",
                    "path": "/assets/inner_walls/11.svg",
                    "x": 512,
                    "y": 608,
                    "angle": 0
                },
                {
                    "key": "iw_12",
                    "path": "/assets/inner_walls/12.svg",
                    "x": 84,
                    "y": 608,
                    "angle": 0
                }
            ]

        }

        preload() {
            this.load.setBaseURL( 'http://localhost:3000' );
            this.load.image( 'body', 'assets/pose_1_heavy.svg' );
            this.load.image( 'rifle', 'assets/assault_rifle.svg' );
            this.load.image( 'head', 'assets/gas.svg' );
            this.load.image( 'map', 'assets/bg-1.jpg' );
            this.assets.forEach( ( asset ) => {
                this.load.image( asset.key, asset.path );
            } );
        };

        create() {

            this.map = this.add.group();

            this.assets.forEach( ( asset ) => {
                let obj = this.add.image(
                    asset.x + this.boundX,
                    asset.y + this.boundY,
                    asset.key )
                    .setOrigin( 0 )
                    .setRotation( asset.angle / 180 * Math.PI );
                this.physics.world.enable( obj );
                obj.body.immovable = true;
                this.map.add( obj );
            } );

            // Enabling physics
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
            this.player.update(
                this.controls.w.isDown,
                this.controls.a.isDown,
                this.controls.s.isDown,
                this.controls.d.isDown,
                this.controls.cursorX + this.cameras.main.scrollX,
                this.controls.cursorY + this.cameras.main.scrollY
            );
            this.physics.world.collide( this.player.container, this.map );
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