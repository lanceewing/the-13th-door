/**
 * Holds room logic functions.
 */
class Logic {

  /**
   * Constructor for Logic.
   * 
   * @param {Game} game The Game.
   */
  constructor(game) {
    this.game = game;
  }

  /**
   * Processes a command from the user input.
   * 
   * @param {string} verb The verb part of the command to process.
   * @param {string} cmd The full command to process.
   * @param {string} thing The thing or noun part of the command to process.
   * @param {object} o The thing object.
   * @param {MouseEvent} e The mouse event associated with the command to process.
   */
  process(verb, cmd, thing, o, e) {

    let newCommand = cmd;
    let game = this.game;
    let flags = game.flags;
    let ego = game.ego;
    let item = game.inventory[thing];
    let obj = (item? item.obj : (o? o: game.objs.find(i => i.dataset['name'] == thing)));
    let door = document.querySelector(".door");
    let doFn = null;
    let move = true;

    switch (verb) {
      
      case 'Walk to':
        switch (thing) {
          case 'south exit':
            game.inputEnabled = false;
            ego.stop(true);
            ego.moveTo(obj.cx, ego.z, () => {
              ego.moveTo(obj.cx, 1080, () => ego.hitEdge(4));
            });
            break;

          case 'door':
            if ((game.room == 42) && (game.tmeter > 0)) {
              ego.classList.add('shake');
              ego.say("Door 13! No way I'm going in there.", () => {
                ego.classList.remove('shake');
                game.inputEnabled = true;
              });
            }
            else if (obj.classList.contains('p5')) {
              game.inputEnabled = false;
              ego.stop(true);
              ego.moveTo(obj.cx, ego.z, () => {
                if (obj.classList.contains('p5')) {
                  ego.moveTo(obj.cx, obj.z, () => ego.hitEdge(3));
                } else {
                  ego.say("Hey! The door closed!");
                }
              });
            }
            else {
              ego.say("The door appears to be locked.");  
            }
            break;

          case 'left exit':
            game.inputEnabled = false;
            ego.stop(true);
            ego.moveTo(Math.max(150, ego.cx), 735, () => {
              ego.moveTo(1, 735, () => ego.hitEdge(1));
            });
            break;

          case 'right exit':
            game.inputEnabled = false;
            ego.stop(true);
            ego.moveTo(Math.min(810, ego.cx), 735, () => {
              ego.moveTo(935, 735, () => ego.hitEdge(2));
            });
            break;

          default:
            // Walk to screen object or screen click position.
            let z = ((e.pageY / game.scaleY) - 27) * 2;
            if (z <= 970) {
              ego.stop(true);
              let destX = e.pageX / game.scaleX;
              let adjZ = Math.max(
                Math.max(590, z), 
                Math.min(950, 950 - (((destX < 480? destX : 960 - destX) - 23) * 2.7)));
              let adjX = (destX < 480? 
                Math.max(destX, (45 + (950 - adjZ) / 2.7)) : 
                Math.min(destX, 960 - (45 + (950 - adjZ) / 2.7)));
              ego.moveTo(adjX, adjZ);
            } else {
              // Must be an item. Change command to Use
              game.verb = 'Use';
              newCommand = 'Use ' + thing + ' with ';
            }
            break;
        }
        break;

      case 'Push': 
        {
          let move = false;
          switch (thing) {
            case 'vase':
              move = true;
              break;
            case 'urn':
              if (game.room != 42) {
                ego.say("I'd rather keep away from those ones!");
              } else {
                move = true;
              }
              break;
            default:
              ego.say("It doesn't move.");
              break;
          }
          if (move) {
            if (obj.propData[1] & 0x40) {
              ego.say(`I already moved the ${thing}.`);
            } else {
              doFn = () => {
                obj.setPosition(obj.x + (obj.x < 480? 40 : -40), obj.z);
                obj.propData[1] |= 0x40;
                game.sound.play("push");
              };
            }
          }
        }
        break;
      
      case 'Pick up':
        if (game.hasItem(thing)) {
          ego.say("I already have that.");
        } else {
          switch (thing) {
            case 'urn':
              if (game.room != 42) {
                ego.say("I'd rather keep away from those ones!");
              } else {
                doFn = () => ego.say("It's a bit too heavy to carry.");
              }
              break;
            case 'big button':
              ego.say("I need something to lever it up with.");
              break;
            default:
              if (obj && obj.propData[1] & 1) {
                doFn = () => game.getItem(thing);
              } else {
                ego.say("I can't pick that up.");
              }
              break;
          }
        }
        break;

      case 'Look at':
        switch (thing) {
          case 'triskaidekaphobia meter':
            ego.say(`It shows a fear level of ${Math.max(0,Math.round(game.tmeter))}%.`);
            break;

          case 'gear box':
            doFn = () => {
              if (flags[4]) {
                ego.say("I see nothing special.");
              } else {
                ego.say("It looks like something is missing.");
              }
            }
            break;

          case 'painting':
            if (!game.hasItem('painting') || game.hasItem('musical score')) {
              ego.say("Very pretty.");
            } else {
              ego.say("A piece of paper was taped to the back.");
              game.getItem('musical score', '📄');
            }
            break;

          case 'coat':
            doFn = () => {
              if (game.hasItem('old key')) {
                ego.say("The pockets are empty.");
              } else {
                ego.say("An old key was in the pocket!");
                game.getItem('old key', '🗝️');
              }
            }
            break;

          case 'toolbox':
            doFn = () => {
              if (game.hasItem('wrench')) {
                ego.say("It's empty.");
              } else {
                ego.say("It contains a wrench, knife and uv torch.");
                game.getItem('wrench', '🔧');
                game.getItem('uv torch', '🔦');
                game.getItem('knife', '🔪');
              }
            }
            break;

          case 'faint marks':
            ego.say("I can't quite make them out.");
            break;

          case 'vase':
            doFn = () => {
              if (flags[2]) {
                ego.say("It is filled with water.");
              } else {
                ego.say("It is empty.");
              }
            }
            break;

          case 'coin bag':
            if (game.coins) {
              ego.say(`It contains ${game.coins} coins.`);
            } else if (game.coins == 1) {
              ego.say("It contains 1 coin.")
            } else {
              ego.say("It's empty.");
            }
            break;

          case 'sign':
            if (game.room == 42) {
              ego.classList.add('shake');
              ego.say("Door 13! No way I'm going in there.", () => {
                ego.classList.remove('shake');
                game.inputEnabled = true;
              });
            } else {
              ego.say("Some of the doors are numbered.");
            }
            break;

          case 'hole':
            doFn = () => ego.say(game.hasItem('key')? "It's empty.": "There's something metal down there.");
            break;

          case 'door':
            if (!obj.classList.contains('p5')) {
              doFn = () => ego.say("The door appears to be locked.");
            } else {
              ego.say("The door is open.");
            }
            break;

          case 'urn':
            if (game.room == 42) {
              doFn = () => {
                if (obj.propData[1] & 16 && !game.hasItem('keycard')) { // Keycard urn.
                  if (obj.propData[1] & 2) { // Filled with water.
                    ego.say("There's a keycard floating on top of the water.");
                    game.getItem('keycard','💳');
                  } else {
                    ego.say("There's a keycard at the bottom that I can't quite reach.");
                  }
                } else {
                  if (obj.propData[1] & 2) { // Filled with water.
                    ego.say("It is filled with water.");
                  } else {
                    ego.say("It is empty.");
                  }
                }
              }
            } else {
              ego.say("Angry ghouls live in these.");
            }
            break;
            
          default:
            if (obj && obj.propData[9]) {
              // Object description.
              ego.say(obj.propData[9]);
              if (obj.propData[10]) {
                // Flag to set when object is looked at.
                flags[obj.propData[10]] = 1;
              }
            }
            else {
              ego.say("I see nothing special.");
            }
            break;
        }
        break;

      case 'Use':
        if (cmd == verb) {
          if (item) {
            newCommand = 'Use ' + thing + ' with ';
            break;
          }
          cmd = '';
        }
        doFn = () => {
          let thing1 = cmd.substring(4, cmd.indexOf(' with '));
          let things = [thing, thing1].sort().join();
          switch (things) {
            case ',keypad':
              if (flags[3]) {
                if (door.classList.contains('p5')) {
                  ego.say("It's already open.");
                } else {
                  door.classList.add("p5");
                  game.sound.play("door");
                }
              } else {
                ego.say("I don't know the code.");
              }
              break;

            case ',big button':
              if (flags[4]) {
                if (door.classList.contains('p5')) {
                  ego.say("It's already open.");
                } else {
                  door.classList.add("p5");
                  game.sound.play("door");
                }
              } else {
                ego.say("Hmmm, that didn't work.");
              }
              break;

            case ',latch':
              ego.say("I can't quite reach it.");
              break;

            case 'hook,painting':
              obj.hide();
              game.dropItem('painting', 265, 350);
              door.classList.add("p5");
              game.sound.play("door");
              break;

            case 'hole,magnet':
              if (game.hasItem('key')) {
                ego.say("Nothing happened.");
              } else {
                ego.say("It picked up a key!");
                game.getItem('key','🔑');
              }
              break;

            case 'big button,knife':
              if (game.hasItem('big button')) {
                ego.say("Nothing happened.");
              } else {
                ego.say("I lifted the button with the knife.");
                game.getItem('big button');
              }
              break;

            case 'big button,gear box':
              game.dropItem('big button');
              break;

            case 'gear,gear box':
              game.dropItem('gear');
              document.querySelector(".gear").classList.add("g1");
              flags[4] = 1;
              break;

            case 'faint marks,uv torch':
              flags[3] = 1;
              obj.classList.add('fm');
              setTimeout(() => {
                ego.say("Uh... well, that is now obvious.", () => {
                  obj.classList.remove('fm');
                  game.inputEnabled = true;
                });
              }, 1000);
              break;

            case 'locomotive,wrench':
              if (game.hasItem('gear')) {
                ego.say("Nothing happened.");
              } else {
                ego.say("I removed a gear!");
                game.getItem('gear', '⚙️');
              }
              break;

            case 'back wall,uv torch':
            case 'floor,uv torch':
              ego.say("Yikes! So much blood!");
              break;

            case 'door,wrench':
            case 'bolt,wrench':
              if (game.room == 22) {
                if (game.hasItem('bolts')) {
                  ego.say("I've already done that.");
                } else {
                  document.querySelectorAll('.bolt').forEach(o => {
                    o.propData[0] = -1;
                    game.remove(o);
                  });
                  game.getItem('bolts','🔩');
                  door.classList.add("p5");
                  game.sound.play("door");
                }
              } else {
                ego.say("Hmmm, that didn't work.");
              }
              break;

            case 'door,key':
              if (door.classList.contains('p5')) {
                ego.say("It's already open.");
              } else {
                if (game.room == 43) {
                  door.classList.add("p5");
                  game.sound.play("door");
                } else {
                  ego.say("The key doesn't work with this door.");
                }
              }
              break;

            case 'door,old key':
              if (door.classList.contains('p5')) {
                ego.say("It's already open.");
              } else {
                if (game.room == 9) {
                  door.classList.add("p5");
                  game.sound.play("door");
                } else {
                  ego.say("The key doesn't work with this door.");
                }
              }
              break;

            case 'card slot,keycard':
            case 'musical score,piano keys':
              if (door.classList.contains('p5')) {
                ego.say("It's already open.");
              } else {
                door.classList.add("p5");
                game.sound.play("door");
              }
              break;

            case 'broom,latch':
              if (door.classList.contains('p5')) {
                ego.say("It's already open.");
              } else {
                door.classList.add("p5");
                obj.classList.add("l1");
                game.sound.play("door");
              }
              break;

            case 'coin bag,coin slot':
              if (game.coins) {
                game.coins--;
                door.coins = (door.coins|0) + 1;
                ego.say("I put one coin in the slot.", () => {
                  if (door.coins == 13) {
                    door.classList.add("p5");
                    game.inputEnabled = true;
                    game.sound.play("door");
                  } else {
                    ego.say("Nothing happened. Perhaps it needs more coins.");
                  }
                });
              } else {
                ego.say("There are no coins in the bag.");
              }
              break;

            case 'door,door handle':
              if (game.room == 37) {
                door.classList.add("p5", "dh");
                game.sound.play("door");
                setTimeout(() => game.dropItem('door handle'), 500);
              } else {
                ego.say("The handle won't attach to this door.");
              }
              break;

            case 'platform,vase':
              if (flags[2]) {
                flags[1] = 1;
                game.dropItem('vase', 206, 807);
              } else {
                ego.say("I don't think the vase is heavy enough... yet.");
              }
              break;

            case 'vase,water pistol':
              if (flags[2]) {
                ego.say("The vase is already full.");
              } else if (flags[0]) {  // Pistol has water in it.
                flags[0] = 0;
                flags[2] = 1;
                ego.say("I have emptied the pistol into the vase.");
              } else {
                ego.say("Hmmm, that didn't work.");
              }
              break;

            case 'urn,water pistol':
              if (game.room == 42) {
                if (obj.propData[1] & 2) { // Urn with water.
                  if (flags[0]) {
                    ego.say("The pistol is already fill of water.");
                  } else {
                    flags[0] = 1;
                    obj.propData[1] ^= 2;
                    ego.say("The pistol is now fill of water.")
                  }
                } else {
                  if (flags[0]) {
                    flags[0] = 0;
                    obj.propData[1] |= 2;
                    ego.say("I have emptied the pistol into the urn.");
                  } else {
                    ego.say("Hmmm, that didn't work.");
                  }
                }
              } else {
                ego.say("I'd rather keep away from those ones!");
              }
              break;

            default:
              ego.say("Hmmm, that didn't work.");
              break;
          }
        }
        newCommand = verb;
        break;

      default:
        ego.say("Nothing happened.");
        break;
    }

    if (doFn) {
      if (!obj || item) {
        // Thing is an item, so nowhere to walk to.
        doFn();

      } else {
        let adjZ = Math.max(Math.min(obj.z, 900), 620);
        let destX = obj.cx;
        let adjX = (destX < 480? 
          Math.max(destX, (45 + (950 - adjZ) / 2.7)) : 
          Math.min(destX, 960 - (45 + (950 - adjZ) / 2.7)));
        let adjEgoZ = Math.max(Math.min(ego.z, 900), 620);
        ego.moveTo(ego.cx, adjEgoZ, () => ego.moveTo(adjX, adjZ, doFn));
      }
    }

    if (newCommand.endsWith('with ')) {
      game.verbIcon = game.inventory[thing].innerHTML;
      let cursorHeight = game.verbIcon == '-'? 24 : 50;
      game.cursors[game.verbIcon] = 
          `url(${Util.renderEmoji(game.verbIcon, 50, cursorHeight)[0].toDataURL()}) 25 ${cursorHeight/2}, auto`;
    }

    return newCommand;
  }

}
