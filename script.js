/* ── Theme toggle ─────────────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const htmlEl   = document.documentElement;
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const sunIcon  = themeToggle.querySelector('.sun-icon');
    function applyTheme(t) {
        htmlEl.setAttribute('data-theme', t);
        moonIcon.style.display = t === 'dark' ? 'none'  : 'block';
        sunIcon.style.display  = t === 'dark' ? 'block' : 'none';
    }
    applyTheme(localStorage.getItem('theme') || 'light');
    themeToggle.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', next);
        applyTheme(next);
    });
}

/* ── Mix & Match cube tiles ───────────────────────────────── */
/*
   Two faces are physically placed on the cube at all times:
     .tile-face-front  → translateZ(+half)               — what you see
     .tile-face-bottom → translateY(+half) rotateX(-90°) — tucked underneath

   On click, the whole drum rotates -90° on X. Front folds away upward,
   bottom rises into view. After the transition, JS swaps front content
   to match what was the bottom, resets drum to 0° invisibly, then
   loads the next face into the bottom slot ready for the next click.

   --half (px) is set as an inline CSS var per tile from JS,
   so face translations are always exact regardless of tile size.
*/

const FLIP_DURATION = 750; // ms — matches CSS transition 0.75s

const faceContent = [
    // tile 0 — creature tops
    [
        { html: `<span class="tile-letter">BRI</span>`, isText: true },
        { html: `<div class="ph" style="background:#e8d5b7"><span>C1 top</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#c8deb8"><span>C2 top</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#b8cce0"><span>C3 top</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#e0c8d8"><span>C4 top</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#dde0b8"><span>C5 top</span></div>`, isText: false },
    ],
    // tile 1 — creature mids
    [
        { html: `<span class="tile-letter">COL</span>`, isText: true },
        { html: `<div class="ph" style="background:#e8d5b7"><span>C1 mid</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#c8deb8"><span>C2 mid</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#b8cce0"><span>C3 mid</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#e0c8d8"><span>C4 mid</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#dde0b8"><span>C5 mid</span></div>`, isText: false },
    ],
    // tile 2 — creature bottoms
    [
        { html: `<span class="tile-letter">AGE</span>`, isText: true },
        { html: `<div class="ph" style="background:#e8d5b7"><span>C1 btm</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#c8deb8"><span>C2 btm</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#b8cce0"><span>C3 btm</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#e0c8d8"><span>C4 btm</span></div>`, isText: false },
        { html: `<div class="ph" style="background:#dde0b8"><span>C5 btm</span></div>`, isText: false },
    ],
];

function setFace(faceEl, content) {
    faceEl.innerHTML = content.html;
    faceEl.classList.toggle('is-text', content.isText);
}

const tiles    = Array.from(document.querySelectorAll('.tile'));
const state    = tiles.map(() => 0);
const spinning = tiles.map(() => false);

tiles.forEach((tile, i) => {
    const perspective = tile.querySelector('.tile-perspective');
    const drum   = tile.querySelector('.tile-drum');
    const front  = tile.querySelector('.tile-face-front');
    const bottom = tile.querySelector('.tile-face-bottom');

    // Set --half on the perspective container so face translations are exact
    function setHalf() {
        const half = perspective.offsetWidth / 2;
        perspective.style.setProperty('--half', half + 'px');
    }
    setHalf();
    window.addEventListener('resize', setHalf);

    // Seed initial state: front = face 0, bottom = face 1
    setFace(front,  faceContent[i][0]);
    setFace(bottom, faceContent[i][1]);

    tile.addEventListener('click', () => {
        if (spinning[i]) return;
        spinning[i] = true;

        const nextIndex  = (state[i] + 1) % faceContent[i].length;
        const afterNext  = (nextIndex + 1) % faceContent[i].length;

        // Rotate drum -90°: front folds up and away, bottom rises into view
        drum.style.transition = `transform ${FLIP_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        drum.style.transform  = 'rotateX(-90deg)';

        setTimeout(() => {
            // Snap front to show what was bottom, reset drum silently
            setFace(front, faceContent[i][nextIndex]);
            drum.style.transition = 'none';
            drum.style.transform  = 'rotateX(0deg)';
            void drum.offsetWidth; // force reflow before re-enabling transition

            // Pre-load the face after that into bottom, ready for next click
            setFace(bottom, faceContent[i][afterNext]);

            state[i]    = nextIndex;
            spinning[i] = false;
        }, FLIP_DURATION);
    });
});

/* ── Wiggle hint ──────────────────────────────────────────── */
function scheduleWiggle() {
    const available = tiles.filter((_, i) => !spinning[i]);
    if (available.length) {
        const pick = available[Math.floor(Math.random() * available.length)];
        pick.classList.remove('is-wiggling');
        void pick.offsetWidth;
        pick.classList.add('is-wiggling');
        pick.addEventListener('animationend', () => pick.classList.remove('is-wiggling'), { once: true });
    }
    setTimeout(scheduleWiggle, 8000 + Math.random() * 5000);
}
setTimeout(scheduleWiggle, 4000);
