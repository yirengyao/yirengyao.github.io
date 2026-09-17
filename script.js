const nameElement = document.querySelector('#typed-name');
const caret = document.querySelector('.typing-caret');
const fullName = nameElement.textContent;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let timer;
function showFullName() {
  clearTimeout(timer);
  nameElement.textContent = fullName;
  caret.hidden = true;
}
function typeName() {
  if (reducedMotion.matches) { showFullName(); return; }
  nameElement.textContent = '';
  caret.hidden = false;
  let index = 0;
  function typeNext() {
    nameElement.textContent = fullName.slice(0, ++index);
    if (index < fullName.length) timer = setTimeout(typeNext, 180);
    else timer = setTimeout(() => { caret.hidden = true; }, 650);
  }
  timer = setTimeout(typeNext, 350);
}
reducedMotion.addEventListener('change', event => { if (event.matches) showFullName(); });
document.querySelector('#year').textContent = new Date().getFullYear();
typeName();

// Pause the background when off-screen or when reduced motion is requested.
const backgroundVideo = document.querySelector('.background-video');
if (backgroundVideo) {
  let videoVisible = true;
  backgroundVideo.muted = true;
  function syncVideo() {
    if (reducedMotion.matches || document.hidden || !videoVisible) backgroundVideo.pause();
    else backgroundVideo.play().catch(() => {});
  }
  new IntersectionObserver(entries => { videoVisible = entries[0].isIntersecting; syncVideo(); }).observe(backgroundVideo);
  reducedMotion.addEventListener('change', syncVideo);
  document.addEventListener('visibilitychange', syncVideo);
  backgroundVideo.addEventListener('loadeddata', syncVideo);
  syncVideo();
}
