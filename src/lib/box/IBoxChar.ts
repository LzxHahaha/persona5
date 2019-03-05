export enum COLORS {
    RED = '#DA4C23',
    WHITE = '#FDFDFD',
    BLACK = '#0F0F0F',
};

export enum CHAR_MODE {
    FIRST = 1,
    WHITE = 2,
    RED = 3,
    SPACE = 4,
};

export default interface IBoxChar {
    char: string,
    fontSize: number,
    mode: CHAR_MODE
}
