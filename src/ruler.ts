export const screenRuler = () => {
    const VERSION = '1.0';
    const EDGE_SIZE = 10;
    const KEYBOARD_MOVE_STEP = 10;
    const ABOUT = `
Screen Ruler v. ${VERSION}

Usage via keyboard:
- Arrows: move
- Arrows+Shift: faster move
- Arrows+Ctrl: resize
- Arrows+Ctrl+Shift: faster resize
- Esc: exit

Author: Igor Siluianov
https://isln.dev
    `;
    const OVERLAY_STYLE = {
        position: 'fixed',
        inset: '0',
    };
    const RULER_DISPLAY_STYLE = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    };
    const RULER_SIZE_INFO_STYLE = {
        background: 'white',
        padding: '1px 3px',
        whiteSpace: 'nowrap',
        fontSize: '16px',
        fontFamily: 'monospace',
        border: '1px solid #1b75d0',
    };
    const INFO_ICON_STYLE = {
        background: '#404040',
        borderRadius: '7px',
        width: '14px',
        height: '14px',
        color: 'white',
        fontSize: '11px',
        textAlign: 'center',
        lineHeight: '14px',
        fontWeight: 'bold',
        cursor: 'default',
    };
    const RULER_STYLE = {
        border: '1px solid #1b75d0',
        background: '#1b75d02b',
        cursor: 'move',
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
        fontFamily: 'sans-serif',
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

    const getCursorPosition = (rulerPosition: ElementPosition, mouse: Coords): CursorPosition => {
        const rulerRight = rulerPosition.left + rulerPosition.width;
        const rulerBottom = rulerPosition.top + rulerPosition.height;

        const leftDistance = mouse.x - rulerPosition.left;
        const rightDistance = rulerRight - mouse.x;
        const topDistance = mouse.y - rulerPosition.top;
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
        }

        setInfo(position: ElementPosition) {
            const bordersWidth = 2;
            const right = window.innerWidth - position.left - position.width - bordersWidth;
            const bottom = window.innerHeight - position.top - position.height - bordersWidth;
            this.$el.innerText = `${position.width} x ${position.height}\nL: ${position.left}; T: ${position.top}\nR: ${right}; B: ${bottom}`;
        }
    }

    class Ruler {
        $el: HTMLElement;
        move: Move;
        sizeUpdateCallback: (position: ElementPosition) => void;

        position: ElementPosition = {
            left: Math.round(window.innerWidth / 4),
            top: Math.round(window.innerHeight / 4),
            width: Math.round(window.innerWidth / 2),
            height: Math.round(window.innerHeight / 2),
        };

        constructor($el: HTMLElement) {
            this.$el = $el;
            this.move = {
                moving: false,
                cursorPosition: CursorPosition.Inside,
                lastMouseX: null,
                lastMouseY: null,
                lastRulerLeft: null,
                lastRulerTop: null,
                lastRulerWidth: null,
                lastRulerHeight: null,
            };

            setStyle(this.$el, RULER_STYLE); // rest doesn't work in bookmarklet
            setStyle(this.$el, {
                left: `${this.position.left}px`,
                width: `${this.position.width}px`,
                top: `${this.position.top}px`,
                height: `${this.position.height}px`,
            });
            this.setPositionInHtml(this.position);
        }

        private updatePosition(position: Partial<ElementPosition>) {
            this.position.left = position.left ?? this.position.left;
            this.position.top = position.top ?? this.position.top;
            this.position.width = position.width ?? this.position.width;
            this.position.height = position.height ?? this.position.height;

            this.setPositionInHtml(this.position);
            this.sizeUpdateCallback(this.position);
        }

        private setPositionInHtml(position: ElementPosition) {
            this.$el.style.left = `${position.left}px`;
            this.$el.style.top = `${position.top}px`;
            this.$el.style.width = `${position.width}px`;
            this.$el.style.height = `${position.height}px`;
        }

        public addPositionUpdateListener(callback: (position: ElementPosition) => void) {
            this.sizeUpdateCallback = callback;
            this.sizeUpdateCallback(this.position);
        }

        public startMove(clientX: number, clientY: number, cursorPosition: CursorPosition) {
            this.move.lastMouseX = clientX;
            this.move.lastMouseY = clientY;
            this.move.lastRulerLeft = this.position.left;
            this.move.lastRulerTop = this.position.top;
            this.move.lastRulerWidth = this.position.width;
            this.move.lastRulerHeight = this.position.height;

            this.move.cursorPosition = cursorPosition;
            this.move.moving = true;
        }

        public stopMove() {
            this.move.moving = false;
        }

        public updateByMouse(clientX: number, clientY: number) {
            const distanceX = clientX - this.move.lastMouseX;
            const distanceY = clientY - this.move.lastMouseY;

            let newWidth = null;
            let newHeight = null;

            const position: Partial<ElementPosition> = {};

            if (this.move.cursorPosition === CursorPosition.Inside) {
                position.left = distanceX + this.move.lastRulerLeft;
                position.top = distanceY + this.move.lastRulerTop;
            }

            if (this.move.cursorPosition === CursorPosition.LeftTop) {
                newWidth = -distanceX + this.move.lastRulerWidth;
                newHeight = -distanceY + this.move.lastRulerHeight;
                if (distanceX <= this.move.lastRulerWidth) {
                    position.left = distanceX + this.move.lastRulerLeft;
                }
                if (distanceY <= this.move.lastRulerHeight) {
                    position.top = distanceY + this.move.lastRulerTop;
                }
            }

            if (this.move.cursorPosition === CursorPosition.Top) {
                newHeight = -distanceY + this.move.lastRulerHeight;
                if (distanceY <= this.move.lastRulerHeight) {
                    position.top = distanceY + this.move.lastRulerTop;
                }
            }

            if (this.move.cursorPosition === CursorPosition.RightTop) {
                newWidth = distanceX + this.move.lastRulerWidth;
                newHeight = -distanceY + this.move.lastRulerHeight;
                if (distanceY <= this.move.lastRulerHeight) {
                    position.top = distanceY + this.move.lastRulerTop;
                }
            }

            if (this.move.cursorPosition === CursorPosition.Right) {
                newWidth = distanceX + this.move.lastRulerWidth;
            }

            if (this.move.cursorPosition === CursorPosition.RightBottom) {
                newWidth = distanceX + this.move.lastRulerWidth;
                newHeight = distanceY + this.move.lastRulerHeight;
            }

            if (this.move.cursorPosition === CursorPosition.Bottom) {
                newHeight = distanceY + this.move.lastRulerHeight;
            }

            if (this.move.cursorPosition === CursorPosition.LeftBottom) {
                newWidth = -distanceX + this.move.lastRulerWidth;
                newHeight = distanceY + this.move.lastRulerHeight;
                if (distanceX <= this.move.lastRulerWidth) {
                    position.left = distanceX + this.move.lastRulerLeft;
                }
            }

            if (this.move.cursorPosition === CursorPosition.Left) {
                newWidth = -distanceX + this.move.lastRulerWidth;
                if (distanceX <= this.move.lastRulerWidth) {
                    position.left = distanceX + this.move.lastRulerLeft;
                }
            }

            if (newWidth > 0) {
                position.width = newWidth;
            }
            if (newHeight > 0) {
                position.height = newHeight;
            }

            this.updatePosition(position);
        };

        public moveBy(x: number, y: number) {
            const position: Partial<ElementPosition> = {};
            position.left = this.position.left + x;
            position.top = this.position.top + y;
            this.updatePosition(position);
        }

        public resizeBy(x: number, y: number) {
            const position: Partial<ElementPosition> = {};
            position.width = this.position.width + x;
            position.height = this.position.height + y;
            this.updatePosition(position);
        }

        public getPosition() {
            return Object.assign({}, this.position); // rest doesn't work in bookmarklet
        }

        public isMoving() {
            return this.move.moving;
        }
    }

    // elements creation -----------------------------------------------------------------------------------------------

    const $overlay: HTMLElement = document.createElement('div');
    setStyle($overlay, OVERLAY_STYLE);
    $overlay.setAttribute('data-info', 'SCREEN RULER');

    const $ruler = document.createElement('div');
    const ruler = new Ruler($ruler);

    const $rulerDisplay = document.createElement('div');
    setStyle($rulerDisplay, RULER_DISPLAY_STYLE);
    const $rulerSizeInfo = document.createElement('div');
    setStyle($rulerSizeInfo, RULER_SIZE_INFO_STYLE);
    const $infoIcon = document.createElement('div');
    $infoIcon.innerText = 'i';
    $infoIcon.title = ABOUT;
    setStyle($infoIcon, INFO_ICON_STYLE);

    document.body.appendChild($overlay);
    $overlay.appendChild($ruler);
    $ruler.appendChild($rulerDisplay);
    $rulerDisplay.appendChild($rulerSizeInfo);
    $rulerDisplay.appendChild($infoIcon);

    // objects creation ------------------------------------------------------------------------------------------------

    const rulerInfo = new RulerInfo($rulerSizeInfo);

    const handlePositionUpdate = (position: ElementPosition) => {
        rulerInfo.setInfo(position);
    };

    ruler.addPositionUpdateListener(handlePositionUpdate);

    // event listeners -------------------------------------------------------------------------------------------------

    const onOverlayMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) {
            return;
        }

        const cursorPosition = getCursorPosition(ruler.getPosition(), { x: e.clientX, y: e.clientY });
        ruler.startMove(e.clientX, e.clientY, cursorPosition);
    };

    const onOverlayMouseMove = (e: MouseEvent) => {
        // set cursor style
        const cursorPosition = getCursorPosition(ruler.getPosition(), { x: e.clientX, y: e.clientY });
        $overlay.style.cursor = $ruler.style.cursor = getCursorStyleByPosition(cursorPosition);

        if (!ruler.isMoving()) {
            return;
        }

        ruler.updateByMouse(e.clientX, e.clientY);
    };

    const onOverlayMouseUp = (e: MouseEvent) => {
        if (e.button !== 0) {
            return;
        }

        ruler.stopMove();
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
        }

        const stepSize = e.shiftKey ? KEYBOARD_MOVE_STEP : 1;
        let x = 0;
        let y = 0;

        switch (e.key) {
            case 'ArrowLeft':
                x -= stepSize;
                break;

            case 'ArrowRight':
                x += stepSize;
                break;

            case 'ArrowUp':
                y -= stepSize;
                break;

            case 'ArrowDown':
                y += stepSize;
                break;

            case 'Escape':
                $overlay.removeEventListener('mousedown', onOverlayMouseDown);
                $overlay.removeEventListener('mousemove', onOverlayMouseMove);
                $overlay.removeEventListener('mouseup', onOverlayMouseUp);
                document.body.removeEventListener('keydown', onKeyDown);

                $rulerSizeInfo.remove();
                $infoIcon.remove();
                $rulerDisplay.remove();
                $ruler.remove();
                $overlay.remove();
                break;
        }

        if (e.ctrlKey) {
            ruler.resizeBy(x, y);
        } else {
            ruler.moveBy(x, y);
        }
    };

    $overlay.addEventListener('mousedown', onOverlayMouseDown);

    $overlay.addEventListener('mousemove', onOverlayMouseMove);

    $overlay.addEventListener('mouseup', onOverlayMouseUp);

    document.body.addEventListener('keydown', onKeyDown);
};
