export const bookmarklet = () => {
    // code length optimization:
    const _window = window;
    const _document = document;
    const _createElement = 'createElement';
    const _appendChild = 'appendChild';
    const _addEventListener = 'addEventListener';
    const _style = 'style';

    const formatStyle = (styleArray) => {
        return styleArray
            // .map((item) => item.replace(': ', ':'))
            .join(';');
    };

    const setElementPosition = ($el, position) => {
        $el[_style].left = `${position.left}px`;
        $el[_style].top = `${position.top}px`;
        $el[_style].width = `${position.width}px`;
        $el[_style].height = `${position.height}px`;
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
        left: _window.innerWidth / 4,
        top: _window.innerHeight / 4,
        width: _window.innerWidth / 2,
        height: _window.innerHeight / 2,
    };

    const $overlay = _document[_createElement]('div');
    $overlay[_style] = [
        'position: fixed',
        'inset: 0',
    ].join(';');

    const $ruler = _document[_createElement]('div');
    $ruler[_style] = formatStyle([
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
    ]);
    setElementPosition($ruler, RULER);

    const $rulerInfo = _document[_createElement]('div');

    const $rightBottomMarker = _document[_createElement]('div');
    $rightBottomMarker[_style] = formatStyle([
        'position: absolute',
        'right: 0',
        'bottom: 0',
        'width: 10px',
        'height: 10px',
        'background: #1b75d0',
        'cursor: nwse-resize',
    ]);

    _document.body[_appendChild]($overlay);
    $overlay[_appendChild]($ruler);
    $ruler[_appendChild]($rightBottomMarker);
    $ruler[_appendChild]($rulerInfo);

    $ruler[_addEventListener]('mousedown', (e) => {
        MOVE.mode = MODE_MOVE;
        MOVE.lastMouseX = e.clientX;
        MOVE.lastMouseY = e.clientY;
        MOVE.lastRulerLeft = RULER.left;
        MOVE.lastRulerTop = RULER.top;
    });

    $overlay[_addEventListener]('mousemove', (e) => {
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

    $overlay[_addEventListener]('mouseup', () => {
        MOVE.mode = MODE_IDLE;
    });

    $rightBottomMarker[_addEventListener]('mousedown', (e) => {
        e.stopPropagation();

        MOVE.mode = MODE_RESIZE;
        MOVE.lastMouseX = e.clientX;
        MOVE.lastMouseY = e.clientY;
        MOVE.lastRulerWidth = RULER.width;
        MOVE.lastRulerHeight = RULER.height;
    });
};
