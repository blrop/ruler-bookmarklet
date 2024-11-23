export const bookmarklet = () => {
    const EDGE_SIZE = 10;
    const OVERLAY_STYLE = {
        position: 'fixed',
        inset: '0',
    };
    const RULER_INFO_STYLE = {
        background: 'white',
        padding: '1px 3px',
    };

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

    // functions and classes definitions -------------------------------------------------------------------------------

    const setStyle = (element: HTMLElement, styleArray: Partial<CSSStyleDeclaration>) => {
        for (const item in styleArray) {
            element.style[item] = styleArray[item];
        }
    };

    const updateRuler = (distanceX: number, distanceY: number) => { // todo: get rid of global variable usage: convert RULER to an object
        let newWidth = null;
        let newHeight = null;

        if (MOVE.cursorPosition === CursorPosition.Inside) {
            RULER.left = distanceX + MOVE.lastRulerLeft;
            RULER.top = distanceY + MOVE.lastRulerTop;
        }

        if (MOVE.cursorPosition === CursorPosition.LeftTop) {
            newWidth = -distanceX + MOVE.lastRulerWidth;
            newHeight = -distanceY + MOVE.lastRulerHeight;
            if (distanceX <= MOVE.lastRulerWidth) {
                RULER.left = distanceX + MOVE.lastRulerLeft;
            }
            if (distanceY <= MOVE.lastRulerHeight) {
                RULER.top = distanceY + MOVE.lastRulerTop;
            }
        }

        if (MOVE.cursorPosition === CursorPosition.Top) {
            newHeight = -distanceY + MOVE.lastRulerHeight;
            if (distanceY <= MOVE.lastRulerHeight) {
                RULER.top = distanceY + MOVE.lastRulerTop;
            }
        }

        if (MOVE.cursorPosition === CursorPosition.RightTop) {
            newWidth = distanceX + MOVE.lastRulerWidth;
            newHeight = -distanceY + MOVE.lastRulerHeight;
            if (distanceY <= MOVE.lastRulerHeight) {
                RULER.top = distanceY + MOVE.lastRulerTop;
            }
        }

        if (MOVE.cursorPosition === CursorPosition.Right) {
            newWidth = distanceX + MOVE.lastRulerWidth;
        }

        if (MOVE.cursorPosition === CursorPosition.RightBottom) {
            newWidth = distanceX + MOVE.lastRulerWidth;
            newHeight = distanceY + MOVE.lastRulerHeight;
        }

        if (MOVE.cursorPosition === CursorPosition.Bottom) {
            newHeight = distanceY + MOVE.lastRulerHeight;
        }

        if (MOVE.cursorPosition === CursorPosition.LeftBottom) {
            newWidth = -distanceX + MOVE.lastRulerWidth;
            newHeight = distanceY + MOVE.lastRulerHeight;
            if (distanceX <= MOVE.lastRulerWidth) {
                RULER.left = distanceX + MOVE.lastRulerLeft;
            }
        }

        if (MOVE.cursorPosition === CursorPosition.Left) {
            newWidth = -distanceX + MOVE.lastRulerWidth;
            if (distanceX <= MOVE.lastRulerWidth) {
                RULER.left = distanceX + MOVE.lastRulerLeft;
            }
        }

        if (newWidth > 0) {
            RULER.width = newWidth;
        }
        if (newHeight > 0) {
            RULER.height = newHeight;
        }
    };

    const getRulerStyle = (RULER: ElementPosition) => ({
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

        if (leftDistance < -EDGE_SIZE || rightDistance < -EDGE_SIZE || topDistance < -EDGE_SIZE || bottomDistance < -EDGE_SIZE) {
            return CursorPosition.Outside;
        }

        if (leftDistance > EDGE_SIZE && rightDistance > EDGE_SIZE && topDistance > EDGE_SIZE && bottomDistance > EDGE_SIZE) {
            return CursorPosition.Inside;
        }

        const isNear = (distance: number) =>
            -EDGE_SIZE <= distance && distance <= EDGE_SIZE;

        const nearLeft = isNear(leftDistance);
        const nearRight = isNear(rightDistance) && !nearLeft;
        const nearTop = isNear(topDistance);
        const nearBottom = isNear(bottomDistance) && !nearTop;

        return (+nearLeft << 3) | (+nearRight << 2) | (+nearTop << 1) | +nearBottom;
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

    class RulerInfo {
        $el: HTMLElement;

        constructor($el: HTMLElement) {
            this.$el = $el;

            setStyle(this.$el, RULER_INFO_STYLE);
        }

        setInfo(width: number, height: number) {
            $rulerInfo.innerText = `${width} x ${height}`;
        }
    }

    // global variables ------------------------------------------------------------------------------------------------

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
    const RULER: ElementPosition = {
        left: Math.round(window.innerWidth / 4),
        top: Math.round(window.innerHeight / 4),
        width: Math.round(window.innerWidth / 2),
        height: Math.round(window.innerHeight / 2),
    };

    // elements creation -----------------------------------------------------------------------------------------------

    const $overlay: HTMLElement = document.createElement('div');
    setStyle($overlay, OVERLAY_STYLE);

    const $ruler = document.createElement('div');
    setStyle($ruler, getRulerStyle(RULER));
    setElementPosition($ruler, RULER);

    const $rulerInfo = document.createElement('div');

    document.body.appendChild($overlay);
    $overlay.appendChild($ruler);
    $ruler.appendChild($rulerInfo);

    const rulerInfo = new RulerInfo($rulerInfo);
    rulerInfo.setInfo(RULER.width, RULER.height);

    // event listeners -------------------------------------------------------------------------------------------------

    $overlay.addEventListener('mousedown', (e) => {
        if (e.button !== 0) {
            return;
        }

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

        const distanceX = e.clientX - MOVE.lastMouseX;
        const distanceY = e.clientY - MOVE.lastMouseY;

        updateRuler(distanceX, distanceY);

        setElementPosition($ruler, RULER);

        rulerInfo.setInfo(RULER.width, RULER.height);
    });

    $overlay.addEventListener('mouseup', (e) => {
        if (e.button !== 0) {
            return;
        }

        MOVE.moving = false;
    });
};
