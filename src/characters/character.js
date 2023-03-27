import Vector2 from 'phaser/src/math/Vector2'
const eps = 20;
export default class Character extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.steerings = [];
    }

    update() {
        let velocity = new Vector2();
        this.steerings.forEach(steering => velocity.add(steering.calculateImpulse()));
        let newCoord = velocity.multiply(this.speed);
        this.x += newCoord.x;
        this.y += newCoord.y;

        this.updateAnimation();
    }

    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;
        if (x < 0) {
            animsController.play(animations[0], true);
        } else if (x > 0) {
            animsController.play(animations[1], true);
        } else if (y < 0) {
            animsController.play(animations[2], true);
        } else if (y > 0) {
            animsController.play(animations[3], true);
        } else {
            const currentAnimation = animsController.currentAnim;
            if (currentAnimation) {
                const frame = currentAnimation.getLastFrame();
                this.setTexture(frame.textureKey, frame.textureFrame);
            }
        }

    }
    hasArrived()
    {
        return this.pointOfInterest === undefined || this.pointOfInterest.distance(this.body.position) < eps;
    }

    selectNextLocation() {
        const nextTile = this.path.shift();
        if (nextTile)
        {
            this.nextLocation = new Vector2(nextTile.x * 32, nextTile.y * 32);
        } else
        {
            this.nextLocation = this.body.position;
        }
    }

    setSteerings(steerings){
        this.steerings = steerings;
    }
}