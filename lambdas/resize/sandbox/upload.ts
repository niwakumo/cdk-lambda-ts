import jimp from 'jimp';
import path from 'path';
import 'dotenv/config';
import { S3Client, PutObjectCommand, PutObjectCommandInput, } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.BUCKET_NAME;
const REPOSITORY_TOP = path.resolve(__dirname, '../../../');

async function main() {
    const s3Client = new S3Client();
    const imagePath = path.join(REPOSITORY_TOP, 'images/kadomatsu.jpg');
    console.log(`reading an image from: ${imagePath}`);

    const image = await jimp.read(imagePath); // 画像の読み込み

    // 画像のMIME(.jpg, .png, .gifなど)
    const mime = image.getMIME();

    // 入力のBodyに指定するイメージバッファの取得
    const imageBuffer = await image.getBufferAsync(mime);

    // ファイルをアップロードするための入力
    const putInput: PutObjectCommandInput = {
        Bucket: BUCKET_NAME,
        Key: 'tmp/kadomatsu.jpg',
        Body: imageBuffer,
    };

    // ファイルをアップロードするためのコマンド
    const putCommand = new PutObjectCommand(putInput);

    // ファイルをアップロードする(非同期)
    const result = await s3Client.send(putCommand);

    console.log(result);

}

main();