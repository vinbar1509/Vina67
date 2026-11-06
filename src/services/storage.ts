import { StudentProgress, ClassStatistics } from '../types/curriculum';
import { INITIAL_STUDENTS } from '../data/initialStudents';

const STORAGE_KEY_STUDENTS = 'cakrawala_students_v1';
const STORAGE_KEY_ACTIVE_STUDENT_ID = 'cakrawala_active_student_id_v1';

export class AppStorage {
  public static getStudents(): StudentProgress[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    // Seed initial data
    this.saveStudents(INITIAL_STUDENTS);
    return INITIAL_STUDENTS;
  }

  public static saveStudents(students: StudentProgress[]) {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch {
      // Ignore
    }
  }

  public static getActiveStudent(): StudentProgress {
    const students = this.getStudents();
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_STUDENT_ID);
    const found = students.find((s) => s.studentId === activeId);
    if (found) return found;
    // Default to first student
    return students[0] || INITIAL_STUDENTS[0];
  }

  public static setActiveStudentId(id: string) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_STUDENT_ID, id);
  }

  public static updateStudent(updated: StudentProgress) {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.studentId === updated.studentId);
    if (idx !== -1) {
      students[idx] = updated;
    } else {
      students.push(updated);
    }
    this.saveStudents(students);
  }

  public static markChapterRead(studentId: string, chapterId: string): StudentProgress {
    const students = this.getStudents();
    const student = students.find((s) => s.studentId === studentId);
    if (student) {
      if (!student.readChapters.includes(chapterId)) {
        student.readChapters.push(chapterId);
        student.xp = (student.xp || 0) + 50;
        this.saveStudents(students);
      }
      return student;
    }
    return this.getActiveStudent();
  }

  public static saveReflection(studentId: string, chapterId: string, reflection: string): StudentProgress {
    const students = this.getStudents();
    const student = students.find((s) => s.studentId === studentId);
    if (student) {
      if (!student.reflections) student.reflections = {};
      student.reflections[chapterId] = reflection;
      student.xp = (student.xp || 0) + 25;
      this.saveStudents(students);
      return student;
    }
    return this.getActiveStudent();
  }

  public static savePracticeScore(
    studentId: string,
    chapterId: string,
    completedCount: number,
    totalCount: number,
    scorePercent: number
  ): StudentProgress {
    const students = this.getStudents();
    const student = students.find((s) => s.studentId === studentId);
    if (student) {
      if (!student.practiceScores) student.practiceScores = {};
      student.practiceScores[chapterId] = {
        completedCount,
        totalCount,
        scorePercent,
      };
      student.xp = (student.xp || 0) + 40;
      this.saveStudents(students);
      return student;
    }
    return this.getActiveStudent();
  }

  public static saveQuizResult(
    studentId: string,
    chapterId: string,
    score: number,
    total: number,
    userAnswers: number[],
    chapterTitle: string
  ): StudentProgress {
    const students = this.getStudents();
    const student = students.find((s) => s.studentId === studentId);
    if (student) {
      if (!student.quizResults) student.quizResults = {};
      const prev = student.quizResults[chapterId];
      const attempts = prev ? prev.attempts + 1 : 1;
      const bestScore = prev ? Math.max(prev.score, score) : score;
      const passed = bestScore >= 75;

      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

      student.quizResults[chapterId] = {
        score: bestScore,
        total,
        passed,
        completedAt: dateStr,
        attempts,
        userAnswers,
      };

      // Add badge if passed
      if (!student.badges) student.badges = [];
      const badgeNames: Record<string, string> = {
        'bab-1': 'Pakar Deskripsi',
        'bab-2': 'Pengrajin Prosedur',
        'bab-3': 'Detektif Fakta & Opini',
        'bab-4': 'Inovator Muda',
        'bab-5': 'Penjaga Maritim',
        'bab-6': 'Orator Ulung',
      };
      const badgeForChapter = badgeNames[chapterId];
      if (passed && badgeForChapter && !student.badges.includes(badgeForChapter)) {
        student.badges.push(badgeForChapter);
      }

      // Check if all 6 chapters passed
      const allPassed = ['bab-1', 'bab-2', 'bab-3', 'bab-4', 'bab-5', 'bab-6'].every(
        (id) => student.quizResults[id] && student.quizResults[id].passed
      );
      if (allPassed && !student.badges.includes('Master Bahasa Kelas 9')) {
        student.badges.push('Master Bahasa Kelas 9');
      }

      student.xp = (student.xp || 0) + (passed ? 100 : 30);
      this.saveStudents(students);
      return student;
    }
    return this.getActiveStudent();
  }

  public static addTeacherNote(studentId: string, note: string) {
    const students = this.getStudents();
    const student = students.find((s) => s.studentId === studentId);
    if (student) {
      student.teacherNote = note;
      this.saveStudents(students);
    }
  }

  public static createStudent(name: string, classRoom: string): StudentProgress {
    const students = this.getStudents();
    const newStudent: StudentProgress = {
      studentId: `std-${Date.now().toString().slice(-4)}`,
      studentName: name.trim(),
      classRoom: classRoom || '9A',
      readChapters: [],
      reflections: {},
      practiceScores: {},
      quizResults: {},
      badges: ['Murid Baru'],
      xp: 0,
    };
    students.push(newStudent);
    this.saveStudents(students);
    this.setActiveStudentId(newStudent.studentId);
    return newStudent;
  }

  public static resetData() {
    this.saveStudents(INITIAL_STUDENTS);
    this.setActiveStudentId(INITIAL_STUDENTS[0].studentId);
  }

  public static calculateClassStats(students: StudentProgress[], classRoomFilter: string = 'all'): ClassStatistics {
    const filtered = classRoomFilter === 'all' ? students : students.filter((s) => s.classRoom === classRoomFilter);
    if (filtered.length === 0) {
      return {
        totalStudents: 0,
        classAverage: 0,
        completionRate: 0,
        needRemedialCount: 0,
        chapterAverages: {},
      };
    }

    const chapterIds = ['bab-1', 'bab-2', 'bab-3', 'bab-4', 'bab-5', 'bab-6'];
    const chapterAverages: { [chapterId: string]: number } = {};
    let totalScoreSum = 0;
    let totalScoresCount = 0;
    let studentsNeedingRemedial = 0;
    let totalChaptersCompleted = 0;

    chapterIds.forEach((chId) => {
      let chSum = 0;
      let chCount = 0;
      filtered.forEach((st) => {
        const res = st.quizResults?.[chId];
        if (res) {
          chSum += res.score;
          chCount++;
          totalScoreSum += res.score;
          totalScoresCount++;
          if (res.passed) {
            totalChaptersCompleted++;
          }
        }
      });
      chapterAverages[chId] = chCount > 0 ? Math.round(chSum / chCount) : 0;
    });

    filtered.forEach((st) => {
      // Check if student has any failed quiz or average < 75
      const attempted = Object.values(st.quizResults || {});
      const hasFailed = attempted.some((q) => !q.passed);
      if (hasFailed || attempted.length === 0) {
        studentsNeedingRemedial++;
      }
    });

    const classAverage = totalScoresCount > 0 ? Math.round(totalScoreSum / totalScoresCount) : 0;
    const maxPossibleCompletions = filtered.length * 6;
    const completionRate = Math.round((totalChaptersCompleted / maxPossibleCompletions) * 100);

    return {
      totalStudents: filtered.length,
      classAverage,
      completionRate,
      needRemedialCount: studentsNeedingRemedial,
      chapterAverages,
    };
  }
}
