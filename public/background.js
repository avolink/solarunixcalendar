class SolarBackground {
  constructor() {
    this.canvas = document.getElementById('solar-system-bg');
    this.ctx = this.canvas.getContext('2d');
    
    this.planets = [
      { name: 'Mercury', orbit: 70, size: 2, speed: 0.04, angle: Math.random() * Math.PI * 2, color: '#444' },
      { name: 'Venus', orbit: 110, size: 4, speed: 0.015, angle: Math.random() * Math.PI * 2, color: '#666' },
      { name: 'Earth', orbit: 160, size: 5, speed: 0.01, angle: -Math.PI / 2, color: '#ffffff', draggable: true },
      { name: 'Mars', orbit: 220, size: 3, speed: 0.008, angle: Math.random() * Math.PI * 2, color: '#444' }
    ];
    
    this.dragTarget = null;
    this.isDragging = false;
    this.totalSteps = 14;
    
    this.init();
  }

  init() {
    window.addEventListener('resize', () => this.resize());
    this.resize();
    
    // Canvas Event Listeners
    this.canvas.addEventListener('mousedown', (e) => this.handleDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
    window.addEventListener('mouseup', () => this.handleUp());
    
    // Start Animation
    this.tick();
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  handleDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) - this.centerX;
    const my = (e.clientY - rect.top) - this.centerY;
    
    // Check if clicking near Earth (the only draggable one)
    const earth = this.planets.find(p => p.draggable);
    const ex = Math.cos(earth.angle) * earth.orbit;
    const ey = Math.sin(earth.angle) * earth.orbit;
    
    const dist = Math.sqrt((mx - ex)**2 + (my - ey)**2);
    if (dist < 30) { // Large target for easier dragging
      this.isDragging = true;
      this.dragTarget = earth;
    }
  }

  handleMove(e) {
    if (this.isDragging && this.dragTarget) {
      const rect = this.canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) - this.centerX;
      const my = (e.clientY - rect.top) - this.centerY;
      
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
    
    if (isInteracting && this.dragTarget) {
      // SNAP Earth position to the center of the current step
      const targetAngle = (stepIndex * stepSize) + (stepSize / 2) - (Math.PI / 2);
      this.dragTarget.angle = targetAngle;
      
      // Update calendar month
      if (window.solarCalendar) {
        window.solarCalendar.setMonth(stepIndex);
      }
    }
  }

  updateEarthFromMonth(monthIndex) {
    const earth = this.planets.find(p => p.draggable);
    if (earth && !this.isDragging) {
      const stepSize = (Math.PI * 2) / this.totalSteps;
      // Position at center of segment
      const targetAngle = (monthIndex * stepSize) + (stepSize / 2) - (Math.PI / 2);
      
      // Smoothly interpolate to target? For now, just snap
      earth.angle = targetAngle;
    }
  }

  tick() {
    this.draw();
    
    // Auto-rotate non-draggable planets
    this.planets.forEach(p => {
      if (!p.draggable) {
        p.angle += p.speed * 0.2;
      } else if (!this.isDragging) {
        // Sync Earth with current calendar month if not dragging
        if (window.solarCalendar) {
          this.updateEarthFromMonth(window.solarCalendar.currentMonthIndex);
        }
      }
    });

    requestAnimationFrame(() => this.tick());
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Center Sun
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 15, 0, Math.PI * 2);
    this.ctx.fillStyle = '#111';
    this.ctx.fill();
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Orbits and Planets
    this.planets.forEach(p => {
      // Orbit
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, p.orbit, 0, Math.PI * 2);
      this.ctx.strokeStyle = p.draggable ? '#333' : '#1a1a1a';
      this.ctx.lineWidth = p.draggable ? 1 : 0.5;
      this.ctx.stroke();

      // Planet
      const px = this.centerX + Math.cos(p.angle) * p.orbit;
      const py = this.centerY + Math.sin(p.angle) * p.orbit;
      
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      
      if (p.draggable) {
        // Subtle glow for interactive Earth
        this.ctx.shadowBlur = 10;
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
