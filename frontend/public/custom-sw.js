// self.addEventListener('push', event => {
//     const data = event.data.json()
//     console.log('New notification', data)
//     const options = {
//         body: data.body,
//     }
//     event.waitUntil(
//         self.registration.showNotification(data.title, options)
//     );
// })

function receivePushNotification(event) {
    console.log("[Service Worker] Push Received.");

    // const { image, tag, url, title, text } = event.data.json();
    const { title } = event.data.json();

    // const options = {
    //     data: url,
    //     body: text,
    //     // icon: image,
    //     // vibrate: [200, 100, 200],
    //     // url: url|| null,
    //     // image: image || null,
    //     //     badge: "https://spyna.it/icons/favicon.ico",
    //     // actions: actions || null
    // };
    event.waitUntil(self.registration.showNotification(title, event.data.json()));
}

function openPushNotification(event) {
    console.log("[Service Worker] Notification click Received.", event.notification.data);

    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data));
}

self.addEventListener("push", receivePushNotification);
self.addEventListener("notificationclick", openPushNotification);