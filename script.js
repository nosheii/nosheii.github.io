// --- Skalering av scenen ---
const SCENE_WIDTH = 1168;
const SCENE_HEIGHT = 784;
const BUBBLE_EDGE_GUTTER = 16;
const BUBBLE_POINTER_GUTTER = 8;
const scene = document.getElementById('scene');
const pipeContainer = document.getElementById('pipeContainer');
const pipeWrappers = [...document.querySelectorAll('.pipe-wrapper')];

let bubblePositionFrame = null;
let bubblePositionTimer = null;

function resizeScene() {
    const scaleX = window.innerWidth / SCENE_WIDTH;
    const scaleY = window.innerHeight / SCENE_HEIGHT;
    const scale = Math.max(scaleX, scaleY);

    const scaledWidth = SCENE_WIDTH * scale;
    const scaledHeight = SCENE_HEIGHT * scale;
    const offsetX = (window.innerWidth - scaledWidth) / 2;
    const offsetY = (window.innerHeight - scaledHeight) / 2;

    scene.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    scene.style.setProperty('--intro-top', `${Math.max(28, (24 - offsetY) / scale)}px`);

    const openWrapper = pipeWrappers.find((wrapper) => wrapper.classList.contains('is-open'));
    if (openWrapper) scheduleBubblePosition(openWrapper);
}

window.addEventListener('resize', resizeScene);
window.addEventListener('load', resizeScene);
resizeScene();

function resetWrapper(wrapper) {
    wrapper.classList.remove('is-open');
    wrapper.setAttribute('aria-expanded', 'false');

    const bubble = wrapper.querySelector('.speech-bubble');
    if (bubble) {
        bubble.setAttribute('aria-hidden', 'true');
        bubble.style.removeProperty('--bubble-left');
        bubble.style.removeProperty('--bubble-pointer');
        bubble.style.removeProperty('max-width');
    }
}

function positionOpenBubble(wrapper) {
    if (!wrapper.classList.contains('is-open')) return;

    const bubble = wrapper.querySelector('.speech-bubble');
    if (!bubble) return;

    const sceneRect = scene.getBoundingClientRect();
    const sceneScale = sceneRect.width / SCENE_WIDTH;
    if (!sceneScale) return;

    // Begrens boblen ut fra den faktiske skalaen, slik at den også holder seg
    // innenfor smale eller høye nettleservinduer.
    bubble.style.maxWidth = `${Math.max(0, (window.innerWidth - BUBBLE_EDGE_GUTTER * 2) / sceneScale)}px`;

    const bubbleRect = bubble.getBoundingClientRect();
    if (!bubbleRect.width) return;

    // Forankre boblen i midten av det synlige vinduet, uavhengig av hvilket rør
    // som åpnes. Verdien konverteres tilbake til scenens koordinater fordi hele
    // scenen skaleres med CSS transform.
    const wrapperRect = wrapper.getBoundingClientRect();
    const bubbleCenterFromWrapper = (window.innerWidth / 2 - wrapperRect.left) / sceneScale;
    bubble.style.setProperty('--bubble-left', `${bubbleCenterFromWrapper}px`);

    // Halen peker mot røret når det er mulig, men holdes innenfor boblen hvis
    // røret selv ligger utenfor den synlige delen av scenen.
    const centeredBubbleRect = bubble.getBoundingClientRect();
    const pointerPercent = ((wrapperRect.left + wrapperRect.width / 2 - centeredBubbleRect.left) / centeredBubbleRect.width) * 100;
    const clampedPointer = Math.min(100 - BUBBLE_POINTER_GUTTER, Math.max(BUBBLE_POINTER_GUTTER, pointerPercent));
    bubble.style.setProperty('--bubble-pointer', `${clampedPointer}%`);
}

function scheduleBubblePosition(wrapper) {
    if (bubblePositionFrame !== null) cancelAnimationFrame(bubblePositionFrame);
    if (bubblePositionTimer !== null) clearTimeout(bubblePositionTimer);

    bubblePositionFrame = requestAnimationFrame(() => {
        bubblePositionFrame = null;
        positionOpenBubble(wrapper);

        // Kjør på nytt etter at størrelsesovergangen er ferdig, slik at også
        // den ferdig utvidede boblen holder seg sentrert.
        bubblePositionTimer = window.setTimeout(() => {
            bubblePositionTimer = null;
            positionOpenBubble(wrapper);
        }, 460);
    });
}

function openPipe(wrapper) {
    pipeWrappers.forEach((otherWrapper) => {
        if (otherWrapper !== wrapper) resetWrapper(otherWrapper);
    });

    wrapper.classList.add('is-open');
    wrapper.setAttribute('aria-expanded', 'true');

    const bubble = wrapper.querySelector('.speech-bubble');
    if (bubble) bubble.setAttribute('aria-hidden', 'false');

    scene.classList.add('has-open-bubble');
    scheduleBubblePosition(wrapper);
}

function closePipe(wrapper) {
    resetWrapper(wrapper);
    scene.classList.remove('has-open-bubble');
    wrapper.focus({ preventScroll: true });
}

pipeWrappers.forEach((wrapper) => {
    wrapper.addEventListener('click', (event) => {
        if (event.target.closest('.close-button')) return;
        if (wrapper.classList.contains('is-open')) return;
        openPipe(wrapper);
    });

    wrapper.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!wrapper.classList.contains('is-open')) openPipe(wrapper);
        }
    });

    const closeButton = wrapper.querySelector('.close-button');
    closeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        closePipe(wrapper);
    });
});

// Et klikk i selve bakgrunnen lukker et åpent tema.
scene.addEventListener('click', (event) => {
    if (event.target === scene || event.target === pipeContainer) {
        const openWrapper = pipeWrappers.find((wrapper) => wrapper.classList.contains('is-open'));
        if (openWrapper) closePipe(openWrapper);
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const openWrapper = pipeWrappers.find((wrapper) => wrapper.classList.contains('is-open'));
    if (openWrapper) closePipe(openWrapper);
});
