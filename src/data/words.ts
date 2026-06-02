import type { WordEntry } from './types';

/**
 * 単語モードのお題: 基本語彙。
 * 各語に日本語の意味とカナ読み、可能なら韓国語の簡単な語釈を併記する。
 * `meaning.ko` は省略可能（韓国語 UI では非表示にできる）。
 */
export const WORDS: readonly WordEntry[] = [
  { hangul: '물', reading: 'ムル', meaning: { ja: '水', ko: '마시는 무색의 액체' } },
  { hangul: '밥', reading: 'パプ', meaning: { ja: 'ご飯', ko: '쌀로 지은 음식' } },
  { hangul: '학교', reading: 'ハッキョ', meaning: { ja: '学校', ko: '학생이 공부하는 곳' } },
  { hangul: '친구', reading: 'チング', meaning: { ja: '友達', ko: '친하게 지내는 사람' } },
  { hangul: '사랑', reading: 'サラン', meaning: { ja: '愛', ko: '아끼고 위하는 마음' } },
  { hangul: '시간', reading: 'シガン', meaning: { ja: '時間', ko: '흐르는 때' } },
  { hangul: '사람', reading: 'サラム', meaning: { ja: '人', ko: '인간' } },
  { hangul: '나라', reading: 'ナラ', meaning: { ja: '国', ko: '국가' } },
  { hangul: '하늘', reading: 'ハヌル', meaning: { ja: '空', ko: '머리 위에 펼쳐진 공간' } },
  { hangul: '바다', reading: 'パダ', meaning: { ja: '海', ko: '넓고 짠 물' } },
  { hangul: '사과', reading: 'サグァ', meaning: { ja: 'りんご', ko: '빨갛고 둥근 과일' } },
  { hangul: '우유', reading: 'ウユ', meaning: { ja: '牛乳', ko: '소의 젖' } },
  { hangul: '커피', reading: 'コピ', meaning: { ja: 'コーヒー', ko: '원두로 만든 음료' } },
  { hangul: '영화', reading: 'ヨンファ', meaning: { ja: '映画', ko: '화면에 비추는 작품' } },
  { hangul: '음악', reading: 'ウマク', meaning: { ja: '音楽', ko: '소리로 표현하는 예술' } },
  { hangul: '책', reading: 'チェク', meaning: { ja: '本', ko: '글을 모아 엮은 것' } },
  { hangul: '학생', reading: 'ハクセン', meaning: { ja: '学生', ko: '공부하는 사람' } },
  { hangul: '선생님', reading: 'ソンセンニム', meaning: { ja: '先生', ko: '가르치는 사람' } },
  { hangul: '가족', reading: 'カジョク', meaning: { ja: '家族', ko: '한집안 사람들' } },
  { hangul: '여행', reading: 'ヨヘン', meaning: { ja: '旅行', ko: '여러 곳을 다니는 일' } },
  { hangul: '날씨', reading: 'ナルシ', meaning: { ja: '天気', ko: '하늘의 상태' } },
  { hangul: '음식', reading: 'ウムシク', meaning: { ja: '食べ物', ko: '먹는 것' } },
  { hangul: '시장', reading: 'シジャン', meaning: { ja: '市場', ko: '물건을 사고파는 곳' } },
  { hangul: '지하철', reading: 'チハチョル', meaning: { ja: '地下鉄', ko: '땅속을 달리는 전철' } },
  { hangul: '전화', reading: 'チョヌァ', meaning: { ja: '電話', ko: '통화하는 기기' } },
  { hangul: '컴퓨터', reading: 'コンピュト', meaning: { ja: 'コンピュータ', ko: '전자 계산 기기' } },
  { hangul: '한국', reading: 'ハングク', meaning: { ja: '韓国', ko: '대한민국' } },
  { hangul: '일본', reading: 'イルボン', meaning: { ja: '日本', ko: '일본이라는 나라' } },
  { hangul: '공부', reading: 'コンブ', meaning: { ja: '勉強', ko: '배우고 익히는 일' } },
  { hangul: '운동', reading: 'ウンドン', meaning: { ja: '運動', ko: '몸을 움직이는 활동' } },
  { hangul: '노래', reading: 'ノレ', meaning: { ja: '歌', ko: '소리 내어 부르는 곡' } },
] as const;
