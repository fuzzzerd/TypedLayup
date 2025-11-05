import Phaser from 'phaser';
import { GAME_CONFIG, DIFFICULTY_PRESETS } from '../config/gameConfig';
import type { DifficultyLevel, DifficultySettings } from '../config/gameConfig';
import wordsData from '../data/words.json';
import { SoundManager } from '../utils/SoundManager';

interface Ball {
  sprite: Phaser.GameObjects.Arc;
  text: Phaser.GameObjects.Text;
  word: string;
  matchedLetters: number;
  speed: number;
}

interface HighScoreEntry {
  username: string;
  score: number;
  date: string;
  difficulty: DifficultyLevel;
}

export class GameScene extends Phaser.Scene {
  private balls: Ball[] = [];
  private blaster!: Phaser.GameObjects.Rectangle;
  private currentInput: string = '';
  private inputDisplay!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private resetsText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private lives: number = GAME_CONFIG.startingLives;
  private freeResets: number = 1; // Start with 1 free reset
  private spawnTimer!: Phaser.Time.TimerEvent;
  private difficultyTimer!: Phaser.Time.TimerEvent;
  private currentDifficulty: number = 0;
  private words: string[] = [];
  private isPaused: boolean = false;
  private pausedText!: Phaser.GameObjects.Text;
  private activeBall: Ball | null = null;
  private previousActiveBall: Ball | null = null;
  private soundManager!: SoundManager;
  private isGameOver: boolean = false;
  private difficulty: DifficultyLevel = 'medium';
  private difficultySettings!: DifficultySettings;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { difficulty?: DifficultyLevel }) {
    this.difficulty = data.difficulty || 'medium';
    this.difficultySettings = DIFFICULTY_PRESETS[this.difficulty];

    // Reset all game state
    this.isGameOver = false;
    this.score = 0;
    this.lives = GAME_CONFIG.startingLives;
    this.freeResets = 1;
    this.currentDifficulty = 0;
    this.currentInput = '';
    this.balls = [];
    this.activeBall = null;
    this.previousActiveBall = null;
    this.isPaused = false;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Initialize sound manager
    this.soundManager = new SoundManager();

    // Background
    this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);

    // Create retro grid background
    this.createBackgroundGrid(width, height);

    // Load words (filter to 3-8 letters)
    this.words = wordsData.words.filter(word =>
      word.length >= 3 && word.length <= 8
    );

    // Create enhanced blaster
    this.createBlaster(width);

    // Create danger zone indicator at bottom
    this.add.rectangle(0, height - 20, width, 20, 0xff0000, 0.2).setOrigin(0);

    // Create HUD
    this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, {
      fontSize: GAME_CONFIG.fontSize.hud,
      color: GAME_CONFIG.colors.primary,
      fontFamily: 'monospace'
    });

    this.livesText = this.add.text(width - 10, 10, `Lives: ${this.lives}`, {
      fontSize: GAME_CONFIG.fontSize.hud,
      color: GAME_CONFIG.colors.danger,
      fontFamily: 'monospace'
    }).setOrigin(1, 0);

    this.resetsText = this.add.text(width / 2, 10, `Resets: ${this.freeResets}`, {
      fontSize: GAME_CONFIG.fontSize.hud,
      color: GAME_CONFIG.colors.secondary,
      fontFamily: 'monospace'
    }).setOrigin(0.5, 0);

    this.inputDisplay = this.add.text(width / 2, height - 30, '', {
      fontSize: GAME_CONFIG.fontSize.menu,
      color: GAME_CONFIG.colors.secondary,
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Pause text (hidden initially)
    this.pausedText = this.add.text(width / 2, height / 2, 'PAUSED\nPress CTRL+P to Resume', {
      fontSize: GAME_CONFIG.fontSize.title,
      color: GAME_CONFIG.colors.primary,
      fontFamily: 'monospace',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);

    // Setup input handlers
    this.setupInputHandlers();

    // Start spawning balls
    this.startSpawning();

    // Start difficulty progression
    this.difficultyTimer = this.time.addEvent({
      delay: GAME_CONFIG.difficultyIncreaseInterval,
      callback: this.increaseDifficulty,
      callbackScope: this,
      loop: true
    });
  }

  private createBackgroundGrid(width: number, height: number) {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x00ff00, 0.1);

    // Vertical lines
    const gridSize = 40;
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  private createBlaster(width: number) {
    // Create a more detailed blaster with a retro look
    const blasterX = width / 2;
    const blasterY = GAME_CONFIG.blasterY;

    // Main body
    this.blaster = this.add.rectangle(
      blasterX,
      blasterY,
      GAME_CONFIG.blasterWidth,
      GAME_CONFIG.blasterHeight,
      GAME_CONFIG.blasterColor
    );

    // Add barrel/cannon on top
    this.add.rectangle(
      blasterX,
      blasterY - GAME_CONFIG.blasterHeight / 2 - 8,
      12,
      16,
      GAME_CONFIG.blasterColor
    );

    // Add glow effect
    this.tweens.add({
      targets: this.blaster,
      alpha: { from: 1, to: 0.7 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private setupInputHandlers() {
    // Handle letter typing
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // Handle pause (CTRL+P)
      if (event.ctrlKey && key === 'p') {
        event.preventDefault(); // Prevent browser print dialog
        this.togglePause();
        return;
      }

      // Handle fullscreen (CTRL+ENTER)
      if (event.ctrlKey && key === 'enter') {
        event.preventDefault();
        this.toggleFullscreen();
        return;
      }

      if (this.isPaused) return;

      // Handle ENTER - attempt to fire
      if (key === 'enter') {
        this.attemptFire();
        return;
      }

      // Handle ESCAPE - clear input (requires a free reset)
      if (key === 'escape') {
        this.attemptReset();
        return;
      }

      // Handle letter input
      if (key.length === 1 && key.match(/[a-z]/)) {
        this.currentInput += key;
        this.soundManager.playType();
        this.updateInputDisplay();
        this.checkForMatches();
      }
    });
  }

  private clearInput() {
    this.currentInput = '';
    this.previousActiveBall = this.activeBall;
    this.activeBall = null;
    this.updateInputDisplay();
    this.updateBallVisuals();
  }

  private attemptReset() {
    if (this.freeResets > 0) {
      // Consume a reset
      this.freeResets--;
      this.resetsText.setText(`Resets: ${this.freeResets}`);

      // Flash resets text
      this.tweens.add({
        targets: this.resetsText,
        alpha: { from: 1, to: 0.5 },
        duration: 100,
        yoyo: true,
        repeat: 1
      });

      // Clear the input
      this.clearInput();
    } else {
      // No resets available - flash the resets text red
      const originalColor = this.resetsText.style.color;
      this.resetsText.setColor('#ff0000');

      // Shake the resets text
      this.tweens.add({
        targets: this.resetsText,
        x: this.resetsText.x + 5,
        duration: 50,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          this.resetsText.setColor(originalColor);
        }
      });

      // Play a negative sound
      this.soundManager.playMiss();
    }
  }

  private updateInputDisplay() {
    this.inputDisplay.setText(this.currentInput ? `> ${this.currentInput}` : '');
  }

  private checkForMatches() {
    // Check if current input matches any ball
    let bestMatch: Ball | null = null;
    let maxMatches = 0;

    for (const ball of this.balls) {
      const matches = this.countMatchingLetters(ball.word, this.currentInput);
      if (matches > maxMatches && matches === this.currentInput.length) {
        maxMatches = matches;
        bestMatch = ball;
      }
    }

    // Track previous active ball for efficient updates
    this.previousActiveBall = this.activeBall;

    if (bestMatch) {
      this.activeBall = bestMatch;
      bestMatch.matchedLetters = this.currentInput.length;
    } else {
      this.activeBall = null;
    }

    this.updateBallVisuals();
  }

  private attemptFire() {
    // Check if we have a valid target
    if (this.activeBall && this.currentInput === this.activeBall.word) {
      // Valid shot - shoot the ball
      this.shootBall(this.activeBall);
    } else if (this.currentInput.length > 0) {
      // Invalid shot - misfire!
      this.misfire();
    } else {
      // No input - just clear
      this.clearInput();
    }
  }

  private misfire() {
    // Play misfire sound
    this.soundManager.playMiss();

    // Clear input immediately to prevent lag
    this.currentInput = '';
    this.previousActiveBall = this.activeBall;
    this.activeBall = null;
    this.updateInputDisplay();

    // Flash the input red
    this.inputDisplay.setColor('#ff0000');
    this.time.delayedCall(200, () => {
      this.inputDisplay.setColor(GAME_CONFIG.colors.secondary);
    });

    // Create misfire effect from blaster
    const misfireShot = this.add.circle(
      this.blaster.x,
      this.blaster.y - 20,
      8,
      0xff0000,
      0.8
    );

    this.tweens.add({
      targets: misfireShot,
      y: this.blaster.y - 80,
      alpha: 0,
      scale: 0.3,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        misfireShot.destroy();
        // Update ball visuals after animation
        this.updateBallVisuals();
      }
    });
  }

  private countMatchingLetters(word: string, input: string): number {
    for (let i = 0; i < input.length; i++) {
      if (i >= word.length || word[i] !== input[i]) {
        return 0;
      }
    }
    return input.length;
  }

  private updateBallVisuals() {
    // OPTIMIZATION: Only update balls that have changed
    // This dramatically reduces the number of text objects being destroyed/created

    // If no active ball and no previous active ball, update all balls (initial state)
    if (!this.activeBall && !this.previousActiveBall) {
      for (const ball of this.balls) {
        this.updateSingleBallVisuals(ball, false, 0);
      }
      return;
    }

    // Update previous active ball (if it exists and is different from current)
    if (this.previousActiveBall && this.previousActiveBall !== this.activeBall) {
      this.updateSingleBallVisuals(this.previousActiveBall, false, 0);
    }

    // Update current active ball (if it exists)
    if (this.activeBall) {
      this.updateSingleBallVisuals(this.activeBall, true, this.activeBall.matchedLetters);
    }
  }

  private updateSingleBallVisuals(ball: Ball, isActive: boolean, matchedCount: number) {
    // Safety check: if text already destroyed (ball was shot), skip
    if (!ball.text || !ball.text.active) return;

    // Destroy old text and create new one with styled content
    ball.text.destroy();

    // Also destroy the old unmatched text if it exists
    if ((ball as any).unmatchedText) {
      (ball as any).unmatchedText.destroy();
      (ball as any).unmatchedText = null;
    }

    // Use the ball sprite's position for text placement
    const ballX = ball.sprite.x;
    const ballY = ball.sprite.y;

    // Build the word text with matched portion highlighted
    const fullWord = ball.word.toUpperCase();
    const matchedPart = fullWord.substring(0, matchedCount);
    const unmatchedPart = fullWord.substring(matchedCount);

    // Create text with manual color styling using Phaser's text styling
    if (matchedCount > 0) {
      // Create a container-like approach with colored segments
      const matchedText = this.add.text(ballX, ballY, matchedPart, {
        fontSize: '18px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#00ff00'
      });

      const unmatchedText = this.add.text(ballX, ballY, unmatchedPart, {
        fontSize: '18px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#ffffff'
      });

      // Measure text width to position unmatched portion
      const matchedWidth = matchedText.width;
      matchedText.setOrigin(0, 0.5);
      unmatchedText.setOrigin(0, 0.5);

      // Center the whole word
      const totalWidth = matchedWidth + unmatchedText.width;
      matchedText.x = ballX - totalWidth / 2;
      unmatchedText.x = matchedText.x + matchedWidth;

      // Store reference to the combined text (we'll use a container approach)
      // For now, just update the main text reference to the first one
      ball.text = matchedText;

      // Store the unmatched text reference so we can clean it up later
      (ball as any).unmatchedText = unmatchedText;
    } else {
      // No matches - just show white text
      ball.text = this.add.text(ballX, ballY, fullWord, {
        fontSize: '18px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
    }

    // Highlight active ball border
    if (isActive) {
      ball.sprite.setStrokeStyle(3, 0xffff00);
    } else {
      ball.sprite.setStrokeStyle(0);
    }
  }

  private shootBall(ball: Ball) {
    const ballX = ball.sprite.x;
    const ballY = ball.sprite.y;

    // Play shoot sound
    this.soundManager.playShoot();

    // CRITICAL FIX: Clear input immediately to prevent lag and dropped letters
    // This ensures that any keystrokes after pressing Enter start fresh
    this.currentInput = '';
    this.previousActiveBall = this.activeBall;
    this.activeBall = null;
    this.updateInputDisplay();

    // Remove ball from array immediately - this prevents visual/position updates
    this.balls = this.balls.filter(b => b !== ball);

    // Destroy text immediately - prevents frozen text during animation
    ball.text.destroy();
    if ((ball as any).unmatchedText) {
      (ball as any).unmatchedText.destroy();
    }

    // Create shot
    const shot = this.add.circle(
      this.blaster.x,
      this.blaster.y,
      GAME_CONFIG.shotRadius,
      GAME_CONFIG.shotColor
    );

    // Animate shot to ball
    this.tweens.add({
      targets: shot,
      x: ballX,
      y: ballY,
      duration: 200,
      onComplete: () => {
        // Play hit sound and animation
        this.soundManager.playHit();
        this.createExplosion(ballX, ballY);
        this.createScorePopup(ballX, ballY, GAME_CONFIG.pointsPerHit);
        shot.destroy();

        // Destroy sprite (text already destroyed, ball already removed from array)
        ball.sprite.destroy();

        // Update score
        const oldScore = this.score;
        this.score += GAME_CONFIG.pointsPerHit;
        this.scoreText.setText(`Score: ${this.score}`);

        // Award free resets every 100 points
        const oldHundreds = Math.floor(oldScore / 100);
        const newHundreds = Math.floor(this.score / 100);
        if (newHundreds > oldHundreds) {
          this.freeResets++;
          this.resetsText.setText(`Resets: ${this.freeResets}`);

          // Flash resets text to indicate award
          this.tweens.add({
            targets: this.resetsText,
            scale: { from: 1, to: 1.3 },
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
          });
        }

        // Update ball visuals after removal
        this.updateBallVisuals();
      }
    });
  }

  private createExplosion(x: number, y: number) {
    // Create particle effect
    const particles: Phaser.GameObjects.Arc[] = [];
    const colors = [0xff6600, 0xffff00, 0xff0000];

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.add.circle(x, y, 4, colors[i % colors.length]);
      particles.push(particle);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
  }

  private createScorePopup(x: number, y: number, points: number) {
    const scoreText = this.add.text(x, y, `+${points}`, {
      fontSize: '24px',
      color: GAME_CONFIG.colors.secondary,
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: scoreText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => scoreText.destroy()
    });
  }

  private removeBall(ball: Ball) {
    ball.sprite.destroy();
    ball.text.destroy();

    // Also destroy the unmatched text if it exists
    if ((ball as any).unmatchedText) {
      (ball as any).unmatchedText.destroy();
    }

    this.balls = this.balls.filter(b => b !== ball);
  }

  private startSpawning() {
    const currentInterval = Math.max(
      this.difficultySettings.minSpawnInterval,
      this.difficultySettings.ballSpawnInterval - (this.currentDifficulty * 200)
    );

    this.spawnTimer = this.time.addEvent({
      delay: currentInterval,
      callback: this.spawnBall,
      callbackScope: this,
      loop: true
    });

    // Spawn first ball immediately
    this.spawnBall();
  }

  private spawnBall() {
    if (this.isPaused) return;

    // Calculate dynamic max balls based on score
    const baseMax = this.difficultySettings.maxSimultaneousBalls;
    const bonusBalls = Math.floor(this.score / 200); // +1 ball every 200 points
    const currentMaxBalls = Math.min(baseMax + bonusBalls, 8); // Cap at 8 balls

    if (this.balls.length >= currentMaxBalls) return;

    const { width } = this.cameras.main;
    const word = Phaser.Utils.Array.GetRandom(this.words);

    // Random X position with margins
    const x = Phaser.Math.Between(
      GAME_CONFIG.ballRadius + 50,
      width - GAME_CONFIG.ballRadius - 50
    );

    // Create ball sprite
    const sprite = this.add.circle(
      x,
      -GAME_CONFIG.ballRadius,
      GAME_CONFIG.ballRadius,
      GAME_CONFIG.ballColor
    );

    // Add texture pattern for basketball look
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    graphics.lineStyle(2, 0x000000);
    graphics.beginPath();
    graphics.arc(0, 0, GAME_CONFIG.ballRadius, 0, Math.PI * 2);
    graphics.strokePath();
    graphics.moveTo(-GAME_CONFIG.ballRadius, 0);
    graphics.lineTo(GAME_CONFIG.ballRadius, 0);
    graphics.moveTo(0, -GAME_CONFIG.ballRadius);
    graphics.lineTo(0, GAME_CONFIG.ballRadius);
    graphics.strokePath();
    graphics.generateTexture('basketball', GAME_CONFIG.ballRadius * 2, GAME_CONFIG.ballRadius * 2);
    graphics.destroy();

    // Create text on ball
    const text = this.add.text(x, -GAME_CONFIG.ballRadius, word.toUpperCase(), {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const speed = Math.min(
      this.difficultySettings.ballStartSpeed + (this.currentDifficulty * this.difficultySettings.ballAcceleration),
      this.difficultySettings.ballMaxSpeed
    );

    const ball: Ball = {
      sprite,
      text,
      word: word.toLowerCase(),
      matchedLetters: 0,
      speed
    };

    this.balls.push(ball);
  }

  private increaseDifficulty() {
    if (this.isPaused) return;
    this.currentDifficulty++;

    // Restart spawn timer with new interval
    this.spawnTimer.remove();
    this.startSpawning();
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    this.pausedText.setVisible(this.isPaused);

    if (this.isPaused) {
      this.spawnTimer.paused = true;
      this.difficultyTimer.paused = true;
    } else {
      this.spawnTimer.paused = false;
      this.difficultyTimer.paused = false;
    }
  }

  private toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }

  update(_time: number, delta: number) {
    if (this.isPaused || this.isGameOver) return;

    const { height } = this.cameras.main;

    // Update ball positions
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      ball.sprite.y += ball.speed * (delta / 1000);

      // Directly sync text positions with ball sprite
      ball.text.y = ball.sprite.y;

      // Also update unmatched text position if it exists
      if ((ball as any).unmatchedText) {
        (ball as any).unmatchedText.y = ball.sprite.y;
      }

      // Check if ball reached bottom
      if (ball.sprite.y > height + GAME_CONFIG.ballRadius) {
        this.removeBall(ball);
        this.loseLife();

        // Clear input if this was the active ball
        if (ball === this.activeBall) {
          this.clearInput();
        }
      }
    }
  }

  private loseLife() {
    if (this.isGameOver) return; // Don't lose more lives if game is already over

    this.lives--;
    this.livesText.setText(`Lives: ${this.lives}`);

    // Play miss sound
    this.soundManager.playMiss();

    // Flash lives text
    this.tweens.add({
      targets: this.livesText,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private gameOver() {
    if (this.isGameOver) return; // Prevent multiple game over calls

    this.isGameOver = true;
    this.spawnTimer.remove();
    this.difficultyTimer.remove();

    // Play game over sound
    this.soundManager.playGameOver();

    // Check if score makes the top 10
    const highScores = this.getHighScores();
    const isTopTen = highScores.length < 10 || this.score > highScores[highScores.length - 1].score;

    // Transition to appropriate scene
    this.time.delayedCall(1000, () => {
      if (isTopTen) {
        // Go to initials input scene
        this.scene.start('InitialsInputScene', {
          score: this.score,
          difficulty: this.difficulty
        });
      } else {
        // Just show high scores
        this.scene.start('HighScoreScene', { newScore: this.score });
      }
    });
  }

  private getHighScores(): HighScoreEntry[] {
    const stored = localStorage.getItem('highScores');
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      // Handle legacy format (array of numbers)
      if (parsed.length > 0 && typeof parsed[0] === 'number') {
        return parsed.map((score: number) => ({
          username: 'AAA',
          score,
          date: new Date().toISOString(),
          difficulty: 'medium' as DifficultyLevel
        }));
      }
      // Handle entries without difficulty field
      return parsed.map((entry: any) => ({
        username: entry.username,
        score: entry.score,
        date: entry.date,
        difficulty: entry.difficulty || 'medium' as DifficultyLevel
      }));
    } catch {
      return [];
    }
  }
}
