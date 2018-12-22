const PropTypes = require('prop-types');
const { generateParticles, updateParticles } = require('./utils/particle');

function decorateTerm(Term, { React }) {
  const PROFILE = ['snow', 'steady'];
  const AMOUNT = 800;
  const WIDTH = window.innerWidth;
  const HEIGHT = window.innerHeight;
  const STYLES = {
    background: 'transparent',
    width: '100%',
    height: '100%',
    zIndex: 1000,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'block',
    pointerEvents: 'none',
  };

  class Canvas extends React.Component {
    constructor(props) {
      super(props);

      this.ctx = null;
      this.dynamicX = 0;
    }

    handleResize() {
      this.refs.canvas.width = window.innerWidth;
      this.refs.canvas.height = window.innerHeight;
    }

    /**
     * Draws particles on the canvas by continiously updating the
     * particle values.
     *
     * @param  {array} particles - particle Objects to be rendered
     */
    draw(particles) {
      /**
       * Note that angles are measured in radians:
       *
       * radians = (Math.PI / 180) * degrees
       */
      const startAngle = 0;
      const endAngle = 2 * Math.PI; // 360 degrees in radians
      const antiClockwise = true;
      const { ctx, dynamicX } = this;
      const { width = WIDTH, height = HEIGHT, profile = PROFILE } = this.props;
      const [type] = profile;

      // Clear the canvas context before updating and animating the particles.
      ctx.clearRect(0, 0, width, height);

      // Updates the particle values before (re) drawing to create an animation on the canvas.
      particles.forEach(particle => {
        const {
          deltaX,
          deltaY,
          color,
          radius,
          opacity,
          deltaOpacity,
        } = particle;

        // Update particle values before animating.
        particle.x += deltaX + 1.33 * dynamicX;
        particle.y += deltaY;

        // Update particle opacity based on particle type.
        switch (type) {
          case 'snow': {
            particle.opacity = opacity;

            break;
          }

          case 'confetti': {
            if (particle.opacity <= 0) {
              particle.opacity += deltaOpacity;
            }

            if (particle.opacity > 0) {
              particle.opacity -= deltaOpacity;
            }

            break;
          }
        }

        // Style the particles.
        ctx.fillStyle = color;
        ctx.globalAlpha = particle.opacity;

        // Animate the particles.
        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          radius,
          startAngle,
          endAngle,
          antiClockwise,
        );
        ctx.fill();
        ctx.closePath();

        // Re initialize the particle when it falls out of the view port.
        if (particle.y > height) {
          particle.init();
        }
      });

      this.animate(particles);
    }

    /**
     * Animate by drawing all particles.
     *
     * @param  {array} particles - particle Objects to be rendered
     */
    animate(particles) {
      window.requestAnimationFrame(this.draw.bind(this, particles));
    }

    componentDidMount() {
      const {
        profile = PROFILE,
        amount = AMOUNT,
        width = WIDTH,
        height = HEIGHT,
      } = this.props;

      if (this.refs.canvas) {
        this.ctx = this.refs.canvas.getContext('2d');
        this.refs.canvas.width = window.innerWidth;
        this.refs.canvas.height = window.innerHeight;
      }

      const particles = generateParticles(profile, amount, { width, height });

      this.animate(particles);
    }

    render() {
      const { width = WIDTH, height = HEIGHT, styles = STYLES } = this.props;

      return React.createElement('canvas', {
        id: 'react-snowfetti',
        style: styles,
        ref: 'canvas',
      });
    }
  }

  return class extends React.Component {
    render() {
      return React.createElement('div', {}, [
        React.createElement(Canvas, {
          amount: 100,
        }),
        React.createElement(
          Term,
          Object.assign({}, this.props, {
            onDecorated: this._onDecorated,
            onCursorMove: this._onCursorMove,
          }),
        ),
      ]);
    }
  };
}

exports.decorateTerm = decorateTerm;
