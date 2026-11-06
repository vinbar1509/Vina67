import React from 'react';
import { Chapter, StudentProgress } from '../types/curriculum';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Printer,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface StudentDashboardProps {
  activeStudent: StudentProgress;
  chapters: Chapter[];
  onSelectChapter: (chapter: Chapter) => void;
  onGoToMateri: (chapter: Chapter) => void;
  onGoToPractice: (chapter: Chapter) => void;
  onGoToQuiz: (chapter: Chapter) => void;
  onOpenCertificate: (chapter: Chapter, score: number) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeStudent,
  chapters,
  onGoToMateri,
  onGoToPractice,
  onGoToQuiz,
  onOpenCertificate,
}) => {
  const readCount = activeStudent.readChapters.length;
  const quizPassedCount = Object.values(activeStudent.quizResults || {}).filter(
    (q) => q.passed
  ).length;

  const totalPossible = chapters.length;
  const overallPercentage = Math.round(
    ((readCount + quizPassedCount) / (totalPossible * 2)) * 100
  );

  // Level calculation
  const xp = activeStudent.xp || 0;
  let levelTitle = 'Pejuang Literasi Pemula';
  let levelNumber = 1;
  if (xp >= 1000) {
    levelTitle = 'Mahaguru Sastra Remaja';
    levelNumber = 4;
  } else if (xp >= 600) {
    levelTitle = 'Cendekiawan Bahasa Muda';
    levelNumber = 3;
  } else if (xp >= 250) {
    levelTitle = 'Penjelajah Kata Andal';
    levelNumber = 2;
  }

  const allPossibleBadges = [
    { id: 'b1', name: 'Pakar Deskripsi', chapter: 'Bab 1', desc: 'Menuntaskan evaluasi Teks Deskripsi Keluarga' },
    { id: 'b2', name: 'Pengrajin Prosedur', chapter: 'Bab 2', desc: 'Menuntaskan evaluasi Teks Prosedur & Infografik' },
    { id: 'b3', name: 'Detektif Fakta & Opini', chapter: 'Bab 3', desc: 'Menuntaskan evaluasi Teks Diskusi & Netiket' },
    { id: 'b4', name: 'Inovator Muda', chapter: 'Bab 4', desc: 'Menuntaskan evaluasi Teks Eksplanasi Wirausaha' },
    { id: 'b5', name: 'Penjaga Maritim', chapter: 'Bab 5', desc: 'Menuntaskan evaluasi Teks LHO Kelautan' },
    { id: 'b6', name: 'Orator Ulung', chapter: 'Bab 6', desc: 'Menuntaskan evaluasi Teks Pidato Persuasif' },
    { id: 'b7', name: 'Master Bahasa Kelas 9', chapter: 'Bab 1-6', desc: 'Menuntaskan seluruh evaluasi bab dengan nilai KKM' },
  ];

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Student Profile Hero Header */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {activeStudent.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-semibold text-indigo-700">Kelas {activeStudent.classRoom}</span>
                <span>·</span>
                <span>NISN/ID: {activeStudent.studentId}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {activeStudent.studentName}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Tingkat: <span className="font-bold text-indigo-600">{levelTitle}</span> (Level {levelNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rapor Belajar</span>
            </button>
          </div>
        </div>

        {/* 4 Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[11px] text-slate-500 block">Total Pengalaman (XP)</span>
            <span className="text-xl font-bold text-indigo-600 tabular-nums">
              {xp} XP
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[11px] text-slate-500 block">Materi Selesai Dibaca</span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {readCount} / {totalPossible} Bab
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[11px] text-slate-500 block">Kuis Tuntas KKM (75+)</span>
            <span className="text-xl font-bold text-emerald-600 tabular-nums">
              {quizPassedCount} / {totalPossible} Bab
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[11px] text-slate-500 block">Lencana Terkumpul</span>
            <span className="text-xl font-bold text-amber-600 tabular-nums">
              {activeStudent.badges?.length || 0} Lencana
            </span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Kemajuan Belajar Semester Keseluruhan</span>
            <span className="tabular-nums font-bold text-indigo-600">{overallPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </section>

      {/* Teacher Note Callout (If Any) */}
      {activeStudent.teacherNote && (
        <section className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <MessageSquare className="w-4 h-4 text-amber-700" />
            <span>Catatan Khusus dari Guru (Bu Vina / Guru Bahasa Indonesia)</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 font-serif-display italic leading-relaxed pl-6">
            "{activeStudent.teacherNote}"
          </p>
        </section>
      )}

      {/* Chapter Progress Roadmap */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Perkembangan Capaian Tiap Bab
            </h2>
            <p className="text-xs text-slate-500">
              Pantau status pembacaan materi, skor latihan interaktif, dan hasil kuis evaluasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((ch) => {
            const isRead = activeStudent.readChapters.includes(ch.id);
            const practice = activeStudent.practiceScores?.[ch.id];
            const quiz = activeStudent.quizResults?.[ch.id];

            return (
              <div
                key={ch.id}
                className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                      Bab 0{ch.number}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {ch.subtitle}
                    </p>
                  </div>

                  {quiz?.passed ? (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded">
                      Tuntas KKM
                    </span>
                  ) : quiz ? (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded">
                      Remedial
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded">
                      Belum Ujian
                    </span>
                  )}
                </div>

                {/* Sub-status indicators */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-500 block">Materi</span>
                    <span className="font-semibold text-slate-800">
                      {isRead ? '✓ Selesai' : 'Belum'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-500 block">Latihan</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {practice ? `${practice.scorePercent}%` : '-'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-500 block">Kuis Evaluasi</span>
                    <span
                      className={`font-bold tabular-nums ${
                        quiz?.passed
                          ? 'text-emerald-600'
                          : quiz
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {quiz ? `${quiz.score}/100` : '-'}
                    </span>
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={() => onGoToMateri(ch)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Buka Materi
                  </button>

                  <button
                    onClick={() => onGoToPractice(ch)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Latihan Soal
                  </button>

                  <button
                    onClick={() => onGoToQuiz(ch)}
                    className="text-amber-700 hover:text-amber-900 font-semibold"
                  >
                    Ikuti Kuis
                  </button>

                  {quiz?.passed && (
                    <button
                      onClick={() => onOpenCertificate(ch, quiz.score)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      Piagam
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lencana Literasi (Badges Collection) */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Koleksi Lencana Literasi
            </h2>
            <p className="text-xs text-slate-500">
              Dapatkan lencana kehormatan dengan menuntaskan setiap kuis evaluasi bab
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allPossibleBadges.map((badge) => {
            const isUnlocked = activeStudent.badges?.includes(badge.name);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'border-amber-300 bg-amber-50/50 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/40 opacity-50 grayscale'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-slate-900">
                      {badge.name}
                    </h3>
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold block">
                    {badge.chapter}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Catatan Refleksi Mandiri Siswa */}
      {activeStudent.reflections && Object.keys(activeStudent.reflections).length > 0 && (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            Jurnal Refleksi Mandiri
          </h2>
          <div className="space-y-2.5">
            {Object.entries(activeStudent.reflections).map(([chId, text]) => {
              const ch = chapters.find((c) => c.id === chId);
              return (
                <div key={chId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-indigo-700 block mb-1">
                    Bab {ch?.number || ''}: {ch?.title || chId}
                  </span>
                  <p className="text-slate-700 italic">"{text}"</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
