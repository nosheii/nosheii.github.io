// --- Skalering av scenen (som før) ---
const SCENE_WIDTH = 1168;
const SCENE_HEIGHT = 784;
const scene = document.getElementById('scene');

function resizeScene() {
    const scaleX = window.innerWidth / SCENE_WIDTH;
    const scaleY = window.innerHeight / SCENE_HEIGHT;
    const scale = Math.max(scaleX, scaleY);

    const scaledWidth = SCENE_WIDTH * scale;
    const scaledHeight = SCENE_HEIGHT * scale;

    const offsetX = (window.innerWidth - scaledWidth) / 2;
    const offsetY = (window.innerHeight - scaledHeight) / 2;

    scene.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

window.addEventListener('resize', resizeScene);
window.addEventListener('load', resizeScene);
resizeScene();

// --- Rør: klikk for å åpne/lukke fullt innhold ---
const backdrop = document.getElementById('overlayBackdrop');
const pipeWrappers = document.querySelectorAll('.pipe-wrapper');

pipeWrappers.forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
        // ikke åpne på nytt hvis man klikker inni en allerede-åpen boble (f.eks. på lenker inni innholdet)
        if (wrapper.classList.contains('active')) return;
        openPipe(wrapper);
    });
});

function openPipe(wrapper) {
    // lukk eventuelt et annet åpent rør først
    pipeWrappers.forEach(w => w.classList.remove('active'));

    wrapper.classList.add('active');
    backdrop.classList.add('active');
}

function closeBubble(button) {
    const wrapper = button.closest('.pipe-wrapper');
    wrapper.classList.remove('active');
    backdrop.classList.remove('active');
}

// lukk også hvis man klikker på den mørke bakgrunnen
backdrop.addEventListener('click', () => {
    pipeWrappers.forEach(w => w.classList.remove('active'));
    backdrop.classList.remove('active');
});