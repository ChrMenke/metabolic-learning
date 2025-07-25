const fs = require('fs');
const path = require('path');

// Kategorie-Informationen
const CATEGORY_INFO = {
  aminosaeurien: { title: "🧬 Aminosäuredefekte", icon: "🧬" },
  carnitin: { title: "🚛 Carnitin-Transport", icon: "🚛" },
  cholesterol: { title: "⚙️ Cholesterol/Steroid-Biosynthese", icon: "⚙️" },
  energie: { title: "⚡ Energie-Stoffwechsel", icon: "⚡" },
  fabry: { title: "💎 Fabry-Krankheit", icon: "💎" },
  fao: { title: "🔥 Fettsäureoxidation", icon: "🔥" },
  glutarazid: { title: "🔬 Glutarazidämie", icon: "🔬" },
  homocystin: { title: "🧪 Homocystinurie", icon: "🧪" },
  konfirmation: { title: "📋 Konfirmationsdiagnostik", icon: "📋" },
  lysosomal: { title: "📦 Lysosomale Speicherkrankheiten", icon: "📦" },
  mitochondrial: { title: "⚡ Mitochondriopathien", icon: "⚡" },
  neurotransmitter: { title: "🧠 Neurotransmitter-Defekte", icon: "🧠" },
  organoacid: { title: "⚗️ Organoazidurien", icon: "⚗️" },
  peroxisomal: { title: "🔄 Peroxisomale Störungen", icon: "🔄" },
  purin: { title: "🧬 Purin/Pyrimidin-Stoffwechsel", icon: "🧬" },
  tyrosin: { title: "🏭 Tyrosinämie", icon: "🏭" },
  ucd: { title: "♻️ Harnstoffzyklusstörungen", icon: "♻️" },
  vitamin: { title: "💊 Vitamin-Cofaktor-Defekte", icon: "💊" },
  weitere: { title: "📚 Weitere Module", icon: "📚" }
};

// HTML-Titel aus Datei extrahieren
function extractTitleFromHTML(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Versuche <title> Tag zu finden
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // Alternativ: <h1> Tag
    const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      return h1Match[1].trim();
    }
    
  } catch (error) {
    console.log(`⚠️ Konnte ${filepath} nicht lesen: ${error.message}`);
  }
  
  // Fallback: Aus Dateiname generieren
  const filename = path.basename(filepath, '.html');
  return filename
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Teil(\d+)/i, 'Teil $1');
}

// Untertitel generieren
function generateSubtitle(filename) {
  // Prüfe auf Teil-Nummern
  if (filename.includes('teil') || filename.includes('part')) {
    const match = filename.match(/teil[_-]?(\d+)|part[_-]?(\d+)/i);
    if (match) {
      return `Teil ${match[1] || match[2]}`;
    }
  } 
  
  // Standard-Untertitel basierend auf Dateiname
  if (filename.includes('grundlagen')) return 'Grundlagen';
  if (filename.includes('diagnostik')) return 'Diagnostik';
  if (filename.includes('therapie')) return 'Therapie';
  if (filename.includes('klinik')) return 'Klinisches Bild';
  if (filename.includes('management')) return 'Management';
  
  return 'Lernmodul';
}

// Hauptfunktion
async function updateModules() {
  console.log('🔍 Scanne nach HTML-Modulen...\n');
  
  const modules = {};
  const allModuleFiles = [];
  
  // Prüfe ob modules Ordner existiert
  const modulesDir = './modules';
  if (!fs.existsSync(modulesDir)) {
    console.log('⚠️ Kein modules/ Ordner gefunden. Scanne Hauptverzeichnis...');
    scanRootDirectory(modules, allModuleFiles);
  } else {
    scanModulesDirectory(modulesDir, modules, allModuleFiles);
  }
  
  // Zusammenfassung
  console.log('\n📊 Zusammenfassung:');
  console.log(`   Kategorien: ${Object.keys(modules).length}`);
  console.log(`   Module gesamt: ${allModuleFiles.length}`);
  
  // modules-config.json erstellen
  const config = {
    version: "2.0",
    lastUpdate: new Date().toISOString(),
    totalModules: allModuleFiles.length,
    modules: modules
  };
  
  fs.writeFileSync('modules-config.json', JSON.stringify(config, null, 2));
  console.log('\n✅ modules-config.json erstellt');
  
  // Service Worker aktualisieren
  updateServiceWorker(allModuleFiles);
  
  // Master.html aktualisieren - NEUE ROBUSTE VERSION
  updateMasterHTML(modules);
  
  console.log('\n🎉 Update abgeschlossen!');
}

// Scanne modules/ Verzeichnis
function scanModulesDirectory(modulesDir, modules, allModuleFiles) {
  const categories = fs.readdirSync(modulesDir)
    .filter(f => fs.statSync(path.join(modulesDir, f)).isDirectory());
  
  console.log(`📁 Gefundene Kategorien: ${categories.join(', ')}\n`);
  
  categories.forEach(category => {
    const categoryPath = path.join(modulesDir, category);
    const files = fs.readdirSync(categoryPath)
      .filter(f => f.endsWith('.html'))
      .sort();
    
    if (files.length === 0) return;
    
    // Kategorie-Info - verwende Ordnername als Key
    const categoryKey = category.toLowerCase().replace(/[^a-z0-9]/g, '');
    const info = CATEGORY_INFO[categoryKey] || {
      title: category.charAt(0).toUpperCase() + category.slice(1),
      icon: "📚"
    };
    
    console.log(`\n📂 ${info.title} (${category}/)`);
    
    modules[categoryKey] = {
      ...info,
      modules: files.map(file => {
        const filepath = path.join(categoryPath, file);
        const relativePath = `modules/${category}/${file}`;
        allModuleFiles.push('./' + relativePath);
        
        const title = extractTitleFromHTML(filepath);
        const subtitle = generateSubtitle(file);
        
        console.log(`   ✅ ${file} → "${title}" - ${subtitle}`);
        
        return {
          file: relativePath,
          title: title,
          subtitle: subtitle
        };
      })
    };
  });
}

// Fallback: Scanne Hauptverzeichnis
function scanRootDirectory(modules, allModuleFiles) {
  const files = fs.readdirSync('.')
    .filter(f => f.endsWith('.html') && f !== 'Master.html')
    .sort();
  
  console.log(`📁 ${files.length} Module im Hauptverzeichnis gefunden\n`);
  
  files.forEach(file => {
    const category = categorizeByFilename(file);
    const title = extractTitleFromHTML(file);
    const subtitle = generateSubtitle(file);
    
    if (!modules[category]) {
      modules[category] = {
        ...CATEGORY_INFO[category],
        modules: []
      };
    }
    
    modules[category].modules.push({
      file: file,
      title: title,
      subtitle: subtitle
    });
    
    allModuleFiles.push('./' + file);
    console.log(`✅ ${file} → ${category} → "${title}"`);
  });
}

// Kategorisiere basierend auf Dateiname
function categorizeByFilename(filename) {
  const lower = filename.toLowerCase();
  
  if (lower.includes('amino') || lower.includes('pku')) return 'aminosaeurien';
  if (lower.includes('carnitin')) return 'carnitin';
  if (lower.includes('cholesterol') || lower.includes('steroid')) return 'cholesterol';
  if (lower.includes('energie') || lower.includes('atp')) return 'energie';
  if (lower.includes('fabry')) return 'fabry';
  if (lower.includes('fao') || lower.includes('fett')) return 'fao';
  if (lower.includes('glutar')) return 'glutarazid';
  if (lower.includes('homocyst')) return 'homocystin';
  if (lower.includes('konfirm')) return 'konfirmation';
  if (lower.includes('lysosom')) return 'lysosomal';
  if (lower.includes('mitochond')) return 'mitochondrial';
  if (lower.includes('neurotrans')) return 'neurotransmitter';
  if (lower.includes('organo')) return 'organoacid';
  if (lower.includes('peroxisom')) return 'peroxisomal';
  if (lower.includes('purin') || lower.includes('pyrimidin')) return 'purin';
  if (lower.includes('tyrosin')) return 'tyrosin';
  if (lower.includes('ucd') || lower.includes('harnstoff')) return 'ucd';
  if (lower.includes('vitamin')) return 'vitamin';
  
  return 'weitere';
}

// Service Worker aktualisieren
function updateServiceWorker(moduleFiles) {
  console.log('\n🔧 Aktualisiere Service Worker...');
  
  const swPath = './simple-service-worker.js';
  if (!fs.existsSync(swPath)) {
    console.log('⚠️ simple-service-worker.js nicht gefunden!');
    return;
  }
  
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  const urlsToCacheRegex = /const urlsToCache = \[([\s\S]*?)\];/;
  
  const baseFiles = [
    './',
    './Master.html',
    './simple-sync.js',
    './manifest.json',
    './module-mobile.css'
  ];
  
  const allFiles = [...baseFiles, ...moduleFiles];
  
  const newUrlsToCache = `const urlsToCache = [\n${allFiles.map(f => `  '${f}'`).join(',\n')}\n];`;
  
  swContent = swContent.replace(urlsToCacheRegex, newUrlsToCache);
  
  fs.writeFileSync(swPath, swContent);
  console.log('✅ Service Worker aktualisiert');
}

// ROBUSTE Master.html Aktualisierung - NEUE VERSION
function updateMasterHTML(modules) {
  console.log('\n📄 Aktualisiere Master.html...');
  
  const masterPath = './Master.html';
  if (!fs.existsSync(masterPath)) {
    console.log('⚠️ Master.html nicht gefunden!');
    return;
  }
  
  let content = fs.readFileSync(masterPath, 'utf8');
  
  // ROBUSTEN REGEX-ANSATZ verwenden
  // Suche nach: const modules = { ... };
  const modulesRegex = /const\s+modules\s*=\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\};/gs;
  
  const modulesMatch = content.match(modulesRegex);
  
  if (!modulesMatch) {
    console.log('❌ Konnte modules Block nicht finden mit Regex');
    
    // ALTERNATIVE: Einfache Suche und manueller Parser
    const startMarker = 'const modules = {';
    const startIndex = content.indexOf(startMarker);
    
    if (startIndex === -1) {
      console.log('🆕 Kein modules Code gefunden - füge neuen ein...');
      
      // Suche nach </style> oder <script>
      let insertPoint = content.indexOf('</style>');
      if (insertPoint === -1) {
        insertPoint = content.indexOf('<script>');
        if (insertPoint === -1) {
          console.log('❌ Konnte keinen Einfügepunkt finden!');
          return;
        }
      }
      
      // Erstelle neuen modules Code
      const modulesStr = JSON.stringify(modules, null, 4);
      const newScript = insertPoint === content.indexOf('</style>') 
        ? `</style>\n\n<script>\nconst modules = ${modulesStr};\n</script>`
        : `\nconst modules = ${modulesStr};\n`;
      
      // Füge ein
      if (insertPoint === content.indexOf('</style>')) {
        content = content.replace('</style>', newScript);
      } else {
        const scriptStart = content.indexOf('<script>') + 8;
        content = content.substring(0, scriptStart) + newScript + content.substring(scriptStart);
      }
      
    } else {
      // Verwende robusteren manuellen Parser
      console.log('🔄 Verwende manuellen Parser...');
      const endIndex = findModulesEnd(content, startIndex + startMarker.length);
      
      if (endIndex === -1) {
        console.log('❌ Konnte Ende des modules Block nicht finden');
        return;
      }
      
      // Erstelle neuen Code
      const modulesStr = JSON.stringify(modules, null, 4);
      const newModulesVar = `const modules = ${modulesStr};`;
      
      // Ersetze
      content = content.substring(0, startIndex) + newModulesVar + content.substring(endIndex);
    }
    
  } else {
    console.log('✅ modules Block mit Regex gefunden');
    
    // Erstelle neuen Code
    const modulesStr = JSON.stringify(modules, null, 4);
    const newModulesVar = `const modules = ${modulesStr};`;
    
    // Ersetze mit Regex
    content = content.replace(modulesRegex, newModulesVar);
  }
  
  // Backup erstellen
  fs.writeFileSync('Master.html.backup', fs.readFileSync(masterPath));
  
  // Speichere neue Datei
  fs.writeFileSync(masterPath, content);
  console.log('✅ Master.html aktualisiert (Backup erstellt: Master.html.backup)');
}

// Hilfsfunktion: Finde Ende des modules Blocks
function findModulesEnd(content, startPos) {
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  let i = startPos;
  
  // Überspringe das erste {
  while (i < content.length && content[i] !== '{') i++;
  if (i >= content.length) return -1;
  
  for (i = i + 1; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';
    
    // String-Handling
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        if (braceCount === 0) {
          // Suche das schließende ;
          let j = i + 1;
          while (j < content.length && /\s/.test(content[j])) j++;
          if (j < content.length && content[j] === ';') {
            return j + 1;
          }
          return i + 1;
        }
        braceCount--;
      }
    }
  }
  
  return -1;
}

// Script ausführen
updateModules().catch(error => {
  console.error('❌ Fehler:', error);
  process.exit(1);
});
