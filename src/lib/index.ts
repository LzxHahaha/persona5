import * as _ from './utils';

const MAX_ANGLE = 3;

enum COLORS {
    RED = '#DA4C23',
    WHITE = '#FDFDFD',
    BLACK = '#0F0F0F',
};

enum CHAR_MODE {
    FIRST = 1,
    WHITE = 2,
    RED = 3,
};

interface BoxChar {
    charImage: HTMLImageElement,
    width: number,
    height: number,
    angle: number,
    scale: number,
    offset: number,
    mode: CHAR_MODE
}

interface BoxTextOptions {
    fontSize?: number,
    fontFamily?: string
}

export default class BoxText {
    private chars: Array<BoxChar> = [];
    private fontSize = 60;
    private fontFamily = 'sans-serif';

    get font() {
        return `bold ${this.fontSize}px ${this.fontFamily}`;
    }

    constructor(text: string, options?: BoxTextOptions) {
        if (options) {
            const { fontSize, fontFamily } = options;
            fontSize && (this.fontSize = fontSize);
            fontFamily && (this.fontFamily = fontFamily);
        }
        if (!text) {
            throw new Error('Must set text.');
        }

        const chars = text.toUpperCase().split('');
        const modes = new Array<number>(chars.length).fill(CHAR_MODE.WHITE);
        modes[0] = CHAR_MODE.FIRST;
        // 随机选择标红的字，一定范围内只允许出现一次
        for (let i = 1; i < this.chars.length; i += 7) {
            for (let j = i; j < i + 6 && j < this.chars.length; ++j) {
                if (Math.random() * 10 > 5) {
                    modes[j] = CHAR_MODE.RED;
                    break;
                }
            }
        }

        for (const [index, char] of chars.entries()) {

            let scale = 1.5, offset = 0, fontSize = this.fontSize * 1.5;
            let angle = -(Math.round(Math.random() * 10) % MAX_ANGLE);
            if (index > 0) {
                scale = 1 - Math.floor(Math.random() * 10) % 3 / 10;
                offset = Math.floor(Math.random() * 100) % 50 / 100 * _.randomOp();
                angle *= _.randomOp();
                fontSize *= scale;
            }
            let color = modes[index] === CHAR_MODE.RED ? COLORS.RED : COLORS.WHITE;
            const { width, height, image: charImage } = _.textToImage(char, fontSize, color, this.fontFamily, 'bold');

            const boxChar: BoxChar = {
                charImage,
                width,
                height,
                angle,
                scale,
                offset,
                mode: modes[index]
            };
            this.chars.push(boxChar);
        }
    }

    draw(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create canvas');
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const pendding = 10;
        
        // TODO: 修正最大宽高计算
        let canvasWidth = pendding * 2, canvasHeight = 0;
        for (const boxChar of this.chars) {
            let { width, height, scale, angle } = boxChar;
            width *= scale;
            height *= scale;
            
            const sin = Math.abs(Math.sin(angle)), cos = Math.abs(Math.cos(angle));
            const charWidth = width * cos + height * sin;
            const charHeight = height * cos + width * sin;
            canvasWidth += charWidth;
            canvasHeight = Math.max(canvasHeight, charHeight);
        }
        canvasHeight += pendding * 2;

        canvas.height = canvasHeight;
        canvas.width = canvasWidth;

        ctx.font = this.font;
        ctx.fillStyle = COLORS.BLACK;
        ctx.textBaseline = 'top';
        ctx.font = this.font;

        let left = pendding;
        for (const boxChar of this.chars) {
            ctx.save();

            let { charImage, width, height, angle, scale, offset, mode } = boxChar;
            ctx.scale(scale, scale);
            
            if (mode == CHAR_MODE.FIRST) {
                const BOX_SCALE = 1.5;
                // _.canvasRotate(canvas, ctx, angle - 3);
                const borderWidth = width * 1.5, borderHeight = height * BOX_SCALE;
                ctx.fillStyle = COLORS.BLACK;
                ctx.fillRect(left, pendding, borderWidth, borderHeight);

                // _.canvasRotate(canvas, ctx, 1.5);
                const bgScale = BOX_SCALE - 0.2;
                const bgWidth = width * bgScale, bgHeight = height * bgScale;
                const bgLeft = left + (borderWidth - bgWidth) / 2, bgTop = pendding + (borderHeight - bgHeight);
                ctx.fillStyle = COLORS.RED;
                ctx.fillRect(bgLeft, bgTop, bgWidth, bgHeight);

                const textLeft = left + (borderWidth - width) / 2, textTop = pendding + (borderHeight - height) / 2;
                ctx.drawImage(charImage, textLeft, textTop);

                left += borderWidth * BOX_SCALE;
            } else {
                const topOffset = canvasHeight / 2 ;

                const BOX_SCALE = 1.2;
                // _.canvasRotate(canvas, ctx, angle);
                const bgWidth = width * BOX_SCALE, bgHeight = height * BOX_SCALE;
                ctx.fillStyle = COLORS.BLACK;
                ctx.fillRect(left, topOffset, bgWidth, bgHeight);

                const textLeft = left + (bgWidth - width) / 2, textTop = topOffset + (bgWidth - height) / 2;
                ctx.drawImage(charImage, textLeft, textTop);

                left += bgWidth * BOX_SCALE;
            }

            ctx.restore();
        }
    }
}
