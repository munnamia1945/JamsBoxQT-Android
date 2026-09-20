import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Search,
  Trash2,
  RotateCcw,
  BookOpen,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  HelpCircle,
  Eye,
  X
} from 'lucide-react';
import {
  GeneralQuizBookmark,
  MathMcqBookmark,
  MathSolutionBookmark,
  MathSolution,
  QuizQuestion
} from '../types';
import { downloadMathSolutionPdf } from '../utils/pdfExport';
import MathView from './MathView';

interface BookmarksScreenProps {
  generalBookmarks: GeneralQuizBookmark[];
  mathMcqBookmarks: MathMcqBookmark[];
  mathSolutionBookmarks: MathSolutionBookmark[];
  initialCategory?: 'GENERAL' | 'MATH';
  onBack: () => void;
  onAttemptGeneralQuiz: (bookmark: GeneralQuizBookmark) => void;
  onAttemptMathMcq: (bookmark: MathMcqBookmark) => void;
  onDeleteGeneralBookmark: (id: string) => void;
  onDeleteMathMcqBookmark: (id: string) => void;
  onDeleteMathSolutionBookmark: (id: string) => void;
  onClearGeneralBookmarks: () => void;
  onClearMathBookmarks: () => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({
  generalBookmarks,
  mathMcqBookmarks,
  mathSolutionBookmarks,
  initialCategory = 'GENERAL',
  onBack,
  onAttemptGeneralQuiz,
  onAttemptMathMcq,
  onDeleteGeneralBookmark,
  onDeleteMathMcqBookmark,
  onDeleteMathSolutionBookmark,
  onClearGeneralBookmarks,
  onClearMathBookmarks
}) => {
  const [activeCategory, setActiveCategory] = useState<'GENERAL' | 'MATH'>(initialCategory);
  const [mathSubFilter, setMathSubFilter] = useState<'ALL' | 'MCQ' | 'SOLUTIONS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedSolution, setSelectedSolution] = useState<MathSolutionBookmark | null>(null);
  const [selectedGeneralDetail, setSelectedGeneralDetail] = useState<GeneralQuizBookmark | null>(null);
  const [confirmClearCategory, setConfirmClearCategory] = useState<'GENERAL' | 'MATH' | null>(null);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<{
    type: 'GENERAL' | 'MATH_MCQ' | 'MATH_SOL';
    id: string;
    title: string;
  } | null>(null);

  // Filtering General Bookmarks
  const filteredGeneral = generalBookmarks.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.topic.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.questions.some((ques) => ques.question.toLowerCase().includes(q))
    );
  });

  // Filtering Math MCQ Bookmarks
  const filteredMathMcqs = mathMcqBookmarks.filter((item) => {
    if (mathSubFilter === 'SOLUTIONS') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.chapter.toLowerCase().includes(q) ||
      item.topic.toLowerCase().includes(q) ||
      item.question.toLowerCase().includes(q) ||
      item.difficulty.toLowerCase().includes(q)
    );
  });

  // Filtering Math Solution Bookmarks
  const filteredMathSolutions = mathSolutionBookmarks.filter((item) => {
    if (mathSubFilter === 'MCQ') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.chapter.toLowerCase().includes(q) ||
      item.topic.toLowerCase().includes(q) ||
      item.problem.toLowerCase().includes(q) ||
      item.finalAnswer.toLowerCase().includes(q)
    );
  });

  const handleDownloadPdf = (sol: MathSolutionBookmark) => {
    const solutionData: MathSolution = {
      id: sol.id,
      chapter: sol.chapter,
      topic: sol.topic,
      problem: sol.problem,
      solutionSteps: sol.solutionSteps,
      finalAnswer: sol.finalAnswer,
      source: sol.source,
      formattedDate: sol.bookmarkedAt,
      timestamp: sol.timestamp
    };
    downloadMathSolutionPdf(solutionData);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-orange-500 fill-orange-500" />
          <h1 className="text-sm font-bold text-slate-900">Bookmarks</h1>
        </div>

        <button
          onClick={() => setConfirmClearCategory(activeCategory)}
          className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
          title={`Clear ${activeCategory} Bookmarks`}
        >
          Clear
        </button>
      </div>

      {/* Main Category Tabs: GENERAL vs MATH (strictly separated) */}
      <div className="grid grid-cols-2 p-1 bg-slate-200 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveCategory('GENERAL')}
          className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeCategory === 'GENERAL'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>GENERAL ({generalBookmarks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('MATH')}
          className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeCategory === 'MATH'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>MATH ({mathMcqBookmarks.length + mathSolutionBookmarks.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeCategory === 'GENERAL'
              ? 'Search general quizzes by topic or question...'
              : 'Search math bookmarks by chapter, topic, or problem...'
          }
          className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-800 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Math Sub-Filters (MCQ vs SOLUTIONS) */}
      {activeCategory === 'MATH' && (
        <div className="flex items-center gap-1.5 pt-0.5">
          {(['ALL', 'MCQ', 'SOLUTIONS'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setMathSubFilter(filter)}
              className={`text-[11px] font-bold px-3 py-1 rounded-full border transition ${
                mathSubFilter === filter
                  ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {filter === 'ALL' && `All Math (${mathMcqBookmarks.length + mathSolutionBookmarks.length})`}
              {filter === 'MCQ' && `MCQs (${mathMcqBookmarks.length})`}
              {filter === 'SOLUTIONS' && `Solutions (${mathSolutionBookmarks.length})`}
            </button>
          ))}
        </div>
      )}

      {/* CONTENT LIST */}

      {/* 1. GENERAL BOOKMARKS */}
      {activeCategory === 'GENERAL' && (
        <div className="space-y-3">
          {/* Clear All General Bookmarks Control */}
          {generalBookmarks.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200/80 rounded-xl px-3.5 py-2.5">
              <div>
                <span className="text-xs font-bold text-blue-950">General Bookmarks</span>
                <span className="text-[11px] text-blue-700 ml-1.5 font-medium">({generalBookmarks.length} saved)</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmClearCategory('GENERAL')}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All General Bookmarks</span>
              </button>
            </div>
          )}

          {filteredGeneral.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No General Bookmarks Found</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Bookmark any quiz or questions from the General Quiz section to retake them anytime.
              </p>
            </div>
          ) : (
            filteredGeneral.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-blue-700/50 transition flex flex-col space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                        {bookmark.questionType === 'MCQ' ? 'MCQ Quiz' : 'Very Short Quiz'}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {bookmark.bookmarkedAt || bookmark.formattedDate}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{bookmark.topic}</h3>
                    <p className="text-xs text-slate-500">
                      {bookmark.totalQuestions || bookmark.questionCount || bookmark.questions.length} Questions saved
                    </p>
                  </div>

                  {/* Single Delete button on General Bookmark Card */}
                  <button
                    type="button"
                    onClick={() =>
                      setBookmarkToDelete({
                        type: 'GENERAL',
                        id: bookmark.id,
                        title: bookmark.topic || bookmark.title
                      })
                    }
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Question preview snippets */}
                <div className="bg-slate-50 rounded-lg p-2 text-[11px] text-slate-600 border border-slate-100 line-clamp-2">
                  Q1: {bookmark.questions[0]?.question || 'Saved Quiz Questions'}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onAttemptGeneralQuiz(bookmark)}
                    className="flex-1 py-2 px-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ATTEMPT AGAIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGeneralDetail(bookmark)}
                    className="py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Questions</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. MATH BOOKMARKS */}
      {activeCategory === 'MATH' && (
        <div className="space-y-3">
          {/* Clear All Math Bookmarks Control */}
          {(mathMcqBookmarks.length > 0 || mathSolutionBookmarks.length > 0) && (
            <div className="flex items-center justify-between bg-orange-50/80 border border-orange-200/80 rounded-xl px-3.5 py-2.5">
              <div>
                <span className="text-xs font-bold text-orange-950">Math Bookmarks</span>
                <span className="text-[11px] text-orange-700 ml-1.5 font-medium">
                  ({mathMcqBookmarks.length} MCQs • {mathSolutionBookmarks.length} Solutions)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmClearCategory('MATH')}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Math Bookmarks</span>
              </button>
            </div>
          )}

          {filteredMathMcqs.length === 0 && filteredMathSolutions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Bookmark className="w-8 h-8 text-orange-200 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Math Bookmarks Found</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Bookmark MCQs from the Math MCQ Generator or solved problems from the Math Solver.
              </p>
            </div>
          ) : (
            <>
              {/* Math MCQs (Type 1) */}
              {filteredMathMcqs.map((mcq) => (
                <div
                  key={mcq.id}
                  className="bg-white rounded-xl border border-orange-200 p-3.5 shadow-2xs flex flex-col space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200">
                          Math MCQ
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {mcq.chapter}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                          {mcq.difficulty}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-500 mt-1">{mcq.topic}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setBookmarkToDelete({
                          type: 'MATH_MCQ',
                          id: mcq.id,
                          title: `${mcq.chapter} MCQ: ${mcq.question}`
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <MathView text={mcq.question} />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {mcq.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-1.5 rounded-md border text-slate-700 overflow-x-auto ${
                          opt === mcq.correctAnswer
                            ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <MathView text={opt} inline />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onAttemptMathMcq(mcq)}
                      className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ATTEMPT AGAIN</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Math Solutions (Type 2) */}
              {filteredMathSolutions.map((sol) => (
                <div
                  key={sol.id}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                          Math Solution
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {sol.chapter}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {sol.source}
                        </span>
                        <span className="text-[10px] text-slate-400">{sol.bookmarkedAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{sol.topic}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setBookmarkToDelete({
                          type: 'MATH_SOL',
                          id: sol.id,
                          title: `${sol.chapter} Solution: ${sol.problem}`
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Problem snippet */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Problem</p>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-2 mt-0.5">
                      <MathView text={sol.problem} inline />
                    </div>
                  </div>

                  {/* Final Answer snippet */}
                  <div className="bg-orange-50/80 border border-orange-200 rounded-lg p-2 flex items-center justify-between text-xs">
                    <span className="font-bold text-orange-900 text-[11px]">Final Answer:</span>
                    <span className="font-bold text-slate-900 overflow-x-auto max-w-[180px]">
                      <MathView text={sol.finalAnswer} inline />
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSolution(sol)}
                      className="flex-1 py-2 px-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>VIEW SOLUTION</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(sol)}
                      className="py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-orange-600" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* MODAL: View Math Solution (Offline, saved data, no Gemini call) */}
      {selectedSolution && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 bg-blue-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white uppercase tracking-wider">
                  Saved Math Solution
                </span>
                <h3 className="text-sm font-bold mt-1">
                  {selectedSolution.chapter} • {selectedSolution.topic}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSolution(null)}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-800">
              {/* Problem Statement */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Problem Statement</p>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  <MathView text={selectedSolution.problem} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Source: {selectedSolution.source} • Saved on {selectedSolution.bookmarkedAt}
                </p>
              </div>

              {/* Complete Step-by-Step Solution */}
              <div>
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
                  Step-by-Step Solution
                </h4>
                <div className="space-y-2">
                  {selectedSolution.solutionSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="text-xs text-slate-800 leading-relaxed flex-1">
                        <MathView text={step} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Answer */}
              <div className="p-3 bg-orange-50 border-2 border-orange-500 rounded-xl">
                <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Final Answer</p>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  <MathView text={selectedSolution.finalAnswer} />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setBookmarkToDelete({
                    type: 'MATH_SOL',
                    id: selectedSolution.id,
                    title: `${selectedSolution.chapter} Solution: ${selectedSolution.problem}`
                  });
                }}
                className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(selectedSolution)}
                  className="py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD PDF</span>
                </button>
                <button
                  onClick={() => setSelectedSolution(null)}
                  className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View General Quiz Questions */}
      {selectedGeneralDetail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-4 bg-blue-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                  Bookmarked Quiz Details
                </span>
                <h3 className="text-sm font-bold mt-1">{selectedGeneralDetail.topic}</h3>
                <p className="text-xs text-blue-200">{selectedGeneralDetail.totalQuestions} Questions saved</p>
              </div>
              <button
                onClick={() => setSelectedGeneralDetail(null)}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {selectedGeneralDetail.questions.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="font-bold text-slate-900 flex items-start gap-1">
                    <span className="shrink-0">Q{idx + 1}.</span>
                    <div className="flex-1">
                      <MathView text={q.question} />
                    </div>
                  </div>
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-1.5 text-[11px] rounded border overflow-x-auto ${
                            opt === q.correctAnswer
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <MathView text={opt} inline />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] text-emerald-700 font-medium">
                    Correct Answer: <MathView text={q.correctAnswer} inline />
                  </div>
                  {q.explanation && (
                    <div className="text-[10px] text-slate-500 italic">
                      Exp: <MathView text={q.explanation} className="inline" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setBookmarkToDelete({
                    type: 'GENERAL',
                    id: selectedGeneralDetail.id,
                    title: selectedGeneralDetail.topic || selectedGeneralDetail.title
                  });
                }}
                className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const b = selectedGeneralDetail;
                    setSelectedGeneralDetail(null);
                    onAttemptGeneralQuiz(b);
                  }}
                  className="py-2 px-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ATTEMPT THIS QUIZ NOW</span>
                </button>
                <button
                  onClick={() => setSelectedGeneralDetail(null)}
                  className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG FOR SINGLE BOOKMARK DELETE */}
      {bookmarkToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Delete this bookmark?
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200 text-left">
                {bookmarkToDelete.title}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Only this selected bookmark will be deleted. All other bookmarks remain unchanged.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookmarkToDelete(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (bookmarkToDelete.type === 'GENERAL') {
                    onDeleteGeneralBookmark(bookmarkToDelete.id);
                    if (selectedGeneralDetail?.id === bookmarkToDelete.id) {
                      setSelectedGeneralDetail(null);
                    }
                  } else if (bookmarkToDelete.type === 'MATH_MCQ') {
                    onDeleteMathMcqBookmark(bookmarkToDelete.id);
                  } else if (bookmarkToDelete.type === 'MATH_SOL') {
                    onDeleteMathSolutionBookmark(bookmarkToDelete.id);
                    if (selectedSolution?.id === bookmarkToDelete.id) {
                      setSelectedSolution(null);
                    }
                  }
                  setBookmarkToDelete(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG FOR CLEAR BOOKMARKS IN SECTION */}
      {confirmClearCategory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Are you sure you want to delete all bookmarks in this section?
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200 text-left">
                Section:{' '}
                <strong className="text-slate-900">
                  {confirmClearCategory === 'GENERAL' ? 'General Bookmarks' : 'Math Bookmarks'}
                </strong>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                This will delete all bookmarks belonging to this section only. Quiz History, Settings, API Keys, and other bookmark categories will remain untouched.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearCategory(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmClearCategory === 'GENERAL') {
                    onClearGeneralBookmarks();
                    setSelectedGeneralDetail(null);
                  } else {
                    onClearMathBookmarks();
                    setSelectedSolution(null);
                  }
                  setConfirmClearCategory(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
