import jimp from 'jimp';
import path from 'path';

const REPOSITORY_TOP = path.resolve(__dirname, '../../../');

async function main() {
    // 1. 画像の読み込み
    const imagePath = path.join(REPOSITORY_TOP, 'images/kadomatsu.jpg');
    console.log(`reading an image from: ${imagePath}`);

    const image = await jimp.read(imagePath); // 画像の読み込み

    // 2. グレースケール化
    image.grayscale(); // グレースケール化
    image.write("grayscale.png"); // グレースケールした画像を保存
}

main();