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
    
    this.init();
  }

  init() {
    window.addEventListener('resize', () => this.resize());
    this.resize();
    
    // Global Event Listeners
    window.addEventListener('mousedown', (e) => this.handleDown(e));
    window.addEventListener('mousemove', (e) => this.handleMove(e));
    window.addEventListener('mouseup', () => this.handleUp());
    
    // Start Animation
    this.tick();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  handleDown(e) {
    const mx = e.clientX - this.centerX;
    const my = e.clientY - this.centerY;
    
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
      const mx = e.clientX - this.centerX;
      const my = e.clientY - this.centerY;
      
      this.dragTarget.angle = Math.atan2(my, mx);
      this.updateCalendarFromAngle(this.dragTarget.angle);
    }
  }

  handleUp() {
    this.isDragging = false;
    this.dragTarget = null;
  }

  updateCalendarFromAngle(angle) {
    // Current angle: -PI to PI
    // Map -PI/2 (top) to day 1
    // Loop around.
    let normAngle = angle + (Math.PI / 2);
    if (normAngle < 0) normAngle += Math.PI * 2;
    
    const progress = normAngle / (Math.PI * 2);
    const doy = Math.floor(progress * 365) + 1; // Simplify to 365 logic for bg
    
    if (window.solarCalendar) {
      window.solarCalendar.jumpToDoy(doy);
    }
  }

  tick() {
    this.draw();
    
    // Auto-rotate non-draggable planets
    this.planets.forEach(p => {
      if (!p.draggable || !this.isDragging) {
        p.angle += p.speed * 0.2; // slow it down for background feel
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
  new SolarBackground();
});
