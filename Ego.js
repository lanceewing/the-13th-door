class Ego extends Sprite {

    /**
     * Constructor for Ego.
     */
    constructor() {
        super();
    }

    /**
     * Initialises the Ego with a given position.
     * 
     * @param {Game} game 
     * @param {number} width The width of the Ego.
     * @param {number} height The height of the Ego.
     * @param {string} content The content to add into the Ego. Optional.
     * @param {boolean} shadow 
     */
    init(game, width, height, content, shadow) {
        super.init(game, width, height, content, shadow);

        // An HTML template is used for the structure of the ego.
        this.appendChild(document.importNode(document.getElementById('person').content, true));
    }

    /**
     * Ego momentarily shakes.
     */
    shake(fn) {
        this.querySelector(".actor").classList.add("shake");
        setTimeout(() => {
            this.querySelector(".actor").classList.remove("shake");
            if (fn) fn();
        }, 500);
    }

    /**
     * Hit by the 13 ghosts.
     */
    hit() {
        // Play the explosion sound and trigger the explode transition on Ego.
        //$.Sound.play('explosion');
        this.classList.add('explode');

        // Removes Ego from the screen when the explode transition has completed.
        setTimeout(() => {
            this.classList.remove('explode');
        }, 100);
    }

    /**
     * Process Ego hitting a room exit.
     * 
     * @param {number} edge 
     */
    hitEdge(edge) {
        // Stop moving.
        this.destX = this.destZ = -1;
        this.heading = null;
        this.game.inputEnabled = false;

        // Hide ego before we reposition him to the new entry point.
        this.hide();

        let edgeData = [
            [ -1, 935 ],
            [  1, 1   ],
            [ -7, 965 ],
            [  7, 590 ]
        ][edge-1];

        // Reposition ego.
        this.setPosition(edge < 3? edgeData[1] : this.x, edge > 2? edgeData[1] : this.z);
        this.setDirection(edge);
        this.moveTo(
            edge < 3? edgeData[1] + (edgeData[0] * 150) : this.cx, 
            edge > 2? edgeData[1] + (edgeData[0] * 15) : this.z, 
            () => this.game.inputEnabled = true);

        // Set the new room for ego.
        this.room += edgeData[0];
        
        // Previous positions are not applicable when room changes.
        this.positions = [];

        this.step = 1;

        // Store the edge that ego entered the new room.
        this.edge = edge;
    }
}