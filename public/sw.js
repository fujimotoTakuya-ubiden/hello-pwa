self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch {
        data = { title: "Push", body: event.data ? event.data.text() : "Hello" };
    }

    const title = data.title || "Hello PWA";
    const options = {
        body: data.body || "It works!",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: data.url || "/",
        tag: `push-${Date.now()}`,
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        silent: false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data || "/"));
});