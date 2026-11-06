import React from 'react';
import { Chapter, StudentProgress } from '../types/curriculum';
import { Award, Printer, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  score: number;
  student: StudentProgress;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  chapter,
  score,
  student,
}) => {
  if (!isOpen || !chapter) return null;

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 animate-scale-up my-8">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-800">
              Piagam Kelulusan Kompetensi Kurikulum Merdeka
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Piagam</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Ornamental Box (Printable) */}
        <div className="border-4 border-amber-600/60 p-6 sm:p-10 rounded-xl bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 text-center space-y-5 relative overflow-hidden shadow-inner">
          {/* Watermark Crest Emblem */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 mx-auto flex items-center justify-center text-amber-700">
            <Award className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-800">
              Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif-display uppercase tracking-wide mt-1">
              Piagam Penghargaan Literasi
            </h2>
            <div className="w-24 h-0.5 bg-amber-500 mx-auto mt-2" />
          </div>

          <p className="text-xs sm:text-sm text-slate-600">
            Diberikan sebagai bukti kelulusan evaluasi capaian pembelajaran kepada:
          </p>

          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 font-serif-display underline decoration-amber-400 decoration-2 underline-offset-4">
              {student.studentName}
            </h3>
            <span className="text-xs text-slate-500 mt-1 block">
              Kelas {student.classRoom} · NISN/ID: {student.studentId}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed">
            Telah berhasil menyelesaikan pembelajaran serta dinyatakan{' '}
            <strong className="text-emerald-700 font-bold">LULUS TUNTAS KKM</strong> pada{' '}
            <strong>
              Bab {chapter.number}: {chapter.title} ({chapter.theme})
            </strong>{' '}
            dengan perolehan nilai evaluasi:
          </p>

          <div className="inline-block bg-white border border-amber-300 px-6 py-2 rounded-xl shadow-xs">
            <span className="text-xs text-slate-500 block">Nilai Capaian Kompetensi</span>
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {score} / 100
            </span>
          </div>

          {/* Signature Deck */}
          <div className="grid grid-cols-2 gap-8 pt-6 mt-6 border-t border-amber-200/80 text-xs">
            <div>
              <span className="text-slate-500 block">Diterbitkan pada:</span>
              <span className="font-semibold text-slate-800">{currentDate}</span>
              <div className="mt-8 pt-2">
                <span className="font-bold text-slate-900 block">Kepala Program Literasi</span>
                <span className="text-[11px] text-slate-500">SMP Global Mandiri</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block">Guru Mata Pelajaran:</span>
              <span className="font-semibold text-slate-800">Bahasa Indonesia Kelas IX</span>
              <div className="mt-8 pt-2">
                <span className="font-bold text-indigo-950 block">Vina Widiastuti, S.Pd.</span>
                <span className="text-[11px] text-slate-500">NIP. 19880415 201201 2 004</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
