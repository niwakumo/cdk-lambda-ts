import 'dotenv/config';
import { S3Client, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.BUCKET_NAME;

async function main() {
    const s3Client = new S3Client();
    const key = 'original/kadomatsu.jpg'; // ダウンロードするファイル

    // ダウンロードするための入力
    const input: GetObjectCommandInput = {
        Bucket: BUCKET_NAME,
        Key: key,
    }
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


}

main();