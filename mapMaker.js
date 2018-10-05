'use strict';
const svgson = require( "svgson" );
const fs = require( 'fs' );
const path = require( 'path' );

const TARGET_DIR = './public/assets/maps';
const MAPS_DIR = './src/maps';

if ( !fs.existsSync( TARGET_DIR ) ) {
    fs.mkdirSync( TARGET_DIR );
}

const mapNames = fs.readdirSync( MAPS_DIR );

mapNames.forEach( ( mapName ) => {

    const filenames = fs.readdirSync( path.join( MAPS_DIR, mapName ) );
    let finalResult = {};

    filenames.forEach( function ( filename ) {
        const key = filename.match( /(\w+)\.svg/ )[1];

        // Just copy svg with proper renaming as it should not be processed
        // Lower, Upper and Shadow layers
        if ( key === "LL" || key === "UL" || key === "SL" ) {
            fs.createReadStream( path.join( MAPS_DIR, mapName, filename ) ).pipe(
                fs.createWriteStream( path.join( TARGET_DIR, `${mapName}_${filename}` ) )
            );
            return;
        }

        // Name, size and spawning points location
        if ( key === "SP" ) {
            svgson( fs.readFileSync( path.join( MAPS_DIR, mapName, filename ), 'utf-8' ), {},
                function ( result ) {
                    finalResult.name = mapName;
                    finalResult.width = result.attrs.width;
                    finalResult.height = result.attrs.height;

                    finalResult[key] = result.childs.map( ( child ) => {
                        return {
                            x: child.attrs.cx || 0,
                            y: child.attrs.cy || 0,
                        };
                    } );
                }
            );
            return;
        }

        // Else process it into .json
        svgson( fs.readFileSync( path.join( MAPS_DIR, mapName, filename ), 'utf-8' ), {},
            function ( result ) {

                finalResult[key] = result.childs.map( ( child ) => {
                    // Adding missing props to rectangles
                    if ( child.attrs.width && !child.attrs.x ) child.attrs.x = 0;
                    if ( child.attrs.width && !child.attrs.y ) child.attrs.y = 0;

                    // Adding missing props to circles
                    if ( child.attrs.r && !child.attrs.cx ) child.attrs.cx = 0;
                    if ( child.attrs.r && !child.attrs.cy ) child.attrs.cy = 0;

                    // Removing '#' from color
                    child.attrs.fill = child.attrs.fill.replace( '#', '' );

                    return child.attrs;
                } );
            }
        );

    } );

    fs.writeFileSync(
        path.join( TARGET_DIR, `${mapName}.json` ),
        JSON.stringify( finalResult )
    );
} );