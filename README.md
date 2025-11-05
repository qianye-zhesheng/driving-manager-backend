# driving-manager

## 概要

運行管理アプリ Driving Managerのバックエンド。  
AWS Serverless Application Model (AWS SAM)で実装されている。  
RuntimeはNode.jsを使用している。

## 環境構築

### 必要なもの

* Visual Studio Code
* Docker Engine
* Docker Compose

### ソースの準備

```bash
git clone git@github.com:qianye-zhesheng/driving-manager-backend.git
cd driving-manager-backend
docker compose up -d
docker compose exec dev bash
npm install
```

### AWSへのログインの初期設定

[公式マニュアル](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)  
AWSのAdministratorAccessの許可セットが割り当てられたユーザーを使用する。  
AWS access portalにて、「アクセスキー」のリンクをクリックすると、SSO start URLとSSO regionが確認できる。  
それを以下のダイアログで入力する。

```bash
aws configure sso --use-device-code
```
```
SSO session name (Recommended): default
SSO start URL [None]: AWS access portalに表示されたもの
SSO region [None]: AWS access portalに表示されたもの
SSO registration scopes [None]: sso:account:access


Default client Region [None]: 普段使っているリージョン
CLI default output format (json if not specified) [None]: json
Profile name [123456789011_ReadOnly]: default
```

## 開発時に毎回やること

```bash
cd driving-manager-backend
docker compose start
docker compose exec dev bash
aws sso login --use-device-code
```

## 単体テスト方法

```bash
npm run test
```

## 結合テスト方法

### テスト環境へのデプロイ

```bash
sam sync --watch
```

ターミナルへの出力結果の最後のほうに、URLが表示される。  
このURLを次項で使用する。  
（URLが`https://xxxx/Prod/`となっているが、問題なし。本番環境はドメイン自体が異なる）

### APIの実行方法

まず、[Driving Managerのフロントエンド側](https://github.com/qianye-zhesheng/driving-manager) の
開発環境を起動させる。  
AWS Cognito経由でログインする。  
F12 開発者ツールを開き、ストレージ > ローカルストレージから、idTokenを探す。  
idTokenの値をコピーし、ターミナルの環境変数に設定する。

```bash
export idToken=コピーした値
```
curlでリクエストを投げる。

```bash
curl -i -X POST \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer ${idToken}" \
 -d '{"content": "sample"}' \
 https://xxxxxxx.execute-api.ap-northeast-3.amazonaws.com/Prod/path/to/api
 ```

ログは以下のようにして取得できる。

```bash
sam logs --tail
```



## 本番リリース方法

```bash
sam build
sam deploy --config-env production
```


## 実装ガイド

### 新しいエンドポイントの追加

`template.yaml`に定義を追加する。

```yaml
Resources:
  samplePostDataFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/sample/post-data.postDataHandler
      Description: save the data
      Policies:
      - DynamoDBWritePolicy:
          TableName: !Ref SampleTable
      Events:
        Api:
          Type: Api
          Properties:
            Path: /sample/post-data
            Method: POST
    Metadata:   
      BuildMethod: esbuild
      BuildProperties:
        Format: esm
        Minify: false
        OutExtension:
          - .js=.mjs
        Target: "es2020"
        Sourcemap: false
        Banner:
          - js=import path from 'path';
            import { fileURLToPath } from 'url';
            import { createRequire as topLevelCreateRequire } from 'module';
            const require = topLevelCreateRequire(import.meta.url);
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
```

`events/sample`に`event-post-data.json`を作り、リクエストパラメーターを定義する。

```json
{
  "httpMethod": "POST",
  "body": "{\"userId\":\"user123\"}"
}
```

`env.json`に、参照するテーブル名の環境変数を定義する。

```json
{
  "samplePostDataFunction": {
    "SAMPLE_TABLE": "<TABLE-NAME>"
  }
}
```

`src/handlers/sample/`以下に、`post-data.ts`を作り、処理を実装する。

```typescript
import type { APIGatewayProxyEvent } from 'aws-lambda'
import type { APIGatewayProxyResult } from 'aws-lambda'
import { CorsHeaders } from '../../config/cors-headers'

export const postAnswerHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // All log statements are written to CloudWatch
  console.info('received:', event)

  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify({ message: 'success' })
    headers: CorsHeaders.get(),
  }

  return result
}
```

### 新しいテーブルの追加

`template.yaml`に以下を追記する。

```yaml

Globals:
  Environment:
    Variables:
    # 以下を追記する
      NEW_RECORDS_TABLE: !Ref NewRecordsTable

Resources:
  NewRecordsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub "${AWS::StackName}-NewRecords"
      AttributeDefinitions:
        - AttributeName: user_id
          AttributeType: S
        - AttributeName: date_number
          AttributeType: N
      KeySchema:
        - AttributeName: user_id
          KeyType: HASH
        - AttributeName: date_number
          KeyType: RANGE
      BillingMode: PAY_PER_REQUEST
      # スループットは必要に応じて増やす。テスト用なら5で十分。
      OnDemandThroughput:
        MaxReadRequestUnits: 5
        MaxWriteRequestUnits: 5

```
