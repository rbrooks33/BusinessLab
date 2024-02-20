﻿// This is the service worker with the Cache-first network

const CACHE = "cachev4";
const precacheFiles = [
    /* Add an array of files to precache for your app */
];

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
self.addEventListener("install", function (event) {
    console.log("[PWA Builder] Install Event processing");

    //console.log("[PWA Builder] Skip waiting on install");
    //self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE).then(function (cache) {
            console.log("[PWA Builder] Caching pages during install");
            return cache.addAll(precacheFiles);
        })
    );
});

// Allow sw to control of current page
self.addEventListener("activate", function (event) {
    console.log("[PWA Builder] Claiming clients for current page");
    event.waitUntil(self.clients.claim());

    console.log('Activating new service worker...');

    const cacheWhitelist = [CACHE];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fromCache(event.request).then(
            function (response) {
                // The response was found in the cache so we responde with it and update the entry

                // This is where we call the server to get the newest version of the
                // file to use the next time we show view
                event.waitUntil(
                    fetch(event.request).then(function (response) {
                        return updateCache(event.request, response);
                    })
                );

                return response;
            },
            function () {
                // The response was not found in the cache so we look for it on the server
                return fetch(event.request)
                    .then(function (response) {
                        // If request was success, add or update it in the cache
                        event.waitUntil(updateCache(event.request, response.clone()));

                        return response;
                    })
                    .catch(function (error) {
                        console.log("[PWA Builder] Network request failed and no cache." + error);
                    });
            }
        )
    );
});

// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt;

self.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
    // Optionally, send analytics event that PWA install promo was shown.
    console.log(`'beforeinstallprompt' event was fired.`);
});

self.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    hideInstallPromotion();
    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;
    // Optionally, send analytics event to indicate successful install
    console.log('PWA was installed');
});

function fromCache(request) {
    // Check to see if you have it in the cache
    // Return response
    // If not in the cache, then return
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (!matching || matching.status === 404) {
                return Promise.reject("no-match");
            }

            return matching;
        });
    });
}

function updateCache(request, response) {
    return caches.open(CACHE).then(function (cache) {
        return cache.put(request, response);
    });
}

//self.addEventListener('push', function (event) {

//    var message = JSON.parse(event.data.text());

//    var title = message.Title; // 'Yay a message.';
//    var body = message.Body; // event.data.text(); //'We have received a push message.';
//    var icon = message.Icon; // '/images/smiley.svg';
//    var tag = message.Tag; // 'simple-push-example-tag';
//    var url = message.Url; //'http://www.msn.com';
//    var id = message.Id;

//    event.waitUntil(
//        self.registration.showNotification(title, {
//            body: body,
//            icon: icon,
//            tag: tag,
//            data: { url: url, id: id }
//        })
//    );
//});

//self.addEventListener('notificationclick', function (event) {
//    console.log('[Service Worker] Notification click Received.');

//    event.notification.close();

//    event.waitUntil(
//        clients.openWindow(event.notification.data.url)
//    );
//});