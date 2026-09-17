(() => {
  const hero = document.querySelector('.hero');
  const cat = document.querySelector('.cat-character');
  const bee = document.querySelector('.cat-bee');
  const pupils = [...document.querySelectorAll('.pupil')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const trail = document.querySelector('.bee-trail');
  const dots = Array.from({length: 12}, () => trail.appendChild(document.createElement('i')));
  let width, height, size, beeSize, x, y, targetX, targetY;
  let active = false, visible = true, frame = 0, last = 0, time = 0;
  let crouch = 0, clickUntil = 0, nextBlink = 3, blinkUntil = 0, trailTime = 0;
  let history = [];
  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width; height = rect.height; size = cat.offsetWidth; beeSize = bee.offsetWidth;
    x = targetX = width * .64; y = targetY = height * .3; history = [];
    render(0);
  }
  function render(dt) {
    const still = preference.matches;
    if (!active && !still) {
      targetX = width * (.5 + .24 * Math.sin(time * .57));
      targetY = height * (.3 + .14 * Math.cos(time * .83));
    }
    const follow = still ? 1 : 1 - Math.exp(-dt * 5);
    const dx = targetX - x, dy = targetY - y;
    x += dx * follow; y += dy * follow;
    // React to the pointer itself, before the trailing bee catches up.
    const nearFace = active && Math.abs(targetX - width / 2) < size * .58
      && targetY > (height - 2) - size * .40;
    const duck = !still && (time < clickUntil || nearFace || (active && targetY > (height - 2)));
    const response = duck ? 30 : 18;
    crouch += ((duck ? size * .1 : 0) - crouch) * (still ? 1 : 1 - Math.exp(-dt * response));
    const shift = still ? 0 : -(x - width / 2) * .025;
    cat.style.translate = `${shift}px ${crouch}px`;
    if (!still && time > nextBlink) { blinkUntil = time + .15; nextBlink = time + 3 + Math.random() * 3; }
    cat.classList.toggle('is-closed', duck || time < blinkUntil);
    for (let i = 0; i < pupils.length; i++) {
      const eyeX = width / 2 + (i ? 98.5 : -114.5) * size / 685 + shift;
      const eyeY = (height - 2) - 65 * size / 685 + crouch;
      const angle = Math.atan2(y - eyeY, x - eyeX);
      const travel = still ? 0 : size * .013;
      pupils[i].style.transform = `translate(${Math.cos(angle)*travel}px,${Math.sin(angle)*travel}px) rotate(${angle+Math.PI/2}rad)`;
    }
    const angle = still ? 0 : Math.atan2(dy, dx) + Math.PI / 2;
    const flutter = still ? 1 : .87 + .13 * Math.sin(time * 38);
    bee.style.transform = `translate(${x-beeSize/2}px,${y-beeSize/2}px) rotate(${angle}rad) scaleX(${flutter})`;
    trailTime += dt;
    if (trailTime > .025) { history.unshift({x,y}); history.length = Math.min(history.length, dots.length * 3); trailTime = 0; }
    dots.forEach((dot,i) => {
      const p = history[(i+1)*2];
      dot.style.opacity = p && !still ? String((1-i/dots.length)*.45) : '0';
      if (p) dot.style.transform = `translate(${p.x-2}px,${p.y-2}px) scale(${1-i/dots.length*.6})`;
    });
  }
  function loop(now) {
    frame = 0;
    if (!visible || document.hidden || preference.matches) return;
    const dt = Math.min((now-last)/1000,.05); last = now; time += dt;
    render(dt); frame = requestAnimationFrame(loop);
  }
  function start() {
    if (!frame && visible && !document.hidden && !preference.matches) { last = performance.now(); frame = requestAnimationFrame(loop); }
  }
  hero.addEventListener('pointermove', event => {
    if (preference.matches) return;
    const r = hero.getBoundingClientRect();
    targetX = event.clientX-r.left; targetY = event.clientY-r.top; active = true;
  }, {passive:true});
  hero.addEventListener('pointerleave',()=>{active=false;});
  hero.addEventListener('pointerdown', event => {
    if (preference.matches) return;
    const r = hero.getBoundingClientRect(); targetX = event.clientX-r.left; targetY = event.clientY-r.top;
    clickUntil = time + .8;
    // Apply the first movement immediately on press, including touch.
    render(1 / 60);
  }, {passive:true});
  hero.addEventListener('pointerup',event=>{if(event.pointerType==='touch')active=false;});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();}).observe(hero);
  document.addEventListener('visibilitychange',start);
  preference.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;if(preference.matches){crouch=0;blinkUntil=0;render(0);}else start();});
  addEventListener('resize',resize);
  resize(); start();
})();
