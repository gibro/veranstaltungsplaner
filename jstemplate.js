// Veranstaltungspicker JavaScript - Refactored
// Version 2.0

// ============================================
// ÜBERSCHREIBE MOODLE-CORE PERPAGE EINSTELLUNG
// Muss VOR dem IIFE ausgeführt werden!
// ============================================

(function() {
  'use strict';
  
  // Überschreibe URL-Parameter SOFORT beim Laden
  const currentUrl = new URL(window.location.href);
  const perpage = currentUrl.searchParams.get('perpage');
  
  // Wenn perpage nicht gesetzt oder zu klein ist, setze auf 1000
  if (!perpage || parseInt(perpage) < 100) {
    currentUrl.searchParams.set('perpage', '1000');
    
    // Verhindere Endlosschleife mit sessionStorage
    if (!sessionStorage.getItem('veranstaltungspicker_perpage_set')) {
      sessionStorage.setItem('veranstaltungspicker_perpage_set', 'true');
      console.log('Überschreibe perpage-Einstellung: Lade Seite mit perpage=1000 neu');
      window.location.replace(currentUrl.toString());
      return; // Stoppe weitere Ausführung
    }
  }
})();

(function() {
  'use strict';

  /* ============================================
     CONSTANTS & CONFIGURATION
     ============================================ */
  
  const CONFIG = {
    storageKey: 'veranstaltungspicker_favorites',
    maxRetries: 10,
    retryDelay: 300,
    initDelay: 300,
    invalidIds: ['[[entryid]]', '##entryid##', '##id##', '', null, undefined]
  };

  /* ============================================
     UTILITY FUNCTIONS
     ============================================ */
  
  /**
   * Entfernt HTML-Tags aus einem String
   * @param {string} html - HTML String
   * @returns {string} Bereinigter Text
   */
  function stripHTML(html) {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Prüft ob eine ID gültig ist
   * @param {*} id - Zu prüfende ID
   * @returns {boolean}
   */
  function isValidEntryId(id) {
    return id && !CONFIG.invalidIds.includes(id);
  }

  /**
   * Extrahiert die Entry-ID aus verschiedenen Quellen
   * Fallback-Kette: data-attribute → element-id → links → forms → DOM-index
   * @param {HTMLElement} element - DOM Element
   * @returns {string|null} Entry ID oder null
   */
  function extractEntryId(element) {
    if (!element) return null;
    
    // 1. Versuche data-entry-id Attribut
    let entryId = element.dataset.entryId || element.getAttribute('data-entry-id');
    if (isValidEntryId(entryId)) return String(entryId);
    
    // 2. Versuche vom Button (falls element ein Button ist oder enthält)
    const btn = element.matches('.favorite-btn, .ics-download-btn') 
      ? element 
      : element.querySelector('.favorite-btn, .ics-download-btn');
    if (btn) {
      entryId = btn.dataset.entryId || btn.getAttribute('data-entry-id');
      if (isValidEntryId(entryId)) return String(entryId);
    }
    
    // 3. Versuche vom nächsten .event-entry parent
    const eventEntry = element.closest('.event-entry');
    if (eventEntry && eventEntry !== element) {
      entryId = eventEntry.dataset.entryId || eventEntry.getAttribute('data-entry-id');
      if (isValidEntryId(entryId)) return String(entryId);
    }
    
    // 4. Extrahiere aus Element-ID (z.B. "entry-123" oder "r123")
    const targetElement = eventEntry || element;
    if (targetElement.id) {
      const idMatch = targetElement.id.match(/(\d+)$/);
      if (idMatch) return idMatch[1];
    }
    
    // 5. Suche in Links mit entryid-Parameter
    const entryLink = targetElement.querySelector('a[href*="entryid"], a[href*="eid"], a[href*="rid="], a[href*="id="]');
    if (entryLink) {
      const hrefMatch = entryLink.href.match(/[?&](?:entryid|eid|rid|id)=(\d+)/);
      if (hrefMatch) return hrefMatch[1];
    }
    
    // 6. Suche in Forms
    const form = targetElement.querySelector('form');
    if (form) {
      // Prüfe Form-Action
      const actionMatch = (form.action || '').match(/[?&](?:entryid|eid|rid|id)=(\d+)/);
      if (actionMatch) return actionMatch[1];
      
      // Prüfe versteckte Input-Felder
      const hiddenInput = form.querySelector('input[name*="entryid"], input[name*="eid"], input[name*="rid"], input[type="hidden"][value]');
      if (hiddenInput && hiddenInput.value) {
        const valueMatch = hiddenInput.value.match(/(\d+)/);
        if (valueMatch) return valueMatch[1];
      }
    }
    
    // 7. Fallback: Verwende DOM-Index als temporäre ID
    const allEntries = document.querySelectorAll('.event-entry');
    const index = Array.from(allEntries).indexOf(targetElement);
    if (index !== -1) {
      const tempId = 'temp-' + index + '-' + Date.now();
      console.warn('Verwende temporäre ID für Entry:', tempId);
      return tempId;
    }
    
    return null;
  }

  /* ============================================
     FAVORITEN-MANAGEMENT
     ============================================ */
  
  const FavoritesManager = {
    storageKey: CONFIG.storageKey,
    
    getFavorites: function() {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    },
    
    addFavorite: function(entryId) {
      const favorites = this.getFavorites();
      if (!favorites.includes(entryId)) {
        favorites.push(entryId);
        localStorage.setItem(this.storageKey, JSON.stringify(favorites));
      }
    },
    
    removeFavorite: function(entryId) {
      const favorites = this.getFavorites();
      const index = favorites.indexOf(entryId);
      if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem(this.storageKey, JSON.stringify(favorites));
      }
    },
    
    isFavorite: function(entryId) {
      return this.getFavorites().includes(entryId);
    },
    
    toggleFavorite: function(entryId) {
      if (this.isFavorite(entryId)) {
        this.removeFavorite(entryId);
        return false;
      } else {
        this.addFavorite(entryId);
        return true;
      }
    }
  };

  /* ============================================
     DATUM-FORMATIERUNG
     ============================================ */
  
  const DateFormatter = {
    dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    
    formatDate: function(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr + 'T00:00:00');
      const dayName = this.dayNames[date.getDay()];
      const day = date.getDate();
      const month = date.getMonth() + 1;
      
      return {
        full: `${day}. ${this.monthNames[date.getMonth()]} ${date.getFullYear()}`,
        short: `${dayName} ${day}.${month < 10 ? '0' + month : month}.`,
        dayName: dayName,
        date: dateStr
      };
    },
    
    parseTime: function(timeStr) {
      if (!timeStr) return null;
      const parts = timeStr.split(':');
      return {
        hours: parseInt(parts[0], 10),
        minutes: parseInt(parts[1], 10)
      };
    }
  };

  /* ============================================
     ICS-GENERIERUNG
     ============================================ */
  
  const ICSGenerator = {
    generateICS: function(events) {
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//IG Metall//Veranstaltungspicker//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];
      
      events.forEach(event => {
        lines.push('BEGIN:VEVENT');
        lines.push('UID:' + this.generateUID(event.entryId));
        lines.push('DTSTAMP:' + this.formatDateTime(new Date()));
        
        const startDate = new Date(event.datum + 'T' + event.startuhrzeit + ':00');
        const endDate = new Date(event.datum + 'T' + event.enduhrzeit + ':00');
        
        lines.push('DTSTART;TZID=Europe/Berlin:' + this.formatDateTime(startDate));
        lines.push('DTEND;TZID=Europe/Berlin:' + this.formatDateTime(endDate));
        
        const summary = event.titel + (event.untertitel ? ' - ' + event.untertitel : '');
        lines.push('SUMMARY:' + this.escapeText(summary));
        
        let description = '';
        if (event.inhalt) description += event.inhalt + '\\n\\n';
        if (event.referent1) description += 'Referent*in: ' + event.referent1;
        if (event.referent2) description += ', ' + event.referent2;
        if (event.referent3) description += ', ' + event.referent3;
        
        if (description) {
          lines.push('DESCRIPTION:' + this.escapeText(description));
        }
        
        if (event.link) {
          lines.push('URL;VALUE=URI:' + event.link);
        }
        
        // Erinnerung 15 Minuten vorher
        lines.push('BEGIN:VALARM');
        lines.push('TRIGGER:-PT15M');
        lines.push('ACTION:DISPLAY');
        lines.push('DESCRIPTION:Erinnerung: ' + this.escapeText(summary));
        lines.push('END:VALARM');
        
        lines.push('END:VEVENT');
      });
      
      lines.push('END:VCALENDAR');
      return lines.join('\r\n');
    },
    
    formatDateTime: function(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return year + month + day + 'T' + hours + minutes + seconds;
    },
    
    escapeText: function(text) {
      if (!text) return '';
      return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '');
    },
    
    generateUID: function(entryId) {
      return 'veranstaltung-' + entryId + '@igmetall.de';
    },
    
    downloadICS: function(content, filename) {
      const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  };

  /* ============================================
     EVENT-FORMATIERUNG
     ============================================ */
  
  const EventFormatter = {
    /**
     * Formatiert alle Event-Einträge im DOM
     */
    formatAll: function() {
      document.querySelectorAll('.event-entry').forEach(entry => this.formatEntry(entry));
    },
    
    /**
     * Formatiert einen einzelnen Event-Eintrag
     * @param {HTMLElement} entry - Event-Entry Element
     */
    formatEntry: function(entry) {
      this.formatDate(entry);
      this.formatReferenten(entry);
      this.formatZielgruppe(entry);
      this.hideEmptyElements(entry);
    },
    
    formatDate: function(entry) {
      const dateStr = entry.dataset.datum;
      if (!dateStr) return;
      
      const dateInfo = DateFormatter.formatDate(dateStr);
      const dateEl = entry.querySelector('.event-date');
      if (dateEl) {
        dateEl.textContent = dateInfo.full;
      }
    },
    
    formatReferenten: function(entry) {
      const referenten = [];
      
      // Sammle alle Referent*innen
      for (let i = 1; i <= 3; i++) {
        let ref = stripHTML(entry.dataset['referent' + i] || '').trim();
        if (ref) referenten.push(ref);
      }
      
      // Formatiere für Listenansicht
      const referentenEl = entry.querySelector('.event-referenten');
      if (referentenEl) {
        if (referenten.length > 0) {
          referentenEl.textContent = referenten.join(' und ');
          referentenEl.style.display = '';
        } else {
          referentenEl.style.display = 'none';
        }
      }
      
      // Formatiere für Einzelansicht
      this.formatReferentenDetails(entry);
    },
    
    formatReferentenDetails: function(entry) {
      const referentenItems = entry.querySelectorAll('.referent-item');
      referentenItems.forEach((item, index) => {
        const num = index + 1;
        const nameEl = item.querySelector('.referent-name');
        const infoEl = item.querySelector('.referent-info');
        const contactEl = item.querySelector('.referent-contact');
        
        let name = stripHTML(entry.dataset['referent' + num] || '').trim();
        let info = stripHTML(entry.dataset['referent' + num + 'Info'] || '').trim();
        let contact = stripHTML(entry.dataset['referent' + num + 'Kontakt'] || '').trim();
        
        if (!name) {
          item.style.display = 'none';
          return;
        }
        
        if (nameEl) nameEl.textContent = name;
        
        if (infoEl && info) {
          infoEl.textContent = info;
        } else if (infoEl) {
          infoEl.style.display = 'none';
        }
        
        if (contactEl && contact) {
          if (contact.includes('@')) {
            contactEl.innerHTML = '<a href="mailto:' + contact + '">' + contact + '</a>';
          } else {
            contactEl.textContent = contact;
          }
        } else if (contactEl) {
          contactEl.style.display = 'none';
        }
      });
    },
    
    formatZielgruppe: function(entry) {
      const card = entry.querySelector('.event-card');
      const badge = entry.querySelector('.zielgruppe-badge.event-audience');
      
      if (!badge || !card) return;
      
      // Hole Zielgruppe
      let zielgruppe = badge.textContent.trim() || stripHTML(entry.dataset.zielgruppe || '').trim();
      
      // Entferne alte Klassen
      badge.classList.remove('audience-all', 'audience-beginner', 'audience-advanced', 'audience-staff');
      
      // Bestimme Farbe und Klasse
      const accentColor = this.getZielgruppeColor(zielgruppe);
      card.style.setProperty('--accent', accentColor);
      card.style.borderLeftColor = accentColor;
      
      // Setze CSS-Klasse
      const cssClass = this.getZielgruppeClass(zielgruppe);
      if (cssClass) badge.classList.add(cssClass);
    },
    
    getZielgruppeColor: function(zielgruppe) {
      if (!zielgruppe) return '#00bcd4';
      
      const zg = zielgruppe.toLowerCase();
      if (zg.includes('interessierte')) return '#d4d3d3';
      if (zg.includes('einsteiger')) return '#28a745';
      if (zg.includes('fortgeschrittene')) return '#17a2b8';
      if (zg.includes('hauptamtliche')) return '#ffc107';
      
      return '#00bcd4';
    },
    
    getZielgruppeClass: function(zielgruppe) {
      if (!zielgruppe) return null;
      
      const zg = zielgruppe.toLowerCase();
      if (zg.includes('interessierte')) return 'audience-all';
      if (zg.includes('einsteiger')) return 'audience-beginner';
      if (zg.includes('fortgeschrittene')) return 'audience-advanced';
      if (zg.includes('hauptamtliche')) return 'audience-staff';
      
      return null;
    },
    
    hideEmptyElements: function(entry) {
      // Verstecke leeren Untertitel
      const subtitleEl = entry.querySelector('.event-subtitle');
      if (subtitleEl && !entry.dataset.untertitel?.trim()) {
        subtitleEl.style.display = 'none';
      }
      
      // Verstecke leere Beschreibung
      const descriptionEl = entry.querySelector('.event-description');
      if (descriptionEl && !descriptionEl.textContent?.trim()) {
        descriptionEl.style.display = 'none';
      }
      
      // Verstecke Footer wenn keine Anmeldung
      this.hideEmptyFooter(entry);
      
      // Verstecke leere Detail-Items
      entry.querySelectorAll('.detail-item').forEach(item => {
        const valueEl = item.querySelector('.detail-value');
        if (valueEl && !valueEl.textContent?.trim()) {
          item.style.display = 'none';
        }
      });
      
      // Verstecke leeren Veranstaltungstyp
      const typeEl = entry.querySelector('.event-type');
      if (typeEl && !entry.dataset.veranstaltungstyp?.trim()) {
        typeEl.style.display = 'none';
      }
    },
    
    hideEmptyFooter: function(entry) {
      const footerEl = entry.querySelector('.event-footer');
      const anmeldungEl = entry.querySelector('.event-anmeldung');
      
      if (!footerEl) return;
      
      if (anmeldungEl) {
        const linkEl = anmeldungEl.querySelector('a');
        if (linkEl && linkEl.href && linkEl.textContent?.trim()) {
          footerEl.style.display = 'flex';
          anmeldungEl.style.display = '';
        } else {
          footerEl.style.display = 'none';
          anmeldungEl.style.display = 'none';
        }
      } else {
        const footerLinks = footerEl.querySelectorAll('a');
        if (footerLinks.length === 0) {
          footerEl.style.display = 'none';
        }
      }
    }
  };

  /* ============================================
     EVENT-MANAGER
     ============================================ */
  
  const EventManager = {
    events: [],
    groupedByDay: {},
    
    init: function() {
      console.log('EventManager: Initialisiere...');
      this.collectEvents();
      this.setupEventListeners();
      
      const eventsContainer = document.getElementById('events-container');
      if (eventsContainer && this.events.length > 0) {
        this.groupByDay();
        this.renderColumns();
      } else {
        this.updateFavoritesUI();
        EventFormatter.formatAll();
      }
    },
    
    collectEvents: function() {
      const entries = document.querySelectorAll('.event-entry');
      this.events = Array.from(entries).map(entry => {
        const descriptionEl = entry.querySelector('.event-description');
        const anmeldungEl = entry.querySelector('.event-anmeldung a, .event-footer a');
        
        // Bereinige Zielgruppe von HTML-Tags für korrekten Filter-Vergleich
        let zielgruppe = entry.dataset.zielgruppe || '';
        zielgruppe = stripHTML(zielgruppe).trim();
        
        // Fallback: Hole Zielgruppe aus der Badge, falls data-Attribut leer oder invalide
        if (!zielgruppe) {
          const badge = entry.querySelector('.zielgruppe-badge, .event-audience');
          if (badge) {
            zielgruppe = badge.textContent.trim();
          }
        }
        
        return {
          element: entry,
          entryId: extractEntryId(entry),
          datum: entry.dataset.datum,
          startuhrzeit: entry.dataset.startuhrzeit,
          enduhrzeit: entry.dataset.enduhrzeit,
          zielgruppe: zielgruppe,
          titel: entry.dataset.titel,
          untertitel: entry.dataset.untertitel,
          inhalt: descriptionEl ? descriptionEl.textContent || descriptionEl.innerText : '',
          referent1: entry.dataset.referent1,
          referent1Info: entry.dataset.referent1Info,
          referent2: entry.dataset.referent2,
          referent2Info: entry.dataset.referent2Info,
          referent3: entry.dataset.referent3,
          referent3Info: entry.dataset.referent3Info,
          link: anmeldungEl ? anmeldungEl.href : ''
        };
      });
    },
    
    groupByDay: function() {
      this.groupedByDay = {};
      
      this.events.forEach(event => {
        if (!this.groupedByDay[event.datum]) {
          this.groupedByDay[event.datum] = [];
        }
        this.groupedByDay[event.datum].push(event);
      });
      
      // Sortiere Events nach Startuhrzeit
      Object.keys(this.groupedByDay).forEach(date => {
        this.groupedByDay[date].sort((a, b) => {
          const timeA = DateFormatter.parseTime(a.startuhrzeit);
          const timeB = DateFormatter.parseTime(b.startuhrzeit);
          if (!timeA || !timeB) return 0;
          if (timeA.hours !== timeB.hours) return timeA.hours - timeB.hours;
          return timeA.minutes - timeB.minutes;
        });
      });
    },
    
    renderColumns: function() {
      const container = document.getElementById('events-container');
      if (!container) return;
      
      if (this.events.length === 0) {
        this.collectEvents();
        this.groupByDay();
      }
      
      container.innerHTML = '';
      const sortedDates = Object.keys(this.groupedByDay).sort();
      
      sortedDates.forEach(date => {
        const dateInfo = DateFormatter.formatDate(date);
        const column = document.createElement('div');
        column.className = 'day-column';
        column.dataset.date = date;
        
        const header = document.createElement('div');
        header.className = 'day-header';
        header.innerHTML = dateInfo.dayName + ' ';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'day-date';
        dateSpan.textContent = dateInfo.full;
        header.appendChild(dateSpan);
        
        column.appendChild(header);
        
        this.groupedByDay[date].forEach(event => {
          if (event.element) {
            column.appendChild(event.element);
          }
        });
        
        container.appendChild(column);
      });
      
      // Aktualisiere Event-Referenzen
      this.collectEvents();
      this.groupByDay();
      
      console.log('EventManager: Events neu gesammelt:', this.events.length);
      
      this.updateFavoritesUI();
      EventFormatter.formatAll();
    },
    
    setupEventListeners: function() {
      const container = document.querySelector('.veranstaltungspicker-container') || document.body;
      
      // Entferne alte Listener
      if (container._favoriteClickHandler) {
        container.removeEventListener('click', container._favoriteClickHandler);
      }
      if (container._icsClickHandler) {
        container.removeEventListener('click', container._icsClickHandler);
      }
      
      // Favoriten-Button Handler
      container._favoriteClickHandler = this.handleFavoriteClick.bind(this);
      container.addEventListener('click', container._favoriteClickHandler);
      
      // ICS-Download Handler
      container._icsClickHandler = this.handleICSClick.bind(this);
      container.addEventListener('click', container._icsClickHandler);
      
      // Export-Button Handler
      this.setupExportButton();
    },
    
    handleFavoriteClick: function(e) {
      const btn = e.target.closest('.favorite-btn');
      const starIcon = e.target.closest('.star-icon');
      
      if (!btn && !starIcon) return;
      
      const targetBtn = btn || starIcon.closest('.favorite-btn');
      if (!targetBtn) return;
      
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const entryId = extractEntryId(targetBtn);
      if (!entryId) {
        console.warn('Keine entryId gefunden für Button:', targetBtn);
        return;
      }
      
      const isFavorite = FavoritesManager.toggleFavorite(entryId);
      targetBtn.classList.toggle('active', isFavorite);
      
      const icon = targetBtn.querySelector('.star-icon');
      if (icon) {
        icon.textContent = isFavorite ? '★' : '☆';
      }
      
      this.updateFavoriteCount();
    },
    
    handleICSClick: function(e) {
      const btn = e.target.closest('.ics-download-btn');
      if (!btn) return;
      
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const entryId = extractEntryId(btn);
      if (!entryId) {
        console.warn('Keine entryId gefunden für ICS-Button:', btn);
        return;
      }
      
      let event = this.events.find(ev => String(ev.entryId) === String(entryId));
      
      if (!event) {
        console.log('Event nicht in Liste, sammle neu...');
        this.collectEvents();
        event = this.events.find(ev => String(ev.entryId) === String(entryId));
      }
      
      if (event) {
        const ics = ICSGenerator.generateICS([event]);
        const filename = 'veranstaltung-' + entryId + '.ics';
        ICSGenerator.downloadICS(ics, filename);
      } else {
        console.error('Event nicht gefunden für entryId:', entryId);
        alert('Event konnte nicht für ICS-Export gefunden werden.');
      }
    },
    
    setupExportButton: function() {
      const exportBtn = document.getElementById('export-favorites');
      if (!exportBtn) return;
      
      if (exportBtn._exportClickHandler) {
        exportBtn.removeEventListener('click', exportBtn._exportClickHandler);
      }
      
      exportBtn._exportClickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const favorites = FavoritesManager.getFavorites();
        
        if (!this.events || this.events.length === 0) {
          this.collectEvents();
        }
        
        const favoriteEvents = this.events.filter(ev => {
          const eventId = String(ev.entryId);
          return favorites.includes(eventId) || favorites.includes(ev.entryId);
        });
        
        if (favoriteEvents.length > 0) {
          console.log('Exportiere Favoriten:', favoriteEvents.length);
          const ics = ICSGenerator.generateICS(favoriteEvents);
          ICSGenerator.downloadICS(ics, 'favoriten-veranstaltungen.ics');
        } else {
          console.warn('Keine Favoriten gefunden');
          alert('Keine Favoriten zum Exportieren vorhanden.');
        }
      };
      
      exportBtn.addEventListener('click', exportBtn._exportClickHandler);
    },
    
    updateFavoritesUI: function() {
      const favorites = FavoritesManager.getFavorites();
      
      document.querySelectorAll('.favorite-btn').forEach(btn => {
        const entryId = extractEntryId(btn);
        if (!entryId) return;
        
        const isFavorite = favorites.includes(String(entryId));
        btn.classList.toggle('active', isFavorite);
        
        const starIcon = btn.querySelector('.star-icon');
        if (starIcon) {
          starIcon.textContent = isFavorite ? '★' : '☆';
        }
      });
      
      this.updateFavoriteCount();
    },
    
    updateFavoriteCount: function() {
      const favorites = FavoritesManager.getFavorites();
      const count = favorites.length;
      const countEl = document.getElementById('favorite-count');
      const exportBtn = document.getElementById('export-favorites');
      
      if (countEl) {
        countEl.textContent = count > 0 ? `${count} Favorit${count !== 1 ? 'en' : ''}` : '';
      }
      
      if (exportBtn) {
        exportBtn.style.display = 'block';
        exportBtn.disabled = count === 0;
        exportBtn.setAttribute('title', count === 0 ? 'Keine Favoriten vorhanden' : '');
      }
    },
    
    applyFilters: function() {
      console.log('EventManager: Filter werden angewendet');
      
      const tagFilter = document.getElementById('filter-tag')?.value || '';
      const zielgruppeFilter = document.getElementById('filter-zielgruppe')?.value || '';
      const startzeitFilter = document.getElementById('filter-startzeit')?.value || '';
      const favoritenFilter = document.getElementById('filter-favoriten')?.checked || false;
      const favorites = FavoritesManager.getFavorites();
      
      console.log('Filter:', { tag: tagFilter, zielgruppe: zielgruppeFilter, startzeit: startzeitFilter, favoriten: favoritenFilter });
      
      if (this.events.length === 0) {
        console.warn('Keine Events zum Filtern!');
        return;
      }
      
      let visibleCount = 0;
      let hiddenCount = 0;
      let zielgruppenDebug = new Map(); // Verwende Map um zu sehen welche Events welche Zielgruppe haben
      
      this.events.forEach(event => {
        let show = true;
        let filterReason = [];
        
        if (tagFilter && event.datum !== tagFilter) {
          show = false;
          filterReason.push('tag');
        }
        
        // Zielgruppen-Filter mit normalisiertem Vergleich
        if (zielgruppeFilter) {
          // Sammle alle Zielgruppen für Debug-Ausgabe
          if (event.zielgruppe) {
            if (!zielgruppenDebug.has(event.zielgruppe)) {
              zielgruppenDebug.set(event.zielgruppe, []);
            }
            zielgruppenDebug.get(event.zielgruppe).push(event.titel);
          }
          
          // Normalisiere beide Werte für Vergleich: Trim, entferne doppelte Leerzeichen
          const normalizedEventZielgruppe = (event.zielgruppe || '').trim().replace(/\s+/g, ' ');
          const normalizedFilterZielgruppe = zielgruppeFilter.trim().replace(/\s+/g, ' ');
          
          if (normalizedEventZielgruppe !== normalizedFilterZielgruppe) {
            show = false;
            filterReason.push(`zielgruppe (Event: "${normalizedEventZielgruppe}" !== Filter: "${normalizedFilterZielgruppe}")`);
          }
        }
        
        if (startzeitFilter) {
          const time = DateFormatter.parseTime(event.startuhrzeit);
          if (!time || String(time.hours).padStart(2, '0') !== startzeitFilter) {
            show = false;
            filterReason.push('startzeit');
          }
        }
        
        if (favoritenFilter) {
          const eventId = String(event.entryId);
          if (!favorites.includes(eventId)) {
            show = false;
            filterReason.push('favoriten');
          }
        }
        
        if (event.element) {
          event.element.classList.toggle('hidden', !show);
          if (show) {
            visibleCount++;
          } else {
            hiddenCount++;
            // Nur die ersten 3 gefilterten Events loggen, um Console nicht zu überfüllen
            if (zielgruppeFilter && hiddenCount <= 3 && filterReason.length > 0) {
              console.log(`Event "${event.titel}" gefiltert wegen:`, filterReason.join(', '));
            }
          }
        }
      });
      
      console.log('Filter-Ergebnis:', visibleCount, 'von', this.events.length, 'Events sichtbar');
      
      // Debug-Ausgabe für Zielgruppen
      if (zielgruppeFilter) {
        console.log('=== ZIELGRUPPEN-DEBUG ===');
        console.log('Gesuchte Zielgruppe:', `"${zielgruppeFilter}"`);
        console.log('Verfügbare Zielgruppen im System:');
        zielgruppenDebug.forEach((eventTitles, zielgruppe) => {
          console.log(`  - "${zielgruppe}" (${eventTitles.length} Events)`);
        });
        console.log('========================');
      }
      
      // Verstecke leere Spalten
      document.querySelectorAll('.day-column').forEach(column => {
        const visibleEvents = column.querySelectorAll('.event-entry:not(.hidden)');
        column.style.display = visibleEvents.length > 0 ? 'flex' : 'none';
      });
    }
  };

  /* ============================================
     FILTER-MANAGER
     ============================================ */
  
  const FilterManager = {
    initialized: false,
    retryCount: 0,
    maxRetries: CONFIG.maxRetries,
    
    init: function() {
      this.tryInitialize();
    },
    
    tryInitialize: function() {
      const filterContainer = document.getElementById('filter-container') || 
                            document.querySelector('.filter-container');
      
      if (!filterContainer) {
        this.retryCount++;
        if (this.retryCount < this.maxRetries) {
          console.log(`FilterManager: Container noch nicht gefunden, Versuch ${this.retryCount}/${this.maxRetries}`);
          setTimeout(() => this.tryInitialize(), CONFIG.retryDelay);
          return;
        } else {
          console.warn('FilterManager: Container nicht gefunden - möglicherweise nicht in dieser Ansicht');
          return;
        }
      }
      
      if (this.initialized) {
        console.log('FilterManager: Bereits initialisiert');
        return;
      }
      
      console.log('FilterManager: Container gefunden, initialisiere...');
      this.populateTagFilter();
      this.setupFilterElements();
      this.initialized = true;
    },
    
    populateTagFilter: function() {
      const tagSelect = document.getElementById('filter-tag');
      if (!tagSelect) return;
      
      // Entferne alle Optionen außer "Alle"
      while (tagSelect.children.length > 1) {
        tagSelect.removeChild(tagSelect.lastChild);
      }
      
      if (!EventManager.groupedByDay || Object.keys(EventManager.groupedByDay).length === 0) {
        EventManager.collectEvents();
        EventManager.groupByDay();
      }
      
      const dates = Object.keys(EventManager.groupedByDay).sort();
      dates.forEach(date => {
        const dateInfo = DateFormatter.formatDate(date);
        const option = document.createElement('option');
        option.value = date;
        option.textContent = dateInfo.short;
        tagSelect.appendChild(option);
      });
      
      console.log(`FilterManager: Tag-Filter mit ${dates.length} Optionen befüllt`);
    },
    
    setupFilterElements: function() {
      console.log('FilterManager: Konfiguriere Filter-Elemente');
      
      ['filter-tag', 'filter-zielgruppe', 'filter-startzeit', 'filter-favoriten'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener('change', () => {
            console.log('Filter geändert:', id);
            EventManager.applyFilters();
          });
          console.log('FilterManager: Event-Listener hinzugefügt für', id);
        } else {
          console.warn('FilterManager: Element nicht gefunden:', id);
        }
      });
      
      console.log('FilterManager: Erfolgreich initialisiert!');
    }
  };

  /* ============================================
     PAGINIERUNG & AUTO-LOAD
     ============================================ */
  
  /**
   * Prüft ob die perpage-Einstellung korrekt ist
   * Die eigentliche Überschreibung passiert bereits am Anfang der Datei
   */
  function checkPerpageSettings() {
    const currentUrl = new URL(window.location.href);
    const perpage = currentUrl.searchParams.get('perpage');
    
    if (perpage && parseInt(perpage) >= 100) {
      console.log('Perpage-Einstellung OK:', perpage);
      return true;
    }
    
    // Falls perpage immer noch nicht korrekt ist, versuche noch einmal
    console.warn('Perpage-Einstellung nicht korrekt, setze neu');
    currentUrl.searchParams.set('perpage', '1000');
    sessionStorage.setItem('veranstaltungspicker_perpage_set', 'true');
    window.location.replace(currentUrl.toString());
    return false;
  }

  /* ============================================
     INITIALISIERUNG
     ============================================ */
  
  function initializeApp() {
    console.log('=== Veranstaltungspicker wird initialisiert ===');
    
    // Prüfe perpage-Einstellung (Überschreibung passiert am Anfang der Datei)
    if (!checkPerpageSettings()) {
      // Falls perpage neu gesetzt werden muss, stoppt checkPerpageSettings() 
      // und lädt die Seite neu
      return;
    }
    
    // Warte kurz auf DOM
    setTimeout(function() {
      console.log('Initialisiere Module...');
      EventManager.init();
      FilterManager.init();
    }, CONFIG.initDelay);
  }
  
  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
  
  // Formatierung nach AJAX-Updates
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form && (form.id === 'filter-form' || form.closest('.filter-form'))) {
      setTimeout(function() {
        EventManager.collectEvents();
        const eventsContainer = document.getElementById('events-container');
        if (eventsContainer) {
          EventManager.groupByDay();
          EventManager.renderColumns();
        } else {
          EventFormatter.formatAll();
        }
      }, 500);
    }
  });

})();
