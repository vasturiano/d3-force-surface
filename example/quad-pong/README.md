A quadrilateral self-version of the [Pong](https://en.wikipedia.org/wiki/Pong) classic game.

Uses the [d3-force](https://github.com/d3/d3-force) simulation engine and custom forces to handle the collision and bounce between balls ([d3.forceBounce](https://github.com/vasturiano/d3-force-bounce)) and with the paddles ([d3.forceSurface](https://github.com/vasturiano/d3-force-surface)).

Click-drag to control the paddles' horizontal and vertical positions. Each time a ball bounces on a paddle you get 1 point. Each time it goes off screen you lose 2 points.

Use the top-left +/- buttons to add/remove balls from the system.