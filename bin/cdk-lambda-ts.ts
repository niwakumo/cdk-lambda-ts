#!/usr/local/opt/node/bin/node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { CdkLambdaTsStack } from '../lib/cdk-lambda-ts-stack';

const app = new cdk.App();
new CdkLambdaTsStack(app, 'CdkLambdaTsStack', {
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.AWS_REGION
  }
});