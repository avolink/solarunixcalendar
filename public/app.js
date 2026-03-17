class SolarCalendar {
  constructor() {
    this.months = [
      "Unath", "Duath", "Triath", "Quadtath", "Pentath", "Sixtith", 
      "Septeth", "Octoth", "Novtath", "Dekath", "Dekaunath", 
      "Dekaduath", "Dekatriath", "Leap"
    ];
    this.planets = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus"];
    this.leapDays = ["Sunday", "Moonday"];
    
    // Initial state
    this.currentMonthIndex = 0;
    this.today = new Date();
    this.year = this.today.getFullYear();
    
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
    
    // Smooth transition styles
    this.gridEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
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
    this.gridEl.style.opacity = '0';
    this.gridEl.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      const monthIndex = this.currentMonthIndex;
      const name = this.months[monthIndex];
      this.monthNameEl.textContent = name;
      
      this.gridEl.innerHTML = '';
      
      if (monthIndex < 13) {
        this.gridEl.classList.remove('leap-layout');
        this.planets.forEach(p => {
          const h = document.createElement('div');
          h.className = 'weekday-header';
          h.textContent = p;
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
          h.textContent = d;
          this.gridEl.appendChild(h);
        });
        
        this.createDayCell(365, 365);
        this.createDayCell(366, 366);
        
        this.renderLeapTimeline();
      }
      
      if (monthIndex < 13) {
        this.leapTimelineEl.style.display = 'none';
      }
      
      this.gridEl.style.opacity = '1';
      this.gridEl.style.transform = 'translateY(0)';
    }, 200);
  }

  createDayCell(solarDay, doy) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    
    const isToday = (this.getDayOfYear(this.today) === doy && this.year === this.today.getFullYear());
    if (isToday) cell.classList.add('today');
    
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
    this.leapTimelineEl.appendChild(createItem(prevLeap, 'PREV'));
    
    // Current Year (Active)
    const currentLabel = this.isLeapYear(this.year) ? 'LEAP' : 'NO-LEAP';
    this.leapTimelineEl.appendChild(createItem(this.year, currentLabel, true));
    
    // Next Leap
    this.leapTimelineEl.appendChild(createItem(nextLeap, 'NEXT'));
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
      this.render();
    }
  }

  jumpToDoy(doy) {
    if (doy < 1) doy = 1;
    const maxDay = this.isLeapYear(this.year) ? 366 : 365;
    if (doy > maxDay) doy = maxDay;
    
    let newMonth;
    if (doy <= 364) {
      newMonth = Math.floor((doy - 1) / 28);
    } else {
      newMonth = 13; // Leap
    }
    
    this.setMonth(newMonth);
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
});
