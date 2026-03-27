import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { Music, BookOpen, ListMusic, Sparkles, ArrowRight, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

const SERVICE_TYPES = [
  '새벽기도',
  '오후찬양',
  '수요기도회',
  '금요철야',
  '주일 본 예배'
];

const ERA_OPTIONS = [
  '전체 (상관없음)',
  '1980-90년대 (고전 복음성가)',
  '2000년대 (어노인팅, 마커스 초기)',
  '2010년대 (제이워십, 아이제이아 등)',
  '최신/현대 (2020년대 이후)'
];

export default function App() {
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  const [formData, setFormData] = useState({
    serviceType: '주일 본 예배',
    theme: '',
    songCount: 4,
    preference: '',
    preferredEra: '전체 (상관없음)'
  });
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY });
      
      const systemInstruction = `너는 교회 찬양 인도자를 돕는 전문 '워십 디렉터 AI'이다. 예배의 성격, 시간대, 요청 곡 수, 코드(Key) 흐름을 분석하여 영성이 깊으면서도 음악적으로 매끄러운 찬양 콘티를 구성한다.

# 예배 상황별 큐레이션 가이드
1. 새벽기도용: 잔잔한 피아노 반주에 어울리는 묵상 곡. 가사가 깊고 고백적인 곡 위주.
2. 오후찬양용: 성도들의 잠을 깨우는 밝고 경쾌한 리듬(셔플, 고고)의 곡과 잘 알려진 복음성가.
3. 수요기도회용: 말씀의 주제를 강화하고 기도로 바로 연결될 수 있는 간절한 찬양.
4. 금요철야용: 빌드업이 확실한 곡 구성. 느린 곡에서 빠른 곡, 다시 뜨거운 통성기도로 이어지는 흐름.
5. 본 예배용: 경건한 찬송가와 현대적인 경배와 찬양(Praise & Worship)의 조화로운 믹스.

# 음악적 상세 지침
- 코드 흐름(Key Progression): 동일한 키(Key)로 묶거나, 4도/5도권 전조를 통해 흐름이 끊기지 않게 배치한다. (예: G -> C, G -> D)
- 코드 진행 팁: 곡 사이를 자연스럽게 잇는 연결 코드(Passing Chord)나 전조 브릿지 코드를 제시한다.
- 악보 정보: 곡의 구조(Verse, Chorus, Bridge)와 리듬 스타일(4/4, 3/4, 6/8 등)을 명시한다.

# 출력 포맷 (반드시 이 형식을 지킬 것)
1. **[예배 명칭 및 주제]**
2. **[찬양 목록 Table]** (번호 | 곡 제목 | Key | 템포 | 비고)
3. **[상세 콘티 가이드]**
   - 각 곡의 선정 이유
   - 곡 사이의 연결 포인트 (예: "G코드 그대로 유지하며 리듬만 고고로 전환")
   - 추천 코드 진행 (예: G -> D/F# -> Em -> C 와 같이 텍스트로 직관적으로 표기, 수식이나 LaTeX 기호 사용 금지)
4. **[멘트 및 기도회 연결]** (인도자 멘트 예시 및 기도 제목)

# 제약 사항
- 실제 존재하는 찬양곡과 찬송가만 추천한다.
- 무리한 키 변화(예: C에서 F#으로 갑작스런 변화)는 피하고 대안을 제시한다.`;

      const prompt = `다음 정보를 바탕으로 찬양 콘티를 구성해줘.
- 예배 종류: ${formData.serviceType}
- 주제 및 말씀: ${formData.theme || '자유 주제'}
- 요청 곡 수: ${formData.songCount}곡
- 선호하는 연대: ${formData.preferredEra}
- 선호하는 첫 곡 또는 Key (선택사항): ${formData.preference || '없음'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      if (response.text) {
        setResult(response.text);
        setStep('result');
      } else {
        throw new Error('응답을 생성하지 못했습니다.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setStep('form');
    }
  };

  const resetForm = () => {
    setStep('form');
    setResult('');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-stone-800 rounded-2xl mb-4 shadow-lg"
          >
            <Music className="w-8 h-8 text-stone-50" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-serif font-bold text-stone-900 tracking-tight"
          >
            Worship Director AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-lg text-stone-600"
          >
            영성과 음악성이 조화된 최적의 찬양 콘티를 구성해 드립니다.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <label htmlFor="serviceType" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
                      <ListMusic className="w-4 h-4 text-stone-500" />
                      예배 종류
                    </label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-colors outline-none"
                    >
                      {SERVICE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Theme */}
                  <div>
                    <label htmlFor="theme" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
                      <BookOpen className="w-4 h-4 text-stone-500" />
                      주제 및 말씀 (선택)
                    </label>
                    <input
                      type="text"
                      id="theme"
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      placeholder="예: 성령의 임재와 회복 (사도행전 2:1-4)"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-colors outline-none"
                    />
                  </div>

                  {/* Song Count */}
                  <div>
                    <label htmlFor="songCount" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
                      <Music className="w-4 h-4 text-stone-500" />
                      요청 곡 수
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        id="songCount"
                        name="songCount"
                        min="2"
                        max="6"
                        value={formData.songCount}
                        onChange={handleInputChange}
                        className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                      />
                      <span className="w-12 text-center font-mono font-medium text-stone-700 bg-stone-100 py-1 rounded-lg">
                        {formData.songCount}곡
                      </span>
                    </div>
                  </div>

                  {/* Preferred Era */}
                  <div>
                    <label htmlFor="preferredEra" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
                      <RefreshCw className="w-4 h-4 text-stone-500" />
                      선호하는 연대 (출시 시기)
                    </label>
                    <select
                      id="preferredEra"
                      name="preferredEra"
                      value={formData.preferredEra}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-colors outline-none"
                    >
                      {ERA_OPTIONS.map(era => (
                        <option key={era} value={era}>{era}</option>
                      ))}
                    </select>
                  </div>

                  {/* Preference */}
                  <div>
                    <label htmlFor="preference" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
                      <Sparkles className="w-4 h-4 text-stone-500" />
                      선호하는 첫 곡 또는 Key (선택)
                    </label>
                    <input
                      type="text"
                      id="preference"
                      name="preference"
                      value={formData.preference}
                      onChange={handleInputChange}
                      placeholder="예: 첫 곡은 '주 임재 안에서' G키로 해주세요"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-800 focus:border-stone-800 transition-colors outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 text-white py-4 px-6 rounded-xl font-medium transition-all active:scale-[0.98]"
                >
                  콘티 생성하기
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-sm border border-stone-200 p-16 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <Loader2 className="w-12 h-12 text-stone-800 animate-spin mb-6" />
              <h3 className="text-xl font-serif font-semibold text-stone-900 mb-2">
                기도하며 콘티를 준비 중입니다...
              </h3>
              <p className="text-stone-500">
                예배의 흐름과 영성을 고려하여 곡을 선별하고 있습니다.
              </p>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 sm:p-10">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 py-3 px-6 rounded-full font-medium transition-all shadow-sm active:scale-[0.98]"
                >
                  <RefreshCw className="w-4 h-4" />
                  새로운 콘티 구성하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
