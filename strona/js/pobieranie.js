// Pobieranie: Windows od razu ściąga najnowszy instalator (lumobot.eu/pobierz), inne systemy pokazują okienko.
(function () {
  'use strict';
  const dialog = document.getElementById('downloadDialog');
  if (!dialog) return;
  const title = document.getElementById('downloadTitle');
  const message = document.getElementById('downloadMessage');
  const systems = {
    windows: ['Windows', 'Nie ma teraz publicznie dostępnego instalatora Windows.']
  };
  let opener;
  document.querySelectorAll('[data-download]').forEach(button => {
    button.addEventListener('click', () => {
      if (button.dataset.download === 'windows') { window.location.href = '/pobierz'; return; }   // najnowszy instalator prosto z wydań na GitHubie
      const system = systems[button.dataset.download];
      if (!system) return;
      opener = button;
      title.textContent = 'LumoBot na ' + system[0];
      message.textContent = system[1];
      if (!dialog.open) dialog.showModal();
    });
  });
  dialog.querySelectorAll('[data-download-close]').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (opener && opener.isConnected) opener.focus({preventScroll: true});
  });
})();
