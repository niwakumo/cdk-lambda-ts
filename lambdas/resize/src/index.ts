import { S3Handler, SQSHandler, S3Event } from 'aws-lambda';
import { 
    S3Client, 
    GetObjectCommand, 
    GetObjectCommandInput,
    PutObjectCommand,
    PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import jimp from 'jimp';
import path from 'path';

const DIRECTORY = 'resize';

export const handler: S3Handler = async (event: S3Event) => {
    const s3Client = new S3Client();

    for (const record of event.Records) {
        // 1. ダウンロード処理

        const bucketName = record.s3.bucket.name;
        const key = record.s3.object.key;

        // パースしたキー
        const parsedKey = path.parse(key);

        // ダウンロードするための入力
        const input: GetObjectCommandInput = {
            Bucket: bucketName,
            Key: key,
        }

        console.log(`downloading from s3://$(bucketName)/$(key)`);

        // ダウンロードするためのコマンド
        const command = new GetObjectCommand(input);
        // ダウンロード結果を取得(非同期)
        const result = await s3Client.send(command);

        // ダウンロード結果がない場合はエラー
        if (! result.Body) {
            throw Error('result.Body is undefined !');
        }

        // Bodyからデータを取り出す(非同期)
        const body = await result.Body.transformToByteArray();
        console.log(body);

        // 2. リサイズ処理
        const bodyBuffer = Buffer.from(body); // バイトアレイをバッファに変換
        const image = await jimp.read(bodyBuffer); // 画像の読み込み

        const width = image.getWidth(); // 画像の幅
        const height = image.getHeight(); // 画像の高さ
        console.log(`original size: (${width}, ${height})`);
    
        const resizedWidth = Math.floor(width / 2);
        const resizedHeight = Math.floor(height / 2);
        console.log(`resize: (${resizedWidth}, ${resizedHeight})`);
    
        image.resize(resizedWidth, resizedHeight); // リサイズ
    
        // 3. アップロード処理
        // 画像のMIME(.jpg, .png, .gifなど)
        const mime = image.getMIME();

        // 入力のBodyに指定するイメージバッファの取得
        const imageBuffer = await image.getBufferAsync(mime);

        const uploadKey = `${DIRECTORY}/${parsedKey.name}-resize${parsedKey.ext}` // パースしたキーからファイル名を生成
        // ファイルをアップロードするための入力
        const putInput: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: uploadKey,
            Body: imageBuffer,
        };

        console.log(`uploading to s3://${bucketName}/${uploadKey}`);
        // ファイルをアップロードするためのコマンド
        const putCommand = new PutObjectCommand(putInput);

        // ファイルをアップロードする(非同期)
        const uploadResult = await s3Client.send(putCommand);

        console.log(uploadResult);
    }

}