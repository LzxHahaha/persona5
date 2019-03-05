import * as _ from '../utils';
import IBoxChar, { CHAR_MODE, COLORS } from './IBoxChar';
import BoxSpaceChar from './BoxSpaceChar';
import BoxChar from './BoxChar';

interface BoxTextOptions {
    fontSize?: number,
    fontFamily?: string
}

export default class BoxText {
    private chars: Array<IBoxChar> = [];
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
            if (/^\s$/.test(char)) {
                this.chars.push(new BoxSpaceChar(this.fontSize));
            } else {
                this.chars.push(new BoxChar(char, modes[index], this.fontSize));
            }
        }
    }

    draw(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create canvas');
        }

        const pendding = 10;
        
        let canvasWidth = pendding * 2, canvasHeight = 0;
        // TODO: 修正宽高计算
        for (const boxChar of this.chars) {
            if (boxChar instanceof BoxChar) {
                let { width, height, scale, angle } = boxChar;
                width *= scale;
                height *= scale;
                canvasWidth += width;
                canvasHeight = Math.max(canvasHeight, height);
                
                // const sin = Math.abs(Math.sin(angle)), cos = Math.abs(Math.cos(angle));
                // const charWidth = width * cos + height * sin;
                // const charHeight = height * cos + width * sin;
                // canvasWidth += charWidth;
                // canvasHeight = Math.max(canvasHeight, charHeight);
            } else {
                canvasWidth += boxChar.fontSize / 2;
            }
        }

        canvas.height = canvasHeight * 2;
        canvas.width = canvasWidth * 2;

        ctx.font = this.font;
        ctx.fillStyle = COLORS.BLACK;
        ctx.textBaseline = 'top';
        ctx.font = this.font;

        // TODO: 修正边框计算
        let drawOffset = pendding;
        for (const boxChar of this.chars) {
            ctx.save();

            if (boxChar instanceof BoxChar) {
                let { char, top, left, width, height, angle, scale, mode, color } = boxChar;
                ctx.scale(scale, scale);
                
                if (mode == CHAR_MODE.FIRST) {
                    _.canvasRotate(ctx, angle - 3);
                    const borderWidth = width * scale, borderHeight = height * scale;
                    ctx.fillStyle = COLORS.BLACK;
                    ctx.fillRect(drawOffset, pendding, borderWidth, borderHeight);

                    _.canvasRotate(ctx, 1.5);
                    const bgScale = scale * 0.85;
                    const bgWidth = width * bgScale, bgHeight = height * bgScale;
                    const bgLeft = drawOffset + (borderWidth - bgWidth) / 2, bgTop = pendding + (borderHeight - bgHeight) / 2;
                    ctx.fillStyle = COLORS.RED;
                    ctx.fillRect(bgLeft, bgTop, bgWidth, bgHeight);

                    _.canvasRotate(ctx, 1.5);
                    const textLeft = drawOffset + (borderWidth - width) - left, textTop = pendding + borderHeight - height - top;
                    ctx.fillStyle = color;
                    ctx.fillText(char, textLeft, textTop);

                    _.canvasRotate(ctx, -angle);
                    drawOffset += borderWidth * scale;
                } else {
                    const topOffset = canvasHeight / 2 ;

                    _.canvasRotate(ctx, angle);
                    const bgWidth = width * 1.2, bgHeight = height * 1.2;
                    ctx.fillStyle = COLORS.BLACK;
                    ctx.fillRect(drawOffset, topOffset, bgWidth, bgHeight);

                    const textLeft = drawOffset + (bgWidth - width) / 2 - left, textTop = topOffset + (bgWidth - height) / 2 - top;
                    ctx.fillStyle = color;
                    ctx.fillText(char, textLeft, textTop);

                    _.canvasRotate(ctx, -angle);
                    drawOffset += bgWidth * 1.2;
                }
            } else {
                drawOffset += boxChar.fontSize / 2;
            }

            ctx.restore();
        }
    }
}
