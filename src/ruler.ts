export const bookmarklet = () => {
    type ElementPosition = {
        left: number,
        top: number,
        width: number,
        height: number,
    };

    type Coords = {
        x: number,
        y: number,
    };

    /*
    * LRTB = 0b1111
    * */
    enum CursorPosition {
        LeftTop = 0b1010,
        Top = 0b0010,
        RightTop = 0b0110,
        Right = 0b0100,
        RightBottom = 0b0101,
        Bottom = 0b0001,
        LeftBottom = 0b1001,
        Left = 0b1000,
        Inside = 16,
        Outside = 17,
    }

    type Move = {
        moving: boolean,
        cursorPosition: CursorPosition,
        lastMouseX: number,
        lastMouseY: number,
        lastRulerLeft: number,
        lastRulerTop: number,
        lastRulerWidth: number,
        lastRulerHeight: number,
    };

    const EDGE_SIZE = 10;

    const rulerStyle = (RULER: ElementPosition) => ({
        border: '1px solid #1b75d0',
        background: '#1b75d02b',
        cursor: 'move',
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        left: `${RULER.left}px`,
        width: `${RULER.width}px`,
        top: `${RULER.top}px`,
        height: `${RULER.height}px`,
        userSelect: 'none',
        fontFamily: 'sans-serif',
    });

    const setElementPosition = ($el: HTMLElement, position: ElementPosition) => {
        $el.style.left = `${position.left}px`;
        $el.style.top = `${position.top}px`;
        $el.style.width = `${position.width}px`;
        $el.style.height = `${position.height}px`;
    };

    const getCursorPosition = (ruler: ElementPosition, mouse: Coords): CursorPosition => {
        const rulerRight = ruler.left + ruler.width;
        const rulerBottom = ruler.top + ruler.height;

        const leftDistance = mouse.x - ruler.left;
        const rightDistance = rulerRight - mouse.x;
        const topDistance = mouse.y - ruler.top;
        const bottomDistance = rulerBottom - mouse.y;

        if (leftDistance < 0 || rightDistance < 0 || topDistance < 0 || bottomDistance < 0) {
            return CursorPosition.Outside;
        }

        if (leftDistance > EDGE_SIZE && rightDistance > EDGE_SIZE && topDistance > EDGE_SIZE && bottomDistance > EDGE_SIZE) {
            return CursorPosition.Inside;
        }

        const isNear = (distance: number) =>
            (0 <= distance && distance <= EDGE_SIZE) ? 1 : 0;

        const nearLeft = isNear(leftDistance);
        const nearRight = isNear(rightDistance);
        const nearTop = isNear(topDistance);
        const nearBottom = isNear(bottomDistance);

        return (nearLeft << 3) | (nearRight << 2) | (nearTop << 1) | nearBottom;
    };

    const getCursorStyleByPosition = (cursorPosition: CursorPosition): string => {
        const positionToStyle: Record<CursorPosition, string> = {
            [CursorPosition.Left]: 'ew-resize',
            [CursorPosition.Right]: 'ew-resize',
            [CursorPosition.Top]: 'ns-resize',
            [CursorPosition.Bottom]: 'ns-resize',
            [CursorPosition.RightTop]: 'nesw-resize',
            [CursorPosition.LeftBottom]: 'nesw-resize',
            [CursorPosition.LeftTop]: 'nwse-resize',
            [CursorPosition.RightBottom]: 'nwse-resize',
            [CursorPosition.Inside]: 'move',
            [CursorPosition.Outside]: 'default',
        };

        return positionToStyle[cursorPosition];
    };

    // constants -------------------------------------------------------------------------------------------------------

    const MOVE: Move = {
        moving: false,
        cursorPosition: CursorPosition.Inside,
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

    const setStyle = (element: HTMLElement, styleArray: Partial<CSSStyleDeclaration>) => {
        for (const item in styleArray) {
            element.style[item] = styleArray[item];
        }
    };

    // elements creation -----------------------------------------------------------------------------------------------

    const $overlay: HTMLElement = document.createElement('div');
    setStyle($overlay, {
        position: 'fixed',
        inset: '0',
    });

    const $ruler = document.createElement('div');
    setStyle($ruler, rulerStyle(RULER));
    setElementPosition($ruler, RULER);

    const $rulerInfo = document.createElement('div');

    document.body.appendChild($overlay);
    $overlay.appendChild($ruler);
    $ruler.appendChild($rulerInfo);

    $rulerInfo.innerText = `${RULER.width} x ${RULER.height}`; // todo: this is a code duplication; need to create a class

    // event listeners -------------------------------------------------------------------------------------------------

    $ruler.addEventListener('mousedown', (e) => {
        const cursorPosition = getCursorPosition(RULER, { x: e.clientX, y: e.clientY });

        MOVE.lastMouseX = e.clientX;
        MOVE.lastMouseY = e.clientY;
        MOVE.lastRulerLeft = RULER.left;
        MOVE.lastRulerTop = RULER.top;
        MOVE.lastRulerWidth = RULER.width;
        MOVE.lastRulerHeight = RULER.height;

        MOVE.cursorPosition = cursorPosition;
        MOVE.moving = true;
    });

    $overlay.addEventListener('mousemove', (e) => {
        // set cursor style
        const cursorPosition = getCursorPosition(RULER, { x: e.clientX, y: e.clientY });
        const cursor = getCursorStyleByPosition(cursorPosition);
        $overlay.style.cursor = $ruler.style.cursor = cursor;

        if (!MOVE.moving) {
            return;
        }

        if (MOVE.cursorPosition === CursorPosition.Inside) {
            RULER.left = e.clientX - MOVE.lastMouseX + MOVE.lastRulerLeft;
            RULER.top = e.clientY - MOVE.lastMouseY + MOVE.lastRulerTop;
            setElementPosition($ruler, RULER);
        }

        if (MOVE.cursorPosition === CursorPosition.LeftTop) {
            RULER.width = -(e.clientX - MOVE.lastMouseX) + MOVE.lastRulerWidth;
            RULER.height = -(e.clientY - MOVE.lastMouseY) + MOVE.lastRulerHeight;
            RULER.left = e.clientX - MOVE.lastMouseX + MOVE.lastRulerLeft;
            RULER.top = e.clientY - MOVE.lastMouseY + MOVE.lastRulerTop;
            setElementPosition($ruler, RULER);
        }

        if (MOVE.cursorPosition === CursorPosition.Top) {

        }

        if (MOVE.cursorPosition === CursorPosition.RightTop) {

        }

        if (MOVE.cursorPosition === CursorPosition.Right) {

        }

        if (MOVE.cursorPosition === CursorPosition.RightBottom) {
            RULER.width = e.clientX - MOVE.lastMouseX + MOVE.lastRulerWidth;
            RULER.height = e.clientY - MOVE.lastMouseY + MOVE.lastRulerHeight;
            setElementPosition($ruler, RULER);
        }

        if (MOVE.cursorPosition === CursorPosition.Bottom) {

        }

        if (MOVE.cursorPosition === CursorPosition.LeftBottom) {

        }

        if (MOVE.cursorPosition === CursorPosition.Left) {

        }

        $rulerInfo.innerText = `${RULER.width} x ${RULER.height}`;
    });

    $overlay.addEventListener('mouseup', () => {
        MOVE.moving = false;
    });
};
