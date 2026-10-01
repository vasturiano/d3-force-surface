class Paddle {
	constructor(pos='b', length=20, thickness=5, initX=0, initY=0) {
		this.pos = pos;
		this.length = length;
		this.thickness = thickness;
		this.x = initX;
		this.y = initY;
	}

	isVertical() {
		return this.pos === 'l' || this.pos === 'r';
	}

	getWidth() {
		return this.isVertical() ? this.thickness : this.length
	}

	getHeight() {
		return this.isVertical() ? this.length : this.thickness
	}

	getEdgeLine() {
		const edge = this.thickness/2 * (this.pos === 't' || this.pos === 'l' ? 1 : -1),
			edges = [edge, edge],
			sides = [-this.length/ 2, this.length/2],
			vertical = this.isVertical(),
			xOffset = vertical?edges:sides,
			yOffset = vertical?sides:edges;

		if (this.pos === 't' || this.pos === 'r') {
			sides.reverse(); // Reverse line direction for flipped axis paddles (t, r)
		}

		return {
			from: {
				x: this.x + xOffset[0],
				y: this.y + yOffset[0]
			},
			to: {
				x: this.x + xOffset[1],
				y: this.y + yOffset[1]
			}
		}
	}

	getEdgeFrom() { return this.getEdgeLine().from; }
	getEdgeTo() { return this.getEdgeLine().to; }
}