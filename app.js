/**
 * EduTrack Pulse - Monthly Student Academic Performance & Rewards Tracker
 * Full client-side application logic with:
 * - Pure Light Mode Theme (Default & Permanent)
 * - Visitor View: Shows ONLY the combined test percentage (clean, non-cluttered)
 * - Admin Mode: Full access to raw grades, tests builder, student CRUD, table view
 * - Discreet Admin Access: Brand logo trigger, Ctrl+Shift+A shortcut, #admin URL trigger
 * - Multi-Quiz per month evaluation (Combined percentage depends on all tests)
 * - Quiz Gift qualification (Combined Quiz % >= 16%)
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
  const GIFT_QUIZ_THRESHOLD_PERCENT = 16.0; // Rule: above 16% on combined quiz gets gift

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
    forward: '<svg class="svg-icon xs" viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    backward: '<svg class="svg-icon xs" viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
    stagnant: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    history: '<svg class="svg-icon xs" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    grade: '<svg class="svg-icon xs" viewBox="0 0 24 24"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>',
    edit: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
    trash: '<svg class="svg-icon xs" viewBox="0 0 24 24"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>'
  };

  // Academic months supported (chronological, newest first)
  const AVAILABLE_MONTHS = [
    { key: '2026-11', labelEn: 'November 2026', labelAr: 'نوفمبر 2026' },
    { key: '2026-10', labelEn: 'October 2026', labelAr: 'أكتوبر 2026' },
    { key: '2026-09', labelEn: 'September 2026', labelAr: 'سبتمبر 2026' },
    { key: '2026-08', labelEn: 'August 2026', labelAr: 'أغسطس 2026' }
  ];

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
      langToggleText: 'العربية',
      studentOfTheMonth: 'Student of the Month',
      spotlightHint: 'Based on top monthly score & quiz consistency',
      spotlightEvaluating: 'Evaluating monthly rankings...',
      spotlightNoRecords: 'No graded records available for this month yet.',
      topMonthlyPerformer: 'Top Monthly Performer',
      celebrate: 'Celebrate',
      giftClubTitle: 'Gift Award Club',
      giftClubDesc: 'Students with Quiz Score',
      qualifiedCount: '{n} Qualified',
      giftRewardNote: "Qualified students receive special monthly awards & recognition gifts!",
      noGiftWinners: "No students scored ≥ {threshold}% on this month's quiz.",
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
      filterGift: 'Gift Qualified',
      viewCards: 'Cards',
      viewTable: 'Table',
      addStudent: 'Add Student',
      thStudent: 'Student',
      thGradeLevel: 'Class/Grade',
      thQuizResult: 'Quiz Result',
      thQuizPct: 'Quiz %',
      thGiftStatus: 'Gift Status',
      thMonthlyScore: 'Monthly Score',
      thTrajectory: 'Trajectory',
      thRemarks: 'Remarks',
      thActions: 'Actions',
      noStudentsFound: 'No Students Found',
      noStudentsFoundDesc: 'No students match your current search or filter criteria for this month.',
      resetFilters: 'Reset Filters',
      rulesTitle: 'System Rules & Performance Criteria',
      giftAwardBadge: 'Gift Award',
      giftRuleDesc: 'Granted when a student achieves ≥ 16% (or higher) on their monthly quiz test.',
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
      giftQualified: 'Gift Qualified',
      noGift: 'No Gift',
      viewProfile: 'Profile',
      gradeBtn: 'Grade',
      editBtn: 'Edit',
      deleteBtn: 'Delete',
      authModalTitle: 'Admin Authentication',
      authInstruction: 'Only verified administrators can Add, Edit, Delete students or enter monthly quiz marks.',
      enterPasscode: 'Enter Admin Passcode:',
      pinPlaceholder: 'Enter PIN (Default: admin123)',
      passcodeHint: 'Tip: Default passcode is admin123',
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
      giftQualificationLabel: 'Gift Qualification (≥16%)',
      enterScoresPrompt: 'Enter test scores',
      qualifiedGiftMsg: 'Qualified for Gift Reward! (≥16%)',
      notQualifiedGiftMsg: 'Not Qualified (<16%)',
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
      yesGift: 'Yes (≥16%)',
      noGiftBadge: 'No',
      testsCount: 'tests',
      toastAdminSuccess: 'Logged in as Admin successfully!',
      toastAdminLogout: 'Exited Admin mode successfully.',
      toastInvalidPasscode: 'Invalid passcode! Try "admin123".',
      toastStudentAdded: 'Student added successfully!',
      toastStudentUpdated: 'Student details updated!',
      toastStudentDeleted: 'Student deleted successfully!',
      toastGradeSaved: 'Monthly grade and quiz records saved successfully!',
      toastPhotoUploaded: 'Photo uploaded and compressed successfully!',
      toastPhotoRemoved: 'Photo removed.',
      toastCelebrating: 'Celebrating Student of the Month & Gift Winners!',
      toastExportSuccess: 'Student grade records exported successfully!',
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
      langToggleText: 'English',
      studentOfTheMonth: 'طالب الشهر المتميز',
      spotlightHint: 'بناءً على أعلى درجة شهرية والمواظبة في الاختبارات',
      spotlightEvaluating: 'جارٍ تقييم تصنيفات الطلاب لهذا الشهر...',
      spotlightNoRecords: 'لا توجد سجلات درجات مرصودة لهذا الشهر بعد.',
      topMonthlyPerformer: 'الطالب المتصدر شهرياً',
      celebrate: 'احتفال',
      giftClubTitle: 'نادي جوائز التميز',
      giftClubDesc: 'الطلاب الحاصلون على درجة اختبار',
      qualifiedCount: '{n} فائز مؤهل',
      giftRewardNote: 'يحصل الطلاب المؤهلون على شهادات وجوائز تقديرية شهرية خاصة!',
      noGiftWinners: 'لم يحصل أي طالب على نسبة ≥ {threshold}% في اختبارات هذا الشهر.',
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
      filterGift: 'مؤهل للجائزة',
      viewCards: 'بطاقات',
      viewTable: 'جدول',
      addStudent: 'إضافة طالب',
      thStudent: 'الطالب',
      thGradeLevel: 'الصف / المرحلة',
      thQuizResult: 'نتيجة الاختبار',
      thQuizPct: 'نسبة الاختبار %',
      thGiftStatus: 'حالة الجائزة',
      thMonthlyScore: 'الدرجة الشهرية',
      thTrajectory: 'مسار التقدم',
      thRemarks: 'ملاحظات',
      thActions: 'إجراءات',
      noStudentsFound: 'لم يتم العثور على أي طالب',
      noStudentsFoundDesc: 'لا يوجد طلاب يطابقون معايير البحث أو التصفية الحالية لهذا الشهر.',
      resetFilters: 'إعادة تعيين الفلاتر',
      rulesTitle: 'قواعد النظام ومعايير الأداء الأكاديمي',
      giftAwardBadge: 'جائزة التميز',
      giftRuleDesc: 'تُمنح للطالب الذي يحقق 16% أو أكثر في اختباراته الشهرية.',
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
      giftQualified: 'مؤهل للجائزة',
      noGift: 'غير مؤهل',
      viewProfile: 'الملف الشخصي',
      gradeBtn: 'رصد الدرجات',
      editBtn: 'تعديل',
      deleteBtn: 'حذف',
      authModalTitle: 'تسجيل دخول المسؤول',
      authInstruction: 'يُسمح للمسؤولين المعتمدين فقط بإضافة أو تعديل أو حذف الطلاب أو رصد درجات الاختبارات.',
      enterPasscode: 'أدخل رمز مرور المسؤول:',
      pinPlaceholder: 'أدخل الرمز (الافتراضي: admin123)',
      passcodeHint: 'تلميح: الرمز الافتراضي هو admin123',
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
      giftQualificationLabel: 'أهلية الجائزة (≥16%)',
      enterScoresPrompt: 'أدخل درجات الاختبار',
      qualifiedGiftMsg: 'مؤهل لجائزة التميز! (≥16%)',
      notQualifiedGiftMsg: 'غير مؤهل للجائزة (<16%)',
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
      yesGift: 'نعم (≥16%)',
      noGiftBadge: 'لا',
      testsCount: 'اختبارات',
      toastAdminSuccess: 'تم تسجيل الدخول كمسؤول بنجاح!',
      toastAdminLogout: 'تم الخروج من وضع المسؤول بنجاح.',
      toastInvalidPasscode: 'رمز المرور غير صحيح! الرمز الافتراضي هو "admin123".',
      toastStudentAdded: 'تمت إضافة الطالب بنجاح!',
      toastStudentUpdated: 'تم تحديث بيانات الطالب بنجاح!',
      toastStudentDeleted: 'تم حذف الطالب بنجاح!',
      toastGradeSaved: 'تم حفظ الدرجات الشهرية والاختبارات بنجاح!',
      toastPhotoUploaded: 'تم رفع الصورة وضغطها بنجاح!',
      toastPhotoRemoved: 'تمت إزالة الصورة.',
      toastCelebrating: 'نحتفل بطالب الشهر والفائزين بجوائز التميز!',
      toastExportSuccess: 'تم تصدير سجلات درجات الطلاب بنجاح!',
      toastTableAdminOnly: 'عرض الجدول متاح للمسؤول فقط.',
      toastAdminReqGrade: 'يتطلب هذا الإجراء صلاحيات المسؤول'
    }
  };

  // Application State
  let state = {
    isAdmin: false,
    selectedMonth: '2026-10', // Default active month
    activeFilter: 'all',      // 'all' | 'forward' | 'backward' | 'stagnant' | 'gift'
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
    monthControlGroup: document.getElementById('month-control-group'),
    monthSelect: document.getElementById('month-select'),
    roleSwitcherContainer: document.getElementById('role-switcher-container'),
    roleStatusBadge: document.getElementById('role-status-badge'),
    currentRoleLabel: document.getElementById('current-role-label'),
    btnToggleAdmin: document.getElementById('btn-toggle-admin'),
    adminBtnIcon: document.getElementById('admin-btn-icon'),
    adminBtnText: document.getElementById('admin-btn-text'),
    langToggleBtn: document.getElementById('lang-toggle-btn'),
    langBtnText: document.getElementById('lang-btn-text'),

    // Highlights
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

    // Toolbar
    searchInput: document.getElementById('student-search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    filterPills: document.querySelectorAll('.filter-pill'),
    countAll: document.getElementById('count-all'),
    countForward: document.getElementById('count-forward'),
    countBackward: document.getElementById('count-backward'),
    countStagnant: document.getElementById('count-stagnant'),
    countGift: document.getElementById('count-gift'),
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
    gradeAttendanceStatus: document.getElementById('grade-attendance-status'),
    quizRowsList: document.getElementById('quiz-rows-list'),
    btnAddQuizRow: document.getElementById('btn-add-quiz-row'),
    quizTotalPointsDisplay: document.getElementById('quiz-total-points-display'),
    quizCalcPreview: document.getElementById('quiz-calc-preview'),
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
    detailHistoryContainer: document.getElementById('detail-history-container'),
    detailTrajectoryInsights: document.getElementById('detail-trajectory-insights'),
    btnDetailAddGrade: document.getElementById('btn-detail-add-grade'),

    modalDeleteConfirm: document.getElementById('modal-delete-confirm'),
    deleteStudentName: document.getElementById('delete-student-name'),
    deleteConfirmPromptMsg: document.getElementById('delete-confirm-prompt-msg'),
    btnConfirmDelete: document.getElementById('btn-confirm-delete'),

    // Utilities & Empty State
    btnExportData: document.getElementById('btn-export-data'),
    btnClearAll: document.getElementById('btn-clear-all'),
    emptyStateTitle: document.getElementById('empty-state-title'),
    emptyStateDesc: document.getElementById('empty-state-desc'),
    btnResetFilters: document.getElementById('btn-reset-filters'),
    btnEmptyAddStudent: document.getElementById('btn-empty-add-student'),
    toastContainer: document.getElementById('toast-container')
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
    elements.dbStatusBadge.className = `db-pill ${status}`;
    elements.dbStatusText.textContent = textKey ? t(textKey) : (defaultText || status);
  }

  async function checkDbHealth() {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const json = await res.json();
        if (json.dbConnected) {
          updateDbStatus('connected', 'cloudDbConnected', 'MongoDB Atlas Connected');
          // If we were offline or haven't loaded students from cloud yet, load them
          if (elements.dbStatusBadge && !elements.dbStatusBadge.classList.contains('connected')) {
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
    // If selectedMonth already has records, keep it
    const currentHasRecords = state.students && state.students.some(s => s.records && s.records[state.selectedMonth]);
    if (currentHasRecords) return state.selectedMonth;

    // Otherwise find the first available month that has records
    for (const m of AVAILABLE_MONTHS) {
      if (state.students && state.students.some(s => s.records && s.records[m.key])) {
        return m.key;
      }
    }
    return AVAILABLE_MONTHS[0].key;
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
  // CALCULATION & TRAJECTORY ENGINE
  // =========================================================================
  function getPreviousMonthKey(currentMonthKey) {
    const idx = AVAILABLE_MONTHS.findIndex(m => m.key === currentMonthKey);
    if (idx !== -1 && idx < AVAILABLE_MONTHS.length - 1) {
      return AVAILABLE_MONTHS[idx + 1].key;
    }
    return null;
  }

  function evaluateStudentTrajectory(student, monthKey) {
    const currentRec = student.records ? student.records[monthKey] : null;
    const prevMonthKey = getPreviousMonthKey(monthKey);
    const prevRec = (student.records && prevMonthKey) ? student.records[prevMonthKey] : null;

    if (!currentRec) {
      return {
        status: 'unrecorded',
        label: t('notGraded'),
        delta: 0,
        hasRecord: false,
        qualifiesForGift: false,
        score: null,
        quizPercent: null,
        classRank: null
      };
    }

    const currentScore = Number(currentRec.overallScore) || 0;
    const quizPercent = Number(currentRec.quizPercent) || 0;
    const attendance = currentRec.attendance || 'Active';

    // Gift Qualification Rule: Combined quiz percentage must be >= 16%
    const qualifiesForGift = quizPercent >= GIFT_QUIZ_THRESHOLD_PERCENT;

    let delta = 0;
    let status = 'forward';
    let label = t('movingForward');

    const isAr = (state.lang === 'ar');

    if (prevRec && prevRec.overallScore !== undefined) {
      const prevScore = Number(prevRec.overallScore) || 0;
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
      prevRec,
      currentScore,
      quizPercent,
      qualifiesForGift,
      attendance
    };
  }

  // =========================================================================
  // MONTHLY HIGHLIGHTS & SUMMARY RENDERING
  // =========================================================================
  function renderHighlights() {
    const monthKey = state.selectedMonth;
    let topStudent = null;
    let topScore = -1;
    let giftWinners = [];
    let forwardCount = 0;
    let backwardCount = 0;
    let stagnantCount = 0;
    let totalScoreSum = 0;
    let recordedStudentCount = 0;

    state.students.forEach(student => {
      const trajectory = evaluateStudentTrajectory(student, monthKey);
      if (!trajectory.hasRecord) return;

      recordedStudentCount++;
      totalScoreSum += trajectory.currentScore;

      // Student of the Month strictly depends on highest grades / combined percentage
      const effectiveScore = (trajectory.currentScore !== undefined && trajectory.currentScore !== null)
        ? Number(trajectory.currentScore)
        : Number(trajectory.quizPercent || 0);

      if (effectiveScore > topScore) {
        topScore = effectiveScore;
        topStudent = { student, trajectory };
      } else if (effectiveScore === topScore && topStudent) {
        // Tie-breaker: higher quiz percentage or total score
        if (Number(trajectory.quizPercent || 0) > Number(topStudent.trajectory.quizPercent || 0)) {
          topStudent = { student, trajectory };
        }
      }

      // Gift Qualification (>= 16%)
      if (trajectory.qualifiesForGift) {
        giftWinners.push({ student, trajectory });
      }

      // Momentum counts
      if (trajectory.status === 'forward') forwardCount++;
      else if (trajectory.status === 'backward') backwardCount++;
      else if (trajectory.status === 'stagnant') stagnantCount++;
    });

    // 1. Render Spotlight (Student of the Month)
    if (topStudent) {
      const s = topStudent.student;
      const traj = topStudent.trajectory;
      const initial = s.name.charAt(0).toUpperCase();
      const hasImg = Boolean(s.avatarUrl && s.avatarUrl.trim());

      const winnerStatsHtml = state.isAdmin
        ? `<span class="winner-stat-pill">${t('monthlyGrade')}: <span class="val">${traj.currentScore}%</span></span>
           <span class="winner-stat-pill">${t('quizScore')}: <span class="val">${traj.quizPercent}%</span></span>`
        : `<span class="winner-stat-pill"><svg class="svg-icon xs" viewBox="0 0 24 24"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg> ${t('topMonthlyPerformer')}</span>
           <span class="winner-stat-pill">${t('percentageLabel')}: <span class="val">${traj.quizPercent}%</span></span>`;

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

    // 2. Render Gift Winners List
    elements.giftThresholdDisplay.textContent = `${GIFT_QUIZ_THRESHOLD_PERCENT}%`;
    elements.giftCountBadge.textContent = t('qualifiedCount', { n: giftWinners.length });

    if (giftWinners.length > 0) {
      elements.giftQualifiedList.innerHTML = giftWinners.map(item => {
        const initial = item.student.name.charAt(0).toUpperCase();
        const hasImg = Boolean(item.student.avatarUrl && item.student.avatarUrl.trim());
        const giftScoreBadgeHtml = `<span class="gift-score-badge">${item.trajectory.quizPercent}%</span>`;

        return `
          <div class="gift-item">
            <div class="gift-item-left">
              <div class="gift-avatar-mini avatar-${item.student.avatarColor || 'indigo'} ${hasImg ? 'has-image' : ''}" title="${escapeHtml(item.student.name)}">
                ${hasImg ? `<img src="${escapeHtml(item.student.avatarUrl)}" alt="${escapeHtml(item.student.name)}" class="avatar-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" />` : ''}
                <span class="avatar-fallback" ${hasImg ? 'style="display:none;"' : ''}>${initial}</span>
              </div>
              <span class="gift-student-name">${escapeHtml(item.student.name)}</span>
            </div>
            <div class="gift-item-right">
              ${giftScoreBadgeHtml}
              <span class="gift-box-icon" title="${t('giftQualified')} (&ge; 16%)">${AppIcons.gift}</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      elements.giftQualifiedList.innerHTML = `
        <div class="empty-desc" style="padding: 10px 0;">${t('noGiftWinners', { threshold: GIFT_QUIZ_THRESHOLD_PERCENT })}</div>
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
    elements.countAll.textContent = state.students.length;
    elements.countForward.textContent = forwardCount;
    elements.countBackward.textContent = backwardCount;
    elements.countStagnant.textContent = stagnantCount;
    elements.countGift.textContent = giftWinners.length;
  }

  // =========================================================================
  // STUDENT ROSTER RENDERING (Grid Cards & Detailed Table)
  // =========================================================================
  function renderStudents() {
    const monthKey = state.selectedMonth;
    const query = state.searchQuery.trim().toLowerCase();

    // Determine Top Student ID for spotlight styling
    let topStudentId = null;
    let highestScore = -1;
    state.students.forEach(s => {
      const rec = s.records ? s.records[monthKey] : null;
      if (rec && rec.overallScore > highestScore) {
        highestScore = rec.overallScore;
        topStudentId = s.id;
      }
    });

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
      const isTop = (student.id === topStudentId && traj.hasRecord && traj.currentScore > 0);

      const quizCount = (traj.hasRecord && traj.currentRec.quizzes && traj.currentRec.quizzes.length > 1)
        ? ` (${traj.currentRec.quizzes.length} ${t('testsCount')})`
        : '';
      const quizText = traj.hasRecord
        ? `${traj.currentRec.quizScore} / ${traj.currentRec.quizMax}${quizCount} (${traj.quizPercent}%)`
        : t('notGraded');

      const overallText = traj.hasRecord ? `${traj.currentScore}%` : '—';
      const remarksText = (traj.hasRecord && traj.currentRec.remarks) ? traj.currentRec.remarks : (student.notes || (state.lang === 'ar' ? 'لا توجد ملاحظات مسجلة لهذا الشهر.' : 'No remarks recorded for this month.'));

      // Metric Row: Admin sees full grades & test counts; Visitor sees ONLY the combined percentage!
      let metricRowHtml = '';
      if (state.isAdmin) {
        metricRowHtml = `
          <div class="metric-row">
            <div class="metric-col">
              <span class="metric-label">${t('monthlyGrade')}</span>
              <span class="metric-val score-primary">${overallText}</span>
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
              <span class="metric-sub">${traj.hasRecord ? (traj.qualifiesForGift ? t('giftQualified') : t('pendingEvaluation')) : t('pendingEvaluation')}</span>
            </div>
          </div>
        `;
      }

      const trajectoryLabel = state.isAdmin
        ? traj.label
        : (traj.status === 'forward' ? t('movingForward') : (traj.status === 'backward' ? t('goingBack') : t('notWorking')));

      const giftBadgeHtml = traj.qualifiesForGift
        ? `<span class="gift-award-badge" title="Quiz &ge; 16%: Earns a recognition gift!">${AppIcons.gift} ${t('giftQualified')}</span>`
        : (state.isAdmin
            ? `<span class="status-badge neutral" title="Quiz score below ${GIFT_QUIZ_THRESHOLD_PERCENT}% required for gift">${t('noGift')} (${traj.hasRecord ? `${traj.quizPercent}%` : '—'})</span>`
            : `<span class="status-badge neutral" title="Quiz score below ${GIFT_QUIZ_THRESHOLD_PERCENT}% required for gift">${t('noGift')}</span>`);

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
    elements.studentsTableBody.innerHTML = students.map(student => {
      const traj = evaluateStudentTrajectory(student, monthKey);
      const isTop = (student.id === topStudentId && traj.hasRecord && traj.currentScore > 0);

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
            <strong style="color: ${traj.quizPercent >= GIFT_QUIZ_THRESHOLD_PERCENT ? '#10b981' : '#f43f5e'};">
              ${traj.hasRecord ? `${traj.quizPercent}%` : '—'}
            </strong>
          </td>
          <td>
            ${traj.qualifiesForGift ? `
              <span class="gift-award-badge" style="font-size: 0.7rem; padding: 2px 8px;">${AppIcons.gift} ${t('yesGift')}</span>
            ` : `
              <span class="status-badge neutral" style="font-size: 0.7rem; padding: 2px 8px;">${t('noGiftBadge')}</span>
            `}
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
    updateRoleUI();
    showToast('toastAdminLogout', 'info');
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
      openModal(elements.modalAdminAuth);
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
      openModal(elements.modalAdminAuth);
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
      openModal(elements.modalAdminAuth);
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
    const scoreVal = (quiz.score !== undefined && quiz.score !== null && !isNaN(quiz.score)) ? quiz.score : '';
    const maxVal = (quiz.maxScore !== undefined && quiz.maxScore !== null && !isNaN(quiz.maxScore)) ? quiz.maxScore : 20;

    let rowPct = '0.0%';
    if (scoreVal !== '' && maxVal > 0) {
      rowPct = `${((Number(scoreVal) / Number(maxVal)) * 100).toFixed(1)}%`;
    }

    const titlePlaceholder = (state.lang === 'ar') ? 'مثال: اختبار 1 أو واجب' : 'e.g. Quiz 1 or Test';

    return `
      <div class="quiz-item-row">
        <div class="quiz-col-input-name">
          <input type="text" class="form-input form-input-sm quiz-name-input" placeholder="${titlePlaceholder}" value="${titleVal}" required>
        </div>
        <div class="quiz-col-input-score">
          <input type="number" class="form-input form-input-sm quiz-score-input" min="0" max="1000" step="0.5" placeholder="Score" value="${scoreVal}" required>
        </div>
        <span class="quiz-slash">/</span>
        <div class="quiz-col-input-max">
          <input type="number" class="form-input form-input-sm quiz-max-input" min="0.5" max="1000" step="0.5" placeholder="Max" value="${maxVal}" required>
        </div>
        <div class="quiz-col-input-pct">
          <span class="quiz-row-pct-pill">${rowPct}</span>
        </div>
        <div class="quiz-col-action">
          <button type="button" class="btn-remove-quiz-row" title="Remove this test">&times;</button>
        </div>
      </div>
    `;
  }

  function recalculateCombinedQuizzes() {
    if (!elements.quizRowsList) return { totalScore: 0, totalMax: 0, combinedPercent: 0, quizzes: [] };

    const rows = elements.quizRowsList.querySelectorAll('.quiz-item-row');
    const quizzes = [];
    let totalScore = 0;
    let totalMax = 0;

    rows.forEach(row => {
      const nameInput = row.querySelector('.quiz-name-input');
      const scoreInput = row.querySelector('.quiz-score-input');
      const maxInput = row.querySelector('.quiz-max-input');
      const pctBadge = row.querySelector('.quiz-row-pct-pill');

      const title = nameInput ? nameInput.value.trim() : (state.lang === 'ar' ? 'اختبار' : 'Quiz');
      const scoreRaw = scoreInput ? scoreInput.value : '';
      const maxRaw = maxInput ? maxInput.value : '20';

      const scoreNum = parseFloat(scoreRaw);
      const maxNum = parseFloat(maxRaw);

      if (!isNaN(scoreNum) && !isNaN(maxNum) && maxNum > 0) {
        const rowPct = Number(((scoreNum / maxNum) * 100).toFixed(1));
        if (pctBadge) pctBadge.textContent = `${rowPct}%`;
        totalScore += scoreNum;
        totalMax += maxNum;
        quizzes.push({ title: title || 'Quiz', score: scoreNum, maxScore: maxNum });
      } else {
        if (pctBadge) pctBadge.textContent = '—';
        quizzes.push({ title: title || 'Quiz', score: isNaN(scoreNum) ? 0 : scoreNum, maxScore: isNaN(maxNum) ? 20 : maxNum });
      }
    });

    const combinedPercent = totalMax > 0 ? Number(((totalScore / totalMax) * 100).toFixed(1)) : 0;

    if (elements.quizTotalPointsDisplay) {
      elements.quizTotalPointsDisplay.textContent = `${totalScore} / ${totalMax}`;
    }
    if (elements.quizCalcPreview) {
      elements.quizCalcPreview.textContent = `${combinedPercent}%`;
    }
    if (elements.btnSyncPctVal) {
      elements.btnSyncPctVal.textContent = `${combinedPercent}%`;
    }

    if (elements.quizGiftStatusText) {
      if (totalMax > 0) {
        if (combinedPercent >= GIFT_QUIZ_THRESHOLD_PERCENT) {
          elements.quizGiftStatusText.innerHTML = `<span style="color: #10b981; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">${AppIcons.gift} ${t('qualifiedGiftMsg')} (${combinedPercent}% &ge; ${GIFT_QUIZ_THRESHOLD_PERCENT}%)</span>`;
        } else {
          elements.quizGiftStatusText.innerHTML = `<span style="color: #f43f5e; display: inline-flex; align-items: center; gap: 4px;">${AppIcons.x} ${t('notQualifiedGiftMsg')} (${combinedPercent}% < ${GIFT_QUIZ_THRESHOLD_PERCENT}%)</span>`;
        }
      } else {
        elements.quizGiftStatusText.textContent = t('enterScoresPrompt');
      }
    }

    // Auto-update Overall Score display and hidden input from quiz calculation
    const overallScoreDisplay = document.getElementById('overall-score-display');
    const overallScoreValue = document.getElementById('overall-score-value');
    if (elements.overallGradeInput) {
      elements.overallGradeInput.value = combinedPercent;
    }
    if (overallScoreValue) {
      if (totalMax > 0) {
        overallScoreValue.textContent = `${combinedPercent}%`;
        overallScoreValue.style.color = combinedPercent >= 75 ? 'var(--success, #10b981)' : combinedPercent >= 50 ? 'var(--warning, #f59e0b)' : 'var(--danger, #f43f5e)';
      } else {
        overallScoreValue.textContent = '—';
        overallScoreValue.style.color = '';
      }
    }
    if (overallScoreDisplay) {
      overallScoreDisplay.classList.toggle('has-value', totalMax > 0);
    }

    return { totalScore, totalMax, combinedPercent, quizzes };
  }

  function openGradeEntryModal(studentId) {
    if (!state.isAdmin) {
      showToast('toastAdminReqGrade', 'warning');
      openModal(elements.modalAdminAuth);
      return;
    }

    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    elements.gradeStudentId.value = student.id;
    elements.gradeModalStudentName.textContent = `${(state.lang === 'ar' ? 'الطالب' : 'Student')}: ${student.name} (${student.studentCode || 'STU'})`;
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

    const { totalScore, totalMax, combinedPercent, quizzes } = recalculateCombinedQuizzes();

    // Overall score is always the combined quiz percentage (auto-calculated)
    const overallScore = combinedPercent;

    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

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

    // Make the month that was just graded active so highlights update in real-time
    state.selectedMonth = monthKey;
    if (elements.monthSelect) elements.monthSelect.value = monthKey;

    saveData();
    syncStudentToApi(student);
    closeModal(elements.modalGradeEntry);
    showToast('toastGradeSaved', 'success');
    renderHighlights();
    renderStudents();
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

    // Render month-by-month history (oldest to newest)
    const monthsToShow = [...AVAILABLE_MONTHS].reverse();
    let historyHtml = '';
    let giftsCount = 0;

    monthsToShow.forEach(m => {
      const rec = student.records ? student.records[m.key] : null;
      const isCurrent = (m.key === state.selectedMonth);
      const monthTitle = (state.lang === 'ar') ? m.labelAr.split(' ')[0] : m.labelEn.split(' ')[0];

      if (rec) {
        const qualifies = rec.quizPercent >= GIFT_QUIZ_THRESHOLD_PERCENT;
        if (qualifies) giftsCount++;

        let statsRowsHtml = '';
        if (state.isAdmin) {
          let quizBreakdownHtml = '';
          if (rec.quizzes && rec.quizzes.length > 1) {
            quizBreakdownHtml = `
              <div class="quiz-breakdown-tags">
                ${rec.quizzes.map(q => `<span class="quiz-breakdown-tag" title="${escapeHtml(q.title)}: ${q.score}/${q.maxScore}">${escapeHtml(q.title)}: ${q.score}/${q.maxScore}</span>`).join('')}
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
              ${qualifies ? `<span>${AppIcons.gift} ${t('giftAwardBadge')}</span>` : ''}
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
          إجمالي جوائز التميز المحرزة: <strong>${giftsCount}</strong> <span style="color: #fbbf24;">${AppIcons.gift}</span>
        </p>
      `
      : `
        <p><strong>Trajectory Summary for ${activeMonthName}:</strong> ${trajSummaryLabel}</p>
        <p style="margin-top: 4px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
          Total monthly gifts earned across terms: <strong>${giftsCount}</strong> <span style="color: #fbbf24;">${AppIcons.gift}</span>
        </p>
      `;

    if (student.notes) {
      insightHtml += `<p style="margin-top: 6px; font-style: italic; color: var(--text-muted);">${(state.lang === 'ar' ? 'ملاحظات المعلم' : 'Teacher Notes')}: "${student.notes}"</p>`;
    }

    elements.detailTrajectoryInsights.innerHTML = insightHtml;
    openModal(elements.modalStudentDetail);
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
      openModal(elements.modalAdminAuth);
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
      openModal(elements.modalAdminAuth);
      setTimeout(() => elements.adminPinInput && elements.adminPinInput.focus(), 150);
    }
  }

  // =========================================================================
  // EVENT LISTENERS & SETUP
  // =========================================================================
  function populateMonthSelectors() {
    const optionsHtml = AVAILABLE_MONTHS.map(m => {
      const label = (state.lang === 'ar') ? m.labelAr : m.labelEn;
      return `<option value="${m.key}" ${m.key === state.selectedMonth ? 'selected' : ''}>${label}</option>`;
    }).join('');

    elements.monthSelect.innerHTML = optionsHtml;
    elements.gradeMonthSelect.innerHTML = optionsHtml;
  }

  function setupEventListeners() {
    // Month selector change
    elements.monthSelect.addEventListener('change', (e) => {
      state.selectedMonth = e.target.value;
      renderHighlights();
      renderStudents();
    });

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
          openModal(elements.modalAdminAuth);
          setTimeout(() => elements.adminPinInput && elements.adminPinInput.focus(), 100);
        }
      });
      elements.brandLogoTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!state.isAdmin) {
            e.preventDefault();
            openModal(elements.modalAdminAuth);
            setTimeout(() => elements.adminPinInput && elements.adminPinInput.focus(), 100);
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
          openModal(elements.modalAdminAuth);
          setTimeout(() => elements.adminPinInput && elements.adminPinInput.focus(), 100);
        }
      }
    });

    // Listen to URL hash change (#admin)
    window.addEventListener('hashchange', checkAdminTriggerFromUrl);

    // Role switcher (when logged in as admin, clicking Exit Admin logs out)
    if (elements.btnToggleAdmin) {
      elements.btnToggleAdmin.addEventListener('click', () => {
        if (state.isAdmin) {
          handleAdminLogout();
        } else {
          openModal(elements.modalAdminAuth);
          setTimeout(() => elements.adminPinInput && elements.adminPinInput.focus(), 100);
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
    elements.btnAddStudent.addEventListener('click', openCreateStudentModal);
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
      renderStudents();
    });

    elements.btnViewTable.addEventListener('click', () => {
      if (!state.isAdmin) {
        showToast('toastTableAdminOnly', 'warning');
        openModal(elements.modalAdminAuth);
        return;
      }
      state.viewMode = 'table';
      elements.btnViewTable.classList.add('active');
      elements.btnViewGrid.classList.remove('active');
      renderStudents();
    });

    // Export & Clear All
    if (elements.btnExportData) elements.btnExportData.addEventListener('click', exportData);
    if (elements.btnClearAll) elements.btnClearAll.addEventListener('click', clearAllData);
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
