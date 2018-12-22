const PropTypes = require('prop-types');
const { generateParticles, updateParticles } = require('./utils/particle');

function decorateTerm(Term, { React }) {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        profile: ['snow'],
        amount: 100,
        width: window.innerWidth,
        height: window.innerHeight,
        styles: {
          width: window.innerWidth,
          height: window.innerHeight,
          position: 'absolute',
          zIndex: 1000,
          top: 0,
          pointerEvents: 'none',
        },
      };
      this.ctx = null;
      this.dynamicX = 0;
    }

    handleResize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
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
      const { width, height, profile } = this.state;
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
      const { styles, width, height, profile, amount } = this.state;

      this.canvas = document.createElement('canvas');
      this.canvas.style = styles;
      this.canvas.style.width = width;
      this.canvas.style.height = window.innerHeight;
      this.canvas.style.position = 'absolute';
      this.canvas.style.zIndex = 1000;
      this.canvas.style.top = 0;
      this.canvas.style.pointerEvents = 'none';
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = width;
      this.canvas.height = height;

      document.body.appendChild(this.canvas);
      window.addEventListener('resize', this.handleResize());

      const particles = generateParticles(profile, amount, { width, height });

      this.animate(particles);
    }

    render() {
      return React.createElement(
        Term,
        Object.assign({}, this.props, {
          onDecorated: this._onDecorated,
          onCursorMove: this._onCursorMove,
        }),
      );
    }
  };
}

exports.decorateTerm = decorateTerm;
