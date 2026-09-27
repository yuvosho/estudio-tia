// Menú
const burger = document.getElementById('burger');
burger.addEventListener('click', () => document.body.classList.toggle('menu-open'));
document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

// Header: se oscurece al bajar y se esconde al scrollear hacia abajo
const header = document.getElementById('header');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  header.classList.toggle('solid', y > innerHeight * 0.6);
  header.classList.toggle('hide', y > lastY && y > innerHeight && !document.body.classList.contains('menu-open'));
  lastY = y;
}, { passive: true });

// Aparición al hacer scroll + contadores
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

function countUp(el) {
  const end = +el.dataset.count, t0 = performance.now(), dur = 1600;
  const step = t => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Antes / después en las obras
document.querySelectorAll('.project .swap').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.project');
    const antes = card.classList.toggle('show-before');
    btn.textContent = antes ? 'Ver el después' : 'Ver el antes';
  });
});

// Parallax de la franja
const bandBg = document.querySelector('.band-bg');
if (bandBg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('scroll', () => {
    const r = bandBg.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    bandBg.style.transform = `translateY(${p * -12}%)`;
  }, { passive: true });
}

// Carrusel de testimonios
const track = document.getElementById('track');
const cards = [...track.children];
const setActive = () => {
  const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
  let best = cards[0], dist = Infinity;
  cards.forEach(c => {
    const r = c.getBoundingClientRect();
    const d = Math.abs(r.left + r.width / 2 - mid);
    if (d < dist) { dist = d; best = c; }
  });
  cards.forEach(c => c.classList.toggle('active', c === best));
  return best;
};
// Un solo recálculo por cuadro: si no, el cambio de opacidad en cada evento
// de scroll deja rastros del cuadro anterior en algunos navegadores.
let pendiente = false;
track.addEventListener('scroll', () => {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(() => { pendiente = false; setActive(); });
}, { passive: true });
const go = dir => {
  const i = cards.indexOf(setActive());
  const target = cards[Math.max(0, Math.min(cards.length - 1, i + dir))];
  track.scrollTo({ left: target.offsetLeft - (track.clientWidth - target.clientWidth) / 2, behavior: 'smooth' });
};
document.getElementById('prev').onclick = () => go(-1);
document.getElementById('next').onclick = () => go(1);
// Arrancar en el testimonio del medio
requestAnimationFrame(() => {
  const mid = cards[Math.floor(cards.length / 2)];
  track.scrollLeft = mid.offsetLeft - (track.clientWidth - mid.clientWidth) / 2;
  setActive();
});

// Arrastrar con el mouse
let down = false, sx = 0, sl = 0;
track.addEventListener('mousedown', e => { down = true; sx = e.pageX; sl = track.scrollLeft; track.style.scrollSnapType = 'none'; });
addEventListener('mouseup', () => { if (!down) return; down = false; track.style.scrollSnapType = ''; });
track.addEventListener('mousemove', e => { if (down) track.scrollLeft = sl - (e.pageX - sx); });
