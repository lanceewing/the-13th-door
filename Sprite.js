class Sprite extends HTMLElement {

    // These are constants use to represent the different directions.
    static LEFT = 0x01;
    static RIGHT = 0x02;
    static IN = 0x03;
    static OUT = 0x04;

    /**
     * Constructor for Sprite.
     */
    constructor() {
        super();
    }

    /**
     * Initialise the position and size of the Sprite.
     * 
     * @param {Game} game
     * @param {number} width 
     * @param {number} height 
     * @param {string} content
     * @param {boolean} shadow 
     */
    init(game, width, height, content, shadow = true, flip = false) {
        this.game = game;

        this.width = width;
        this.height = height;
        this.style.width = width + 'px';
        this.style.height = height + 'px';
        this.style.setProperty('--sprite-width', width + 'px');

        // If we were given content then add it.
        if (content) {
            this.render(content, flip);
        }

        if (shadow) {
            this.shadow = document.createElement('x-shadow');
            this.appendChild(this.shadow);
        }

        this.moved = false;
        this.positions = [];
        this.radius = this.width / 2;

        this.cx = 0;

        this.maxStep = 5;
        this.step = this.stepInc = (this.maxStep / 10);

        this.direction = Sprite.OUT;
        this.heading = null;
        this.destZ = -1;
        this.destX = -1;
        this.destFn = null;
        this.dests = [];
        this.visible = false;

        this.room = this.game.room;
    }

    /**
     * 
     */
    render(content, flip = false) {
        let emojiKey = `${content}_${this.width}_${this.height}_${flip}`;
        let emojiData = this.game.emojiMap.get(emojiKey);
        if (this.canvas) this.removeChild(this.canvas);
        if (emojiData) {
            let canvas = document.createElement('canvas');
            canvas.width = emojiData.width;
            canvas.height = emojiData.height;
            canvas.getContext('2d').putImageData(emojiData, 0, 0);
            this.canvas = canvas;
        } else {
            let [canvas, imgData] = Util.renderEmoji(content, this.width, this.height, flip);
            this.canvas = canvas;
            this.game.emojiMap.set(emojiKey, imgData);
        }
        this.appendChild(this.canvas);
    }

    /**
     * Tests if this Sprite is touching another Sprite.
     * 
     * @param {Sprite} obj The Sprite to test if this Sprite is touching.
     * @param {number} gap If provided, then if the two Sprites are within this distance, the method returns true.
     * 
     * @returns {boolean} true if this Sprite is touching the given Sprite; otherwise false.
     */
    touching(obj, gap) {
        let dx = this.cx - obj.cx;
        let dz = this.cz - obj.cz + 15;
        let dist = (dx * dx) + (dz * dz);
        let rsum = (this.radius + obj.radius + (gap | 0));
        return (dist <= (rsum * rsum));
    }

    /**
     * Resets this Sprite's position to its previous position.
     * 
     * @returns {Object} The x/y/z position that the Sprite is now at.
     */
    reset() {
        let pos = this.positions.pop();

        if (pos) {
            this.setPosition(pos.x, pos.z);
            this.positions.pop();
        }

        // We need to switch to small steps when we reset position so we can get as close
        // as possible to other Sprites.
        this.step = 1;

        return pos;
    }

    /**
     * Sets the Sprite's position to the given x and z position.
     * 
     * @param {number} x The x part of the new position.
     * @param {number} z The z part of the new position.
     */
    setPosition(x, z) {
        // If we have a previous position then z will have a non-zero value. We don't
        // want to push the initially undefined position.
        if (this.z) {
            // Remember the last 5 positions.
            this.positions.push({ x: this.x, z: this.z });
            if (this.positions.length > 5) {
                this.positions = this.positions.slice(-5);
            }
        }

        // Set the new position and calculate the centre point of the Sprite sphere.
        this.x = x;
        this.z = z;
        this.cx = x + this.width / 2;
        this.cz = z * 3;

        // Update the style of the sprite to reflect the new position.
        this.top = Math.floor(this.z / 2) - this.height;
        if (this == this.game.ego) {
            this.style.setProperty('--sprite-top', `${this.top}px`);
            this.style.setProperty('--sprite-left', `${this.x}px`);
        } else {
            this.style.top = this.top + 'px';
            this.style.left = this.x + 'px';
        }

        if (this.shadow) {
            this.style.zIndex = Math.floor(this.z);
            if (this.canvas) {
                this.canvas.style.zIndex = Math.floor(this.z);
            }
        }
    }

    /**
     * Hides the Sprite but retains element in the DOM.
     */
    hide() {
        this.style.display = 'none';
        this.visible = false;
        this.ignore = true;

        // This is mainly to reset any lower opacity that might have been in
        // place prior to being hidden, such as as the result of a fade.
        this.style.opacity = 1.0;
    }

    /**
     * Shows the Sprite.
     */
    show() {
        this.style.display = 'block';
        this.visible = true;
        this.ignore = false;
    }

    /**
     * Sets the direction of this Sprite to the new direction provided.
     * 
     * @param {number} direction Identifies the new direction of the Sprite.
     */
    setDirection(direction) {
        if (direction && direction != this.direction) {
            this.classList.remove('facing' + this.direction);
            this.classList.add('facing' + direction);
            this.direction = direction;
        }
    }

    /**
     * Moves this Sprite based on its current heading, direction, step size and time delta settings. The
     * bounds are checked, and if in moving the Sprite and edge is hit, then the hitEdge method is invoked
     * so that sub-classes can decide what to do.
     */
    move() {
        this.moved = false;

        if (this.heading != null) {
            let x = this.x;
            let z = this.z;

            // Move the position based on the current heading, step size and time delta.
            if (this.heading != null) {
                x += Math.cos(this.heading) * Math.round(this.step * this.game.stepFactor);
                z += Math.sin(this.heading) * Math.round(this.step * this.game.stepFactor);

                // Increment the step size the step increment, capping at the max step.
                if ((this.step += this.stepInc) > this.maxStep) this.step = this.maxStep;
            }

            // If x or z has changed, update the position.
            if ((x != this.x) || (z != this.z)) {
                this.setPosition(x, z);
                this.moved = true;
            }
        } else {
            // If stationary then set step size back to 1, which allows closer movement
            // to the props.
            this.step = 1;
        }
    }

    /**
     * Tells the Sprite to stop moving. If fully is not provided, and there are pending destination
     * points, then the Sprite will start moving to the next point. If fully is set to true then 
     * all pending destination points are cleared.
     * 
     * @param {boolean} fully Whether to fully stop the Sprite or not.
     */
    stop(fully) {
        // Clear the current destination.
        this.destX = this.destZ = -1;
        this.heading = null;

        if (this.destFn && !fully) {
            this.destFn();
            this.destFn = null;
        }

        // To fully stop, we need to also clear the pending destinations.
        if (fully) this.dests = [];
    }

    /**
     * Tells the Sprite to move to the given position on the screen.
     * 
     * @param {number} x The X position to move to.
     * @param {number} y The Y position to move to.
     * @param {Function} fn The function to execute once the Sprite reaches the X/Y position.
     * @param {boolean} cond Doesn't movement part only if true. If false, still executes function if set.
     */
    moveTo(x, z, fn, cond = true) {
        if (cond) this.dests.push({ z: z, x: x, fn: fn }); else if (fn) fn()
    }

    /**
     * Updates the Sprites's position based on its current heading and destination point.
     */
    update() {
        // Only update the Sprite if it is currently on screen.
        if (this.style.display != 'none') {
            let direction;

            if ((this.destX != -1) && (this.destZ != -1)) {
                if (this.touching({ cx: this.destX, cz: this.destZ * 3, radius: -this.radius }, 20)) {
                    // We've reached the destination.
                    this.stop();
                } else {
                    this.heading = Math.atan2(this.destZ - this.z, this.destX - this.cx);
                }
            } else if (this.dests.length > 0) {
                // If there is a destination position waiting for Sprite to move to, pop it now.
                let pos = this.dests.shift();
                this.destZ = pos.z
                this.destX = pos.x;
                this.destFn = pos.fn;
            }

            if (this.heading !== null) {
                // Convert the heading to a direction value.
                if (Math.abs(this.heading) > 2.356) {
                    direction = Sprite.LEFT;
                } else if (Math.abs(this.heading) < 0.785) {
                    direction = Sprite.RIGHT;
                } else if (this.heading > 0) {
                    direction = Sprite.OUT;
                } else {
                    direction = Sprite.IN;
                }
            }

            // Update Sprite's direction to what was calculated above.
            this.setDirection(direction);

            // Move Sprite based on it's heading.
            if (this.heading !== null) this.move();

            if (this.moved) {
                this.classList.add('walking');
            } else {
                this.classList.remove('walking');
            }
        }
    }

    /**
     * Tells the Sprite to say the given text within a speech bubble of the given width. Will
     * execute the given optional next function if provided after the speech bubble is removed.
     * 
     * @param {number} width The width of the speech bubble.
     * @param {string} text The text to say.
     * @param {Function} next The function to execute after saying the text. Optional.
     */
    say(text, next, width) {
        let game = this.game;
        let elem = this;

        width = width? width : Math.min(350, text.length * 15);

        game.inputEnabled = false;
        game.overlay.style.display = 'block';
        game.overlay.onclick = null;

        let bubble = document.createElement('span');
        bubble.className = 'bubble';
        bubble.innerHTML = text;

        let left;
        if (this.x > (960 - (width / 2))) {
            left = -(width - (960 - this.x));
        } else if (this.x < (width / 2)) {
            left = -(this.x);
        } else {
            left = -(width / 2);
        }

        bubble.style.width = width + 'px';
        bubble.style.setProperty('--left', `${-left}px`);
        bubble.style.left = this.x + left + 'px';
        bubble.style.bottom = `${500-this.top}px`;

        game.screen.appendChild(bubble);
        this.classList.add('speech');

        let closeBubbleTO = null;
        let closeBubbleFn = e => {
            // If function was called by a user event, then cancel the timeout.
            if (e) {
                clearTimeout(closeBubbleTO);
                game.overlay.onclick = null;
            }
            // Remove the speech bubble.
            elem.classList.remove('speech');
            if (game.screen.contains(bubble)) {
                game.screen.removeChild(bubble);
            }

            if (next) {
                let nextFn = next;
                setTimeout(nextFn, 200);
                next = null;
            } else {
                // Re-enable user input if nothing is happening after the speech.
                game.inputEnabled = true;
            }
        };
        closeBubbleTO = setTimeout(closeBubbleFn, (text.length / 10) * 1500);
        game.overlay.onclick = closeBubbleFn;
    }
}