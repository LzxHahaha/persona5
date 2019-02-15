function isEmpty(text: string): boolean {
    return text === ' ';
}

function generateBackground(text: string): boolean[] {
    const max = Math.floor(text.length / 6) + (Math.random() * 10 % 2);
    const background: boolean[] = new Array(text.length).fill(false);
    for (let i = 0, count = 0; i < text.length && count < max; ++i) {
        if (Math.random() * 10 % 4 === 0 && !isEmpty(text[i])) {
            background[i] = true;
            ++count;
            i += 2;
        }
    }

    return background;
}

function generateAngle(text: string): number[] {
    const angle: number[] = [];

    return angle;
}
