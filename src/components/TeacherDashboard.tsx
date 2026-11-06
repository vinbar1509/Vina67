import React, { useState } from 'react';
import { StudentProgress, Chapter, ClassStatistics } from '../types/curriculum';
import { AppStorage } from '../services/storage';
import {
  Users,
  Award,
  AlertCircle,
  Download,
  Printer,
  Plus,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface TeacherDashboardProps {
  students: StudentProgress[];
  chapters: Chapter[];
  onUpdateStudents: () => void;
  onSelectActiveStudent: (id: string) => void;
  onOpenNewStudentModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  chapters,
  onUpdateStudents,
  onSelectActiveStudent,
  onOpenNewStudentModal,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tuntas' | 'remedial'>('all');

  // Modal for teacher note
  const [editingStudent, setEditingStudent] = useState<StudentProgress | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  // Calculate statistics
  const stats: ClassStatistics = AppStorage.calculateClassStats(students, selectedClass);

  // Filter students
  const filteredStudents = students.filter((s) => {
    // Class filter
    if (selectedClass !== 'all' && s.classRoom !== selectedClass) return false;

    // Search query
    if (
      searchQuery.trim() &&
      !s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Status filter
    const quizResults = Object.values(s.quizResults || {});
    const hasFailed = quizResults.some((q) => !q.passed);
    const hasAttemptedAll = quizResults.length === 6 && quizResults.every((q) => q.passed);

    if (statusFilter === 'tuntas' && !hasAttemptedAll) return false;
    if (statusFilter === 'remedial' && !hasFailed && quizResults.length > 0) return false;

    return true;
  });

  const handleOpenNoteModal = (student: StudentProgress) => {
    setEditingStudent(student);
    setNoteText(student.teacherNote || '');
    sounds.playClick();
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    AppStorage.addTeacherNote(editingStudent.studentId, noteText.trim());
    sounds.playCorrect();
    setEditingStudent(null);
    onUpdateStudents();
  };

  const handleResetData = () => {
    if (window.confirm('Reset seluruh data kelas ke simulasi awal?')) {
      AppStorage.resetData();
      onUpdateStudents();
      sounds.playClick();
    }
  };

  const handleExportCSV = () => {
    sounds.playClick();
    const headers = [
      'ID Siswa',
      'Nama Siswa',
      'Kelas',
      'Bab 1',
      'Bab 2',
      'Bab 3',
      'Bab 4',
      'Bab 5',
      'Bab 6',
      'Rata-Rata',
      'Status KKM',
      'Catatan Guru',
    ];

    const rows = filteredStudents.map((s) => {
      const b1 = s.quizResults?.['bab-1']?.score ?? '-';
      const b2 = s.quizResults?.['bab-2']?.score ?? '-';
      const b3 = s.quizResults?.['bab-3']?.score ?? '-';
      const b4 = s.quizResults?.['bab-4']?.score ?? '-';
      const b5 = s.quizResults?.['bab-5']?.score ?? '-';
      const b6 = s.quizResults?.['bab-6']?.score ?? '-';

      const scores = [b1, b2, b3, b4, b5, b6].filter((v): v is number => typeof v === 'number');
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const status = avg >= 75 ? 'TUNTAS' : 'REMEDIAL';

      return [
        s.studentId,
        `"${s.studentName}"`,
        s.classRoom,
        b1,
        b2,
        b3,
        b4,
        b5,
        b6,
        avg,
        status,
        `"${s.teacherNote || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_Bahasa_Indonesia_Kelas_9_${selectedClass}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Teacher Welcome & Filter Toolbar */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-bold text-amber-800">Ruang Kerja Guru</span>
              <span>·</span>
              <span>Bahasa Indonesia Kelas IX SMP</span>
              <span>·</span>
              <span>Kurikulum Merdeka</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Pemantauan & Analisis Belajar Siswa
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau kemajuan membaca, ketuntasan kuis evaluasi per bab, dan beri catatan bimbingan langsung kepada murid.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap</span>
            </button>

            <button
              onClick={onOpenNewStudentModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Siswa</span>
            </button>

            <button
              onClick={handleResetData}
              title="Reset ke data simulasi awal"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Siswa Terdaftar</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats.totalStudents} Siswa
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {selectedClass === 'all' ? 'Seluruh Kelas 9' : `Kelas ${selectedClass}`}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Rata-Rata Nilai</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats.classAverage} / 100
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
              KKM Standar: 75.0
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Ketuntasan Semester</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-bold text-emerald-600 tabular-nums">
              {stats.completionRate}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Evaluasi telah tuntas
            </span>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-xs font-medium">Perlu Remedial</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-amber-900 tabular-nums">
              {stats.needRemedialCount} Siswa
            </span>
            <span className="text-[11px] text-amber-800 block mt-0.5">
              Nilai di bawah KKM 75
            </span>
          </div>
        </div>
      </section>

      {/* Chapter Average Mastery Bar Chart */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Analisis Penguasaan Materi per Bab (Tingkat Ketuntasan Kelas)
            </h2>
            <p className="text-xs text-slate-500">
              Menunjukkan bab mana yang telah dikuasai dan materi mana yang membutuhkan penguatan guru di kelas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {chapters.map((ch) => {
            const avg = stats.chapterAverages[ch.id] || 0;
            const isPassing = avg >= 75;

            return (
              <div
                key={ch.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-center space-y-2"
              >
                <div className="text-[11px] font-bold text-slate-500">
                  Bab {ch.number}
                </div>
                <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                  {ch.title}
                </div>
                <div
                  className={`text-xl font-bold tabular-nums ${
                    isPassing ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {avg > 0 ? `${avg}` : '-'}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      isPassing ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(avg, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {avg >= 75 ? 'Tuntas Kelas' : avg > 0 ? 'Perlu Penguatan' : 'Belum Ujian'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Student List & Grading Table */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau ID siswa..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Class Filter */}
            <select
              aria-label="Filter Berdasarkan Rombel Kelas"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs bg-slate-50 font-semibold text-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Semua Rombel (9A & 9B)</option>
              <option value="9A">Kelas 9A</option>
              <option value="9B">Kelas 9B</option>
            </select>

            {/* Status Filter */}
            <select
              aria-label="Filter Berdasarkan Ketuntasan"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'tuntas' | 'remedial')}
              className="text-xs bg-slate-50 font-semibold text-slate-800 py-1.5 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="tuntas">Tuntas Seluruh Bab</option>
              <option value="remedial">Perlu Remedial (&lt;75)</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-3 px-3">Nama Siswa</th>
                <th className="py-3 px-2 text-center">Kelas</th>
                <th className="py-3 px-2 text-center">Materi</th>
                <th className="py-3 px-2 text-center">Bab 1</th>
                <th className="py-3 px-2 text-center">Bab 2</th>
                <th className="py-3 px-2 text-center">Bab 3</th>
                <th className="py-3 px-2 text-center">Bab 4</th>
                <th className="py-3 px-2 text-center">Bab 5</th>
                <th className="py-3 px-2 text-center">Bab 6</th>
                <th className="py-3 px-2 text-center">Rata-Rata</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right print:hidden">Aksi Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-500">
                    Tidak ada data siswa yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const b1 = st.quizResults?.['bab-1']?.score;
                  const b2 = st.quizResults?.['bab-2']?.score;
                  const b3 = st.quizResults?.['bab-3']?.score;
                  const b4 = st.quizResults?.['bab-4']?.score;
                  const b5 = st.quizResults?.['bab-5']?.score;
                  const b6 = st.quizResults?.['bab-6']?.score;

                  const allScores = [b1, b2, b3, b4, b5, b6].filter(
                    (v): v is number => v !== undefined
                  );
                  const avg =
                    allScores.length > 0
                      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
                      : 0;

                  const hasFailed = Object.values(st.quizResults || {}).some(
                    (q) => !q.passed
                  );
                  const isAllDone = allScores.length === 6 && avg >= 75;

                  return (
                    <tr
                      key={st.studentId}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">
                          {st.studentName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {st.studentId} · {st.xp || 0} XP
                        </div>
                        {st.teacherNote && (
                          <div className="text-[11px] text-amber-800 italic mt-0.5 line-clamp-1">
                            Note: "{st.teacherNote}"
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-2 text-center font-medium text-slate-600">
                        {st.classRoom}
                      </td>

                      <td className="py-3 px-2 text-center tabular-nums text-slate-600">
                        {st.readChapters.length}/6
                      </td>

                      {[b1, b2, b3, b4, b5, b6].map((score, idx) => (
                        <td key={idx} className="py-3 px-2 text-center tabular-nums">
                          {score !== undefined ? (
                            <span
                              className={`font-semibold ${
                                score >= 75 ? 'text-emerald-700' : 'text-amber-600'
                              }`}
                            >
                              {score}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      ))}

                      <td className="py-3 px-2 text-center font-bold tabular-nums">
                        {avg > 0 ? (
                          <span
                            className={avg >= 75 ? 'text-emerald-700' : 'text-amber-700'}
                          >
                            {avg}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isAllDone ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Tuntas
                          </span>
                        ) : hasFailed ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Remedial
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            Berjalan
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right print:hidden space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenNoteModal(st)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                        >
                          Beri Umpan Balik
                        </button>

                        <button
                          onClick={() => {
                            onSelectActiveStudent(st.studentId);
                            sounds.playClick();
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors"
                        >
                          Cek Rapor
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Add Teacher Note / Feedback */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Umpan Balik Guru
                </h3>
                <p className="text-xs text-slate-500">
                  Untuk Siswa: <strong>{editingStudent.studentName}</strong> (Kelas {editingStudent.classRoom})
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan Evaluasi / Saran Pengembangan Belajar:
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Misal: Bagus sekali pengerjaan Bab 1. Perbanyak latihan membedakan fakta dan opini di Bab 3 agar nilai kuis meningkat..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-hidden resize-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Catatan ini akan tampil di bagian atas dashboard akun siswa.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
