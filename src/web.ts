import BoxText from './lib/box/BoxText';

export default () => {
    const input = <HTMLInputElement>document.getElementById('input');
    input.value = '女神異聞錄ペルソナ 5';
    const goButton = <HTMLInputElement>document.getElementById('goButton');
    const saveButton = <HTMLInputElement>document.getElementById('saveButton');
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');

    goButton.addEventListener('click', () => {
        const value = (input.value || '').trim();
        if (!value) {
            return;
        }
        const box = new BoxText(value);
        box.draw(canvas);
    });

    saveButton.addEventListener('click', () => {
        const imageURL = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        const a = document.createElement('a');
        a.href = imageURL;
        a.download = `${input.value}.png`;
        a.target = 'blank';
        a.click();
    });
};
