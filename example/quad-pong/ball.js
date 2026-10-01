class Ball {
	constructor(radius) {
		this.r = radius;
	}

	resetMotion(cx=0, cy=0, velocityRange=[0.5, 1]) {
		this.x = cx;
		this.y = cy;

		const angle = Math.random() * 2 * Math.PI,
			velocity = Math.random() * (velocityRange[1] - velocityRange[0]) + velocityRange[0];
		this.vx = Math.cos(angle) * velocity;
		this.vy = Math.sin(angle) * velocity;
	}

	getBbox() {
		return {
			t: this.y - this.r,
			b: this.y + this.r,
			l: this.x - this.r,
			r: this.x + this.r
		}
	}

	isWithin(x, y, width, height) {
		const p = this.getBbox();
		return p.l > x && p.r < x + width && p.t > y && p.b < y + height;
	}
}