import type { WordEntry } from './types';

/**
 * 単語モードのお題: 基本語彙。
 * 各語に日本語の意味と、可能なら韓国語の簡単な語釈を併記する。
 * `meaning.ko` は省略可能（韓国語 UI では非表示にできる）。
 */
export const WORDS: readonly WordEntry[] = [
  { hangul: '물', meaning: { ja: '水', ko: '마시는 무색의 액체' } },
  { hangul: '밥', meaning: { ja: 'ご飯', ko: '쌀로 지은 음식' } },
  { hangul: '학교', meaning: { ja: '学校', ko: '학생이 공부하는 곳' } },
  { hangul: '친구', meaning: { ja: '友達', ko: '친하게 지내는 사람' } },
  { hangul: '사랑', meaning: { ja: '愛', ko: '아끼고 위하는 마음' } },
  { hangul: '시간', meaning: { ja: '時間', ko: '흐르는 때' } },
  { hangul: '사람', meaning: { ja: '人', ko: '인간' } },
  { hangul: '나라', meaning: { ja: '国', ko: '국가' } },
  { hangul: '하늘', meaning: { ja: '空', ko: '머리 위에 펼쳐진 공간' } },
  { hangul: '바다', meaning: { ja: '海', ko: '넓고 짠 물' } },
  { hangul: '사과', meaning: { ja: 'りんご', ko: '빨갛고 둥근 과일' } },
  { hangul: '우유', meaning: { ja: '牛乳', ko: '소의 젖' } },
  { hangul: '커피', meaning: { ja: 'コーヒー', ko: '원두로 만든 음료' } },
  { hangul: '영화', meaning: { ja: '映画', ko: '화면에 비추는 작품' } },
  { hangul: '음악', meaning: { ja: '音楽', ko: '소리로 표현하는 예술' } },
  { hangul: '책', meaning: { ja: '本', ko: '글을 모아 엮은 것' } },
  { hangul: '학생', meaning: { ja: '学生', ko: '공부하는 사람' } },
  { hangul: '선생님', meaning: { ja: '先生', ko: '가르치는 사람' } },
  { hangul: '가족', meaning: { ja: '家族', ko: '한집안 사람들' } },
  { hangul: '여행', meaning: { ja: '旅行', ko: '여러 곳을 다니는 일' } },
  { hangul: '날씨', meaning: { ja: '天気', ko: '하늘의 상태' } },
  { hangul: '음식', meaning: { ja: '食べ物', ko: '먹는 것' } },
  { hangul: '시장', meaning: { ja: '市場', ko: '물건을 사고파는 곳' } },
  { hangul: '지하철', meaning: { ja: '地下鉄', ko: '땅속을 달리는 전철' } },
  { hangul: '전화', meaning: { ja: '電話', ko: '통화하는 기기' } },
  { hangul: '컴퓨터', meaning: { ja: 'コンピュータ', ko: '전자 계산 기기' } },
  { hangul: '한국', meaning: { ja: '韓国', ko: '대한민국' } },
  { hangul: '일본', meaning: { ja: '日本', ko: '일본이라는 나라' } },
  { hangul: '공부', meaning: { ja: '勉強', ko: '배우고 익히는 일' } },
  { hangul: '운동', meaning: { ja: '運動', ko: '몸을 움직이는 활동' } },
  { hangul: '노래', meaning: { ja: '歌', ko: '소리 내어 부르는 곡' } },
] as const;
