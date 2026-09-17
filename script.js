const nameElement = document.querySelector('#typed-name');
const caret = document.querySelector('.typing-caret');
const fullName = nameElement.textContent;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let timer;
const typingDelays = [150, 110, 180, 95, 140, 220, 105, 160];
caret.textContent = ''; // Compact cursor is drawn by CSS.
function showFullName() {
  clearTimeout(timer);
  nameElement.textContent = fullName;
  caret.hidden = false;
  caret.classList.remove('is-typing');
}
function typeName() {
  clearTimeout(timer);
  if (reducedMotion.matches) { showFullName(); return; }
  nameElement.textContent = '';
  caret.hidden = false;
  caret.classList.add('is-typing');
  const letters = Array.from(fullName);
  let index = 0;
  function typeNext() {
    nameElement.textContent = letters.slice(0, ++index).join('');
    if (index < letters.length) timer = setTimeout(typeNext, typingDelays[(index - 1) % typingDelays.length]);
    else timer = setTimeout(() => { caret.classList.remove('is-typing'); }, 350);
  }
  timer = setTimeout(typeNext, 450);
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
