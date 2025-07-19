// simple-service-worker.js
const CACHE_NAME = 'metabolic-learning-v1';
const urlsToCache = [
  '/metabolic-learning/',
  '/metabolic-learning/Master.html',
  '/metabolic-learning/simple-sync.js',
  '/metabolic-learning/manifest.json',
  '/metabolic-learning/icons/icon-192x192.png',
  '/metabolic-learning/icons/icon-512x512.png', // <--- hinzugefügt
  // Module (alphabetisch sortiert)
  '/metabolic-learning/aminosaeurien_teil1.html',
  '/metabolic-learning/aminosaeurien_teil2.html',
  '/metabolic-learning/carnitin_transport_teil1.html',
  '/metabolic-learning/carnitin_transport_teil2.html',
  '/metabolic-learning/cholesterol_steroid_biosynthesis_part1.html',
  '/metabolic-learning/cholesterol_steroid_biosynthesis_part2.html',
  '/metabolic-learning/cholesterol_steroid_biosynthesis_part2a.html',
  '/metabolic-learning/cholesterol_steroid_biosynthesis_part2b.html',
  '/metabolic-learning/cholesterol_steroid_biosynthesis_part3.html',
  '/metabolic-learning/fabry_lernmodul_teil1.html',
  '/metabolic-learning/fabry_lernmodul_teil2.html',
  '/metabolic-learning/fabry_lernmodul_teil3.html',
  '/metabolic-learning/fabry_lernmodul_teil4.html',
  '/metabolic-learning/glutarazid_modul_1.html',
  '/metabolic-learning/homocystinurie_lerneinheit.html',
  '/metabolic-learning/konfirmationsdiagnostik_seite1.html',
  '/metabolic-learning/konfirmationsdiagnostik_seite2.html',
  '/metabolic-learning/konfirmationsdiagnostik_seite3.html',
  '/metabolic-learning/konfirmationsdiagnostik_seite4.html',
  '/metabolic-learning/lysosomal_storage_part1.html',
  '/metabolic-learning/lysosomal_storage_part2.html',
  '/metabolic-learning/lysosomal_storage_part3.html',
  '/metabolic-learning/mitochondriopathien_teil1.html',
  '/metabolic-learning/mitochondriopathien_teil2.html',
  '/metabolic-learning/mitochondriopathien_teil3.html',
  '/metabolic-learning/neurotransmitter_teil1.html',
  '/metabolic-learning/neurotransmitter_teil2.html',
  '/metabolic-learning/neurotransmitter_teil3.html',
  '/metabolic-learning/organoacidaemien_teil1.html',
  '/metabolic-learning/organoacidaemien_teil2.html',
  '/metabolic-learning/organoacidaemien_teil3.html',
  '/metabolic-learning/peroxisomal_disorders_part1.html',
  '/metabolic-learning/peroxisomal_disorders_part2.html',
  '/metabolic-learning/peroxisomal_disorders_part3.html',
  '/metabolic-learning/purin_pyrimidin_lerneinheit.html',
  '/metabolic-learning/tyrosinaemie_teil1.html',
  '/metabolic-learning/tyrosinaemie_teil2.html',
  '/metabolic-learning/ucd_learning_module.html',
  '/metabolic-learning/ucd_learning_module_part1.html',
  '/metabolic-learning/ucd_learning_module_part2.html',
  '/metabolic-learning/ucd_learning_module_part3.html',
  '/metabolic-learning/vitamin_cofactor_defects.html'
]; // <--- fehlte in deiner Version

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
