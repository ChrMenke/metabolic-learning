// simple-sync.js
class SimpleStorage {
  constructor() {
    this.storageKey = 'metabolicLearningData';
    this.backupFolder = 'MetabolicLearning_Backups';
  }

  collectAllData() {
    const data = {
      version: '1.0',
      deviceName: this.getDeviceName(),
      lastModified: new Date().toISOString(),
      notes: {},
      progress: {},
      settings: {
        theme: localStorage.getItem('theme') || 'light'
      }
    };

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key.startsWith('notes_')) {
        const moduleId = key.replace('notes_', '');
        data.notes[moduleId] = localStorage.getItem(key);
      } else if (key.startsWith('progress_')) {
        const moduleId = key.replace('progress_', '');
        data.progress[moduleId] = localStorage.getItem(key);
      }
    }

    return data;
  }

  getDeviceName() {
    let deviceName = localStorage.getItem('deviceName');
    if (!deviceName) {
      const userAgent = navigator.userAgent;
      if (/android/i.test(userAgent)) {
        deviceName = 'Android-Gerät';
      } else if (/iPad|iPhone|iPod/.test(userAgent)) {
        deviceName = 'iOS-Gerät';
      } else if (/Windows/.test(userAgent)) {
        deviceName = 'Windows-PC';
      } else {
        deviceName = 'Unbekanntes-Gerät';
      }
      deviceName += '_' + Date.now().toString(36);
      localStorage.setItem('deviceName', deviceName);
    }
    return deviceName;
  }

  exportToFile() {
    const data = this.collectAllData();
    const filename = `MetabolicLearning_${this.getDeviceName()}_${new Date().toISOString().split('T')[0]}.json`;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showNotification(`Backup erstellt: ${filename}`, 'success');
    localStorage.setItem('lastBackupDate', Date.now());
  }

  importFromFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (!data.version || !data.notes || !data.progress) {
          throw new Error('Ungültiges Backup-Format');
        }
        
        const shouldMerge = confirm(
          `Möchtest du die Daten von "${data.deviceName}" importieren?\n\n` +
          `OK = Zusammenführen (empfohlen)\n` +
          `Abbrechen = Überschreiben`
        );
        
        if (shouldMerge) {
          this.mergeData(data);
        } else {
          this.replaceData(data);
        }
        
        showNotification('Daten erfolgreich importiert!', 'success');
        setTimeout(() => location.reload(), 1000);
        
      } catch (error) {
        showNotification('Import fehlgeschlagen: ' + error.message, 'error');
      }
    };
    
    reader.readAsText(file);
  }

  mergeData(importedData) {
    Object.entries(importedData.notes).forEach(([moduleId, content]) => {
      const existingNote = localStorage.getItem(`notes_${moduleId}`);
      if (!existingNote || content.length > existingNote.length) {
        localStorage.setItem(`notes_${moduleId}`, content);
      }
    });
    
    Object.entries(importedData.progress).forEach(([moduleId, status]) => {
      const existingProgress = localStorage.getItem(`progress_${moduleId}`);
      if (status === 'completed' || (status === 'in-progress' && !existingProgress)) {
        localStorage.setItem(`progress_${moduleId}`, status);
      }
    });
    
    if (importedData.settings?.theme && !localStorage.getItem('theme')) {
      localStorage.setItem('theme', importedData.settings.theme);
    }
  }

  replaceData(importedData) {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('notes_') || key.startsWith('progress_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    Object.entries(importedData.notes).forEach(([moduleId, content]) => {
      localStorage.setItem(`notes_${moduleId}`, content);
    });
    
    Object.entries(importedData.progress).forEach(([moduleId, status]) => {
      localStorage.setItem(`progress_${moduleId}`, status);
    });
    
    if (importedData.settings?.theme) {
      localStorage.setItem('theme', importedData.settings.theme);
    }
  }
}

// Backup Reminder
class BackupReminder {
  constructor() {
    this.checkInterval = 7 * 24 * 60 * 60 * 1000; // 7 Tage
    this.lastBackupKey = 'lastBackupDate';
  }

  init() {
    this.checkBackupStatus();
  }

  checkBackupStatus() {
    const lastBackup = localStorage.getItem(this.lastBackupKey);
    const now = Date.now();
    
    if (!lastBackup || (now - parseInt(lastBackup)) > this.checkInterval) {
      this.showBackupReminder();
    }
  }

  showBackupReminder() {
    const reminder = document.createElement('div');
    reminder.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
      color: #2d3436;
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 1000;
      max-width: 300px;
    `;
    
    reminder.innerHTML = `
      <h4 style="margin: 0 0 10px 0;">💾 Backup-Erinnerung</h4>
      <p style="margin: 0 0 15px 0; font-size: 0.9rem;">
        Zeit für ein Backup deiner Lernfortschritte!
      </p>
      <div style="display: flex; gap: 10px;">
        <button onclick="window.simpleStorage.exportToFile(); this.parentElement.parentElement.remove();" 
                style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: #2d3436; color: white; cursor: pointer;">
          Jetzt sichern
        </button>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="padding: 10px 15px; border: none; border-radius: 8px; background: #dfe6e9; cursor: pointer;">
          Später
        </button>
      </div>
    `;
    
    document.body.appendChild(reminder);
  }
}

// Initialisierung
window.simpleStorage = new SimpleStorage();
window.backupReminder = new BackupReminder();

document.addEventListener('DOMContentLoaded', () => {
  window.backupReminder.init();
  
  const exportSection = document.querySelector('.export-section');
  if (exportSection) {
    exportSection.innerHTML = `
      <h3>📄 Daten-Verwaltung</h3>
      <p style="margin-bottom: 1rem; color: var(--text-secondary);">
        Sichere deine Lernfortschritte in deinem Cloud-Ordner
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <button class="export-btn" onclick="window.simpleStorage.exportToFile()">
          💾 Backup erstellen
        </button>
        <button class="export-btn" style="background: linear-gradient(135deg, #74b9ff, #0984e3);" 
                onclick="document.getElementById('importFile').click()">
          📥 Daten importieren
        </button>
        <input type="file" id="importFile" accept=".json" style="display: none;" 
               onchange="if(this.files[0]) window.simpleStorage.importFromFile(this.files[0])">
      </div>
      <div style="margin-top: 2rem; padding: 1rem; background: var(--bg-light); border-radius: 12px;">
        <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">
          <strong>Gerät:</strong> ${window.simpleStorage.getDeviceName()}<br>
          <strong>Letztes Backup:</strong> ${localStorage.getItem('lastBackupDate') ? 
            new Date(parseInt(localStorage.getItem('lastBackupDate'))).toLocaleString() : 
            'Noch kein Backup'}
        </p>
      </div>
    `;
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    window.simpleStorage.exportToFile();
  }
});