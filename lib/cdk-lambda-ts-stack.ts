import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';

const PREFIX = 'cdk-lambda-ts-awsman';
const REPOSITORY_TOP = path.join(__dirname, '../');

export class CdkLambdaTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // バケットの作成
    const bucket = new s3.Bucket(this, `${PREFIX}-bucket`, {
      bucketName: PREFIX,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // リサイズ用のLambda関数の作成
    const resizeLambda = new NodejsFunction(this, `${PREFIX}-lambda-resize`, {
      functionName: `${PREFIX}-resize`,
      entry: path.join(REPOSITORY_TOP, 'lambdas/resize/src/index.ts'), // エントリーポイントとして、index.tsを指定
      handler: 'handler', // ハンドラーとして、index.tsのhandlerを指定
      runtime: lambda.Runtime.NODEJS_20_X, // 実行環境としてNode.js 20.xを指定
      timeout: cdk.Duration.seconds(30), // タイムアウトの指定(30秒)
    });

    // Lambdaに権限を追加
    bucket.grantPut(resizeLambda); // resizeLambdaにバケットへのPut権限を付与
    bucket.grantReadWrite(resizeLambda); // resizeLambdaにバケットへの読み書き権限を付与

    // Lambdaをバケットのイベントから起動するための設定
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED, // イベントの種類をオブジェクト作成時に指定
      new LambdaDestination(resizeLambda), // イベント発生時に起動するLambda関数を指定
      { prefix: 'original/' }, // original/ で始まるオブジェクトが作成された場合にイベントを発生させる(フォルダ作成時もイベントが発生する)
    )
  }
}
