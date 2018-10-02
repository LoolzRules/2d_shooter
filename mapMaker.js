const svgson = require( "svgson" );
const fs = require( 'fs' );
const path = require( 'path' );

const TARGET_DIR = './public/assets/maps';
const MAPS_DIR = './src/maps';

const mapNames = fs.readdirSync( MAPS_DIR );

mapNames.forEach( ( mapName ) => {
    const filenames = fs.readdirSync( path.join( MAPS_DIR, mapName ) );
    let finalResult = {};

    filenames.forEach( function ( filename ) {
        const key = filename.match( /(\w+)\.svg/ )[1];

        svgson( fs.readFileSync( path.join( MAPS_DIR, mapName, filename ), 'utf-8' ), {},
            function ( result ) {
                finalResult[key] = result.childs.map( ( child ) => {
                    child.attrs.fill = child.attrs.fill.replace( '#', '' );
                    return child.attrs;
                } );
            }
        )

    } );

    fs.writeFileSync(
        path.join( TARGET_DIR, `${mapName}.json` ),
        JSON.stringify( finalResult, null, 2 )
    );
} );