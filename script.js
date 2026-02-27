/* ── Theme toggle ────────────────────────────────────────── */
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const htmlEl   = document.documentElement;
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const sunIcon  = themeToggle.querySelector('.sun-icon');

    function applyTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        moonIcon.style.display = theme === 'dark' ? 'none'  : 'block';
        sunIcon.style.display  = theme === 'dark' ? 'block' : 'none';
    }

    applyTheme(localStorage.getItem('theme') || 'light');

    themeToggle.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', next);
        applyTheme(next);
    });
}

/* ── Mix & Match tiles (index page only) ─────────────────── */
const tiles = Array.from(document.querySelectorAll('.tile'));
if (tiles.length) {

    // Track which face index is currently showing per tile
    const state = tiles.map(() => 0);

    function advanceTile(tileEl, tileIndex) {
        const faces  = Array.from(tileEl.querySelectorAll('.tile-face'));
        const curr   = state[tileIndex];
        const next   = (curr + 1) % faces.length;

        const currFace = faces[curr];
        const nextFace = faces[next];

        // Make sure next face starts below (in case it's been positioned before)
        nextFace.classList.remove('is-active', 'is-entering', 'is-exiting');
        nextFace.style.transform = 'translateY(100%)';

        // Force reflow so the browser registers the reset before animating
        void nextFace.offsetWidth;

        // Animate current face out (up)
        currFace.classList.remove('is-active');
        currFace.classList.add('is-exiting');

        // Animate next face in (from below)
        nextFace.style.transform = ''; // let CSS take over
        nextFace.classList.add('is-active', 'is-entering');

        // Cleanup after animation completes
        const cleanup = (e) => {
            if (e.target !== currFace) return;
            currFace.classList.remove('is-exiting');
            currFace.style.transform = 'translateY(100%)';
        };
        currFace.addEventListener('animationend', cleanup, { once: true });

        nextFace.addEventListener('animationend', () => {
            nextFace.classList.remove('is-entering');
        }, { once: true });

        state[tileIndex] = next;
    }

    // Click handler per tile
    tiles.forEach((tile, i) => {
        tile.addEventListener('click', () => {
            // Remove any ongoing wiggle so click feels instant
            tile.classList.remove('is-wiggling');
            void tile.offsetWidth;
            advanceTile(tile, i);
        });
    });

    // Wiggle hint: every ~10s, nudge a random tile
    // Stagger the first wiggle per tile so they don't all fire together
    function scheduleWiggle() {
        // Pick a random tile that isn't mid-animation
        const pick = Math.floor(Math.random() * tiles.length);
        const tile = tiles[pick];

        tile.classList.remove('is-wiggling');
        void tile.offsetWidth; // reflow to restart
        tile.classList.add('is-wiggling');
        tile.addEventListener('animationend', () => {
            tile.classList.remove('is-wiggling');
        }, { once: true });

        // Schedule next wiggle between 8–13 seconds
        const delay = 8000 + Math.random() * 5000;
        setTimeout(scheduleWiggle, delay);
    }

    // Start first wiggle after 4 seconds
    setTimeout(scheduleWiggle, 4000);
}
