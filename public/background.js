class SolarBackground {
  constructor() {
    this.canvas = document.getElementById('solar-system-bg');
    this.ctx = this.canvas.getContext('2d');
    
    this.planets = [
      { name: 'Mercury', relativeOrbit: 0.15, size: 2, speed: 0.04, angle: Math.random() * Math.PI * 2, color: '#444' },
      { name: 'Venus', relativeOrbit: 0.3, size: 4, speed: 0.015, angle: Math.random() * Math.PI * 2, color: '#666' },
      { name: 'Earth', relativeOrbit: 0.48, size: 5, speed: 0.01, angle: -Math.PI / 2, color: '#ffffff', draggable: true },
      { name: 'Mars', relativeOrbit: 0.6, size: 3, speed: 0.008, angle: Math.random() * Math.PI * 2, color: '#444' }
    ];
    
    this.dragTarget = null;
    this.isDragging = false;
    this.totalSteps = 366; // Increased resolution to days
    
    this.init();
  }

  init() {
    window.addEventListener('resize', () => this.resize());
    this.resize();
    
    // Canvas Event Listeners
    this.canvas.addEventListener('mousedown', (e) => this.handleDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
    window.addEventListener('mouseup', () => this.handleUp());
    
    // Touch Events for Mobile
    this.canvas.addEventListener('touchstart', (e) => this.handleDown(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    window.addEventListener('touchend', () => this.handleUp());
    
    // Start Animation
    this.tick();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    // Physical resolution
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    // Logic resolution (for drawing)
    this.ctx.scale(dpr, dpr);
    
    this.centerX = rect.width / 2;
    this.centerY = rect.height / 2;
    
    // Zoom factor
    this.scaleFactor = window.innerWidth > 1024 ? 1.0 : 1.5;
    
    // Max radius (fill screen almost completely)
    const margin = 5;
    this.baseRadius = (Math.min(this.centerX, this.centerY) - margin);
  }

  getXY(e) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      mx: (clientX - rect.left) - this.centerX,
      my: (clientY - rect.top) - this.centerY
    };
  }

  handleDown(e) {
    if (e.type === 'touchstart') e.preventDefault();
    const { mx, my } = this.getXY(e);
    
    // Check if clicking near Earth (the only draggable one)
    const earth = this.planets.find(p => p.draggable);
    const orbitRadius = earth.relativeOrbit * this.baseRadius;
    const ex = Math.cos(earth.angle) * orbitRadius;
    const ey = Math.sin(earth.angle) * orbitRadius;
    
    const dist = Math.sqrt((mx - ex)**2 + (my - ey)**2);
    if (dist < 30) { // Large target for easier dragging
      this.isDragging = true;
      this.dragTarget = earth;
    }
  }

  handleMove(e) {
    if (this.isDragging && this.dragTarget) {
      if (e.type === 'touchmove') e.preventDefault();
      const { mx, my } = this.getXY(e);
      
      const currentMouseAngle = Math.atan2(my, mx);
      this.updateCalendarFromAngle(currentMouseAngle, true);
    }
  }

  handleUp() {
    this.isDragging = false;
    this.dragTarget = null;
  }

  updateCalendarFromAngle(angle, isInteracting = false) {
    let normAngle = angle + (Math.PI / 2);
    while (normAngle < 0) normAngle += Math.PI * 2;
    while (normAngle >= Math.PI * 2) normAngle -= Math.PI * 2;
    
    const stepSize = (Math.PI * 2) / this.totalSteps;
    const stepIndex = Math.floor(normAngle / stepSize);
    const doy = stepIndex + 1;
    
    if (isInteracting && this.dragTarget) {
      // SNAP Earth position to the center of the current day step
      const targetAngle = (stepIndex * stepSize) + (stepSize / 2) - (Math.PI / 2);
      this.dragTarget.angle = targetAngle;
      
      // Update calendar day precisely
      if (window.solarCalendar) {
        window.solarCalendar.setSolarDay(doy);
      }
    }
  }

  updateEarthFromDoy(doy) {
    const earth = this.planets.find(p => p.draggable);
    if (earth && !this.isDragging) {
      const stepIndex = doy - 1;
      const stepSize = (Math.PI * 2) / this.totalSteps;
      const targetAngle = (stepIndex * stepSize) + (stepSize / 2) - (Math.PI / 2);
      earth.angle = targetAngle;
    }
  }

  tick() {
    // Robust resize check for the first few seconds
    if (!this.resizeCount) this.resizeCount = 0;
    if (this.resizeCount < 10) {
      this.resize();
      this.resizeCount++;
    }

    this.draw();
    this.planets.forEach(p => {
      if (!p.draggable) {
        p.angle += p.speed * 0.2;
      } else if (!this.isDragging) {
        // Sync Earth with current calendar day if not dragging
        if (window.solarCalendar) {
          const currentDoy = window.solarCalendar.getCurrentDoy();
          this.updateEarthFromDoy(currentDoy);
        }
      }
    });

    requestAnimationFrame(() => this.tick());
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Center Sun
    const sunRadius = 15 * this.scaleFactor;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, sunRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#111';
    this.ctx.fill();
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Orbits and Planets
    this.planets.forEach(p => {
      // Apply scaleFactor to the relative orbit for the zoom effect
      const orbitRadius = p.relativeOrbit * this.baseRadius * this.scaleFactor;
      
      // Orbit
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, orbitRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = p.draggable ? '#333' : '#1a1a1a';
      this.ctx.lineWidth = p.draggable ? 1 : 0.5;
      this.ctx.stroke();

      // Planet
      const px = this.centerX + Math.cos(p.angle) * orbitRadius;
      const py = this.centerY + Math.sin(p.angle) * orbitRadius;
      
      const planetSize = p.size * this.scaleFactor;
      this.ctx.beginPath();
      this.ctx.arc(px, py, planetSize, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      
      if (p.draggable) {
        // Subtle glow for interactive Earth
        this.ctx.shadowBlur = 10 * this.scaleFactor;
        this.ctx.shadowColor = p.color;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.solarBackground = new SolarBackground();
});
