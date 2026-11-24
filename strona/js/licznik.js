/* Licznik odwiedzin LumoBota. Bez ciasteczek i bez zapisywania adresu IP.
   Użycie: <script src="/js/licznik.js" data-serwer="https://adres-panelu" defer></script>
   Bez data-serwer nic nie wysyła. Szanuje ustawienie „Nie śledź”. */
(function(){
  var s = document.currentScript && document.currentScript.dataset.serwer;
  if(!s || navigator.doNotTrack === '1' || navigator.globalPrivacyControl || !/^https?:$/.test(location.protocol)) return;
  var d = JSON.stringify({p: location.pathname, r: document.referrer, l: navigator.language || ''});
  try{
    if(navigator.sendBeacon) navigator.sendBeacon(s.replace(/\/$/, '') + '/z', d);
    else fetch(s.replace(/\/$/, '') + '/z', {method: 'POST', body: d, keepalive: true, mode: 'no-cors'});
  }catch(e){}
})();
