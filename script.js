const container = document.getElementById("container");
const getHeight = () => window.innerHeight;
const getWidth = () => window.innerWidth;
const parseQueryString = () => {
	return (window.location.search.substring(1, window.location.search.length) || "")
		.split("&")
		.reduce((total, param) =>
			({ ...total, [param.split("=")[0]]: param.split("=")[1] }), {});
}

class Fireflies extends React.Component {
	constructor(props) {
		super(props);

		this.addFirefly = this.addFirefly.bind(this);
		this.growFirefly = this.growFirefly.bind(this);
		this.generateFirefly = this.generateFirefly.bind(this);
		this.releaseGrownFirefly = this.releaseGrownFirefly.bind(this);

		this.growFireflyInterval = null;
		this.growableFireflyId = null;
		this.maxFireflySize = 8;

		this.fireflyIdCounter = 0;

		const initialNumFireflies = Math.min(
			Number(parseQueryString().numFireflies) || 125,
			800);
		this.state = { fireflies: this.generateFireflies(initialNumFireflies) }

		setInterval(() => {
			this.setState((ps) => ({
				fireflies: ps.fireflies
					.filter(firefly => !this.fireflyHasLeft(firefly))
					.map(firefly => this.updateFirefly(firefly))
			}))
		}, 50);


	}

	fireflyHasLeft(firefly) {
		const buffer = 200;

		return firefly.x < -1*buffer ||
			firefly.x > getWidth() + buffer ||
			firefly.y < -1*buffer ||
			firefly.y > getHeight() + buffer;
	}

	updateFirefly(firefly) {
		const xVelocity = getRandomInt(1, (firefly.size*2)) > 1 ? firefly.xVelocity : -1*firefly.xVelocity;
		const yVelocity = getRandomInt(1, (firefly.size*2)) > 1 ? firefly.yVelocity : -1*firefly.yVelocity;

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
		return {
			id: this.fireflyIdCounter++,
			x: getRandomInt(0, getWidth()),
			y: getRandomInt(0, getHeight()),
			size: getRandomInt(2, this.maxFireflySize),
			xVelocity: getRandomInt(0, 1) ? 2 : -2,
			yVelocity: getRandomInt(0, 1) ? 2 : -2,
			...options
		}
	}

	addFirefly(e) {
		const x = e.nativeEvent.pageX; 
		const y = e.nativeEvent.pageY;

		const newFirefly = this.generateFirefly({
			x: x,
			y: y,
			xVelocity: 0, 
			yVelocity: 0,
			size: 2,
		});

		this.setState(ps => ({ fireflies: ps.fireflies.concat(newFirefly) }));

		return newFirefly;
	}

	growFirefly(e) {
		this.growableFireflyId = this.addFirefly(e).id;
		const mousePosition = { x: e.nativeEvent.pageX,  y: e.nativeEvent.pageY, }
		const maxIntervalsSinceSizeMaxed = 15;
		let numIntervalsSinceSizeMaxed = 0;
		let sploded = false;

		if(this.growFireflyInterval != null) {
			clearInterval(this.growFireflyInterval);
		}
		this.growFireflyInterval = setInterval(() => {
			if(this.growableFireflyId && this.findFirefly(this.growableFireflyId).size < this.maxFireflySize) {
				this.updateOneFirefly(this.growableFireflyId, currentFirefly => {
					const size = currentFirefly.size + 0.5;

					return {
						x: mousePosition.x - 0.5 * size,
						y: mousePosition.y - 0.5 * size,
						size: size,
					}
				})
			} else {
				if (!sploded && ++numIntervalsSinceSizeMaxed > maxIntervalsSinceSizeMaxed) {
					this.splodeFirefly(this.findFirefly(this.growableFireflyId));
					sploded = true;
					this.growableFireflyId = null;
					clearInterval(this.growFireflyInterval);
				}
			}
		}, 30);
	}

	splodeFirefly(firefly) {
		const NUM_FIREFLY_SPAWN = 16;
		let newFireflies = [];
		for(let i=0; i<NUM_FIREFLY_SPAWN; i++) {
			const newFirefly = this.generateFirefly({
				x: firefly.x + firefly.size/2,
				y: firefly.y + firefly.size/2,
				size: 2,
				xVelocity: i % 2 ? 2 : -2,
				yVelocity: i % 2 ? 2 : -2,
			});
			newFireflies.push(newFirefly);
		}

		this.setState(ps => {
			return {
				fireflies: ps.fireflies.filter(f =>
					!(f.x == firefly.x && f.y == firefly.y && f.size > 2))
						.concat(newFireflies),
			}
		});
	}

	releaseGrownFirefly() {
		clearInterval(this.growFireflyInterval);

		if(this.growableFireflyId) {
			this.updateOneFirefly(this.growableFireflyId, {
				xVelocity: getRandomInt(0, 1) ? 2 : -2,
				yVelocity: getRandomInt(0, 1) ? 2 : -2,
			});
		}
	}

	updateOneFirefly(fireflyId, options) {
		const targetFirefly = this.findFirefly(fireflyId);

		if(!targetFirefly) return;

		this.setState(prevState => {
			return {
				fireflies: prevState.fireflies.map(firefly => {
					if(firefly === targetFirefly) {
						if(typeof options == 'function') {
							options = options(targetFirefly);
						}

						return { ...targetFirefly, ...options };
					} else return firefly;
				})
			}
		});
	}

	findFirefly(fireflyId) {
		return this.state.fireflies.find(firefly => firefly.id == fireflyId);
	}

	render() {
		const bigHillHeight = 1.4*getHeight();
		const smallHillSize = 0.9*bigHillHeight;

		return <div onMouseDown={ this.growFirefly } onMouseUp={ this.releaseGrownFirefly }>
			<Background>
				<Hill width={ bigHillHeight } height={ bigHillHeight } />
				<Hill { ...{
					width: smallHillSize,
					height: smallHillSize,
					bottom: -0.8*smallHillSize,
					right: 0.1*smallHillSize,
				}}/>
				<div className="moon" />
				{ this.state.fireflies.map((firefly, i) => (<Firefly { ...{
					key: i,
					x: firefly.x,
					y: firefly.y,
					size: firefly.size,
				}} />)) }
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
			boxShadow: "0 0 " + blur + "px " + spread + "px #9ff2fb",
		}} />	
	}
}

ReactDOM.render(<Fireflies />, container);