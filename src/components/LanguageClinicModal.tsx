import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface LanguageClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalysisResult {
  wordCount: number;
  detectedConjunctions: string[];
  spellingSuggestions: { original: string; suggested: string; explanation: string }[];
  sentenceType: string;
  sentimentTone: string;
  pedagogicalTips: string[];
}

export const LanguageClinicModal: React.FC<LanguageClinicModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  if (!isOpen) return null;

  const sampleSnippets = [
    {
      title: 'Contoh Teks Siswa 1 (Perlu Perbaikan Ejaan)',
      text: 'Kemarin kami melakukan praktek pengamatan di hutan bakau. Kwalitas air disana sangat jernih, namun kita harus merubah kebiasaan membuang sampah sembarangan.',
    },
    {
      title: 'Contoh Teks 2 (Pidato Persuasif)',
      text: 'Oleh karena itu, marilah kita buang rasa malas dan asah keterampilan berpikir kritis menyongsong Indonesia Emas 2045.',
    },
    {
      title: 'Contoh Teks 3 (Teks Prosedur Inversi)',
      text: 'Rebuslah air hingga mendidih, lalu masukkan daun teh kering dan aduklah secara perlahan.',
    },
  ];

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    sounds.playClick();

    const text = inputText;
    const words = text.trim().split(/\s+/);

    // Rule-based dictionary of common EYD mistakes
    const commonMistakes: Record<string, { correct: string; reason: string }> = {
      praktek: { correct: 'praktik', reason: 'Sesuai KBBI dan EYD V, kata serapan yang tepat adalah "praktik".' },
      kwalitas: { correct: 'kualitas', reason: 'Huruf "kw" diserap menjadi "k" atau "ku" -> "kualitas".' },
      merubah: { correct: 'mengubah', reason: 'Bentuk dasar adalah "ubah" dengan awalan meN- menjadi "mengubah", bukan "merubah".' },
      disana: { correct: 'di sana', reason: 'Kata depan "di" yang menyatakan tempat wajib ditulis terpisah.' },
      dimana: { correct: 'di mana', reason: 'Kata tanya tempat wajib ditulis terpisah: "di mana".' },
      aktifitas: { correct: 'aktivitas', reason: 'Diserap dari kata activity berakhiran -itas menjadi "aktivitas".' },
      antri: { correct: 'antre', reason: 'Bentuk baku dalam KBBI adalah "antre", bukan "antri".' },
      jadual: { correct: 'jadwal', reason: 'Bentuk baku dalam KBBI adalah "jadwal".' },
      nasehat: { correct: 'nasihat', reason: 'Bentuk serapan baku dari bahasa Arab adalah "nasihat".' },
      resiko: { correct: 'risiko', reason: 'Bentuk serapan baku adalah "risiko".' },
    };

    const detectedSpelling: { original: string; suggested: string; explanation: string }[] = [];
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[.,!?;:"'()]/g, '');
      if (commonMistakes[clean]) {
        if (!detectedSpelling.some((item) => item.original.toLowerCase() === clean)) {
          detectedSpelling.push({
            original: clean,
            suggested: commonMistakes[clean].correct,
            explanation: commonMistakes[clean].reason,
          });
        }
      }
    });

    // Conjunction detection
    const conjunctionPool = [
      'dan',
      'atau',
      'tetapi',
      'namun',
      'oleh karena itu',
      'karena',
      'sehingga',
      'sebelum',
      'kemudian',
      'setelah itu',
      'akan tetapi',
      'meskipun',
      'sebaliknya',
    ];

    const detectedConj: string[] = [];
    const lower = text.toLowerCase();
    conjunctionPool.forEach((c) => {
      if (lower.includes(c)) {
        detectedConj.push(c);
      }
    });

    // Check sentence type & tone
    let sentenceType = 'Teks Naratif / Deskriptif';
    if (lower.includes('marilah') || lower.includes('hendaknya') || lower.includes('ayo')) {
      sentenceType = 'Kalimat Ajakan / Pidato Persuasif';
    } else if (lower.includes('lah ') || lower.includes('kan ') || lower.includes('masukkan') || lower.includes('tuangkan')) {
      sentenceType = 'Kalimat Imperatif / Teks Prosedur';
    } else if (lower.includes('adalah') || lower.includes('merupakan') || lower.includes('terdiri atas')) {
      sentenceType = 'Kalimat Definisi / Laporan Hasil Observasi (LHO)';
    }

    const tips: string[] = [];
    if (detectedSpelling.length > 0) {
      tips.push(`Ditemukan ${detectedSpelling.length} kata tidak baku. Periksa dan ganti sesuai rekomendasi KBBI V.`);
    } else {
      tips.push('Pilihan kata sudah rapi dan sesuai dengan pedoman ejaan baku.');
    }

    if (lower.includes('namun') && !lower.includes('namun,')) {
      tips.push('Perhatian: Kata "namun" adalah konjungsi antarkalimat. Sebaiknya ditulis di awal kalimat dan diikuti koma: "Namun, ...".');
    }

    if (words.length > 25) {
      tips.push('Kalimat relatif panjang. Pertimbangkan memecahnya menjadi 2 kalimat agar napas gagasan lebih nyaman dibaca.');
    } else {
      tips.push('Panjang kalimat ideal dan proporsional untuk teks bacaan tingkat SMP.');
    }

    setAnalysis({
      wordCount: words.length,
      detectedConjunctions: detectedConj,
      spellingSuggestions: detectedSpelling,
      sentenceType,
      sentimentTone: 'Edukatif & Konstruktif',
      pedagogicalTips: tips,
    });

    sounds.playCorrect();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-scale-up my-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Klinik Bahasa & Analisis Kalimat
              </h3>
              <p className="text-xs text-slate-500">
                Uji ejaan kata baku, konjungsi, dan struktur kalimat karanganmu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset sample buttons */}
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
            Coba Contoh Kalimat Cepat:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleSnippets.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(s.text);
                  sounds.playClick();
                }}
                className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik atau tempel kalimat atau paragraf tulisanmu di sini untuk dianalisis oleh Klinik Bahasa..."
            rows={4}
            className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Mendukung pengecekan EYD V, kata hubung, dan jenis kalimat kurikulum 9.
            </span>
            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analisis Sekarang</span>
            </button>
          </div>
        </div>

        {/* Analysis Results View */}
        {analysis && (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Jumlah Kata</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {analysis.wordCount} Kata
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Identifikasi Ragam Teks</span>
                <span className="font-bold text-indigo-700 line-clamp-1">
                  {analysis.sentenceType}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Konjungsi Terdeteksi</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {analysis.detectedConjunctions.length > 0
                    ? analysis.detectedConjunctions.join(', ')
                    : 'Tidak ada'}
                </span>
              </div>
            </div>

            {/* Spelling Suggestions */}
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Pemeriksaan Ejaan & Kata Baku (EYD V):
              </span>
              {analysis.spellingSuggestions.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hebat! Tidak terdeteksi kata nonbaku yang umum.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {analysis.spellingSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="line-through text-rose-700 font-semibold">
                          "{item.original}"
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-emerald-700 font-bold">
                          "{item.suggested}"
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-snug pl-5">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pedagogical Tips */}
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1">
                Catatan Asisten Literasi:
              </span>
              <ul className="space-y-1 text-xs text-slate-600">
                {analysis.pedagogicalTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">·</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
