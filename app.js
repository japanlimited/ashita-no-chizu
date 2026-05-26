const STORAGE_KEY = "ashita-no-chizu:v1";
const LOGIN_COOLDOWN_KEY = "ashita-no-chizu:login-email-cooldown-until";

const supabaseConfig = window.ASHITA_SUPABASE_CONFIG || {};
const supabaseClient =
  window.supabase && supabaseConfig.url && supabaseConfig.publishableKey
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.publishableKey)
    : null;

const ageGroups = ["13-15", "16-18", "19-22", "23-29", "30以上"];

const questions = [
  {
    id: "q1",
    title: "今のあなたの気持ちに一番近いものはどれですか？",
    type: "single",
    required: true,
    options: [
      "なんとなく不安がある",
      "やりたいことが見つからない",
      "目標はあるけど続かない",
      "何から始めればいいかわからない",
      "少し変わりたいと思っている",
      "今の自分を整理したい",
      "前向きに進みたい",
    ],
  },
  {
    id: "q2",
    title: "このアプリを使って、一番見つけたいものは何ですか？",
    type: "single",
    required: true,
    options: [
      "将来やりたいこと",
      "自分の強み",
      "自分に合う目標",
      "明日からできる行動",
      "不安の整理",
      "勉強や仕事の方向性",
      "自分らしい生き方",
    ],
  },
  {
    id: "q3",
    title: "最近、少しでも「いいな」「気になるな」と思ったことはありますか？",
    type: "multiple",
    required: false,
    options: [
      "音楽・映像・イラストなどの表現",
      "人を助けること",
      "新しい技術やAI",
      "スポーツや体を動かすこと",
      "旅行や知らない場所",
      "お金やビジネス",
      "勉強や資格",
      "人との会話",
      "自然や暮らし",
      "特に思いつかない",
    ],
  },
  {
    id: "q4",
    title: "子どもの頃でも最近でも、時間を忘れて夢中になったことはありますか？",
    type: "text",
    required: false,
    placeholder: "例：ゲーム、絵を描く、友達の相談に乗る、何かを調べる",
    options: ["ゲーム", "絵を描く", "部活", "動画を見る", "友達の相談に乗る", "何かを調べる", "ものを作る"],
  },
  {
    id: "q5",
    title: "人から言われて、少しうれしかった言葉に近いものはありますか？",
    type: "multiple",
    required: false,
    options: [
      "やさしいね",
      "真面目だね",
      "おもしろいね",
      "センスがあるね",
      "よく気づくね",
      "頼りになるね",
      "コツコツできるね",
      "発想がいいね",
      "聞き上手だね",
      "行動力があるね",
      "特に思いつかない",
    ],
  },
  {
    id: "q6",
    title: "今は苦手だけど、少しできるようになりたいことはありますか？",
    type: "multiple",
    required: false,
    options: [
      "人前で話すこと",
      "勉強を続けること",
      "自分の考えを言葉にすること",
      "計画を立てること",
      "お金のことを考えること",
      "新しいことに挑戦すること",
      "人と関わること",
      "早めに行動すること",
      "自分に自信を持つこと",
      "特にない",
    ],
  },
  {
    id: "q7",
    title: "あなたが、これからの人生で大切にしたいものを選んでください。",
    type: "multiple",
    required: true,
    max: 3,
    options: [
      "安定",
      "自由",
      "成長",
      "仲間",
      "家族",
      "挑戦",
      "好きなこと",
      "お金",
      "健康",
      "誰かの役に立つこと",
      "自分らしさ",
      "楽しさ",
    ],
  },
  {
    id: "q8",
    title: "今すぐ決めなくて大丈夫です。なんとなく理想に近い暮らしを選ぶなら、どれですか？",
    type: "single",
    required: true,
    options: [
      "安定した仕事と生活を大切にしたい",
      "好きなことを仕事に近づけたい",
      "人に喜ばれる仕事がしたい",
      "自由な働き方をしたい",
      "専門性を身につけたい",
      "家族や身近な人との時間を大切にしたい",
      "まだよくわからない",
    ],
  },
  {
    id: "q9",
    title: "あなたに合いそうな働き方・学び方はどれに近いですか？",
    type: "multiple",
    required: false,
    options: [
      "ひとつのことをじっくり深めたい",
      "いろいろ試しながら見つけたい",
      "人と協力しながら進めたい",
      "自分のペースで進めたい",
      "実際にやりながら覚えたい",
      "本や動画で学びたい",
      "誰かに教えてもらいたい",
      "まだわからない",
    ],
  },
  {
    id: "q10",
    title: "今、不安に感じていることがあれば、近いものを選んでください。",
    type: "multiple",
    required: false,
    options: [
      "将来やりたいことがわからない",
      "勉強や仕事についていけるか不安",
      "自分に強みがあるかわからない",
      "人と比べてしまう",
      "目標を立てても続かない",
      "お金のことが不安",
      "人間関係が不安",
      "何を始めればいいかわからない",
      "特に大きな不安はない",
    ],
  },
  {
    id: "q11",
    title: "これからの人生で、できれば避けたいと思うことはありますか？",
    type: "multiple",
    required: false,
    max: 3,
    options: [
      "ずっと我慢し続けること",
      "自分の気持ちを無視すること",
      "何も挑戦しないまま過ごすこと",
      "人と比べ続けること",
      "嫌いなことだけで毎日が埋まること",
      "ひとりで抱え込むこと",
      "お金にずっと困ること",
      "自分の可能性を決めつけること",
      "特に思いつかない",
    ],
  },
  {
    id: "q12",
    title: "有名人でなくても大丈夫です。「こういう生き方、少しいいな」と思う人や姿はありますか？",
    type: "text",
    required: false,
    placeholder: "例：好きなことを仕事にしている人、自由に働いている人",
    options: ["好きなことを仕事にしている人", "人を助けている人", "自由に働いている人", "家族を大切にしている人", "専門性を持っている人"],
  },
  {
    id: "q13",
    title: "1年後の自分が、今より少し変わっていたらうれしいことは何ですか？",
    type: "multiple",
    required: true,
    options: [
      "やりたいことが少し見えている",
      "勉強や仕事を少し続けられている",
      "自分に少し自信がある",
      "新しい経験をしている",
      "人間関係が少し楽になっている",
      "お金や生活の不安が少し減っている",
      "好きなことを少し形にしている",
      "目標に向かって動けている",
    ],
  },
  {
    id: "q14",
    title: "大きなことではなくて大丈夫です。明日からなら、どれが一番できそうですか？",
    type: "single",
    required: true,
    options: [
      "10分だけ調べる",
      "気になることをメモする",
      "好きなことを3つ書く",
      "1つだけ動画や記事を見る",
      "誰かに少し相談する",
      "机やスマホの中を少し整理する",
      "今日の気持ちを一言だけ記録する",
      "まだ選べない",
    ],
  },
  {
    id: "q15",
    title: "最後に、今の自分にひと言かけるなら、どんな言葉をかけたいですか？",
    type: "text",
    required: false,
    placeholder: "例：大丈夫、少しずつでいい、よくやってる",
    options: ["大丈夫", "少しずつでいい", "よくやってる", "まだこれから", "焦らなくていい", "ちょっとだけ動いてみよう"],
  },
];

let state = loadState();

function createInitialState() {
  return {
    screen: "welcome",
    questionIndex: 0,
    user: null,
    diagnosisAnswer: null,
    result: null,
    selectedGoal: "",
    authUser: null,
    authEmail: "",
    authMessage: "",
    syncStatus: "",
    diagnosisHistory: [],
    error: "",
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.user && saved?.result) {
      return { ...createInitialState(), ...saved, screen: "home", error: "" };
    }
  } catch (error) {
    console.warn("Failed to load saved data", error);
  }
  return createInitialState();
}

function saveState() {
  const snapshot = {
    user: state.user,
    diagnosisAnswer: state.diagnosisAnswer,
    result: state.result,
    selectedGoal: state.selectedGoal,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

async function initializeApp() {
  if (!supabaseClient) {
    state.syncStatus = "クラウド保存は未設定です。";
    render();
    return;
  }

  try {
    const { data } = await supabaseClient.auth.getSession();
    await applySession(data?.session || null, { loadCloud: true });
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      applySession(session, { loadCloud: true });
    });
  } catch (error) {
    console.warn("Failed to initialize auth", error);
    state.syncStatus = "ログイン状態を確認できませんでした。";
    render();
  }
}

async function applySession(session, options = {}) {
  state.authUser = session?.user || null;
  state.authEmail = session?.user?.email || "";

  if (!state.authUser) {
    state.diagnosisHistory = [];
    render();
    return;
  }

  state.syncStatus = `${state.authEmail} でログイン中です。`;
  if (options.loadCloud) {
    await loadCloudData();
  }
  render();
}

function isLoggedIn() {
  return Boolean(state.authUser?.id);
}

function getRedirectUrl() {
  return supabaseConfig.appUrl || window.location.origin + window.location.pathname;
}

function getStorageLabel() {
  return isLoggedIn()
    ? "診断結果はクラウドに保存され、同じアカウントで別端末からも見られます。"
    : "診断結果は、この端末のブラウザ内に保存されます。別端末との共有にはログインが必要です。";
}

function getLoginCooldownRemaining() {
  const until = Number(localStorage.getItem(LOGIN_COOLDOWN_KEY) || "0");
  return Math.max(0, until - Date.now());
}

function setLoginCooldown(seconds) {
  localStorage.setItem(LOGIN_COOLDOWN_KEY, String(Date.now() + seconds * 1000));
}

function formatCooldown(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds}秒後`;
  return `${minutes}分${seconds ? `${seconds}秒` : ""}後`;
}

function uid(prefix) {
  const id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${id}`;
}

function now() {
  return new Date().toISOString();
}

function setScreen(screen) {
  state.screen = screen;
  state.error = "";
  state.authMessage = "";
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setAnswer(questionId, value) {
  if (!state.diagnosisAnswer) {
    state.diagnosisAnswer = {
      id: uid("answer"),
      user_id: state.user?.id || "",
      answers: {},
      created_at: now(),
    };
  }
  state.diagnosisAnswer.answers[questionId] = value;
  saveState();
  render();
}

function getAnswer(questionId) {
  return state.diagnosisAnswer?.answers?.[questionId];
}

function isFilled(question) {
  const answer = getAnswer(question.id);
  if (Array.isArray(answer)) return answer.length > 0;
  return Boolean(String(answer || "").trim());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

function joinList(items, fallback = "まだ整理中") {
  const filtered = asArray(items).filter((item) => item !== "特に思いつかない" && item !== "特にない" && item !== "まだわからない");
  return filtered.length ? filtered.join("、") : fallback;
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = `${renderTopbar()}${renderScreen()}`;
}

function renderTopbar() {
  if (state.screen === "welcome") return "";
  const hasResult = Boolean(state.result);
  return `
    <header class="topbar">
      <div class="brand" role="button" tabindex="0" onclick="setScreen('${hasResult ? "home" : "welcome"}')">
        <div class="brand-mark">地</div>
        <div>
          <p class="brand-title">あしたの地図</p>
          <p class="brand-subtitle">AIと描く、あなたの未来応援マップ</p>
        </div>
      </div>
      <nav class="top-actions" aria-label="主要ナビゲーション">
        ${hasResult ? `<button class="btn ghost" onclick="setScreen('home')">ホーム</button>` : ""}
        ${hasResult ? `<button class="btn ghost" onclick="setScreen('map')">未来マップ</button>` : ""}
        ${hasResult ? `<button class="btn ghost" onclick="setScreen('poster')">応援図</button>` : ""}
        ${hasResult ? `<button class="btn ghost" onclick="setScreen('mypage')">マイページ</button>` : ""}
        <button class="btn ghost" onclick="setScreen('login')">${isLoggedIn() ? "アカウント" : "ログイン"}</button>
      </nav>
    </header>
  `;
}

function renderScreen() {
  const screens = {
    welcome: renderWelcome,
    profile: renderProfile,
    diagnosis: renderDiagnosis,
    analyzing: renderAnalyzing,
    result: renderResult,
    map: renderMap,
    goals: renderGoals,
    step: renderTomorrowStep,
    poster: renderPoster,
    home: renderHome,
    mypage: renderMypage,
    settings: renderSettings,
    login: renderLogin,
    history: renderHistory,
  };
  return (screens[state.screen] || renderWelcome)();
}

function renderWelcome() {
  return `
    <main class="screen hero">
      <section class="hero-copy">
        <p class="eyebrow">やさしい未来地図</p>
        <h1>あしたの地図</h1>
        <p class="lead">AIと描く、あなたの未来応援マップ</p>
        <div class="hero-note">
          迷ってもいい。地図は、あとから描き直せる。<br />
          今の気持ちや好きなことを整理しながら、あなたの「あしたの一歩」を一緒に見つけていきます。
        </div>
        <div class="actions">
          <button class="btn primary" onclick="setScreen('profile')">はじめる</button>
          ${state.result ? `<button class="btn ghost" onclick="setScreen('home')">保存した地図を見る</button>` : ""}
          <button class="btn ghost" onclick="setScreen('login')">ログインして同期</button>
        </div>
      </section>
      <aside class="map-preview" aria-label="未来マップのプレビュー">
        <div class="preview-path">
          ${["現在地", "価値観の軸", "強みの種", "未来の方向性", "明日からの一歩"].map((label, index) => `
            <div class="preview-point">
              <div class="preview-icon">${index + 1}</div>
              <div>
                <p class="preview-label">${label}</p>
                <p class="preview-text">${index === 4 ? "10分でできる行動へ" : "少しずつ言葉にする"}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </aside>
    </main>
  `;
}

function renderProfile() {
  const nickname = state.user?.nickname || "";
  const age = state.user?.age_group || "";
  return `
    <main class="screen narrow">
      <div class="section-head">
        <div>
          <p class="eyebrow">最初の一歩</p>
          <h1>呼び名だけ教えてください</h1>
          <p>本名ではなく、アプリの中で呼ばれたい名前で大丈夫です。</p>
        </div>
      </div>
      <section class="profile-panel">
        <div class="form-grid">
          <div class="field">
            <label for="nickname">ニックネーム <span class="required">必須</span></label>
            <input id="nickname" value="${escapeHtml(nickname)}" maxlength="24" placeholder="例：みらい" />
            <p class="hint">本名、学校名、住所、電話番号などは入力しないでください。</p>
          </div>
          <div class="field">
            <label for="age">年齢層 <span class="hint">任意</span></label>
            <select id="age">
              <option value="">選択しない</option>
              ${ageGroups.map((group) => `<option value="${group}" ${age === group ? "selected" : ""}>${group}</option>`).join("")}
            </select>
          </div>
          <p class="privacy-note">
            会話全文は保存しません。${getStorageLabel()}
          </p>
          ${state.error ? `<p class="error-text">${escapeHtml(state.error)}</p>` : ""}
          <div class="actions between">
            <button class="btn ghost" onclick="setScreen('welcome')">戻る</button>
            <button class="btn primary" onclick="submitProfile()">診断へ進む</button>
          </div>
        </div>
      </section>
    </main>
  `;
}

async function submitProfile() {
  const nickname = document.querySelector("#nickname").value.trim();
  const age = document.querySelector("#age").value;
  if (!nickname) {
    state.error = "ニックネームを入力してください。";
    render();
    return;
  }
  const existingId = state.authUser?.id || state.user?.id || uid("user");
  state.user = {
    id: existingId,
    nickname,
    age_group: age,
    created_at: state.user?.created_at || now(),
    updated_at: now(),
  };
  if (!state.diagnosisAnswer) {
    state.diagnosisAnswer = {
      id: uid("answer"),
      user_id: existingId,
      answers: {},
      created_at: now(),
    };
  }
  state.questionIndex = 0;
  saveState();
  if (isLoggedIn()) {
    await saveProfileToCloud();
  }
  setScreen("diagnosis");
}

function renderDiagnosis() {
  const question = questions[state.questionIndex];
  const progress = Math.round(((state.questionIndex + 1) / questions.length) * 100);
  return `
    <main class="screen narrow">
      <div class="progress-wrap" style="--progress: ${progress}%">
        <div class="progress-meta">
          <span>質問 ${state.questionIndex + 1} / ${questions.length}</span>
          <span>${progress}%</span>
        </div>
        <div class="progress-track"><div class="progress-bar"></div></div>
      </div>
      ${state.questionIndex === 0 ? `
        <p class="privacy-note">
          正解はありません。あとから変えても大丈夫です。今のあなたに近いものを、直感で選んでください。
        </p>
      ` : ""}
      <section class="question-panel">
        <h1 class="question-title">${escapeHtml(question.title)} ${question.required ? `<span class="required">必須</span>` : `<span class="hint">任意</span>`}</h1>
        ${question.max ? `<p class="hint">最大${question.max}つまで選べます。</p>` : ""}
        ${renderQuestionInput(question)}
        ${state.error ? `<p class="error-text">${escapeHtml(state.error)}</p>` : ""}
        <div class="actions between">
          <button class="btn ghost" onclick="previousQuestion()" ${state.questionIndex === 0 ? "disabled" : ""}>戻る</button>
          <div class="actions" style="margin-top:0">
            ${question.required ? "" : `<button class="btn ghost" onclick="skipQuestion()">スキップ</button>`}
            <button class="btn primary" onclick="nextQuestion()">${state.questionIndex === questions.length - 1 ? "分析する" : "次へ"}</button>
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderQuestionInput(question) {
  if (question.type === "text") {
    const answer = escapeHtml(getAnswer(question.id) || "");
    return `
      <div class="field" style="margin-top:20px">
        <textarea id="text-answer" maxlength="180" placeholder="${escapeHtml(question.placeholder || "")}" oninput="updateTextAnswer('${question.id}', this.value)">${answer}</textarea>
      </div>
      <div class="tag-row" style="margin-top:12px">
        ${question.options.map((option) => `<button class="tag" onclick="setAnswer('${question.id}', '${escapeHtml(option)}')">${escapeHtml(option)}</button>`).join("")}
      </div>
    `;
  }

  const answer = getAnswer(question.id);
  return `
    <div class="choice-grid">
      ${question.options.map((option) => {
        const selected = question.type === "single" ? answer === option : asArray(answer).includes(option);
        return `
          <button
            class="choice ${question.type === "single" ? "is-single" : ""} ${selected ? "is-selected" : ""}"
            onclick="toggleChoice('${question.id}', '${escapeHtml(option)}')"
          >
            <span class="choice-check">✓</span>
            <span>${escapeHtml(option)}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function toggleChoice(questionId, option) {
  const question = questions.find((item) => item.id === questionId);
  if (question.type === "single") {
    setAnswer(questionId, option);
    return;
  }
  const current = asArray(getAnswer(questionId));
  const exists = current.includes(option);
  let next = exists ? current.filter((item) => item !== option) : [...current, option];
  if (question.max && next.length > question.max) {
    next = next.slice(1);
  }
  setAnswer(questionId, next);
}

function updateTextAnswer(questionId, value) {
  if (!state.diagnosisAnswer) {
    state.diagnosisAnswer = {
      id: uid("answer"),
      user_id: state.user?.id || "",
      answers: {},
      created_at: now(),
    };
  }
  state.diagnosisAnswer.answers[questionId] = value;
  saveState();
}

function captureCurrentTextAnswer() {
  const question = questions[state.questionIndex];
  if (question?.type !== "text") return;
  const textarea = document.querySelector("#text-answer");
  if (textarea) updateTextAnswer(question.id, textarea.value);
}

function previousQuestion() {
  captureCurrentTextAnswer();
  state.error = "";
  state.questionIndex = Math.max(0, state.questionIndex - 1);
  render();
}

function skipQuestion() {
  setAnswer(questions[state.questionIndex].id, questions[state.questionIndex].type === "multiple" ? [] : "");
  nextQuestion(true);
}

function nextQuestion(skipped = false) {
  captureCurrentTextAnswer();
  const question = questions[state.questionIndex];
  if (!skipped && question.required && !isFilled(question)) {
    state.error = "今のあなたに一番近いものを選んでください。";
    render();
    return;
  }
  state.error = "";
  if (state.questionIndex < questions.length - 1) {
    state.questionIndex += 1;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    analyze();
  }
}

function renderAnalyzing() {
  return `
    <main class="screen loading-screen">
      <section class="loading-card">
        <div class="spinner" aria-hidden="true"></div>
        <p class="eyebrow">AI分析中</p>
        <h1 class="compact-title">あなたの地図を描いています</h1>
        <p class="lead">回答をもとに、現在地、価値観、強みの種、明日からの一歩をやさしく整理しています。</p>
      </section>
    </main>
  `;
}

function analyze() {
  setScreen("analyzing");
  window.setTimeout(async () => {
    const result = generateLocalAnalysis(state.diagnosisAnswer.answers);
    state.result = {
      id: uid("result"),
      user_id: state.authUser?.id || state.user.id,
      diagnosis_answer_id: state.diagnosisAnswer.id,
      ...result,
      created_at: now(),
    };
    state.selectedGoal = result.one_year_goal;
    saveState();
    if (isLoggedIn()) {
      await saveProfileToCloud();
      await saveDiagnosisToCloud();
    }
    setScreen("result");
  }, 900);
}

function generateLocalAnalysis(answers) {
  const values = asArray(answers.q7).slice(0, 3);
  const interests = asArray(answers.q3).filter((item) => item !== "特に思いつかない");
  const compliments = asArray(answers.q5).filter((item) => item !== "特に思いつかない");
  const concerns = [
    answers.q1,
    ...asArray(answers.q10),
    ...asArray(answers.q6).filter((item) => item !== "特にない").map((item) => `${item}を少しできるようになりたい`),
  ].filter(Boolean);
  const strengths = inferStrengths(answers, compliments, interests);
  const direction = inferDirection(answers, interests, values);
  const oneYear = inferOneYearGoal(answers, interests);
  const tomorrow = inferTomorrowStep(answers, interests);
  const caution = detectRisk(answers)
    ? "つらさや危険を一人で抱えなくて大丈夫です。身近な信頼できる大人や専門の相談窓口に話してみてください。緊急の危険がある場合は、すぐに近くの人や緊急窓口に助けを求めてください。"
    : "これは今の回答から見える仮の地図です。いつでも見直して大丈夫です。";

  return {
    current_state: `今の回答からは、「${answers.q1 || "自分を整理したい"}」という気持ちを持ちながら、${answers.q2 || "これからの方向"}を少しずつ見つけたい状態が見えます。`,
    values: values.length ? values : ["成長", "自分らしさ"],
    strength_seeds: strengths,
    concerns: concerns.length ? Array.from(new Set(concerns)).slice(0, 4) : ["まだ言葉にしきれていない不安"],
    future_direction: direction,
    one_year_goal: oneYear,
    three_month_goal: "気になる分野を2つ調べて、小さな体験や相談を1つ試す。",
    monthly_theme: inferMonthlyTheme(answers, interests),
    tomorrow_step: tomorrow,
    support_message: `${answers.q15 ? `${answers.q15}。` : ""}迷っても大丈夫です。地図は何度でも描き直せます。今は大きく変わるより、明日の小さな一歩を決められたことが前進です。`,
    caution_note: caution,
  };
}

function inferStrengths(answers, compliments, interests) {
  const seeds = new Set();
  const text = `${compliments.join(" ")} ${interests.join(" ")} ${answers.q4 || ""} ${asArray(answers.q9).join(" ")}`;
  if (/やさしい|助け|相談|聞き上手|人との会話|協力/.test(text)) seeds.add("人の気持ちを考える力");
  if (/真面目|コツコツ|じっくり|勉強|資格|本や動画/.test(text)) seeds.add("続けて学ぶ力");
  if (/センス|表現|絵|映像|音楽|発想|ものを作る/.test(text)) seeds.add("形にして表現する力");
  if (/調べる|技術|AI|実際にやりながら|新しい/.test(text)) seeds.add("調べて試す力");
  if (/行動力|スポーツ|旅行|いろいろ試し/.test(text)) seeds.add("動きながら見つける力");
  if (!seeds.size) seeds.add("自分の気持ちに気づこうとする力");
  return Array.from(seeds).slice(0, 4);
}

function inferDirection(answers, interests, values) {
  const text = `${interests.join(" ")} ${values.join(" ")} ${answers.q8 || ""} ${answers.q12 || ""}`;
  if (/表現|絵|音楽|映像|好きなこと/.test(text)) return "好きなことや感じたことを、表現や制作につなげる方向に可能性があります。";
  if (/助け|役に立つ|喜ばれる|相談|家族/.test(text)) return "人を支えたり、身近な人に安心を届けたりする方向に可能性があります。";
  if (/技術|AI|調べ|専門性|資格/.test(text)) return "学びを深めながら、技術や専門性を少しずつ育てる方向に可能性があります。";
  if (/自由|旅行|ビジネス|お金/.test(text)) return "自分のペースや自由度を大切にしながら、働き方を探る方向に可能性があります。";
  return "今はいろいろ試しながら、自分に合う学び方や働き方を見つけていく方向が合いそうです。";
}

function inferOneYearGoal(answers, interests) {
  const wanted = joinList(asArray(answers.q13), "自分に合う方向");
  const focus = interests[0] && interests[0] !== "特に思いつかない" ? interests[0] : answers.q2 || "気になること";
  return `${focus}に関係する小さな体験を重ね、1年後に「${wanted}」と言える状態に近づく。`;
}

function inferMonthlyTheme(answers, interests) {
  const focus = interests[0] && interests[0] !== "特に思いつかない" ? interests[0] : "気になること";
  if (answers.q14 === "誰かに少し相談する") return "一人で抱えず、話せる相手に今の考えを少し共有する。";
  if (answers.q14 === "机やスマホの中を少し整理する") return "考える余白を作るために、身の回りとメモを軽く整える。";
  return `${focus}について調べ、小さく試せる入口を見つける。`;
}

function inferTomorrowStep(answers, interests) {
  const base = answers.q14 || "10分だけ調べる";
  const focus = interests[0] && interests[0] !== "特に思いつかない" ? interests[0] : answers.q2 || "気になること";
  const map = {
    "10分だけ調べる": `10分だけ、${focus}に関係する仕事・学び・活動を1つ調べてメモする。`,
    "気になることをメモする": `スマホのメモに、${focus}で少し気になる言葉を3つ書く。`,
    "好きなことを3つ書く": "好きなこと、気になったこと、少し続いたことをそれぞれ1つずつ書く。",
    "1つだけ動画や記事を見る": `${focus}に関係する動画か記事を1つだけ見て、気づきを一言残す。`,
    "誰かに少し相談する": "信頼できる人に、今考えていることを一言だけ話してみる。",
    "机やスマホの中を少し整理する": "机かスマホのメモを5分だけ整理して、気になることを1つ見える場所に置く。",
    "今日の気持ちを一言だけ記録する": "寝る前に、今日の気持ちを一言だけ記録する。",
    "まだ選べない": "選べなくても大丈夫。明日は、気になる言葉を1つだけメモする。",
  };
  return map[base] || map["10分だけ調べる"];
}

function detectRisk(answers) {
  const riskWords = ["死にたい", "消えたい", "自殺", "殺したい", "傷つけたい", "虐待", "逃げたい", "もう無理"];
  const allText = Object.values(answers || {}).flat().join(" ");
  return riskWords.some((word) => allText.includes(word));
}

function buildAiPrompt() {
  return `あなたは、10代後半〜20代の若いユーザーに寄り添う人生設計アプリ「あしたの地図」のAI相棒です。
ユーザーの回答をもとに、価値観、強み、不安、未来の方向性、目標、明日からの一歩を整理してください。

必ず守ること:
- 決めつけない
- 否定しない
- 医療・心理診断のような断定をしない
- ユーザーを責めない
- 不安を軽視しない
- 行動提案は具体的にする
- やさしく丁寧な日本語で書く
- 「あなたはこういう人です」と断定せず、「今の回答からは、こういう傾向が見えます」と表現する
- 危険な内容が見られる場合は、信頼できる大人や専門機関への相談を促す

次のJSON形式だけで返してください:
{
  "current_state": "string",
  "values": ["string"],
  "strength_seeds": ["string"],
  "concerns": ["string"],
  "future_direction": "string",
  "one_year_goal": "string",
  "three_month_goal": "string",
  "monthly_theme": "string",
  "tomorrow_step": "string",
  "support_message": "string",
  "caution_note": "string"
}

ユーザー情報:
${JSON.stringify({ user: state.user, answers: state.diagnosisAnswer?.answers || {} }, null, 2)}`;
}

function renderResult() {
  if (!state.result) return renderEmpty("診断結果がまだありません。", "診断を始める", "profile");
  const result = state.result;
  return `
    <main class="screen wide layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">診断結果</p>
          <h1>${escapeHtml(state.user.nickname)}さんの今の地図</h1>
          <p>回答から見える傾向を、決めつけずに仮の地図として整理しました。</p>
        </div>
      </div>
      <section class="result-grid">
        ${resultCard("現在地", result.current_state, "1")}
        ${resultCard("大切にしたい価値観", renderPills(result.values), "2", true)}
        ${resultCard("強みの種", renderPills(result.strength_seeds), "3", true)}
        ${resultCard("今の不安や課題", renderPills(result.concerns), "4", true)}
        ${resultCard("未来の方向性", result.future_direction, "5")}
        ${resultCard("AI相棒からの言葉", result.support_message, "6")}
      </section>
      <details class="details-box">
        <summary>AI分析用プロンプトを見る</summary>
        <pre class="prompt-code">${escapeHtml(buildAiPrompt())}</pre>
      </details>
      <div class="actions between">
        <button class="btn ghost" onclick="setScreen('diagnosis')">回答を見直す</button>
        <button class="btn primary" onclick="setScreen('map')">未来マップを見る</button>
      </div>
    </main>
  `;
}

function resultCard(title, content, icon, raw = false) {
  return `
    <article class="result-card">
      <div class="card-head">
        <span class="card-icon">${icon}</span>
        <h3>${escapeHtml(title)}</h3>
      </div>
      ${raw ? content : `<p>${escapeHtml(content)}</p>`}
    </article>
  `;
}

function renderPills(items) {
  return `<div class="pill-row">${asArray(items).map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div>`;
}

function renderMap() {
  if (!state.result) return renderEmpty("未来マップがまだありません。", "診断を始める", "profile");
  const result = state.result;
  const cards = [
    ["現在地", result.current_state],
    ["価値観の軸", joinList(result.values)],
    ["強みの種", joinList(result.strength_seeds)],
    ["今の不安", joinList(result.concerns)],
    ["未来の方向性", result.future_direction],
    ["1年後の目標", result.one_year_goal],
    ["3か月の目標", result.three_month_goal],
    ["今月のテーマ", result.monthly_theme],
    ["明日からの一歩", result.tomorrow_step, true],
  ];
  return `
    <main class="screen wide layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">道のり型未来マップ</p>
          <h1>現在地から明日の一歩まで</h1>
          <p>この地図はいつでも描き直せます。</p>
        </div>
      </div>
      <section class="map-road">
        ${cards.map(([title, text, highlight], index) => `
          <article class="map-card ${highlight ? "highlight" : ""}">
            <span class="card-icon">${index + 1}</span>
            <div>
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(text)}</p>
            </div>
          </article>
        `).join("")}
      </section>
      <div class="actions between">
        <button class="btn ghost" onclick="setScreen('result')">結果へ戻る</button>
        <button class="btn primary" onclick="setScreen('goals')">目標を選ぶ</button>
      </div>
    </main>
  `;
}

function renderGoals() {
  if (!state.result) return renderEmpty("目標提案がまだありません。", "診断を始める", "profile");
  const options = [
    state.result.one_year_goal,
    "気になる分野を3つ試し、自分が続けたい方向を1つ見つける。",
    "小さな学びと行動を続けて、自分に合う進み方を言葉にする。",
  ];
  return `
    <main class="screen narrow layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">目標提案</p>
          <h1>1年後の仮目標を選ぶ</h1>
          <p>今は仮で大丈夫です。近いものを選んで、あとから描き直しましょう。</p>
        </div>
      </div>
      <section class="goal-list">
        ${options.map((option, index) => `
          <button class="goal-option ${state.selectedGoal === option ? "is-selected" : ""}" onclick="selectGoal('${escapeHtml(option)}')">
            <strong>提案 ${index + 1}</strong>
            <span>${escapeHtml(option)}</span>
          </button>
        `).join("")}
      </section>
      <div class="field">
        <label for="custom-goal">自分の言葉で調整する</label>
        <textarea id="custom-goal" maxlength="180" oninput="updateSelectedGoal(this.value)">${escapeHtml(state.selectedGoal || "")}</textarea>
      </div>
      <div class="actions between">
        <button class="btn ghost" onclick="setScreen('map')">戻る</button>
        <button class="btn primary" onclick="confirmGoal()">明日の一歩へ</button>
      </div>
    </main>
  `;
}

function selectGoal(goal) {
  state.selectedGoal = goal;
  saveState();
  render();
}

function updateSelectedGoal(goal) {
  state.selectedGoal = goal;
  saveState();
}

function confirmGoal() {
  const custom = document.querySelector("#custom-goal")?.value.trim();
  if (custom) state.selectedGoal = custom;
  state.result.one_year_goal = state.selectedGoal || state.result.one_year_goal;
  saveState();
  setScreen("step");
}

function renderTomorrowStep() {
  if (!state.result) return renderEmpty("明日の一歩がまだありません。", "診断を始める", "profile");
  return `
    <main class="screen narrow layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">明日からの一歩</p>
          <h1>最初はこれだけで大丈夫</h1>
          <p>大きな決意より、明日できる小さな行動を地図に置きます。</p>
        </div>
      </div>
      <section class="home-panel feature">
        <p class="small-label">明日やること</p>
        <div class="home-value">${escapeHtml(state.result.tomorrow_step)}</div>
      </section>
      <section class="home-panel">
        <h3>できなかった場合</h3>
        <p>できなかった日があっても、地図は消えません。次の日に「1分だけ見る」から再開して大丈夫です。</p>
      </section>
      <div class="actions between">
        <button class="btn ghost" onclick="setScreen('goals')">戻る</button>
        <button class="btn primary" onclick="setScreen('poster')">未来応援図を見る</button>
      </div>
    </main>
  `;
}

function renderPoster() {
  if (!state.result) return renderEmpty("未来応援図がまだありません。", "診断を始める", "profile");
  const result = state.result;
  return `
    <main class="screen wide layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">未来応援図</p>
          <h1>保存して見返したくなる縦長カード</h1>
          <p>MVPでは画面表示のみです。画像保存やPDF出力は次段階の機能として追加できます。</p>
        </div>
      </div>
      <div class="poster-wrap">
        <article class="poster" aria-label="あなたの未来応援図">
          <header class="poster-header">
            <h2>あしたの地図</h2>
            <p>あなたの未来応援図</p>
          </header>
          ${posterSection("今の現在地", result.current_state)}
          ${posterSection("大切にしたい価値観", joinList(result.values))}
          ${posterSection("強みの種", joinList(result.strength_seeds))}
          ${posterSection("未来の方向性", result.future_direction)}
          ${posterSection("1年後の仮目標", result.one_year_goal)}
          ${posterSection("今月のテーマ", result.monthly_theme)}
          ${posterSection("明日の一歩", result.tomorrow_step)}
          ${posterSection("AI相棒からの言葉", result.support_message, true)}
        </article>
      </div>
      <div class="actions between">
        <button class="btn ghost" onclick="setScreen('step')">戻る</button>
        <button class="btn primary" onclick="setScreen('home')">ホームへ</button>
      </div>
    </main>
  `;
}

function posterSection(title, text, message = false) {
  return `
    <section class="poster-section ${message ? "poster-message" : ""}">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(text)}</span>
    </section>
  `;
}

function renderHome() {
  if (!state.result) return renderEmpty("保存された地図がまだありません。", "診断を始める", "profile");
  return `
    <main class="screen wide layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">ホーム</p>
          <h1>こんにちは、${escapeHtml(state.user.nickname)}さん。</h1>
          <p>今日の地図を少しだけ見てみましょう。</p>
        </div>
      </div>
      <section class="home-grid">
        <article class="home-panel feature">
          <p class="small-label">現在の目標</p>
          <div class="home-value">${escapeHtml(state.result.one_year_goal)}</div>
        </article>
        <article class="home-panel">
          <h3>今月のテーマ</h3>
          <p>${escapeHtml(state.result.monthly_theme)}</p>
        </article>
        <article class="home-panel">
          <h3>明日からの一歩</h3>
          <p>${escapeHtml(state.result.tomorrow_step)}</p>
        </article>
        <article class="home-panel">
          <h3>地図の状態</h3>
          <p>${new Date(state.result.created_at).toLocaleString("ja-JP")} に保存されました。${isLoggedIn() ? "クラウド同期済みです。" : "この端末のブラウザ内に保存されています。"}</p>
        </article>
      </section>
      <div class="actions">
        <button class="btn primary" onclick="setScreen('map')">未来マップを見る</button>
        <button class="btn accent" onclick="setScreen('poster')">未来応援図を見る</button>
        ${isLoggedIn() ? `<button class="btn ghost" onclick="setScreen('history')">診断履歴を見る</button>` : `<button class="btn ghost" onclick="setScreen('login')">ログインして同期</button>`}
        <button class="btn ghost" onclick="restartDiagnosis()">再診断する</button>
      </div>
    </main>
  `;
}

function restartDiagnosis() {
  state.questionIndex = 0;
  state.diagnosisAnswer = {
    id: uid("answer"),
    user_id: state.authUser?.id || state.user.id,
    answers: {},
    created_at: now(),
  };
  state.result = null;
  state.selectedGoal = "";
  saveState();
  setScreen("diagnosis");
}

function renderMypage() {
  if (!state.user) return renderEmpty("プロフィールがまだありません。", "はじめる", "profile");
  return `
    <main class="screen wide layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">マイページ</p>
          <h1>${escapeHtml(state.user.nickname)}さんの記録</h1>
          <p>保存済み診断結果と設定を確認できます。</p>
        </div>
      </div>
      <section class="result-grid">
        ${resultCard("ニックネーム", state.user.nickname, "名")}
        ${resultCard("年齢層", state.user.age_group || "未選択", "年")}
        ${resultCard("ログイン状態", isLoggedIn() ? `${state.authEmail} でログイン中` : "ゲスト利用中", "鍵")}
        ${resultCard("保存先", isLoggedIn() ? "クラウド保存 + このブラウザ" : "この端末のブラウザのみ", "保")}
        ${state.result ? resultCard("価値観", renderPills(state.result.values), "軸", true) : ""}
        ${state.result ? resultCard("目標", state.result.one_year_goal, "目") : ""}
      </section>
      <div class="actions">
        ${state.result ? `<button class="btn primary" onclick="setScreen('map')">未来マップへ</button>` : ""}
        <button class="btn ghost" onclick="setScreen('login')">ログイン設定</button>
        ${isLoggedIn() ? `<button class="btn ghost" onclick="setScreen('history')">診断履歴</button>` : ""}
        <button class="btn ghost" onclick="setScreen('settings')">設定とデータ削除</button>
      </div>
    </main>
  `;
}

function renderSettings() {
  return `
    <main class="screen narrow layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">設定</p>
          <h1>データと安全について</h1>
          <p>${getStorageLabel()}</p>
        </div>
      </div>
      <section class="home-panel">
        <h3>入力しないでほしい情報</h3>
        <p>本名、住所、学校名、勤務先、電話番号、パスワード、深い健康情報など、個人が特定される情報は入力しないでください。</p>
      </section>
      <section class="home-panel">
        <h3>保存データの削除</h3>
        <p>${isLoggedIn() ? "削除すると、この端末の保存データとログイン中アカウントのクラウド保存データが消えます。" : "削除すると、この端末に保存されたニックネーム、診断回答、分析結果が消えます。"}</p>
        <div class="actions">
          <button class="btn danger" onclick="deleteAllData()">保存データを削除する</button>
          <button class="btn ghost" onclick="setScreen('mypage')">戻る</button>
        </div>
      </section>
    </main>
  `;
}

function renderLogin() {
  const cooldown = getLoginCooldownRemaining();
  const disabled = supabaseClient && cooldown === 0 ? "" : "disabled";
  return `
    <main class="screen narrow layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">ログインと同期</p>
          <h1>${isLoggedIn() ? "アカウント" : "メールでログイン"}</h1>
          <p>${isLoggedIn() ? "ログイン中は診断結果がクラウドに保存され、別端末からも見られます。" : "メールに届くリンクからログインできます。パスワードは不要です。"}</p>
        </div>
      </div>
      <section class="home-panel">
        ${isLoggedIn() ? `
          <h3>ログイン中</h3>
          <p>${escapeHtml(state.authEmail)} でログインしています。</p>
          <p class="hint">${escapeHtml(state.syncStatus || getStorageLabel())}</p>
          <div class="actions">
            <button class="btn primary" onclick="syncLocalToCloud()">今の診断結果をクラウド保存</button>
            <button class="btn ghost" onclick="loadCloudData()">クラウドから読み込み</button>
            <button class="btn ghost" onclick="setScreen('history')">診断履歴を見る</button>
            <button class="btn danger" onclick="logout()">ログアウト</button>
          </div>
        ` : `
          <div class="field">
            <label for="login-email">メールアドレス</label>
            <input id="login-email" type="email" placeholder="you@example.com" autocomplete="email" />
            <p class="hint">ログインリンクを送ります。届いたメールのリンクを開くとログインできます。</p>
          </div>
          <div class="actions">
            <button class="btn primary" onclick="loginWithGoogle()" ${supabaseClient ? "" : "disabled"}>Googleでログイン</button>
            <button class="btn primary" onclick="sendLoginLink()" ${disabled}>${cooldown ? `${formatCooldown(cooldown)}に再送できます` : "ログインリンクを送る"}</button>
            <button class="btn ghost" onclick="setScreen('profile')">ゲストで使う</button>
          </div>
          <p class="hint">メール送信には制限があります。届かない場合でも、短時間に何度も押さず少し待ってください。</p>
        `}
        ${state.authMessage ? `<p class="privacy-note">${escapeHtml(state.authMessage)}</p>` : ""}
        ${state.error ? `<p class="error-text">${escapeHtml(state.error)}</p>` : ""}
      </section>
    </main>
  `;
}

function renderHistory() {
  if (!isLoggedIn()) return renderEmpty("診断履歴を見るにはログインが必要です。", "ログインする", "login");
  const rows = state.diagnosisHistory || [];
  return `
    <main class="screen wide layout">
      <div class="section-head">
        <div>
          <p class="eyebrow">診断履歴</p>
          <h1>クラウドに保存した地図</h1>
          <p>同じアカウントでログインすると、別端末からもここに表示されます。</p>
        </div>
      </div>
      ${rows.length ? `
        <section class="goal-list">
          ${rows.map((row) => `
            <button class="goal-option" onclick="loadHistoryItem('${escapeHtml(row.id)}')">
              <strong>${escapeHtml(new Date(row.created_at).toLocaleString("ja-JP"))}</strong>
              <span>${escapeHtml(row.one_year_goal)}</span>
            </button>
          `).join("")}
        </section>
      ` : `
        <section class="empty-state">
          <h2 class="compact-title">クラウド履歴はまだありません。</h2>
          <p class="hint">診断を完了すると、ログイン中のアカウントに保存されます。</p>
        </section>
      `}
      <div class="actions">
        <button class="btn ghost" onclick="loadCloudData()">再読み込み</button>
        <button class="btn primary" onclick="setScreen('home')">ホームへ</button>
      </div>
    </main>
  `;
}

async function loginWithGoogle() {
  if (!supabaseClient) {
    state.error = "クラウド保存の設定が見つかりません。";
    render();
    return;
  }

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getRedirectUrl(),
    },
  });

  if (error) {
    state.error = "Googleログインを開始できませんでした。SupabaseのGoogle Provider設定を確認してください。";
    state.authMessage = error.message || "";
    render();
  }
}

async function sendLoginLink() {
  if (!supabaseClient) {
    state.error = "クラウド保存の設定が見つかりません。";
    render();
    return;
  }
  const email = document.querySelector("#login-email")?.value.trim();
  const cooldown = getLoginCooldownRemaining();
  if (cooldown > 0) {
    state.error = `ログインメールは${formatCooldown(cooldown)}に再送できます。`;
    render();
    return;
  }
  if (!email) {
    state.error = "メールアドレスを入力してください。";
    render();
    return;
  }
  state.error = "";
  state.authMessage = "ログインリンクを送信しています。";
  render();
  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getRedirectUrl(),
    },
  });
  if (error) {
    const message = error.message || "";
    if (message.includes("rate limit")) {
      setLoginCooldown(60 * 60);
      state.error = "短時間にログインメールを送りすぎたため、Supabase側で一時的に制限されています。少し時間をおいてからもう一度試してください。";
      state.authMessage = "目安として1時間ほど待ってから、公開URLを開き直してログインリンクを送り直してください。";
    } else {
      state.error = "ログインリンクを送れませんでした。SupabaseのAuth設定を確認してください。";
      state.authMessage = message;
    }
  } else {
    setLoginCooldown(60);
    state.authMessage = "メールを送信しました。届いたリンクを開くとログインできます。";
  }
  render();
}

async function logout() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  state.authUser = null;
  state.authEmail = "";
  state.diagnosisHistory = [];
  state.authMessage = "ログアウトしました。";
  render();
}

async function saveProfileToCloud() {
  if (!supabaseClient || !isLoggedIn() || !state.user) return;
  const { error } = await supabaseClient.from("profiles").upsert({
    id: state.authUser.id,
    nickname: state.user.nickname,
    age_group: state.user.age_group || null,
    updated_at: now(),
  });
  if (error) {
    console.warn("Failed to save profile", error);
    state.syncStatus = "プロフィールをクラウド保存できませんでした。";
  }
}

async function saveDiagnosisToCloud() {
  if (!supabaseClient || !isLoggedIn() || !state.diagnosisAnswer || !state.result) return;
  const userId = state.authUser.id;
  const { data: answerRow, error: answerError } = await supabaseClient
    .from("diagnosis_answers")
    .insert({
      user_id: userId,
      answers: state.diagnosisAnswer.answers || {},
    })
    .select("id, created_at")
    .single();

  if (answerError) {
    console.warn("Failed to save answers", answerError);
    state.syncStatus = "診断回答をクラウド保存できませんでした。";
    return;
  }

  const resultPayload = {
    user_id: userId,
    diagnosis_answer_id: answerRow.id,
    current_state: state.result.current_state,
    values: state.result.values || [],
    strength_seeds: state.result.strength_seeds || [],
    concerns: state.result.concerns || [],
    future_direction: state.result.future_direction,
    one_year_goal: state.result.one_year_goal,
    three_month_goal: state.result.three_month_goal,
    monthly_theme: state.result.monthly_theme,
    tomorrow_step: state.result.tomorrow_step,
    support_message: state.result.support_message,
    caution_note: state.result.caution_note,
  };

  const { data: resultRow, error: resultError } = await supabaseClient
    .from("diagnosis_results")
    .insert(resultPayload)
    .select("*")
    .single();

  if (resultError) {
    console.warn("Failed to save result", resultError);
    state.syncStatus = "診断結果をクラウド保存できませんでした。";
    return;
  }

  state.result = cloudRowToResult(resultRow);
  state.result.user_id = userId;
  state.result.diagnosis_answer_id = answerRow.id;
  state.selectedGoal = state.result.one_year_goal;
  state.syncStatus = "クラウドに保存しました。";
  await loadHistory();
  saveState();
}

async function syncLocalToCloud() {
  if (!isLoggedIn()) {
    setScreen("login");
    return;
  }
  if (!state.result) {
    state.authMessage = "保存できる診断結果がまだありません。";
    render();
    return;
  }
  await saveProfileToCloud();
  await saveDiagnosisToCloud();
  state.authMessage = "今の診断結果をクラウドに保存しました。";
  render();
}

async function loadCloudData() {
  if (!supabaseClient || !isLoggedIn()) return;
  await loadHistory();

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", state.authUser.id)
    .maybeSingle();

  if (profile) {
    state.user = {
      id: profile.id,
      nickname: profile.nickname,
      age_group: profile.age_group || "",
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  } else if (state.user) {
    await saveProfileToCloud();
  }

  if (state.diagnosisHistory.length) {
    state.result = cloudRowToResult(state.diagnosisHistory[0]);
    state.selectedGoal = state.result.one_year_goal;
    state.screen = "home";
  }

  state.syncStatus = "クラウドから読み込みました。";
  saveState();
  render();
}

async function loadHistory() {
  if (!supabaseClient || !isLoggedIn()) return;
  const { data, error } = await supabaseClient
    .from("diagnosis_results")
    .select("*")
    .eq("user_id", state.authUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Failed to load history", error);
    state.diagnosisHistory = [];
    state.syncStatus = "診断履歴を読み込めませんでした。";
    return;
  }
  state.diagnosisHistory = data || [];
}

function loadHistoryItem(id) {
  const row = state.diagnosisHistory.find((item) => item.id === id);
  if (!row) return;
  state.result = cloudRowToResult(row);
  state.selectedGoal = state.result.one_year_goal;
  saveState();
  setScreen("home");
}

function cloudRowToResult(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    diagnosis_answer_id: row.diagnosis_answer_id,
    current_state: row.current_state,
    values: asArray(row.values),
    strength_seeds: asArray(row.strength_seeds),
    concerns: asArray(row.concerns),
    future_direction: row.future_direction,
    one_year_goal: row.one_year_goal,
    three_month_goal: row.three_month_goal,
    monthly_theme: row.monthly_theme,
    tomorrow_step: row.tomorrow_step,
    support_message: row.support_message,
    caution_note: row.caution_note,
    created_at: row.created_at,
  };
}

async function deleteCloudData() {
  if (!supabaseClient || !isLoggedIn()) return;
  await supabaseClient.from("user_goals").delete().eq("user_id", state.authUser.id);
  await supabaseClient.from("diagnosis_results").delete().eq("user_id", state.authUser.id);
  await supabaseClient.from("diagnosis_answers").delete().eq("user_id", state.authUser.id);
  await supabaseClient.from("profiles").delete().eq("id", state.authUser.id);
}

async function deleteAllData() {
  const ok = window.confirm("保存データを削除します。よろしいですか？");
  if (!ok) return;
  if (isLoggedIn()) {
    await deleteCloudData();
  }
  localStorage.removeItem(STORAGE_KEY);
  const authUser = state.authUser;
  const authEmail = state.authEmail;
  state = { ...createInitialState(), authUser, authEmail };
  state.authMessage = "保存データを削除しました。";
  render();
}

function renderEmpty(message, cta, screen) {
  return `
    <main class="screen narrow">
      <section class="empty-state">
        <h1 class="compact-title">${escapeHtml(message)}</h1>
        <div class="actions" style="justify-content:center">
          <button class="btn primary" onclick="setScreen('${screen}')">${escapeHtml(cta)}</button>
        </div>
      </section>
    </main>
  `;
}

window.setScreen = setScreen;
window.submitProfile = submitProfile;
window.loginWithGoogle = loginWithGoogle;
window.sendLoginLink = sendLoginLink;
window.logout = logout;
window.syncLocalToCloud = syncLocalToCloud;
window.loadCloudData = loadCloudData;
window.loadHistoryItem = loadHistoryItem;
window.toggleChoice = toggleChoice;
window.previousQuestion = previousQuestion;
window.nextQuestion = nextQuestion;
window.skipQuestion = skipQuestion;
window.setAnswer = setAnswer;
window.updateTextAnswer = updateTextAnswer;
window.selectGoal = selectGoal;
window.updateSelectedGoal = updateSelectedGoal;
window.confirmGoal = confirmGoal;
window.restartDiagnosis = restartDiagnosis;
window.deleteAllData = deleteAllData;

initializeApp();
