import { SQSHandler, SQSEvent } from 'aws-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { getImageFromS3, putImageToS3 } from '../../common/src/index';
import { S3Message } from '../../common/src/types';

const PROCESS = 'grayscale';

export const handler: SQSHandler = async (event: SQSEvent) => {
    // null, 2は整形のための引数
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);

    const s3Client = new S3Client();

    for (const record of event.Records) {

        // 1. ダウンロード処理

        // bodyをパースして、バケット名とキーを取得
        const message = record.body;
        const s3Message: S3Message = JSON.parse(message);

        const bucketName = s3Message.bucketName;
        const key = s3Message.key;

        // 画像ファイルをS3からダウンロード
        const image = await getImageFromS3(s3Client, bucketName, key);

        // 2. グレースケール化処理
        console.log(`${PROCESS} the image for ${key}`);
        image.grayscale();
    
        // 3. アップロード処理
        // 画像のMIME(.jpg, .png, .gifなど)
        const mime = image.getMIME();

        // 入力のBodyに指定するイメージバッファの取得
        const imageBuffer = await image.getBufferAsync(mime);

        // パースしたキー
        const parsedKey = path.parse(key);

        // パースしたキーからファイル名を生成
        const uploadKey = `${PROCESS}/${parsedKey.name}-${PROCESS}${parsedKey.ext}`
        
        //  ファイルをアップロード
        await putImageToS3(s3Client, bucketName, uploadKey, imageBuffer);

    }

}