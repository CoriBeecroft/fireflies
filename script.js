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
		this.growFirefly = this.growFirefly.bind(this);

		this.growFireflyInterval = null;
		this.growableFireflyPosition = null; 

		setInterval(() => {
			this.setState((ps) => {
				const newFireflies = ps.fireflies.filter(firefly => !this.fireflyHasLeft(firefly)).map((firefly, i) => {
					return this.updateFirefly(firefly);
				})
				return { fireflies: newFireflies }
			})
		}, 50);
	}

	fireflyHasLeft(firefly) {
		const buffer = 200;

		return firefly.x < -1*buffer ||
			firefly.x > width + buffer ||
			firefly.y < -1*buffer ||
			firefly.y > height + buffer;
	}

	updateFirefly(firefly) {
		const xVelocity = getRandomInt(1, 10) > 1 ? firefly.xVelocity : -1*firefly.xVelocity;
		const yVelocity = getRandomInt(1, 10) > 1 ? firefly.yVelocity : -1*firefly.yVelocity;

		return Object.assign({}, firefly, {
			xVelocity: xVelocity, 
			yVelocity: yVelocity,
			x: firefly.x + xVelocity,
			y: firefly.y + yVelocity,

		});
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

		const newFirefly = this.generateFirefly({
			x: x,
			y: y,
			xVelocity: 0, 
			yVelocity: 0,
		});

		this.setState(ps => {
			return {
				fireflies: ps.fireflies.concat(newFirefly)
			}
		});

		return { x: x, y: y };
	}

	growFirefly(e) {
		this.growableFireflyPosition = this.addFirefly(e);
		const mousePosition = { x: e.nativeEvent.pageX,  y: e.nativeEvent.pageY, }
		this.growFireflyInterval = setInterval(() => {
			this.updateOneFirefly(this.growableFireflyPosition, currentFirefly => {
				const size = currentFirefly.size * 1.1;
				this.growableFireflyPosition = {
					x: mousePosition.x - 0.5 * size,
					y: mousePosition.y - 0.5 * size,
				}

				return {
					...this.growableFireflyPosition,
					size: size,
				}
			})
		}, 30);
	}

	updateOneFirefly(fireflyPosition, options) {
		const targetFirefly = this.findFirefly(fireflyPosition);

		this.setState(prevState => {
			return {
				fireflies: prevState.fireflies.map(firefly => {
					if(firefly === targetFirefly) {
						if(typeof options == 'function') {
							options = options(targetFirefly);
						}

						return Object.assign({}, targetFirefly, options);
					} else return firefly;
				})
			}
		});
	}

	findFirefly(position) {
		return this.state.fireflies.find(firefly => firefly.x == position.x && firefly.y == position.y);
	}

	render() {
		const bigHillHeight = 1.4*height;
		const smallHillSize = 0.9*bigHillHeight;

		return <div onMouseDown={ this.growFirefly } onMouseUp={ () => {
			clearInterval(this.growFireflyInterval);

			this.updateOneFirefly(this.growableFireflyPosition, {
				xVelocity: getRandomInt(0, 1) ? 2 : -2,
				yVelocity: getRandomInt(0, 1) ? 2 : -2,
			});
		}}>
			<Background>
				<Hill width={ smallHillSize } height={ smallHillSize }
						bottom={ -0.8*smallHillSize } right={ 0.1*smallHillSize } />
				<Hill width={ bigHillHeight } height={ bigHillHeight } />
				<div className="moon" />
				{ this.state.fireflies.map((firefly, i) => {
					return <Firefly key={ i } x={ firefly.x } y={ firefly.y } size={ firefly.size } />
				}) }
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
		const blur = this.props.size <= 6 ? 6 : Math.max(this.props.size, 6);
		const spread = this.props.size <= 6 ? 2 : Math.max(0.33*this.props.size, 2);
		return <div className="firefly" style={{
			top: this.props.y,
			left: this.props.x,
			width: this.props.size + "px", 
			height: this.props.size + "px",
			boxShadow: "0 0 " + blur + "px " + spread + "px #9ff2fb", 							//"0 0 6px 2px #9ff2fb",
		}} />	
	}
}

ReactDOM.render(<Fireflies />, container);	