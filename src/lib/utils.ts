function getCanvasAndContext(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Failed to create canvas');
    }
    return { canvas, context };
}

export function textToImage(char: string, fontSize: number, color: string, fontFamily = 'sans-serif', fontWeight = 'normal') {
    const { canvas, context: ctx } = getCanvasAndContext(fontSize, fontSize);

    const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    // 要真有宽度超过的就压一压
    ctx.fillText(char, 0, 0, fontSize);

    let count = 0;
    let left = -1, right = fontSize, top = -1, bottom = fontSize;
    const imageData = ctx.getImageData(0, 0, fontSize, fontSize).data;

    // 遍历像素找包围盒
    for (let i = 0; i < fontSize && count < 4; ++i) {
        for (let j = 0; j < fontSize && count < 4; ++j) {
            const topIndex = (i * fontSize + j) * 4;
            const leftIndex = (i + j * fontSize) * 4;
            if (top < 0 && imageData[topIndex + 3]) {
                top = i;
                ++count;
            }
            if (left < 0 && imageData[leftIndex + 3]) {
                left = i;
                ++count;
            }
            if (bottom == fontSize && imageData[imageData.length - topIndex - 1]) {
                bottom = fontSize - i;
                ++count;
            }
            if (imageData[imageData.length - leftIndex - 1]) {
                right = fontSize - i;
                ++count;
            }
        }
    }
    
    // TODO: 不要转成图片，改成返回 { height, width, top, left }
    const textWidth = right - left, textHeight = bottom - top;
    const { canvas: cutCanvas, context: cutCtx } = getCanvasAndContext(textWidth, textHeight);
    const cutImg = new Image();
    cutImg.src = canvas.toDataURL();
    cutCtx.drawImage(cutImg, left, top, textWidth, textHeight, 0, 0, textWidth, textHeight);
    
    const resImage = new Image();
    resImage.src = cutCanvas.toDataURL();
    return {
        image: resImage,
        width: textWidth,
        height: textHeight
    };
}

export function randomOp() {
    return Math.floor(Math.random() * 10) % 2 ? 1 : -1;
}

export function canvasRotate(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, angle: number) {
    const x = canvas.width / 2, y = canvas.height / 2;
    context.translate(x, y);
    context.rotate(Math.PI * angle / 180);
    context.translate(-x, -y);
}
