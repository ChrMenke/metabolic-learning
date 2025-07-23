// simple-service-worker.js
const CACHE_NAME = 'metabolic-learning-v1';
const urlsToCache = [
  './',
  './Master.html',
  './simple-sync.js',
  './manifest.json',
  './module-mobile.css',
  './modules/Aminosaeuren/aminosaeurien_teil1.html',
  './modules/Aminosaeuren/aminosaeurien_teil2.html',
  './modules/Aminosaeuren/glutarazid_modul_1.html',
  './modules/Aminosaeuren/homocystinurie_lerneinheit.html',
  './modules/Aminosaeuren/tyrosinaemie_teil1.html',
  './modules/Aminosaeuren/tyrosinaemie_teil2.html',
  './modules/Carnitin/carnitin_transport_teil1.html',
  './modules/Carnitin/carnitin_transport_teil2.html',
  './modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part1.html',
  './modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part2.html',
  './modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part2a.html',
  './modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part2b.html',
  './modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part3.html',
  './modules/Energie/fao_lerneinheit_teil1.html',
  './modules/Energie/fao_lerneinheit_teil2.html',
  './modules/Energie/fao_lerneinheit_teil3.html',
  './modules/Harnstoffzyklus/ucd_learning_module_part1.html',
  './modules/Harnstoffzyklus/ucd_learning_module_part2.html',
  './modules/Harnstoffzyklus/ucd_learning_module_part3.html',
  './modules/Konfirmation/konfirmationsdiagnostik_seite1.html',
  './modules/Konfirmation/konfirmationsdiagnostik_seite2.html',
  './modules/Konfirmation/konfirmationsdiagnostik_seite3.html',
  './modules/Konfirmation/konfirmationsdiagnostik_seite4.html',
  './modules/Mitochondrien/Mitochondriale Erkrankungen - Diagnostik & Therapie.html',
  './modules/Mitochondrien/mitochondriopathien_teil1.html',
  './modules/Mitochondrien/mitochondriopathien_teil2.html',
  './modules/Mitochondrien/mitochondriopathien_teil3.html',
  './modules/Neurotransmitter/neurotransmitter_teil1.html',
  './modules/Neurotransmitter/neurotransmitter_teil2.html',
  './modules/Neurotransmitter/neurotransmitter_teil3.html',
  './modules/Organoacidaemien/mma_pa_modul1.html',
  './modules/Organoacidaemien/mma_pa_modul2.html',
  './modules/Organoacidaemien/mma_pa_modul3.html',
  './modules/Organoacidaemien/mma_pa_modul4.html',
  './modules/Organoacidaemien/mma_pa_modul5.html',
  './modules/Organoacidaemien/mma_pa_modul6.html',
  './modules/Organoacidaemien/organoacidaemien_teil1.html',
  './modules/Organoacidaemien/organoacidaemien_teil2.html',
  './modules/Organoacidaemien/organoacidaemien_teil3.html',
  './modules/PurinPyrimidin/purin_pyrimidin_lerneinheit.html',
  './modules/Speichererkrankungen/fabry_lernmodul_teil1.html',
  './modules/Speichererkrankungen/fabry_lernmodul_teil2.html',
  './modules/Speichererkrankungen/fabry_lernmodul_teil3.html',
  './modules/Speichererkrankungen/fabry_lernmodul_teil4.html',
  './modules/Speichererkrankungen/lysosomal_storage_part1.html',
  './modules/Speichererkrankungen/lysosomal_storage_part2.html',
  './modules/Speichererkrankungen/lysosomal_storage_part3.html',
  './modules/Speichererkrankungen/peroxisomal_disorders_part1.html',
  './modules/Speichererkrankungen/peroxisomal_disorders_part2.html',
  './modules/Speichererkrankungen/peroxisomal_disorders_part3.html',
  './modules/Vitamine/vitamin_cofactor_defects.html'
];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return Promise.all(
          urlsToCache.map(url =>
            cache.add(url).catch(err =>
              console.error('Fehler beim Cachen von:', url, err)
            )
          )
        );
      })
  );
});

// Aktivierung
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
