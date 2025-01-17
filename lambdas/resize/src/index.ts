import { S3Handler, SQSHandler, S3Event } from 'aws-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { getImageFromS3, putImageToS3 } from '../../common/src/index';
import { S3Message } from '../../common/src/types';
import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs';

const PROCESS = 'resize';
const QUEUE_URL = process.env.QUEUE_URL;

export const handler: S3Handler = async (event: S3Event) => {
    // null, 2は整形のための引数
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);

    const s3Client = new S3Client();

    for (const record of event.Records) {

        // 1. ダウンロード処理

        const bucketName = record.s3.bucket.name;
        const key = record.s3.object.key;

        // 画像ファイルをS3からダウンロード
        const image = await getImageFromS3(s3Client, bucketName, key);

        // 2. リサイズ処理

        const width = image.getWidth(); // 画像の幅
        const height = image.getHeight(); // 画像の高さ
        console.log(`original size: (${width}, ${height})`);
    
        const resizedWidth = Math.floor(width / 2);
        const resizedHeight = Math.floor(height / 2);
        console.log(`${PROCESS}: (${resizedWidth}, ${resizedHeight})`);
    
        image.resize(resizedWidth, resizedHeight); // リサイズ
    
        // 3. アップロード処理
        // 画像のMIME(.jpg, .png, .gifなど)
        const mime = image.getMIME();

        // 入力のBodyに指定するイメージバッファの取得
        const imageBuffer = await image.getBufferAsync(mime);

        // パースしたキー
        const parsedKey = path.parse(key);

        // パースしたキーからファイル名を生成
        const uploadKey = `${PROCESS}/${parsedKey.name}-${PROCESS}${parsedKey.ext}`
        
        //  ファイルをS3にアップロード
        await putImageToS3(s3Client, bucketName, uploadKey, imageBuffer);

        // 4. SQSにメッセージを送信
        // bucketNameとuploadKeyをSQSに送信
        const s3Message: S3Message = {bucketName, key: uploadKey};

        // SQSクライアント
        const sqsClient = new SQSClient();

        // SQSコマンドの入力
        const input: SendMessageCommandInput = {
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(s3Message)
        };

        // SQSコマンド
        const command: SendMessageCommand = new SendMessageCommand(input);

        // SQSメッセージの送信
        await sqsClient.send(command);

        console.log(`sent the message to SQS, message: ${JSON.stringify(s3Message)}`);

    }

}