import React, { useState } from 'react';
import { Chapter, StudentProgress, PracticeQuestion } from '../types/curriculum';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Award,
  BookOpen,
  ArrowUpDown,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';

interface InteractivePracticeProps {
  currentChapter: Chapter;
  activeStudent: StudentProgress;
  onSavePracticeScore: (completedCount: number, totalCount: number, scorePct: number) => void;
  onGoToQuiz: () => void;
  onSelectChapter: (chapter: Chapter) => void;
  allChapters: Chapter[];
}

export const InteractivePractice: React.FC<InteractivePracticeProps> = ({
  currentChapter,
  activeStudent,
  onSavePracticeScore,
  onGoToQuiz,
  onSelectChapter,
  allChapters,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userScore, setUserScore] = useState(0);

  // For classification questions
  const [classifyAnswers, setClassifyAnswers] = useState<{ [itemIndex: number]: string }>({});
  const [isClassifyChecked, setIsClassifyChecked] = useState(false);

  // For arrangement questions
  const [arrangeSteps, setArrangeSteps] = useState<
    { id: string; text: string; correctOrder: number }[]
  >([]);
  const [isArrangeChecked, setIsArrangeChecked] = useState(false);

  // Practice state
  const [isPracticeCompleted, setIsPracticeCompleted] = useState(false);

  const questions: PracticeQuestion[] = currentChapter.practiceQuestions;
  const currentQ = questions[currentQuestionIndex];

  // Initialize questions
  React.useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserScore(0);
    setClassifyAnswers({});
    setIsClassifyChecked(false);
    setIsPracticeCompleted(false);

    if (currentQ?.type === 'arrange-order' && currentQ.scrambledSteps) {
      // Scramble steps slightly
      setArrangeSteps([...currentQ.scrambledSteps].sort(() => Math.random() - 0.5));
    }
  }, [currentChapter.id]);

  // When moving to new question, prepare arrangement if needed
  React.useEffect(() => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setClassifyAnswers({});
    setIsClassifyChecked(false);
    setIsArrangeChecked(false);

    if (currentQ?.type === 'arrange-order' && currentQ.scrambledSteps) {
      setArrangeSteps([...currentQ.scrambledSteps].sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, currentQ]);

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
    sounds.playClick();
  };

  const handleSubmitMCQ = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
      setUserScore((prev) => prev + 1);
    } else {
      sounds.playWrong();
    }
  };

  const handleClassifySelect = (itemIdx: number, cat: string) => {
    if (isClassifyChecked) return;
    sounds.playClick();
    setClassifyAnswers((prev) => ({
      ...prev,
      [itemIdx]: cat,
    }));
  };

  const handleCheckClassification = () => {
    if (!currentQ.classificationItems) return;
    setIsClassifyChecked(true);

    let correctCount = 0;
    currentQ.classificationItems.forEach((item, idx) => {
      if (classifyAnswers[idx] === item.category) {
        correctCount++;
      }
    });

    const isAllCorrect = correctCount === currentQ.classificationItems.length;
    if (isAllCorrect) {
      sounds.playCorrect();
      setUserScore((prev) => prev + 1);
    } else {
      sounds.playWrong();
    }
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (isArrangeChecked) return;
    const newSteps = [...arrangeSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setArrangeSteps(newSteps);
    sounds.playClick();
  };

  const handleCheckArrangement = () => {
    setIsArrangeChecked(true);
    const isCorrect = arrangeSteps.every((step, idx) => step.correctOrder === idx + 1);
    if (isCorrect) {
      sounds.playCorrect();
      setUserScore((prev) => prev + 1);
    } else {
      sounds.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      sounds.playClick();
    } else {
      // Finish practice
      setIsPracticeCompleted(true);
      const total = questions.length;
      const scorePct = Math.round((userScore / total) * 100);
      onSavePracticeScore(total, total, scorePct);

      if (scorePct >= 70) {
        sounds.playSuccessFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleRestartPractice = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserScore(0);
    setClassifyAnswers({});
    setIsClassifyChecked(false);
    setIsArrangeChecked(false);
    setIsPracticeCompleted(false);
    sounds.playClick();
  };

  const savedRecord = activeStudent.practiceScores?.[currentChapter.id];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Chapter Filter Header */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-bold text-indigo-700">Latihan Interaktif</span>
            <span>·</span>
            <span>Bab {currentChapter.number}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {currentChapter.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Pilih Bab Latihan"
            value={currentChapter.id}
            onChange={(e) => {
              const ch = allChapters.find((c) => c.id === e.target.value);
              if (ch) onSelectChapter(ch);
            }}
            className="text-xs bg-slate-100 font-semibold text-slate-800 py-1.5 px-3 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {allChapters.map((c) => (
              <option key={c.id} value={c.id}>
                Bab {c.number}: {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Completion Screen */}
      {isPracticeCompleted ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Latihan Bab {currentChapter.number} Selesai!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kamu berhasil menyelesaikan seluruh simulasi soal latihan interaktif ini.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 block">Skor Benar</span>
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {userScore} / {questions.length}
              </span>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <span className="text-[11px] text-indigo-700 block">Bonus XP</span>
              <span className="text-2xl font-bold text-indigo-700 tabular-nums">
                +40 XP
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestartPractice}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>

            <button
              onClick={() => {
                onGoToQuiz();
                sounds.playClick();
              }}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Lanjut ke Kuis Evaluasi Bab</span>
            </button>
          </div>
        </div>
      ) : (
        /* Question Card */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                Tantangan 0{currentQuestionIndex + 1}
              </span>
              <span className="text-xs text-slate-500">
                dari {questions.length} Soal
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Skor Sementara:</span>
              <span className="tabular-nums font-bold text-indigo-600">
                {userScore} poin
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* QUESTION TYPE 1: Multiple Choice */}
          {currentQ.type === 'multiple-choice' && (
            <div className="space-y-5">
              {currentQ.stimulusText && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 font-serif-display italic leading-relaxed">
                  "{currentQ.stimulusText}"
                </div>
              )}

              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>

              <div className="space-y-2.5">
                {currentQ.options?.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  let optionStyle =
                    'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                  if (isAnswerSubmitted) {
                    if (optIdx === currentQ.correctAnswer) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-medium ring-1 ring-emerald-500';
                    } else if (isSelected && optIdx !== currentQ.correctAnswer) {
                      optionStyle =
                        'border-rose-400 bg-rose-50/80 text-rose-950 ring-1 ring-rose-400';
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium ring-1 ring-indigo-500';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action and Explanation */}
              {!isAnswerSubmitted ? (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSubmitMCQ}
                    disabled={selectedOption === null}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Periksa Jawaban
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    {selectedOption === currentQ.correctAnswer ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">
                          Tepat sekali! Jawabanmu benar.
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600" />
                        <span className="text-xs font-bold text-rose-700">
                          Kurang tepat. Pembahasan di bawah ini:
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentQ.explanation}
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>{currentQuestionIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Latihan'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QUESTION TYPE 2: Classify (Sort into Buckets) */}
          {currentQ.type === 'classify' && currentQ.classificationItems && currentQ.categories && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-1">
                  {currentQ.question}
                </h3>
                <p className="text-xs text-slate-500">
                  Pilihlah kategori yang sesuai untuk setiap butir pernyataan di bawah ini.
                </p>
              </div>

              <div className="space-y-3">
                {currentQ.classificationItems.map((item, idx) => {
                  const currentSelected = classifyAnswers[idx];
                  const isChecked = isClassifyChecked;
                  const isCorrect = currentSelected === item.category;

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isChecked
                          ? isCorrect
                            ? 'border-emerald-400 bg-emerald-50/50'
                            : 'border-rose-300 bg-rose-50/50'
                          : 'border-slate-200 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm text-slate-800 font-medium">
                          "{item.text}"
                        </p>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {currentQ.categories?.map((cat) => {
                            const isCatActive = currentSelected === cat;
                            return (
                              <button
                                key={cat}
                                onClick={() => handleClassifySelect(idx, cat)}
                                disabled={isChecked}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                                  isCatActive
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {isChecked && (
                        <div className="mt-2 text-[11px] font-semibold">
                          {isCorrect ? (
                            <span className="text-emerald-700">✓ Benar ({item.category})</span>
                          ) : (
                            <span className="text-rose-700">✗ Seharusnya: {item.category}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isClassifyChecked ? (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleCheckClassification}
                    disabled={
                      Object.keys(classifyAnswers).length <
                      currentQ.classificationItems.length
                    }
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Periksa Pengelompokan
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>{currentQuestionIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Latihan'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* QUESTION TYPE 3: Arrange Steps */}
          {currentQ.type === 'arrange-order' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-1">
                  {currentQ.question}
                </h3>
                <p className="text-xs text-slate-500">
                  Gunakan tombol panah Naik / Turun untuk mengurutkan langkah kerja secara logis.
                </p>
              </div>

              <div className="space-y-2.5">
                {arrangeSteps.map((step, idx) => {
                  const isChecked = isArrangeChecked;
                  const isCorrectPos = step.correctOrder === idx + 1;

                  return (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        isChecked
                          ? isCorrectPos
                            ? 'border-emerald-400 bg-emerald-50/50'
                            : 'border-rose-300 bg-rose-50/50'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800">
                          {step.text}
                        </p>
                      </div>

                      {!isChecked && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveStep(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100 text-slate-700 text-xs px-2"
                            title="Pindah ke Atas"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveStep(idx, 'down')}
                            disabled={idx === arrangeSteps.length - 1}
                            className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100 text-slate-700 text-xs px-2"
                            title="Pindah ke Bawah"
                          >
                            ▼
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isArrangeChecked ? (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleCheckArrangement}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Periksa Susunan Langkah
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>{currentQuestionIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Latihan'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Record Tracker Footer */}
      {savedRecord && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <span>
            Nilai Latihan Terakhir Bab Ini: <strong>{savedRecord.scorePercent}%</strong>
          </span>
          <span className="text-slate-500">
            Status: {savedRecord.scorePercent >= 70 ? 'Lulus Latihan' : 'Perlu Diulang'}
          </span>
        </div>
      )}
    </div>
  );
};
