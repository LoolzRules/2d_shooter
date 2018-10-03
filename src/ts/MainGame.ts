import {MainScene} from "./MainScene";

window.onload = function () {

    const config: GameConfig = {
        type: Phaser.AUTO,
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
        backgroundColor: '#000000',
        scene: [
            MainScene
        ],
        fps: {
            min: 30,
            target: 60
        },
    };

    // TODO: refactor classes
    const game: Phaser.Game = new Phaser.Game(config);
};