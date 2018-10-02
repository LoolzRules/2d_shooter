const fs = require( 'fs' );
const path = require( 'path' );

const ASSETS_DIR = './public/assets/';
const TARGET_DIR = './src/ts/';

const assetFolders = fs.readdirSync( ASSETS_DIR );
let finalResult = {};

assetFolders.forEach( ( folderName ) => {
    const filenames = fs.readdirSync( path.join( ASSETS_DIR, folderName ) );

    filenames.forEach( function ( filename ) {
        const extname = path.extname( filename ).replace( '.', '' );
        const basename = path.basename( filename, "." + extname );

        if ( !finalResult[extname] )
            finalResult[extname] = {};

        if ( !finalResult[extname][folderName] )
            finalResult[extname][folderName] = [];

        finalResult[extname][folderName].push( basename )
    } );


} );

fs.writeFileSync(
    path.join( TARGET_DIR, `assetInfo.json` ),
    JSON.stringify( finalResult, null, 2 )
);