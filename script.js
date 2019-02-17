const container = document.getElementById("container");
const height = window.innerHeight;
const width = window.innerWidth;

class Fireflies extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			fireflies: this.generateFireflies(125),
		}

		this.addFirefly = this.addFirefly.bind(this);

		setInterval(() => {
			this.setState((ps) => {
				const newFireflies = ps.fireflies.filter(f => !this.fireflyHasLeft(f)).map((f, i) => {
					return this.updateFirefly(f);
				})
				return { fireflies: newFireflies }
			})
		}, 50);
	}

	fireflyHasLeft(f) {
		const buffer = 200;

		return f.x < -1*buffer ||
			f.x > width + buffer ||
			f.y < -1*buffer ||
			f.y > height + buffer;
	}

	updateFirefly(f) {
		const xVelocity = getRandomInt(1, 10) > 1 ? f.xVelocity : -1*f.xVelocity;
		const yVelocity = getRandomInt(1, 10) > 1 ? f.yVelocity : -1*f.yVelocity;

		return {
			xVelocity: xVelocity, 
			yVelocity: yVelocity,
			x: f.x + xVelocity,
			y: f.y + yVelocity,

		}
	}

	generateFireflies(numFireflies) {
		const fireflies = []; 

		for(let i=0; i<numFireflies; i++) {
			fireflies.push(this.generateFirefly());
		}

		return fireflies;
	}

	generateFirefly(options) {
		return Object.assign({
			x: getRandomInt(0, width),
			y: getRandomInt(0, height),
			size: getRandomInt(2, 5),
			xVelocity: getRandomInt(0, 1) ? 2 : -2,
			yVelocity: getRandomInt(0, 1) ? 2 : -2,
		}, options);
	}

	addFirefly(e) {
		const x = e.nativeEvent.pageX; 
		const y = e.nativeEvent.pageY;
		this.setState(ps => {
			return {
				fireflies: ps.fireflies.concat(this.generateFirefly({
					x: x,
					y: y,
					// xVelocity: 0, 
					// yVelocity: 0,
				}))
			}
		});
	}

	render() {
		const bigHillHeight = 1.4*height;
		const smallHillSize = 0.9*bigHillHeight;

		return <div onClick={ this.addFirefly }>
			<Background>
				<Hill width={ smallHillSize } height={ smallHillSize }
						bottom={ -0.8*smallHillSize } right={ 0.1*smallHillSize } />
				<Hill width={ bigHillHeight } height={ bigHillHeight } />
				<div className="moon" />
				{ this.state.fireflies.map((a, i) =>
					<Firefly key={ i } x={ a.x } y={ a.y } size={ a.size } />) }
			</Background>
		</div>
	}
}

const Hill = props => {
	return <div className="hill" style={{
		width: props.width + "px",
		height: props.height + "px",
		bottom: props.bottom || -2/3 * props.height, 
		right: props.right || -0.5 * props.width,
	}} />
}

const Background = props => {
	return <div className="background">
		{ props.children }
	</div>
}

function getRandomInt(lower, upper) {
	return Math.floor(Math.random()*(upper-lower) + lower);
}

class Firefly extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return <div className="firefly" style={{
			top: this.props.y,
			left: this.props.x,
			width: this.props.size + "px", 
			height: this.props.size + "px",
			boxShadow: "0 0 6px 2px #9ff2fb",
		}} />	
	}
}

ReactDOM.render(<Fireflies />, container);	