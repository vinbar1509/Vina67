/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CHAPTERS_DATA } from './data/chaptersData';
import { Chapter, StudentProgress } from './types/curriculum';
import { AppStorage } from './services/storage';
import { Navbar } from './components/Navbar';
import { ChapterReader } from './components/ChapterReader';
import { InteractivePractice } from './components/InteractivePractice';
import { EvaluationQuiz } from './components/EvaluationQuiz';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { CertificateModal } from './components/CertificateModal';
import { LanguageClinicModal } from './components/LanguageClinicModal';
import { NewStudentModal } from './components/NewStudentModal';
import {
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { sounds } from './services/soundEffects';

export default function App() {
  const [chapters] = useState<Chapter[]>(CHAPTERS_DATA);
  const [currentChapter, setCurrentChapter] = useState<Chapter>(CHAPTERS_DATA[0]);
  const [activeTab, setActiveTab] = useState<'materi' | 'latihan' | 'kuis' | 'progres' | 'guru'>('materi');

  const [allStudents, setAllStudents] = useState<StudentProgress[]>([]);
  const [activeStudent, setActiveStudent] = useState<StudentProgress | null>(null);

  // Modals state
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [certificateChapter, setCertificateChapter] = useState<Chapter | null>(null);
  const [certificateScore, setCertificateScore] = useState(0);

  const [isClinicOpen, setIsClinicOpen] = useState(false);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadedStudents = AppStorage.getStudents();
    const active = AppStorage.getActiveStudent();
    setAllStudents(loadedStudents);
    setActiveStudent(active);
  }, []);

  const refreshStudents = () => {
    const loaded = AppStorage.getStudents();
    const active = AppStorage.getActiveStudent();
    setAllStudents(loaded);
    setActiveStudent(active);
  };

  const handleSelectStudent = (id: string) => {
    AppStorage.setActiveStudentId(id);
    const updated = AppStorage.getActiveStudent();
    setActiveStudent(updated);
  };

  const handleCreateStudent = (name: string, classRoom: string) => {
    const created = AppStorage.createStudent(name, classRoom);
    refreshStudents();
    setActiveStudent(created);
  };

  const handleMarkRead = (chapterId: string) => {
    if (!activeStudent) return;
    const updated = AppStorage.markChapterRead(activeStudent.studentId, chapterId);
    setActiveStudent({ ...updated });
    refreshStudents();
  };

  const handleSaveReflection = (chapterId: string, text: string) => {
    if (!activeStudent) return;
    const updated = AppStorage.saveReflection(activeStudent.studentId, chapterId, text);
    setActiveStudent({ ...updated });
    refreshStudents();
  };

  const handleSavePracticeScore = (
    completedCount: number,
    totalCount: number,
    scorePct: number
  ) => {
    if (!activeStudent) return;
    const updated = AppStorage.savePracticeScore(
      activeStudent.studentId,
      currentChapter.id,
      completedCount,
      totalCount,
      scorePct
    );
    setActiveStudent({ ...updated });
    refreshStudents();
  };

  const handleSaveQuizResult = (
    score: number,
    total: number,
    userAnswers: number[],
    chapterTitle: string
  ) => {
    if (!activeStudent) return;
    const updated = AppStorage.saveQuizResult(
      activeStudent.studentId,
      currentChapter.id,
      score,
      total,
      userAnswers,
      chapterTitle
    );
    setActiveStudent({ ...updated });
    refreshStudents();
  };

  const handleOpenCertificate = (chapter: Chapter, score: number) => {
    setCertificateChapter(chapter);
    setCertificateScore(score);
    setIsCertificateOpen(true);
    sounds.playSuccessFanfare();
  };

  const handleGoToNextChapter = () => {
    const nextIdx = currentChapter.number; // e.g. 1 -> index 1 is chapter 2
    if (nextIdx < chapters.length) {
      setCurrentChapter(chapters[nextIdx]);
      setActiveTab('materi');
      sounds.playClick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!activeStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Memuat data pembelajaran...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeStudent={activeStudent}
        allStudents={allStudents}
        onSelectStudent={handleSelectStudent}
        onOpenNewStudentModal={() => setIsNewStudentOpen(true)}
        onOpenClinic={() => setIsClinicOpen(true)}
      />

      {/* Hero Welcome Ribbon for Student or Teacher */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/20">
                {activeStudent.studentName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-indigo-200">
                  <span>Selamat Belajar,</span>
                  <span className="font-bold text-white">{activeStudent.studentName}</span>
                  <span>·</span>
                  <span>Kelas {activeStudent.classRoom}</span>
                </div>
                <p className="text-xs text-indigo-100/90 mt-0.5">
                  Bab Aktif: <strong>Bab {currentChapter.number}: {currentChapter.title}</strong> ({currentChapter.theme})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-semibold border border-white/15">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>{activeStudent.xp || 0} XP</span>
              </div>

              {activeTab !== 'guru' ? (
                <button
                  onClick={() => {
                    setActiveTab('guru');
                    sounds.playClick();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold rounded-lg text-xs transition-colors shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Buka Mode Guru</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('materi');
                    sounds.playClick();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Kembali ke Mode Siswa</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Tab 1: Ringkasan Materi */}
        {activeTab === 'materi' && (
          <ChapterReader
            chapters={chapters}
            currentChapter={currentChapter}
            onSelectChapter={setCurrentChapter}
            activeStudent={activeStudent}
            onMarkRead={handleMarkRead}
            onSaveReflection={handleSaveReflection}
            onGoToPractice={() => {
              setActiveTab('latihan');
              sounds.playClick();
            }}
            onGoToQuiz={() => {
              setActiveTab('kuis');
              sounds.playClick();
            }}
          />
        )}

        {/* Tab 2: Latihan Interaktif */}
        {activeTab === 'latihan' && (
          <InteractivePractice
            currentChapter={currentChapter}
            activeStudent={activeStudent}
            onSavePracticeScore={handleSavePracticeScore}
            onGoToQuiz={() => {
              setActiveTab('kuis');
              sounds.playClick();
            }}
            onSelectChapter={setCurrentChapter}
            allChapters={chapters}
          />
        )}

        {/* Tab 3: Kuis Evaluasi */}
        {activeTab === 'kuis' && (
          <EvaluationQuiz
            currentChapter={currentChapter}
            activeStudent={activeStudent}
            onSaveQuizResult={handleSaveQuizResult}
            onOpenCertificate={handleOpenCertificate}
            onSelectChapter={setCurrentChapter}
            allChapters={chapters}
            onGoToNextChapter={handleGoToNextChapter}
          />
        )}

        {/* Tab 4: Progres Siswa */}
        {activeTab === 'progres' && (
          <StudentDashboard
            activeStudent={activeStudent}
            chapters={chapters}
            onSelectChapter={setCurrentChapter}
            onGoToMateri={(ch) => {
              setCurrentChapter(ch);
              setActiveTab('materi');
              sounds.playClick();
            }}
            onGoToPractice={(ch) => {
              setCurrentChapter(ch);
              setActiveTab('latihan');
              sounds.playClick();
            }}
            onGoToQuiz={(ch) => {
              setCurrentChapter(ch);
              setActiveTab('kuis');
              sounds.playClick();
            }}
            onOpenCertificate={handleOpenCertificate}
          />
        )}

        {/* Tab 5: Ruang Guru (Teacher Center) */}
        {activeTab === 'guru' && (
          <TeacherDashboard
            students={allStudents}
            chapters={chapters}
            onUpdateStudents={refreshStudents}
            onSelectActiveStudent={(id) => {
              handleSelectStudent(id);
              setActiveTab('progres');
            }}
            onOpenNewStudentModal={() => setIsNewStudentOpen(true)}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Cakrawala Bahasa 9</span>
            <span>·</span>
            <span>Bahasa Indonesia SMP/MTs Kelas IX Kurikulum Merdeka</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsClinicOpen(true)}
              className="hover:text-indigo-600 transition-colors"
            >
              Klinik Bahasa
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('guru')}
              className="hover:text-indigo-600 transition-colors font-medium text-amber-800"
            >
              Monitoring Guru
            </button>
          </div>
        </div>
      </footer>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        chapter={certificateChapter}
        score={certificateScore}
        student={activeStudent}
      />

      {/* Language Clinic Modal */}
      <LanguageClinicModal
        isOpen={isClinicOpen}
        onClose={() => setIsClinicOpen(false)}
      />

      {/* New Student Modal */}
      <NewStudentModal
        isOpen={isNewStudentOpen}
        onClose={() => setIsNewStudentOpen(false)}
        onCreate={handleCreateStudent}
      />
    </div>
  );
}
