export function getCanvasAndContext(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Failed to create canvas');
    }
    return { canvas, context };
}

export function getCharSize(char: string, fontSize: number, fontFamily = 'sans-serif', fontWeight = 'normal') {
    const { context: ctx } = getCanvasAndContext(fontSize, fontSize);

    const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillText(char, 0, 0);

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
    
    const width = right - left, height = bottom - top;
    return {
        top,
        left,
        width,
        height
    };
}

export function randomOp() {
    return Math.floor(Math.random() * 10) % 2 ? 1 : -1;
}

export function canvasRotate(context: CanvasRenderingContext2D, angle: number, x: number, y: number) {
    context.translate(x, y);
    context.rotate(Math.PI * angle / 180);
    context.translate(-x, -y);
}
