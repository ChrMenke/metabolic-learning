// simple-service-worker.js
const CACHE_NAME = 'metabolic-learning-v1';
const urlsToCache = [
  '/metabolic-learning/',
  '/metabolic-learning/Master.html',
  '/metabolic-learning/simple-sync.js',
  '/metabolic-learning/manifest.json',
  '/metabolic-learning/icons/icon-192x192.png',
  '/metabolic-learning/icons/icon-512x512.png',
  // Aminosäuren Module
  '/metabolic-learning/modules/Aminosaeurien/aminosaeurien_teil1.html',
  '/metabolic-learning/modules/Aminosaeurien/aminosaeurien_teil2.html',
  '/metabolic-learning/modules/Aminosaeurien/glutarazid_modul_1.html',
  '/metabolic-learning/modules/Aminosaeurien/homocystinurie_lerneinheit.html',
  '/metabolic-learning/modules/Aminosaeurien/tyrosinaemie_teil1.html',
  '/metabolic-learning/modules/Aminosaeurien/tyrosinaemie_teil2.html',
  // Carnitin Module
  '/metabolic-learning/modules/Carnitin/carnitin_transport_teil1.html',
  '/metabolic-learning/modules/Carnitin/carnitin_transport_teil2.html',
  // Cholesterol/Steroid Module
  '/metabolic-learning/modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part1.html',
  '/metabolic-learning/modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part2.html',
  '/metabolic-learning/modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part2a.html',
  '/metabolic-learning/modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part2b.html',
  '/metabolic-learning/modules/Cholesterol_Steroid/cholesterol_steroid_biosynthesis_part3.html',
  // Harnstoffzyklus Module
  '/metabolic-learning/modules/Harnstoffzyklus/ucd_learning_module_part1.html',
  '/metabolic-learning/modules/Harnstoffzyklus/ucd_learning_module_part2.html',
  '/metabolic-learning/modules/Harnstoffzyklus/ucd_learning_module_part3.html',
  // Konfirmation Module
  '/metabolic-learning/modules/Konfirmation/konfirmationsdiagnostik_seite1.html',
  '/metabolic-learning/modules/Konfirmation/konfirmationsdiagnostik_seite2.html',
  '/metabolic-learning/modules/Konfirmation/konfirmationsdiagnostik_seite3.html',
  '/metabolic-learning/modules/Konfirmation/konfirmationsdiagnostik_seite4.html',
  // Mitochondrien Module
  '/metabolic-learning/modules/Mitochondrien/Mitochondriale Erkrankungen - Diagnostik & Th.html',
  '/metabolic-learning/modules/Mitochondrien/mitochondriopathien_teil1.html',
  '/metabolic-learning/modules/Mitochondrien/mitochondriopathien_teil2.html',
  '/metabolic-learning/modules/Mitochondrien/mitochondriopathien_teil3.html',
  // Neurotransmitter Module
  '/metabolic-learning/modules/Neurotransmitter/neurotransmitter_teil1.html',
  '/metabolic-learning/modules/Neurotransmitter/neurotransmitter_teil2.html',
  '/metabolic-learning/modules/Neurotransmitter/neurotransmitter_teil3.html',
  // Organoacidämien Module
  '/metabolic-learning/modules/Organoacidaemien/mma_pa_modul1.html',
  '/metabolic-learning/modules/Organoacidaemien/mma_pa_modul2.html',
  '/metabolic-learning/modules/Organoacidaemien/mma_pa_modul3.html',
  '/metabolic-learning/modules/Organoacidaemien/mma_pa_modul4.html',
  '/metabolic-learning/modules/Organoacidaemien/mma_pa_modul5.html',
  '/metabolic-learning/modules/Organoacidaemien/mma_pa_modul6.html',
  '/metabolic-learning/modules/Organoacidaemien/organoacidaemien_teil1.html',
  '/metabolic-learning/modules/Organoacidaemien/organoacidaemien_teil2.html',
  '/metabolic-learning/modules/Organoacidaemien/organoacidaemien_teil3.html',
  // Purin/Pyrimidin Module
  '/metabolic-learning/modules/PurinPyrimidin/purin_pyrimidin_lerneinheit.html',
  // Speichererkrankungen Module
  '/metabolic-learning/modules/Speichererkrankungen/fabry_lernmodul_teil1.html',
  '/metabolic-learning/modules/Speichererkrankungen/fabry_lernmodul_teil2.html',
  '/metabolic-learning/modules/Speichererkrankungen/fabry_lernmodul_teil3.html',
  '/metabolic-learning/modules/Speichererkrankungen/fabry_lernmodul_teil4.html',
  '/metabolic-learning/modules/Speichererkrankungen/lysosomal_storage_part1.html',
  '/metabolic-learning/modules/Speichererkrankungen/lysosomal_storage_part2.html',
  '/metabolic-learning/modules/Speichererkrankungen/lysosomal_storage_part3.html',
  '/metabolic-learning/modules/Speichererkrankungen/peroxisomal_disorders_part1.html',
  '/metabolic-learning/modules/Speichererkrankungen/peroxisomal_disorders_part2.html',
  '/metabolic-learning/modules/Speichererkrankungen/peroxisomal_disorders_part3.html',
  // Vitamine Module
  '/metabolic-learning/modules/Vitamine/vitamin_cofactor_defects.html'
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
