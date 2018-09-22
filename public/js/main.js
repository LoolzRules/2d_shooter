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
            this.container.setSize( 72, 72 );
            scene.physics.world.enable( this.container );
            this.container.body.setCircle(36);
            this.container.body.setMaxVelocity( this.maxSpeed ).setCollideWorldBounds( true );
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

    const preload = function () {
        this.load.setBaseURL( 'http://localhost:3000' );
        this.load.image( 'body', 'assets/pose_1_heavy.svg' );
        this.load.image( 'rifle', 'assets/assault_rifle.svg' );
        this.load.image( 'head', 'assets/gas.svg' );
        this.load.image( 'map', 'assets/bg-1.jpg' );
    };


    const create = function () {
        this.add.image( 0, 0, 'map' ).setOrigin( 0.5 );
        this.physics.world.setBounds( -500, -500, 1000, 1000, true, true, true, true );

        this.setupMainCamera( this.cameras.main );

        this.player = new Player( this, 0, 0 );

        this.cameras.main.startFollow( this.player.container, false, 0.1, 0.1 );

        this.minimap = this.cameras.add( 900, 0, 200, 200 );
        this.setupMinimap( this.minimap );

        this.controls.w = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.W );
        this.controls.a = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.A );
        this.controls.s = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.S );
        this.controls.d = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.D );
        this.controls.cursorX = 0;
        this.controls.cursorY = 0;

        this.input.on( 'pointermove', function ( pointer ) {
            this.controls.cursorX = pointer.x;
            this.controls.cursorY = pointer.y;
        }, this );
    };

    const update = function () {
        this.player.update(
            this.controls.w.isDown,
            this.controls.a.isDown,
            this.controls.s.isDown,
            this.controls.d.isDown,
            this.controls.cursorX + this.cameras.main.scrollX,
            this.controls.cursorY + this.cameras.main.scrollY
        );
    };

    const setupMainCamera = function ( camera ) {
        camera
            .setName( 'main' )
            .setBounds( -500, -500, 1000, 1000 )
            .setSize( window.innerHeight, window.innerHeight )
            .setPosition( (window.innerWidth - window.innerHeight) / 2, 0 )
            .setBackgroundColor( 0x444444 );
    };

    const setupMinimap = function ( minimap ) {
        let size = (window.innerWidth - window.innerHeight) / 2;
        minimap
            .setName( 'mini' )
            .setZoom( 0.1 )
            .setSize( size, size )
            .setPosition( window.innerWidth - size, 0 )
            .setBackgroundColor( 0x002244 );
    };

    const config = {
        type: Phaser.AUTO,
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
        backgroundColor: '#000000',
        physics: {
            default: 'arcade',
            arcade: {
                debug: true
            }
        },
        scene: {
            preload,
            create,
            update,
            extend: {
                maincam: null,
                minimap: null,
                player: null,
                controls: {
                    w: null,
                    a: null,
                    s: null,
                    d: null,
                    cursorX: null,
                    cursorY: null,
                },
                setupMainCamera,
                setupMinimap,
            }
        },
        fps: 30,
    };

    const game = new Phaser.Game( config );
};