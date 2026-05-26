# あしたの地図 Googleログイン・独自SMTP 設定手順書

## 0. この手順書の目的

この手順書は、ログイン運用を安定させるために次の2つを設定するためのもの。

```text
1. Googleログイン
2. 独自SMTP
```

おすすめの順番は次の通り。

```text
先に Googleログイン
その後 独自SMTP
```

理由:

- Googleログインはメール送信を使わないため、メール送信制限に引っかかりにくい
- ユーザーはGoogleアカウントでログインできる
- 独自SMTPはドメインやDNS設定が必要なので、少し難しい

## 1. いまの状態

現在のアプリは次の状態。

```text
GitHub Pagesで公開済み
Supabase Auth設定済み
メールリンクログイン実装済み
メール送信制限対策として再送クールダウン実装済み
Googleログインボタン実装済み
```

ただし、GoogleログインはSupabaseとGoogle Cloudの設定が完了するまで動かない。

## 2. Googleログインの全体像

Googleログインでは次の3者が関係する。

```text
ユーザー
  ↓
あしたの地図
  ↓
Supabase
  ↓
Google
```

設定で必要なもの:

```text
Google Cloudで作る Client ID
Google Cloudで作る Client Secret
Supabase側のGoogle Provider設定
SupabaseのCallback URL
```

## 3. Googleログイン Step 1: SupabaseのCallback URLを確認する

### 3.1 操作

Supabaseで次を開く。

```text
Authentication
  → Providers
  → Google
```

そこに `Callback URL` または `Redirect URL` が表示される。

多くの場合、次の形。

```text
https://ebxcugqlblnkicnivswe.supabase.co/auth/v1/callback
```

このURLをコピーする。

## 4. Googleログイン Step 2: Google CloudでOAuth画面を設定する

### 4.1 Google Cloud Consoleを開く

```text
https://console.cloud.google.com/
```

### 4.2 プロジェクトを作る

1. 画面上部のプロジェクト選択を開く
2. `New Project` を押す
3. 名前を入力

```text
ashita-no-chizu
```

4. 作成する

### 4.3 OAuth同意画面を設定

Google Cloudで次を開く。

```text
APIs & Services
  → OAuth consent screen
```

入力例:

```text
App name:
  あしたの地図

User support email:
  自分のメールアドレス

Developer contact information:
  自分のメールアドレス
```

最初はテスト公開でよい。

## 5. Googleログイン Step 3: OAuth Client IDを作る

Google Cloudで次を開く。

```text
APIs & Services
  → Credentials
  → Create Credentials
  → OAuth client ID
```

### 5.1 Application type

```text
Web application
```

### 5.2 Name

```text
あしたの地図 Web
```

### 5.3 Authorized JavaScript origins

次を追加する。

```text
https://japanlimited.github.io
```

ローカルでもテストする場合は次も追加する。

```text
http://localhost:4173
http://127.0.0.1:4173
```

### 5.4 Authorized redirect URIs

SupabaseのGoogle Provider画面に表示されていたCallback URLを追加する。

```text
https://ebxcugqlblnkicnivswe.supabase.co/auth/v1/callback
```

### 5.5 作成後に出るもの

作成すると次の2つが表示される。

```text
Client ID
Client Secret
```

この2つをSupabaseに入力する。

Client Secretは公開しない。

## 6. Googleログイン Step 4: SupabaseにClient ID / Secretを設定する

Supabaseで次を開く。

```text
Authentication
  → Providers
  → Google
```

設定する。

```text
Enable Google:
  ON

Client ID:
  Google Cloudで作ったClient ID

Client Secret:
  Google Cloudで作ったClient Secret
```

保存する。

## 7. Googleログイン Step 5: テストする

公開URLを開く。

```text
https://japanlimited.github.io/ashita-no-chizu/
```

操作:

```text
ログインして同期
  → Googleでログイン
  → Googleアカウント選択
  → あしたの地図へ戻る
```

成功すると、アプリにログイン中のメールアドレスが表示される。

## 8. 独自SMTPの全体像

独自SMTPは、Supabase標準メールではなく、自分で用意したメール送信サービスからログインメールを送る設定。

必要なもの:

```text
独自ドメイン
メール送信サービス
DNS設定
SMTP情報
SupabaseのSMTP設定
```

初心者向けには `Resend` が比較的わかりやすい。

## 9. 独自SMTPを今すぐやるべきか

今すぐ必須ではない。

おすすめの判断:

```text
公開テスト中:
  Googleログイン優先

身内テスト中:
  Googleログイン + メールリンク予備

一般公開前:
  独自SMTPを設定
```

独自SMTPにはドメインが必要になるため、独自ドメインを取る段階で一緒に進めるのがおすすめ。

## 10. 独自SMTP Step 1: メール送信サービスを選ぶ

候補:

```text
Resend
SendGrid
Mailgun
Amazon SES
Postmark
Brevo
```

最初はResend推奨。

## 11. 独自SMTP Step 2: 独自ドメインを用意する

例:

```text
ashitanochizu.com
```

送信元メール例:

```text
no-reply@ashitanochizu.com
```

## 12. 独自SMTP Step 3: DNS設定をする

メール送信サービス側で表示されるDNSレコードを、ドメイン管理画面に設定する。

主に使うもの:

```text
SPF
DKIM
DMARC
```

これはメールが迷惑メール扱いされにくくするために必要。

## 13. 独自SMTP Step 4: SupabaseにSMTP情報を入れる

Supabaseで次を開く。

```text
Authentication
  → SMTP Settings
```

入力するもの:

```text
SMTP Host
SMTP Port
SMTP User
SMTP Password
Sender Name
Sender Email
```

保存後、メールリンク送信をテストする。

## 14. 次にやること

まずGoogleログインを進める。

```text
1. SupabaseのGoogle Provider画面を開く
2. Callback URLを確認する
3. Google CloudでOAuth Client IDを作る
4. SupabaseにClient ID / Secretを入れる
5. 公開URLでGoogleログインをテストする
```

## 15. 参考公式ドキュメント

- Supabase Google Login: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase Custom SMTP: https://supabase.com/docs/guides/auth/auth-smtp
