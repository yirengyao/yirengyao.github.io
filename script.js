const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !reducedMotion.matches;
const body = document.body, motionButton = document.querySelector('.motion-button'), menuButton = document.querySelector('.menu-button'), menu = document.querySelector('#navigation');
function closeMenu(){menu.close();}
menuButton.addEventListener('click',()=>{menu.showModal();menuButton.setAttribute('aria-expanded','true');body.style.overflow='hidden';});
menu.addEventListener('close',()=>{menuButton.setAttribute('aria-expanded','false');body.style.overflow='';menuButton.focus();});
document.querySelector('.close-menu').addEventListener('click',closeMenu);
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
menu.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right)closeMenu();}});
document.querySelector('#year').textContent=new Date().getFullYear();
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const progress=document.querySelector('.progress');
function updateProgress(){const range=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${range>0?scrollY/range*100:0}%`;}
addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);
const canvas=document.querySelector('#particles'),ctx=canvas.getContext('2d'),hero=document.querySelector('.hero');
let width=0,height=0,frame=0,last=0,heroVisible=true;
const points=Array.from({length:28},()=>({x:Math.random(),y:Math.random(),r:.5+Math.random()*1.3,s:.006+Math.random()*.008}));
function resize(){width=hero.clientWidth;height=hero.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
function draw(now){frame=0;if(!motion||!heroVisible||document.hidden)return;const dt=Math.min((now-last)/1000,.04);last=now;ctx.clearRect(0,0,width,height);for(const p of points){p.y-=p.s*dt;if(p.y<0)p.y=1;ctx.beginPath();ctx.arc(p.x*width,p.y*height,p.r,0,Math.PI*2);ctx.fillStyle='rgba(240,255,248,.34)';ctx.fill();}frame=requestAnimationFrame(draw);}
function start(){if(!frame&&motion&&heroVisible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(draw);}}
new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;if(heroVisible)start();}).observe(hero);
addEventListener('resize',resize);document.addEventListener('visibilitychange',start);
let typingTimer;const sentence=document.querySelector('#sentence'),phrases=['大家好，欢迎来到我的小小世界。','把日常写成故事，把好奇留给世界。','山川湖海，总有新的风景。'];let phrase=0;
function scheduleText(){clearTimeout(typingTimer);if(!motion)return;typingTimer=setTimeout(()=>{phrase=(phrase+1)%phrases.length;let i=0;sentence.textContent='';function type(){if(!motion)return;sentence.textContent=phrases[phrase].slice(0,++i);if(i<phrases[phrase].length)typingTimer=setTimeout(type,110);else scheduleText();}type();},6500);}
function syncMotion(){body.classList.toggle('js-motion',motion);body.classList.toggle('motion-off',!motion);motionButton.setAttribute('aria-pressed',String(motion));motionButton.querySelector('span').textContent=motion?'开':'关';clearTimeout(typingTimer);if(motion){start();scheduleText();}else{cancelAnimationFrame(frame);frame=0;ctx.clearRect(0,0,width,height);sentence.textContent=phrases[phrase];}}
motionButton.addEventListener('click',()=>{motion=!motion;syncMotion();});reducedMotion.addEventListener('change',e=>{motion=!e.matches;syncMotion();});
const cursor=document.querySelector('.cursor');addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!motion)return;cursor.classList.add('active');cursor.style.transform=`translate(${e.clientX-13}px,${e.clientY-13}px)`;},{passive:true});document.addEventListener('pointerleave',()=>cursor.classList.remove('active'));
resize();syncMotion();updateProgress();
