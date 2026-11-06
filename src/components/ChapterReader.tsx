import React, { useState } from 'react';
import { Chapter, StudentProgress } from '../types/curriculum';
import {
  CheckCircle2,
  BookOpen,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  Bookmark,
  Send,
  Eye,
  FileText,
  ListOrdered,
  Users,
  Shield,
  Zap,
  GitBranch,
  TrendingUp,
  Compass,
  BookmarkCheck,
  Feather,
  Mic,
  Award,
  Layers,
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface ChapterReaderProps {
  chapters: Chapter[];
  currentChapter: Chapter;
  onSelectChapter: (chapter: Chapter) => void;
  activeStudent: StudentProgress;
  onMarkRead: (chapterId: string) => void;
  onSaveReflection: (chapterId: string, text: string) => void;
  onGoToPractice: () => void;
  onGoToQuiz: () => void;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  chapters,
  currentChapter,
  onSelectChapter,
  activeStudent,
  onMarkRead,
  onSaveReflection,
  onGoToPractice,
  onGoToQuiz,
}) => {
  const [activeMindMapIndex, setActiveMindMapIndex] = useState<number>(0);
  const [selectedTextSection, setSelectedTextSection] = useState<number>(0);
  const [reflectionInput, setReflectionInput] = useState<string>(
    activeStudent.reflections?.[currentChapter.id] || ''
  );
  const [reflectionSavedMessage, setReflectionSavedMessage] = useState(false);

  // Sync reflection input when chapter changes
  React.useEffect(() => {
    setReflectionInput(activeStudent.reflections?.[currentChapter.id] || '');
    setSelectedTextSection(0);
    setActiveMindMapIndex(0);
    setReflectionSavedMessage(false);
  }, [currentChapter.id, activeStudent]);

  const isRead = activeStudent.readChapters.includes(currentChapter.id);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionInput.trim()) return;
    onSaveReflection(currentChapter.id, reflectionInput.trim());
    sounds.playCorrect();
    setReflectionSavedMessage(true);
    setTimeout(() => setReflectionSavedMessage(false), 3000);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Eye': return <Eye className="w-5 h-5 text-amber-600" />;
      case 'FileText': return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'ListOrdered': return <ListOrdered className="w-5 h-5 text-emerald-600" />;
      case 'Code': return <Layers className="w-5 h-5 text-teal-600" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-cyan-600" />;
      case 'Users': return <Users className="w-5 h-5 text-blue-600" />;
      case 'Shield': return <Shield className="w-5 h-5 text-rose-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'GitBranch': return <GitBranch className="w-5 h-5 text-indigo-500" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'Compass': return <Compass className="w-5 h-5 text-cyan-500" />;
      case 'BookmarkCheck': return <BookmarkCheck className="w-5 h-5 text-blue-500" />;
      case 'Feather': return <Feather className="w-5 h-5 text-purple-500" />;
      case 'Mic': return <Mic className="w-5 h-5 text-rose-500" />;
      case 'Award': return <Award className="w-5 h-5 text-amber-600" />;
      default: return <BookOpen className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Chapter Carousel / Navigation Bar */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Pilih Bab Pelajaran
            </h2>
            <p className="text-xs text-slate-500">
              Kurikulum Merdeka Bahasa Indonesia SMP/MTs Kelas IX
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-medium text-slate-900">
              {activeStudent.readChapters.length} dari 6 Bab
            </span>
            <span>dibaca</span>
          </div>
        </div>

        {/* Chapter Grid Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {chapters.map((ch) => {
            const isSelected = ch.id === currentChapter.id;
            const chapterRead = activeStudent.readChapters.includes(ch.id);
            const quizScore = activeStudent.quizResults?.[ch.id]?.score;

            return (
              <button
                key={ch.id}
                onClick={() => {
                  onSelectChapter(ch);
                  sounds.playClick();
                }}
                className={`flex flex-col p-3 rounded-lg text-left transition-all relative border ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500/20'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Bab {ch.number}
                  </span>
                  {chapterRead && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <h3
                  className={`text-xs font-bold line-clamp-1 ${
                    isSelected ? 'text-indigo-950' : 'text-slate-800'
                  }`}
                >
                  {ch.title}
                </h3>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{ch.estimatedMinutes} mnt</span>
                  {quizScore !== undefined && (
                    <span
                      className={`font-semibold tabular-nums ${
                        quizScore >= 75 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {quizScore}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Chapter Header Banner */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-semibold text-indigo-700">Bab {currentChapter.number}</span>
            <span>·</span>
            <span>{currentChapter.theme}</span>
            <span>·</span>
            <span>Estimasi {currentChapter.estimatedMinutes} Menit</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {currentChapter.title}: {currentChapter.subtitle}
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Pelajari konsep kunci, eksplorasi peta nalar, dan amati contoh konkret penerapan bahasa Indonesia yang baik dan benar sesuai standar Kurikulum Merdeka.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                onMarkRead(currentChapter.id);
                sounds.playCorrect();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isRead
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isRead ? 'Telah Ditandai Selesai Dibaca (+50 XP)' : 'Tandai Selesai Dibaca (+50 XP)'}</span>
            </button>

            <button
              onClick={() => {
                onGoToPractice();
                sounds.playClick();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <span>Lanjut Latihan Soal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                onGoToQuiz();
                sounds.playClick();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Kuis Evaluasi Bab</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Mind Map & Conceptual Visualizer */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Peta Konsep & Nalar Bab {currentChapter.number}
              </h2>
              <p className="text-xs text-slate-500">
                Klik pilar materi untuk melihat eksplorasi pemikiran terstruktur
              </p>
            </div>
          </div>
        </div>

        {/* Mind Map Horizontal Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {currentChapter.mindMap.map((node, idx) => {
            const isActive = activeMindMapIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveMindMapIndex(idx);
                  sounds.playClick();
                }}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    Pilar 0{idx + 1}
                  </span>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isActive ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {node.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {node.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Mind Map Detail Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              {activeMindMapIndex + 1}
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {currentChapter.mindMap[activeMindMapIndex].title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {currentChapter.mindMap[activeMindMapIndex].description}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Intisari Pemahaman:
                </span>
                <ul className="space-y-1.5">
                  {currentChapter.mindMap[activeMindMapIndex].keyPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-indigo-600 font-bold shrink-0">·</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ringkasan Materi & Tips Belajar */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Ringkasan Materi Esensial
            </h2>
            <p className="text-xs text-slate-500">
              Materi inti yang disusun ringkas, padat, dan mudah diingat
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {currentChapter.summarySections.map((sec, sIdx) => (
            <div
              key={sIdx}
              className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {getIcon(sec.iconName)}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {sec.heading}
                </h3>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {sec.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {sec.tips && sec.tips.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-amber-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    Kiat Belajar Guru:
                  </span>
                  {sec.tips.map((t, tIdx) => (
                    <p key={tIdx} className="text-amber-800/90 leading-relaxed">
                      {t}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bedah Teks Interaktif (Interactive Text Dissection) */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {currentChapter.interactiveText.title}
              </h2>
              <p className="text-xs text-slate-500">
                {currentChapter.interactiveText.intro}
              </p>
            </div>
          </div>
        </div>

        {/* The Text Layout with Interactive Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Text Flow Block (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {currentChapter.interactiveText.sections.map((sec, idx) => {
              const isSelected = selectedTextSection === idx;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedTextSection(idx);
                    sounds.playClick();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? `${sec.colorClass} ring-2 ring-indigo-500/30 shadow-xs scale-[1.01]`
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wide uppercase opacity-80">
                      Bagian 0{idx + 1}: {sec.label}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Klik untuk analisis
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-serif-display leading-relaxed">
                    "{sec.content}"
                  </p>
                </div>
              );
            })}
          </div>

          {/* Analysis Explanation Deck (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-xl p-5 sticky top-24 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-indigo-400 font-semibold tracking-wide uppercase">
                Telaah Struktur & Kaidah
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                Bagian {selectedTextSection + 1} dari {currentChapter.interactiveText.sections.length}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                {currentChapter.interactiveText.sections[selectedTextSection].label}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentChapter.interactiveText.sections[selectedTextSection].explanation}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Kutipan Bagian:</span>
              <p className="text-xs text-slate-200 italic font-serif-display line-clamp-3 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                "{currentChapter.interactiveText.sections[selectedTextSection].content}"
              </p>
            </div>

            <div className="pt-2 text-[11px] text-indigo-300 bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-900/60">
              💡 {currentChapter.interactiveText.summaryNote}
            </div>
          </div>
        </div>
      </section>

      {/* Glosarium Kata Pintar */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Glosarium Kata Pintar Bab {currentChapter.number}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentChapter.vocabulary.map((vocab, vIdx) => (
            <div
              key={vIdx}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-900">
                  {vocab.word}
                </span>
                <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                  {vocab.type}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                {vocab.meaning}
              </p>
              <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-200/60">
                Contoh: "{vocab.exampleSentence}"
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Refleksi Belajar Siswa */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Refleksi Belajar Saya (Bab {currentChapter.number})
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Tuliskan apa saja pemahaman baru atau hal yang masih ingin kamu tanyakan ke Bu Guru tentang bab ini.
        </p>

        <form onSubmit={handleSaveReflection} className="space-y-3">
          <textarea
            value={reflectionInput}
            onChange={(e) => setReflectionInput(e.target.value)}
            placeholder="Tuliskan refleksimu di sini, misalnya: 'Setelah mempelajari bab ini, saya baru tahu bahwa konjungsi antarkalimat wajib diikuti koma...'"
            rows={3}
            className="w-full text-xs sm:text-sm p-3.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Refleksi akan dapat dibaca langsung oleh guru di Dashboard Monitoring.
            </span>

            <div className="flex items-center gap-2">
              {reflectionSavedMessage && (
                <span className="text-xs font-semibold text-emerald-600">
                  Tersimpan (+25 XP)
                </span>
              )}
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simpan Catatan</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Footer Navigation Next Steps */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
        <div>
          <h4 className="text-sm font-bold text-indigo-950">
            Siap Menguji Pemahamanmu?
          </h4>
          <p className="text-xs text-indigo-800/80">
            Latih kemampuanmu dengan kuis kilat, pilah kategori, dan susun struktur kalimat.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              onGoToPractice();
              sounds.playClick();
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Mulai Latihan Interaktif</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
