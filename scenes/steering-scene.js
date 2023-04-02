import EasyStar from 'easystarjs';

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png';
import dungeonRoomJson from '../assets/dungeon_room.json';
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png';
import punkSpriteSheet from '../assets/sprites/characters/punk.png';
import blueSpriteSheet from '../assets/sprites/characters/blue.png';
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png';
import greenSpriteSheet from '../assets/sprites/characters/green.png';
import slimeSpriteSheet from '../assets/sprites/characters/slime.png';
import CharacterFactory from "../src/characters/character_factory";

import Vector2 from 'phaser/src/math/Vector2'
import {Pursuit} from '../src/ai/steerings/pursuit';
import {Evade} from '../src/ai/steerings/evade';
import {Seek} from '../src/ai/steerings/seek';

let SteeringScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function SteeringScene() {
        Phaser.Scene.call(this, {key: 'SteeringScene'});
    },

    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    preload: function () {
        //loading map tiles and json with positions
        this.load.image('tiles', tilemapPng);
        this.load.tilemapTiledJSON('map', dungeonRoomJson);

        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
    },

    create: function () {
        this.gameObjects = [];

        this.tileSize = 32;
        this.steerings = [];

        const map = this.make.tilemap({key: 'map'});

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage('Dungeon_Tileset', 'tiles');

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        map.createLayer('Floor', tileset, 0, 0);
        const worldLayer = map.createLayer('Walls', tileset, 0, 0);
     //   const aboveLayer = map.createLayer('Upper', tileset, 0, 0);

        // Setup for A-star
        this.finder = new EasyStar.js();
        const grid = [];
        for (let y = 0; y < worldLayer.tilemap.height; y++) {
            const col = [];
            for (let x = 0; x < worldLayer.tilemap.width; x++) {
                const tile = worldLayer.tilemap.getTileAt(x, y);
                col.push(tile ? tile.index : 0);
            }
            grid.push(col);
        }

        this.finder.setGrid(grid);
        this.finder.setAcceptableTiles([0]);

        // Setup for collisions
        worldLayer.setCollisionBetween(1, 500);
        // aboveLayer.setDepth(10);

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.characterFactory = new CharacterFactory(this);

        //Creating characters
        this.player = this.characterFactory.buildCharacter('green', 100, 100, {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);

        this.NPCs = this.physics.add.group();
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.RND.between(50, this.physics.world.bounds.width - 50);
            const y = Phaser.Math.RND.between(50, this.physics.world.bounds.height - 50);

            const npc = this.characterFactory.buildNonPlayerCharacter("blue", x, y);
            npc.setSteerings([
                new Seek(npc, [this.player], 1, npc.speed, this.player.speed)
            ]);
            this.physics.add.collider(npc, this.NPCs);
            this.NPCs.add(npc);
            this.physics.add.collider(npc, worldLayer);
            this.gameObjects.push(npc);
        }
        this.physics.add.collider(this.player, this.NPCs);

        this.input.keyboard.on("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });
    },
    update: function () {
        if (this.gameObjects) {
            this.gameObjects.forEach(function (element) {
                element.update();
            });
        }

    },
    tilesToPixels(tileX, tileY) {
        return [tileX * this.tileSize, tileY * this.tileSize];
    }
});

export default SteeringScene