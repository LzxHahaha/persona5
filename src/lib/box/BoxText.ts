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
    private gutter = 5;
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
        let drawOffset = 0.15 * canvasWidth;
        canvasHeight = (canvasHeight + pendding * 2) * 1.3;
        canvasWidth *= 1.3;

        canvas.height = canvasHeight;
        canvas.width = canvasWidth;

        ctx.fillStyle = COLORS.BLACK;
        ctx.textBaseline = 'top';

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
                ctx.fillRect(drawOffset, (canvasHeight - borderHeight) / 2, borderWidth, borderHeight);

                _.canvasRotate(ctx, 2, rotateX, rotateY);
                const bgScale = 0.85;
                const bgWidth = borderWidth * bgScale, bgHeight = borderHeight * bgScale;
                const bgLeft = drawOffset + (borderWidth - bgWidth) / 2, bgTop = (canvasHeight - bgHeight) / 2;
                ctx.fillStyle = COLORS.RED;
                ctx.fillRect(bgLeft, bgTop, bgWidth, bgHeight);

                _.canvasRotate(ctx, 1, rotateX, rotateY);
                const textLeft = drawOffset + (borderWidth - width) / 2 - left, textTop = (canvasHeight - height) / 2 - top;
                ctx.fillStyle = color;
                ctx.font = boxChar.font;
                ctx.fillText(char, textLeft, textTop);

                drawOffset += boxChar.outterSize.width + gutter;
            } else {
                const { width: bgWidth, height: bgHeight } = boxChar.outterSize;

                const rotateX = drawOffset + bgWidth / 2, rotateY = pendding + bgHeight / 2;
                _.canvasRotate(ctx, angle + 1, rotateX, rotateY);
                ctx.fillStyle = COLORS.BLACK;
                ctx.fillRect(drawOffset, (canvasHeight - bgHeight) / 2, bgWidth, bgHeight);

                const textLeft = drawOffset + (bgWidth - width) / 2 - left, textTop = (canvasHeight - height) / 2 - top;
                _.canvasRotate(ctx, -1, rotateX, rotateY);
                ctx.fillStyle = color;
                ctx.font = boxChar.font;
                ctx.fillText(char, textLeft, textTop);

                drawOffset += boxChar.outterSize.width + gutter;
            }

            ctx.restore();
        }

        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3]) {
                imageData.data[i] = 0;
                imageData.data[i + 1] = 255;
                imageData.data[i + 2] = 255;
                imageData.data[i + 3] = 255;
            }
        }
        const { canvas: borderCanvas, context: borderCtx } = _.getCanvasAndContext(canvasWidth, canvasHeight);
        borderCtx.putImageData(imageData, 0, 0);
        document.body.appendChild(borderCanvas);
        const borderImg = new Image();
        borderImg.src = borderCanvas.toDataURL();

        ctx.save();
        ctx.globalCompositeOperation = '';
        ctx.scale(2, 2);
        ctx.drawImage(borderImg, 0, 0);
        ctx.restore();
    }
}
