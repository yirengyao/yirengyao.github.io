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
// Keep a matching poster visible until the browser presents a video frame.
const root = document.documentElement;
const backgroundVideo = document.querySelector('.background-video');
let introShown = false;
let fallbackTimer;
function revealIntro() {
  if (introShown) return;
  introShown = true;
  clearTimeout(fallbackTimer);
  root.classList.add('intro-ready');
  typeName();
}
fallbackTimer = setTimeout(revealIntro, 4000);
if (backgroundVideo) {
  let videoVisible = true;
  let framePending = false;
  backgroundVideo.muted = true;
  function presentVideo() {
    if (backgroundVideo.error || reducedMotion.matches) return;
    root.classList.add('video-ready');
    revealIntro();
  }
  function confirmFrame() {
    if (framePending || backgroundVideo.readyState < 2) return;
    framePending = true;
    if ('requestVideoFrameCallback' in backgroundVideo) {
      backgroundVideo.requestVideoFrameCallback(() => { framePending = false; presentVideo(); });
    } else {
      requestAnimationFrame(() => { framePending = false; presentVideo(); });
    }
  }
  function syncVideo() {
    if (reducedMotion.matches || document.hidden || !videoVisible) {
      backgroundVideo.pause();
      if (reducedMotion.matches) { root.classList.remove('video-ready'); revealIntro(); }
    } else {
      backgroundVideo.play().then(confirmFrame).catch(revealIntro);
    }
  }
  new IntersectionObserver(entries => { videoVisible = entries[0].isIntersecting; syncVideo(); }).observe(backgroundVideo);
  reducedMotion.addEventListener('change', syncVideo);
  document.addEventListener('visibilitychange', syncVideo);
  backgroundVideo.addEventListener('playing', confirmFrame);
  backgroundVideo.addEventListener('loadeddata', syncVideo);
  function videoFailed() { root.classList.remove('video-ready'); revealIntro(); }
  backgroundVideo.addEventListener('error', videoFailed);
  backgroundVideo.querySelector('source')?.addEventListener('error', videoFailed);
  syncVideo();
} else revealIntro();
