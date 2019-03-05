import * as _ from '../utils';
import IBoxChar, { CHAR_MODE, COLORS } from './IBoxChar';

const MAX_ANGLE = 10;

export default class BoxChar implements IBoxChar {
    char = '';
    fontSize = 0;
    width = 0;
    height = 0;
    left = 0;
    top = 0;
    angle = 0;
    scale = 0;
    mode = CHAR_MODE.WHITE;
    color = COLORS.WHITE;

    constructor(char: string, mode: CHAR_MODE, fontSize = 60, fontFamily = 'sans-serif') {
        this.char = char;
        this.mode = mode;
        
        const angle = -(Math.round(Math.random() * 10) % MAX_ANGLE)
        if (mode == CHAR_MODE.FIRST) {
            this.scale = 1.2;
            this.fontSize = fontSize * this.scale;
            this.angle = angle;
        } else {
            this.scale = 1 - Math.floor(Math.random() * 10) % 3 / 10;
            this.angle = angle * _.randomOp();
            this.fontSize = fontSize * this.scale;
        }
        
        if (mode == CHAR_MODE.RED) {
            this.color = COLORS.RED;
        }
        const { width, height, top, left } = _.getCharSize(char, this.fontSize, this.color, fontFamily, 'bold');
        this.width = width;
        this.height = height;
        this.top = top;
        this.left = left;
    }
}
