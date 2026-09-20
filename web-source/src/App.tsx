import React, { useState, useEffect, useRef } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { HomeScreen } from './components/HomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { HistoryDetailScreen } from './components/HistoryDetailScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BookmarksScreen } from './components/BookmarksScreen';
import { MathLabScreen } from './components/MathLabScreen';
import { ProjectCodeViewer } from './components/ProjectCodeViewer';
import {
  QuestionType,
  QuizMode,
  QuizQuestion,
  UserAnswer,
  QuizResult,
  QuizHistoryItem,
  MathDifficulty,
  MathSolution,
  MathHistoryItem,
  MathMcqBookmark,
  MathSolutionBookmark,
  GeneralQuizBookmark
} from './types';
import { generateQuizQuestions, generateMathQuestions } from './services/geminiService';
import { Smartphone, Code2, Download } from 'lucide-react';
import { JamsBoxLogo } from './components/JamsBoxLogo';

type Screen =
  | 'HOME'
  | 'QUIZ'
  | 'RESULT'
  | 'HISTORY'
  | 'HISTORY_DETAIL'
  | 'SETTINGS'
  | 'BOOKMARKS'
  | 'MATH_LAB';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code'>('simulator');
  const [currentScreen, setCurrentScreen] = useState<Screen>('HOME');

  // -------------------------------------------------------------
  // 1. Settings & API Key
  // -------------------------------------------------------------
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('smart_quiz_gemini_api_key') || '';
  });

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('smart_quiz_gemini_api_key', newKey);
  };

  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('smart_quiz_gemini_api_key');
  };

  // -------------------------------------------------------------
  // 2. Data Collections (Strictly Separated)
  // -------------------------------------------------------------
  // Collection 1: General Quiz History
  const [historyList, setHistoryList] = useState<QuizHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('smart_quiz_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Collection 2: General Quiz Bookmarks
  const [generalBookmarks, setGeneralBookmarks] = useState<GeneralQuizBookmark[]>(() => {
    try {
      const stored = localStorage.getItem('jamsbox_general_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Collection 3: Math History
  const [mathHistory, setMathHistory] = useState<MathHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('jamsbox_math_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Collection 4: Math Bookmarks (MCQs & Solutions)
  const [mathMcqBookmarks, setMathMcqBookmarks] = useState<MathMcqBookmark[]>(() => {
    try {
      const stored = localStorage.getItem('jamsbox_math_mcq_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [mathSolutionBookmarks, setMathSolutionBookmarks] = useState<MathSolutionBookmark[]>(() => {
    try {
      const stored = localStorage.getItem('jamsbox_math_solution_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist each collection
  useEffect(() => {
    try {
      localStorage.setItem('smart_quiz_history', JSON.stringify(historyList));
    } catch (e) {
      console.error('Failed to store general quiz history', e);
    }
  }, [historyList]);

  useEffect(() => {
    try {
      localStorage.setItem('jamsbox_general_bookmarks', JSON.stringify(generalBookmarks));
    } catch (e) {
      console.error('Failed to store general bookmarks', e);
    }
  }, [generalBookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('jamsbox_math_history', JSON.stringify(mathHistory));
    } catch (e) {
      console.error('Failed to store math history', e);
    }
  }, [mathHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('jamsbox_math_mcq_bookmarks', JSON.stringify(mathMcqBookmarks));
    } catch (e) {
      console.error('Failed to store math mcq bookmarks', e);
    }
  }, [mathMcqBookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('jamsbox_math_solution_bookmarks', JSON.stringify(mathSolutionBookmarks));
    } catch (e) {
      console.error('Failed to store math solution bookmarks', e);
    }
  }, [mathSolutionBookmarks]);

  // -------------------------------------------------------------
  // 3. Quiz Configuration & Active State
  // -------------------------------------------------------------
  const [topic, setTopic] = useState('');
  const [topicError, setTopicError] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>('MCQ');
  const [questionCount, setQuestionCount] = useState(20);
  const [quizMode, setQuizMode] = useState<QuizMode>('TIMED');

  const [isMathQuiz, setIsMathQuiz] = useState(false);
  const [mathChapter, setMathChapter] = useState<string>('');
  const [mathDifficulty, setMathDifficulty] = useState<MathDifficulty>('Medium');

  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Result & Selected History
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<QuizHistoryItem | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle timer countdown
  useEffect(() => {
    if (isQuizActive && quizMode === 'TIMED') {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isQuizActive, quizMode]);

  // -------------------------------------------------------------
  // 4. Start Quiz Methods (AI Generation)
  // -------------------------------------------------------------
  // General Quiz Start
  const handleStartGeneralQuiz = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setTopicError('Please enter a topic name.');
      return;
    }
    setTopicError(null);
    setTopic(trimmedTopic);

    if (!apiKey) {
      setCurrentScreen('SETTINGS');
      return;
    }

    setIsGenerating(true);

    try {
      const generatedQuestions = await generateQuizQuestions(
        apiKey,
        trimmedTopic,
        questionType,
        questionCount
      );
      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setUserAnswers({});
      setIsMathQuiz(false);

      const seconds = questionCount * 60;
      setRemainingSeconds(seconds);
      setTotalSeconds(seconds);
      setIsQuizActive(true);
      setCurrentScreen('QUIZ');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate questions';
      alert(`Generation Error: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Math MCQ Generator Start
  const handleStartMathQuiz = async (
    chapter: string,
    topicName: string,
    diff: MathDifficulty,
    count: number
  ) => {
    if (!apiKey) {
      setCurrentScreen('SETTINGS');
      return;
    }

    setIsGenerating(true);
    setTopic(topicName);
    setMathChapter(chapter);
    setMathDifficulty(diff);
    setQuestionType('MCQ');
    setQuestionCount(count);

    try {
      const generatedQuestions = await generateMathQuestions(
        apiKey,
        chapter,
        topicName,
        diff,
        count
      );
      setQuestions(generatedQuestions);
      setCurrentIndex(0);
      setUserAnswers({});
      setIsMathQuiz(true);

      const seconds = count * 60;
      setRemainingSeconds(seconds);
      setTotalSeconds(seconds);
      setIsQuizActive(true);
      setCurrentScreen('QUIZ');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate math MCQs';
      alert(`Generation Error: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // 5. Retake From Local Storage (NO GEMINI CALL)
  // -------------------------------------------------------------
  // Retake General Quiz Bookmark
  const handleAttemptGeneralQuizBookmark = (item: GeneralQuizBookmark) => {
    setTopic(item.topic);
    setQuestionType(item.questionType);
    setQuestionCount(item.questionCount);
    setQuizMode(item.mode);
    setQuestions(item.questions);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsMathQuiz(false);

    const seconds = item.questionCount * 60;
    setRemainingSeconds(seconds);
    setTotalSeconds(seconds);
    setIsQuizActive(true);
    setCurrentScreen('QUIZ');
  };

  // Retake Math MCQ Bookmark
  const handleAttemptMathMcqBookmark = (item: MathMcqBookmark) => {
    setTopic(item.topic);
    setMathChapter(item.chapter);
    setMathDifficulty(item.difficulty);
    setQuestionType('MCQ');
    setQuestionCount(1);
    setQuizMode('UNTIMED');

    const singleQ: QuizQuestion = {
      id: 1,
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      chapter: item.chapter,
      difficulty: item.difficulty
    };

    setQuestions([singleQ]);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsMathQuiz(true);

    setRemainingSeconds(0);
    setTotalSeconds(0);
    setIsQuizActive(true);
    setCurrentScreen('QUIZ');
  };

  // Retake from Math History item
  const handleAttemptSavedMathHistory = (item: MathHistoryItem) => {
    if (!item.questions || item.questions.length === 0) return;

    setTopic(item.topic);
    setMathChapter(item.chapter);
    setQuestionType('MCQ');
    setQuestionCount(item.questions.length);
    setQuizMode('TIMED');
    setQuestions(item.questions);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsMathQuiz(true);

    const seconds = item.questions.length * 60;
    setRemainingSeconds(seconds);
    setTotalSeconds(seconds);
    setIsQuizActive(true);
    setCurrentScreen('QUIZ');
  };

  // -------------------------------------------------------------
  // 6. User Answers & Submission
  // -------------------------------------------------------------
  const handleSelectOption = (qId: number, option: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;

    const isCorrect =
      option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ||
      q.correctAnswer.trim().toLowerCase().startsWith(option.trim().substring(0, 2).toLowerCase());

    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        questionId: qId,
        selectedOption: option,
        isCorrect
      }
    }));
  };

  const handleEnterText = (qId: number, text: string) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;

    const cleanInput = text.trim().toLowerCase();
    const cleanAnswer = q.correctAnswer.trim().toLowerCase();
    const isCorrect =
      cleanInput.length > 0 && (cleanAnswer.includes(cleanInput) || cleanInput.includes(cleanAnswer));

    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        questionId: qId,
        textAnswer: text,
        isCorrect
      }
    }));
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsQuizActive(false);

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (!ans || (!ans.selectedOption && !ans.textAnswer)) {
        unansweredCount++;
      } else if (ans.isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const total = questions.length;
    const score = correctCount;
    const percentage = total > 0 ? (correctCount / total) * 100 : 0;
    const elapsed = Math.max(1, totalSeconds - remainingSeconds);

    const result: QuizResult = {
      topic,
      questionType,
      mode: quizMode,
      totalQuestions: total,
      correctCount,
      wrongCount,
      unansweredCount,
      score,
      percentage,
      timeTakenSeconds: elapsed,
      questions,
      userAnswers,
      isMathQuiz,
      chapter: mathChapter,
      difficulty: mathDifficulty
    };

    setLastResult(result);

    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isMathQuiz) {
      // Calculate attempt number in Math History
      const previousAttempts = mathHistory.filter(
        (h) => h.topic.toLowerCase() === topic.toLowerCase() && h.type === 'MCQ_ATTEMPT'
      ).length;
      const attemptLabel = `Attempt ${previousAttempts + 1}`;

      const mathHistItem: MathHistoryItem = {
        id: String(Date.now()),
        type: 'MCQ_ATTEMPT',
        chapter: mathChapter || 'Mathematics',
        topic: `${topic} (${attemptLabel})`,
        score,
        questionCount: total,
        percentage,
        formattedDate,
        timestamp: Date.now(),
        questions,
        userAnswers
      };
      setMathHistory((prev) => [mathHistItem, ...prev]);
    } else {
      // Calculate attempt number in General Quiz History
      const previousAttempts = historyList.filter(
        (h) => h.topic.toLowerCase() === topic.toLowerCase()
      ).length;
      const attemptSuffix = previousAttempts > 0 ? ` (Attempt ${previousAttempts + 1})` : '';

      const historyItem: QuizHistoryItem = {
        id: String(Date.now()),
        topic: `${topic}${attemptSuffix}`,
        questionType: questionType === 'MCQ' ? 'MCQ' : 'Very Short Question',
        totalQuestions: total,
        score,
        percentage,
        mode: quizMode === 'TIMED' ? 'Timed' : 'Untimed',
        timeTakenFormatted: `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
        formattedDate,
        questions,
        userAnswers
      };
      setHistoryList((prev) => [historyItem, ...prev]);
    }

    setCurrentScreen('RESULT');
  };

  const handleRetryQuiz = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    const seconds = questions.length * 60;
    setRemainingSeconds(seconds);
    setTotalSeconds(seconds);
    setIsQuizActive(true);
    setCurrentScreen('QUIZ');
  };

  const handleNewQuiz = () => {
    setIsQuizActive(false);
    setQuestions([]);
    setUserAnswers({});
    setCurrentScreen('HOME');
  };

  const handleExitQuiz = () => {
    setIsQuizActive(false);
    setQuestions([]);
    setUserAnswers({});
    setCurrentScreen('HOME');
  };

  // -------------------------------------------------------------
  // 7. Bookmarking Operations
  // -------------------------------------------------------------
  // Toggle bookmark for current question in quiz
  const handleToggleBookmarkCurrentQuestion = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    handleToggleBookmarkQuestion(currentQ);
  };

  const isCurrentQuestionBookmarked = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return false;
    return isQuestionBookmarked(currentQ);
  };

  const isQuestionBookmarked = (q: QuizQuestion) => {
    if (isMathQuiz) {
      return mathMcqBookmarks.some((b) => b.question.trim() === q.question.trim());
    }
    return generalBookmarks.some((b) => b.title.trim() === q.question.trim());
  };

  const handleToggleBookmarkQuestion = (q: QuizQuestion) => {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (isMathQuiz) {
      const exists = mathMcqBookmarks.some((b) => b.question.trim() === q.question.trim());
      if (exists) {
        setMathMcqBookmarks((prev) => prev.filter((b) => b.question.trim() !== q.question.trim()));
      } else {
        const newBookmark: MathMcqBookmark = {
          id: String(Date.now()),
          chapter: q.chapter || mathChapter || 'Mathematics',
          topic: topic || 'Math MCQ',
          difficulty: q.difficulty || mathDifficulty || 'Medium',
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          formattedDate,
          timestamp: Date.now(),
          originalQuizTitle: topic
        };
        setMathMcqBookmarks((prev) => [newBookmark, ...prev]);
      }
    } else {
      const exists = generalBookmarks.some((b) => b.title.trim() === q.question.trim());
      if (exists) {
        setGeneralBookmarks((prev) => prev.filter((b) => b.title.trim() !== q.question.trim()));
      } else {
        const newBookmark: GeneralQuizBookmark = {
          id: String(Date.now()),
          topic,
          title: q.question,
          questionType: questionType === 'MCQ' ? 'MCQ' : 'Very Short Question',
          questionCount: 1,
          mode: quizMode,
          formattedDate,
          timestamp: Date.now(),
          questions: [q]
        };
        setGeneralBookmarks((prev) => [newBookmark, ...prev]);
      }
    }
  };

  // Bookmark entire quiz from ResultScreen
  const handleBookmarkWholeQuiz = () => {
    if (!lastResult) return;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (lastResult.isMathQuiz) {
      // Save questions as Math Mcq Bookmarks
      const newItems: MathMcqBookmark[] = lastResult.questions.map((q, idx) => ({
        id: `${Date.now()}_${idx}`,
        chapter: q.chapter || lastResult.chapter || 'Mathematics',
        topic: lastResult.topic,
        difficulty: q.difficulty || lastResult.difficulty || 'Medium',
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        formattedDate,
        timestamp: Date.now(),
        originalQuizTitle: lastResult.topic
      }));

      // Filter out existing duplicates
      const fresh = newItems.filter(
        (item) => !mathMcqBookmarks.some((existing) => existing.question === item.question)
      );
      setMathMcqBookmarks((prev) => [...fresh, ...prev]);
      alert(`Saved ${fresh.length} Math question(s) to Math Bookmarks!`);
    } else {
      const newBookmark: GeneralQuizBookmark = {
        id: String(Date.now()),
        topic: lastResult.topic,
        title: `${lastResult.topic} (${lastResult.totalQuestions} Questions)`,
        questionType: lastResult.questionType === 'MCQ' ? 'MCQ' : 'Very Short Question',
        questionCount: lastResult.totalQuestions,
        mode: lastResult.mode,
        formattedDate,
        timestamp: Date.now(),
        questions: lastResult.questions
      };
      setGeneralBookmarks((prev) => [newBookmark, ...prev]);
      alert('Quiz saved to General Bookmarks!');
    }
  };

  // Math Solver Save / Bookmark callbacks
  const handleSaveMathSolutionToHistory = (sol: MathSolution) => {
    const item: MathHistoryItem = {
      id: sol.id,
      type: 'SOLUTION',
      chapter: sol.chapter,
      topic: sol.topic,
      source: sol.source,
      problem: sol.problem,
      solutionSteps: sol.solutionSteps,
      finalAnswer: sol.finalAnswer,
      formattedDate: sol.formattedDate,
      timestamp: sol.timestamp
    };
    setMathHistory((prev) => [item, ...prev]);
  };

  const handleSaveMathSolutionToBookmark = (sol: MathSolution) => {
    const item: MathSolutionBookmark = {
      id: sol.id,
      chapter: sol.chapter,
      topic: sol.topic,
      source: sol.source,
      problem: sol.problem,
      solutionSteps: sol.solutionSteps,
      finalAnswer: sol.finalAnswer,
      formattedDate: sol.formattedDate,
      timestamp: sol.timestamp
    };
    setMathSolutionBookmarks((prev) => [item, ...prev.filter((b) => b.id !== sol.id)]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Platform Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <JamsBoxLogo variant="compact" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded-full border border-blue-700">
                  Android Native • Kotlin + Jetpack Compose
                </span>
                <span className="text-[11px] font-semibold bg-orange-600/80 text-orange-100 px-2 py-0.5 rounded-full border border-orange-500">
                  Math Lab + Bookmark System
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Educational Quiz Platform with Gemini AI Math Solver, MCQ Generator & Bookmarks
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'simulator'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android App Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Android Studio Code & Files</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {activeTab === 'simulator' ? (
          <div className="flex flex-col items-center">
            <PhoneFrame>
              {/* SCREEN 1: HOME */}
              {currentScreen === 'HOME' && (
                <HomeScreen
                  topic={topic}
                  setTopic={setTopic}
                  topicError={topicError}
                  setTopicError={setTopicError}
                  questionType={questionType}
                  setQuestionType={setQuestionType}
                  questionCount={questionCount}
                  setQuestionCount={setQuestionCount}
                  quizMode={quizMode}
                  setQuizMode={setQuizMode}
                  hasApiKey={Boolean(apiKey)}
                  isGenerating={isGenerating}
                  generalBookmarksCount={generalBookmarks.length}
                  mathBookmarksCount={mathMcqBookmarks.length + mathSolutionBookmarks.length}
                  onStartQuiz={handleStartGeneralQuiz}
                  onOpenHistory={() => setCurrentScreen('HISTORY')}
                  onOpenSettings={() => setCurrentScreen('SETTINGS')}
                  onOpenBookmarks={() => setCurrentScreen('BOOKMARKS')}
                  onOpenMathLab={() => setCurrentScreen('MATH_LAB')}
                />
              )}

              {/* SCREEN 2: MATH LAB */}
              {currentScreen === 'MATH_LAB' && (
                <MathLabScreen
                  apiKey={apiKey}
                  hasApiKey={Boolean(apiKey)}
                  isGenerating={isGenerating}
                  mathHistory={mathHistory}
                  mathMcqBookmarks={mathMcqBookmarks}
                  mathSolutionBookmarks={mathSolutionBookmarks}
                  onBack={() => setCurrentScreen('HOME')}
                  onOpenSettings={() => setCurrentScreen('SETTINGS')}
                  onOpenMathBookmarks={() => setCurrentScreen('BOOKMARKS')}
                  onStartMathQuiz={handleStartMathQuiz}
                  onSaveMathSolutionToHistory={handleSaveMathSolutionToHistory}
                  onSaveMathSolutionToBookmark={handleSaveMathSolutionToBookmark}
                  onDeleteMathHistoryItem={(id) =>
                    setMathHistory((prev) => prev.filter((i) => i.id !== id))
                  }
                  onClearMathHistory={() => setMathHistory([])}
                  onAttemptSavedMathHistory={handleAttemptSavedMathHistory}
                />
              )}

              {/* SCREEN 3: BOOKMARKS (GENERAL & MATH) */}
              {currentScreen === 'BOOKMARKS' && (
                <BookmarksScreen
                  generalBookmarks={generalBookmarks}
                  mathMcqBookmarks={mathMcqBookmarks}
                  mathSolutionBookmarks={mathSolutionBookmarks}
                  onBack={() => setCurrentScreen('HOME')}
                  onDeleteGeneralBookmark={(id) =>
                    setGeneralBookmarks((prev) => prev.filter((b) => b.id !== id))
                  }
                  onDeleteMathMcqBookmark={(id) =>
                    setMathMcqBookmarks((prev) => prev.filter((b) => b.id !== id))
                  }
                  onDeleteMathSolutionBookmark={(id) =>
                    setMathSolutionBookmarks((prev) => prev.filter((b) => b.id !== id))
                  }
                  onClearGeneralBookmarks={() => setGeneralBookmarks([])}
                  onClearMathBookmarks={() => {
                    setMathMcqBookmarks([]);
                    setMathSolutionBookmarks([]);
                  }}
                  onAttemptGeneralQuiz={handleAttemptGeneralQuizBookmark}
                  onAttemptMathMcq={handleAttemptMathMcqBookmark}
                />
              )}

              {/* SCREEN 4: QUIZ SCREEN */}
              {currentScreen === 'QUIZ' && (
                <QuizScreen
                  topic={topic}
                  questionType={questionType}
                  quizMode={quizMode}
                  questions={questions}
                  currentIndex={currentIndex}
                  userAnswers={userAnswers}
                  remainingSeconds={remainingSeconds}
                  isMathQuiz={isMathQuiz}
                  isBookmarked={isCurrentQuestionBookmarked()}
                  onToggleBookmarkCurrent={handleToggleBookmarkCurrentQuestion}
                  onSelectOption={handleSelectOption}
                  onEnterText={handleEnterText}
                  onNext={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                  onPrevious={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  onSubmit={handleSubmitQuiz}
                  onExit={handleExitQuiz}
                />
              )}

              {/* SCREEN 5: RESULT SCREEN */}
              {currentScreen === 'RESULT' && lastResult && (
                <ResultScreen
                  result={lastResult}
                  onRetry={handleRetryQuiz}
                  onNewQuiz={handleNewQuiz}
                  onOpenHistory={() =>
                    lastResult.isMathQuiz ? setCurrentScreen('MATH_LAB') : setCurrentScreen('HISTORY')
                  }
                  onBookmarkQuiz={handleBookmarkWholeQuiz}
                  onToggleBookmarkQuestion={handleToggleBookmarkQuestion}
                  isQuestionBookmarked={isQuestionBookmarked}
                />
              )}

              {/* SCREEN 6: GENERAL QUIZ HISTORY */}
              {currentScreen === 'HISTORY' && (
                <HistoryScreen
                  historyList={historyList}
                  onBack={() => setCurrentScreen('HOME')}
                  onSelectItem={(item) => {
                    setSelectedHistoryItem(item);
                    setCurrentScreen('HISTORY_DETAIL');
                  }}
                  onDeleteItem={(id) => setHistoryList((prev) => prev.filter((item) => item.id !== id))}
                  onResetHistory={() => setHistoryList([])}
                />
              )}

              {/* SCREEN 7: GENERAL HISTORY DETAIL */}
              {currentScreen === 'HISTORY_DETAIL' && selectedHistoryItem && (
                <HistoryDetailScreen
                  item={selectedHistoryItem}
                  onBack={() => setCurrentScreen('HISTORY')}
                />
              )}

              {/* SCREEN 8: SETTINGS */}
              {currentScreen === 'SETTINGS' && (
                <SettingsScreen
                  apiKey={apiKey}
                  onSaveApiKey={handleSaveApiKey}
                  onClearApiKey={handleClearApiKey}
                  onBack={() => setCurrentScreen('HOME')}
                />
              )}
            </PhoneFrame>

            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500">
                Tip: Test the complete Math Lab, Solver, and separated Bookmarks in the phone frame, or view the{' '}
                <button
                  onClick={() => setActiveTab('code')}
                  className="font-semibold text-blue-900 underline"
                >
                  Android Studio Code & Files
                </button>{' '}
                to download the project.
              </p>
            </div>
          </div>
        ) : (
          <ProjectCodeViewer />
        )}
      </main>
    </div>
  );
}
