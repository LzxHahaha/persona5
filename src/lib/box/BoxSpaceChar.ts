import IBox, { CHAR_MODE } from './IBoxChar';

export default class BoxSpaceChar implements IBox {
    char = ' ';
    fontSize = 0;
    mode = CHAR_MODE.SPACE;

    constructor(fontSize = 60) {
        this.fontSize = fontSize;
    }
}
