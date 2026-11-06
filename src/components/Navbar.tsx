import React, { useState } from 'react';
import { BookOpen, Award, CheckSquare, BarChart3, UserCheck, Volume2, VolumeX, Sparkles, Menu, X } from 'lucide-react';
import { StudentProgress } from '../types/curriculum';
import { sounds } from '../services/soundEffects';

interface NavbarProps {
  activeTab: 'materi' | 'latihan' | 'kuis' | 'progres' | 'guru';
  setActiveTab: (tab: 'materi' | 'latihan' | 'kuis' | 'progres' | 'guru') => void;
  activeStudent: StudentProgress;
  allStudents: StudentProgress[];
  onSelectStudent: (id: string) => void;
  onOpenNewStudentModal: () => void;
  onOpenClinic: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeStudent,
  allStudents,
  onSelectStudent,
  onOpenNewStudentModal,
  onOpenClinic,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  const navItems = [
    { id: 'materi', label: 'Ringkasan Materi', icon: BookOpen },
    { id: 'latihan', label: 'Latihan Interaktif', icon: CheckSquare },
    { id: 'kuis', label: 'Kuis Evaluasi', icon: Award },
    { id: 'progres', label: 'Progres Siswa', icon: BarChart3 },
    { id: 'guru', label: 'Ruang Guru', icon: UserCheck },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('materi');
                sounds.playClick();
              }}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-indigo-700 transition-colors">
                B9
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap leading-tight">
                  Cakrawala Bahasa 9
                </span>
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                  Kurikulum Merdeka SMP
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single Line, 4-5 links) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isTeacherTab = item.id === 'guru';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    sounds.playClick();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? isTeacherTab
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'bg-indigo-50 text-indigo-700 font-semibold'
                      : isTeacherTab
                      ? 'text-amber-800/80 hover:text-amber-900 hover:bg-amber-50/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {isTeacherTab && (
                    <span className="ml-0.5 text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                      Guru
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Active Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Klinik Bahasa AI Trigger */}
            <button
              onClick={() => {
                onOpenClinic();
                sounds.playClick();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-2xs"
              title="Klinik Literasi & Analisis Kalimat"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Klinik Bahasa</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              title={isMuted ? 'Nyalakan Efek Suara' : 'Matikan Suara'}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Active Student Selector */}
            <div className="relative flex items-center">
              <select
                aria-label="Pilih Siswa Aktif"
                value={activeStudent.studentId}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    onOpenNewStudentModal();
                  } else {
                    onSelectStudent(e.target.value);
                    sounds.playClick();
                  }
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-medium py-1.5 pl-2.5 pr-7 rounded-md border-0 focus:ring-2 focus:ring-indigo-500 outline-hidden cursor-pointer max-w-[130px] sm:max-w-[160px] truncate"
              >
                <optgroup label="Pilih Siswa">
                  {allStudents.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.classRoom})
                    </option>
                  ))}
                </optgroup>
                <option value="__NEW__">+ Tambah Siswa Baru</option>
              </select>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-md"
              aria-label="Open Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                    sounds.playClick();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
