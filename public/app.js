class SolarCalendar {
  constructor() {
    this.months = [
      "Unath", "Duath", "Triath", "Quadtath", "Pentath", "Sixtith", 
      "Septeth", "Octoth", "Novtath", "Dekath", "Dekaunath", 
      "Dekaduath", "Dekatriath", "Leap"
    ];
    this.planets = ["Mercury", "Venus", "TERRA", "Mars", "Jupiter", "Saturn", "Uranus"];
    this.leapDays = ["Sunday", "Moonday"];
    
    // Initial state
    this.currentMonthIndex = 0;
    this.today = new Date();
    this.year = this.today.getFullYear();
    this.selectedDoy = this.getDayOfYear(this.today);
    
    // Calculate current month from today
    this.determineCurrentSolarDate();
    
    // Cache Elements
    this.monthNameEl = document.getElementById('month-name');
    this.gridEl = document.getElementById('calendar-grid');
    this.slxClockEl = document.getElementById('slx-clock');
    this.gregorianClockEl = document.getElementById('gregorian-clock');
    this.leapTimelineEl = document.getElementById('leap-timeline');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    
    this.init();
  }

  isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  }

  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  determineCurrentSolarDate() {
    const doy = this.getDayOfYear(this.today);
    if (doy <= 364) {
      this.currentMonthIndex = Math.floor((doy - 1) / 28);
      this.currentSolarDay = ((doy - 1) % 28) + 1;
    } else {
      this.currentMonthIndex = 13; // Leap
      this.currentSolarDay = doy;
    }
  }

  render() {
    const monthIndex = this.currentMonthIndex;
    const name = this.months[monthIndex];
    this.monthNameEl.textContent = name;
    
    this.gridEl.innerHTML = '';
    
    if (monthIndex < 13) {
      this.gridEl.classList.remove('leap-layout');
      const shortPlanets = ["MER", "VEN", "TER", "MAR", "JUP", "SAT", "URA"];
      this.planets.forEach((p, idx) => {
        const h = document.createElement('div');
        h.className = 'weekday-header';
        h.innerHTML = `
          <span class="full-name">${p}</span>
          <span class="short-name">${shortPlanets[idx]}</span>
        `;
        this.gridEl.appendChild(h);
      });
      
      const startDoy = monthIndex * 28 + 1;
      for (let i = 1; i <= 28; i++) {
        const doy = startDoy + i - 1;
        this.createDayCell(i, doy);
      }
    } else {
      this.gridEl.classList.add('leap-layout');
      this.leapDays.forEach(d => {
        const h = document.createElement('div');
        h.className = 'weekday-header';
        h.innerHTML = `
          <span class="full-name">${d}</span>
          <span class="short-name">${d.substring(0, 3).toUpperCase()}</span>
        `;
        this.gridEl.appendChild(h);
      });
      
      this.createDayCell(365, 365);
      this.createDayCell(366, 366);
      
      this.renderLeapTimeline();
    }
    
    if (monthIndex < 13) {
      this.leapTimelineEl.style.display = 'none';
    }
  }

  createDayCell(solarDay, doy) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.style.cursor = 'pointer';
    
    cell.addEventListener('click', () => {
      this.setSolarDay(doy);
      if (window.solarBackground) {
        window.solarBackground.updateEarthFromDoy(doy);
      }
    });
    
    const isToday = (this.getDayOfYear(this.today) === doy && this.year === this.today.getFullYear());
    if (isToday) cell.classList.add('today');
    
    if (this.selectedDoy === doy) {
      cell.classList.add('selected-day');
    }
    
    const displayNum = document.createElement('div');
    displayNum.className = 'day-num';
    displayNum.textContent = solarDay;
    if (solarDay === 366) {
      displayNum.classList.add('leap-day-highlight');
      if (this.isLeapYear(this.year)) {
        cell.classList.add('leap-day-active');
      } else {
        cell.classList.add('non-leap-inactive');
      }
    }
    cell.appendChild(displayNum);
    
    const yearDoy = document.createElement('div');
    yearDoy.className = 'year-day-num';
    yearDoy.textContent = doy;
    cell.appendChild(yearDoy);
    
    this.gridEl.appendChild(cell);
  }

  renderLeapTimeline() {
    this.leapTimelineEl.innerHTML = '';
    this.leapTimelineEl.style.display = 'flex';
    
    const getLeapYear = (start, step) => {
      let y = start + step;
      while (!this.isLeapYear(y)) y += step;
      return y;
    };
    
    const prevLeap = getLeapYear(this.year, -1);
    const nextLeap = getLeapYear(this.year, 1);
    
    const formatYear = (gregY) => {
      const slxY = gregY - 1970;
      return `SLX-${slxY}(G-${gregY})`;
    };
    
    const createItem = (y, label, active = false) => {
      const item = document.createElement('div');
      item.className = 'timeline-item' + (active ? ' active' : '');
      
      const yearSpan = document.createElement('span');
      yearSpan.className = 'year-text';
      yearSpan.textContent = formatYear(y);
      
      const labelSpan = document.createElement('span');
      labelSpan.className = 'label-text';
      labelSpan.textContent = label;
      
      item.appendChild(yearSpan);
      item.appendChild(labelSpan);
      return item;
    };
    
    // Previous Leap
    this.leapTimelineEl.appendChild(createItem(prevLeap, 'PREV MOONDAY'));
    
    // Current Year (Active)
    const currentLabel = this.isLeapYear(this.year) ? 'MOONDAY' : 'NO MOONDAY';
    this.leapTimelineEl.appendChild(createItem(this.year, currentLabel, true));
    
    // Next Leap
    this.leapTimelineEl.appendChild(createItem(nextLeap, 'NEXT MOONDAY'));
  }

  handlePrev() {
    this.currentMonthIndex--;
    if (this.currentMonthIndex < 0) this.currentMonthIndex = 13;
    this.render();
  }

  handleNext() {
    this.currentMonthIndex++;
    if (this.currentMonthIndex > 13) this.currentMonthIndex = 0;
    this.render();
  }

  init() {
    this.prevBtn.addEventListener('click', () => this.handlePrev());
    this.nextBtn.addEventListener('click', () => this.handleNext());
    this.startClock();
    this.render();
    window.solarCalendar = this; // Explicit global attachment
  }

  setMonth(index) {
    if (index < 0) index = 13;
    if (index > 13) index = 0;
    
    if (this.currentMonthIndex !== index) {
      this.currentMonthIndex = index;
      
      // Update selected day to first day of new month if jumping months
      if (index < 13) {
        this.selectedDoy = (index * 28) + 1;
      } else {
        this.selectedDoy = 365;
      }
      
      this.render();
    }
  }

  setSolarDay(doy) {
    const maxDay = this.isLeapYear(this.year) ? 366 : 365;
    if (doy < 1) doy = 1;
    if (doy > maxDay) doy = maxDay;

    let targetMonth;
    if (doy <= 364) {
      targetMonth = Math.floor((doy - 1) / 28);
    } else {
      targetMonth = 13;
    }

    const monthChanged = (this.currentMonthIndex !== targetMonth);
    this.currentMonthIndex = targetMonth;
    this.selectedDoy = doy;

    if (monthChanged) {
      this.render();
    } else {
      this.updateSelectedDayHighlight();
    }
  }

  getCurrentDoy() {
    return this.selectedDoy;
  }

  updateSelectedDayHighlight() {
    const cells = this.gridEl.querySelectorAll('.day-cell');
    cells.forEach(cell => {
      cell.classList.remove('selected-day');
      // We don't store DOY in cell usually, so we'll just check based on our grid index
      // But it's easier to just re-scan or re-render if it gets complex.
      // For performance, let's just trigger a re-render for now since it's 28 cells.
    });
    this.render(); 
  }

  jumpToDoy(doy) {
    this.setSolarDay(doy);
  }

  startClock() {
    this.updateClocks();
    setInterval(() => this.updateClocks(), 1000);
  }

  updateClocks() {
    const now = new Date();
    
    // Gregorian Clock: current_date YYYY-MM-DD HH:MM:SS
    const pad = n => String(n).padStart(2, '0');
    const gregDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    this.gregorianClockEl.textContent = `GREGORIAN: ${gregDate} ${timeStr}`;
    
    // SLX Clock: SLX(YYY/DDD) HH:MM:SS
    const slxYear = now.getFullYear() - 1970;
    const slxDay = this.getDayOfYear(now);
    this.slxClockEl.textContent = `SLX(${slxYear}/${slxDay}) ${timeStr}`;
    
    // Optional: Auto-refresh grid if day changes?
    if (slxDay !== this.getDayOfYear(this.today)) {
      this.today = now;
      this.year = now.getFullYear();
      this.determineCurrentSolarDate();
      this.render();
    }
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  new SolarCalendar();

  const walkthroughOverlay = document.getElementById('walkthrough-overlay');
  const walkthroughClose = document.getElementById('walkthrough-close');
  const walkthroughPrev = document.getElementById('walkthrough-prev');
  const walkthroughNext = document.getElementById('walkthrough-next');
  const walkthroughTitle = document.getElementById('walkthrough-title');
  const walkthroughDescription = document.getElementById('walkthrough-description');
  const walkthroughAlwaysCheckbox = document.getElementById('walkthrough-always-show');
  const walkthroughStepNumber = document.getElementById('walkthrough-step-number');
  const walkthroughStepTotal = document.getElementById('walkthrough-step-total');
  const walkthroughArrow = document.getElementById('walkthrough-arrow');
  const walkthroughHelpBtn = document.getElementById('walkthrough-help-btn');

  const steps = [
    {
      title: 'Explore Earth Orbit',
      description: 'Click anywhere on the Earth orbit canvas to rotate the planet and watch the Solar calendar update.',
      selector: '#solar-system-bg',
      arrow: 'down'
    },
    {
      title: 'Navigate Solar Months',
      description: 'Use the previous and next buttons to browse Solar months and see the calendar refresh instantly.',
      selector: '.nav-controls',
      arrow: 'up'
    },
    {
      title: 'Click Solar Days',
      description: 'Click any day in the calendar grid and the Earth position updates to match that Solar date — and vice versa when you move the orbit.',
      selector: '.day-cell.selected-day',
      arrow: 'right'
    },
    {
      title: 'Download the Guide',
      description: 'Tap the top-right icon to download the project PDF and keep this reference for later.',
      selector: '.download-icon-btn',
      arrow: 'left'
    },
    {
      title: 'Leap Period Dates',
      description: 'In Solarix, the Leap Period normally adds one day (Sunday) to the SLX calendar. In Gregorian leap years it adds a second day, Moonday, so the SLX date aligns with the extra Gregorian date.',
      selector: '.month-info',
      arrow: 'up'
    }
  ];

  let currentStep = 0;
  let highlightedElement = null;

  const getEarthScreenPosition = () => {
    if (!window.solarBackground) return null;
    const bg = window.solarBackground;
    const earth = bg.planets.find(p => p.draggable);
    if (!earth) return null;
    const rect = bg.canvas.getBoundingClientRect();
    const orbitRadius = earth.relativeOrbit * bg.baseRadius * bg.scaleFactor;
    const x = rect.left + bg.centerX + Math.cos(earth.angle) * orbitRadius;
    const y = rect.top + bg.centerY + Math.sin(earth.angle) * orbitRadius;
    return { x, y };
  };

  const setActiveStep = (index) => {
    currentStep = Math.max(0, Math.min(steps.length - 1, index));
    const step = steps[currentStep];

    walkthroughTitle.textContent = step.title;
    walkthroughDescription.innerHTML = `<p>${step.description}</p>`;
    walkthroughStepNumber.textContent = `${currentStep + 1}`;
    walkthroughStepTotal.textContent = `${steps.length}`;
    walkthroughPrev.disabled = currentStep === 0;
    walkthroughPrev.style.opacity = currentStep === 0 ? '0.5' : '1';
    walkthroughNext.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Next';

    if (highlightedElement) {
      highlightedElement.classList.remove('walkthrough-target-highlight');
      highlightedElement = null;
    }

    const target = document.querySelector(step.selector);
    if (target) {
      target.classList.add('walkthrough-target-highlight');
      highlightedElement = target;
      if (step.selector === '#solar-system-bg') {
        const earthPos = getEarthScreenPosition();
        if (earthPos) {
          positionArrowAtPoint(earthPos.x, earthPos.y, step.arrow);
        } else {
          positionArrow(target, step.arrow);
        }
      } else {
        positionArrow(target, step.arrow);
      }
    } else {
      walkthroughArrow.style.display = 'none';
    }
  };

  const positionArrowAtPoint = (x, y, direction) => {
    walkthroughArrow.style.display = 'block';
    walkthroughArrow.className = `walkthrough-arrow ${direction}`;
    const offset = 12;
    if (direction === 'down') {
      walkthroughArrow.style.left = `${x - 24}px`;
      walkthroughArrow.style.top = `${Math.max(12, y - 68)}px`;
    } else if (direction === 'up') {
      walkthroughArrow.style.left = `${x - 24}px`;
      walkthroughArrow.style.top = `${Math.min(window.innerHeight - 48, y + 20)}px`;
    } else if (direction === 'left') {
      walkthroughArrow.style.left = `${Math.min(window.innerWidth - 44, x + 24)}px`;
      walkthroughArrow.style.top = `${y - 24}px`;
    } else if (direction === 'right') {
      walkthroughArrow.style.left = `${Math.max(12, x - 68)}px`;
      walkthroughArrow.style.top = `${y - 24}px`;
    }
  };

  const positionArrow = (target, direction) => {
    const rect = target.getBoundingClientRect();
    walkthroughArrow.style.display = 'block';
    walkthroughArrow.className = `walkthrough-arrow ${direction}`;

    if (direction === 'down') {
      walkthroughArrow.style.left = `${rect.left + rect.width / 2 - 24}px`;
      walkthroughArrow.style.top = `${Math.max(12, rect.top - 64)}px`;
    } else if (direction === 'up') {
      walkthroughArrow.style.left = `${rect.left + rect.width / 2 - 24}px`;
      walkthroughArrow.style.top = `${Math.min(window.innerHeight - 48, rect.bottom + 24)}px`;
    } else if (direction === 'left') {
      walkthroughArrow.style.left = `${Math.min(window.innerWidth - 44, rect.right + 24)}px`;
      walkthroughArrow.style.top = `${rect.top + rect.height / 2 - 24}px`;
    } else if (direction === 'right') {
      walkthroughArrow.style.left = `${Math.max(12, rect.left - 68)}px`;
      walkthroughArrow.style.top = `${rect.top + rect.height / 2 - 24}px`;
    }
  };

  const openWalkthrough = () => {
    walkthroughOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setActiveStep(0);
  };

  const closeWalkthrough = () => {
    walkthroughOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    if (highlightedElement) {
      highlightedElement.classList.remove('walkthrough-target-highlight');
      highlightedElement = null;
    }
    walkthroughArrow.style.display = 'none';
    localStorage.setItem('solarixWalkthroughAlwaysShow', walkthroughAlwaysCheckbox.checked ? 'true' : 'false');
  };

  walkthroughClose.addEventListener('click', closeWalkthrough);
  walkthroughPrev.addEventListener('click', () => setActiveStep(currentStep - 1));
  walkthroughNext.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
      setActiveStep(currentStep + 1);
    } else {
      closeWalkthrough();
    }
  });
  walkthroughHelpBtn.addEventListener('click', () => {
    openWalkthrough();
  });

  const params = new URLSearchParams(window.location.search);
  const storedAlways = localStorage.getItem('solarixWalkthroughAlwaysShow');
  const alwaysShow = storedAlways === null ? true : storedAlways === 'true';
  walkthroughAlwaysCheckbox.checked = alwaysShow;

  const shouldShow = (alwaysShow && params.get('walkthrough') !== '0') || params.get('walkthrough') === '1';
  if (shouldShow) {
    openWalkthrough();
  }
});
