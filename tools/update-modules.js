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
  
  const modules = {function updateMasterHTML(modules) {
  console.log('\n📄 Aktualisiere Master.html...');
  
  const masterPath = './Master.html';
  if (!fs.existsSync(masterPath)) {
    console.log('⚠️ Master.html nicht gefunden!');
    return;
  }
  
  let content = fs.readFileSync(masterPath, 'utf8');
  
  // NEUER ANSATZ: Suche nach dem genauen Text
  const startMarker = 'const modules = {';
  const startIndex = content.indexOf(startMarker);
  
  if (startIndex === -1) {
    console.log('❌ Konnte "const modules = {" nicht finden!');
    console.log('Erste 500 Zeichen von Master.html:');
    console.log(content.substring(0, 500));
    return;
  }
  
  // Finde das schließende };
  let braceCount = 0;
  let endIndex = startIndex + startMarker.length;
  let inString = false;
  
  for (let i = endIndex; i < content.length; i++) {
    const char = content[i];
    
    // String-Handling
    if (char === '"' && content[i-1] !== '\\') {
      inString = !inString;
    }
    
    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') {
        if (braceCount === 0) {
          endIndex = i + 1;
          break;
        }
        braceCount--;
      }
    }
  }
  
  // Ersetze den modules Teil
  const modulesStr = JSON.stringify(modules, null, 4)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");
  
  const newModulesVar = `const modules = ${modulesStr};`;
  
  content = content.substring(0, startIndex) + newModulesVar + content.substring(endIndex);
  
  fs.writeFileSync(masterPath, content);
  console.log('✅ Master.html aktualisiert');
};
  const allModuleFiles = [];
  
  // Prüfe ob modules Ordner existiert
  const modulesDir = './modules';
  if (!fs.existsSync(modulesDir)) {
    console.log('⚠️ Kein modules/ Ordner gefunden. Scanne Hauptverzeichnis...');
    // Fallback: Scanne Hauptverzeichnis
    scanRootDirectory(modules, allModuleFiles);
  } else {
    // Scanne modules/ Ordner
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
  
  // Master.html aktualisieren
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
      .sort(); // Alphabetisch sortieren
    
    if (files.length === 0) return;
    
    // Kategorie-Info (mit Fallback für neue Kategorien)
    const categoryKey = category.toLowerCase();
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
  
  // Versuche Module zu kategorisieren
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
  
  // urlsToCache Array finden und ersetzen
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

// Master.html aktualisieren
function updateMasterHTML(modules) {
  console.log('\n📄 Aktualisiere Master.html...');
  
  const masterPath = './Master.html';
  if (!fs.existsSync(masterPath)) {
    console.log('⚠️ Master.html nicht gefunden!');
    return;
  }
  
  let content = fs.readFileSync(masterPath, 'utf8');
  
  // modules Variable finden und ersetzen
  const modulesRegex = /const modules = {[\s\S]*?};/;
  
  // Formatiere das modules Objekt schön
  const modulesStr = JSON.stringify(modules, null, 4)
    .replace(/"([^"]+)":/g, '$1:')  // Entferne Quotes von Keys
    .replace(/"/g, '"');  // Ersetze Quotes mit schönen Quotes
  
  const newModulesVar = `const modules = ${modulesStr};`;
  
  content = content.replace(modulesRegex, newModulesVar);
  
  fs.writeFileSync(masterPath, content);
  console.log('✅ Master.html aktualisiert');
}

// Script ausführen
updateModules().catch(error => {
  console.error('❌ Fehler:', error);
  process.exit(1);
});
