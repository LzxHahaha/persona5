export function getCharWidth(char: string, font: string): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to create canvas');
    }

    ctx.font = font;
    const textMetrics = ctx.measureText(char);
    return textMetrics.width;
}

export function getCharSize(char: String, font: string) {
    const res = { height: 0, width: 0 };
    // TODO: 遍历像素找包围盒
    return res;
}

export function randomOp() {
    return 1;
    // return Math.floor(Math.random() * 10) % 2 ? 1 : -1;
}

export function canvasRotate(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, angle: number) {
    // const x = canvas.width / 2, y = canvas.height / 2;
    // context.translate(x, y);
    context.rotate(Math.PI * angle / 180);
    // context.translate(-x, -y);
}
