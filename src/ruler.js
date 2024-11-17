export const bookmarklet = () => {
    const setElementPosition = ($el, position) => {
        $el.style.left = `${position.left}px`;
        $el.style.top = `${position.top}px`;
        $el.style.width = `${position.width}px`;
        $el.style.height = `${position.height}px`;
    };

    const MODE_IDLE = 0;
    const MODE_MOVE = 1;
    const MODE_RESIZE = 2;
    const MOVE = {
        mode: MODE_IDLE,
        lastMouseX: null,
        lastMouseY: null,
        lastRulerLeft: null,
        lastRulerTop: null,
        lastRulerWidth: null,
        lastRulerHeight: null,
    };
    const RULER = {
        left: window.innerWidth / 4,
        top: window.innerHeight / 4,
        width: window.innerWidth / 2,
        height: window.innerHeight / 2,
    };

    const $overlay = document.createElement('div');
    $overlay.style = [
        'position: fixed',
        'inset: 0',
    ].join(';');

    const $ruler = document.createElement('div');
    $ruler.style = [
        'border: 1px solid #1b75d0',
        'background: #1b75d02b',
        'cursor: move',
        'position: absolute',
        'display: flex',
        'justify-content: center',
        'align-items: center',
        `left: ${RULER.left}px`,
        `width: ${RULER.width}px`,
        `top: ${RULER.top}px`,
        `height: ${RULER.height}px`,
        'user-select: none',
        'font-family: sans-serif',
    ].join(';');
    setElementPosition($ruler, RULER);

    const $rulerInfo = document.createElement('div');

    const $rightBottomMarker = document.createElement('div');
    $rightBottomMarker.style = [
        'position: absolute',
        'right: 0',
        'bottom: 0',
        'width: 10px',
        'height: 10px',
        'background: #1b75d0',
        'cursor: nwse-resize',
    ].join(';');

    document.body.appendChild($overlay);
    $overlay.appendChild($ruler);
    $ruler.appendChild($rightBottomMarker);
    $ruler.appendChild($rulerInfo);

    $ruler.addEventListener('mousedown', (e) => {
        MOVE.mode = MODE_MOVE;
        MOVE.lastMouseX = e.clientX;
        MOVE.lastMouseY = e.clientY;
        MOVE.lastRulerLeft = RULER.left;
        MOVE.lastRulerTop = RULER.top;
    });

    $overlay.addEventListener('mousemove', (e) => {
        if (MOVE.mode === MODE_MOVE) {
            RULER.left = e.clientX - MOVE.lastMouseX + MOVE.lastRulerLeft;
            RULER.top = e.clientY - MOVE.lastMouseY + MOVE.lastRulerTop;
            setElementPosition($ruler, RULER);
        }

        if (MOVE.mode === MODE_RESIZE) {
            RULER.width = e.clientX - MOVE.lastMouseX + MOVE.lastRulerWidth;
            RULER.height = e.clientY - MOVE.lastMouseY + MOVE.lastRulerHeight;
            setElementPosition($ruler, RULER);
        }

        $rulerInfo.innerText = `${RULER.width} x ${RULER.height}`;
    });

    $overlay.addEventListener('mouseup', () => {
        MOVE.mode = MODE_IDLE;
    });

    $rightBottomMarker.addEventListener('mousedown', (e) => {
        e.stopPropagation();

        MOVE.mode = MODE_RESIZE;
        MOVE.lastMouseX = e.clientX;
        MOVE.lastMouseY = e.clientY;
        MOVE.lastRulerWidth = RULER.width;
        MOVE.lastRulerHeight = RULER.height;
    });
};
