window.onload = function () {

    class Player {
        constructor( scene, x, y ) {
            this.x = x;
            this.y = y;
            this.angle = 0;
            this.speed = 200;

            this.mainGroup = scene.add.group( {
                // setXY: { x, y },
            } );

            this.body = scene.impact.add.image( x, y, 'body' ).setOrigin( 0.5, 0.3 );
            this.rifle = scene.impact.add.image( x, y, 'rifle' ).setOrigin( 0.5, -0.05 );
            this.head = scene.impact.add.image( x, y, 'head' ).setOrigin( 0.35, 0.5 );

            this.mainGroup.addMultiple( [this.body, this.rifle, this.head] );

            this.mainGroup.getChildren().forEach( ( child ) => {
                child.setMaxVelocity( this.speed );
            } );
        }

        setAngle( angle ) {
            this.angle = angle;
        }

        modifyPosition( w, a, s, d ) {
            if ( d && !a )
                this.mainGroup.getChildren().forEach( ( child ) => {
                    child.setVelocityX( 300 );
                } );
            else if ( a && !d )
                this.mainGroup.getChildren().forEach( ( child ) => {
                    child.setVelocityX( -300 );
                } );
            else
                this.mainGroup.getChildren().forEach( ( child ) => {
                    child.setVelocityX( 0 );
                } );

            if ( s && !w )
                this.mainGroup.getChildren().forEach( ( child ) => {
                    child.setVelocityY( 300 );
                } );
            else if ( w && !s )
                this.mainGroup.getChildren().forEach( ( child ) => {
                    child.setVelocityY( -300 );
                } );
            else
                this.mainGroup.getChildren().forEach( ( child ) => {
                    child.setVelocityY( 0 );
                } );
        }

        update() {
            this.mainGroup.getChildren().forEach( ( child ) => {
                child.setRotation( this.angle - Math.PI / 2 );
            } );
            // this.x = this.mainGroup.getChildren()[-1];
            // this.y = this.mainGroup.getChildren()[-1];
        }
    }

    preload = function () {
        this.load.setBaseURL( 'http://localhost:3000' );
        this.load.image( 'body', 'assets/pose_1_heavy.svg' );
        this.load.image( 'rifle', 'assets/assault_rifle.svg' );
        this.load.image( 'head', 'assets/gas.svg' );
    };

    let W;
    let A;
    let S;
    let D;

    create = function () {
        this.maincam = this.cameras.main;
        this.maincam.setBounds( 0, 0, 700, 700 ).setName( 'main' );
        this.maincam.setSize( 600, 600 );
        this.maincam.setPosition( 200, 0 );
        this.maincam.setBackgroundColor( 0x444444 );
        this.maincam.scrollX = -300;
        this.maincam.scrollY = -300;

        this.player = new Player( this, 0, 0 );

        this.minimap = this.cameras.add( 900, 0, 70, 70 ).setZoom( 0.1 ).setName( 'mini' );
        this.minimap.setBackgroundColor( 0x002244 );

        W = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.W );
        A = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.A );
        S = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.S );
        D = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.D );
        this.input.on( 'pointermove', function ( pointer ) {
            let angle = Phaser.Math.Angle.Between( 500, 300, pointer.x, pointer.y );
            this.player.setAngle( angle );
        }, this );
    };

    update = function () {
        this.player.modifyPosition( W.isDown, A.isDown, S.isDown, D.isDown );
        this.player.update();
        // this.maincam.scrollX = this.player.x;
        // this.maincam.scrollY = this.player.y;
    };

    const config = {
        type: Phaser.AUTO,
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
        backgroundColor: '#aaaaaa',
        physics: {
            default: 'impact',
            impact: {
                setBounds: {
                    x: 0,
                    y: 0,
                    width: 700,
                    height: 700,
                    thickness: 32,
                }
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
            }
        },
        fps: 60,
    };

    const game = new Phaser.Game( config );
};