import { createAnimations } from "./animations.js";

const config = {
    type: Phaser.AUTO, // webgl, canvas
    width: 256,
    height: 244,
    backgroundColor: '#049cd8',
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload, // se ejecuta para precargar recursos
        create, // se ejecuta cuando el juego comienza
        update // se ejecuta en cada frame
    }
};

new Phaser.Game(config);

function preload() {
    this.load.image('nube1', '../assets/scenery/overworld/cloud1.png');
    this.load.image('nube2', '../assets/scenery/overworld/cloud2.png');
    this.load.image('floor', '../assets/scenery/overworld/floorbricks.png');
    this.load.image('block', '../assets/blocks/overworld/block.png');
    this.load.spritesheet('mario', '../assets/entities/mario.png', { frameWidth: 18, frameHeight: 16 });
    this.load.spritesheet('mistery', '../assets/blocks/overworld/misteryBlock.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('pipe1', '../assets/scenery/vertical-small-tube.png');
    this.load.image('pipe2', '../assets/scenery/vertical-medium-tube.png');
    this.load.image('pipe3', '../assets/scenery/vertical-large-tube.png.png');
    this.load.audio('gameover', '../assets/sound/music/gameover.mp3');
    this.load.spritesheet('goomba', '../assets/entities/overworld/goomba.png', { frameWidth: 16, frameHeight: 14 });
}

function create() {
    // Añadir fondo y elementos decorativos
    this.add.image(100, 50, 'nube1').setOrigin(0, 0).setScale(0.15);
    this.add.image(200, 30, 'nube2').setOrigin(0, 0).setScale(0.15);
    this.add.image(300, 60, 'nube1').setOrigin(0, 0).setScale(0.15);
    this.add.image(400, 35, 'nube2').setOrigin(0, 0).setScale(0.15);

    // Añadir grupos de objetos estáticos
    this.floor = this.physics.add.staticGroup();
    this.block = this.physics.add.staticGroup();
    this.pipe = this.physics.add.staticGroup();

    // Crear secciones del suelo
    createFloorPiece.call(this, 0);
    createFloorPiece.call(this, 125);
    createFloorPiece.call(this, 225);
    createFloorPiece.call(this, 325);
    createFloorPiece.call(this, 395);
    createFloorPiece.call(this, 495);
    createFloorPiece.call(this, 595);
    createFloorPiece.call(this, 700);
    createFloorPiece.call(this, 860);
    createFloorPiece.call(this, 960);
    createFloorPiece.call(this,1140);

    // Crear bloques y tuberías
    this.blocks = this.block.create(100, 155, 'mistery');
    this.block.create(175, 155, 'block');
    this.block.create(190, 155, 'mistery');
    this.block.create(205, 155, 'block');
    this.block.create(220, 155, 'mistery');
    this.block.create(205, 95, 'mistery');
    this.block.create(235, 155, 'block');
    this.pipe.create(290, 196, 'pipe1');
    this.pipe.create(420, 188, 'pipe2');
    this.pipe.create(570, 181, 'pipe3');
    this.pipe.create(720, 181, 'pipe3');
    this.block.create(975, 155, 'block');
    this.block.create(990, 155, 'mistery');
    this.block.create(1006, 155, 'block');
    this.block.create(1021, 110, 'block');
    this.block.create(1037, 110, 'block');
    this.block.create(1053, 110, 'block');
    this.block.create(1069, 110, 'block');
    this.block.create(1083, 110, 'block');
    this.block.create(1141, 110, 'block');
    this.block.create(10153, 110, 'block');
    this.block.create(10165, 110, 'block');

    // Crear Goomba
    this.velocitys = -25;
    this.goomba = this.physics.add.sprite(100, 210, 'goomba')
        .setOrigin(0, 1)
        .setCollideWorldBounds(true)
        .setGravityY(300)
        .setVelocityX(this.velocitys); // Goomba camina a la izquierda

    this.goomba.body.onWorldBounds = true; // Habilitar detección de límites del mundo

    // Crear Mario
    this.mario = this.physics.add.sprite(50, 210, 'mario')
        .setOrigin(0, 1)
        .setCollideWorldBounds(true)
        .setGravityY(300);

    this.physics.world.setBounds(0, 0, 2000, config.height);
    this.physics.world.setBoundsCollision(true, true, false, false); // Habilitar colisiones con los límites del mundo

    // Añadir colisionadores
    this.physics.add.collider(this.mario, this.floor);
    this.physics.add.collider(this.mario, this.block);
    this.physics.add.collider(this.mario, this.pipe);
    this.physics.add.collider(this.goomba, this.floor);
    this.physics.add.collider(this.goomba, this.pipe, () => {
        reverseGoombaDirection.call(this, this.goomba);
    });

    // Lógica para cambiar la dirección del Goomba cuando choca con los límites del mundo
    this.physics.world.on('worldbounds', (body) => {
        if (body.gameObject === this.goomba) {
            reverseGoombaDirection.call(this, this.goomba);
        }
    });

    // Añadir cámara que sigue a Mario
    this.cameras.main.setBounds(0, 0, 2000, config.height);
    this.cameras.main.startFollow(this.mario);

    // Crear animaciones para los bloques de misterio
    this.anims.create({
        key: 'mistery-box',
        frames: this.anims.generateFrameNumbers('mistery', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    // Asignar animaciones a todos los bloques de misterio
    this.block.children.iterate(function (child) {
        if (child.texture.key === 'mistery') {
            child.anims.play('mistery-box');
        }
    });

    createAnimations(this);

    this.keys = this.input.keyboard.createCursorKeys();
}

// Función para crear una sección del suelo
function createFloorPiece(x) {
    this.floor.create(x, config.height, 'floor').setOrigin(0, 1).refreshBody();
}

// Función para cambiar la dirección del Goomba
function reverseGoombaDirection(goomba) {
    goomba.setVelocityX(this.velocitys * -1);
    this.velocitys *= -1; // Cambiar la dirección de la velocidad
}

function update() {
    this.goomba.anims.play('goomba-walk', true);

    if (this.mario.isDead) return;

    if (this.keys.left.isDown) {
        this.mario.setVelocityX(-100);
        this.mario.anims.play('mario-walk', true);
        this.mario.flipX = true;
    } else if (this.keys.right.isDown) {
        this.mario.setVelocityX(100);
        this.mario.anims.play('mario-walk', true);
        this.mario.flipX = false;
    } else {
        this.mario.setVelocityX(0);
        this.mario.anims.play('mario-idle', true);
    }

    if (this.keys.up.isDown && this.mario.body.touching.down) {
        this.mario.setVelocityY(-300);
        this.mario.anims.play('mario-jump', true);
    }

    this.physics.add.overlap(this.mario, this.goomba, () => {
        if (!this.mario.isDead) {
            this.mario.isDead = true;
            this.mario.anims.play('mario-dead', true);
            this.mario.setCollideWorldBounds(false);
            this.sound.add('gameover', { volume: 0.2 }).play();
            setTimeout(() => {
                this.mario.setVelocityY(-280);
            }, 100);
            setTimeout(() => {
                this.scene.restart();
            }, 1400);
        }
    });

    if (this.mario.y >= config.height) {
        this.mario.isDead = true;
        this.mario.anims.play('mario-dead', true);
        this.mario.setCollideWorldBounds(false);
        this.sound.add('gameover', { volume: 0.2 }).play();
        setTimeout(() => {
            this.mario.setVelocityY(-280);
        }, 100);
        setTimeout(() => {
            this.scene.restart();
        }, 1400);
    }
}
