const path = require( 'path' );

module.exports = {
    entry: [
        'Body.ts',
        'Head.ts',
        'Weapon.ts',
        'Raycaster.ts',
        'Player.ts',
        'GameMap.ts',
        'MainScene.ts',
        'MainGame.ts'
    ].map( ( e ) => './src/ts/' + e ),
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'main.min.js',
        path: path.resolve( __dirname, 'public/js' )
    }

};