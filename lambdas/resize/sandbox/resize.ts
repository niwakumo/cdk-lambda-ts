import jimp from 'jimp';
import path from 'path';

const REPOSITORY_TOP = path.resolve(__dirname, '../../../');

async function main() {
    const imagePath = path.join(REPOSITORY_TOP, 'images/kadomatsu.jpg');
    console.log(`reading an image from: ${imagePath}`);

    const image = await jimp.read(imagePath); // 画像の読み込み

    const width = image.getWidth(); // 画像の幅
    const height = image.getHeight(); // 画像の高さ
    console.log(`original size: (${width}, ${height})`);

    const resizedWidth = Math.floor(width / 2);
    const resizedHeight = Math.floor(height / 2);
    console.log(`resize: (${resizedWidth}, ${resizedHeight})`);

    image.resize(resizedWidth, resizedHeight); // リサイズ
    image.write("resized.png"); // リサイズした画像を保存
}

main();