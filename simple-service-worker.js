// simple-service-worker.js
const CACHE_NAME = 'metabolic-learning-v1';
const urlsToCache = [
  './',
  './Master.html',
  './simple-sync.js',
  './manifest.json',
  // Module (alphabetisch sortiert)
  './aminosaeurien_teil1.html',
  './aminosaeurien_teil2.html',
  './carnitin_transport_teil1.html',
  './carnitin_transport_teil2.html',
  './cholesterol_steroid_biosynthesis_part1.html',
  './cholesterol_steroid_biosynthesis_part2.html',
  './cholesterol_steroid_biosynthesis_part2a.html',
  './cholesterol_steroid_biosynthesis_part2b.html',
  './cholesterol_steroid_biosynthesis_part3.html',
  './fabry_lernmodul_teil1.html',
  './fabry_lernmodul_teil2.html',
  './fabry_lernmodul_teil3.html',
  './fabry_lernmodul_teil4.html',
  './glutarazid_modul_1.html',
  './homocystinurie_lerneinheit.html',
  './konfirmationsdiagnostik_seite1.html',
  './konfirmationsdiagnostik_seite2.html',
  './konfirmationsdiagnostik_seite3.html',
  './konfirmationsdiagnostik_seite4.html',
  './lysosomal_storage_part1.html',
  './lysosomal_storage_part2.html',
  './lysosomal_storage_part3.html',
  './mitochondriopathien_teil1.html',
  './mitochondriopathien_teil2.html',
  './mitochondriopathien_teil3.html',
  './neurotransmitter_teil1.html',
  './neurotransmitter_teil2.html',
  './neurotransmitter_teil3.html',
  './organoacidaemien_teil1.html',
  './organoacidaemien_teil2.html',
  './organoacidaemien_teil3.html',
  './peroxisomal_disorders_part1.html',
  './peroxisomal_disorders_part2.html',
  './peroxisomal_disorders_part3.html',
  './purin_pyrimidin_lerneinheit.html',
  './tyrosinaemie_teil1.html',
  './tyrosinaemie_teil2.html',
  './ucd_learning_module.html',
  './ucd_learning_module_part1.html',
  './ucd_learning_module_part2.html',
  './ucd_learning_module_part3.html',
  './vitamin_cofactor_defects.html'
];

// Installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache geöffnet');
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.error('Fehler beim Cachen von:', url, err);
            });
          })
        );
      })
  );
});

// Aktivierung
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});