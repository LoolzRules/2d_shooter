const svgson = require( "svgson" );
const fs = require( 'fs' );
const path = require( 'path' );

const ASSETDIR = './public/assets/maps';
const SRCDIR = './src/maps';

let mapNames = fs.readdirSync( SRCDIR );

mapNames.forEach( ( mapName ) => {
    let filenames = fs.readdirSync( path.join(SRCDIR, mapName) );
    let finalResult = {};

    filenames.forEach( function ( filename ) {
        let key = filename.match( /(\w+)\.svg/ )[1];

        svgson( fs.readFileSync( path.join(SRCDIR, mapName, filename), 'utf-8' ), {},
            function ( result ) {
                finalResult[key] = result.childs.map( ( child ) => {
                    child.attrs.fill = child.attrs.fill.replace( '#', '' );
                    return child.attrs;
                } );
            }
        )

    } );

    fs.writeFileSync(
        path.join(ASSETDIR, `${mapName}.json`),
        JSON.stringify( finalResult, null, 2 )
    );
} );