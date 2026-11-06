import React, { useState, useEffect } from 'react';
import { Chapter, StudentProgress, QuizQuestion } from '../types/curriculum';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';

interface EvaluationQuizProps {
  currentChapter: Chapter;
  activeStudent: StudentProgress;
  onSaveQuizResult: (
    score: number,
    total: number,
    userAnswers: number[],
    chapterTitle: string
  ) => void;
  onOpenCertificate: (chapter: Chapter, score: number) => void;
  onSelectChapter: (chapter: Chapter) => void;
  allChapters: Chapter[];
  onGoToNextChapter?: () => void;
}

export const EvaluationQuiz: React.FC<EvaluationQuizProps> = ({
  currentChapter,
  activeStudent,
  onSaveQuizResult,
  onOpenCertificate,
  onSelectChapter,
  allChapters,
  onGoToNextChapter,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [qIndex: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 mins
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  const questions: QuizQuestion[] = currentChapter.quizQuestions;

  // Existing result in student profile
  const existingResult = activeStudent.quizResults?.[currentChapter.id];

  // Reset quiz state when chapter changes
  useEffect(() => {
    setCurrentIdx(0);
    setAnswers({});
    setIsSubmitted(false);
    setTimeRemaining(900);
    setIsTimerActive(false);
    setCalculatedScore(null);
  }, [currentChapter.id]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, isSubmitted, answers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (isSubmitted) return;
    if (!isTimerActive) setIsTimerActive(true); // start timer on first answer
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIdx,
    }));
    sounds.playClick();
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    const userAnsArray: number[] = [];

    questions.forEach((q, idx) => {
      const userAns = answers[idx] !== undefined ? answers[idx] : -1;
      userAnsArray.push(userAns);
      if (userAns === q.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setCalculatedScore(finalScore);
    setIsSubmitted(true);
    setIsTimerActive(false);

    onSaveQuizResult(finalScore, questions.length, userAnsArray, currentChapter.title);

    if (finalScore >= 75) {
      sounds.playSuccessFanfare();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
      });
    } else {
      sounds.playWrong();
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimeRemaining(900);
    setIsTimerActive(false);
    setCalculatedScore(null);
    sounds.playClick();
  };

  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Quiz Top Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-bold text-amber-700">Kuis Evaluasi Resmi</span>
            <span>·</span>
            <span>Standar KKM 75</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Bab {currentChapter.number}: {currentChapter.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Pilih Bab Kuis"
            value={currentChapter.id}
            onChange={(e) => {
              const ch = allChapters.find((c) => c.id === e.target.value);
              if (ch) onSelectChapter(ch);
            }}
            className="text-xs bg-slate-100 font-semibold text-slate-800 py-1.5 px-3 rounded-lg border-0 focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {allChapters.map((c) => (
              <option key={c.id} value={c.id}>
                Bab {c.number}: {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RESULT REPORT SCREEN */}
      {isSubmitted && calculatedScore !== null ? (
        <div className="space-y-6">
          {/* Score Summary Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
                calculatedScore >= 75
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {calculatedScore >= 75 ? (
                <Award className="w-8 h-8" />
              ) : (
                <FileCheck className="w-8 h-8" />
              )}
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Hasil Evaluasi Bab {currentChapter.number}
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums mt-1">
                {calculatedScore} / 100
              </h3>
              <p
                className={`text-sm font-bold mt-1 ${
                  calculatedScore >= 75 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {calculatedScore >= 75
                  ? 'TUNTAS (Memenuhi Kriteria Ketuntasan Minimal 75)'
                  : 'BELUM TUNTAS (Perlu Pembelajaran Remedial)'}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              {calculatedScore >= 75
                ? 'Selamat! Kamu telah menguasai kompetensi dasar bab ini dengan sangat baik. Piagam kelulusan bab telah siap diunduh.'
                : 'Jangan berkecil hati. Pelajari kembali ringkasan materi dan pembahasan di bawah ini, lalu ikuti kuis kembali untuk memperbaiki nilai.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRetakeQuiz}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi Kuis</span>
              </button>

              {calculatedScore >= 75 && (
                <button
                  onClick={() => onOpenCertificate(currentChapter, calculatedScore)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Lihat Piagam Kelulusan</span>
                </button>
              )}

              {onGoToNextChapter && currentChapter.number < 6 && (
                <button
                  onClick={onGoToNextChapter}
                  className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Lanjut Bab {currentChapter.number + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Full Pedagogical Review of Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Pembahasan Lengkap 10 Butir Soal
              </h3>
              <span className="text-xs text-slate-500">
                Analisis Kunci & Pembahasan Guru
              </span>
            </div>

            {questions.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border bg-white shadow-2xs space-y-3 ${
                    isCorrect ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Soal 0{idx + 1} · {q.subtopic}
                    </span>
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isCorrect ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Benar (+10)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Salah (0)</span>
                        </>
                      )}
                    </span>
                  </div>

                  {q.stimulus && (
                    <div className="p-3 bg-slate-50 rounded-lg text-xs italic font-serif-display text-slate-700 border border-slate-200/60">
                      {q.stimulus}
                    </div>
                  )}

                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = userAns === optIdx;
                      const isKunci = optIdx === q.correctAnswer;

                      let cls = 'bg-slate-50 border-slate-200 text-slate-600';
                      if (isKunci) {
                        cls = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                      } else if (isUserChoice && !isKunci) {
                        cls = 'bg-rose-50 border-rose-300 text-rose-900 font-medium line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 ${cls}`}
                        >
                          <span className="font-bold text-[11px] shrink-0">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="leading-snug">{opt}</span>
                          {isKunci && (
                            <span className="ml-auto text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                              Kunci
                            </span>
                          )}
                          {isUserChoice && !isKunci && (
                            <span className="ml-auto text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                              Pilihanmu
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/70 text-xs text-amber-950">
                    <span className="font-bold block mb-0.5">Penjelasan Konsep:</span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ACTIVE QUIZ FORM */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question Body (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                  Soal 0{currentIdx + 1}
                </span>
                <span className="text-xs text-slate-500">
                  Subtopik: {currentQ.subtopic}
                </span>
              </div>

              {/* Timer Pill */}
              <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span className="tabular-nums">{formatTime(timeRemaining)}</span>
              </div>
            </div>

            {/* Stimulus if any */}
            {currentQ.stimulus && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-serif-display italic leading-relaxed">
                "{currentQ.stimulus}"
              </div>
            )}

            {/* Question Text */}
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>

            {/* Option Radio Buttons */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentIdx] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectAnswer(optIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-medium ring-1 ring-amber-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Previous / Next Navigator */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  if (currentIdx > 0) setCurrentIdx((prev) => prev - 1);
                  sounds.playClick();
                }}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentIdx((prev) => prev + 1);
                    sounds.playClick();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Selesaikan & Kumpulkan Kuis</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Question Grid Palette (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5 sticky top-24">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Lembar Jawaban Soal
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {answeredCount} dari {questions.length} telah dijawab
              </p>
            </div>

            {/* Grid 1 to 10 */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const isCurrent = currentIdx === idx;
                const isAnswered = answers[idx] !== undefined;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIdx(idx);
                      sounds.playClick();
                    }}
                    className={`h-10 rounded-lg font-bold text-xs flex flex-col items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-amber-500 border-amber-600 bg-amber-50 text-amber-950 font-extrabold shadow-xs'
                        : isAnswered
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isAnswered && (
                      <span className="text-[9px] uppercase opacity-90">
                        {String.fromCharCode(65 + answers[idx])}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600" />
                <span>Sudah Dijawab</span>
                <span className="w-2.5 h-2.5 rounded bg-slate-200 ml-2" />
                <span>Belum</span>
              </div>

              <button
                onClick={handleSubmitQuiz}
                disabled={answeredCount === 0}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Kumpulkan Jawaban Sekarang
              </button>
            </div>

            {existingResult && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600">
                <span className="font-semibold block text-slate-800">
                  Nilai Terbaik Sebelumnya:
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    existingResult.passed ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {existingResult.score} / 100
                </span>{' '}
                ({existingResult.attempts} kali percobaan)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
