import {Player} from './player.js';
import {InputHandler} from './input.js';
import {Background} from './background.js';
import {FlyingEnemy, GroundEnemy, ClinbingEnemy} from './enemies.js';
import {UI} from './UI.js';

window.addEventListener('load', function() {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');

    canvas.width = 500;
    canvas.height = 500;

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;

            this.speed = 0;
            this.maxSpeed = 4;

            this.groundMargin = 80;

            this.background = new Background(this);

            this.player = new Player(this);

            this.input = new InputHandler(this);

            this.UI = new UI(this);

            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;

            this.particles = [];
            this.maxParticles = 200;

            this.colisions = [];

            this.floatingMessages = [];

            this.debug = false;

            this.score = 0;

            this.lives = 5;

            this.fontColor = 'black';

            this.time = 0;
            this.maxTime = 10000;
            this.gameOver;

            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
        }

        update(deltaTime) {
            this.time += deltaTime; 

            if (this.time > this.maxTime) this.gameOver = true;

            this.background.update();
            this.player.update(this.input.keys, deltaTime);

            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            }
            else this.enemyTimer += deltaTime;

            this.enemies.forEach(enemy => {
                enemy.update(deltaTime);
                if (enemy.markedForDeletion) this.enemies.splice(this.enemies.indexOf(enemy), 1);
            });

            this.floatingMessages.forEach(message => {
                message.update();
            });

            this.particles.forEach((particles, index) => {
                particles.update();
                if (particles.markedForDeletion) this.particles.splice(index, 1);
            });

            if (this.particles.length > this.maxParticles) {
                this.particles = this.particles.slice(0, this.maxParticles);
            }

            this.colisions.forEach((colision, index) => {
                colision.update(deltaTime);

                if (colision.markedForDeletion) this.colisions.splice(index, 1);
            });

            this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion);
        }

        draw(context) {
            this.background.draw(context);
            this.player.draw(context);

            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });

            this.particles.forEach(particles => {
                particles.draw(context);
            });

            this.colisions.forEach(colision => {
                colision.draw(context);
            });

            this.floatingMessages.forEach(message => {
                message.draw(context);
            });

            this.UI.draw(context);
        }

        addEnemy() {
            if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this)); 
            else if (this.speed > 0) this.enemies.push(new ClinbingEnemy(this));
            this.enemies.push(new FlyingEnemy(this));
        }
    }

    const game = new Game(canvas.width, canvas.height);

    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;

        lastTime = timeStamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        game.update(deltaTime);
        game.draw(ctx);

        if (!game.gameOver) requestAnimationFrame(animate);
    }

    animate(0);
});