import React, { useState, useRef, useEffect } from 'react';
import {
  History,
  Settings,
  Play,
  AlertTriangle,
  Sparkles,
  Clock,
  AlertCircle,
  Calculator,
  Bookmark,
  Brain,
  ChevronRight,
  BookOpen,
  Menu
} from 'lucide-react';
import { QuestionType, QuizMode } from '../types';
import { JamsBoxLogo } from './JamsBoxLogo';

interface HomeScreenProps {
  topic: string;
  setTopic: (t: string) => void;
  topicError?: string | null;
  setTopicError?: (err: string | null) => void;
  questionType: QuestionType;
  setQuestionType: (t: QuestionType) => void;
  questionCount: number;
  setQuestionCount: (c: number) => void;
  quizMode: QuizMode;
  setQuizMode: (m: QuizMode) => void;
  hasApiKey: boolean;
  isGenerating: boolean;
  generalBookmarksCount?: number;
  mathBookmarksCount?: number;
  onStartQuiz: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenBookmarks: () => void;
  onOpenMathLab: () => void;
  onOpenMathMcqGen?: () => void;
  onOpenMathSolver?: () => void;
  onOpenMathHistory?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  topic,
  setTopic,
  topicError,
  setTopicError,
  questionType,
  setQuestionType,
  questionCount,
  setQuestionCount,
  quizMode,
  setQuizMode,
  hasApiKey,
  isGenerating,
  generalBookmarksCount = 0,
  mathBookmarksCount = 0,
  onStartQuiz,
  onOpenHistory,
  onOpenSettings,
  onOpenBookmarks,
  onOpenMathLab,
  onOpenMathMcqGen,
  onOpenMathSolver,
  onOpenMathHistory
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const sampleTopics = [
    'Android Activity',
    'Computer Networks',
    'Database Management System',
    'Machine Learning',
    'Operating System'
  ];

  const questionCounts = [10, 20, 30, 40, 50];

  const handleStartClick = () => {
    if (!topic.trim()) {
      if (setTopicError) {
        setTopicError('Please enter a topic name.');
      }
      return;
    }
    onStartQuiz();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 min-h-0">
      {/* Top App Bar - Static / Fixed at top */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 shrink-0 z-30">
        <div className="flex items-center justify-between">
          <JamsBoxLogo variant="compact" transparentBg />
        </div>
      </div>

      {/* Scrollable Content below the heading bar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* Hamburger Navigation Toggle Button & Small Menu */}
        <div className="relative" ref={menuRef}>
        <div className="flex items-center justify-start">
          <button
            type="button"
            id="home-nav-toggle"
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs active:bg-slate-100"
            title="Navigation Menu"
            aria-label="Navigation Menu"
            aria-expanded={isMenuOpen}
          >
            <Menu className="w-4 h-4 text-slate-700" />
          </button>
        </div>

        {/* Small Navigation Menu / Drawer */}
        {isMenuOpen && (
          <div
            id="home-nav-menu"
            className="absolute left-0 top-full mt-1.5 z-40 w-48 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
          >
            <button
              type="button"
              id="menu-settings-btn"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition text-left"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              id="menu-history-btn"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenHistory();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition text-left"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span>History</span>
            </button>

            <button
              type="button"
              id="menu-bookmarks-btn"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenBookmarks();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-orange-500" />
                <span>Bookmarks</span>
              </div>
              {generalBookmarksCount + mathBookmarksCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                  {generalBookmarksCount + mathBookmarksCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* API Key Missing Warning */}
      {!hasApiKey && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-amber-900">Gemini API Key Needed</p>
            <p className="text-amber-700 mt-0.5">
              Please add your free Gemini API key in Settings to generate questions and solve math problems.
            </p>
            <button
              onClick={onOpenSettings}
              className="mt-2 text-xs font-semibold px-2.5 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
            >
              Add Key in Settings
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. MATH LAB HIGHLIGHT SECTION (Exact User Request) */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-4 rounded-2xl border border-blue-900/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-widest text-orange-400 uppercase">MATH LAB</h2>
              <p className="text-[11px] text-slate-300">Advanced Mathematics Suite</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMathLab}
            className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5 transition"
          >
            <span>Open Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Math Lab Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenMathMcqGen || onOpenMathLab}
            className="p-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left rounded-xl transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-orange-400 mb-1">
              <Brain className="w-4 h-4" />
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
            </div>
            <p className="text-xs font-bold text-white leading-tight">Math MCQ Generator</p>
            <p className="text-[10px] text-slate-400 mt-0.5">23 Chapters & Topics</p>
          </button>

          <button
            type="button"
            onClick={onOpenMathSolver || onOpenMathLab}
            className="p-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left rounded-xl transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-orange-400 mb-1">
              <Calculator className="w-4 h-4" />
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
            </div>
            <p className="text-xs font-bold text-white leading-tight">Math Solver</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Typed, Photo & PDF</p>
          </button>

          <button
            type="button"
            onClick={onOpenMathHistory || onOpenMathLab}
            className="p-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left rounded-xl transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-blue-400 mb-1">
              <History className="w-4 h-4" />
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
            </div>
            <p className="text-xs font-bold text-white leading-tight">Math History</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Solved problems archive</p>
          </button>

          <button
            type="button"
            onClick={onOpenBookmarks}
            className="p-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left rounded-xl transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between text-orange-400 mb-1">
              <Bookmark className="w-4 h-4 fill-orange-400/20" />
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition" />
            </div>
            <p className="text-xs font-bold text-white leading-tight">Math Bookmarks</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{mathBookmarksCount} items saved</p>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. GENERAL QUIZ SECTION (Preserved completely) */}
      {/* ========================================================= */}
      <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-blue-100 pb-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-900" />
            <h2 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              GENERAL QUIZ GENERATOR
            </h2>
          </div>
        </div>

        {/* 1. Topic Name Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="topic-input"
              className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1"
            >
              <span>Topic Name</span>
              <span className="text-red-500 font-bold" title="Required">*</span>
            </label>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required</span>
          </div>

          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              if (topicError && setTopicError) {
                setTopicError(null);
              }
            }}
            placeholder="Enter topic name (e.g. Computer Networks)"
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 transition ${
              topicError
                ? 'border-red-500 text-slate-900 focus:ring-red-400 focus:border-red-500 bg-red-50/20'
                : 'border-slate-300 text-slate-900 focus:ring-blue-800 focus:border-transparent'
            }`}
          />

          {topicError && (
            <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold pt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{topicError}</span>
            </div>
          )}

          {/* Sample Topics */}
          <div className="space-y-1 pt-0.5">
            <p className="text-[11px] text-slate-500 font-medium">Sample Topics:</p>
            <div className="flex flex-wrap gap-1.5">
              {sampleTopics.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setTopic(s);
                    if (topicError && setTopicError) {
                      setTopicError(null);
                    }
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition font-medium ${
                    topic.trim().toLowerCase() === s.toLowerCase()
                      ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-700 hover:text-blue-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Question Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            2. Question Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setQuestionType('MCQ')}
              className={`p-2.5 text-left rounded-xl border transition ${
                questionType === 'MCQ'
                  ? 'border-blue-900 bg-white text-blue-900 font-semibold ring-1 ring-blue-900 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-bold">MCQ</p>
              <p className="text-[11px] text-slate-500 mt-0.5">4 Options (A, B, C, D)</p>
            </button>

            <button
              type="button"
              onClick={() => setQuestionType('VERY_SHORT')}
              className={`p-2.5 text-left rounded-xl border transition ${
                questionType === 'VERY_SHORT'
                  ? 'border-blue-900 bg-white text-blue-900 font-semibold ring-1 ring-blue-900 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-bold">Very Short</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Direct typed answers</p>
            </button>
          </div>
        </div>

        {/* 3. Question Count */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            3. Number of Questions
          </label>
          <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {questionCounts.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium border shrink-0 transition ${
                  questionCount === count
                    ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {count} Qs
              </button>
            ))}
          </div>
        </div>

        {/* 4. Quiz Mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            4. Quiz Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setQuizMode('TIMED')}
              className={`p-2.5 text-left rounded-xl border transition ${
                quizMode === 'TIMED'
                  ? 'border-blue-900 bg-white text-blue-900 font-semibold ring-1 ring-blue-900 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-900" />
                <p className="text-xs font-bold">Timed Mode</p>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{questionCount} mins ({questionCount} Qs)</p>
            </button>

            <button
              type="button"
              onClick={() => setQuizMode('UNTIMED')}
              className={`p-2.5 text-left rounded-xl border transition ${
                quizMode === 'UNTIMED'
                  ? 'border-blue-900 bg-white text-blue-900 font-semibold ring-1 ring-blue-900 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-bold">Untimed Mode</p>
              <p className="text-[11px] text-slate-500 mt-0.5">No timer limit</p>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleStartClick}
            disabled={isGenerating}
            className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isGenerating ? 'Generating Quiz...' : 'Start General Quiz'}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
};
