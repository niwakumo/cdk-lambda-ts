import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';

const PREFIX = 'cdk-lambda-ts-awsman';
const REPOSITORY_TOP = path.join(__dirname, '../');

export class CdkLambdaTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, `${PREFIX}-bucket`, {
      bucketName: PREFIX,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const resizeLambda = new NodejsFunction(this, `${PREFIX}-lambda-resize`, {
      functionName: `${PREFIX}-resize`,
      entry: path.join(REPOSITORY_TOP, 'lambdas/resize/src/index.ts'), // エントリーポイントとして、index.tsを指定
      handler: 'handler', // ハンドラーとして、index.tsのhandlerを指定
      runtime: lambda.Runtime.NODEJS_20_X, // 実行環境としてNode.js 20.xを指定
      timeout: cdk.Duration.seconds(30), // タイムアウトの指定(30秒)
    })
  }
}
