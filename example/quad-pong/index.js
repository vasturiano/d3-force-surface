const PADDLE_LENGTH = 100,
	PADDLE_THICKNESS = 10,
	PADDLE_MARGIN = 20,
	BALL_RADIUS = 8,
	INIT_NUM_BALLS = 3,
	INIT_BALL_VELOCITY_RANGE = [0.8, 1.5],
	BOUNCE_ACCELERATION = 0.14,
	OFFSIDE_POINTS_PENALTY = 2,
	MOUSE_SENSITIVITY = 3; // Paddle movement/Mouse movement (per px)

const canvasWidth = window.innerWidth,
	canvasHeight = window.innerHeight;

// DOM nodes
const svgCanvas = d3.select('svg#canvas')
		.attr('width', canvasWidth)
		.attr('height', canvasHeight),
	paddlesG = svgCanvas.append('g'),
	ballsG = svgCanvas.append('g');

let numOffsides = 0, numBounces = 0;

const paddles = [
	new Paddle('t', PADDLE_LENGTH, PADDLE_THICKNESS, canvasWidth / 2, PADDLE_MARGIN - PADDLE_THICKNESS/2),
	new Paddle('b', PADDLE_LENGTH, PADDLE_THICKNESS, canvasWidth / 2, canvasHeight - PADDLE_MARGIN + PADDLE_THICKNESS/2),
	new Paddle('l', PADDLE_LENGTH, PADDLE_THICKNESS, PADDLE_MARGIN - PADDLE_THICKNESS/2, canvasHeight / 2),
	new Paddle('r', PADDLE_LENGTH, PADDLE_THICKNESS, canvasWidth - PADDLE_MARGIN + PADDLE_THICKNESS/2, canvasHeight / 2)
],
	balls = [];

d3.range(INIT_NUM_BALLS).forEach(addBall);

paddleDigest();
addPaddleMouseControls(svgCanvas);

// Setup bouncing forces
const forceSim = d3.forceSimulation()
	.alphaDecay(0)
	.velocityDecay(0)
	.stop()
	.nodes(balls)
	.force('paddle-bounce', d3.forceSurface()
		.surfaces(paddles)
		.elasticity(1 + BOUNCE_ACCELERATION)
		.radius(node => node.r)
		.from(paddle => paddle.getEdgeFrom())
		.to(paddle => paddle.getEdgeTo())
		.oneWay(true)
		.onImpact((ball, paddle) => {
			ball.impacted = paddle.impacted = true;
			numBounces++;
			updScore();
		})
	)
	.force('bounce', d3.forceBounce()
		.radius(node => node.r)
		.onImpact((ball1, ball2) => { ball1.impacted = ball2.impacted = true; })
	)
	.force('off-side', () => {
		balls.forEach(ball => {
			if (!ball.isWithin(0, 0, canvasWidth, canvasHeight)) {
				resetBallMotion(ball);

				numOffsides++;

				flash(svgCanvas);
				updScore();
			}
		});
	})
	.on('tick', () => { impactDigest(); ballDigest(); });

// Event handlers
function addBall() { balls.push(resetBallMotion()); updNumBalls(); }
function removeBall() { balls.pop(); updNumBalls(); }

//

function addPaddleMouseControls(canvas) {
	let prevMouseCoords;

	canvas.call(d3.drag()
		.on('start', () => {
			// Hide cursor
			canvas.style('cursor', 'none');

			// Hide start msg
			d3.select('.info-panel').style('display', 'none');

			// (Re-)start simulation
			forceSim.restart();

			prevMouseCoords = null;
		})
		.on('drag', ev => {
			let coords = d3.pointer(ev);
      if (coords.every(c => c === 0)) (coords = [ev.x, ev.y]);
      if(!prevMouseCoords) (prevMouseCoords = coords);
      const deltas = coords.map((coord, idx) => (coord - prevMouseCoords[idx]) * MOUSE_SENSITIVITY);

			prevMouseCoords = coords;

			paddles.forEach(d => {
				const vertical = d.isVertical(),
					dim = vertical?'y':'x',
					delta = deltas[vertical?1:0],
					min = PADDLE_MARGIN + PADDLE_LENGTH/ 2,
					max = ( vertical ? canvasHeight : canvasWidth ) - PADDLE_LENGTH/2 - PADDLE_MARGIN;

				d[dim] = Math.max(min, Math.min(max, d[dim] + delta));
			});

			paddleDigest();
		})
		.on('end', () => {
			// Reset cursor
			canvas.style('cursor', null);
		})
	);
}

function resetBallMotion(ball) {
	ball = ball || new Ball(BALL_RADIUS);
	ball.resetMotion(canvasWidth / 2, canvasHeight / 2, INIT_BALL_VELOCITY_RANGE);
	return ball;
}

function updScore() {
	d3.select('.score span').text(numBounces - numOffsides * OFFSIDE_POINTS_PENALTY);
}

function updNumBalls() {
	try { forceSim.nodes(balls); } catch(e) {} // Refresh nodes in force sim if it exists
	d3.select('.num-balls span').text(balls.length);
}

function flash(sel) {
	sel.style('filter', 'invert(100%)')
		.transition().duration(0).delay(40)
			.style('filter', null);
}

function paddleDigest() {
	let paddle = paddlesG.selectAll('rect.paddle').data(paddles);

	paddle.exit().remove();

	paddle.merge(
		paddle.enter().append('rect')
			.classed('paddle', true)
			.attr('width', d => d.getWidth())
			.attr('height', d => d.getHeight())
			.attr('transform', d => `translate(-${d.getWidth()/2},-${d.getHeight()/2})`)
			.attr('rx', 4)
			.attr('ry', 4)
			.attr('fill', 'white')
			.attr('stroke', 'white')
			.attr('stroke-width', 0)
	)
		.attr('x', d => d.x)
		.attr('y', d => d.y);
}

function ballDigest() {
	let ball = ballsG.selectAll('circle.ball').data(balls);

	ball.exit().remove();

	ball.merge(
		ball.enter().append('circle')
			.classed('ball', true)
			.attr('fill', 'white')
			.attr('stroke', 'white')
			.attr('stroke-width', 0)
	)
		.attr('r', d => d.r)
		.attr('cx', d => d.x)
		.attr('cy', d => d.y);
}

function impactDigest() {
	d3.selectAll('.ball, .paddle')
		.filter(d => d.impacted)
		.each(d => d.impacted = false)
		.attr('stroke-width', 3)
			.transition().duration(0).delay(100)
				.attr('stroke-width', 0);
}
