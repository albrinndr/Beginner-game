import * as Phaser from 'phaser';
import { Physics, Scene } from 'phaser';
export class Game extends Scene {
  private player!: Physics.Arcade.Sprite;
  private platforms!: Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private stars!: Physics.Arcade.Group;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private bombs!: Physics.Arcade.Group;
  private gameOver = false;
  private retryButton?: Phaser.GameObjects.Image;

  constructor() {
    super('Game');
  }

  preload() {
    this.load.setPath('assets');

    this.load.image('sky', 'sky.png');
    this.load.image('ground', 'platform.png');
    this.load.image('star', 'star.png');
    this.load.image('bomb', 'bomb.png');
    this.load.image('retry', 'retry.png');
    this.load.spritesheet('dude', 'dude.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  /* create is for static values and update is to add dynamic values, like the player movement. 
   The create method is called once when the scene is created, while the update method is called on every frame of the game loop. */

  create() {
    this.score = 0;
    this.gameOver = false;
    this.add.image(400, 300, 'sky');

    // Platforms group
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    console.log('Platform children:', this.platforms.getChildren());

    console.log('Platform body:', this.platforms.getChildren()[0].body);

    // Player group
    this.player = this.physics.add.sprite(100, 450, 'dude');

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    /*this adds gravity to the player, like a force that pulls the player down, simulating the effect of gravity.
     The value of 300 is the strength of the gravity applied to the player*/
    // (this.player.body as Phaser.Physics.Arcade.Body).setGravityY(300);
    this.physics.add.collider(this.player, this.platforms);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard!.createCursorKeys();

    //star group
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.getChildren().forEach(child => {
      const star = child as Physics.Arcade.Image;

      star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.stars, this.platforms);

    const collectStar: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
      playerObj,
      starObj,
    ) => {
      const player = playerObj as Physics.Arcade.Sprite;
      const star = starObj as Physics.Arcade.Image;

      star.disableBody(true, true);

      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);

      if (this.stars.countActive(true) === 0) {
        // re-drop all stars
        this.stars.getChildren().forEach(child => {
          const s = child as Physics.Arcade.Image;
          s.enableBody(true, s.x, 0, true, true);
        });

        // spawn a bomb on the opposite side from the player
        const x =
          player.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400);

        const bomb = this.bombs.create(x, 16, 'bomb') as Physics.Arcade.Image;
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      }
    };

    this.physics.add.overlap(
      this.player,
      this.stars,
      collectStar,
      undefined,
      this,
    );

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      color: '#000',
    });

    // bomb group
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    const hitbomb: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
      playerObj,
      _bomb,
    ) => {
      const player = playerObj as Physics.Arcade.Sprite;

      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      this.gameOver = true;

      this.retryButton = this.add
        .image(400, 300, 'retry')
        .setDisplaySize(60, 60) // adjust to your image's proportions
        .setDepth(10)
        .setInteractive({ useHandCursor: true });

      this.retryButton.on('pointerover', () =>
        this.retryButton?.setTint(0xdddddd),
      );
      this.retryButton.on('pointerout', () => this.retryButton?.clearTint());
      this.retryButton.on('pointerdown', () => {
        this.scene.restart();
      });
    };

    this.physics.add.collider(
      this.player,
      this.bombs,
      hitbomb,
      undefined,
      this,
    );
  }

  update() {
    if (!this.cursors || this.gameOver) return;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play('turn');
    }

    const body = this.player.body as Physics.Arcade.Body;
    if (this.cursors.up.isDown && body.blocked.down) {
      this.player.setVelocityY(-330);
    }
  }
}
