self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'MediSade', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'MediSade', {
      body: payload.body ?? '',
      icon: '/next.svg',
      badge: '/next.svg',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/medications');
    })
  );
});
