console.log("hello");

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
				const newFireflies = ps.fireflies.map(f => {
					const xVelocity = getRandomInt(1, 10) > 1 ? f.xVelocity : -1*f.xVelocity;
					const yVelocity = getRandomInt(1, 10) > 1 ? f.yVelocity : -1*f.yVelocity;

					return {
						xVelocity: xVelocity, 
						yVelocity: yVelocity,
						x: f.x + xVelocity,
						y: f.y + yVelocity,

					}
				})
				return { fireflies: newFireflies }
			})
		}, 50);
	}

	generateFireflies(numFireflies) {
		const fireflies = []; 

		for(let i=0; i<numFireflies; i++) {
			fireflies.push(this.generateFirefly());
		}

		return fireflies;
	}

	generateFirefly() {
		return {
			x: getRandomInt(0, width),
			y: getRandomInt(0, height),
			xVelocity: getRandomInt(0, 1) ? 2 : -2,
			yVelocity: getRandomInt(0, 1) ? 2 : -2,
		}
	}

	addFirefly() {
		this.setState(ps => {
			return {
				fireflies: ps.fireflies.concat(this.generateFirefly())
			}
		});
	}

	render() {
		console.log(this.state.fireflies.length);
		return <div onClick={ this.addFirefly }>
			<Background>
				{ this.state.fireflies.map((a, i) =>
					<Firefly key={ i } x={ a.x } y={ a.y } />) }
			</Background>
		</div>
	}
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
		return <div style={{ top: this.props.y, left: this.props.x }} className="firefly" />	
	}
}

ReactDOM.render(<Fireflies />, container);	