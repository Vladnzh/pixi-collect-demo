import './styles.css';
import {Application, Assets, Sprite, Graphics} from 'pixi.js';
import {gsap} from 'gsap';
import {times, random} from 'lodash';
import {MotionPathPlugin} from 'gsap/MotionPathPlugin';

class BunnyCollectAnimation {
    constructor() {
        this.app = new Application();
        gsap.registerPlugin(MotionPathPlugin);
        this.bunnys = [];
        this.collectContainerPosition = {x: 600, y: 300};
        this.randomStartPositions = {
            x: {from: 10, to: 300},
            y: {from: 10, to: 600}
        };
        this.amountBunnys = 40;
        this.duration = 1.5;
        this.scaleDuration = this.duration / 2.5;
        this.curveDistance = 150;
        this.vectorType = 'type1'; // type1,2,3
        this.scale = 1.5;
        this.delay = 1;
        this.moveEase = 'power2.in';
        this.scaleEase = 'power3.out';
        this.endPosition = {
            x: this.collectContainerPosition.x,
            y: this.collectContainerPosition.y
        };
    }

    async init() {
        await this.app.init({background: 'black', resizeTo: window});
        document.body.appendChild(this.app.view);
        const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
        this.createCollectContainer();
        this.createBunnys(texture);
        this.animateBunnys();
    }

    createBunnys(texture) {
        times(this.amountBunnys, () => {
            const bunny = new Sprite(texture);
            const startPosition = {
                x: random(
                    this.randomStartPositions.x.from,
                    this.randomStartPositions.x.to
                ),
                y: random(
                    this.randomStartPositions.y.from,
                    this.randomStartPositions.y.to
                )
            };
            bunny.alpha = 0.3;
            bunny.x = startPosition.x;
            bunny.y = startPosition.y;
            bunny.anchor.set(0.5);
            this.bunnys.push(bunny);
            this.app.stage.addChild(bunny);
        });
    }

    createCollectContainer() {
        this.collectContainer = new Graphics();
        this.collectContainer.roundRect(
            this.collectContainerPosition.x,
            this.collectContainerPosition.y,
            100,
            100,
            20
        );
        this.collectContainer.fill(0xf7564a, 0.25);
        this.collectContainer.stroke({width: 2, color: 0xf7564a});

        this.collectContainer.pivot.set(
            this.collectContainer.width / 2,
            this.collectContainer.height / 2
        );
        this.app.stage.addChild(this.collectContainer);
    }

    callback() {
        gsap.to(this.collectContainer.alpha, 0.1, {
            alpha: 0,
            yoyo: true,
            repeat: 1
        });
    }

    animateBunnys() {
        this.bunnys.forEach((bunny, index) => {
            gsap.delayedCall(this.delay * index, () => {
                bunny.alpha = 1;
                bunny.zIndex = index;

                const bezierPoints = this.computeBezierPoints(
                    bunny,
                    this.endPosition,
                    this.curveDistance
                );
                gsap.to(bunny, this.duration, {
                    motionPath: {
                        path: bezierPoints
                    },
                    ease: this.moveEase
                });
                gsap.to(bunny.scale, this.scaleDuration, {
                    x: this.scale,
                    y: this.scale,
                    yoyo: true,
                    repeat: 1,
                    ease: this.scaleEase
                });
            });
        });
    }

    computeBezierPoints(startPoint, endPoint, distance) {
        const directionVector = {
            x: endPoint.x - startPoint.x,
            y: endPoint.y - startPoint.y
        };

        const length = Math.sqrt(
            directionVector.x * directionVector.x +
            directionVector.y * directionVector.y
        );
        const normalizedVector = {
            x: directionVector.x / length,
            y: directionVector.y / length
        };
        const perpendicularVector = this.getVectorByType(
            normalizedVector,
            this.vectorType
        );

        const scaledVector = {
            x: perpendicularVector.x * distance,
            y: perpendicularVector.y * distance
        };
        const controlPoint1 = {
            x: startPoint.x + scaledVector.x,
            y: startPoint.y + scaledVector.y
        };
        const controlPoint2 = {
            x: endPoint.x + scaledVector.x,
            y: endPoint.y + scaledVector.y
        };
        controlPoint1.x = controlPoint1.x + (controlPoint2.x - controlPoint1.x) / 3;
        controlPoint1.y = controlPoint1.y + (controlPoint2.y - controlPoint1.y) / 3;
        controlPoint2.x = controlPoint2.x - (controlPoint2.x - controlPoint1.x) / 3;
        controlPoint2.y = controlPoint2.y - (controlPoint2.y - controlPoint1.y) / 3;

        const points = [];
        for (let t = 0; t <= 1; t += 0.1) {
            const x =
                (1 - t) ** 3 * startPoint.x +
                3 * (1 - t) ** 2 * t * controlPoint1.x +
                3 * (1 - t) * t ** 2 * controlPoint2.x +
                t ** 3 * endPoint.x;
            const y =
                (1 - t) ** 3 * startPoint.y +
                3 * (1 - t) ** 2 * t * controlPoint1.y +
                3 * (1 - t) * t ** 2 * controlPoint2.y +
                t ** 3 * endPoint.y;
            points.push({x, y});
        }

        return points;
    }

    getVectorByType(normalizedVector, vectorType) {
        switch (vectorType) {
            case 'type1':
                return {
                    x: -normalizedVector.y,
                    y: normalizedVector.x
                };
            case 'type2':
                return {
                    x: normalizedVector.y,
                    y: -normalizedVector.x
                };
            case 'type3':
                return {
                    x: -normalizedVector.x,
                    y: normalizedVector.y
                };
        }
    }
}

(async () => {
    const bunnyAnimation = new BunnyCollectAnimation();
    await bunnyAnimation.init();
})();
