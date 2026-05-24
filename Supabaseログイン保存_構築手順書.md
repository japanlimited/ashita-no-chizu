# あしたの地図 Supabaseログイン・クラウド保存 構築手順書

## 0. 方針

この手順書では、公開済みの「あしたの地図」に次の機能を追加する。

```text
ログイン
クラウド保存
別端末からの診断結果表示
診断履歴
ログアウト
クラウド保存データ削除
```

最初の構成は次の通り。

```text
公開:
  GitHub Pages

ログイン:
  Supabase Auth

保存:
  Supabase Database

セキュリティ:
  Row Level Security
```

Supabaseの公開用キーはブラウザに置けるが、秘密キーやservice_roleキーは絶対に置かない。

## 1. 全体の作業順

```text
Step 1. Supabaseアカウントを作る
Step 2. Supabaseプロジェクトを作る
Step 3. Project URL と publishable key を確認する
Step 4. AuthのURL設定を行う
Step 5. データベーステーブルを作る
Step 6. Row Level Securityを設定する
Step 7. アプリ側にSupabase接続設定を追加する
Step 8. ログイン画面を追加する
Step 9. 診断結果をクラウド保存する
Step 10. ログイン後にクラウドから読み込む
Step 11. GitHub Pagesへ再公開する
Step 12. PCとスマホで同期確認する
```

## 2. Step 1: Supabaseアカウントを作る

### 2.1 アクセス

```text
https://supabase.com/
```

### 2.2 操作

1. `Start your project` または `Sign in` を押す
2. GitHubアカウントでログインする
3. Supabaseのダッシュボードが表示されることを確認する

GitHubログインを使うと、GitHub Pagesで公開している今回のプロジェクトと管理しやすい。

## 3. Step 2: Supabaseプロジェクトを作る

### 3.1 操作

1. Supabaseダッシュボードで `New project` を押す
2. Organizationを選ぶ
3. Project nameを入力する

推奨:

```text
ashita-no-chizu
```

4. Database Passwordを作る
5. Regionを選ぶ

推奨:

```text
Northeast Asia / Tokyo
```

近いリージョンがなければ、JapanまたはAsia系の近い地域を選ぶ。

6. `Create new project` を押す
7. プロジェクト作成完了まで数分待つ

### 3.2 注意

Database Passwordは管理用なので、アプリの画面やGitHubに書かない。

## 4. Step 3: Project URL と publishable key を確認する

### 4.1 操作

Supabaseプロジェクト画面で次を開く。

```text
Project Settings
  → API Keys
```

または `Connect` ダイアログから確認する。

### 4.2 必要な値

アプリに使うのは次の2つ。

```text
Project URL
Publishable key
```

重要:

```text
Publishable key:
  ブラウザに置いてよい

Secret key / service_role:
  ブラウザに置いてはいけない
  GitHubに置いてはいけない
```

Supabase公式ドキュメントでも、publishable keyはWebページ等に公開できる低権限キー、secret keyはバックエンド専用の高権限キーとして説明されている。

## 5. Step 4: AuthのURL設定を行う

### 5.1 操作

Supabaseプロジェクト画面で次を開く。

```text
Authentication
  → URL Configuration
```

### 5.2 Site URL

次を設定する。

```text
https://japanlimited.github.io/ashita-no-chizu/
```

### 5.3 Redirect URLs

次を追加する。

```text
https://japanlimited.github.io/ashita-no-chizu/
http://127.0.0.1:4173/index.html
http://localhost:4173/index.html
```

理由:

- GitHub Pages公開版でログイン後に戻るため
- ローカル開発版でもログイン確認できるようにするため

## 6. Step 5: データベーステーブルを作る

Supabaseプロジェクト画面で次を開く。

```text
SQL Editor
```

次のSQLを実行する。

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  age_group text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diagnosis_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.diagnosis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  diagnosis_answer_id uuid references public.diagnosis_answers(id) on delete cascade,
  current_state text not null,
  values jsonb not null default '[]'::jsonb,
  strength_seeds jsonb not null default '[]'::jsonb,
  concerns jsonb not null default '[]'::jsonb,
  future_direction text not null,
  one_year_goal text not null,
  three_month_goal text not null,
  monthly_theme text not null,
  tomorrow_step text not null,
  support_message text not null,
  caution_note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  monthly_theme text,
  tomorrow_step text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 7. Step 6: Row Level Securityを設定する

続けてSQL Editorで次を実行する。

```sql
alter table public.profiles enable row level security;
alter table public.diagnosis_answers enable row level security;
alter table public.diagnosis_results enable row level security;
alter table public.user_goals enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = id);

create policy "answers_select_own"
on public.diagnosis_answers
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "answers_insert_own"
on public.diagnosis_answers
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "answers_delete_own"
on public.diagnosis_answers
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "results_select_own"
on public.diagnosis_results
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "results_insert_own"
on public.diagnosis_results
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "results_update_own"
on public.diagnosis_results
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "results_delete_own"
on public.diagnosis_results
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "goals_select_own"
on public.user_goals
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "goals_insert_own"
on public.user_goals
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "goals_update_own"
on public.user_goals
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "goals_delete_own"
on public.user_goals
for delete
to authenticated
using ((select auth.uid()) = user_id);
```

## 8. Step 7以降: アプリ実装

ここからはCodexで実装する。

実装順:

```text
1. Supabase JS読み込みを追加
2. Supabase接続設定ファイルを追加
3. ログイン画面を追加
4. ログイン状態表示を追加
5. クラウド保存処理を追加
6. クラウド読み込み処理を追加
7. LocalStorageからクラウドへの移行処理を追加
8. 診断履歴画面を追加
9. データ削除をLocalStorageとSupabase両対応にする
10. 公開URLでログインテスト
```

## 9. 完了条件

```text
[ ] Supabaseプロジェクトがある
[ ] Project URLを確認した
[ ] Publishable keyを確認した
[ ] Site URLを設定した
[ ] Redirect URLsを設定した
[ ] テーブルを作成した
[ ] RLSを有効化した
[ ] 自分のデータだけ読めるポリシーを作った
[ ] アプリからログインできる
[ ] 診断結果をクラウド保存できる
[ ] 別端末で同じ結果を見られる
```

## 10. 参考公式ドキュメント

- Supabase Auth: https://supabase.com/docs/guides/auth/
- Passwordless email logins: https://supabase.com/docs/guides/auth/auth-magic-link
- Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Understanding API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
