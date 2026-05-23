class SolarBackground {
  constructor() {
    this.canvas = document.getElementById('solar-system-bg');
    this.ctx = this.canvas.getContext('2d');
    
    this.planets = [
      { name: 'Mercury', relativeOrbit: 0.15, size: 2, speed: 0.04, angle: Math.random() * Math.PI * 2, color: '#444' },
      { name: 'Venus', relativeOrbit: 0.3, size: 4, speed: 0.015, angle: Math.random() * Math.PI * 2, color: '#666' },
      { name: 'TERRA', relativeOrbit: 0.48, size: 5, speed: 0.01, angle: -Math.PI / 2, color: '#7fd8ff', continentColor: '#1f7a56', draggable: true, hitRadius: 100 },
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
    
    // Reset transform before applying DPR scaling so it does not compound.
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
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
    
    const earth = this.planets.find(p => p.draggable);
    const orbitRadius = earth.relativeOrbit * this.baseRadius * this.scaleFactor;
    const ex = Math.cos(earth.angle) * orbitRadius;
    const ey = Math.sin(earth.angle) * orbitRadius;
    
    const hitRadius = (earth.hitRadius || 30) * this.scaleFactor;
    const dist = Math.sqrt((mx - ex) ** 2 + (my - ey) ** 2);
    const clickRadius = Math.sqrt(mx * mx + my * my);
    const orbitTolerance = 18 * this.scaleFactor;
    const orbitDistance = Math.abs(clickRadius - orbitRadius);

    if (dist < hitRadius || orbitDistance < orbitTolerance) {
      this.isDragging = true;
      this.dragTarget = earth;
      const clickedAngle = Math.atan2(my, mx);
      this.updateCalendarFromAngle(clickedAngle, true);
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
    this.ctx.clearRect(0, 0, this.centerX * 2, this.centerY * 2);
    
    const desktopScale = window.innerWidth >= 768 ? 1.5 : 1;

    // Center Sun
    const sunRadius = 15 * this.scaleFactor * desktopScale;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, sunRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#e6c142';
    this.ctx.fill();
    this.ctx.strokeStyle = '#bfa548';
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
      
      const planetSize = p.size * this.scaleFactor * (p.draggable && window.innerWidth >= 768 ? 1.5 : 1);
      this.ctx.beginPath();
      this.ctx.arc(px, py, planetSize, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      
      if (p.name === 'TERRA') {
        const landSize = planetSize * 0.45;
        this.ctx.beginPath();
        this.ctx.fillStyle = p.continentColor || '#1f7a56';
        this.ctx.moveTo(px - landSize * 0.35, py - landSize * 0.35);
        this.ctx.bezierCurveTo(px - landSize * 0.25, py - landSize * 0.55, px + landSize * 0.25, py - landSize * 0.4, px + landSize * 0.15, py - landSize * 0.05);
        this.ctx.bezierCurveTo(px + landSize * 0.05, py + landSize * 0.15, px - landSize * 0.15, py + landSize * 0.25, px - landSize * 0.35, py + landSize * 0.2);
        this.ctx.bezierCurveTo(px - landSize * 0.5, py + landSize * 0.1, px - landSize * 0.45, py - landSize * 0.2, px - landSize * 0.35, py - landSize * 0.35);
        this.ctx.fill();
      }
      
      if (p.draggable) {
        // Drag helper: Subtle line between Sun and Earth
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(px, py);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.stroke();

        // Subtle glow for interactive Earth
        this.ctx.save();
        this.ctx.shadowBlur = 10 * this.scaleFactor;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(px, py, planetSize, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
        
        if (this.isDragging) {
          // Large hit area guide when actively dragging earth
          this.ctx.beginPath();
          this.ctx.arc(px, py, (p.hitRadius || 30) * this.scaleFactor, 0, Math.PI * 2);
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          this.ctx.setLineDash([5, 12]);
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
          this.ctx.setLineDash([]);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.solarBackground = new SolarBackground();
});
