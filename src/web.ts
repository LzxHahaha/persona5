import BoxText from './lib/box/BoxText';

export default () => {
    const input = <HTMLInputElement>document.getElementById('input');
    input.value = 'ABCD';
    const goButton = <HTMLInputElement>document.getElementById('goButton');
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');

    goButton.addEventListener('click', (e: Event) => {
        const value = (input.value || '').trim();
        if (!value) {
            return;
        }
        const box = new BoxText(value);
        box.draw(canvas);
    });
};
