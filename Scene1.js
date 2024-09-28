class PreGame extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'preGame' });
        
    }
    preload ()
    {
        this.load.image('background', `https://play.rosebud.ai/assets/background2.png.png?zmup`); // Load the background image
        this.load.image('title', `https://play.rosebud.ai/assets/title.JPG.JPG?i0tO`);
        this.load.audio('backgroundmusic', `https://play.rosebud.ai/assets/background-music-1.mp3.mp3?pY1G`); 
         
        var newFont= new FontFace('Press Start 2P', 'url(' + `https://play.rosebud.ai/assets/PressStart2P.ttf.ttf?cp5x` + ')');
        newFont.load().then(function(loaded_face) {
            document.fonts.add(loaded_face);
        }).catch(function(error) {
            // error occurred
            console.log(error);
        });
    

     }

    create ()
    {
        
        
        // Creating a tile sprite for the background that covers the entire world
        const background = this.add.tileSprite(0, 0, 3200, 2400, 'background').setOrigin(0);
        background.setDepth(-3);

        // Display the game title at the top of the screen
        const title = this.add.image(400, 70, 'title').setScale(0.8);
        title.setOrigin(0.5, 0);
        title.setDepth(1);
        
    // Add title text
        this.add.text(400, 220, 'Are you ready to survive?', { fontSize: '28px', fill: '#FFF', fontFamily: '"Press Start 2P"' }).setOrigin(0.5);


        // Add title text
        this.add.text(400, 320, 'Choose your path', { fontSize: '28px', fill: '#FFF', fontFamily: '"Press Start 2P"' }).setOrigin(0.5);

        // Add buttons for setting difficulty level
        const easy = this.add.text(400, 370, 'Easy', { fontSize: '24px', fill: '#0F0', fontFamily: '"Press Start 2P"' }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.startGame('easy'));
        const hero = this.add.text(400, 420, 'Hero', { fontSize: '24px', fill: '#FF0', fontFamily: '"Press Start 2P"' }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.startGame('normal'));
        const nightmare = this.add.text(400, 470, 'Nightmare', { fontSize: '24px', fill: '#F00', fontFamily: '"Press Start 2P"' }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.startGame('nightmare'));
        
    }

    startGame(difficulty)
    {
        this.scene.start('game', { difficulty: difficulty });
    }


}

class Game extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'game' });
        this.maxZoom = 0.5; // maximum zoom level
        this.minZoom = 1.5; // minimum zoom level
        this.axeGroup = null;
        this.maxAxes = 1; // Start with 1 axe allowed
        this.enemyTypes = ['oger', 'maskedwolf', 'shroom','boulder','guard','bigwolf'];
        this.enemyAttributes = {
            'oger': { health: 100, speed: 130, damage: 40, sprite: 'oger' },
            'maskedwolf': { health: 30, speed: 130, damage: 20, sprite: 'maskedwolf' },
            'shroom': { health: 15, speed: 140, damage: 10, sprite: 'shroom' },
            'bigshroom': { health: 50, speed: 160, damage: 20, sprite: 'bigshroom' },
            'bigwolf': { health: 70, speed: 170, damage: 30, sprite: 'bigwolf' },
            'boulder': { health: 150, speed: 150, damage: 50, sprite: 'boulder' },
            'guard': { health: 120, speed: 200, damage: 40, sprite: 'guard' }
        };
      
        this.currentWaveIndex = 0;
        this.playerOnFire = false; // Flag for when the player is on fire
        this.keyPressed = false; // Flag for when any key is pressed by the player


        // Tracking variables
        this.axesShot = 0;   // Number of axes shot
        this.potionsCollected = 0;  // Number of potions collected
        this.firesCollected = 0; // Number of fires collected
        this.enemiesKilled = 0; // Number of fires collected
        this.gameTime = 0;  //Total game time
        this.stepsTaken = 0; //Number of steps taken by player
        this.isGameOver = false; // Add this line
        this.playerImmunityTime = 0; // Add this line
        this.lastFireTime = 0; // Add this line
        this.hasFinalSoundPlayed = false;
        this.waveSpawned = false; // Add this flag

    }

    init(data)
    {
        this.difficulty = data.difficulty;
    }

    preload ()
    {
        this.load.spritesheet('player_idle', `https://play.rosebud.ai/assets/player.png.png?eEJJ`, { frameWidth: 32, frameHeight: 32 }); 
        this.load.spritesheet('player_move', `https://play.rosebud.ai/assets/player.png.png?eEJJ`, { frameWidth: 32, frameHeight: 32 }); 
        this.load.spritesheet('oger', `https://play.rosebud.ai/assets/oger32x32-centered.png.png?iBQx`, { frameWidth: 32, frameHeight: 32 }); 
        this.load.spritesheet('maskedwolf', `https://play.rosebud.ai/assets/maskedwolf18x18.png.png?NwOg`, { frameWidth: 18, frameHeight: 18 }); 
        this.load.spritesheet('bigwolf', `https://play.rosebud.ai/assets/bigwolf32x32.png.png?xNNv`, { frameWidth: 32, frameHeight: 32 }); 
        this.load.image('axe', `https://play.rosebud.ai/assets/sword.png.png?9xX2`); // Load the axe sprite
        this.load.image('background', `https://play.rosebud.ai/assets/background2.png.png?zmup`); // Load the background image
        this.load.spritesheet('shroom', `https://play.rosebud.ai/assets/shroom16x16.png.png?N7Mi`, { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('bigshroom', `https://play.rosebud.ai/assets/bigshroom32x32.png.png?alBP`, { frameWidth: 32, frameHeight: 32 });
        this.load.image('lifepotion', `https://play.rosebud.ai/assets/lifepotion.png.png?WHEu`);
        this.load.spritesheet('smoke', `https://play.rosebud.ai/assets/Smoke VFX 2.png.png?bMXM`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('fire', `https://play.rosebud.ai/assets/fire.png.png?UWcq`, { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('coin', `https://play.rosebud.ai/assets/fire.png.png?UWcq`, { frameWidth: 18, frameHeight: 18 });
        this.load.spritesheet('boulder', `https://play.rosebud.ai/assets/boulder48x48.png.png?3foM`, { frameWidth: 52, frameHeight: 48 });
        this.load.spritesheet('guard', `https://play.rosebud.ai/assets/guard.png.png?j9zk`, { frameWidth: 32, frameHeight: 32 });
        this.load.image('title', `https://play.rosebud.ai/assets/title.JPG.JPG?i0tO`);
        this.load.image('restart', `https://play.rosebud.ai/assets/restart.JPG.JPG?Xxvj`);
        this.load.image('shadow', `https://play.rosebud.ai/assets/shadow16x16.png.png?SW9s`);
        this.load.audio('backgroundmusic', `https://play.rosebud.ai/assets/background-music-1.mp3.mp3?pY1G`); 
        this.load.audio('firepickup', `https://play.rosebud.ai/assets/ignition.wav.wav?NNid`); 
        this.load.audio('fireburn', `https://play.rosebud.ai/assets/flame.wav.wav?UPvZ`); 
        this.load.audio('axethrow', `https://play.rosebud.ai/assets/swish-9.wav.wav?qTVm`); 
        this.load.audio('enemyhitaxe', `https://play.rosebud.ai/assets/enemyhit.mp3.mp3?oOnt`); 
        this.load.audio('playerhit', `https://play.rosebud.ai/assets/aw01.wav.wav?2QeS`); 
        this.load.audio('drinkpotion', `https://play.rosebud.ai/assets/drinkpotion.mp3.mp3?dEuN`); 
        this.load.audio('playerdeath', `https://play.rosebud.ai/assets/playerdeath.mp3.mp3?gou6`); 
        this.load.audio('playerwin', `https://play.rosebud.ai/assets/bravo.mp3.mp3?1NS0`); 
        
        var newFont= new FontFace('Press Start 2P', 'url(' + `https://play.rosebud.ai/assets/PressStart2P.ttf.ttf?cp5x` + ')');
        newFont.load().then(function(loaded_face) {
            document.fonts.add(loaded_face);
        }).catch(function(error) {
            // error occurred
            console.log(error);
        });
    


     }

    create ()
    {
        
        this.input.setDefaultCursor('crosshair');
        
        this.physics.world.setBounds(0, 0, 3200, 2400); // Making the world 4 times larger

        // Creating a tile sprite for the background that covers the entire world
        const background = this.add.tileSprite(0, 0, 3200, 2400, 'background').setOrigin(0);
        background.setDepth(-3);

        // Display the game title at the top of the screen
        const title = this.add.image(1600, 970, 'title').setScale(0.8);
        title.setOrigin(0.5, 0);
        title.setDepth(-2);

        //Add background music
        this.backgroundMusic = this.sound.add('backgroundmusic', { loop: true });
        this.backgroundMusic.play(); 

        this.events.on('shutdown', () => {
            this.backgroundMusic.stop();
            this.hasSoundPlayed = false;
        });


        // Play the music again when the scene starts
        this.events.on('start', () => {
            this.hasSoundPlayed = false;
        });

        // Add start text
        this.startText = this.add.text(1600, 1100, 
            "Press any key to start", 
            { fontSize: '18px', fill: '#FFF', fontFamily: '"Press Start 2P"' });
        this.startText.setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: this.startText,
            alpha: { start: 1, to: 0 },
            duration: 500,
            ease: 'Linear',
            repeat: -1,
            yoyo: true
        });
        
        // Add insdtructions text
        this.instructionsText = this.add.text(1600, 1350, 
            "-Use arrow keys or 'wsad' to move \n\n-Mouse click to shoot \n\n-Mouse scroll to zoom in and out\n\n-'M' to toggle music", 
            { fontSize: '18px', fill: '#FFF', fontFamily: '"Press Start 2P"' });
        this.instructionsText.setOrigin(0.5, 0.5);

        // Create a physics group for the lifepotions
        this.lifepotionGroup = this.physics.add.group();
        
        
        this.player = this.physics.add.sprite(1600, 1200, 'player_idle'); 
        this.player.setScale(1.5); 
        this.player.setCollideWorldBounds(true); // Prevent player from moving out of the game world
        this.playerShadow = this.add.image(1600, 1200, 'shadow'); // New line: add player shadow sprite
        this.playerShadow.setScale(0.5);

        // Setting the camera to follow the player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 3200, 2400); // Set camera bounds to match the world size
        this.cameras.main.setZoom(); // Zoom out to make the larger world visible

        // Add mouse scroll wheel event for zooming
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const zoomAmount = 0.05; // Tune this value for the zoom speed
            if (deltaY > 0) {
                if (this.cameras.main.zoom > this.maxZoom) {
                this.cameras.main.zoom -= zoomAmount;
                }
                
            } else if (deltaY < 0) {
                if (this.cameras.main.zoom < this.minZoom) {
                this.cameras.main.zoom += zoomAmount;
                }
                
            }
        });


        // Create a physics group for the axes
        this.axeGroup = this.physics.add.group({
            maxSize: Infinity // Set the maximum size of the group to Infinity
        });


        // Setup collision between player and life potion
        this.physics.add.overlap(this.player, this.lifepotionGroup, this.collectLifePotion, null, this);

        // Create a physics group for the enemies
        this.enemyGroup = this.physics.add.group();
        

        // Add a collider between the enemies
        this.physics.add.collider(this.enemyGroup);
    
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        }); 

        this.anims.create({
            key: 'move',
            frames: this.anims.generateFrameNumbers('player_move', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        // Create animations for each enemy type
        this.anims.create({
            key: 'oger_move',
            frames: this.anims.generateFrameNumbers('oger', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'maskedwolf_move',
            frames: this.anims.generateFrameNumbers('maskedwolf', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'bigwolf_move',
            frames: this.anims.generateFrameNumbers('bigwolf', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'shroom_move',
            frames: this.anims.generateFrameNumbers('shroom', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'bigshroom_move',
            frames: this.anims.generateFrameNumbers('bigshroom', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'guard_move',
            frames: this.anims.generateFrameNumbers('guard', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'boulder_move',
            frames: this.anims.generateFrameNumbers('boulder', { start: 0, end: 4 }),
            frameRate: 5,
            repeat: -1
        });

        // Create the smoke animation
        this.anims.create({
            key: 'smoke_anim',
            frames: this.anims.generateFrameNumbers('smoke', { start: 1, end: 8 }),
            frameRate: 10,
            repeat: 0
        });

        // Create the fire animation
        this.anims.create({
            key: 'fire_anim',
            frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
            
        });

        // Create a physics group for the fire power-ups
        this.firePowerupGroup = this.physics.add.group();

        // Create a physics group for the fire surrounding the player
        this.playerFireGroup = this.physics.add.group();

        // Setup collision between player and fire power-up
        this.physics.add.overlap(this.player, this.firePowerupGroup, this.collectFirePowerup, null, this);
     
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        };

        switch (this.difficulty) {
            case 'easy':
                this.waveComposition = [
                    {'shroom': 5,},
                    {'shroom': 8},
                    {'shroom': 8, 'bigshroom':2},
                    {'maskedwolf': 8},
                    {'maskedwolf': 8,'bigwolf':2},
                    {'shroom': 8, 'maskedwolf': 8,},
                    {'bigshroom':2,'bigwolf':2, 'shroom': 4, 'maskedwolf': 4,},
                    {'oger':3},
                    {'shroom':5,'maskedwolf':5},
                    {'bigshroom':3,'bigwolf':3, 'oger': 3},
                    {'guard':3},
                    {'shroom':5,'maskedwolf':5},
                    {'guard':3,'oger': 3},
                    {'boulder':5}
                ];
                break;
            case 'normal':
                this.waveComposition = [
                    {'shroom': 10, 'maskedwolf': 5},
                    {'shroom': 10, 'maskedwolf': 10},
                    {'bigshroom': 5, 'shroom':10},
                    {'maskedwolf': 10, 'bigwolf': 5},
                    {'bigwolf': 8, 'bigshroom':8}, 
                    {'oger': 8,},
                    {'bigshroom': 8, 'bigwolf':8},
                    {'guard': 5,},
                    {'shroom': 10, 'bigshroom': 5, 'bigwolf':5},
                    {'guard': 5, 'boulder': 5},
                    {'bigshroom': 10, 'bigwolf': 10},
                    {'guard':5, 'boulder':5},
                    {'guard':10, 'boulder':10}
                ];
                break;
            case 'nightmare':
                this.waveComposition = [
                    {'shroom': 10, 'maskedwolf': 5},
                    {'shroom': 15, 'maskedwolf': 10},
                    {'bigshroom': 5, 'shroom':10},
                    {'shroom': 15, 'maskedwolf': 15, 'bigwolf': 5},
                    {'shroom': 10, 'maskedwolf': 10, 'bigwolf': 10, 'bigshroom':10}, 
                    {'oger': 5,},
                    {'shroom': 15, 'bigshroom': 10, 'bigwolf':10},
                    {'guard': 5,},
                    {'shroom': 15, 'bigshroom': 10, 'bigwolf':10},
                    {'guard': 5, 'boulder': 5},
                    {'bigshroom': 15, 'bigwolf': 10},
                    {'bigshroom': 5, 'bigwolf': 5, 'oger': 10, 'guard':5, 'boulder':5},
                    {'bigshroom': 20, 'bigwolf': 20},
                    {'bigshroom': 5, 'bigwolf': 5, 'oger': 10, 'guard':5, 'boulder':5}
                ];
                break;
        }

        this.input.on('pointerdown', (pointer) => {
            if (this.player.visible && this.axeGroup.countActive() < this.maxAxes) {
                const axe = this.axeGroup.create(this.player.x, this.player.y, 'axe');
                axe.setScale(1.5);
                axe.setActive(true);
                axe.setVisible(true);
                this.sound.play('axethrow', {volume : 0.5});
                axe.hitObject = false; 

                const dir = new Phaser.Math.Vector2(pointer.worldX - axe.x, pointer.worldY - axe.y).normalize(); // Modified line

                axe.body.setVelocity(dir.x * 500, dir.y * 500);

                this.physics.world.disableBody(axe);

                this.maxAxes++;
                this.axesShot++; // increment axes shot
            }
        });

        // Add a lifebar to the player
        this.player.health = 100; // Assuming full health is 100
        this.player.lifebar = this.add.rectangle(this.player.x, this.player.y - 40, this.player.health, 10, 0x00ff00);
        this.player.lifebar.setOrigin(0.5, 0.5);
        this.player.lifebar.setScale(0.3);

        this.enemyGroup = this.physics.add.group();

        this.physics.add.overlap(this.player, this.enemyGroup, this.enemyCollision, null, this);

        this.physics.add.collider(this.axeGroup, this.enemyGroup, this.axeHitEnemy, null, this);
        
        // Remove instructions text when any key is pressed and start wave spawning
        this.input.keyboard.on('keydown', () => {
            this.instructionsText.destroy();
            console.log('key Down!');
            this.startText.destroy();
            if (!this.waveSpawned) {
                this.spawnWave();
                console.log('First wave spawned!');
                this.waveSpawned = true;
                const waveTimer = this.time.addEvent({
            delay: 20000,                // ms
            callback: this.spawnWave,
            callbackScope: this,
            loop: true
        });
            }
        });
        

        // This block creates a key input listener for 'M' key
        this.input.keyboard.on('keydown-M', () => {
            this.backgroundMusic.mute = !this.backgroundMusic.mute;
        });   

  }

    gameOver() {

        if (this.endScreenShown) { // Add this condition
            return;
        }
        // Create text for the game over screen
        const gameOverText = this.add.text(1600, 1120, 
            `YOU DIED!`, 
            { fontSize: '80px', fill: '#FFF', fontFamily: '"Press Start 2P"', align: 'center'});
        gameOverText.setOrigin(0.5, 0.5)
        gameOverText.setDepth(-1);

        const endText3 = this.add.text(1600, 1310, 
            `-Run Time: ${Math.floor(this.gameTime)} seconds\n\n-Enemies Killed: ${this.enemiesKilled}\n\n-Pixels walked: ${this.stepsTaken}\n\n-Axes Shot: ${this.axesShot}\n\n-Potions drank: ${this.potionsCollected}\n\n-Fires used: ${this.firesCollected}`, 
            { fontSize: '18px', fill: '#FFF', fontFamily: '"Press Start 2P"', align: 'left' });
        endText3.setOrigin(0.5, 0.5);
        endText3.setDepth(-1);
        
        //move player to the center of the screen
        this.player.x = 1600;
        this.player.y = 1200;
        this.player.disableBody(true, true);
        this.player.setVisible(false);
        this.player.lifebar.destroy();
        this.playerShadow.setVisible(false);
        this.isGameOver = true; // Add this line
        this.playerFireGroup.clear(true, true);
        this.waveSpawned = false; 
        
        // Create restart button
        this.restartIcon = this.add.sprite(1590, 1450, 'restart').setInteractive();
        this.restartIcon.on('pointerdown', () => this.restartGame());
        this.restartIcon.setScale(0.3);

        this.endScreenShown = true; // Add this line

    }
    
    showEndScreen() {
        if (this.endScreenShown) { // Add this condition
            return;
        }

        this.player.x = 1600;
        this.player.y = 1200;
        this.player.setVisible(false);
        this.playerShadow.setVisible(false);
        this.playerFireGroup.clear(true, true);
        this.player.lifebar.destroy();
        this.waveSpawned = false; 
              
        // Create text for the end screen
        const endText = this.add.text(1610, 1100, 
            `BRAVO!`, 
            { fontSize: '84px', fill: '#FFF', fontFamily: '"Press Start 2P"' , align: 'center'});
        endText.setOrigin(0.5, 0.5);
        endText.setDepth(-1);

        const endText2 = this.add.text(1600, 1170, 
            `Adventure complete, hero!`, 
            { fontSize: '24px', fill: '#FFF', fontFamily: '"Press Start 2P"' , align: 'center'});
        endText2.setOrigin(0.5, 0.5);
        endText2.setDepth(-1);

        const endText3 = this.add.text(1600, 1310, 
            `-Run Time: ${Math.floor(this.gameTime)} seconds\n\n-Enemies Killed: ${this.enemiesKilled}\n\n-Pixels walked: ${this.stepsTaken}\n\n-Axes Shot: ${this.axesShot}\n\n-Potions drank: ${this.potionsCollected}\n\n-Fires used: ${this.firesCollected}`, 
            { fontSize: '18px', fill: '#FFF', fontFamily: '"Press Start 2P"', align: 'left' });
        endText3.setOrigin(0.5, 0.5);
        endText3.setDepth(-1);

        // Create restart button
        this.restartIcon = this.add.sprite(1590, 1470, 'restart').setInteractive();
        this.restartIcon.on('pointerdown', () => this.restartGame());
        this.restartIcon.setScale(0.3);
        this.restartIcon.setDepth(-1);

        this.endScreenShown = true; // Add this line
    }

    //Funtion to spawn enemy waves
    spawnWave() {
        if (this.currentWaveIndex >= this.waveComposition.length) {
            return; // No more waves to spawn
        }

        const wave = this.waveComposition[this.currentWaveIndex];
        for (const enemyType in wave) {
            for (let i = 0; i < wave[enemyType]; i++) {
                this.spawnEnemy(enemyType);
            }
        }

        this.currentWaveIndex++;
    }

    spawnEnemy(enemyType) {
        const edge = Phaser.Math.Between(0, 3);
        let x, y;
        switch (edge) {
            case 0: // Top
                x = Phaser.Math.Between(0, 3200);
                y = 0;
                break;
            case 1: // Right
                x = 3200;
                y = Phaser.Math.Between(0, 2400);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(0, 3200);
                y = 2400;
                break;
            case 3: // Left
                x = 0;
                y = Phaser.Math.Between(0, 2400);
                break;
        }

    const attributes = this.enemyAttributes[enemyType];
    const enemy = this.enemyGroup.create(x, y, attributes.sprite);
    enemy.setSize(20, 20); // Adjust the size of the enemy's hitbox here
    enemy.setOffset(6, 6); // Adjust the position of the hitbox if needed
    enemy.setScale(1.5);
    enemy.setCollideWorldBounds(true);
    enemy.health = attributes.health;
    enemy.speed = attributes.speed;
    enemy.damage = attributes.damage;

    // Add a shadow below the enemy
    enemy.shadow = this.add.image(enemy.x, enemy.y + this.textures.get(attributes.sprite).getSourceImage().width, 'shadow'); // Add this line
    // Scale the shadow based on frame width
    const shadowScale = this.textures.get(attributes.sprite).getSourceImage().width / 180;
    enemy.shadow.setScale(shadowScale);

        // Add a lifebar to the enemy
        enemy.lifebar = this.add.rectangle(enemy.x, enemy.y - 40, enemy.health, 10, 0x00ff00);
        enemy.lifebar.setOrigin(0.5, 0.5);
        enemy.lifebar.setScale(0.3);

        // Start the animation for the enemy
        enemy.anims.play(enemyType + '_move', true);
    }

    // Function to handle collision between player and enemies
    enemyCollision(player, enemy) {
        if (this.playerImmunityTime <= 0) { // Check if the player is not immune
            player.health -= enemy.damage; // Reduce player's health by enemy damage
            this.sound.play('playerhit', { volume: 0.3 });
            this.flickerScreen();
            this.playerImmunityTime = 1; // Make the player immune for 1 second
        }
    }   

    //Function to flicker Screen
    flickerScreen() {
    // Create a white rectangle that covers the entire world
    const flash = this.add.rectangle(0, 0, 3200, 2400, 0xff4122);
    flash.setOrigin(0, 0);
    flash.setDepth(100); // Make sure the flash is above everything else

    // Fade out the white rectangle to create a flash effect
    this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 50,
        onComplete: () => {
            flash.destroy(); // Remove the rectangle once the flash is over
        }
    });
}

    // Function to handle an axe hitting an enemy
    axeHitEnemy(axe, enemy) {
        // Check if the axe has not hit an object yet
        if (!axe.hitObject) {
            enemy.health -= 10; // Decrease enemy's health by 10
            axe.hitObject = true; // Set the axe's hitObject property to true
            this.sound.play('enemyhitaxe' , { volume: 0.1 });
        }

        if (enemy.health <= 0) { // If enemy's health drops to 0 or below
            enemy.lifebar.destroy(); // Destroy the lifebar
            enemy.shadow.destroy();  // Destroy the shadow
            this.enemiesKilled++;
            enemy.destroy(); // Destroy the enemy
            this.maxAxes--; // Decrease the maxAxes count as we have destroyed enemy
            // Create a smoke sprite at the enemy's location and play the smoke animation
            const smoke = this.add.sprite(enemy.x, enemy.y, 'smoke');
            smoke.setScale(0.5);
            smoke.play('smoke_anim');

            // Destroy the smoke sprite when the animation completes
            smoke.on('animationcomplete', () => {
                smoke.destroy();
            });
            this.enemyDrop(enemy);
        } else {
            // Make the axe invisible, reset its velocity, and set it to inactive
            axe.setVelocity(0, 0);
            axe.visible = false;
            axe.setActive(false);
        }

    }

   // Function to spawn a fire power-up at a given location 
   spawnFirePowerup(x, y) {
        const fire = this.firePowerupGroup.create(x, y, 'fire');
        fire.setScale(1.5);
        fire.setDepth(-1);
        fire.play('fire_anim');
        this.fireShadow = this.add.image(fire.x, fire.y + 17, 'shadow'); // New line: add player shadow sprite
        this.fireShadow.setScale(0.3);
        this.tweens.add({
            targets: fire,
            y: { from: fire.y - 10, to: fire.y + 10 },
            ease: 'Sine.easeInOut',
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    // Function to handle the player collecting a fire power-up
    collectFirePowerup(player, fire) {
        // If the player is already on fire, don't allow them to collect the powerup
        if (this.playerOnFire) {
            return;
        }
        // Remove the fire power-up from the scene
        fire.destroy();
        this.fireShadow.destroy();

        // Surround the player with fire
        this.surroundPlayerWithFire();

        // Set the player on fire for 10 seconds
        this.playerOnFire = true;
        this.sound.play('firepickup');
        this.time.delayedCall(10000, () => {
            this.playerOnFire = false;
            this.playerFireGroup.clear(true, true);
        });
        this.firesCollected++; // increment fires collected
    }

    surroundPlayerWithFire() {
    const fireCount = 12;
    for (let i = 0; i < fireCount; i++) {
        // Create fire sprite with physics
        const fire = this.physics.add.sprite(this.player.x, this.player.y, 'fire');
        fire.play('fire_anim');
        fire.setScale(1.5);
        fire.angleOffset = i * (360 / fireCount);
        fire.distanceFromPlayer = 90; // increased distance from player in pixels for bigger diameter

        // Add fire to playerFireGroup
        this.playerFireGroup.add(fire);

        // Setup collision between fire and enemies
        this.physics.add.overlap(fire, this.enemyGroup, this.fireHitEnemy, null, this);
    }
}

    fireHitEnemy(fire, enemy) {
    enemy.health -= 1; // Decrease enemy's health by 1
    if (this.lastFireTime <= 0) { // Check last time fire sound played
            this.sound.play('fireburn', { volume: 0.8 });
            this.lastFireTime = 1; // Make the fire sound wait for 1 second
        }
    if (enemy.health <= 0) { // If enemy's health drops to 0 or below
        enemy.lifebar.destroy(); // Destroy the lifebar
        enemy.shadow.destroy();  // Destroy the shadow
        enemy.destroy(); // Destroy the enemy
        this.enemiesKilled++;
        // Create a smoke sprite at the enemy's location and play the smoke animation
        const smoke = this.add.sprite(enemy.x, enemy.y, 'smoke');
        smoke.setScale(0.5);
        smoke.play('smoke_anim');
    

        // Destroy the smoke sprite when the animation completes
        smoke.on('animationcomplete', () => {
            smoke.destroy();
        });
        this.enemyDrop(enemy);
    }
}
   
    // Function to spawn a life potion at a given location
    spawnLifePotion(x, y) {
        const lifepotion = this.lifepotionGroup.create(x, y, 'lifepotion');
        lifepotion.setScale(1.5);
        lifepotion.setDepth(-1);
        this.lifePotionShadow = this.add.image(lifepotion.x, lifepotion.y + 17, 'shadow'); // New line: add player shadow sprite
        this.lifePotionShadow.setScale(0.3);


        this.tweens.add({
            targets: lifepotion,
            y: { from: lifepotion.y - 5, to: lifepotion.y + 5 },
            ease: 'Sine.easeInOut',
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    // Function to handle enemy drops
    enemyDrop(enemy) {
        // Set drop chances
        const lifePotionDropChance = 0.15;
        const firePowerupDropChance = 0.15;

        const randomValue = Math.random();
        if (randomValue < lifePotionDropChance) {
            this.spawnLifePotion(enemy.x, enemy.y);
        } else if (randomValue < lifePotionDropChance + firePowerupDropChance) {
            this.spawnFirePowerup(enemy.x, enemy.y);
        }
    }

    // Function to handle the player collecting a life potion
    collectLifePotion(player, lifepotion) {
        if (player.health < 100){
        player.health += 25; // Increase player's health by 25
        if (player.health > 100) player.health = 100; // Ensure player's health doesn't go above 100
        lifepotion.destroy(); // Remove the life potion from the scene
        this.potionsCollected++; // increment potions collected
        this.sound.play('drinkpotion');
        this.lifePotionShadow.destroy();
        }
    }

    restartGame() {
    // Reset tracking variables
    this.axesShot = 0;
    this.potionsCollected = 0;
    this.firesCollected = 0;
    this.gameTime = 0;
    this.stepsTaken = 0;
    this.enemiesKilled = 0;
    this.endScreenShown = false;
    this.hasFinalSoundPlayed = false;
    this.waveSpawned = false;

    
    
 
    // Reset player's flags and attributes
    this.playerOnFire = false;
    this.player.health = 100;  // Reset player's health

    // Reset the wave index
    this.currentWaveIndex = 0;

    // Reset the axe count
    this.maxAxes = 1;

    // Restart the scene
    this.scene.restart();

    this.isGameOver = false;
}

    update (time, delta)
    {
        this.gameTime += delta / 1000;
        
        // Decrease the immunity time by the time elapsed since the last frame
        this.playerImmunityTime = Math.max(0, this.playerImmunityTime - delta / 500);
        this.lastFireTime = Math.max(0, this.lastFireTime - delta / 500);

        let playerMoving = false;
        if (this.player.visible) {
        if (this.cursors.left.isDown || this.keys.a.isDown)
        {
            this.player.x -= 2.5;
            playerMoving = true;
            this.stepsTaken++; // increment steps taken
        }
        else if (this.cursors.right.isDown || this.keys.d.isDown)
        {
            this.player.x += 2.5;
            playerMoving = true;
            this.stepsTaken++; // increment steps taken
        }

        if (this.cursors.up.isDown || this.keys.w.isDown)
        {
            this.player.y -= 2.5;
            playerMoving = true;
            this.stepsTaken++; // increment steps taken
        }
        else if (this.cursors.down.isDown || this.keys.s.isDown)
        {
            this.player.y += 2.5;
            playerMoving = true;
            this.stepsTaken++; // increment steps taken
        }
        }
        if(playerMoving)
        {
            this.player.anims.play('move', true);
        }
        else
        {
            this.player.anims.play('idle', true);
        }

        // Below the player moving code, add the following lines to move the shadow with the player:
        this.playerShadow.x = this.player.x;
        this.playerShadow.y = this.player.y + 17;

        // Move the enemies towards the player if the game is not over
        if (!this.isGameOver) { // Add this line
            this.enemyGroup.children.iterate((enemy) => {
                const direction = new Phaser.Math.Vector2(this.player.x - enemy.x, this.player.y - enemy.y).normalize();
                enemy.body.setVelocity(direction.x * enemy.speed, direction.y * enemy.speed);
                enemy.setFlipX(direction.x < 0);

                // Update the position of the shadow to follow the enemy
                enemy.shadow.x = enemy.x;
                enemy.shadow.y = enemy.y + (this.textures.get(enemy.texture.key).getSourceImage().height * 0.80) ;
            });
        } else { // Add this line
            this.enemyGroup.children.iterate((enemy) => {
                const direction = new Phaser.Math.Vector2(Phaser.Math.Between(0,0), Phaser.Math.Between(0, 0)).normalize();
                enemy.body.setVelocity(direction.x * 1, direction.y * 1);
            });
        }

        // Update the position of the fires to rotate around the player
        if (this.playerOnFire) {
            this.playerFireGroup.children.iterate((fire) => {
                fire.angleOffset += 2; // rotate speed, increase for faster rotation
                const angle = Phaser.Math.DegToRad(fire.angleOffset);
                fire.x = this.player.x + fire.distanceFromPlayer * Math.cos(angle);
                fire.y = this.player.y + fire.distanceFromPlayer * Math.sin(angle);
            });
        }

        // Push enemies apart if they are too close to each other
    this.enemyGroup.children.each((enemyA, indexA) => {
        this.enemyGroup.children.each((enemyB, indexB) => {
            if (indexA !== indexB) {
                const dist = Phaser.Math.Distance.Between(enemyA.x, enemyA.y, enemyB.x, enemyB.y);
                if (dist < 30) { // 30 should be slightly less than the enemies' size
                    const angle = Phaser.Math.Angle.Between(enemyA.x, enemyA.y, enemyB.x, enemyB.y);
                    const overlap = 30 - dist; // 30 should be slightly less than the enemies' size
                    enemyA.x -= Math.cos(angle) * overlap;
                    enemyA.y -= Math.sin(angle) * overlap;
                    enemyB.x += Math.cos(angle) * overlap;
                    enemyB.y += Math.sin(angle) * overlap;
                }
            }
        });
    });

        // Make the axe invisible, reset its velocity, and set it to inactive once it goes off screen
        this.axeGroup.children.iterate((axe) => {
            if (!Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, axe.getBounds())) {
                axe.setVelocity(0, 0);
                axe.visible = false;
                axe.setActive(false);
            } else {
                axe.angle += 10; // Spin the axe while it's being shot
            }
        });

        // Update the width of the lifebars based on the health of their associated entity
        this.player.lifebar.width = this.player.health;
        this.enemyGroup.children.iterate((enemy) => {
            enemy.lifebar.width = enemy.health; // Update enemy's lifebar width
        });

        // Update the position of the lifebars to follow their entities
        this.player.lifebar.setX(this.player.x);
        this.player.lifebar.setY(this.player.y - 20);
        this.enemyGroup.children.iterate((enemy) => {
            enemy.lifebar.setX(enemy.x);
            enemy.lifebar.setY(enemy.y - 30); // Update enemy's lifebar position
        });

        // Check if all enemy waves have been cleared
        if (this.currentWaveIndex >= this.waveComposition.length && this.enemyGroup.countActive() === 0) {
            if (!this.hasFinalSoundPlayed) {
                    this.sound.play('playerwin');
                    this.hasFinalSoundPlayed = true;
            }
            this.showEndScreen(); // Show end screen
        }

        // Check player's health
        if (this.player.health <= 0) {
            this.gameOver();
            if (!this.hasFinalSoundPlayed) {
                    this.sound.play('playerdeath');
                    this.hasFinalSoundPlayed = true;
            }
            
            
        }
        
    }
}

const container = document.getElementById('renderDiv');
const config = {
    type: Phaser.AUTO,
    parent: 'renderDiv',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity
            debug: false
        }
    },
    scene: [PreGame, Game]

};

window.phaserGame = new Phaser.Game(config);