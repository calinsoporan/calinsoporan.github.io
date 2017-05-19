statusText.addEventListener('click', function() {
  statusText.textContent = 'Find devices...';
  Bodytrak.connect()
});
