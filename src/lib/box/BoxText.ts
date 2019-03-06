import * as _ from '../utils';
import BoxChar, { CHAR_MODE, COLORS } from './BoxChar';

interface BoxTextOptions {
    fontSize?: number,
    fontFamily?: string,
    gutter?: number,
    pendding?: number,
}

export default class BoxText {
    private chars: Array<BoxChar> = [];
    private fontSize = 60;
    private fontFamily = 'sans-serif';
    private gutter = 3;
    private pendding = 30;

    constructor(text: string, options?: BoxTextOptions) {
        if (options) {
            const { fontSize, fontFamily, gutter, pendding } = options;
            fontSize && (this.fontSize = fontSize);
            fontFamily && (this.fontFamily = fontFamily);
            gutter && (this.gutter = gutter);
            pendding && (this.pendding = pendding);
        }
        if (!text) {
            throw new Error('Must set text.');
        }

        const chars = text.toUpperCase().split('');
        const modes = new Array<number>(chars.length).fill(CHAR_MODE.WHITE);
        modes[0] = CHAR_MODE.FIRST;
        // 随机选择标红的字，一定范围内只允许出现一次
        for (let i = 1; i < chars.length; i += 7) {
            for (let j = i; j < i + 6 && j < chars.length; ++j) {
                if (Math.random() * 10 > 7) {
                    modes[j] = CHAR_MODE.RED;
                    break;
                }
            }
        }

        for (const [index, char] of chars.entries()) {
            if (/^\s$/.test(char)) {
                this.chars.push(new BoxChar('', CHAR_MODE.SPACE));
            } else {
                this.chars.push(new BoxChar(char, modes[index], this.fontSize, this.fontFamily));
            }
        }
    }

    draw(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create canvas');
        }

        const pendding = this.pendding, gutter = this.gutter;
        
        let canvasWidth = pendding * 2, canvasHeight = 0;
        for (const boxChar of this.chars) {
            if (boxChar instanceof BoxChar) {
                const size = boxChar.outterSize;
                canvasWidth += (size.width + gutter);
                canvasHeight = Math.max(canvasHeight, size.height);
            } else {
                canvasWidth += 2 * gutter;
            }
        }

        canvas.height = canvasHeight + pendding * 2;
        canvas.width = canvasWidth;

        ctx.fillStyle = COLORS.BLACK;
        ctx.textBaseline = 'top';

        let drawOffset = pendding;
        for (const boxChar of this.chars) {
            if (boxChar.mode == CHAR_MODE.SPACE) {
                drawOffset += 2 * gutter;
                continue;
            }
            
            ctx.save();
            let { char, top, left, width, height, angle, mode, color } = boxChar;

            if (mode == CHAR_MODE.FIRST) {
                const { width: borderWidth, height: borderHeight } = boxChar.outterSize;
                const rotateX = drawOffset + borderWidth / 2, rotateY = pendding + borderHeight / 2;
                _.canvasRotate(ctx, angle - 3, rotateX, rotateY);
                ctx.fillStyle = COLORS.BLACK;
                ctx.fillRect(drawOffset, pendding, borderWidth, borderHeight);

                _.canvasRotate(ctx, 2, rotateX, rotateY);
                const bgScale = 0.85;
                const bgWidth = borderWidth * bgScale, bgHeight = borderHeight * bgScale;
                const bgLeft = drawOffset + (borderWidth - bgWidth) / 2, bgTop = pendding + (borderHeight - bgHeight) / 2;
                ctx.fillStyle = COLORS.RED;
                ctx.fillRect(bgLeft, bgTop, bgWidth, bgHeight);

                _.canvasRotate(ctx, 1, rotateX, rotateY);
                const textLeft = drawOffset + (borderWidth - width) / 2 - left, textTop = pendding + (canvasHeight - height) / 2 - top;
                ctx.fillStyle = color;
                ctx.font = boxChar.font;
                ctx.fillText(char, textLeft, textTop);

                drawOffset += boxChar.outterSize.width + gutter;
            } else {
                const { width: bgWidth, height: bgHeight } = boxChar.outterSize;

                const rotateX = drawOffset + bgWidth / 2, rotateY = pendding + bgHeight / 2;
                _.canvasRotate(ctx, angle + 1, rotateX, rotateY);
                ctx.fillStyle = COLORS.BLACK;
                ctx.fillRect(drawOffset, pendding + (canvasHeight - bgHeight) / 2, bgWidth, bgHeight);

                const textLeft = drawOffset + (bgWidth - width) / 2 - left, textTop = pendding + (canvasHeight - height) / 2 - top;
                _.canvasRotate(ctx, -1, rotateX, rotateY);
                ctx.fillStyle = color;
                ctx.font = boxChar.font;
                ctx.fillText(char, textLeft, textTop);

                drawOffset += boxChar.outterSize.width + gutter;
            }

            ctx.restore();
        }
    }
}
