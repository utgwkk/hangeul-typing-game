import type { SentenceEntry } from './types';

/**
 * 文章モードのお題: 短い例文（スペース・句読点を含む）。
 * `meaning` は日本語訳。韓国語 UI では原文と同じになるため省略可能。
 */
export const SENTENCES: readonly SentenceEntry[] = [
  { hangul: '안녕하세요.', meaning: { ja: 'こんにちは。' } },
  { hangul: '감사합니다.', meaning: { ja: 'ありがとうございます。' } },
  { hangul: '맛있어요.', meaning: { ja: 'おいしいです。' } },
  { hangul: '사랑해요.', meaning: { ja: '愛しています。' } },
  { hangul: '오늘 날씨가 좋아요.', meaning: { ja: '今日は天気がいいです。' } },
  { hangul: '저는 학생이에요.', meaning: { ja: '私は学生です。' } },
  { hangul: '한국어를 공부해요.', meaning: { ja: '韓国語を勉強しています。' } },
  { hangul: '내일 다시 만나요.', meaning: { ja: 'また明日会いましょう。' } },
  { hangul: '이름이 뭐예요?', meaning: { ja: '名前は何ですか？' } },
  { hangul: '잘 먹겠습니다.', meaning: { ja: 'いただきます。' } },
  { hangul: '어디에 가요?', meaning: { ja: 'どこに行きますか？' } },
  { hangul: '물 좀 주세요.', meaning: { ja: '水をください。' } },
  { hangul: '정말 재미있어요.', meaning: { ja: '本当に面白いです。' } },
  { hangul: '천천히 말해 주세요.', meaning: { ja: 'ゆっくり話してください。' } },
  { hangul: '다시 한번 말해 주세요.', meaning: { ja: 'もう一度言ってください。' } },
] as const;
