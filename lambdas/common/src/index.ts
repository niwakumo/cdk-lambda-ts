import { 
    S3Client, 
    GetObjectCommand, 
    GetObjectCommandInput,
    PutObjectCommand,
    PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import jimp from 'jimp';

export async function getImageFromS3(s3Client: S3Client, bucketName: string, key: string) {
    // ダウンロードするための入力
    const input: GetObjectCommandInput = {
        Bucket: bucketName,
        Key: key,
    }

    console.log(`downloading from s3://${bucketName}/${key}`);

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

    const bodyBuffer = Buffer.from(body); // バイトアレイをバッファに変換
    const image = await jimp.read(bodyBuffer); // 画像の読み込み

    return image;

};

export async function putImageToS3(s3Client: S3Client, bucketName: string, key: string, imageBuffer: Buffer) {
    // ファイルをアップロードするための入力
    const putInput: PutObjectCommandInput = {
        Bucket: bucketName,
        Key: key,
        Body: imageBuffer,
    };

    console.log(`uploading to s3://${bucketName}/${key}`);
    // ファイルをアップロードするためのコマンド
    const putCommand = new PutObjectCommand(putInput);

    // ファイルをアップロードする(非同期)
    const uploadResult = await s3Client.send(putCommand);

    console.log(uploadResult);

    return uploadResult;

};
