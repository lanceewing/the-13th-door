class Game {

    inventory = {};
    
    verb = 'Walk to';
    
    command = 'Walk to';   // Current constructed command, either full or partial
    
    thing = '';

    itemsLeft = 0;

    // Number of coins that the player has collected. There are 13 max.
    coins = 0;

    // Triskaidekaphobia meter level.
    tmeter = 100;

    roomTime = 0;

    ghosts = [];

    urns = [];

    joinCount = 0;

    intro = true;

    // Rooms that have a numbered door.
    doorRooms = [9, 19, 20, 22, 28, 31, 33, 37, 41, 43, 45, 47];

    // RGB values used for doors and floors.
    colours = [
        '#7B4C3A',  // 0 = BROWN *
        '#222222',  // 1 = DARK GRAY *
        '#673147',  // 2 = PLUM
        '#A10020',  // 3 = RED *
        '#FF8C00',  // 4 = ORANGE *
        '#FFD700',  // 5 = YELLOW *
        '#006000',  // 6 = GREEN *
        '#0F52BA',  // 7 = BLUE *
        '#6f007e',  // 8 = PURPLE *
        '#158D85',  // 9 = CYAN *
        '#000030',  // A = NAVY BLUE *
        '#FF69B4',  // B = PINK *
        '#454B1B',  // C = OLIVE/ARMY
        '#000000'   // D = BLACK
    ];

    // Maze of 49 rooms (9, 19, 20, 22, 28, 31, 33, 37, 41, 43, 45, 47)
    maze = [
        [ 0x084, 0x08C, 0x08A, 0x044, 0x04A, 0x054, 0x05A ],
        [ 0x026, 0x028, 0x817, 0x018, 0x045, 0x04A, 0x053 ],
        [ 0x023, 0x016, 0x01B, 0x0C6, 0x0C8, 0x4A5, 0x5AB ],
        [ 0x023, 0x193, 0x011, 0x0C3, 0x0B4, 0x0BA, 0x0A3 ],
        [ 0x295, 0x09D, 0x09A, 0xC77, 0x078, 0xB33, 0x0A3 ],
        [ 0x022, 0x066, 0x96B, 0x077, 0x07A, 0x037, 0xA3B ],
        [ 0xD05, 0x609, 0x065, 0x769, 0x075, 0x379, 0x031 ]
    ];

    // Props that appear in rooms. Some are items that can be picked up.
    props = [
        // Room#, flags, name, content, width, height, x, y, z-index override, description, looked-at flag, obj storage
        // bit 0:    0 = normal prop, 1 = item
        // bit 1:    0 = special #1 off, 1 = special #1 on (prop specific)
        // bit 2:    0 = shadow, 1 = no shadow
        // bit 3:    0 = observe objs, 1 = ignore objs
        // bit 4:    0 = special #2 off, 1 = special #2 on (prop specific)
        // bit 5:    0 = closed, 1 = open
        // bit 6:    0 = not moved yet, 1 = moved
        // bit 7:    0 = normal, 1 = horizontal flip

        // Room 0
        [ 0, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 3 (TODO: Put coin in balloon instead)
        [ 3, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 4 - Coat room
        [ 4, 12,  'hook', null, 7, 10, 300, 315, 501 ],
        [ 4, 13,  'coat', '🥼', 70, 70, 270, 425, 502 ],

        // Room 5
        [ 5, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 6 - Umbrella room
        [ 6, 13,  'umbrella', '🌂', 60, 60, 680,  600, null ],

        // Room 8 - 13 room.
        [ 8, 0,  '13', '13', 400, 300, 280,  770, null ],

        // Room 17
        [ 17, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 18 - Picture room
        [ 18, 13,  'painting', '🖼️', 70, 70, 445, 350, 501 ],

        // Room 19 - Hook room
        [ 19, 12,  'hook', null, 7, 10, 300, 315, 501 ],

        // Room 20 - Button door
        [ 20, 12,  'big_button', '⏺️', 80, 80, 280, 400, 503, "I assume it opens a door." ],
        [ 20, 12,  'gear_box', null, 80, 80, 280, 400, 501 ],
        [ 20, 12,  'gear', '⚙️', 50, 50, 295, 375, 502 ],

        // Room 22 - Bolted door room
        [ 22, 12,  'bolt', null, 10, 10, 438, 250, 502 ],
        [ 22, 12,  'bolt', null, 10, 10, 438, 550, 502 ],

        // Room 23
        [ 23, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 24 - Loose door handle room
        [ 24, 13,  'door_handle', '-', 17, 6, 480, 390, 502 ],

        // Room 25 - Locomotive room
        [ 25, 0,  'locomotive', '🚂', 400, 300, 250, 650, null ],
        [ 25, 9,  'toolbox', '🧰', 50, 40, 350,  770, null ],

        // Room 26
        [ 26, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 27
        [ 27, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 28
        [ 28, 9,   'coin', null, 20, 10, 475,  770, null ],
        [ 28, 12,  'coin_slot', null, 20, 12, 400, 400, 501 ],

        // Room 31 - Pressure pad door
        [ 31, 12,  'platform', null, 82, 82, 194,  884, 501, "It's a pressure platform." ],

        // Room 32 - Sand and broom room
        [ 32, 13,  'broom', '🧹', 60, 60, 450,  770, null ],

        // Room 33 - Musical keyboard door
        [ 33, 12,  'piano_keys', '🎹', 30, 30, 390, 400, 501 ],

        // Room 35
        [ 35, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 41 - Keypad door room
        [ 41, 12,  'keypad', '🔢', 30, 30, 390, 400, 501 ],
        [ 41, 12,  'faint_marks', '4132', 200, 80, 570, 250, 501 ],

        // Room 42 - The Safe Room
        [ 42, 2,  'urn', '⚱️', 50, 80, 30,  922, null ],
        [ 42, 0,  'urn', '⚱️', 50, 80, 160, 590, null ],
        [ 42, 0,  'urn', '⚱️', 50, 80, 880, 930, null ],
        [ 42, 16, 'urn', '⚱️', 50, 80, 750, 590, null ],
        [ 42, 9,  'magnet', '🧲', 20, 20, 765, 580, null ],
        [ 42, 12, 'hole',   '🕳️', 20, 10, 175, 589, null ],
        [ 42, 9,  'water_pistol', '🔫', 30, 30, 890, 920, null ],
        [ 42, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 44
        [ 44, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 45 - Keycard door
        [ 45, 12,  'card_slot', null, 20, 12, 400, 400, 501 ],

        // Room 46
        [ 46, 9,  'coin', null, 20, 10, 475,  770, null ],

        // Room 47 - Latch door
        [ 47, 12,  'latch', null, 30, 8, 410, 250, 502 ],

        // Room 48
        [ 48, 1, 'vase', '🏺', 50, 80, 880, 930, null ],
        [ 48, 9,  'coin', null, 20, 10, 475,  770, null ],
    ];

    // 0 = water pistol full
    // 1 = vase on platfoorm
    // 2 = vase fill of water
    // 3 = seen keypad pin code
    // 4 = gear in gear box
    flags = [];

    /**
     * Constructor for Game.
     */
    constructor() {
        this.screen = document.getElementById('screen');
        this.wrap = document.getElementById('wrap');
        this.overlay = document.getElementById('overlay');
        this.items = document.getElementById('itemlist');
        this.sentence = document.getElementById('sentence');
        this.commands = document.getElementById('commands');
        this.status = document.getElementById('status');
        this.msg = document.getElementById('msg');

        customElements.define('x-sprite', Sprite);
        customElements.define('x-ego', Ego);
        customElements.define('x-shadow', class Shadow extends HTMLElement {});
        
        this.logic = new Logic(this);
        this.sound = new Sound();
        this.emojiMap = new Map();

        this.resizeScreen();
        onresize = e => this.resizeScreen(e);

        // Render the wall texture.
        this.wall = this.renderWall();
        this.screen.style.backgroundImage = 'url(' + this.wall.toDataURL("image/png") + ')';

        // Register click event listeners for item list arrow buttons.
        document.getElementById("up").onclick = e => this.scrollInv(1);
        document.getElementById("down").onclick = e => this.scrollInv(-1);

        this.commands.querySelectorAll('*').forEach(verb => {
            verb.onclick = e => {
                this.command = this.verb = e.target.dataset.name;
                this.verbIcon = e.target.innerText;
            }
        });

        // Initalise the mouse cursors.
        // Note: Firefox ignores custom cursors bigger than 32x32 when near the Window edge.
        let cursorSize = navigator.userAgent.match(/Firefox/)? 32 : 50;
        this.cursors = {};
        [['🚶', 2],['👁️', 1],['🤚🏼', 1],['👆🏼', 0],['💪🏼', 1],['⏳', 1],['➕', 1]].forEach(d => {
            let [c, i] = d;
            let hsy = [0, cursorSize/2, cursorSize-1][i];
            this.cursors[c] = `url(${Util.renderEmoji(c, cursorSize, cursorSize)[0].toDataURL()}) ${cursorSize/2} ${hsy}, auto`;
            document.body.style.setProperty(`--${c}`, this.cursors[c]);
        });
        this.verbIcon = '🚶';

        this.started = false;
        this.fadeOut(this.wrap);

        onclick = e => {
            if (!this.started) {
                this.started = true;
                onclick = null;
                //if (document.fullscreenEnabled) document.documentElement.requestFullscreen();
                this.fadeOut(this.msg);
                setTimeout(() => {
                    this.msg.style.display = 'none'
                    this.sound.playSong();
                    this.init();
                    this.loop();
                }, 200);
            }
        }
    }

    /**
     * Initialised the parts of the game that need initialising on both
     * the initial start and then subsequent restarts. 
     */
    init() {
        this.screen.onclick = e => this.processCommand(e);

        // Set the room back to the start, and clear the object map.
        this.objs = [];
        this.room = 43;

        // Starting inventory.
        this.getItem('triskaidekaphobia meter', '📟');
        this.getItem('coin bag', '💰');

        // Create Ego (the main character) and add it to the screen.
        this.ego = document.createElement('x-ego');
        this.ego.init(this, 50, 150);
        this.ego.setPosition(450, 750);
        this.ego.dataset.name = 'me';
        this.addObjEventListeners(this.ego);
        this.screen.appendChild(this.ego);

        // Enter the starting room.
        this.newRoom();

        // Intro text.
        this.intro = true;
        this.inputEnabled = false;
        this.ego.say("Hello!!", () => {
            this.ego.say("My name is Pip.", () => {
                this.ego.say("I suffer from Triskaidekaphobia, the fear of the number 13.", () => {
                    this.ego.moveTo(300, 740, () => {
                        this.ego.say("This is an Exposure Therapy escape room.", () => {
                            this.ego.moveTo(300, 800, () => {
                                this.ego.say("My therapist believes that it could cure me.", () => {
                                    this.ego.say("Please help me to escape...", () => {
                                        this.ego.say("...and hopefully be cured in the process.", () => {
                                            this.intro = false;
                                            this.inputEnabled = true;
                                            this.roomTime = this.lastTime;
                                            this.fadeOut(this.status);
                                        }, 200);
                                    });
                                });
                            });
                        });
                    });
                }, 400);
            });
        });

        // Fade in the whole screen at the start.
        this.fadeIn(this.wrap);
    }

    /**
     * Adds a Sprite to the game.
     * 
     * @param {Sprite} obj The Sprite to add to the game.
     */
    add(obj) {
        this.screen.appendChild(obj);
        this.objs.push(obj);
    }

    /**
     * Removes a Sprite from the game.
     * 
     * @param {Sprite} obj  The Sprite to remove from the game.
     */
    remove(obj) {
        // Remove the Sprite from the screen.
        try {
            this.screen.removeChild(obj);
        } catch (e) {
            // Ignore. We don't care if it has already been removed.
        }

        // Remove the Sprite from our list of managed objects.
        this.objs = this.objs.filter(o => o !== obj);
    }

    /**
     * Scales the screen div to fit the whole screen.
     * 
     * @param {UIEvent} e The resize event.
     */
    resizeScreen(e) {
        this.wrap.style.setProperty('--scale-x', this.scaleX = innerWidth / this.wrap.offsetWidth);
        this.wrap.style.setProperty('--scale-y', this.scaleY = innerHeight / this.wrap.offsetHeight);
    }

    /**
     * This is the main game loop, in theory executed on every animation frame.
     *
     * @param {number} now Time. The delta of this value is used to calculate the movements of Sprites.
     */
    loop(now) {
        // Immediately request another invocation on the next.
        requestAnimationFrame(now => this.loop(now));

        // Calculates the time since the last invocation of the game loop.
        if (now) {
            this.stepFactor = (now - (this.lastTime || (now - 16))) * 0.06;
            this.lastTime = now;
            this.roomTime = this.roomTime?? this.lastTime;
        }

        this.ego.moved = false;

        // Update ego.
        let ego = this.ego;
        let flags = this.flags;
        ego.update();
        this.objs.forEach(o => {
            if (!o.ignore && ego.touching(o)) {
                for (;ego.reset() && ego.touching(o););
                ego.stop();
            }
            else if (o.classList.contains("platform")) {
                let door = document.querySelector(".door");
                if ((ego.x > 170 && ego.x < 255 && ego.z > 737 &&  ego.z < 882) || flags[1]) {
                    door.classList.add("p5");
                } else {
                    door.classList.remove("p5");
                }
            }
        });

        // Update the ghosts, if there are any.
        if (!this.intro) {
            this.updateGhosts();
        }

        // Update sentence.
        let newSentence = this.command + ' ' + this.thing;
        if (newSentence != this.lastSentence) {
            this.sentence.innerHTML = this.lastSentence = newSentence;
        }

        // If the room that Ego says it is in is different than what it was previously 
        // in, then we trigger entry in to the new room.
        if (this.ego.edge) {
            this.edge = this.ego.edge;
            this.room = this.ego.room;
            this.fadeOut(this.wrap);
            setTimeout(() => this.newRoom(), 200);
            this.ego.edge = 0;
        }

        // Update based on user input state.
        this.overlay.style.display = (this.inputEnabled? 'none' : 'block');

        // Update cursor.
        let newCursor = this.cursors[this.inputEnabled? this.verbIcon : '⏳'];
        if (newCursor != this.currCursor) {
            this.wrap.style.cursor = newCursor;
            if (this.verbIcon != '🚶') {
                this.wrap.style.setProperty('--c', newCursor);
            } else {
                this.wrap.style.removeProperty('--c');
            }
        }
        this.currCursor = newCursor;
    }
      
    /**
     * Processes the current user interaction.
     * 
     * @param {MouseEvent} e The mouse event that trigger the command to process.
     */
    processCommand(e) {
        if (this.inputEnabled) {
          this.command = this.logic.process(this.verb, this.command, this.thing, this.obj, e);
          if (this.command == this.verb) {
            this.command = this.verb = 'Walk to';
            this.verbIcon = '🚶';
          }
        }
        if (e) e.stopPropagation();
    }

    /**
     * Updates the state of the ghosts on the screen.
     */
    updateGhosts() {
        if (this.lastTime && this.urns.length) {
            let secsInRoom = ((this.lastTime - this.roomTime) / 1000);
            let doorRoom = this.doorRooms.includes(this.room);
            let safeRoom = [7, 8, 14, 21, 42].includes(this.room) && !doorRoom;
            let maxGhosts = (doorRoom? 12 : 4);
            let ghostCount = this.ghosts.length;
            let ghostsToAdd = (doorRoom? ((ghostCount < maxGhosts) && (ghostCount < (secsInRoom-1))? 1 : 0) : (4 - ghostCount));
            let bones = document.querySelector('._13th_ghost');

            // Add another ghost each second until we reach the max.
            if (!safeRoom && (ghostCount < maxGhosts) && (ghostCount < (secsInRoom - (doorRoom? 1 : 0)))) {
                for (let i=0; i<ghostsToAdd; i++) {
                    let urn = this.urns[(ghostCount + i) % this.urns.length];
                    let ghost = this.addPropToRoom([ 0, 0x0C, 'ghost', '💀', 50, 80, urn.x, urn.z-1, urn.z+1 ]);
                    ghost.maxStep = 1 + (0.5 * Math.random());
                    this.ghosts.push(ghost);
                    if (doorRoom) {
                        ghost.moveTo(urn.cx, urn.z-200, () => {
                            ghost.moveTo(480, 185, () => {
                                ghost.setPosition(455, 185);
                                this.joinCount++;
                                if (this.joinCount == 12) {
                                    bones = this.addPropToRoom([ 0, 0x0C, '_13th_ghost', '☠️', 62, 104, 449, 210, 1000 ]);
                                    bones.maxStep = 2;
                                    this.ghosts.forEach(g => g.hide());
                                    this.ego.say("Ah! The 13th ghost!");
                                    this.ego.shake();
                                }
                            });
                        });
                    } else {
                        ghost.classList.add('gsh');
                    }
                }
            }
            
            // Move ghosts if its a move ghost room.
            if (doorRoom) {
                this.ghosts.forEach(g => g.update());
            }

            if (bones) {
                bones.destX = this.ego.cx;
                bones.destZ = this.ego.z;
                bones.update();

                // Check if bones hitting ego.
                if (bones.touching(this.ego)) {
                    this.ego.hit();
                    this.remove(bones);
                    bones = null;
                    this.tmeter -= 7.7;
                    this.doorRooms = this.doorRooms.filter(r => r != this.room);
                    this.ego.shake(() => this.ego.say("Aaahhh!!!"));

                    // If its the last door, add room with 13th door.
                    if (this.tmeter <= 7.7 && this.tmeter > 0) {
                        this.doorRooms.push(42);
                    }
                }
            }
        }
    }

    /**
     * Invoked when Ego is entering a room.  
     */
    newRoom() {
        // Reset command for new room.
        this.thing = '';
        this.command = this.verb = 'Walk to';
        this.verbIcon = '🚶';

        // Remove the previous room's Objs from the screen.
        this.objs.forEach(obj => this.screen.removeChild(obj));
        this.objs = [];

        // Clear ghost state.
        this.joinCount = 0;
        this.roomTime = null;
        this.ghosts = [];
        this.urns = [];

        let roomData = this.maze[~~(this.room / 7)][this.room % 7];

        // Add room classes.
        this.screen.className = 'room' + this.room;

        // Add props currently in the room.
        let door = null;
        this.props.forEach(prop => {
            if (prop[0] == this.room) {
                this.addPropToRoom(prop);
                if (prop[2] == 'door') {
                    door = prop;
                }
            }
        });

        // Add left wall, and the exit, if required.
        let leftWall = [ 0,  4, 'left_wall', null, 260,   360, null, null, 501 ];
        if (roomData & 8) {
            this.addPropToRoom([ 0, 12, 'left_corner', null, 80, 309, 101, 618, 502 ]);
            this.addPropToRoom([ 0,  4, 'left_exit', null, 121, 323, null, null, 501 ]);
            leftWall[1] |= 2;
        }
        this.addPropToRoom(leftWall);

        // Add right wall, and the exit, if required.
        let rightWall = [ 0,  4, 'right_wall', null, 260, 360, null, null, 501 ];
        if (roomData & 4) {
            this.addPropToRoom([ 0, 12, 'right_corner', null, 80, 309, 778, 618, 502 ]);
            this.addPropToRoom([ 0, 4,  'right_exit', null, 121, 323, null, null, 501 ]);
            rightWall[1] |= 2;
        }
        this.addPropToRoom(rightWall);

        // Add front wall, and the exit, if required.
        let frontWall = [ 0, 12, 'front_wall', null, 960, 15, null, null, 1001 ];
        if (roomData & 2) {
            this.addPropToRoom([ 0, 12, 'south_exit', null, 120, 16, 420, 972, 1002 ]);
            frontWall[1] |= 2;
        }
        this.addPropToRoom(frontWall);

        // Add back wall, and door (if required).
        this.addPropToRoom([ 0, 12, 'back_wall', null, 960, 296, 0, 575, 500 ]);
        if (roomData & 1) {
            let doorNum = (roomData >> 8) & 0xF;
            if (!door) {
                door = [ this.room, (doorNum && doorNum != 13? 0x1C : 0x3C), 'door', null, 100, 207, 430, 565, 501 ];
                this.addPropToRoom(door);
                this.props.push(door);
                if (doorNum) {
                    let sign = [ this.room, 12, 'sign', "" + doorNum, 20, 16, 470, 130, 501 ];
                    this.addPropToRoom(sign);
                    this.props.push(sign);
                }
            }
            this.wrap.style.setProperty('--dc', this.colours[doorNum]);
        }

        // Add urns if not the safe room.
        if (this.room != 42) {
            this.urns.push(this.addPropToRoom([ 0, 0, 'urn', '⚱️', 50, 80,  30, 922, null ]));
            this.urns.push(this.addPropToRoom([ 0, 0, 'urn', '⚱️', 50, 80, 160, 590, null ]));
            if (this.room != 48) {
                this.urns.push(this.addPropToRoom([ 0, 0, 'urn', '⚱️', 50, 80, 880, 930, null ]));
            }
            this.urns.push(this.addPropToRoom([ 0, 0, 'urn', '⚱️', 50, 80, 750, 590, null ]));
        } else if (this.tmeter <= 7.7) {
            // If the 13th door is the last door to enter.
            document.querySelectorAll('.urn').forEach(u => this.urns.push(u));
        }

        // Set floor colour.
        this.wrap.style.setProperty('--fc', this.colours[(roomData >> 4) & 0xF] + '80');        
        this.addPropToRoom([ 0, 12, 'floor', null, 880, 204, 40, 937, 500 ]);

        this.ego.show();

        this.fadeIn(this.wrap);
    }

    /**
     * Adds the given prop to the current room screen.
     * 
     * @param {Array} prop 
     */
    addPropToRoom(prop) {
        // We cache the obj when it isn't in the dom rather than recreate. It might remember it's state.
        let obj = prop[11];

        // Room#, type, name, content, width, height, x, y, z-index override, description
        // bit 0:    0 = visible, 1 = hidden
        // bit 1:    
        // bit 2:    0 = shadow, 1 = no shadow
        // bit 3:    0 = observe objs, 1 = ignore objs
        // bit 4:    0 = observe reflection, 1 = ignore reflection
        // bit 5:    0 = closed, 1 = open
        // bit 6:    
        // bit 7:    0 = normal, 1 = horizontal flip

        if (!obj) {
            obj = new Sprite();
            obj.init(this, prop[4], prop[5], prop[3], !(prop[1] & 4), (prop[1] & 128));

            obj.dataset.name = prop[2].replace('_',' ').replace('_',' ').trim();
            obj.classList.add(prop[2]);

            obj.propData = prop;

            if (prop[6] !== null) {
                obj.setPosition(prop[6], prop[7]);
            }

            // Add all prop type flags as classes.
            for (let i=0; i<8; i++) {
                if (prop[1] & (1 << i)) obj.classList.add('p' + i);
            }

            if (prop[1] & 8) {
                // Ignore objs
                obj.ignore = true;
            }

            obj.style.zIndex = prop[8]?? prop[7];

            prop[11] = obj;
        }

        this.add(obj);

        this.addObjEventListeners(obj);

        return obj;
    }

    /**
     * Adds the necessarily event listens to the given element to allow it to be 
     * interacted with as an object in the current room.
     * 
     * @param {HTMLElement} elem The HTMLElement to add the object event listeners to.
     */
    addObjEventListeners(elem) {
        // It is important that we don't use addEventListener in this case. We need to overwrite
        // the event handler on entering each room.
        elem.onmouseleave = e => this.thing = '';
        elem.onclick = e => this.processCommand(e);
        elem.onmousemove = e => this.objMouseMove(e);
    }
    
    /**
     * Handles mouse move events, primarily so that the 'thing' property is updated 
     * when the mouse moves over objects on the screen. If the object has a canvas,
     * then it uses the image data to determine when exactly the mouse is over the
     * object. If the pixel is transparent at that position, then it falls back on
     * whatever is underneath the object.
     * 
     * @param {MouseEvent} e The MouseEvent for the mouse move event.
     */
    objMouseMove(e) {
        let target = e.currentTarget;
        let me = target.dataset.name == 'me';
        let ghost = target.dataset.name == 'ghost';
        if (target.canvas || me) {
            let rect = target.getBoundingClientRect(); 
            let x = ~~((e.clientX - rect.left) / this.scaleX);
            let y = ~~((e.clientY - rect.top) / this.scaleY);
            let { width, height } = target;
            let ctx = me? null : target.canvas.getContext('2d');
            let imgData = me? null :ctx.getImageData(0, 0, width, height);

            // Pixel is transparent, so get sprite underneath.
            if (me || ghost || !imgData.data[(y * (width << 2)) + (x << 2) +3]) {
                let elements = document.elementsFromPoint(e.clientX, e.clientY).filter(s => s instanceof Sprite);
                target = elements[1]? elements[1] : null;
            }
        }
        this.thing = target? target.dataset.name : '';
        this.obj = target;
    }

    /**
     * Adds the given item to the inventory.
     * 
     * @param {string} name The name of the item to add to the inventory.
     */
    getItem(name, icon) {
        let obj = this.objs.find(i => i.dataset['name'] == name);
        if (obj) {
            obj.propData[0] = -1;
            this.remove(obj);
            if (name == 'coin') {
                this.coins++;
                return;
            }
            icon = obj.propData[3]?? '';
        }
        let item = document.createElement('span');
        item.dataset.name = name;
        item.innerHTML = icon;
        item.obj = obj;
        this.items.appendChild(item);
        this.addObjEventListeners(item);
        this.inventory[name] = item;

        // Auto scroll to show newly added item.
        let invCount = this.items.children.length;
        if (invCount > 6) {
            this.itemsLeft = -((invCount - 6) * 77);
            this.items.style.left = this.itemsLeft + 'px';
        }
    }

    /**
     * Checks if the given item is in the inventory.
     * 
     * @param {string} name The name of the item to check is in the inventory.
     */
    hasItem(name) {
        return this.inventory.hasOwnProperty(name);
    }

    /**
     * Removes the given item from the inventory.
     * 
     * @param {string} name The name of the item to drop.
     */
    dropItem(name, x, y) {
        let item = this.inventory[name];
        this.items.removeChild(item);
        delete this.inventory[name];
        this.scrollInv(1);
        if (item.obj) {
            item.obj.propData[0] = this.room;
            if (x && y) {
                item.obj.setPosition(x, y);
            }
            this.add(item.obj);
        }
    }

    /**
     * Handles scrolling of the inventory list.
     * 
     * @param {number} dir The direction to scroll the inventory.
     */
    scrollInv(dir) {
        let newLeft = this.itemsLeft + (77 * dir);
        let invCount = this.items.children.length;
        if ((newLeft <= 0) && (newLeft >= -((invCount - 6) * 77))) {
            this.itemsLeft = newLeft;
            this.items.style.left = this.itemsLeft + 'px';
        }
    }

    /**
     * Fades in the given DOM Element.
     * 
     * @param {HTMLElement} elem The DOM Element to fade in.
     */
    fadeIn(elem) {
        // Remove any previous transition.
        elem.style.transition = 'opacity 0.5s';
        elem.style.opacity = 1.0;
        // This is so that other css styles can set transitions on the element
        // while we're not fading in.
        setTimeout(() => elem.style.removeProperty('transition'), 700);
    }

    /**
     * Fades out the given DOM Element.
     * 
     * @param {HTMLElement} elem The DOM Element to fade out.
     */
    fadeOut(elem) {
        elem.style.transition = 'opacity 0.2s';
        elem.style.opacity = 0.0;
    }

    /**
     * Renders the stone canvas. It does this by randomly setting the luminousity of 
     * each pixel so that it looks like blades of grass from a distance.
     */
    renderWall() {
        let ctx = Util.create2dContext(960, 260, { willReadFrequently: true });
        ctx.fillStyle = 'hsl(0, 0%, 10%)';
        ctx.fillRect(0, 0, 960, 260);
    
        // Now randomaly adjust the luminosity of each pixel.
        let imgData = ctx.getImageData(0, 0, 960, 260);
        for (let i=0; i<imgData.data.length; i+=4) {
            let texture = (Math.random() * 0.5);
            if (texture < 0.1) {
                texture = 1.0 - texture;
                imgData.data[i]=Math.floor(imgData.data[i] * texture);
                imgData.data[i+1]=Math.floor(imgData.data[i+1] * texture);
                imgData.data[i+2]=Math.floor(imgData.data[i+2] * texture);
                imgData.data[i+3]=200;
            } else {
                texture = 0.5 + texture;
                imgData.data[i]=Math.floor(imgData.data[i] / texture);
                imgData.data[i+1]=Math.floor(imgData.data[i+1] / texture);
                imgData.data[i+2]=Math.floor(imgData.data[i+2] / texture);
            }
        }
    
        ctx.putImageData(imgData,0,0);
        return ctx.canvas;
    }
}