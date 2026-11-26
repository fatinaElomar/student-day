/**
 * EduTrack Pulse - Monthly Student Academic Performance & Rewards Tracker
 * Full client-side application logic with:
 * - Pure Light Mode Theme (Default & Permanent)
 * - Visitor View: Shows ONLY the combined test percentage (clean, non-cluttered)
 * - Admin Mode: Full access to raw grades, tests builder, student CRUD, table view
 * - Discreet Admin Access: Brand logo trigger, Ctrl+Shift+A shortcut, #admin URL trigger
 * - Multi-Quiz per month evaluation (Combined percentage depends on all tests)
 * - Quiz Gift Quest qualification (10 good quizzes > 70%)
 * - Student of the Month Spotlight & Momentum Velocity Tracking
 * - Student Photo / Avatar management with client-side compression
 * - Full Arabic Language version with RTL layout & English bilingual support
 */

(function () {
  'use strict';

  // =========================================================================
  // CONSTANTS & CONFIGURATION
  // =========================================================================
  const STORAGE_KEY = 'edutrack_students_data_v1';
  const ROLE_STORAGE_KEY = 'edutrack_admin_session';
  const LANG_STORAGE_KEY = 'edutrack_lang_pref';
  const ADMIN_PASSCODE = 'admin123';
  const GIFT_REQUIRED_QUIZZES = 10; // Must complete 10 points
  const GIFT_MIN_AVG_PERCENT = 70.0; // Combined final average across quizzes must be >= 70%
  const GIFT_CANCEL_BELOW_PERCENT = 50.0; // Score < 50% permanently cancels 1 earned point
  const MINI_QUIZ_MAX_THRESHOLD = 10; // Quizzes with maxScore < 10 are mini-quizzes
  const MINI_QUIZZES_PER_POINT = 5; // Every 5 good mini-quizzes count as 1 full point

  function isAvgEligiblePercent(pct) {
    return Number(pct) >= GIFT_MIN_AVG_PERCENT;
  }

  function isBadCancelPercent(pct) {
    return Number(pct) < GIFT_CANCEL_BELOW_PERCENT;
  }

  function isMiniQuizMax(maxScore) {
    const m = Number(maxScore) || 0;
    return m > 0 && m < MINI_QUIZ_MAX_THRESHOLD;
  }

  // =========================================================================
  // SUBJECT / QUIZ LOGO & ICON REGISTRY
  // =========================================================================
  const SUBJECT_REGISTRY = [
    {
      key: 'chemistry',
      labelEn: 'Chemistry',
      labelAr: 'كيمياء',
      keywords: ['chymstry', 'chemistry', 'chym', 'chem', 'chimie', 'كيمياء', 'الكيمياء', 'كيميائي'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M9 3h6"/><path d="M10 3v5.4L4.6 18.2A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.8L14 8.4V3"/><path d="M7 15h10"/><circle cx="10.5" cy="17.5" r="0.8" fill="currentColor"/><circle cx="14" cy="18" r="0.6" fill="currentColor"/></svg>'
    },
    {
      key: 'science',
      labelEn: 'Science',
      labelAr: 'علوم',
      keywords: ['science', 'sciences', 'scince', 'sci', 'علوم', 'العلوم', 'طبيعة', 'طبيعية'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></svg>'
    },
    {
      key: 'physics',
      labelEn: 'Physics',
      labelAr: 'فيزياء',
      keywords: ['physics', 'physique', 'phys', 'فيزياء', 'الفيزياء'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(45 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(-45 12 12)"/></svg>'
    },
    {
      key: 'biology',
      labelEn: 'Biology',
      labelAr: 'أحياء',
      keywords: ['biology', 'biologie', 'bio', 'أحياء', 'احياء', 'الأحياء', 'الاحياء'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
    },
    {
      key: 'math',
      labelEn: 'Math',
      labelAr: 'رياضيات',
      keywords: ['mathematics', 'mathématique', 'maths', 'math', 'algebra', 'geometry', 'calculus', 'رياضيات', 'الرياضيات', 'جبر', 'هندسة', 'حساب'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M5 7h14"/><path d="M9 7v12"/><path d="M15 7v8a3 3 0 0 0 3 3"/><path d="M6 19c2-2 3-5 3-8"/></svg>'
    },
    {
      key: 'arabic',
      labelEn: 'Arabic',
      labelAr: 'عربي',
      keywords: ['arabic', 'arabe', 'arab', 'عربي', 'عربية', 'العربية', 'نحو', 'بلاغة', 'إملاء', 'املاء', 'قراءة', 'تعبير'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>'
    },
    {
      key: 'english',
      labelEn: 'English',
      labelAr: 'إنجليزي',
      keywords: ['english', 'anglais', 'eng', 'grammar', 'vocab', 'إنجليزي', 'انجليزي', 'انكليزي', 'الإنكليزية', 'الإنجليزية', 'الانجليزية'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M9 13l3-7 3 7"/><path d="M10 11h4"/></svg>'
    },
    {
      key: 'french',
      labelEn: 'French',
      labelAr: 'فرنسي',
      keywords: ['french', 'français', 'francais', 'فرنسي', 'فرنسية', 'الفرنسية'],
      wordKeywords: ['fr'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>'
    },
    {
      key: 'islamic',
      labelEn: 'Islamic',
      labelAr: 'إسلامية',
      keywords: ['islamic', 'islam', 'quran', 'religion', 'إسلامية', 'اسلامية', 'الإسلامية', 'قرآن', 'دين', 'فقه', 'توحيد', 'تربية دينية'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><polygon points="18 3 18.9 5.1 21 5.4 19.4 6.9 19.8 9 18 7.9 16.2 9 16.6 6.9 15 5.4 17.1 5.1 18 3" fill="currentColor"/></svg>'
    },
    {
      key: 'history',
      labelEn: 'History',
      labelAr: 'تاريخ',
      keywords: ['history', 'histoire', 'hist', 'تاريخ', 'التاريخ'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>'
    },
    {
      key: 'geography',
      labelEn: 'Geography',
      labelAr: 'جغرافيا',
      keywords: ['geography', 'géographie', 'geographie', 'geo', 'جغرافيا', 'الجغرافيا', 'اجتماعيات', 'الاجتماعيات', 'وطنية'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    },
    {
      key: 'computer',
      labelEn: 'Computer',
      labelAr: 'حاسوب',
      keywords: ['computer', 'comp', 'coding', 'programming', 'informatique', 'tech', 'حاسوب', 'الحاسوب', 'معلوماتية', 'برمجة', 'تقنية'],
      wordKeywords: ['cs', 'it', 'ict'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
    },
    {
      key: 'art',
      labelEn: 'Art',
      labelAr: 'فنية',
      keywords: ['drawing', 'paint', 'فنية', 'رسم', 'تربية فنية'],
      wordKeywords: ['art', 'arts'],
      icon: '<svg class="svg-icon xs" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>'
    }
  ];

  const DEFAULT_SUBJECT_META = {
    key: 'default',
    labelEn: 'Quiz',
    labelAr: 'اختبار',
    icon: '<svg class="svg-icon xs" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  };

  function getQuizSubjectMeta(title) {
    const raw = String(title || '').trim().toLowerCase();
    if (!raw) return DEFAULT_SUBJECT_META;
    const words = raw.split(/[^a-z0-9\u0600-\u06FF]+/i).filter(Boolean);

    for (const subj of SUBJECT_REGISTRY) {
      if (subj.keywords && subj.keywords.some(kw => raw.includes(kw))) {
        return subj;
      }
      if (subj.wordKeywords && subj.wordKeywords.some(w => words.includes(w))) {
        return subj;
      }
    }
    return DEFAULT_SUBJECT_META;
  }

  // =========================================================================
  // MODERN CRISP SVG ICON REGISTRY
  // =========================================================================
  const AppIcons = {
    check: '<svg class="svg-icon sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    x: '<svg class="svg-icon sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6m0-6 6 6"/></svg>',
    info: '<svg class="svg-icon sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',
    alert: '<svg class="svg-icon sm" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    lock: '<svg class="svg-icon sm" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    unlock: '<svg class="svg-icon sm" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>',
    moon: '<svg class="svg-icon md" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    sun: '<svg class="svg-icon md" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14-1.41 1.41"/></svg>',
    crown: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>',
    gift: '<svg class="svg-icon xs" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13m7-9v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.5 4.5 0 0 1 12 7.5a4.5 4.5 0 0 1 4.5-4.5 2.5 2.5 0 0 1 0 5"/></svg>',
    star: '<svg class="svg-icon xs" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    forward: '<svg class="svg-icon xs" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    backward: '<svg class="svg-icon xs" viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
    stagnant: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    history: '<svg class="svg-icon xs" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    grade: '<svg class="svg-icon xs" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
    edit: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
    trash: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    snowflake: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20m-4.93-7.07L12 10 6.93 4.93m10.14 14.14L12 14l-5.07 5.07M4.93 17.07 10 12 4.93 6.93m14.14 10.14L14 12l5.07-5.07"/></svg>'
  };

  const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTH_NAMES_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  function formatMonthKey(key) {
    const [y, m] = String(key).split('-').map(Number);
    if (!y || !m || m < 1 || m > 12) return { key, labelEn: key, labelAr: key };
    return {
      key,
      labelEn: `${MONTH_NAMES_EN[m - 1]} ${y}`,
      labelAr: `${MONTH_NAMES_AR[m - 1]} ${y}`
    };
  }

  function getCurrentCalendarMonthKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  function getOffsetMonthKey(baseKey, offsetMonths) {
    const [y, m] = String(baseKey).split('-').map(Number);
    if (!y || !m) return baseKey;
    const d = new Date(y, m - 1 + offsetMonths, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  // Academic months supported (chronological, newest first)
  let AVAILABLE_MONTHS = [];

  function syncAvailableMonths(studentsList = []) {
    const keys = new Set();
    const currentKey = getCurrentCalendarMonthKey();
    // Always cover at least last 5 months + current + next month
    for (let i = -5; i <= 1; i++) {
      keys.add(getOffsetMonthKey(currentKey, i));
    }
    // Also ensure 2026-08..2026-12 baseline and any recorded month keys are included
    ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12'].forEach(k => keys.add(k));
    if (Array.isArray(studentsList)) {
      studentsList.forEach(s => {
        if (s && s.records) {
          Object.keys(s.records).forEach(k => {
            if (/^\d{4}-\d{2}$/.test(k)) keys.add(k);
          });
        }
      });
    }
    AVAILABLE_MONTHS = Array.from(keys)
      .sort((a, b) => b.localeCompare(a))
      .map(formatMonthKey);
  }

  syncAvailableMonths();

  // =========================================================================
  // COMPLETE BILINGUAL TRANSLATION REGISTRY (EN / AR)
  // =========================================================================
  const TRANSLATIONS = {
    en: {
      brandPrefix: 'EduTrack',
      brandHighlight: 'Pulse',
      brandSubtitle: 'Monthly Academic Performance & Rewards Hub',
      academicMonth: 'Academic Month:',
      cloudDbConnecting: 'Cloud DB: Connecting...',
      cloudDbConnected: 'MongoDB Atlas Connected',
      cloudDbSynced: 'MongoDB Atlas Synced',
      cloudDbOffline: 'LocalStorage Mode (API Offline)',
      cloudDbSavedLocally: 'Saved Locally (Sync Pending)',
      adminMode: 'Admin Mode',
      exitAdmin: 'Exit Admin',
      adminMenuBtn: 'Admin Menu',
      adminPanelTitle: 'Admin Panel',
      quickActions: 'Quick Actions',
      viewModeLabel: 'View Mode',
      dataManagement: 'Data Management',
      langToggleText: 'العربية',
      studentOfTheMonth: 'Student of the Month',
      spotlightHint: 'Based on top monthly score & quiz consistency',
      spotlightEvaluating: 'Evaluating monthly rankings...',
      spotlightNoRecords: 'No graded records available for this month yet.',
      topMonthlyPerformer: 'Top Monthly Performer',
      celebrate: 'Celebrate',
      viewingMonthLabel: 'Viewing Month:',
      monthFilterLabel: 'Month Filter:',
      currentMonthBtn: 'Current Month',
      previousMonthBtn: 'Previous Month',
      giftClubTitle: 'Will Get a Gift',
      giftClubDesc: 'Complete',
      goodQuizzesLabel: 'Quizzes',
      goodQuizMinHint: '(Combined Avg ≥ 70%)',
      goodQuizzesMonthLabel: 'Quizzes Count',
      qualifiedCount: '{n} Unlocked',
      giftRewardNote: 'Only students with ≥ 1 net point and ≥ 70% average appear; scores < 50% cancel 1 point permanently. Mini-quizzes (< 10) count 5 = 1 point. Paused points show reason on hover/click.',
      noGiftWinners: 'No students qualify yet — requires ≥ 1 good quiz and ≥ 70% average to appear!',
      classMomentum: 'Class Momentum',
      classMomentumDesc: 'Trajectory vs. Previous Month',
      movingForward: 'Moving Forward',
      scoresImproved: 'Scores improved',
      goingBack: 'Going Back',
      needsAttention: 'Needs attention',
      notWorking: 'Not Working',
      stagnantLowEffort: 'Stagnant / Low effort',
      classAverageGrade: 'Class Average Grade:',
      searchPlaceholder: 'Search by student name or ID...',
      filterAll: 'All',
      filterForward: 'Moving Forward',
      filterBackward: 'Going Back',
      filterStagnant: 'Not Working',
      filterGift: 'Gift Unlocked',
      filterQuest: 'In Gift Quest',
      viewCards: 'Cards',
      viewTable: 'Table',
      addStudent: 'Add Student',
      thStudent: 'Student',
      thGradeLevel: 'Class/Grade',
      thQuizResult: 'Quiz Result',
      thQuizPct: 'Quiz %',
      thGiftStatus: 'Gift Quest',
      thPrevMonth: 'Previous Month',
      thMonthlyScore: 'Current Score',
      thTrajectory: 'Trajectory',
      thRemarks: 'Remarks',
      thActions: 'Actions',
      noStudentsFound: 'No Students Found',
      noStudentsFoundDesc: 'No students match your current search or filter criteria for this month.',
      resetFilters: 'Reset Filters',
      rulesTitle: 'System Rules & Performance Criteria',
      giftAwardBadge: 'Gift Award',
      giftRuleDesc: 'Only ≥ 70% earns a point (mini-quizzes < 10 count 5 = 1 pt); < 50% cancels 1 point permanently. Admin may pause (freeze) or cancel points for behavior. Win at 10 active points & ≥ 70% avg.',
      forwardRuleDesc: 'Student is progressing! Monthly score increased compared to the previous month.',
      backwardRuleDesc: 'Regression alert! Monthly score dropped from the previous month. Requires teacher guidance.',
      stagnantRuleDesc: 'Student is inactive, showed 0 progress, or grades consistently below minimum passing standards.',
      exportData: 'Export Data (JSON)',
      clearAllData: 'Clear All Data',
      emptyRosterTitle: 'No Students Registered Yet',
      emptyRosterDesc: 'Start building your class roster by adding your real students.',
      emptyRosterLoginHint: 'Switch to Admin Mode to add students and enter monthly grades.',
      confirmClearAll: 'Are you sure you want to permanently delete all students and their grade records? This cannot be undone.',
      toastAllDataCleared: 'All student records have been cleared.',
      monthlyGrade: 'Monthly Grade',
      quizScore: 'Quiz Score',
      percentageLabel: 'Percentage',
      effortLabel: 'Effort: ',
      pendingEvaluation: 'Pending evaluation',
      adminOnly: '🔒 Admin Only',
      notGraded: 'Not Graded',
      topStudentRibbon: 'Top Student',
      giftQualified: 'Will Get Gift!',
      noGift: 'In Progress',
      viewProfile: 'Profile',
      gradeBtn: 'Grade',
      editBtn: 'Edit',
      deleteBtn: 'Delete',
      authModalTitle: 'Admin Authentication',
      authInstruction: 'For admin access only.',
      enterPasscode: 'Enter Admin Passcode:',
      pinPlaceholder: 'Enter passcode',
      authenticateBtn: 'Authenticate as Admin',
      cancelBtn: 'Cancel',
      addStudentTitle: 'Add New Student',
      editStudentTitle: 'Edit Student Details',
      studentPhotoLabel: 'Student Photo / Avatar',
      choosePhotoBtn: 'Choose Photo File',
      removePhotoBtn: 'Remove Photo',
      photoUrlPlaceholder: 'Or enter image URL / path (e.g. https://... or images/avatar.jpg)',
      quickSamples: 'Quick samples:',
      fullNameLabel: 'Full Name *',
      fullNamePlaceholder: 'e.g. Alex Johnson',
      studentCodeLabel: 'Student ID / Code',
      studentCodePlaceholder: 'e.g. STU-101',
      gradeLevelLabel: 'Class / Grade Level',
      gradeLevelPlaceholder: 'e.g. Grade 10-A',
      avatarAccentLabel: 'Avatar Accent',
      teacherNotesLabel: 'Teacher Notes / Background',
      teacherNotesPlaceholder: 'e.g. Strong in logic, needs motivation in homework...',
      saveStudentBtn: 'Save Student',
      recordGradeTitle: 'Record Monthly Performance',
      targetMonthLabel: 'Target Month *',
      attendanceLabel: 'Effort & Attendance',
      attendanceActive: 'Active & Attentive',
      attendanceAverage: 'Average Participation',
      attendanceLow: 'Low Effort / Irregular',
      attendanceAbsent: 'Repeated Absences',
      quizzesSectionTitle: 'Monthly Quizzes & Tests',
      quizzesSectionSubtitle: 'Add all tests/quizzes for this month. The combined quiz percentage is calculated from all tests.',
      addQuizRowBtn: '+ Add Test / Quiz',
      hdrQuizTitle: 'Test / Quiz Title',
      hdrScoreAchieved: 'Score Achieved',
      hdrTotalMax: 'Total Max',
      hdrQuizPct: '%',
      totalPointsLabel: 'Total Points',
      combinedQuizPctLabel: 'Combined Quiz %',
      giftQualificationLabel: 'Gift Goal (10 Quizzes & ≥70%)',
      enterScoresPrompt: 'Enter test scores',
      qualifiedGiftMsg: 'Will Get Gift! (10+ Quizzes & Avg ≥70%)',
      notQualifiedGiftMsg: '{n}/10 Quizzes • Avg {avg}%',
      overallGradeLabel: 'Overall Monthly Score (0 - 100) *',
      useQuizPctBtn: 'Use Quiz %',
      remarksLabel: 'Monthly Feedback / Remarks',
      remarksPlaceholder: 'e.g. Outstanding analytical thinking this month!',
      saveGradesBtn: 'Save Monthly Grade',
      studentProfileTitle: 'Student Profile',
      monthProgressTitle: 'Month-by-Month Progress & Gifts',
      closeBtn: 'Close',
      addMonthGradeBtn: 'Add Month Grade',
      confirmDeletionTitle: 'Confirm Deletion',
      deleteConfirmPrompt: 'Are you sure you want to delete this student and all associated monthly records?',
      deleteWarningText: 'This action cannot be undone.',
      deletePermanentlyBtn: 'Delete Permanently',
      yesGift: 'Gift Unlocked!',
      noGiftBadge: 'In Quest',
      testsCount: 'tests',
      toastAdminSuccess: 'Logged in as Admin successfully!',
      toastAdminLogout: 'Exited Admin mode successfully.',
      toastInvalidPasscode: 'Invalid passcode! Access denied.',
      toastStudentAdded: 'Student added successfully!',
      toastStudentUpdated: 'Student details updated!',
      toastStudentDeleted: 'Student deleted successfully!',
      toastGradeSaved: 'Monthly grade and quiz records saved successfully!',
      toastPhotoUploaded: 'Photo uploaded and compressed successfully!',
      toastPhotoRemoved: 'Photo removed.',
      toastCelebrating: 'Celebrating Student of the Month & Gift Winners!',
      toastExportSuccess: 'Student grade records exported successfully!',
      manageBehaviorBtn: 'Behavior / Freeze Point',
      behaviorModalTitle: 'Behavior & Point Control',
      behaviorActionTypeLabel: 'Action Type *',
      actionFreezeTitle: '❄️ Freeze Point (Paused)',
      actionFreezeDesc: 'Point stays visible in trail as paused; does not count until unfrozen.',
      actionCancelTitle: '🚫 Cancel Point Permanently',
      actionCancelDesc: 'Removes 1 earned point permanently due to behavior.',
      behaviorReasonLabel: 'Reason (shown on hover & click) *',
      behaviorReasonPlaceholder: 'e.g. Classroom disruption / misbehavior',
      applyBehaviorActionBtn: 'Apply Action',
      behaviorHistoryTitle: 'Frozen & Behavior-Cancelled Points',
      frozenPointTitle: 'Paused / Frozen Point',
      unfreezeBtn: 'Unfreeze Point',
      removeActionBtn: 'Remove',
      toastPointFrozen: 'Point frozen with behavior reason.',
      toastPointCancelled: 'Point permanently cancelled due to behavior.',
      toastPointUnfrozen: 'Point unfrozen and active again!',
      toastBehaviorRemoved: 'Behavior action removed.',
      selectTargetPointLabel: 'Choose Which Point to Freeze / Cancel *',
      toastTableAdminOnly: 'Table view is only accessible to Admin.',
      toastAdminReqGrade: 'Admin privileges required'
    },
    ar: {
      brandPrefix: 'إديوتراك',
      brandHighlight: 'بلس',
      brandSubtitle: 'محور الأداء الأكاديمي الشهري والجوائز التقديرية',
      academicMonth: 'الشهر الأكاديمي:',
      cloudDbConnecting: 'قاعدة السحابة: جارٍ الاتصال...',
      cloudDbConnected: 'متصل بـ MongoDB Atlas',
      cloudDbSynced: 'تمت المزامنة مع MongoDB Atlas',
      cloudDbOffline: 'وضع التخزين المحلي (غير متصل)',
      cloudDbSavedLocally: 'حُفظ محلياً (في انتظار المزامنة)',
      adminMode: 'وضع المسؤول',
      exitAdmin: 'خروج من المسؤول',
      adminMenuBtn: 'قائمة التحكم',
      adminPanelTitle: 'لوحة التحكم',
      quickActions: 'إجراءات سريعة',
      viewModeLabel: 'طريقة العرض',
      dataManagement: 'إدارة البيانات',
      langToggleText: 'English',
      studentOfTheMonth: 'طالب الشهر المتميز',
      spotlightHint: 'بناءً على أعلى درجة شهرية والمواظبة في الاختبارات',
      spotlightEvaluating: 'جارٍ تقييم تصنيفات الطلاب لهذا الشهر...',
      spotlightNoRecords: 'لا توجد سجلات درجات مرصودة لهذا الشهر بعد.',
      topMonthlyPerformer: 'الطالب المتصدر شهرياً',
      celebrate: 'احتفال',
      viewingMonthLabel: 'الشهر المعروض:',
      monthFilterLabel: 'تصفية الشهر:',
      currentMonthBtn: 'الشهر الحالي',
      previousMonthBtn: 'الشهر السابق',
      giftClubTitle: 'سيحصل على جائزة',
      giftClubDesc: 'أتم',
      goodQuizzesLabel: 'مسابقات',
      goodQuizMinHint: '(بمعدل نهائي 70% أو فوق)',
      goodQuizzesMonthLabel: 'عدد المسابقات',
      qualifiedCount: '{n} فائز',
      giftRewardNote: 'يظهر فقط من لديه نقطة واحدة على الأقل ومعدل 70% أو فوق — العلامة تحت 50% تلغي نقطة نهائياً، وكل 5 اختبارات صغيرة (< 10) تحسب كنقطة، والنقطة الموقفة يظهر سببها عند التمرير أو الضغط.',
      noGiftWinners: 'لا يوجد طلاب مستحقون حالياً — يتطلب علامة جيدة واحدة على الأقل ومعدل 70% أو فوق للظهور هنا!',
      classMomentum: 'مؤشر تقدم الفصل',
      classMomentumDesc: 'المسار مقارنة بالشهر السابق',
      movingForward: 'تقدم مستمر',
      scoresImproved: 'تحسن في الدرجات',
      goingBack: 'تراجع',
      needsAttention: 'يحتاج متابعة',
      notWorking: 'غير نشط',
      stagnantLowEffort: 'أداء ضعيف أو ركود',
      classAverageGrade: 'متوسط درجات الفصل:',
      searchPlaceholder: 'البحث باسم الطالب أو المعرف...',
      filterAll: 'الكل',
      filterForward: 'تقدم مستمر',
      filterBackward: 'تراجع',
      filterStagnant: 'غير نشط',
      filterGift: 'فاز بالهدية',
      filterQuest: 'في سباق الهدية',
      viewCards: 'بطاقات',
      viewTable: 'جدول',
      addStudent: 'إضافة طالب',
      thStudent: 'الطالب',
      thGradeLevel: 'الصف / المرحلة',
      thQuizResult: 'نتيجة الاختبار',
      thQuizPct: 'نسبة الاختبار %',
      thGiftStatus: 'سباق الهدية',
      thPrevMonth: 'الشهر السابق',
      thMonthlyScore: 'الدرجة الحالية',
      thTrajectory: 'مسار التقدم',
      thRemarks: 'ملاحظات',
      thActions: 'إجراءات',
      noStudentsFound: 'لم يتم العثور على أي طالب',
      noStudentsFoundDesc: 'لا يوجد طلاب يطابقون معايير البحث أو التصفية الحالية لهذا الشهر.',
      resetFilters: 'إعادة تعيين الفلاتر',
      rulesTitle: 'قواعد النظام ومعايير الأداء الأكاديمي',
      giftAwardBadge: 'جائزة التميز',
      giftRuleDesc: 'العلامة ≥70% تمنح نقطة (كل 5 اختبارات صغيرة <10 تحسب كنقطة)، وتحت 50% تلغي نقطة نهائياً. يمكن للمسؤول تجميد أو إلغاء نقطة للسلوك، والفوز عند 10 نقاط فعالة ومعدل ≥70%.',
      forwardRuleDesc: 'الطالب في مسار تصاعدي! ارتفعت درجاته مقارنة بالشهر السابق.',
      backwardRuleDesc: 'تنبيه تراجع! انخفضت الدرجة عن الشهر السابق، يحتاج إلى دعم وإرشاد.',
      stagnantRuleDesc: 'الطالب غير نشط، لم يحرز تقدماً، أو درجاته دون مستوى النجاح.',
      exportData: 'تصدير البيانات (JSON)',
      clearAllData: 'مسح كافة البيانات',
      emptyRosterTitle: 'لا يوجد طلاب مسجلون بعد',
      emptyRosterDesc: 'ابدأ ببناء قائمة الفصل بإضافة طلابك الحقيقيين.',
      emptyRosterLoginHint: 'سجّل الدخول كمسؤول لإضافة الطلاب ورصد الدرجات الشهرية.',
      confirmClearAll: 'هل أنت متأكد من رغبتك في حذف جميع الطلاب وسجلاتهم نهائياً؟ لا يمكن التراجع عن هذا الإجراء.',
      toastAllDataCleared: 'تم مسح كافة سجلات الطلاب بنجاح.',
      monthlyGrade: 'الدرجة الشهرية',
      quizScore: 'نتيجة الاختبار',
      percentageLabel: 'النسبة المئوية',
      effortLabel: 'المواظبة: ',
      pendingEvaluation: 'في انتظار التقييم',
      adminOnly: '🔒 للمسؤول فقط',
      notGraded: 'لم يُرصد بعد',
      topStudentRibbon: 'طالب الشهر',
      giftQualified: 'سيحصل على جائزة!',
      noGift: 'قيد التقدم',
      viewProfile: 'الملف الشخصي',
      gradeBtn: 'رصد الدرجات',
      editBtn: 'تعديل',
      deleteBtn: 'حذف',
      authModalTitle: 'تسجيل دخول المسؤول',
      authInstruction: 'للمسؤولين فقط.',
      enterPasscode: 'أدخل رمز مرور المسؤول:',
      pinPlaceholder: 'أدخل رمز المرور',
      authenticateBtn: 'دخول كمسؤول',
      cancelBtn: 'إلغاء',
      addStudentTitle: 'إضافة طالب جديد',
      editStudentTitle: 'تعديل بيانات الطالب',
      studentPhotoLabel: 'صورة الطالب / الرمز التعبيري',
      choosePhotoBtn: 'اختيار صورة',
      removePhotoBtn: 'حذف الصورة',
      photoUrlPlaceholder: 'أو أدخل رابط / مسار الصورة (مثال: https://...)',
      quickSamples: 'عينات سريعة:',
      fullNameLabel: 'الاسم الكامل *',
      fullNamePlaceholder: 'مثال: أحمد محمد',
      studentCodeLabel: 'معرف الطالب / الكود',
      studentCodePlaceholder: 'مثال: STU-101',
      gradeLevelLabel: 'الصف / المرحلة الدراسية',
      gradeLevelPlaceholder: 'مثال: الصف العاشر - أ',
      avatarAccentLabel: 'لون شارة الطالب',
      teacherNotesLabel: 'ملاحظات المعلم وخلفية الطالب',
      teacherNotesPlaceholder: 'مثال: ممتاز في التحليل، يحتاج تشجيعاً في الواجبات المنزلية...',
      saveStudentBtn: 'حفظ الطالب',
      recordGradeTitle: 'رصد الأداء والدرجات الشهرية',
      targetMonthLabel: 'الشهر المستهدف *',
      attendanceLabel: 'المواظبة والجهد',
      attendanceActive: 'نشط ومتفاعل',
      attendanceAverage: 'مشاركة متوسطة',
      attendanceLow: 'جهد ضعيف / غير منتظم',
      attendanceAbsent: 'غياب متكرر',
      quizzesSectionTitle: 'الاختبارات والكويزات الشهرية',
      quizzesSectionSubtitle: 'أضف جميع الاختبارات لهذا الشهر. يتم احتساب النسبة المجمعة بناءً على جميع الاختبارات.',
      addQuizRowBtn: '+ إضافة اختبار / كويز',
      hdrQuizTitle: 'اسم الاختبار / الكويز',
      hdrScoreAchieved: 'الدرجة المحرزة',
      hdrTotalMax: 'الدرجة العظمى',
      hdrQuizPct: '%',
      totalPointsLabel: 'مجموع النقاط',
      combinedQuizPctLabel: 'نسبة الاختبارات المجمعة',
      giftQualificationLabel: 'شرط الجائزة (10 مسابقات و ≥70%)',
      enterScoresPrompt: 'أدخل درجات المسابقات',
      qualifiedGiftMsg: 'سيحصل على جائزة! (أتم 10 مسابقات ومعدله ≥70%)',
      notQualifiedGiftMsg: '{n}/10 مسابقات • المعدل {avg}%',
      overallGradeLabel: 'الدرجة الشهرية العامة (0 - 100) *',
      useQuizPctBtn: 'استخدام نسبة الاختبار',
      remarksLabel: 'ملاحظات وتوجيهات الشهر',
      remarksPlaceholder: 'مثال: أداء متميز وتفكير تحليلي متقدم هذا الشهر!',
      saveGradesBtn: 'حفظ الدرجة الشهرية',
      studentProfileTitle: 'ملف الطالب الأكاديمي',
      monthProgressTitle: 'سجل التقدم الشهري والجوائز',
      closeBtn: 'إغلاق',
      addMonthGradeBtn: 'رصد درجة للشهر',
      confirmDeletionTitle: 'تأكيد الحذف',
      deleteConfirmPrompt: 'هل أنت متأكد من رغبتك في حذف هذا الطالب وجميع سجلاته الشهرية؟',
      deleteWarningText: 'لا يمكن التراجع عن هذا الإجراء.',
      deletePermanentlyBtn: 'حذف نهائي',
      yesGift: 'فاز بالهدية!',
      noGiftBadge: 'قيد التقدم',
      testsCount: 'اختبارات',
      toastAdminSuccess: 'تم تسجيل الدخول كمسؤول بنجاح!',
      toastAdminLogout: 'تم الخروج من وضع المسؤول بنجاح.',
      toastInvalidPasscode: 'رمز المرور غير صحيح!',
      toastStudentAdded: 'تمت إضافة الطالب بنجاح!',
      toastStudentUpdated: 'تم تحديث بيانات الطالب بنجاح!',
      toastStudentDeleted: 'تم حذف الطالب بنجاح!',
      toastGradeSaved: 'تم حفظ الدرجات الشهرية والاختبارات بنجاح!',
      toastPhotoUploaded: 'تم رفع الصورة وضغطها بنجاح!',
      toastPhotoRemoved: 'تمت إزالة الصورة.',
      toastCelebrating: 'نحتفل بطالب الشهر والفائزين بجوائز التميز!',
      toastExportSuccess: 'تم تصدير سجلات درجات الطلاب بنجاح!',
      toastTableAdminOnly: 'عرض الجدول متاح للمسؤول فقط.',
      toastAdminReqGrade: 'يتطلب هذا الإجراء صلاحيات المسؤول',
      manageBehaviorBtn: 'إدارة السلوك / تجميد نقطة',
      behaviorModalTitle: 'إدارة السلوك والنقاط',
      behaviorActionTypeLabel: 'نوع الإجراء *',
      actionFreezeTitle: '❄️ تجميد نقطة (موقفة)',
      actionFreezeDesc: 'تبقى النقطة ظاهرة في المسار كموقفة ولا تُحتسب حتى يتم فك التجميد.',
      actionCancelTitle: '🚫 إلغاء نقطة نهائياً',
      actionCancelDesc: 'حذف نقطة مكتسبة نهائياً بسبب السلوك أو المشاغبة.',
      behaviorReasonLabel: 'السبب (يظهر عند التمرير والضغط) *',
      behaviorReasonPlaceholder: 'مثال: مشاغبة في الحصة أو مخالفة السلوك',
      applyBehaviorActionBtn: 'تنفيذ الإجراء',
      behaviorHistoryTitle: 'النقاط المجمدة والملغاة سلوكياً',
      frozenPointTitle: 'نقطة مجمدة (موقفة)',
      unfreezeBtn: 'فك التجميد',
      removeActionBtn: 'إزالة',
      toastPointFrozen: 'تم تجميد النقطة مع حفظ السبب.',
      toastPointCancelled: 'تم إلغاء النقطة نهائياً بسبب السلوك.',
      toastPointUnfrozen: 'تم فك تجميد النقطة وعادت فعالة!',
      toastBehaviorRemoved: 'تمت إزالة إجراء السلوك.',
      selectTargetPointLabel: 'اختر النقطة التي تريد تجميدها أو إلغاءها *'
    }
  };

  // Application State
  let state = {
    isAdmin: false,
    selectedMonth: getCurrentCalendarMonthKey(), // Default to current calendar month
    activeFilter: 'all',      // 'all' | 'forward' | 'backward' | 'stagnant' | 'gift' | 'quest'
    searchQuery: '',
    viewMode: 'grid',         // 'grid' | 'table'
    lang: 'ar',               // 'ar' | 'en' - Arabic version default
    students: []
  };

  // Helper translation function with optional parameter substitution
  function t(key, params = {}) {
    const lang = state.lang || 'ar';
    let text = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) || key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(p => {
        text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
      });
    }
    return text;
  }

  function getMonthLabel(monthKey) {
    const m = AVAILABLE_MONTHS.find(item => item.key === monthKey);
    if (!m) return monthKey;
    return (state.lang === 'ar') ? m.labelAr : m.labelEn;
  }

  // =========================================================================
  // DEMO DATA PURGE & FILTERING (Ensure ONLY real user data is used)
  // =========================================================================
  const FAKE_DEMO_IDS = new Set(['stu_1', 'stu_2', 'stu_3', 'stu_4', 'stu_5', 'stu_6']);
  const FAKE_DEMO_NAMES = new Set([
    'maya lin',
    'david kim',
    'lucas rossi',
    'elena rostova',
    'ethan blake',
    'sofia al-mansoor',
    'zaid al-mansoor'
  ]);

  function isDemoStudent(student) {
    if (!student) return false;
    const studentId = (student.id || '').trim();
    const studentName = (student.name || '').trim().toLowerCase();
    return FAKE_DEMO_IDS.has(studentId) || FAKE_DEMO_NAMES.has(studentName);
  }

  // =========================================================================
  // DOM ELEMENT SELECTORS
  // =========================================================================
  const elements = {
    brandLogoTrigger: document.getElementById('brand-logo-trigger'),
    dbStatusBadge: document.getElementById('db-status-badge'),
    dbStatusText: document.getElementById('db-status-text'),
    monthSelect: document.getElementById('month-select'),
    roleSwitcherContainer: document.getElementById('role-switcher-container'),
    roleStatusBadge: document.getElementById('role-status-badge'),
    currentRoleLabel: document.getElementById('current-role-label'),
    btnToggleAdmin: document.getElementById('btn-toggle-admin'),
    adminBtnIcon: document.getElementById('admin-btn-icon'),
    adminBtnText: document.getElementById('admin-btn-text'),
    langToggleBtn: document.getElementById('lang-toggle-btn'),
    langBtnText: document.getElementById('lang-btn-text'),

    // Highlights & Active Month Banner
    activeMonthBannerLabel: document.getElementById('active-month-banner-label'),
    prevMonthBannerHint: document.getElementById('prev-month-banner-hint'),
    spotlightContent: document.getElementById('spotlight-content'),
    btnCelebrate: document.getElementById('btn-celebrate'),
    giftQualifiedList: document.getElementById('gift-qualified-list'),
    giftCountBadge: document.getElementById('gift-count-badge'),
    giftThresholdDisplay: document.getElementById('gift-threshold-display'),

    // Momentum stats
    statForwardCount: document.getElementById('stat-forward-count'),
    statBackwardCount: document.getElementById('stat-backward-count'),
    statStagnantCount: document.getElementById('stat-stagnant-count'),
    classAvgDisplay: document.getElementById('class-avg-display'),
    classAvgProgressBar: document.getElementById('class-avg-progress-bar'),

    // Toolbar & Month Filter
    toolbarMonthSelect: document.getElementById('toolbar-month-select'),
    btnFilterCurrMonth: document.getElementById('btn-filter-curr-month'),
    btnFilterPrevMonth: document.getElementById('btn-filter-prev-month'),
    currMonthBtnTag: document.getElementById('curr-month-btn-tag'),
    prevMonthBtnTag: document.getElementById('prev-month-btn-tag'),
    searchInput: document.getElementById('student-search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    filterPills: document.querySelectorAll('.filter-pill'),
    countAll: document.getElementById('count-all'),
    countForward: document.getElementById('count-forward'),
    countBackward: document.getElementById('count-backward'),
    countStagnant: document.getElementById('count-stagnant'),
    countGift: document.getElementById('count-gift'),
    countQuest: document.getElementById('count-quest'),
    btnViewGrid: document.getElementById('btn-view-grid'),
    btnViewTable: document.getElementById('btn-view-table'),
    btnAddStudent: document.getElementById('btn-add-student'),

    // Main views
    studentsGridView: document.getElementById('students-grid-view'),
    studentsTableView: document.getElementById('students-table-view'),
    studentsTableBody: document.getElementById('students-table-body'),
    emptyState: document.getElementById('empty-state'),
    btnResetFilters: document.getElementById('btn-reset-filters'),

    // Modals
    modalAdminAuth: document.getElementById('modal-admin-auth'),
    adminAuthForm: document.getElementById('admin-auth-form'),
    adminPinInput: document.getElementById('admin-pin-input'),

    modalStudentCrud: document.getElementById('modal-student-crud'),
    studentCrudForm: document.getElementById('student-crud-form'),
    crudModalTitle: document.getElementById('crud-modal-title'),
    crudModalTitleText: document.getElementById('crud-modal-title-text'),
    studentEditId: document.getElementById('student-edit-id'),
    studentAvatarUrl: document.getElementById('student-avatar-url'),
    crudAvatarPreview: document.getElementById('crud-avatar-preview'),
    crudAvatarImg: document.getElementById('crud-avatar-img'),
    crudAvatarFallback: document.getElementById('crud-avatar-fallback'),
    studentPhotoFileInput: document.getElementById('student-photo-file-input'),
    btnTriggerFileUpload: document.getElementById('btn-trigger-file-upload'),
    btnRemovePhoto: document.getElementById('btn-remove-photo'),
    studentImageUrlInput: document.getElementById('student-image-url-input'),
    photoUploadSection: document.querySelector('.photo-upload-section'),
    studentNameInput: document.getElementById('student-name-input'),
    studentCodeInput: document.getElementById('student-code-input'),
    studentGradeLevel: document.getElementById('student-grade-level'),
    studentAvatarColor: document.getElementById('student-avatar-color'),
    studentNotesInput: document.getElementById('student-notes-input'),

    modalGradeEntry: document.getElementById('modal-grade-entry'),
    gradeEntryForm: document.getElementById('grade-entry-form'),
    gradeStudentId: document.getElementById('grade-student-id'),
    gradeModalStudentName: document.getElementById('grade-modal-student-name'),
    gradeMonthSelect: document.getElementById('grade-month-select'),
    gradeMonthComparisonBox: document.getElementById('grade-month-comparison-box'),
    gradeAttendanceStatus: document.getElementById('grade-attendance-status'),
    quizRowsList: document.getElementById('quiz-rows-list'),
    btnAddQuizRow: document.getElementById('btn-add-quiz-row'),
    quizTotalPointsDisplay: document.getElementById('quiz-total-points-display'),
    quizCalcPreview: document.getElementById('quiz-calc-preview'),
    quizGoodCountDisplay: document.getElementById('quiz-good-count-display'),
    quizGiftStatusText: document.getElementById('quiz-gift-status-text'),
    btnSyncOverallFromQuiz: document.getElementById('btn-sync-overall-from-quiz'),
    btnSyncPctVal: document.getElementById('btn-sync-pct-val'),
    lblUseQuizSync: document.getElementById('lbl-use-quiz-sync'),
    overallGradeInput: document.getElementById('overall-grade-input'),
    gradeCommentInput: document.getElementById('grade-comment-input'),

    modalStudentDetail: document.getElementById('modal-student-detail'),
    detailAvatar: document.getElementById('detail-avatar'),
    detailAvatarImg: document.getElementById('detail-avatar-img'),
    detailAvatarFallback: document.getElementById('detail-avatar-fallback'),
    detailModalName: document.getElementById('detail-modal-name'),
    detailModalId: document.getElementById('detail-modal-id'),
    detailModalGrade: document.getElementById('detail-modal-grade'),
    detailGiftQuestBoard: document.getElementById('detail-gift-quest-board'),
    detailHistoryContainer: document.getElementById('detail-history-container'),
    detailTrajectoryInsights: document.getElementById('detail-trajectory-insights'),
    btnDetailAddGrade: document.getElementById('btn-detail-add-grade'),

    modalDeleteConfirm: document.getElementById('modal-delete-confirm'),
    deleteStudentName: document.getElementById('delete-student-name'),
    deleteConfirmPromptMsg: document.getElementById('delete-confirm-prompt-msg'),
    btnConfirmDelete: document.getElementById('btn-confirm-delete'),

    btnDetailBehavior: document.getElementById('btn-detail-behavior'),
    modalBehaviorAction: document.getElementById('modal-behavior-action'),
    behaviorActionForm: document.getElementById('behavior-action-form'),
    behaviorStudentId: document.getElementById('behavior-student-id'),
    behaviorTargetIndex: document.getElementById('behavior-target-index'),
    behaviorTargetKey: document.getElementById('behavior-target-key'),
    behaviorModalStudentName: document.getElementById('behavior-modal-student-name'),
    behaviorPointsSummary: document.getElementById('behavior-points-summary'),
    behaviorPointPicker: document.getElementById('behavior-point-picker'),
    behaviorQuickReasons: document.getElementById('behavior-quick-reasons'),
    behaviorReasonInput: document.getElementById('behavior-reason-input'),
    behaviorExistingList: document.getElementById('behavior-existing-list'),

    modalFreezeReason: document.getElementById('modal-freeze-reason'),
    freezeReasonBody: document.getElementById('freeze-reason-body'),
    freezeReasonActions: document.getElementById('freeze-reason-actions'),

    // Utilities & Empty State
    btnExportData: document.getElementById('btn-export-data'),
    btnClearAll: document.getElementById('btn-clear-all'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    emptyStateDesc: document.getElementById('empty-state-desc'),
    btnResetFilters: document.getElementById('btn-reset-filters'),
    btnEmptyAddStudent: document.getElementById('btn-empty-add-student'),
    toastContainer: document.getElementById('toast-container'),

    // Admin Sidebar
    adminSidebar: document.getElementById('admin-sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    btnSidebarToggle: document.getElementById('btn-sidebar-toggle'),
    btnSidebarClose: document.getElementById('btn-sidebar-close')
  };

  let pendingDeleteStudentId = null;

  // =========================================================================
  // LANGUAGE & RTL MANAGEMENT (Bilingual AR / EN)
  // =========================================================================
  function applyLanguage(lang) {
    state.lang = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (_) {}

    const isArabic = (lang === 'ar');
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.body.classList.toggle('arabic-mode', isArabic);

    // Update Language button text
    if (elements.langBtnText) {
      elements.langBtnText.textContent = isArabic ? 'English' : 'العربية';
    }

    // Update static DOM elements tagged with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        el.textContent = TRANSLATIONS[lang][key];
      }
    });

    // Update input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        el.setAttribute('placeholder', TRANSLATIONS[lang][key]);
      }
    });

    // Update element titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
        el.setAttribute('title', TRANSLATIONS[lang][key]);
      }
    });

    // Re-populate month options with current language
    populateMonthSelectors();
    updateMonthFilterUI();

    // Refresh role UI text
    updateRoleUI();

    // Re-render highlights, cards, and tables in the new language
    renderHighlights();
    renderStudents();
  }

  function toggleLanguage() {
    const nextLang = (state.lang === 'ar') ? 'en' : 'ar';
    applyLanguage(nextLang);
  }

  // =========================================================================
  // DATA PERSISTENCE & MONGODB API INTEGRATION
  // =========================================================================
  const isLocalDev = (typeof window !== 'undefined') && (
    window.location.protocol === 'file:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  // When hosted on GitHub Pages (or any non-localhost origin), point to Render backend
  const RENDER_API = 'https://student-day.onrender.com/api';

  const API_BASE = isLocalDev ? 'http://localhost:3000/api' : RENDER_API;

  function updateDbStatus(status, textKey, defaultText) {
    if (!elements.dbStatusBadge || !elements.dbStatusText) return;
    elements.dbStatusBadge.className = `db-pill ${status} admin-only`;
    elements.dbStatusText.textContent = textKey ? t(textKey) : (defaultText || status);
  }

  async function checkDbHealth() {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const json = await res.json();
        if (json.dbConnected) {
          const wasConnected = elements.dbStatusBadge && elements.dbStatusBadge.classList.contains('connected');
          updateDbStatus('connected', 'cloudDbConnected', 'MongoDB Atlas Connected');
          // If we were offline or haven't loaded students from cloud yet, load them
          if (!wasConnected) {
            loadData();
          }
        } else {
          updateDbStatus('connecting', 'cloudDbConnecting', 'Connecting to MongoDB Atlas...');
        }
      }
    } catch (_) {
      // Backend not running
    }
  }

  // Periodic check to auto-detect when MongoDB Atlas connects
  setInterval(checkDbHealth, 8000);

  function findBestActiveMonth() {
    syncAvailableMonths(state.students);
    const currCalKey = getCurrentCalendarMonthKey();

    // If selectedMonth already has records, keep it
    const currentHasRecords = state.students && state.students.some(s => s.records && s.records[state.selectedMonth]);
    if (currentHasRecords) return state.selectedMonth;

    // Prefer current calendar month if it has records
    if (state.students && state.students.some(s => s.records && s.records[currCalKey])) {
      return currCalKey;
    }

    // Otherwise find the newest available month that has records
    for (const m of AVAILABLE_MONTHS) {
      if (state.students && state.students.some(s => s.records && s.records[m.key])) {
        return m.key;
      }
    }
    return currCalKey;
  }

  function setSelectedMonth(monthKey) {
    if (!monthKey) return;
    state.selectedMonth = monthKey;
    syncAvailableMonths(state.students);
    populateMonthSelectors();
    updateMonthFilterUI();
    renderHighlights();
    renderStudents();
  }

  function updateMonthFilterUI() {
    const currCalKey = getCurrentCalendarMonthKey();
    const prevCalKey = getOffsetMonthKey(currCalKey, -1);
    const prevOfSelectedKey = getPreviousMonthKey(state.selectedMonth) || getOffsetMonthKey(state.selectedMonth, -1);
    const isAr = (state.lang === 'ar');

    if (elements.activeMonthBannerLabel) {
      elements.activeMonthBannerLabel.textContent = getMonthLabel(state.selectedMonth);
    }
    if (elements.prevMonthBannerHint) {
      const prevLabel = getMonthLabel(prevOfSelectedKey);
      elements.prevMonthBannerHint.textContent = isAr
        ? `مقارنة بـ ${prevLabel}`
        : `vs. ${prevLabel}`;
    }

    if (elements.currMonthBtnTag) {
      elements.currMonthBtnTag.textContent = `(${getMonthLabel(currCalKey).split(' ')[0]})`;
    }
    if (elements.prevMonthBtnTag) {
      elements.prevMonthBtnTag.textContent = `(${getMonthLabel(prevCalKey).split(' ')[0]})`;
    }

    if (elements.btnFilterCurrMonth) {
      elements.btnFilterCurrMonth.classList.toggle('active', state.selectedMonth === currCalKey);
    }
    if (elements.btnFilterPrevMonth) {
      elements.btnFilterPrevMonth.classList.toggle('active', state.selectedMonth === prevCalKey);
    }

    if (elements.monthSelect && elements.monthSelect.value !== state.selectedMonth) {
      elements.monthSelect.value = state.selectedMonth;
    }
    if (elements.toolbarMonthSelect && elements.toolbarMonthSelect.value !== state.selectedMonth) {
      elements.toolbarMonthSelect.value = state.selectedMonth;
    }
  }

  function loadInitialLocalData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Keep only user's real data, purge any fake demo students
          state.students = parsed.filter(s => !isDemoStudent(s));
          saveData();
        } else {
          state.students = [];
          saveData();
        }
      } else {
        state.students = [];
        saveData();
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
      state.students = [];
      saveData();
    }
    state.selectedMonth = findBestActiveMonth();
  }

  async function loadData() {
    // Fetch live records from backend API
    updateDbStatus('connecting', 'cloudDbConnecting', 'Connecting to MongoDB Atlas...');
    try {
      const response = await fetch(`${API_BASE}/students`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          // Keep strictly real user data, filtering out any legacy demo students
          const realStudents = json.data.filter(s => !isDemoStudent(s));
          state.students = realStudents;
          saveData();
          updateDbStatus('connected', 'cloudDbConnected', 'MongoDB Atlas Connected');
          state.selectedMonth = findBestActiveMonth();
          populateMonthSelectors();
          updateMonthFilterUI();
          renderHighlights();
          renderStudents();
          return;
        }
      } else if (response.status === 503) {
        updateDbStatus('connecting', 'cloudDbConnecting', 'MongoDB: Connecting to Atlas...');
      } else {
        updateDbStatus('offline', 'cloudDbOffline', 'LocalStorage Mode (API Offline)');
      }
    } catch (err) {
      console.info('Backend API unavailable; running in localStorage mode:', err.message);
      updateDbStatus('offline', 'cloudDbOffline', 'LocalStorage Mode (Offline)');
    }

    state.selectedMonth = findBestActiveMonth();
    populateMonthSelectors();
    updateMonthFilterUI();
    renderHighlights();
    renderStudents();
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.students));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
      showToast('Storage quota exceeded or unavailable', 'error');
    }
  }

  async function syncStudentToApi(student) {
    saveData();
    try {
      const res = await fetch(`${API_BASE}/students/${encodeURIComponent(student.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      });
      if (res.ok) {
        updateDbStatus('connected', 'cloudDbSynced', 'MongoDB Atlas Synced');
      }
    } catch (err) {
      console.warn('Cloud sync offline; changes saved to localStorage:', err.message);
      updateDbStatus('offline', 'cloudDbSavedLocally', 'Saved Locally (Sync Pending)');
    }
  }

  async function deleteStudentFromApi(studentId) {
    saveData();
    try {
      const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        updateDbStatus('connected', 'cloudDbSynced', 'MongoDB Atlas Synced');
      }
    } catch (err) {
      console.warn('Could not sync delete to API:', err.message);
    }
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(messageOrKey, type = 'info') {
    if (!elements.toastContainer) return;
    const message = TRANSLATIONS[state.lang] && TRANSLATIONS[state.lang][messageOrKey]
      ? TRANSLATIONS[state.lang][messageOrKey]
      : messageOrKey;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = AppIcons.info;
    if (type === 'success') icon = AppIcons.check;
    if (type === 'error') icon = AppIcons.x;
    if (type === 'warning') icon = AppIcons.alert;

    toast.innerHTML = `<span class="toast-icon-wrap">${icon}</span><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = (state.lang === 'ar') ? 'translateX(-100%)' : 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // UTILITIES & AVATAR / IMAGE HELPERS
  // =========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderAvatarHtml(student, sizeClass = '') {
    const initial = student.name ? student.name.trim().charAt(0).toUpperCase() : '?';
    const color = student.avatarColor || 'indigo';
    const hasImage = Boolean(student.avatarUrl && student.avatarUrl.trim());
    const initialStyle = hasImage ? 'style="display:none;"' : '';
    const imgStyle = hasImage ? '' : 'style="display:none;"';

    return `
      <div class="avatar-circle ${sizeClass} avatar-${color} ${hasImage ? 'has-image' : ''}" title="${escapeHtml(student.name)}">
        <img src="${hasImage ? escapeHtml(student.avatarUrl) : ''}" alt="${escapeHtml(student.name)}" class="avatar-img" ${imgStyle} onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex'; this.parentElement.classList.remove('has-image');" />
        <span class="avatar-fallback" ${initialStyle}>${initial}</span>
      </div>
    `;
  }

  function setCrudAvatarPreview(avatarUrl, avatarColor, studentName) {
    if (!elements.crudAvatarPreview) return;
    const color = avatarColor || (elements.studentAvatarColor ? elements.studentAvatarColor.value : 'indigo');
    elements.crudAvatarPreview.className = `avatar-circle lg avatar-${color}`;

    const rawName = (studentName !== undefined) ? studentName : (elements.studentNameInput ? elements.studentNameInput.value : '');
    const initial = (rawName ? rawName.trim().charAt(0).toUpperCase() : '') || '?';
    if (elements.crudAvatarFallback) elements.crudAvatarFallback.textContent = initial;

    const url = (avatarUrl !== undefined) ? avatarUrl : (elements.studentAvatarUrl ? elements.studentAvatarUrl.value : '');
    if (url && url.trim()) {
      elements.crudAvatarPreview.classList.add('has-image');
      if (elements.crudAvatarImg) {
        elements.crudAvatarImg.src = url.trim();
        elements.crudAvatarImg.style.display = 'block';
        elements.crudAvatarImg.onerror = function() {
          this.style.display = 'none';
          if (elements.crudAvatarFallback) elements.crudAvatarFallback.style.display = 'flex';
          elements.crudAvatarPreview.classList.remove('has-image');
        };
      }
      if (elements.crudAvatarFallback) elements.crudAvatarFallback.style.display = 'none';
      if (elements.btnRemovePhoto) elements.btnRemovePhoto.style.display = 'inline-flex';
    } else {
      elements.crudAvatarPreview.classList.remove('has-image');
      if (elements.crudAvatarImg) {
        elements.crudAvatarImg.src = '';
        elements.crudAvatarImg.style.display = 'none';
      }
      if (elements.crudAvatarFallback) elements.crudAvatarFallback.style.display = 'flex';
      if (elements.btnRemovePhoto) elements.btnRemovePhoto.style.display = 'none';
    }
  }

  function compressImageFile(file, maxWidth, maxHeight, quality, callback) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'warning');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('Image file size must be under 15MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => showToast('Failed to read image file', 'error');
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => showToast('Failed to parse image', 'error');
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        const maxDim = Math.max(w, h);
        if (maxDim > maxWidth) {
          const scale = maxWidth / maxDim;
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        callback(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // =========================================================================
  // CALCULATION, GIFT QUEST (10 QUIZZES + COMBINED AVG >= 70%) & TRAJECTORY
  // =========================================================================
  function getPreviousMonthKey(currentMonthKey) {
    const idx = AVAILABLE_MONTHS.findIndex(m => m.key === currentMonthKey);
    if (idx !== -1 && idx < AVAILABLE_MONTHS.length - 1) {
      return AVAILABLE_MONTHS[idx + 1].key;
    }
    return getOffsetMonthKey(currentMonthKey, -1);
  }

  function evaluateGiftQuest(student, upToMonthKey = null, draftOverride = null) {
    const records = (student && student.records) ? student.records : {};
    const monthKeys = new Set(Object.keys(records));
    if (draftOverride && draftOverride.monthKey) {
      monthKeys.add(draftOverride.monthKey);
    }

    const trailPoints = [];
    const miniGoodPool = [];
    let goodCount = 0;
    let badCount = 0;
    let neutralCount = 0;
    let cancelledPoints = 0;
    let miniCancelledCount = 0;
    let totalQuizzes = 0;
    let totalScoreSum = 0;
    let totalMaxSum = 0;
    let quizzesInTargetMonth = 0;

    Array.from(monthKeys).sort().forEach(mKey => {
      if (upToMonthKey && mKey > upToMonthKey) return;

      let quizzesList = null;
      if (draftOverride && draftOverride.monthKey === mKey) {
        quizzesList = Array.isArray(draftOverride.quizzes) ? draftOverride.quizzes : [];
      } else {
        const rec = records[mKey];
        if (!rec) return;
        if (Array.isArray(rec.quizzes) && rec.quizzes.length > 0) {
          quizzesList = rec.quizzes;
        } else if (rec.quizMax > 0) {
          quizzesList = [{ title: 'Quiz', score: Number(rec.quizScore) || 0, maxScore: Number(rec.quizMax) }];
        } else {
          quizzesList = [];
        }
      }

      let miniBundleSeq = 0;
      quizzesList.forEach((q, qIdx) => {
        const maxNum = Number(q.maxScore) || 0;
        const scoreNum = Number(q.score) || 0;
        if (maxNum <= 0 || q.isEmpty) return;
        totalQuizzes++;
        totalScoreSum += scoreNum;
        totalMaxSum += maxNum;
        if (upToMonthKey && mKey === upToMonthKey) {
          quizzesInTargetMonth++;
        }

        const isMini = isMiniQuizMax(maxNum);
        const quizPct = (scoreNum / maxNum) * 100;
        const rawTitle = (q.title || 'Quiz').trim() || 'Quiz';

        if (isAvgEligiblePercent(quizPct)) {
          goodCount++;
          if (isMini) {
            miniGoodPool.push({
              title: rawTitle,
              pct: Number(quizPct.toFixed(1)),
              score: scoreNum,
              maxScore: maxNum,
              monthKey: mKey,
              subject: getQuizSubjectMeta(rawTitle)
            });
            if (miniGoodPool.length >= MINI_QUIZZES_PER_POINT) {
              miniBundleSeq++;
              const batch = miniGoodPool.splice(0, MINI_QUIZZES_PER_POINT);
              const batchAvg = Number((batch.reduce((acc, item) => acc + item.pct, 0) / batch.length).toFixed(1));
              const lastSubj = batch[batch.length - 1].subject || DEFAULT_SUBJECT_META;
              trailPoints.push({
                pointKey: `${mKey}|mini|${miniBundleSeq}`,
                kind: 'mini_bundle',
                title: batch.map(b => `${b.title} (${b.pct}%)`).join(' • '),
                miniQuizzes: batch,
                pct: batchAvg,
                monthKey: mKey,
                subject: lastSubj,
                isFrozen: false
              });
            }
          } else {
            trailPoints.push({
              pointKey: `${mKey}|reg|${qIdx}|${rawTitle}`,
              kind: 'regular',
              title: rawTitle,
              pct: Number(quizPct.toFixed(1)),
              monthKey: mKey,
              subject: getQuizSubjectMeta(rawTitle),
              isFrozen: false
            });
          }
        } else if (isBadCancelPercent(quizPct)) {
          badCount++;
          if (isMini) {
            if (miniGoodPool.length > 0) {
              miniGoodPool.pop();
              miniCancelledCount++;
            } else {
              // Unbundle the most recent mini-bundle if present (5 -> 4 mini-quizzes)
              let bundleIdx = -1;
              for (let idx = trailPoints.length - 1; idx >= 0; idx--) {
                if (trailPoints[idx].kind === 'mini_bundle') {
                  bundleIdx = idx;
                  break;
                }
              }
              if (bundleIdx !== -1) {
                const [bundle] = trailPoints.splice(bundleIdx, 1);
                const kept = Array.isArray(bundle.miniQuizzes) ? bundle.miniQuizzes.slice(0, MINI_QUIZZES_PER_POINT - 1) : [];
                miniGoodPool.push(...kept);
                miniCancelledCount++;
              }
            }
          } else if (trailPoints.length > 0) {
            trailPoints.pop();
            cancelledPoints++;
          }
        } else {
          // 50% to 69.9%: neither earns a point nor cancels an existing point
          neutralCount++;
        }
      });
    });

    // Apply Admin Behavior Actions (Freeze = paused but visible with reason; Cancel = permanently deducted)
    const rawActions = Array.isArray(student && student.behaviorActions) ? student.behaviorActions : [];
    const relevantActions = rawActions
      .filter(act => !upToMonthKey || !act.monthKey || act.monthKey <= upToMonthKey)
      .slice()
      .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));

    let behaviorCancelledCount = 0;
    const behaviorCancelledList = [];

    const findActionTargetIndex = (act) => {
      if (act.targetPointKey) {
        const byKey = trailPoints.findIndex(p => p.pointKey === act.targetPointKey && !p.isFrozen);
        if (byKey !== -1) return byKey;
      }
      if (typeof act.targetIndex === 'number' && trailPoints[act.targetIndex] && !trailPoints[act.targetIndex].isFrozen) {
        return act.targetIndex;
      }
      for (let k = trailPoints.length - 1; k >= 0; k--) {
        if (!trailPoints[k].isFrozen) return k;
      }
      return -1;
    };

    relevantActions.forEach(act => {
      if (!act || !act.action) return;
      if (act.action === 'cancel') {
        let idx = findActionTargetIndex(act);
        if (idx === -1 && trailPoints.length > 0) idx = trailPoints.length - 1;
        if (idx !== -1) {
          const [removedPt] = trailPoints.splice(idx, 1);
          behaviorCancelledCount++;
          behaviorCancelledList.push({ ...act, removedTitle: removedPt ? removedPt.title : '' });
        }
      } else if (act.action === 'freeze') {
        const idx = findActionTargetIndex(act);
        if (idx !== -1) {
          trailPoints[idx].isFrozen = true;
          trailPoints[idx].freezeReason = act.reason || '';
          trailPoints[idx].freezeId = act.id;
          trailPoints[idx].freezeDate = act.createdAt || '';
        }
      }
    });

    const frozenCount = trailPoints.filter(p => p.isFrozen).length;
    const points = trailPoints.filter(p => !p.isFrozen).length;
    const miniBufferCount = miniGoodPool.length;

    const combinedAvg = totalMaxSum > 0 ? Number(((totalScoreSum / totalMaxSum) * 100).toFixed(1)) : 0;
    const hasCompleted10 = points >= GIFT_REQUIRED_QUIZZES;
    const avgMet = totalQuizzes > 0 && isAvgEligiblePercent(combinedAvg);
    const eligibleToShow = (points >= 1 || frozenCount >= 1) && avgMet;
    const hasGift = hasCompleted10 && avgMet;

    const stepProgress = Math.min(GIFT_REQUIRED_QUIZZES, points);
    const quizzesRemaining = Math.max(0, GIFT_REQUIRED_QUIZZES - points);
    const avgRemaining = totalQuizzes > 0 ? Math.max(0, Number((GIFT_MIN_AVG_PERCENT - combinedAvg).toFixed(1))) : GIFT_MIN_AVG_PERCENT;
    const quizProgressPercent = Math.min(100, Math.round((stepProgress / GIFT_REQUIRED_QUIZZES) * 100));
    const avgBarPercent = Math.min(100, Math.max(0, combinedAvg));

    let tier = 'ready';
    if (hasGift) tier = 'unlocked';
    else if (points >= 7 || (hasCompleted10 && !avgMet)) tier = 'almost';
    else if (points >= 4) tier = 'leveling';
    else if (points >= 1) tier = 'started';

    return {
      points,
      frozenCount,
      behaviorCancelledCount,
      behaviorCancelledList,
      miniBufferCount,
      miniGoodPool,
      miniCancelledCount,
      goodCount,
      badCount,
      neutralCount,
      cancelledPoints,
      eligibleToShow,
      totalQuizzes,
      quizzesInTargetMonth,
      combinedAvg,
      hasCompleted10,
      avgMet,
      hasGift,
      stepProgress,
      quizzesRemaining,
      avgRemaining,
      quizProgressPercent,
      avgBarPercent,
      tier,
      trailPoints,
      earnedQuizzes: trailPoints.filter(p => !p.isFrozen)
    };
  }

  function buildQuestRemainingText(quest) {
    const isAr = (state.lang === 'ar');
    if (quest.points === 0) {
      if (quest.frozenCount > 0) {
        return isAr
          ? `❄️ لدى الطالب ${quest.frozenCount} نقطة موقفة — اضغط عليها لمعرفة السبب`
          : `❄️ ${quest.frozenCount} paused point(s) — click dot to view reason`;
      }
      if (quest.cancelledPoints > 0 || quest.behaviorCancelledCount > 0) {
        return isAr
          ? `⚠️ أُلغيت النقطة السابقة (علامة <50% أو سلوك) — حقق ≥70% لإضافة نقطة جديدة!`
          : `⚠️ Previous point was cancelled (<50% score or behavior) — get ≥70% to replace it!`;
      }
      return isAr
        ? '🎮 يتطلب علامة جيدة واحدة (≥70%) على الأقل للظهور'
        : '🎮 Needs at least 1 good quiz (≥70%) to qualify';
    }
    const notes = [];
    if (quest.cancelledPoints > 0) {
      notes.push(isAr ? `أُلغيت ${quest.cancelledPoints} (<50%)` : `${quest.cancelledPoints} cancelled (<50%)`);
    }
    if (quest.behaviorCancelledCount > 0) {
      notes.push(isAr ? `ملغاة سلوكياً ${quest.behaviorCancelledCount}` : `${quest.behaviorCancelledCount} behavior-cancelled`);
    }
    if (quest.frozenCount > 0) {
      notes.push(isAr ? `${quest.frozenCount} موقفة` : `${quest.frozenCount} paused`);
    }
    if (quest.miniBufferCount > 0) {
      notes.push(isAr ? `${quest.miniBufferCount}/5 صغار` : `${quest.miniBufferCount}/5 mini`);
    }
    const extraNote = notes.length > 0 ? ` • (${notes.join(' • ')})` : '';

    if (quest.hasGift) {
      return isAr
        ? `🎉 مبروك! وصل إلى ${quest.points}/10 بمعدل ${quest.combinedAvg}% — سيحصل على الجائزة!${extraNote}`
        : `🎉 ${quest.points}/10 points at ${quest.combinedAvg}% avg — Will Get Gift!${extraNote}`;
    }
    if (quest.hasCompleted10 && !quest.avgMet) {
      return isAr
        ? `🎯 أتم 10/10! متبقي +${quest.avgRemaining}% ليصل المعدل إلى 70%${extraNote}`
        : `🎯 10/10 points! Needs +${quest.avgRemaining}% avg to reach 70%${extraNote}`;
    }
    if (quest.avgMet) {
      return isAr
        ? `🔥 المعدل ${quest.combinedAvg}% — متبقي ${quest.quizzesRemaining} نقطة ليصل إلى 10!${extraNote}`
        : `🔥 Avg ${quest.combinedAvg}% ✅ — ${quest.quizzesRemaining} more point(s) to reach 10!${extraNote}`;
    }
    return isAr
      ? `⚡ متبقي ${quest.quizzesRemaining} نقطة • متبقي +${quest.avgRemaining}% ليصل إلى 70%${extraNote}`
      : `⚡ ${quest.quizzesRemaining} left • needs +${quest.avgRemaining}% to reach 70%${extraNote}`;
  }

  function renderQuestStepsHtml(quest, studentId = '') {
    const isUnlocked = quest.hasGift;
    const isAr = (state.lang === 'ar');
    const trail = Array.isArray(quest.trailPoints) ? quest.trailPoints : (Array.isArray(quest.earnedQuizzes) ? quest.earnedQuizzes : []);

    // Render all trail points (active + frozen) plus remaining open slots up to 10 active points
    const emptyNeeded = isUnlocked ? 0 : Math.max(0, GIFT_REQUIRED_QUIZZES - quest.points);
    const totalSlots = Math.max(GIFT_REQUIRED_QUIZZES, trail.length + emptyNeeded);

    let stepsHtml = '';
    let activeNum = 0;
    let emptyShown = 0;

    for (let idx = 0; idx < totalSlots; idx++) {
      const pt = trail[idx] || null;
      if (pt && pt.isFrozen) {
        const meta = pt.subject || getQuizSubjectMeta(pt.title);
        const reasonSafe = escapeHtml(pt.freezeReason || (isAr ? 'تجميد سلوكي' : 'Behavior pause'));
        const dotTitle = isAr
          ? `❄️ نقطة موقفة (${escapeHtml(pt.title)} • ${pt.pct}%) — السبب: ${reasonSafe} (اضغط للتفاصيل)`
          : `❄️ Paused Point (${escapeHtml(pt.title)} • ${pt.pct}%) — Reason: ${reasonSafe} (Click for details)`;
        stepsHtml += `
          <div class="quest-step-dot frozen subject-${meta.key}"
               data-student-id="${escapeHtml(studentId)}"
               data-point-index="${idx}"
               data-freeze-id="${escapeHtml(pt.freezeId || '')}"
               role="button"
               tabindex="0"
               title="${dotTitle}">
            <span class="dot-frozen-glyph">${AppIcons.snowflake}</span>
          </div>
        `;
      } else if (pt) {
        activeNum++;
        const meta = pt.subject || getQuizSubjectMeta(pt.title);
        const miniMark = pt.kind === 'mini_bundle' ? '<span class="dot-mini-x5">×5</span>' : '';
        const dotTitle = pt.kind === 'mini_bundle'
          ? `${isAr ? '5 اختبارات صغيرة' : '5 Mini-Quizzes'}: ${escapeHtml(pt.title)} (${pt.pct}%) • ${activeNum}/${GIFT_REQUIRED_QUIZZES}`
          : `${escapeHtml(pt.title)} (${pt.pct}%) • ${activeNum}/${GIFT_REQUIRED_QUIZZES}${state.isAdmin ? (isAr ? ' • اضغط للتجميد أو الإلغاء' : ' • Click to freeze/cancel') : ''}`;
        stepsHtml += `
          <div class="quest-step-dot earned subject-${meta.key} ${pt.kind === 'mini_bundle' ? 'is-mini-bundle' : ''} ${state.isAdmin ? 'is-admin-dot' : ''}"
               data-student-id="${escapeHtml(studentId)}"
               data-point-index="${idx}"
               title="${dotTitle}">
            ${meta.icon}${miniMark}
          </div>
        `;
      } else {
        emptyShown++;
        const slotNumber = quest.points + emptyShown;
        const isNext = !isUnlocked && emptyShown === 1;
        const cls = isNext ? 'next' : '';
        stepsHtml += `<div class="quest-step-dot ${cls}" title="${slotNumber}/${GIFT_REQUIRED_QUIZZES}">${slotNumber}</div>`;
      }
    }

    const barFillClass = isUnlocked ? 'unlocked' : (quest.avgMet ? 'avg-met' : '');

    // Compact status chips for frozen points, mini-quiz 5-count buffer, or behavior cancellations
    const statusChips = [];
    if (quest.frozenCount > 0) {
      statusChips.push(`<span class="quest-status-chip is-frozen">${AppIcons.snowflake} ${quest.frozenCount} ${isAr ? 'نقطة موقفة (اضغط عليها للسبب)' : 'Paused (click dot for reason)'}</span>`);
    }
    if (quest.miniBufferCount > 0) {
      let pips = '';
      for (let m = 1; m <= MINI_QUIZZES_PER_POINT; m++) {
        pips += `<span class="mini-pip ${m <= quest.miniBufferCount ? 'filled' : ''}"></span>`;
      }
      statusChips.push(`<span class="quest-status-chip is-mini" title="${isAr ? 'كل 5 اختبارات صغيرة (<10) = نقطة واحدة' : 'Every 5 mini-quizzes (<10) = 1 point'}">⚡ ${quest.miniBufferCount}/${MINI_QUIZZES_PER_POINT} ${isAr ? 'صغار' : 'mini'} <span class="mini-pips-wrap">${pips}</span></span>`);
    }
    if (quest.behaviorCancelledCount > 0) {
      statusChips.push(`<span class="quest-status-chip is-cancelled">🚫 ${quest.behaviorCancelledCount} ${isAr ? 'ملغاة سلوكياً' : 'behavior cancelled'}</span>`);
    }
    const chipsHtml = statusChips.length > 0 ? `<div class="quest-status-chips">${statusChips.join('')}</div>` : '';

    return `
      <div class="quest-steps-row">
        <div class="quest-steps-track" style="grid-template-columns: repeat(${totalSlots}, 1fr);">${stepsHtml}</div>
        <div class="quest-chest-node ${isUnlocked ? 'unlocked' : ''}" title="${isUnlocked ? t('giftQualified') : `${quest.points}/${GIFT_REQUIRED_QUIZZES}`}">
          ${AppIcons.gift}
        </div>
      </div>
      ${chipsHtml}
      <div class="quest-avg-row">
        <div class="quest-avg-header">
          <span>${isAr ? 'تقدم المسابقات:' : 'Quizzes Progress:'} <strong>${quest.points} / ${GIFT_REQUIRED_QUIZZES} (${quest.quizProgressPercent}%)</strong></span>
          <span class="quest-avg-pill ${quest.avgMet ? 'met' : 'below'}">${isAr ? 'المعدل' : 'Avg'}: ${quest.combinedAvg}%</span>
        </div>
        <div class="quest-bar-track" title="${quest.points} / ${GIFT_REQUIRED_QUIZZES} (${quest.quizProgressPercent}%)">
          <div class="quest-bar-fill ${barFillClass}" style="width: ${quest.quizProgressPercent}%;"></div>
        </div>
      </div>
    `;
  }

  function evaluateStudentTrajectory(student, monthKey) {
    const currentRec = student.records ? student.records[monthKey] : null;
    const prevMonthKey = getPreviousMonthKey(monthKey);
    const prevRec = (student.records && prevMonthKey) ? student.records[prevMonthKey] : null;
    const giftQuest = evaluateGiftQuest(student, monthKey);
    const prevScore = (prevRec && prevRec.overallScore !== undefined) ? Number(prevRec.overallScore) : null;
    const prevQuizPercent = (prevRec && prevRec.quizPercent !== undefined) ? Number(prevRec.quizPercent) : null;

    if (!currentRec) {
      return {
        status: 'unrecorded',
        label: t('notGraded'),
        delta: 0,
        hasRecord: false,
        qualifiesForGift: giftQuest.hasGift,
        giftQuest,
        prevMonthKey,
        prevRec,
        prevScore,
        prevQuizPercent,
        score: null,
        quizPercent: null,
        classRank: null
      };
    }

    const currentScore = Number(currentRec.overallScore) || 0;
    const quizPercent = Number(currentRec.quizPercent) || 0;
    const attendance = currentRec.attendance || 'Active';

    // Gift Qualification Rule: 10+ completed quizzes AND combined average >= 70%
    const qualifiesForGift = giftQuest.hasGift;

    let delta = 0;
    let status = 'forward';
    let label = t('movingForward');

    const isAr = (state.lang === 'ar');

    if (prevRec && prevRec.overallScore !== undefined) {
      delta = Number((currentScore - prevScore).toFixed(1));

      if (attendance === 'Absent' || currentScore < 35 || (attendance === 'Low' && currentScore < 50)) {
        status = 'stagnant';
        label = t('notWorking');
      } else if (delta > 0.5) {
        status = 'forward';
        label = isAr ? `تقدم مستمر (+${delta}%)` : `Moving Forward (+${delta}%)`;
      } else if (delta < -0.5) {
        status = 'backward';
        label = isAr ? `تراجع (${delta}%)` : `Going Back (${delta}%)`;
      } else {
        if (currentScore >= 75) {
          status = 'forward';
          label = isAr ? 'أداء عالٍ ومستقر' : 'Steady High';
        } else {
          status = 'stagnant';
          label = isAr ? 'ركود / جهد ضعيف' : 'Stagnant / Low Effort';
        }
      }
    } else {
      if (attendance === 'Absent' || currentScore < 35) {
        status = 'stagnant';
        label = t('notWorking');
      } else if (currentScore >= 60) {
        status = 'forward';
        label = isAr ? 'بداية قوية' : 'Strong Start';
      } else {
        status = 'stagnant';
        label = isAr ? 'يحتاج إلى تحسين' : 'Needs Work';
      }
    }

    return {
      status,
      label,
      delta,
      hasRecord: true,
      currentRec,
      prevMonthKey,
      prevRec,
      prevScore,
      prevQuizPercent,
      currentScore,
      quizPercent,
      qualifiesForGift,
      giftQuest,
      attendance
    };
  }

  // =========================================================================
  // MONTHLY HIGHLIGHTS & SUMMARY RENDERING
  // =========================================================================
  function isEligibleForTopStudent(student, trajectory, quest) {
    if (!student || !trajectory || !trajectory.hasRecord) return false;
    // Must have at least 1 active point (e.g., a single mini-quiz < 10 has 0 points until 5 = 1 pt)
    return Boolean(quest && quest.points >= 1);
  }

  /**
   * Select Student of the Month by net points (quiz count) first,
   * then monthly/effective grade average, then quiz percentage.
   */
  function selectTopStudent(students, monthKey) {
    let topCandidate = null;
    let topPoints = -1;
    let topScore = -1;
    let topQuizPct = -1;

    (students || []).forEach(student => {
      const trajectory = evaluateStudentTrajectory(student, monthKey);
      const quest = trajectory.giftQuest || evaluateGiftQuest(student, monthKey);
      if (!isEligibleForTopStudent(student, trajectory, quest)) return;

      const effectiveScore = (trajectory.currentScore !== undefined && trajectory.currentScore !== null)
        ? Number(trajectory.currentScore)
        : Number(trajectory.quizPercent || 0);
      const currPoints = Number(quest.points || 0);
      const currQuizPct = Number(trajectory.quizPercent || 0);

      const isBetter =
        currPoints > topPoints ||
        (currPoints === topPoints && effectiveScore > topScore) ||
        (currPoints === topPoints && effectiveScore === topScore && currQuizPct > topQuizPct);

      if (isBetter) {
        topPoints = currPoints;
        topScore = effectiveScore;
        topQuizPct = currQuizPct;
        topCandidate = { student, trajectory, quest };
      }
    });

    return topCandidate;
  }

  function renderHighlights() {
    const monthKey = state.selectedMonth;
    const isAr = (state.lang === 'ar');
    const topStudent = selectTopStudent(state.students, monthKey);
    let giftWinnersCount = 0;
    let questInProgressCount = 0;
    let questItems = [];
    let forwardCount = 0;
    let backwardCount = 0;
    let stagnantCount = 0;
    let totalScoreSum = 0;
    let recordedStudentCount = 0;

    state.students.forEach(student => {
      const trajectory = evaluateStudentTrajectory(student, monthKey);
      const quest = trajectory.giftQuest || evaluateGiftQuest(student, monthKey);

      if (quest.eligibleToShow) {
        if (quest.hasGift) giftWinnersCount++;
        else questInProgressCount++;
        questItems.push({ student, trajectory, quest });
      }

      if (!trajectory.hasRecord) return;

      recordedStudentCount++;
      totalScoreSum += trajectory.currentScore;

      // Momentum counts
      if (trajectory.status === 'forward') forwardCount++;
      else if (trajectory.status === 'backward') backwardCount++;
      else if (trajectory.status === 'stagnant') stagnantCount++;
    });

    // 1. Render Spotlight (Student of the Month)
    if (topStudent) {
      const s = topStudent.student;
      const traj = topStudent.trajectory;
      const winnerQuest = topStudent.quest;
      const initial = s.name.charAt(0).toUpperCase();
      const hasImg = Boolean(s.avatarUrl && s.avatarUrl.trim());

      const winnerStatsHtml = state.isAdmin
        ? `<span class="winner-stat-pill">${t('monthlyGrade')}: <span class="val">${traj.currentScore}%</span></span>
           <span class="winner-stat-pill">${t('quizScore')}: <span class="val">${traj.quizPercent}%</span></span>
           <span class="winner-stat-pill">${t('totalPointsLabel')}: <span class="val">${winnerQuest.points}</span></span>`
        : `<span class="winner-stat-pill"><svg class="svg-icon xs" viewBox="0 0 24 24"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg> ${t('topMonthlyPerformer')}</span>
           <span class="winner-stat-pill">${t('percentageLabel')}: <span class="val">${traj.quizPercent}%</span></span>
           <span class="winner-stat-pill">${t('totalPointsLabel')}: <span class="val">${winnerQuest.points}</span></span>`;

      elements.spotlightContent.innerHTML = `
        <div class="spotlight-winner">
          <div class="winner-avatar avatar-${s.avatarColor || 'indigo'} ${hasImg ? 'has-image' : ''}" title="${escapeHtml(s.name)}">
            ${hasImg ? `<img src="${escapeHtml(s.avatarUrl)}" alt="${escapeHtml(s.name)}" class="avatar-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />` : ''}
            <span class="avatar-fallback" ${hasImg ? 'style="display:none;"' : ''}>${initial}</span>
          </div>
          <div class="winner-info">
            <h3 class="winner-name">${escapeHtml(s.name)}</h3>
            <p class="winner-class">${escapeHtml(s.gradeLevel || 'Grade 10')} • ${escapeHtml(s.studentCode || 'STU')}</p>
            <div class="winner-stats">
              ${winnerStatsHtml}
            </div>
          </div>
        </div>
      `;
    } else {
      elements.spotlightContent.innerHTML = `
        <div class="spotlight-loading">${t('spotlightNoRecords')}</div>
      `;
    }

    // 2. Render Gamified Gift Quest Arena (10 Quizzes & Combined Avg >= 70%)
    if (elements.giftThresholdDisplay) {
      elements.giftThresholdDisplay.textContent = `${GIFT_REQUIRED_QUIZZES}`;
    }

    // Sort: unlocked first, then highest net points, then highest combined average
    questItems.sort((a, b) => {
      if (a.quest.hasGift !== b.quest.hasGift) return a.quest.hasGift ? -1 : 1;
      if (b.quest.points !== a.quest.points) {
        return b.quest.points - a.quest.points;
      }
      return b.quest.combinedAvg - a.quest.combinedAvg;
    });

    if (questItems.length > 0) {
      elements.giftQualifiedList.innerHTML = questItems.map(({ student, quest }) => {
        const initial = student.name.charAt(0).toUpperCase();
        const hasImg = Boolean(student.avatarUrl && student.avatarUrl.trim());

        let tierText = '';
        if (quest.hasGift) {
          tierText = isAr ? '🎁 سيحصل على جائزة!' : '🎁 Will Get Gift!';
        }

        return `
          <div class="gift-quest-item ${quest.hasGift ? 'is-unlocked' : ''}" data-student-id="${student.id}" role="button" tabindex="0" title="${escapeHtml(student.name)}">
            <div class="gift-quest-top">
              <div class="gift-item-left">
                <div class="gift-avatar-mini avatar-${student.avatarColor || 'indigo'} ${hasImg ? 'has-image' : ''}">
                  ${hasImg ? `<img src="${escapeHtml(student.avatarUrl)}" alt="${escapeHtml(student.name)}" class="avatar-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />` : ''}
                  <span class="avatar-fallback" ${hasImg ? 'style="display:none;"' : ''}>${initial}</span>
                </div>
                <span class="gift-student-name">${escapeHtml(student.name)}</span>
              </div>
              ${tierText ? `<span class="gift-quest-tier ${quest.tier}">${tierText}</span>` : ''}
            </div>

            ${renderQuestStepsHtml(quest, student.id)}
          </div>
        `;
      }).join('');
    } else {
      elements.giftQualifiedList.innerHTML = `
        <div class="empty-desc" style="padding: 14px 0;">${t('noGiftWinners')}</div>
      `;
    }

    // 3. Render Momentum Stats & Class Average
    elements.statForwardCount.textContent = forwardCount;
    elements.statBackwardCount.textContent = backwardCount;
    elements.statStagnantCount.textContent = stagnantCount;

    const classAvg = recordedStudentCount > 0 ? (totalScoreSum / recordedStudentCount).toFixed(1) : '0.0';
    elements.classAvgDisplay.textContent = `${classAvg}%`;
    elements.classAvgProgressBar.style.width = `${Math.min(100, Math.max(0, classAvg))}%`;

    // Filter pill count badges
    if (elements.countAll) elements.countAll.textContent = state.students.length;
    if (elements.countForward) elements.countForward.textContent = forwardCount;
    if (elements.countBackward) elements.countBackward.textContent = backwardCount;
    if (elements.countStagnant) elements.countStagnant.textContent = stagnantCount;
    if (elements.countGift) elements.countGift.textContent = giftWinnersCount;
    if (elements.countQuest) elements.countQuest.textContent = questInProgressCount;
  }

  // =========================================================================
  // STUDENT ROSTER RENDERING (Grid Cards & Detailed Table)
  // =========================================================================
  function renderStudents() {
    const monthKey = state.selectedMonth;
    const query = state.searchQuery.trim().toLowerCase();

    // Determine Top Student ID for spotlight styling (points first, then grade, then quiz %)
    const topCandidate = selectTopStudent(state.students, monthKey);
    const topStudentId = topCandidate ? topCandidate.student.id : null;

    // Filter students
    const filtered = state.students.filter(student => {
      const matchesSearch = !query ||
        student.name.toLowerCase().includes(query) ||
        (student.studentCode && student.studentCode.toLowerCase().includes(query)) ||
        (student.gradeLevel && student.gradeLevel.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      const traj = evaluateStudentTrajectory(student, monthKey);

      if (state.activeFilter === 'all') return true;
      if (state.activeFilter === 'forward') return traj.status === 'forward';
      if (state.activeFilter === 'backward') return traj.status === 'backward';
      if (state.activeFilter === 'stagnant') return traj.status === 'stagnant';
      if (state.activeFilter === 'gift') return traj.qualifiesForGift;
      if (state.activeFilter === 'quest') return traj.giftQuest && traj.giftQuest.eligibleToShow && !traj.qualifiesForGift;

      return true;
    });

    // Handle Empty State
    if (filtered.length === 0) {
      elements.studentsGridView.style.display = 'none';
      if (elements.studentsTableView) elements.studentsTableView.style.display = 'none';
      elements.emptyState.style.display = 'block';

      if (state.students.length === 0) {
        if (elements.emptyStateTitle) elements.emptyStateTitle.textContent = t('emptyRosterTitle');
        if (elements.emptyStateDesc) {
          elements.emptyStateDesc.textContent = state.isAdmin ? t('emptyRosterDesc') : t('emptyRosterLoginHint');
        }
        if (elements.btnResetFilters) elements.btnResetFilters.style.display = 'none';
        if (elements.btnEmptyAddStudent) {
          elements.btnEmptyAddStudent.style.display = state.isAdmin ? 'inline-flex' : 'none';
        }
      } else {
        if (elements.emptyStateTitle) elements.emptyStateTitle.textContent = t('noStudentsFound');
        if (elements.emptyStateDesc) elements.emptyStateDesc.textContent = t('noStudentsFoundDesc');
        if (elements.btnResetFilters) elements.btnResetFilters.style.display = 'inline-flex';
        if (elements.btnEmptyAddStudent) elements.btnEmptyAddStudent.style.display = 'none';
      }
      return;
    }

    elements.emptyState.style.display = 'none';

    // Table view is only accessible to Admin
    if (!state.isAdmin || state.viewMode === 'grid') {
      elements.studentsGridView.style.display = 'grid';
      if (elements.studentsTableView) elements.studentsTableView.style.display = 'none';
      renderGridView(filtered, topStudentId, monthKey);
    } else {
      // Table view is strictly admin-only
      elements.studentsGridView.style.display = 'none';
      if (state.isAdmin && elements.studentsTableView) {
        elements.studentsTableView.style.display = 'block';
        renderTableView(filtered, topStudentId, monthKey);
      }
    }
  }

  function renderGridView(students, topStudentId, monthKey) {
    elements.studentsGridView.innerHTML = students.map(student => {
      const traj = evaluateStudentTrajectory(student, monthKey);
      const isTop = (student.id === topStudentId && traj.hasRecord);

      const quizCount = (traj.hasRecord && traj.currentRec.quizzes && traj.currentRec.quizzes.length > 1)
        ? ` (${traj.currentRec.quizzes.length} ${t('testsCount')})`
        : '';
      const quizText = traj.hasRecord
        ? `${traj.currentRec.quizScore} / ${traj.currentRec.quizMax}${quizCount} (${traj.quizPercent}%)`
        : t('notGraded');

      const overallText = traj.hasRecord ? `${traj.currentScore}%` : '—';
      const prevMonthShort = getMonthLabel(traj.prevMonthKey).split(' ')[0];
      const currMonthShort = getMonthLabel(monthKey).split(' ')[0];
      const prevComparisonText = traj.prevScore !== null
        ? `${prevMonthShort}: ${traj.prevScore}%`
        : `${prevMonthShort}: —`;
      const quest = traj.giftQuest || evaluateGiftQuest(student, monthKey);
      const remarksText = (traj.hasRecord && traj.currentRec.remarks) ? traj.currentRec.remarks : (student.notes || (state.lang === 'ar' ? 'لا توجد ملاحظات مسجلة لهذا الشهر.' : 'No remarks recorded for this month.'));

      // Metric Row: Admin sees current + previous month grades & test counts; Visitor sees ONLY the combined percentage!
      let metricRowHtml = '';
      if (state.isAdmin) {
        metricRowHtml = `
          <div class="metric-row">
            <div class="metric-col">
              <span class="metric-label">${currMonthShort} (${t('monthlyGrade')})</span>
              <span class="metric-val score-primary">${overallText}</span>
              <span class="prev-month-badge">${prevComparisonText}</span>
              <span class="metric-sub">${traj.hasRecord ? `${t('effortLabel')}${traj.attendance}` : t('pendingEvaluation')}</span>
            </div>
            <div class="metric-col">
              <span class="metric-label">${t('quizScore')}</span>
              <span class="metric-val">${traj.hasRecord ? `${traj.quizPercent}%` : '—'}</span>
              <span class="metric-sub">${quizText}</span>
            </div>
          </div>
        `;
      } else {
        metricRowHtml = `
          <div class="metric-row">
            <div class="metric-col single-metric">
              <span class="metric-label">${t('percentageLabel')}</span>
              <span class="metric-val score-primary" style="font-size: 1.35rem;">${traj.hasRecord ? `${traj.quizPercent}%` : '—'}</span>
              <span class="metric-sub">${traj.hasRecord ? (traj.qualifiesForGift ? t('giftQualified') : `${quest.stepProgress}/${GIFT_REQUIRED_QUIZZES} ⭐`) : t('pendingEvaluation')}</span>
            </div>
          </div>
        `;
      }

      const trajectoryLabel = state.isAdmin
        ? traj.label
        : (traj.status === 'forward' ? t('movingForward') : (traj.status === 'backward' ? t('goingBack') : t('notWorking')));

      const giftBadgeHtml = traj.qualifiesForGift
        ? `<span class="gift-award-badge" title="${t('giftQualified')}">${AppIcons.gift} ${t('giftQualified')} (${quest.points}/${GIFT_REQUIRED_QUIZZES} • ${quest.combinedAvg}%)</span>`
        : `<span class="status-badge neutral" title="${buildQuestRemainingText(quest)}">${AppIcons.star} ${quest.stepProgress}/${GIFT_REQUIRED_QUIZZES}</span>`;

      const cardExtras = [];
      if (quest.frozenCount > 0) {
        cardExtras.push(state.lang === 'ar' ? `❄️ ${quest.frozenCount} موقفة` : `❄️ ${quest.frozenCount} paused`);
      }
      if (quest.miniBufferCount > 0) {
        cardExtras.push(state.lang === 'ar' ? `⚡ ${quest.miniBufferCount}/5 صغار` : `⚡ ${quest.miniBufferCount}/5 mini`);
      }
      const cardExtraText = cardExtras.length > 0 ? `<div class="card-quest-subchips">${cardExtras.join(' • ')}</div>` : '';

      const cardQuestBarHtml = quest.eligibleToShow ? `
        <div class="card-gift-game-box ${quest.hasGift ? 'is-unlocked' : ''}">
          <div class="quest-avg-header">
            <span>${state.lang === 'ar' ? 'نقاط الجائزة' : 'Gift Points'}: <strong>${quest.points}/${GIFT_REQUIRED_QUIZZES} (${quest.quizProgressPercent}%)</strong></span>
            <span class="quest-avg-pill ${quest.avgMet ? 'met' : 'below'}">${state.lang === 'ar' ? 'المعدل' : 'Avg'}: ${quest.combinedAvg}%</span>
          </div>
          <div class="quest-bar-track" title="${quest.points}/${GIFT_REQUIRED_QUIZZES} (${quest.quizProgressPercent}%)">
            <div class="quest-bar-fill ${quest.hasGift ? 'unlocked' : (quest.avgMet ? 'avg-met' : '')}" style="width: ${quest.quizProgressPercent}%;"></div>
          </div>
          ${cardExtraText}
        </div>
      ` : '';

      return `
        <div class="card student-card ${isTop ? 'is-top-student' : ''}" data-student-id="${student.id}">
          ${isTop ? `<div class="top-student-ribbon">${AppIcons.crown} ${t('topStudentRibbon')}</div>` : ''}

          <div class="student-header">
            ${renderAvatarHtml(student)}
            <div class="student-title-block">
              <h3 class="student-name" title="${escapeHtml(student.name)}">${escapeHtml(student.name)}</h3>
              <div class="student-meta">
                <span class="code-badge">${escapeHtml(student.studentCode || 'N/A')}</span>
                <span class="class-badge">${escapeHtml(student.gradeLevel || 'Standard')}</span>
              </div>
            </div>
          </div>

          ${metricRowHtml}

          <div class="badge-stack">
            <!-- Trajectory Badge -->
            <span class="status-badge ${traj.status}">
              ${AppIcons[traj.status] || ''} ${trajectoryLabel}
            </span>

            <!-- Gift Badge if qualifies -->
            ${giftBadgeHtml}
          </div>

          ${cardQuestBarHtml}

          <p class="student-remarks" title="${escapeHtml(remarksText)}">
            "${escapeHtml(remarksText)}"
          </p>

          <div class="student-card-actions">
            <button class="btn btn-xs btn-outline btn-view-profile" data-id="${student.id}">
              ${AppIcons.history} ${t('viewProfile')}
            </button>

            <!-- Admin-Only Actions -->
            <div class="admin-btn-group admin-only">
              <button class="btn btn-xs btn-outline btn-enter-grade" data-id="${student.id}" title="Enter or edit grades for this month">
                ${AppIcons.grade} ${t('gradeBtn')}
              </button>
              <button class="btn btn-xs btn-outline btn-behavior-student" data-id="${student.id}" title="${t('manageBehaviorBtn')}">
                ${AppIcons.snowflake}
              </button>
              <button class="btn btn-xs btn-outline btn-edit-student" data-id="${student.id}" title="Edit student info">
                ${AppIcons.edit}
              </button>
              <button class="btn btn-xs btn-danger btn-delete-student" data-id="${student.id}" title="Delete student">
                ${AppIcons.trash}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderTableView(students, topStudentId, monthKey) {
    const prevMonthShort = getMonthLabel(getPreviousMonthKey(monthKey)).split(' ')[0];
    elements.studentsTableBody.innerHTML = students.map(student => {
      const traj = evaluateStudentTrajectory(student, monthKey);
      const quest = traj.giftQuest || evaluateGiftQuest(student, monthKey);
      const isTop = (student.id === topStudentId && traj.hasRecord);

      return `
        <tr data-student-id="${student.id}">
          <td>
            <div class="table-student-cell">
              ${renderAvatarHtml(student, 'sm')}
              <div>
                <strong class="student-name">${escapeHtml(student.name)} ${isTop ? `<span style="color: #fbbf24; margin-left: 4px;">${AppIcons.crown}</span>` : ''}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(student.studentCode || '')}</div>
              </div>
            </div>
          </td>
          <td>${student.gradeLevel || '—'}</td>
          <td>${traj.hasRecord ? `${traj.currentRec.quizScore} / ${traj.currentRec.quizMax}` : '—'}</td>
          <td>
            <strong style="color: ${traj.hasRecord && isAvgEligiblePercent(traj.quizPercent) ? '#10b981' : '#f43f5e'};">
              ${traj.hasRecord ? `${traj.quizPercent}%` : '—'}
            </strong>
          </td>
          <td>
            ${traj.qualifiesForGift ? `
              <span class="gift-award-badge" style="font-size: 0.7rem; padding: 2px 8px;">${AppIcons.gift} ${t('yesGift')} (${quest.combinedAvg}%)</span>
            ` : `
              <span class="status-badge neutral" style="font-size: 0.7rem; padding: 2px 8px;">${AppIcons.star} ${quest.stepProgress}/${GIFT_REQUIRED_QUIZZES} (${quest.combinedAvg}%)</span>
            `}
          </td>
          <td>
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
              ${traj.prevScore !== null ? `${traj.prevScore}% (${prevMonthShort})` : '—'}
            </span>
          </td>
          <td>
            <span style="font-size: 1.05rem; font-weight: 700; color: #818cf8;">
              ${traj.hasRecord ? `${traj.currentScore}%` : '—'}
            </span>
          </td>
          <td>
            <span class="status-badge ${traj.status}" style="font-size: 0.72rem; padding: 2px 8px;">
              ${AppIcons[traj.status] || ''} ${traj.label}
            </span>
          </td>
          <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; color: var(--text-secondary);">
            ${(traj.hasRecord && traj.currentRec.remarks) ? escapeHtml(traj.currentRec.remarks) : (student.notes ? escapeHtml(student.notes) : '—')}
          </td>
          <td class="admin-col">
            <div class="admin-btn-group">
              <button class="btn btn-xs btn-outline btn-enter-grade" data-id="${student.id}" title="Enter or edit grades">
                ${AppIcons.grade}
              </button>
              <button class="btn btn-xs btn-outline btn-edit-student" data-id="${student.id}" title="Edit student">
                ${AppIcons.edit}
              </button>
              <button class="btn btn-xs btn-danger btn-delete-student" data-id="${student.id}" title="Delete student">
                ${AppIcons.trash}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // =========================================================================
  // ROLE MANAGEMENT & AUTHENTICATION (ADMIN CRUD vs CLEAN VISITOR VIEW)
  // =========================================================================
  function updateRoleUI() {
    if (state.isAdmin) {
      document.body.classList.add('is-admin');
      if (elements.roleSwitcherContainer) elements.roleSwitcherContainer.style.display = 'inline-flex';
      if (elements.roleStatusBadge) elements.roleStatusBadge.className = 'role-pill admin';
      if (elements.currentRoleLabel) elements.currentRoleLabel.textContent = t('adminMode');
      if (elements.adminBtnIcon) elements.adminBtnIcon.innerHTML = AppIcons.unlock;
      if (elements.adminBtnText) elements.adminBtnText.textContent = t('exitAdmin');
      if (elements.btnAddStudent) {
        elements.btnAddStudent.removeAttribute('disabled');
        elements.btnAddStudent.title = t('addStudent');
      }
      if (elements.btnViewTable) elements.btnViewTable.style.display = 'inline-flex';
    } else {
      document.body.classList.remove('is-admin');
      // For visitors: hide the entire role switcher & login button completely
      if (elements.roleSwitcherContainer) elements.roleSwitcherContainer.style.display = 'none';
      if (elements.btnViewTable) elements.btnViewTable.style.display = 'none';

      // Table view is only accessible to Admin; revert to Cards grid view if logged out
      if (state.viewMode === 'table') {
        state.viewMode = 'grid';
        if (elements.btnViewGrid) elements.btnViewGrid.classList.add('active');
        if (elements.btnViewTable) elements.btnViewTable.classList.remove('active');
      }
      closeSidebar();
    }

    renderHighlights();
    renderStudents();
  }

  function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const pin = elements.adminPinInput.value.trim();

    if (pin === ADMIN_PASSCODE) {
      state.isAdmin = true;
      // In-memory session: reload will always return to clean visitor view
      try {
        localStorage.removeItem(ROLE_STORAGE_KEY);
      } catch (_) {}

      closeModal(elements.modalAdminAuth);
      elements.adminPinInput.value = '';
      updateRoleUI();
      showToast('toastAdminSuccess', 'success');
    } else {
      showToast('toastInvalidPasscode', 'error');
      elements.adminPinInput.value = '';
      elements.adminPinInput.focus();
    }
  }

  function handleAdminLogout() {
    state.isAdmin = false;
    try {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    } catch (_) {}
    closeSidebar();
    updateRoleUI();
    showToast('toastAdminLogout', 'info');
  }

  // =========================================================================
  // ADMIN SIDEBAR TOGGLE
  // =========================================================================
  function openSidebar() {
    if (!state.isAdmin) return;
    if (elements.adminSidebar) {
      elements.adminSidebar.classList.add('open');
      elements.adminSidebar.setAttribute('aria-hidden', 'false');
    }
    if (elements.sidebarOverlay) elements.sidebarOverlay.classList.add('active');
    if (elements.btnSidebarToggle) elements.btnSidebarToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (elements.adminSidebar) {
      elements.adminSidebar.classList.remove('open');
      elements.adminSidebar.setAttribute('aria-hidden', 'true');
    }
    if (elements.sidebarOverlay) elements.sidebarOverlay.classList.remove('active');
    if (elements.btnSidebarToggle) elements.btnSidebarToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleSidebar() {
    if (elements.adminSidebar && elements.adminSidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function openAdminAuthModal() {
    if (elements.adminPinInput) {
      elements.adminPinInput.value = '';
    }
    openModal(elements.modalAdminAuth);
    setTimeout(() => {
      if (elements.adminPinInput) {
        elements.adminPinInput.value = '';
        elements.adminPinInput.focus();
      }
    }, 100);
  }

  // =========================================================================
  // MODAL CONTROLS
  // =========================================================================
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // =========================================================================
  // CRUD: STUDENT CREATION & EDITING (ADMIN ONLY)
  // =========================================================================
  function openCreateStudentModal() {
    if (!state.isAdmin) {
      showToast('toastAdminReqGrade', 'warning');
      openAdminAuthModal();
      return;
    }

    if (elements.crudModalTitleText) {
      elements.crudModalTitleText.textContent = t('addStudentTitle');
    }
    elements.studentEditId.value = '';
    elements.studentNameInput.value = '';
    elements.studentCodeInput.value = `STU-${100 + state.students.length + 1}`;
    elements.studentGradeLevel.value = 'Grade 10-A';
    elements.studentAvatarColor.value = 'indigo';
    if (elements.studentAvatarUrl) elements.studentAvatarUrl.value = '';
    if (elements.studentImageUrlInput) elements.studentImageUrlInput.value = '';
    if (elements.studentPhotoFileInput) elements.studentPhotoFileInput.value = '';
    elements.studentNotesInput.value = '';

    setCrudAvatarPreview('', 'indigo', '');

    openModal(elements.modalStudentCrud);
    setTimeout(() => elements.studentNameInput.focus(), 100);
  }

  function openEditStudentModal(studentId) {
    if (!state.isAdmin) {
      showToast('toastAdminReqGrade', 'warning');
      openAdminAuthModal();
      return;
    }

    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    if (elements.crudModalTitleText) {
      elements.crudModalTitleText.textContent = t('editStudentTitle');
    }
    elements.studentEditId.value = student.id;
    elements.studentNameInput.value = student.name || '';
    elements.studentCodeInput.value = student.studentCode || '';
    elements.studentGradeLevel.value = student.gradeLevel || '';
    elements.studentAvatarColor.value = student.avatarColor || 'indigo';
    if (elements.studentAvatarUrl) elements.studentAvatarUrl.value = student.avatarUrl || '';
    if (elements.studentImageUrlInput) {
      elements.studentImageUrlInput.value = (student.avatarUrl && !student.avatarUrl.startsWith('data:')) ? student.avatarUrl : '';
    }
    if (elements.studentPhotoFileInput) elements.studentPhotoFileInput.value = '';
    elements.studentNotesInput.value = student.notes || '';

    setCrudAvatarPreview(student.avatarUrl || '', student.avatarColor, student.name);

    openModal(elements.modalStudentCrud);
  }

  function handleStudentFormSubmit(e) {
    e.preventDefault();
    if (!state.isAdmin) {
      showToast('Admin privileges required', 'error');
      return;
    }

    const editId = elements.studentEditId.value;
    const name = elements.studentNameInput.value.trim();
    const code = elements.studentCodeInput.value.trim();
    const gradeLevel = elements.studentGradeLevel.value.trim();
    const color = elements.studentAvatarColor.value;
    const avatarUrl = elements.studentAvatarUrl ? elements.studentAvatarUrl.value.trim() : '';
    const notes = elements.studentNotesInput.value.trim();

    if (!name) {
      showToast('Student name is required', 'error');
      return;
    }

    if (editId) {
      const student = state.students.find(s => s.id === editId);
      if (student) {
        student.name = name;
        student.studentCode = code;
        student.gradeLevel = gradeLevel;
        student.avatarColor = color;
        student.avatarUrl = avatarUrl;
        student.notes = notes;
        syncStudentToApi(student);
        showToast('toastStudentUpdated', 'success');
      }
    } else {
      const newStudent = {
        id: `stu_${Date.now()}`,
        name,
        studentCode: code,
        gradeLevel,
        avatarColor: color,
        avatarUrl,
        notes,
        records: {}
      };
      state.students.unshift(newStudent);
      syncStudentToApi(newStudent);
      showToast('toastStudentAdded', 'success');
    }

    closeModal(elements.modalStudentCrud);
    renderHighlights();
    renderStudents();
  }

  // =========================================================================
  // CRUD: DELETE STUDENT (ADMIN ONLY)
  // =========================================================================
  function openDeleteConfirmModal(studentId) {
    if (!state.isAdmin) {
      showToast('toastAdminReqGrade', 'warning');
      openAdminAuthModal();
      return;
    }

    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    pendingDeleteStudentId = studentId;
    elements.deleteStudentName.textContent = `"${student.name}"`;
    if (elements.deleteConfirmPromptMsg) {
      elements.deleteConfirmPromptMsg.innerHTML = (state.lang === 'ar')
        ? `هل أنت متأكد من رغبتك في حذف الطالب <strong id="delete-student-name">"${escapeHtml(student.name)}"</strong> وجميع سجلاته الشهرية؟`
        : `Are you sure you want to delete <strong id="delete-student-name">"${escapeHtml(student.name)}"</strong> and all associated monthly records?`;
    }
    openModal(elements.modalDeleteConfirm);
  }

  function handleConfirmDelete() {
    if (!pendingDeleteStudentId || !state.isAdmin) return;

    const idx = state.students.findIndex(s => s.id === pendingDeleteStudentId);
    if (idx !== -1) {
      const removedName = state.students[idx].name;
      const idToDelete = pendingDeleteStudentId;
      state.students.splice(idx, 1);
      deleteStudentFromApi(idToDelete);
      showToast('toastStudentDeleted', 'info');
    }

    pendingDeleteStudentId = null;
    closeModal(elements.modalDeleteConfirm);
    renderHighlights();
    renderStudents();
  }

  // =========================================================================
  // CRUD: RECORD MONTHLY GRADES & MULTI-QUIZ EVALUATION (ADMIN ONLY)
  // =========================================================================
  function createQuizRowHtml(quiz = { title: 'Quiz 1', score: '', maxScore: 20 }) {
    const titleVal = escapeHtml(quiz.title || (state.lang === 'ar' ? 'اختبار' : 'Quiz'));
    const scoreVal = (quiz.score !== undefined && quiz.score !== null && quiz.score !== '' && !isNaN(quiz.score)) ? quiz.score : '';
    const maxVal = (quiz.maxScore !== undefined && quiz.maxScore !== null && !isNaN(quiz.maxScore)) ? quiz.maxScore : 20;

    let rowPct = '—';
    let pillClass = '';
    const isMini = isMiniQuizMax(maxVal);
    if (scoreVal !== '' && maxVal > 0) {
      const pctNum = Number(((Number(scoreVal) / Number(maxVal)) * 100).toFixed(1));
      const good = isAvgEligiblePercent(pctNum);
      const badCancel = isBadCancelPercent(pctNum);
      rowPct = `${pctNum}%${good ? (isMini ? ' ⅕' : ' ⭐') : (badCancel ? ' ✕' : '')}`;
      pillClass = good ? 'is-good' : (badCancel ? 'is-low' : 'is-mid');
    }

    const titlePlaceholder = (state.lang === 'ar') ? 'مثال: علوم، رياضيات، عربي، كيمياء...' : 'e.g. Science, Math, Arabic, Chemistry...';
    const subjMeta = getQuizSubjectMeta(quiz.title || '');
    const subjLabel = (state.lang === 'ar') ? subjMeta.labelAr : subjMeta.labelEn;
    const miniTitle = (state.lang === 'ar') ? 'اختبار صغير (<10): كل 5 = نقطة' : 'Mini quiz (<10): 5 = 1 point';

    return `
      <div class="quiz-item-row ${isMini ? 'is-mini-row' : ''}">
        <div class="quiz-col-input-name">
          <span class="quiz-subject-badge subject-${subjMeta.key}" title="${escapeHtml(subjLabel)}">${subjMeta.icon}</span>
          <input type="text" class="form-input form-input-sm quiz-name-input" list="quiz-subject-suggestions" placeholder="${titlePlaceholder}" value="${titleVal}" required>
          <span class="quiz-mini-tag" style="${isMini ? '' : 'display:none;'}" title="${miniTitle}">1/5</span>
        </div>
        <div class="quiz-col-input-score">
          <input type="number" class="form-input form-input-sm quiz-score-input" min="0" max="1000" step="0.5" placeholder="Score" value="${scoreVal}" required>
        </div>
        <span class="quiz-slash">/</span>
        <div class="quiz-col-input-max">
          <input type="number" class="form-input form-input-sm quiz-max-input" min="0.5" max="1000" step="0.5" placeholder="Max" value="${maxVal}" required>
        </div>
        <div class="quiz-col-input-pct">
          <span class="quiz-row-pct-pill ${pillClass}">${rowPct}</span>
        </div>
        <div class="quiz-col-action">
          <button type="button" class="btn-remove-quiz-row" title="Remove this test">&times;</button>
        </div>
      </div>
    `;
  }

  function updateGradeMonthComparison(student, targetMonthKey, currentPercent, hasEnteredScores) {
    if (!elements.gradeMonthComparisonBox) return;
    const isAr = (state.lang === 'ar');
    const existingTargetRec = (student && student.records) ? student.records[targetMonthKey] : null;
    const prevKey = getPreviousMonthKey(targetMonthKey);
    const prevRec = (student && student.records && prevKey) ? student.records[prevKey] : null;

    const targetLabel = getMonthLabel(targetMonthKey);
    const prevLabel = getMonthLabel(prevKey);

    const statusBadge = existingTargetRec
      ? `<span class="grade-comp-badge existing">${isAr ? `تعديل سجل ${targetLabel}` : `Editing ${targetLabel}`}</span>`
      : `<span class="grade-comp-badge fresh">${isAr ? `سجل جديد: ${targetLabel}` : `New: ${targetLabel}`}</span>`;

    let prevHtml = '';
    if (prevRec && prevRec.overallScore !== undefined) {
      const prevScore = Number(prevRec.overallScore) || 0;
      let deltaBadge = '';
      if (hasEnteredScores) {
        const diff = Number((currentPercent - prevScore).toFixed(1));
        const sign = diff > 0 ? '+' : '';
        const color = diff > 0 ? '#059669' : diff < 0 ? '#e11d48' : '#64748b';
        deltaBadge = ` <strong style="color:${color};">(${sign}${diff}%)</strong>`;
      }
      prevHtml = `<span>${isAr ? 'الشهر السابق' : 'Previous'} (${prevLabel}): <strong>${prevScore}%</strong>${deltaBadge}</span>`;
    } else {
      prevHtml = `<span>${isAr ? 'الشهر السابق' : 'Previous'} (${prevLabel}): <em>${isAr ? 'لا توجد درجات' : 'No record'}</em></span>`;
    }

    elements.gradeMonthComparisonBox.innerHTML = `
      <div class="grade-comp-item">${statusBadge}</div>
      <div class="grade-comp-item">${prevHtml}</div>
    `;
  }

  function recalculateCombinedQuizzes() {
    if (!elements.quizRowsList) return { totalScore: 0, totalMax: 0, combinedPercent: 0, quizzes: [], goodThisMonth: 0 };

    const rows = elements.quizRowsList.querySelectorAll('.quiz-item-row');
    const quizzes = [];
    const draftQuizzes = [];
    let totalScore = 0;
    let totalMax = 0;
    let goodThisMonth = 0;
    let enteredCount = 0;

    rows.forEach(row => {
      const nameInput = row.querySelector('.quiz-name-input');
      const scoreInput = row.querySelector('.quiz-score-input');
      const maxInput = row.querySelector('.quiz-max-input');
      const pctBadge = row.querySelector('.quiz-row-pct-pill');

      const title = nameInput ? nameInput.value.trim() : (state.lang === 'ar' ? 'اختبار' : 'Quiz');
      const subjBadge = row.querySelector('.quiz-subject-badge');
      if (subjBadge) {
        const subjMeta = getQuizSubjectMeta(title);
        subjBadge.className = `quiz-subject-badge subject-${subjMeta.key}`;
        subjBadge.title = (state.lang === 'ar') ? subjMeta.labelAr : subjMeta.labelEn;
        subjBadge.innerHTML = subjMeta.icon;
      }
      const scoreRaw = scoreInput ? scoreInput.value : '';
      const maxRaw = maxInput ? maxInput.value : '20';

      const scoreNum = parseFloat(scoreRaw);
      const maxNum = parseFloat(maxRaw);
      const isMini = isMiniQuizMax(maxNum);
      row.classList.toggle('is-mini-row', isMini);
      const miniTagEl = row.querySelector('.quiz-mini-tag');
      if (miniTagEl) miniTagEl.style.display = isMini ? '' : 'none';

      if (scoreRaw !== '' && !isNaN(scoreNum) && !isNaN(maxNum) && maxNum > 0) {
        const rowPct = Number(((scoreNum / maxNum) * 100).toFixed(1));
        const isGood = isAvgEligiblePercent(rowPct);
        const isBadCancel = isBadCancelPercent(rowPct);
        if (pctBadge) {
          pctBadge.textContent = `${rowPct}%${isGood ? (isMini ? ' ⅕' : ' ⭐') : (isBadCancel ? ' ✕' : '')}`;
          pctBadge.classList.toggle('is-good', isGood);
          pctBadge.classList.toggle('is-low', isBadCancel);
          pctBadge.classList.toggle('is-mid', !isGood && !isBadCancel);
        }
        totalScore += scoreNum;
        totalMax += maxNum;
        enteredCount++;
        if (isGood && !isMini) goodThisMonth++;
        const quizObj = { title: title || 'Quiz', score: scoreNum, maxScore: maxNum };
        quizzes.push(quizObj);
        draftQuizzes.push(quizObj);
      } else {
        if (pctBadge) {
          pctBadge.textContent = '—';
          pctBadge.classList.remove('is-good', 'is-low', 'is-mid');
        }
        const emptyObj = { title: title || 'Quiz', score: isNaN(scoreNum) ? 0 : scoreNum, maxScore: isNaN(maxNum) ? 20 : maxNum };
        quizzes.push(emptyObj);
        draftQuizzes.push({ ...emptyObj, isEmpty: true });
      }
    });

    const combinedPercent = totalMax > 0 ? Number(((totalScore / totalMax) * 100).toFixed(1)) : 0;

    if (elements.quizTotalPointsDisplay) {
      elements.quizTotalPointsDisplay.textContent = `${totalScore} / ${totalMax}`;
    }
    if (elements.quizCalcPreview) {
      elements.quizCalcPreview.textContent = `${combinedPercent}%`;
    }

    const studentId = elements.gradeStudentId ? elements.gradeStudentId.value : '';
    const targetMonthKey = elements.gradeMonthSelect ? elements.gradeMonthSelect.value : state.selectedMonth;
    const activeStudent = state.students.find(s => s.id === studentId);
    const liveQuest = activeStudent
      ? evaluateGiftQuest(activeStudent, null, { monthKey: targetMonthKey, quizzes: draftQuizzes })
      : { points: goodThisMonth, frozenCount: 0, behaviorCancelledCount: 0, miniBufferCount: 0, totalQuizzes: enteredCount, combinedAvg: combinedPercent, hasGift: goodThisMonth >= GIFT_REQUIRED_QUIZZES && isAvgEligiblePercent(combinedPercent), stepProgress: Math.min(10, goodThisMonth), quizzesRemaining: Math.max(0, 10 - goodThisMonth), avgRemaining: Math.max(0, Number((70 - combinedPercent).toFixed(1))), hasCompleted10: goodThisMonth >= 10, avgMet: isAvgEligiblePercent(combinedPercent), cancelledPoints: 0 };

    if (elements.quizGoodCountDisplay) {
      const miniSuffix = liveQuest.miniBufferCount > 0 ? ` (+${liveQuest.miniBufferCount}/${MINI_QUIZZES_PER_POINT})` : '';
      elements.quizGoodCountDisplay.textContent = `${liveQuest.points} / ${GIFT_REQUIRED_QUIZZES} ⭐${miniSuffix}`;
    }
    if (elements.btnSyncPctVal) {
      elements.btnSyncPctVal.textContent = `${combinedPercent}%`;
    }

    if (elements.quizGiftStatusText) {
      if (enteredCount > 0) {
        if (liveQuest.hasGift) {
          elements.quizGiftStatusText.innerHTML = `<span style="color: #10b981; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">${AppIcons.gift} ${t('qualifiedGiftMsg')} (${liveQuest.combinedAvg}%)</span>`;
        } else {
          elements.quizGiftStatusText.innerHTML = `<span style="color: #d97706; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">${AppIcons.star} ${buildQuestRemainingText(liveQuest)}</span>`;
        }
      } else {
        elements.quizGiftStatusText.textContent = t('enterScoresPrompt');
      }
    }

    updateGradeMonthComparison(activeStudent, targetMonthKey, combinedPercent, enteredCount > 0);

    // Auto-update Overall Score display and hidden input from quiz calculation
    const overallScoreDisplay = document.getElementById('overall-score-display');
    const overallScoreValue = document.getElementById('overall-score-value');
    if (elements.overallGradeInput) {
      elements.overallGradeInput.value = combinedPercent;
    }
    if (overallScoreValue) {
      if (totalMax > 0) {
        overallScoreValue.textContent = `${combinedPercent}%`;
        overallScoreValue.style.color = isAvgEligiblePercent(combinedPercent) ? 'var(--success, #10b981)' : combinedPercent >= 50 ? 'var(--warning, #f59e0b)' : 'var(--danger, #f43f5e)';
      } else {
        overallScoreValue.textContent = '—';
        overallScoreValue.style.color = '';
      }
    }
    if (overallScoreDisplay) {
      overallScoreDisplay.classList.toggle('has-value', totalMax > 0);
    }

    return { totalScore, totalMax, combinedPercent, quizzes, goodThisMonth };
  }

  function openGradeEntryModal(studentId) {
    if (!state.isAdmin) {
      showToast('toastAdminReqGrade', 'warning');
      openAdminAuthModal();
      return;
    }

    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    elements.gradeStudentId.value = student.id;
    elements.gradeModalStudentName.textContent = `${(state.lang === 'ar' ? 'الطالب' : 'Student')}: ${student.name} (${student.studentCode || 'STU'})`;

    populateMonthSelectors(student);
    elements.gradeMonthSelect.value = state.selectedMonth;

    loadExistingGradeIntoForm(student, state.selectedMonth);

    openModal(elements.modalGradeEntry);
    setTimeout(() => {
      const firstScoreInput = elements.quizRowsList ? elements.quizRowsList.querySelector('.quiz-score-input') : null;
      if (firstScoreInput) firstScoreInput.focus();
    }, 100);
  }

  function loadExistingGradeIntoForm(student, monthKey) {
    const rec = (student.records && student.records[monthKey]) ? student.records[monthKey] : null;

    let quizzes = [];
    if (rec && Array.isArray(rec.quizzes) && rec.quizzes.length > 0) {
      quizzes = rec.quizzes;
    } else if (rec && rec.quizScore !== undefined) {
      quizzes = [{ title: (state.lang === 'ar' ? 'اختبار 1' : 'Quiz 1'), score: rec.quizScore, maxScore: rec.quizMax || 20 }];
    } else {
      quizzes = [{ title: (state.lang === 'ar' ? 'اختبار 1' : 'Quiz 1'), score: '', maxScore: 20 }];
    }

    if (elements.quizRowsList) {
      elements.quizRowsList.innerHTML = quizzes.map(q => createQuizRowHtml(q)).join('');
    }

    if (rec) {
      elements.gradeAttendanceStatus.value = rec.attendance || 'Active';
      elements.overallGradeInput.value = rec.overallScore !== undefined ? rec.overallScore : '';
      elements.gradeCommentInput.value = rec.remarks || '';
    } else {
      elements.gradeAttendanceStatus.value = 'Active';
      elements.overallGradeInput.value = '0';
      elements.gradeCommentInput.value = '';
    }

    recalculateCombinedQuizzes();
  }

  function handleGradeFormSubmit(e) {
    e.preventDefault();
    if (!state.isAdmin) {
      showToast('Admin privileges required', 'error');
      return;
    }

    const studentId = elements.gradeStudentId.value;
    const monthKey = elements.gradeMonthSelect.value;
    const attendance = elements.gradeAttendanceStatus.value;
    const remarks = elements.gradeCommentInput.value.trim();

    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    const wasUnlocked = evaluateGiftQuest(student).hasGift;

    const { totalScore, totalMax, combinedPercent, quizzes } = recalculateCombinedQuizzes();

    // Overall score is always the combined quiz percentage (auto-calculated)
    const overallScore = combinedPercent;

    if (!student.records) student.records = {};

    student.records[monthKey] = {
      month: monthKey,
      quizzes: quizzes,
      quizScore: Number(totalScore.toFixed(1)),
      quizMax: Number(totalMax.toFixed(1)),
      quizPercent: combinedPercent,
      overallScore: Number(overallScore.toFixed(1)),
      attendance: attendance,
      remarks: remarks
    };

    const nowUnlocked = evaluateGiftQuest(student).hasGift;

    saveData();
    syncStudentToApi(student);
    closeModal(elements.modalGradeEntry);
    showToast('toastGradeSaved', 'success');

    // Switch active view to the graded month so the saved month & comparisons update immediately
    setSelectedMonth(monthKey);

    if (!wasUnlocked && nowUnlocked) {
      triggerCelebration();
    }
  }

  // =========================================================================
  // STUDENT DETAILED PROFILE & TRAJECTORY HISTORY MODAL
  // =========================================================================
  function openStudentDetailModal(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    elements.detailModalName.textContent = student.name;
    elements.detailModalId.textContent = student.studentCode || 'N/A';
    elements.detailModalGrade.textContent = student.gradeLevel || 'Standard';

    const initial = student.name.charAt(0).toUpperCase();
    const hasImg = Boolean(student.avatarUrl && student.avatarUrl.trim());
    elements.detailAvatar.className = `avatar-circle lg avatar-${student.avatarColor || 'indigo'} ${hasImg ? 'has-image' : ''}`;
    if (elements.detailAvatarImg) {
      if (hasImg) {
        elements.detailAvatarImg.src = student.avatarUrl;
        elements.detailAvatarImg.style.display = 'block';
        elements.detailAvatarImg.onerror = function() {
          this.style.display = 'none';
          if (elements.detailAvatarFallback) elements.detailAvatarFallback.style.display = 'flex';
          elements.detailAvatar.classList.remove('has-image');
        };
      } else {
        elements.detailAvatarImg.src = '';
        elements.detailAvatarImg.style.display = 'none';
      }
    }
    if (elements.detailAvatarFallback) {
      elements.detailAvatarFallback.textContent = initial;
      elements.detailAvatarFallback.style.display = hasImg ? 'none' : 'flex';
    }

    elements.btnDetailAddGrade.onclick = () => {
      closeModal(elements.modalStudentDetail);
      openGradeEntryModal(student.id);
    };

    if (elements.btnDetailBehavior) {
      elements.btnDetailBehavior.onclick = () => {
        openBehaviorActionModal(student.id);
      };
    }

    // Render 10-Step Gamified Gift Quest Board inside Student Profile
    const isAr = (state.lang === 'ar');
    const overallQuest = evaluateGiftQuest(student, state.selectedMonth);
    if (elements.detailGiftQuestBoard) {
      if (overallQuest.eligibleToShow) {
        const questTitle = isAr
          ? 'سباق الجائزة (10 نقاط ≥ 70%)'
          : 'Gift Quest Progress (10 Points ≥ 70%)';
        elements.detailGiftQuestBoard.style.display = 'block';
        elements.detailGiftQuestBoard.innerHTML = `
          <div class="detail-quest-header">
            <div class="detail-quest-title">${AppIcons.gift} <span>${questTitle}</span></div>
            <span class="gift-quest-tier ${overallQuest.tier}">${overallQuest.points} / ${GIFT_REQUIRED_QUIZZES} • ${overallQuest.combinedAvg}%</span>
          </div>
          ${renderQuestStepsHtml(overallQuest, student.id)}
        `;
      } else {
        elements.detailGiftQuestBoard.style.display = 'none';
      }
    }

    // Render month-by-month history (oldest to newest)
    const monthsToShow = [...AVAILABLE_MONTHS].reverse();
    let historyHtml = '';

    monthsToShow.forEach(m => {
      const rec = student.records ? student.records[m.key] : null;
      const isCurrent = (m.key === state.selectedMonth);
      const monthTitle = (state.lang === 'ar') ? m.labelAr.split(' ')[0] : m.labelEn.split(' ')[0];

      if (rec) {
        const quizzesArr = (Array.isArray(rec.quizzes) && rec.quizzes.length > 0)
          ? rec.quizzes
          : (rec.quizMax > 0 ? [{ title: 'Quiz', score: rec.quizScore, maxScore: rec.quizMax }] : []);
        const monthAvgEligible = isAvgEligiblePercent(rec.quizPercent);

        let statsRowsHtml = '';
        if (state.isAdmin) {
          let quizBreakdownHtml = '';
          if (rec.quizzes && rec.quizzes.length > 1) {
            quizBreakdownHtml = `
              <div class="quiz-breakdown-tags">
                ${rec.quizzes.map(q => {
                  const pct = q.maxScore > 0 ? (q.score / q.maxScore) * 100 : 0;
                  const starMark = isAvgEligiblePercent(pct) ? ' ⭐' : '';
                  const subjMeta = getQuizSubjectMeta(q.title);
                  return `<span class="quiz-breakdown-tag" title="${escapeHtml(q.title)}: ${q.score}/${q.maxScore}"><span class="quiz-tag-icon subject-${subjMeta.key}">${subjMeta.icon}</span>${escapeHtml(q.title)}: ${q.score}/${q.maxScore}${starMark}</span>`;
                }).join('')}
              </div>
            `;
          }
          statsRowsHtml = `
            <div class="history-stat-row">
              <span>${t('monthlyGrade')}:</span>
              <span class="val" style="color: #818cf8;">${rec.overallScore}%</span>
            </div>
            <div class="history-stat-row">
              <span>${t('thQuizResult')}:</span>
              <span class="val">${rec.quizScore}/${rec.quizMax} (${rec.quizPercent}%)</span>
            </div>
            ${quizBreakdownHtml}
          `;
        } else {
          // Visitor mode: show ONLY the percentage
          statsRowsHtml = `
            <div class="history-stat-row">
              <span>${t('percentageLabel')}:</span>
              <span class="val" style="color: var(--primary); font-size: 0.95rem;">${rec.quizPercent}%</span>
            </div>
          `;
        }

        historyHtml += `
          <div class="history-card ${isCurrent ? 'current' : ''}">
            <div class="history-month-title">
              <span>${monthTitle}</span>
              <span>${quizzesArr.length} ${t('testsCount')} ${monthAvgEligible ? '⭐' : ''}</span>
            </div>
            ${statsRowsHtml}
            <div class="history-stat-row">
              <span>${t('effortLabel')}</span>
              <span class="val">${rec.attendance}</span>
            </div>
          </div>
        `;
      } else {
        historyHtml += `
          <div class="history-card ${isCurrent ? 'current' : ''}" style="opacity: 0.6;">
            <div class="history-month-title">${monthTitle}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">${state.lang === 'ar' ? 'لا توجد بيانات مسجلة' : 'No recorded data'}</div>
          </div>
        `;
      }
    });

    elements.detailHistoryContainer.innerHTML = historyHtml;

    // Detailed insights
    const currentTraj = evaluateStudentTrajectory(student, state.selectedMonth);
    const trajSummaryLabel = state.isAdmin
      ? currentTraj.label
      : (currentTraj.status === 'forward' ? t('movingForward') : (currentTraj.status === 'backward' ? t('goingBack') : t('notWorking')));

    const activeMonthName = getMonthLabel(state.selectedMonth);

    let insightHtml = (state.lang === 'ar')
      ? `
        <p><strong>ملخص المسار لشهر ${activeMonthName}:</strong> ${trajSummaryLabel}</p>
        <p style="margin-top: 4px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
          نقاط الجائزة: <strong>${overallQuest.points} / ${GIFT_REQUIRED_QUIZZES}</strong> • المعدل النهائي: <strong>${overallQuest.combinedAvg}%</strong> <span style="color: #fbbf24;">${AppIcons.gift}</span>
        </p>
      `
      : `
        <p><strong>Trajectory Summary for ${activeMonthName}:</strong> ${trajSummaryLabel}</p>
        <p style="margin-top: 4px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
          Gift Points: <strong>${overallQuest.points} / ${GIFT_REQUIRED_QUIZZES}</strong> • Combined Avg: <strong>${overallQuest.combinedAvg}%</strong> <span style="color: #fbbf24;">${AppIcons.gift}</span>
        </p>
      `;

    if (student.notes) {
      insightHtml += `<p style="margin-top: 6px; font-style: italic; color: var(--text-muted);">${(state.lang === 'ar' ? 'ملاحظات المعلم' : 'Teacher Notes')}: "${student.notes}"</p>`;
    }

    elements.detailTrajectoryInsights.innerHTML = insightHtml;
    openModal(elements.modalStudentDetail);
  }

  // =========================================================================
  // BEHAVIOR POINT MODERATION (ADMIN: FREEZE / CANCEL) & FREEZE REASON VIEWER
  // =========================================================================
  function getPresetBehaviorReasons() {
    return (state.lang === 'ar')
      ? ['مشاغبة في الحصة', 'عدم احترام التعليمات', 'تأخر أو إهمال الواجب', 'حديث جانبي متكرر']
      : ['Classroom disruption', 'Rule violation', 'Negligence / late work', 'Repeated talking in class'];
  }

  function renderBehaviorExistingList(student) {
    if (!elements.behaviorExistingList) return;
    const isAr = (state.lang === 'ar');
    const actions = Array.isArray(student.behaviorActions) ? student.behaviorActions : [];
    if (actions.length === 0) {
      elements.behaviorExistingList.innerHTML = `<div class="behavior-empty-msg">${isAr ? 'لا توجد نقاط مجمدة أو ملغاة سلوكياً لهذا الطالب.' : 'No frozen or behavior-cancelled points for this student.'}</div>`;
      return;
    }
    elements.behaviorExistingList.innerHTML = actions.slice().reverse().map(act => {
      const isFreeze = act.action === 'freeze';
      const badgeText = isFreeze ? (isAr ? '❄️ مجمدة (موقفة)' : '❄️ Frozen') : (isAr ? '🚫 ملغاة نهائياً' : '🚫 Cancelled');
      const btnLabel = isFreeze ? t('unfreezeBtn') : t('removeActionBtn');
      const dateStr = act.createdAt ? new Date(act.createdAt).toLocaleDateString(isAr ? 'ar' : 'en') : '';
      const targetBadge = act.targetTitle ? `<span class="behavior-action-target">${escapeHtml(act.targetTitle)}</span>` : '';
      return `
        <div class="behavior-action-row ${isFreeze ? 'is-freeze' : 'is-cancel'}">
          <div class="behavior-action-info">
            <div class="behavior-action-top">
              <span class="behavior-action-badge ${isFreeze ? 'is-freeze' : 'is-cancel'}">${badgeText}</span>
              ${targetBadge}
              ${dateStr ? `<span class="behavior-action-date">${escapeHtml(dateStr)}</span>` : ''}
            </div>
            <div class="behavior-action-reason">${escapeHtml(act.reason || '')}</div>
          </div>
          <button type="button" class="btn btn-xs btn-outline btn-remove-behavior" data-student-id="${student.id}" data-action-id="${escapeHtml(act.id)}">
            ${btnLabel}
          </button>
        </div>
      `;
    }).join('');
  }

  function openBehaviorActionModal(studentId, targetPointIndex = null) {
    if (!state.isAdmin) {
      showToast('toastAdminReqGrade', 'warning');
      openAdminAuthModal();
      return;
    }
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    const isAr = (state.lang === 'ar');
    const quest = evaluateGiftQuest(student, state.selectedMonth);
    const trail = Array.isArray(quest.trailPoints) ? quest.trailPoints : [];

    // Resolve default selected active point index (either clicked dot, or latest active unfrozen point)
    let selectedIdx = (targetPointIndex !== null && targetPointIndex !== undefined && !isNaN(targetPointIndex))
      ? Number(targetPointIndex)
      : -1;
    if (selectedIdx < 0 || !trail[selectedIdx] || trail[selectedIdx].isFrozen) {
      selectedIdx = -1;
      for (let i = trail.length - 1; i >= 0; i--) {
        if (!trail[i].isFrozen) {
          selectedIdx = i;
          break;
        }
      }
    }

    elements.behaviorStudentId.value = student.id;
    elements.behaviorTargetIndex.value = selectedIdx >= 0 ? String(selectedIdx) : '';
    if (elements.behaviorTargetKey) {
      elements.behaviorTargetKey.value = (selectedIdx >= 0 && trail[selectedIdx]) ? (trail[selectedIdx].pointKey || '') : '';
    }
    elements.behaviorModalStudentName.textContent = `${isAr ? 'الطالب' : 'Student'}: ${student.name}`;
    elements.behaviorReasonInput.value = '';

    if (elements.behaviorPointsSummary) {
      elements.behaviorPointsSummary.innerHTML = `
        <span>${isAr ? 'النقاط الفعالة' : 'Active Points'}: <strong>${quest.points}/${GIFT_REQUIRED_QUIZZES}</strong></span>
        <span>❄️ ${isAr ? 'موقفة' : 'Frozen'}: <strong>${quest.frozenCount}</strong></span>
        <span>🚫 ${isAr ? 'ملغاة سلوكياً' : 'Cancelled'}: <strong>${quest.behaviorCancelledCount}</strong></span>
      `;
    }

    if (elements.behaviorPointPicker) {
      if (trail.length === 0) {
        elements.behaviorPointPicker.innerHTML = `<div class="behavior-empty-msg">${isAr ? 'لا توجد نقاط مكتسبة للاختيار منها بعد.' : 'No earned points available to select yet.'}</div>`;
      } else {
        elements.behaviorPointPicker.innerHTML = trail.map((pt, idx) => {
          const meta = pt.subject || getQuizSubjectMeta(pt.title);
          const shortTitle = pt.kind === 'mini_bundle'
            ? (isAr ? '5 صغار' : '5 Mini')
            : pt.title;
          if (pt.isFrozen) {
            return `
              <div class="behavior-point-chip is-frozen" title="${escapeHtml(pt.freezeReason || '')}">
                <span class="point-chip-num">#${idx + 1}</span>
                <span class="point-chip-icon">${AppIcons.snowflake}</span>
                <span class="point-chip-label">${escapeHtml(shortTitle)} (${pt.pct}%) • ${isAr ? 'مجمدة' : 'Frozen'}</span>
                ${pt.freezeId ? `<button type="button" class="point-chip-unfreeze btn-remove-behavior" data-student-id="${student.id}" data-action-id="${escapeHtml(pt.freezeId)}" title="${t('unfreezeBtn')}">${t('unfreezeBtn')}</button>` : ''}
              </div>
            `;
          }
          const isSelected = (idx === selectedIdx);
          return `
            <button type="button"
                    class="behavior-point-chip is-active ${isSelected ? 'selected' : ''}"
                    data-point-index="${idx}"
                    data-point-key="${escapeHtml(pt.pointKey || '')}">
              <span class="point-chip-num">#${idx + 1}</span>
              <span class="point-chip-icon subject-${meta.key}">${meta.icon}</span>
              <span class="point-chip-label">${escapeHtml(shortTitle)} (${pt.pct}%)</span>
            </button>
          `;
        }).join('');
      }
    }

    if (elements.behaviorQuickReasons) {
      elements.behaviorQuickReasons.innerHTML = getPresetBehaviorReasons().map(r =>
        `<button type="button" class="behavior-chip-btn" data-reason="${escapeHtml(r)}">${escapeHtml(r)}</button>`
      ).join('');
    }

    renderBehaviorExistingList(student);
    openModal(elements.modalBehaviorAction);
    setTimeout(() => {
      if (elements.behaviorReasonInput) elements.behaviorReasonInput.focus();
    }, 100);
  }

  function handleBehaviorFormSubmit(e) {
    e.preventDefault();
    if (!state.isAdmin) return;

    const studentId = elements.behaviorStudentId.value;
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    const actionEl = elements.behaviorActionForm.querySelector('input[name="behaviorActionType"]:checked');
    const actionType = actionEl ? actionEl.value : 'freeze';
    const reason = (elements.behaviorReasonInput.value || '').trim();
    if (!reason) return;

    const quest = evaluateGiftQuest(student, state.selectedMonth);
    if (quest.points <= 0) {
      showToast(state.lang === 'ar' ? 'لا توجد نقاط فعالة لتجميدها أو إلغائها.' : 'No active points available to freeze or cancel.', 'warning');
      return;
    }

    const trail = quest.trailPoints || [];
    const requestedKey = elements.behaviorTargetKey ? elements.behaviorTargetKey.value : '';
    let targetIndex = requestedKey
      ? trail.findIndex(p => p.pointKey === requestedKey && !p.isFrozen)
      : -1;
    if (targetIndex === -1 && elements.behaviorTargetIndex.value !== '') {
      const idxNum = Number(elements.behaviorTargetIndex.value);
      if (!isNaN(idxNum) && trail[idxNum] && !trail[idxNum].isFrozen) {
        targetIndex = idxNum;
      }
    }
    if (targetIndex === -1) {
      for (let i = trail.length - 1; i >= 0; i--) {
        if (!trail[i].isFrozen) {
          targetIndex = i;
          break;
        }
      }
    }

    const targetPt = (targetIndex >= 0 && trail[targetIndex]) ? trail[targetIndex] : null;
    if (!Array.isArray(student.behaviorActions)) student.behaviorActions = [];
    student.behaviorActions.push({
      id: `beh_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      action: actionType,
      reason,
      monthKey: state.selectedMonth,
      targetIndex: targetIndex >= 0 ? targetIndex : undefined,
      targetPointKey: targetPt ? targetPt.pointKey : undefined,
      targetTitle: targetPt ? `#${targetIndex + 1} ${targetPt.kind === 'mini_bundle' ? '5 Mini-Quizzes' : targetPt.title} (${targetPt.pct}%)` : undefined,
      createdAt: new Date().toISOString()
    });

    saveData();
    syncStudentToApi(student);
    renderHighlights();
    renderStudents();

    if (elements.modalStudentDetail && elements.modalStudentDetail.classList.contains('active')) {
      openStudentDetailModal(student.id);
    }

    closeModal(elements.modalBehaviorAction);
    showToast(actionType === 'freeze' ? 'toastPointFrozen' : 'toastPointCancelled', 'info');
  }

  function removeBehaviorAction(studentId, actionId) {
    if (!state.isAdmin) return;
    const student = state.students.find(s => s.id === studentId);
    if (!student || !Array.isArray(student.behaviorActions)) return;

    const idx = student.behaviorActions.findIndex(a => a.id === actionId);
    if (idx === -1) return;
    const removed = student.behaviorActions[idx];
    student.behaviorActions.splice(idx, 1);

    saveData();
    syncStudentToApi(student);
    renderHighlights();
    renderStudents();

    if (elements.modalBehaviorAction && elements.modalBehaviorAction.classList.contains('active')) {
      openBehaviorActionModal(student.id);
    }
    if (elements.modalStudentDetail && elements.modalStudentDetail.classList.contains('active')) {
      openStudentDetailModal(student.id);
    }
    showToast(removed.action === 'freeze' ? 'toastPointUnfrozen' : 'toastBehaviorRemoved', 'success');
  }

  function openFreezeReasonModal(studentId, pointIndex) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    const isAr = (state.lang === 'ar');
    const quest = evaluateGiftQuest(student, state.selectedMonth);
    const pt = quest.trailPoints[pointIndex];
    if (!pt || !pt.isFrozen) return;

    const meta = pt.subject || getQuizSubjectMeta(pt.title);
    const dateStr = pt.freezeDate ? new Date(pt.freezeDate).toLocaleDateString(isAr ? 'ar' : 'en') : '';

    if (elements.freezeReasonBody) {
      elements.freezeReasonBody.innerHTML = `
        <div class="freeze-reason-card">
          <div class="freeze-reason-quiz">
            <span class="quiz-subject-badge subject-${meta.key}">${meta.icon}</span>
            <div>
              <strong>${escapeHtml(student.name)}</strong>
              <div style="font-size:0.8rem; color: var(--text-muted);">${escapeHtml(pt.title)} (${pt.pct}%)</div>
            </div>
          </div>
          <div class="freeze-reason-box">
            <div class="freeze-reason-label">${isAr ? 'سبب تجميد / إيقاف النقطة:' : 'Reason Point Was Paused:'}</div>
            <div class="freeze-reason-text">${escapeHtml(pt.freezeReason || (isAr ? 'موقفة بسبب السلوك' : 'Paused due to behavior'))}</div>
            ${dateStr ? `<div class="freeze-reason-date">${isAr ? 'التاريخ:' : 'Date:'} ${escapeHtml(dateStr)}</div>` : ''}
          </div>
          <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:10px;">
            ${isAr ? 'هذه النقطة موجودة ولكنها مجمدة مؤقتاً ولا تُحتسب ضمن الـ 10 نقاط حتى يتم فك تجميدها.' : 'This point remains visible in the trail as paused and does not count toward the 10 points until unfrozen.'}
          </p>
        </div>
      `;
    }

    if (elements.freezeReasonActions) {
      let btnsHtml = `<button type="button" class="btn btn-outline" data-close="modal-freeze-reason">${t('closeBtn')}</button>`;
      if (state.isAdmin && pt.freezeId) {
        btnsHtml += `
          <button type="button" class="btn btn-primary" id="btn-quick-unfreeze" data-student-id="${student.id}" data-action-id="${escapeHtml(pt.freezeId)}">
            ${t('unfreezeBtn')}
          </button>
        `;
      }
      elements.freezeReasonActions.innerHTML = btnsHtml;
      const closeBtn = elements.freezeReasonActions.querySelector('[data-close="modal-freeze-reason"]');
      if (closeBtn) closeBtn.onclick = () => closeModal(elements.modalFreezeReason);
      const unfreezeBtn = document.getElementById('btn-quick-unfreeze');
      if (unfreezeBtn) {
        unfreezeBtn.onclick = () => {
          closeModal(elements.modalFreezeReason);
          removeBehaviorAction(student.id, pt.freezeId);
        };
      }
    }

    openModal(elements.modalFreezeReason);
  }

  function handleQuestBoardClick(e) {
    const frozenDot = e.target.closest('.quest-step-dot.frozen');
    if (frozenDot && frozenDot.dataset.studentId) {
      e.stopPropagation();
      openFreezeReasonModal(frozenDot.dataset.studentId, Number(frozenDot.dataset.pointIndex));
      return true;
    }

    const earnedDot = e.target.closest('.quest-step-dot.earned');
    if (earnedDot && state.isAdmin && earnedDot.dataset.studentId) {
      e.stopPropagation();
      openBehaviorActionModal(earnedDot.dataset.studentId, Number(earnedDot.dataset.pointIndex));
      return true;
    }
    return false;
  }

  // =========================================================================
  // CELEBRATION & CONFETTI ANIMATION
  // =========================================================================
  function triggerCelebration() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#6366f1', '#10b981', '#ffffff']
      });
    }
    showToast('toastCelebrating', 'success');
  }

  // =========================================================================
  // BACKUP, EXPORT & DEMO RESTORE
  // =========================================================================
  function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.students, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `edutrack_students_${state.selectedMonth}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('toastExportSuccess', 'success');
  }

  function clearAllData() {
    if (!state.isAdmin) {
      showToast('toastAdminReqGrade', 'error');
      openAdminAuthModal();
      return;
    }
    const confirmPrompt = t('confirmClearAll');
    if (confirm(confirmPrompt)) {
      state.students = [];
      saveData();
      fetch(`${API_BASE}/students/clear`, { method: 'POST' }).catch(() => {});
      renderHighlights();
      renderStudents();
      showToast('toastAllDataCleared', 'info');
    }
  }

  // Check URL triggers for direct admin authentication (cleans URL hash to prevent re-opening on reload)
  function checkAdminTriggerFromUrl() {
    if (window.location.hash === '#admin') {
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (_) {}
      openAdminAuthModal();
    }
  }

  // =========================================================================
  // EVENT LISTENERS & SETUP
  // =========================================================================
  function populateMonthSelectors(activeStudent = null) {
    syncAvailableMonths(state.students);
    const currCalKey = getCurrentCalendarMonthKey();
    const prevCalKey = getOffsetMonthKey(currCalKey, -1);

    const buildOptions = (studentForMarks = null) => AVAILABLE_MONTHS.map(m => {
      let label = (state.lang === 'ar') ? m.labelAr : m.labelEn;
      if (m.key === currCalKey) {
        label += (state.lang === 'ar') ? ' (الحالي)' : ' (Current)';
      } else if (m.key === prevCalKey) {
        label += (state.lang === 'ar') ? ' (السابق)' : ' (Previous)';
      }
      if (studentForMarks && studentForMarks.records && studentForMarks.records[m.key]) {
        label += ` ✓ (${studentForMarks.records[m.key].overallScore}%)`;
      }
      return `<option value="${m.key}" ${m.key === state.selectedMonth ? 'selected' : ''}>${label}</option>`;
    }).join('');

    const generalOptions = buildOptions(null);
    if (elements.monthSelect) elements.monthSelect.innerHTML = generalOptions;
    if (elements.toolbarMonthSelect) elements.toolbarMonthSelect.innerHTML = generalOptions;
    if (elements.gradeMonthSelect) {
      const prevSelectedGradeMonth = elements.gradeMonthSelect.value || state.selectedMonth;
      elements.gradeMonthSelect.innerHTML = buildOptions(activeStudent);
      elements.gradeMonthSelect.value = prevSelectedGradeMonth;
    }
  }

  function setupEventListeners() {
    // Month selector changes (Sidebar + Toolbar + Quick Current/Previous buttons)
    if (elements.monthSelect) {
      elements.monthSelect.addEventListener('change', (e) => {
        setSelectedMonth(e.target.value);
      });
    }
    if (elements.toolbarMonthSelect) {
      elements.toolbarMonthSelect.addEventListener('change', (e) => {
        setSelectedMonth(e.target.value);
      });
    }
    if (elements.btnFilterCurrMonth) {
      elements.btnFilterCurrMonth.addEventListener('click', () => {
        setSelectedMonth(getCurrentCalendarMonthKey());
      });
    }
    if (elements.btnFilterPrevMonth) {
      elements.btnFilterPrevMonth.addEventListener('click', () => {
        setSelectedMonth(getOffsetMonthKey(getCurrentCalendarMonthKey(), -1));
      });
    }

    // Clickable Gift Quest items & dots (frozen dot shows reason to everyone; earned dot lets admin freeze/cancel)
    if (elements.giftQualifiedList) {
      elements.giftQualifiedList.addEventListener('click', (e) => {
        if (handleQuestBoardClick(e)) return;
        const card = e.target.closest('.gift-quest-item');
        if (card && card.dataset.studentId) {
          openStudentDetailModal(card.dataset.studentId);
        }
      });
      elements.giftQualifiedList.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const frozenDot = e.target.closest('.quest-step-dot.frozen');
          if (frozenDot && frozenDot.dataset.studentId) {
            e.preventDefault();
            e.stopPropagation();
            openFreezeReasonModal(frozenDot.dataset.studentId, Number(frozenDot.dataset.pointIndex));
            return;
          }
          const card = e.target.closest('.gift-quest-item');
          if (card && card.dataset.studentId) {
            e.preventDefault();
            openStudentDetailModal(card.dataset.studentId);
          }
        }
      });
    }

    if (elements.detailGiftQuestBoard) {
      elements.detailGiftQuestBoard.addEventListener('click', (e) => {
        handleQuestBoardClick(e);
      });
    }

    if (elements.behaviorActionForm) {
      elements.behaviorActionForm.addEventListener('submit', handleBehaviorFormSubmit);
    }
    if (elements.behaviorPointPicker) {
      elements.behaviorPointPicker.addEventListener('click', (e) => {
        const unfreezeBtn = e.target.closest('.btn-remove-behavior');
        if (unfreezeBtn) {
          removeBehaviorAction(unfreezeBtn.dataset.studentId, unfreezeBtn.dataset.actionId);
          return;
        }
        const chip = e.target.closest('.behavior-point-chip.is-active');
        if (chip) {
          elements.behaviorPointPicker.querySelectorAll('.behavior-point-chip.is-active').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          if (elements.behaviorTargetIndex) elements.behaviorTargetIndex.value = chip.dataset.pointIndex || '';
          if (elements.behaviorTargetKey) elements.behaviorTargetKey.value = chip.dataset.pointKey || '';
        }
      });
    }
    if (elements.behaviorQuickReasons) {
      elements.behaviorQuickReasons.addEventListener('click', (e) => {
        const chip = e.target.closest('.behavior-chip-btn');
        if (chip && elements.behaviorReasonInput) {
          elements.behaviorReasonInput.value = chip.dataset.reason || '';
          elements.behaviorReasonInput.focus();
        }
      });
    }
    if (elements.behaviorExistingList) {
      elements.behaviorExistingList.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-remove-behavior');
        if (btn) {
          removeBehaviorAction(btn.dataset.studentId, btn.dataset.actionId);
        }
      });
    }

    elements.gradeMonthSelect.addEventListener('change', (e) => {
      const studentId = elements.gradeStudentId.value;
      const student = state.students.find(s => s.id === studentId);
      if (student) {
        loadExistingGradeIntoForm(student, e.target.value);
      }
    });

    // Language switcher button (AR / EN)
    if (elements.langToggleBtn) {
      elements.langToggleBtn.addEventListener('click', toggleLanguage);
    }

    // Discreet Admin Login triggers:
    // 1. Click on Brand logo
    if (elements.brandLogoTrigger) {
      elements.brandLogoTrigger.addEventListener('click', () => {
        if (!state.isAdmin) {
          openAdminAuthModal();
        }
      });
      elements.brandLogoTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!state.isAdmin) {
            e.preventDefault();
            openAdminAuthModal();
          }
        }
      });
    }

    // 2. Keyboard Shortcut: Ctrl + Shift + A or Alt + A
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key && e.key.toLowerCase() === 'a') ||
          (e.altKey && e.key && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        if (!state.isAdmin) {
          openAdminAuthModal();
        }
      } else if (e.key === 'Escape' && elements.adminSidebar && elements.adminSidebar.classList.contains('open')) {
        closeSidebar();
      }
    });

    // Admin Sidebar toggle controls
    if (elements.btnSidebarToggle) {
      elements.btnSidebarToggle.addEventListener('click', toggleSidebar);
    }
    if (elements.btnSidebarClose) {
      elements.btnSidebarClose.addEventListener('click', closeSidebar);
    }
    if (elements.sidebarOverlay) {
      elements.sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Listen to URL hash change (#admin)
    window.addEventListener('hashchange', checkAdminTriggerFromUrl);

    // Role switcher (when logged in as admin, clicking Exit Admin logs out)
    if (elements.btnToggleAdmin) {
      elements.btnToggleAdmin.addEventListener('click', () => {
        if (state.isAdmin) {
          handleAdminLogout();
        } else {
          openAdminAuthModal();
        }
      });
    }

    // Admin Auth Form
    elements.adminAuthForm.addEventListener('submit', handleAdminLoginSubmit);

    // Modal close triggers
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        closeModal(document.getElementById(modalId));
      });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop);
      });
    });

    // Student CRUD
    elements.btnAddStudent.addEventListener('click', () => {
      closeSidebar();
      openCreateStudentModal();
    });
    elements.studentCrudForm.addEventListener('submit', handleStudentFormSubmit);

    // Dynamic Multi-Quiz calculation & row management
    if (elements.btnAddQuizRow) {
      elements.btnAddQuizRow.addEventListener('click', () => {
        const nextIdx = (elements.quizRowsList ? elements.quizRowsList.querySelectorAll('.quiz-item-row').length : 0) + 1;
        const newTitle = (state.lang === 'ar') ? `اختبار ${nextIdx}` : `Quiz ${nextIdx}`;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createQuizRowHtml({ title: newTitle, score: '', maxScore: 20 });
        const newRow = tempDiv.firstElementChild;
        elements.quizRowsList.appendChild(newRow);
        const scoreInp = newRow.querySelector('.quiz-score-input');
        if (scoreInp) scoreInp.focus();
        recalculateCombinedQuizzes();
      });
    }

    if (elements.quizRowsList) {
      elements.quizRowsList.addEventListener('input', (e) => {
        if (e.target.matches('.quiz-score-input') || e.target.matches('.quiz-max-input') || e.target.matches('.quiz-name-input')) {
          recalculateCombinedQuizzes();
        }
      });

      elements.quizRowsList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.btn-remove-quiz-row');
        if (removeBtn) {
          const row = removeBtn.closest('.quiz-item-row');
          if (row) {
            const allRows = elements.quizRowsList.querySelectorAll('.quiz-item-row');
            if (allRows.length <= 1) {
              const nameInp = row.querySelector('.quiz-name-input');
              const scoreInp = row.querySelector('.quiz-score-input');
              const maxInp = row.querySelector('.quiz-max-input');
              if (nameInp) nameInp.value = (state.lang === 'ar') ? 'اختبار 1' : 'Quiz 1';
              if (scoreInp) scoreInp.value = '';
              if (maxInp) maxInp.value = '20';
            } else {
              row.remove();
            }
            recalculateCombinedQuizzes();
          }
        }
      });
    }
    // Photo / Avatar handling
    if (elements.btnTriggerFileUpload && elements.studentPhotoFileInput) {
      elements.btnTriggerFileUpload.addEventListener('click', () => {
        elements.studentPhotoFileInput.click();
      });

      elements.studentPhotoFileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          const file = files[0];
          compressImageFile(file, 360, 360, 0.85, (compressedUrl) => {
            if (elements.studentAvatarUrl) elements.studentAvatarUrl.value = compressedUrl;
            if (elements.studentImageUrlInput) elements.studentImageUrlInput.value = '';
            setCrudAvatarPreview(compressedUrl);
            showToast('toastPhotoUploaded', 'success');
          });
        }
      });
    }

    if (elements.btnRemovePhoto) {
      elements.btnRemovePhoto.addEventListener('click', () => {
        if (elements.studentAvatarUrl) elements.studentAvatarUrl.value = '';
        if (elements.studentImageUrlInput) elements.studentImageUrlInput.value = '';
        if (elements.studentPhotoFileInput) elements.studentPhotoFileInput.value = '';
        setCrudAvatarPreview('');
        showToast('toastPhotoRemoved', 'info');
      });
    }

    if (elements.studentImageUrlInput) {
      elements.studentImageUrlInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (elements.studentAvatarUrl) elements.studentAvatarUrl.value = url;
        setCrudAvatarPreview(url);
      });
    }

    if (elements.studentNameInput) {
      elements.studentNameInput.addEventListener('input', (e) => {
        const currentUrl = elements.studentAvatarUrl ? elements.studentAvatarUrl.value : '';
        const currentColor = elements.studentAvatarColor ? elements.studentAvatarColor.value : 'indigo';
        setCrudAvatarPreview(currentUrl, currentColor, e.target.value);
      });
    }

    if (elements.studentAvatarColor) {
      elements.studentAvatarColor.addEventListener('change', (e) => {
        const currentUrl = elements.studentAvatarUrl ? elements.studentAvatarUrl.value : '';
        setCrudAvatarPreview(currentUrl, e.target.value);
      });
    }

    // Drag & Drop Photo Upload
    if (elements.photoUploadSection) {
      ['dragenter', 'dragover'].forEach(eventName => {
        elements.photoUploadSection.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          elements.photoUploadSection.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        elements.photoUploadSection.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          elements.photoUploadSection.classList.remove('drag-over');
        });
      });

      elements.photoUploadSection.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt && dt.files;
        if (files && files.length > 0) {
          const file = files[0];
          compressImageFile(file, 360, 360, 0.85, (compressedUrl) => {
            if (elements.studentAvatarUrl) elements.studentAvatarUrl.value = compressedUrl;
            if (elements.studentImageUrlInput) elements.studentImageUrlInput.value = '';
            setCrudAvatarPreview(compressedUrl);
            showToast('toastPhotoUploaded', 'success');
          });
        }
      });
    }

    // Grade Entry form
    elements.gradeEntryForm.addEventListener('submit', handleGradeFormSubmit);

    // Delete confirmation
    elements.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

    // Celebration
    elements.btnCelebrate.addEventListener('click', triggerCelebration);

    // Search
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
      renderStudents();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      elements.clearSearchBtn.style.display = 'none';
      elements.searchInput.focus();
      renderStudents();
    });

    // Filters
    elements.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeFilter = pill.dataset.filter;
        renderStudents();
      });
    });

    elements.btnResetFilters.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      elements.clearSearchBtn.style.display = 'none';
      state.activeFilter = 'all';
      elements.filterPills.forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
      renderStudents();
    });

    // View toggle
    elements.btnViewGrid.addEventListener('click', () => {
      state.viewMode = 'grid';
      elements.btnViewGrid.classList.add('active');
      elements.btnViewTable.classList.remove('active');
      closeSidebar();
      renderStudents();
    });

    elements.btnViewTable.addEventListener('click', () => {
      if (!state.isAdmin) {
        showToast('toastTableAdminOnly', 'warning');
        openAdminAuthModal();
        return;
      }
      state.viewMode = 'table';
      elements.btnViewTable.classList.add('active');
      elements.btnViewGrid.classList.remove('active');
      closeSidebar();
      renderStudents();
    });

    // Export & Clear All
    if (elements.btnExportData) {
      elements.btnExportData.addEventListener('click', () => {
        closeSidebar();
        exportData();
      });
    }
    if (elements.btnClearAll) {
      elements.btnClearAll.addEventListener('click', () => {
        closeSidebar();
        clearAllData();
      });
    }
    if (elements.btnEmptyAddStudent) elements.btnEmptyAddStudent.addEventListener('click', openCreateStudentModal);

    // Delegated actions for student items (View profile, Grade, Edit, Delete)
    document.addEventListener('click', (e) => {
      const btnViewProfile = e.target.closest('.btn-view-profile');
      if (btnViewProfile) {
        openStudentDetailModal(btnViewProfile.dataset.id);
        return;
      }

      const btnGrade = e.target.closest('.btn-enter-grade');
      if (btnGrade) {
        openGradeEntryModal(btnGrade.dataset.id);
        return;
      }

      const btnBehavior = e.target.closest('.btn-behavior-student');
      if (btnBehavior) {
        openBehaviorActionModal(btnBehavior.dataset.id);
        return;
      }

      const btnEdit = e.target.closest('.btn-edit-student');
      if (btnEdit) {
        openEditStudentModal(btnEdit.dataset.id);
        return;
      }

      const btnDelete = e.target.closest('.btn-delete-student');
      if (btnDelete) {
        openDeleteConfirmModal(btnDelete.dataset.id);
        return;
      }
    });
  }

  // =========================================================================
  // BOOTSTRAP APPLICATION
  // =========================================================================
  function init() {
    // 1. Strictly enforce Light Mode only (User requirement: keep only the light mode)
    document.body.classList.add('light-theme');

    // 2. Always default to visitor mode on reload (never open admin on reload)
    state.isAdmin = false;
    try {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    } catch (_) {}
    document.body.classList.remove('is-admin');

    // 3. Synchronously load local/demo data FIRST so UI renders IMMEDIATELY with live data
    loadInitialLocalData();

    // 4. Initialize Language & Render UI immediately
    let savedLang = 'ar';
    try {
      savedLang = localStorage.getItem(LANG_STORAGE_KEY) || 'ar';
    } catch (_) {}
    applyLanguage(savedLang);

    // 5. Setup event handlers
    setupEventListeners();

    // 6. Connect to MongoDB Atlas API asynchronously in the background
    loadData();

    // 7. Check one-time URL trigger
    checkAdminTriggerFromUrl();
  }

  // Launch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
