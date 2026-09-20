import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Calculator,
  Brain,
  History,
  Bookmark,
  Sparkles,
  Camera,
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  Plus,
  X,
  FileUp,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import {
  MATH_CHAPTERS,
  MathChapter,
  MathDifficulty,
  MathSolution,
  MathHistoryItem,
  QuizQuestion,
  MathMcqBookmark,
  MathSolutionBookmark
} from '../types';
import { solveMathProblem } from '../services/geminiService';
import { downloadMathSolutionPdf } from '../utils/pdfExport';
import MathView from './MathView';

interface MathLabScreenProps {
  apiKey: string;
  hasApiKey: boolean;
  isGenerating?: boolean;
  mathHistory: MathHistoryItem[];
  mathMcqBookmarks: MathMcqBookmark[];
  mathSolutionBookmarks: MathSolutionBookmark[];
  onBack: () => void;
  onOpenSettings: () => void;
  onOpenMathBookmarks: () => void;
  onStartMathQuiz: (
    chapter: string,
    topic: string,
    difficulty: MathDifficulty,
    count: number
  ) => void;
  onSaveMathSolutionToHistory: (solution: MathSolution) => void;
  onSaveMathSolutionToBookmark: (solution: MathSolution) => void;
  onDeleteMathHistoryItem: (id: string) => void;
  onClearMathHistory: () => void;
  onAttemptSavedMathHistory: (item: MathHistoryItem) => void;
}

export const MathLabScreen: React.FC<MathLabScreenProps> = ({
  apiKey,
  hasApiKey,
  isGenerating = false,
  mathHistory,
  mathMcqBookmarks,
  mathSolutionBookmarks,
  onBack,
  onOpenSettings,
  onOpenMathBookmarks,
  onStartMathQuiz,
  onSaveMathSolutionToHistory,
  onSaveMathSolutionToBookmark,
  onDeleteMathHistoryItem,
  onClearMathHistory,
  onAttemptSavedMathHistory
}) => {
  // Main Sub-tabs in Math Lab:
  // 1. Math MCQ Generator
  // 2. Math Solver
  // 3. Math History
  // 4. Math Bookmarks (calls onOpenMathBookmarks)
  const [activeSection, setActiveSection] = useState<'MCQ_GEN' | 'SOLVER' | 'HISTORY'>('MCQ_GEN');

  // --- 1. Math MCQ Generator State ---
  const [selectedChapter, setSelectedChapter] = useState<string>('Algebra');
  const [customTopic, setCustomTopic] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<MathDifficulty>('Medium');

  // --- 2. Math Solver State ---
  const [solverTab, setSolverTab] = useState<'TYPED' | 'PHOTO' | 'PDF'>('TYPED');
  const [solverChapter, setSolverChapter] = useState<string>('Algebra');
  const [solverTopic, setSolverTopic] = useState('');
  const [typedProblem, setTypedProblem] = useState('');

  // File Upload State (Photo / PDF)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    mimeType: string;
    base64: string;
    previewUrl?: string;
  } | null>(null);

  const [isSolving, setIsSolving] = useState(false);
  const [solverError, setSolverError] = useState<string | null>(null);
  const [currentSolution, setCurrentSolution] = useState<MathSolution | null>(null);
  const [solutionSaved, setSolutionSaved] = useState(false);
  const [solutionBookmarked, setSolutionBookmarked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- 3. Math History Detail Modal ---
  const [selectedHistorySolution, setSelectedHistorySolution] = useState<MathHistoryItem | null>(null);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);

  // Sample quick problems
  const sampleProblems: Record<string, string[]> = {
    Algebra: ['Solve 2x² - 5x + 2 = 0', 'Find the roots of x³ - 6x² + 11x - 6 = 0'],
    Calculus: ['Evaluate the limit lim(x->0) (sin 3x) / x', 'Find the derivative of f(x) = x³ * ln(x)'],
    Trigonometry: ['Prove that (sin θ + cos θ)² = 1 + sin 2θ', 'Solve sin(2x) = 1/2 for 0 <= x <= 2π'],
    Mensuration: ['Find the total surface area of a cone with radius 7cm and slant height 25cm'],
    Probability: ['Two fair dice are rolled. Find the probability that the sum of the dice is 8.']
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      const previewUrl = file.type.startsWith('image/') ? (reader.result as string) : undefined;

      setUploadedFile({
        name: file.name,
        mimeType: file.type || (solverTab === 'PDF' ? 'application/pdf' : 'image/jpeg'),
        base64: base64String,
        previewUrl
      });
      setSolverError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!hasApiKey) {
      onOpenSettings();
      return;
    }

    if (solverTab === 'TYPED' && !typedProblem.trim()) {
      setSolverError('Please enter a mathematical problem to solve.');
      return;
    }

    if ((solverTab === 'PHOTO' || solverTab === 'PDF') && !uploadedFile) {
      setSolverError(`Please upload a ${solverTab === 'PHOTO' ? 'photo' : 'PDF document'} first.`);
      return;
    }

    setIsSolving(true);
    setSolverError(null);

    try {
      const activeTopic = solverTopic.trim() || solverChapter;
      const filePayload = uploadedFile
        ? { mimeType: uploadedFile.mimeType, base64: uploadedFile.base64 }
        : undefined;

      const result = await solveMathProblem(
        apiKey,
        solverChapter,
        activeTopic,
        typedProblem,
        filePayload
      );

      const newSolution: MathSolution = {
        id: String(Date.now()),
        chapter: solverChapter,
        topic: activeTopic,
        problem: result.problem,
        solutionSteps: result.solutionSteps,
        finalAnswer: result.finalAnswer,
        source: solverTab === 'TYPED' ? 'Typed' : solverTab === 'PHOTO' ? 'Photo' : 'PDF',
        formattedDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: Date.now()
      };

      setCurrentSolution(newSolution);
      setSolutionSaved(false);
      setSolutionBookmarked(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to solve mathematical problem';
      setSolverError(msg);
    } finally {
      setIsSolving(false);
    }
  };

  const handleSaveCurrentSolution = () => {
    if (!currentSolution) return;
    onSaveMathSolutionToHistory(currentSolution);
    setSolutionSaved(true);
  };

  const handleBookmarkCurrentSolution = () => {
    if (!currentSolution) return;
    onSaveMathSolutionToBookmark(currentSolution);
    setSolutionBookmarked(true);
  };

  const handleStartMcq = () => {
    if (isGenerating) return;
    const finalTopic =
      selectedChapter === 'Other / Custom Topic' && customTopic.trim()
        ? customTopic.trim()
        : customTopic.trim() || selectedChapter;

    onStartMathQuiz(selectedChapter, finalTopic, difficulty, questionCount);
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
          <Calculator className="w-4 h-4 text-orange-600" />
          <h1 className="text-sm font-bold text-slate-900">MATH LAB</h1>
        </div>

        <button
          onClick={onOpenMathBookmarks}
          className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 p-1.5 rounded-lg hover:bg-orange-50 transition"
          title="Math Bookmarks"
        >
          <Bookmark className="w-4 h-4" />
          <span className="hidden xs:inline">Bookmarks</span>
        </button>
      </div>

      {/* Math Lab Navigation Cards (The 4 core sections requested) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveSection('MCQ_GEN')}
          className={`p-2.5 text-left rounded-xl border transition flex items-center gap-2 ${
            activeSection === 'MCQ_GEN'
              ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold ring-1 ring-orange-600 shadow-2xs'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Brain className="w-4 h-4 text-orange-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Math MCQ Generator</p>
            <p className="text-[10px] text-slate-500 truncate">Generate chapter MCQs</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('SOLVER')}
          className={`p-2.5 text-left rounded-xl border transition flex items-center gap-2 ${
            activeSection === 'SOLVER'
              ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold ring-1 ring-orange-600 shadow-2xs'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Calculator className="w-4 h-4 text-orange-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Math Solver</p>
            <p className="text-[10px] text-slate-500 truncate">Typed, Photo & PDF</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('HISTORY')}
          className={`p-2.5 text-left rounded-xl border transition flex items-center gap-2 ${
            activeSection === 'HISTORY'
              ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold ring-1 ring-orange-600 shadow-2xs'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4 text-slate-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Math History</p>
            <p className="text-[10px] text-slate-500 truncate">{mathHistory.length} solved/attempts</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenMathBookmarks}
          className="p-2.5 text-left rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-orange-50/50 hover:border-orange-300 transition flex items-center gap-2"
        >
          <Bookmark className="w-4 h-4 text-orange-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Math Bookmarks</p>
            <p className="text-[10px] text-slate-500 truncate">
              {mathMcqBookmarks.length + mathSolutionBookmarks.length} saved
            </p>
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: MATH MCQ GENERATOR */}
      {/* ======================================================== */}
      {activeSection === 'MCQ_GEN' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 text-orange-100 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Academic Mathematics MCQs</span>
            </div>
            <p className="text-xs text-white/90 mt-0.5">
              Select from standard mathematical chapters or enter your own custom topic.
            </p>
          </div>

          {/* 1. Chapter Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Select Chapter / Topic
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 font-semibold"
            >
              {MATH_CHAPTERS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Topic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Specific / Custom Topic (Optional)</span>
              <span className="text-[10px] text-slate-400">Any manual math topic</span>
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Quadratic Formula, Integration by Parts, Pythagoras Theorem..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* 2. Number of Questions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Number of Questions
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[10, 20, 30, 40, 50].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setQuestionCount(c)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    questionCount === c
                      ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Difficulty */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Difficulty Level
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Easy', 'Medium', 'Hard', 'Mixed'] as MathDifficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    difficulty === d
                      ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartMcq}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>GENERATING...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>GENERATE MATH MCQs</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: MATH SOLVER */}
      {/* ======================================================== */}
      {activeSection === 'SOLVER' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Solver Mode Tabs: Typed, Photo, PDF */}
          <div className="grid grid-cols-3 p-1 bg-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSolverTab('TYPED');
                setUploadedFile(null);
                setSolverError(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                solverTab === 'TYPED'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-800" />
              <span>Typed</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSolverTab('PHOTO');
                setUploadedFile(null);
                setSolverError(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                solverTab === 'PHOTO'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-orange-600" />
              <span>Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSolverTab('PDF');
                setUploadedFile(null);
                setSolverError(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 ${
                solverTab === 'PDF'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-purple-700" />
              <span>PDF</span>
            </button>
          </div>

          {/* Chapter Selector for Solver */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Chapter</label>
              <select
                value={solverChapter}
                onChange={(e) => setSolverChapter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
              >
                {MATH_CHAPTERS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Topic (Optional)</label>
              <input
                type="text"
                value={solverTopic}
                onChange={(e) => setSolverTopic(e.target.value)}
                placeholder="e.g. Factorization"
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Mode A: Typed Problem */}
          {solverTab === 'TYPED' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Enter Mathematical Problem
              </label>
              <textarea
                value={typedProblem}
                onChange={(e) => {
                  setTypedProblem(e.target.value);
                  setSolverError(null);
                }}
                rows={3}
                placeholder="e.g. Solve 2x² - 5x + 2 = 0"
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              {/* Sample suggestions for quick testing */}
              {sampleProblems[solverChapter] && (
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Try sample:</span>
                  {sampleProblems[solverChapter].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTypedProblem(s)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full truncate max-w-[220px]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mode B: Photo Problem */}
          {solverTab === 'PHOTO' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Upload Photo of Problem
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadedFile?.previewUrl ? (
                <div className="relative border-2 border-orange-500 rounded-xl overflow-hidden bg-slate-50 p-2 text-center">
                  <img
                    src={uploadedFile.previewUrl}
                    alt="Problem Preview"
                    className="max-h-48 mx-auto object-contain rounded-lg shadow-xs"
                  />
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="absolute top-3 right-3 p-1.5 bg-black/70 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] text-slate-600 font-semibold mt-2">{uploadedFile.name}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl bg-white hover:bg-orange-50/20 flex flex-col items-center justify-center space-y-2 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800">[ UPLOAD PHOTO ]</p>
                    <p className="text-[10px] text-slate-500">Take or upload a photo of your math problem</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Mode C: PDF Problem */}
          {solverTab === 'PDF' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Upload Mathematics PDF
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="p-4 border-2 border-purple-400 bg-purple-50/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-6 h-6 text-purple-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{uploadedFile.name}</p>
                      <p className="text-[10px] text-purple-700">PDF Ready for Mathematical Analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl bg-white hover:bg-purple-50/20 flex flex-col items-center justify-center space-y-2 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800">[ UPLOAD PDF ]</p>
                    <p className="text-[10px] text-slate-500">Upload mathematics worksheet or textbook PDF</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {solverError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{solverError}</span>
            </div>
          )}

          {/* Solve Button */}
          <div>
            <button
              type="button"
              onClick={handleSolve}
              disabled={isSolving}
              className="w-full py-3 px-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSolving ? 'Solving with Gemini AI...' : '[ SOLVE ]'}</span>
            </button>
          </div>

          {/* SOLUTION RESULT DISPLAY */}
          {currentSolution && (
            <div className="p-4 bg-white border-2 border-orange-400 rounded-2xl space-y-4 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900">
                  {currentSolution.chapter} • {currentSolution.topic}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Source: {currentSolution.source}</span>
              </div>

              {/* Problem */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Problem</p>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  <MathView text={currentSolution.problem} />
                </div>
              </div>

              {/* Step-by-Step Solution */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Step-by-Step Solution
                </p>
                {currentSolution.solutionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50/80 border border-slate-200 rounded-lg flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-900 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="text-xs text-slate-800 leading-relaxed flex-1">
                      <MathView text={step} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Answer */}
              <div className="p-3 bg-orange-50 border-2 border-orange-500 rounded-xl">
                <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Final Answer</p>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  <MathView text={currentSolution.finalAnswer} />
                </div>
              </div>

              {/* Solution Actions: SAVE SOLUTION, BOOKMARK, DOWNLOAD PDF */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={handleSaveCurrentSolution}
                  className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition flex items-center justify-center gap-1 ${
                    solutionSaved
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{solutionSaved ? 'Saved in History' : 'SAVE SOLUTION'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBookmarkCurrentSolution}
                  className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition flex items-center justify-center gap-1 ${
                    solutionBookmarked
                      ? 'bg-orange-50 border-orange-400 text-orange-900'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
                  <span>{solutionBookmarked ? 'Bookmarked' : '☆ BOOKMARK'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadMathSolutionPdf(currentSolution)}
                  className="py-2 px-2 text-[11px] font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: MATH HISTORY */}
      {/* ======================================================== */}
      {activeSection === 'HISTORY' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Solved Math Records & Attempts</span>
            {mathHistory.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClearHistory(true)}
                className="text-[11px] font-medium text-red-600 hover:text-red-700"
              >
                Clear Math History
              </button>
            )}
          </div>

          {mathHistory.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Math History Found</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Solve problems in Math Solver or practice Math MCQs to see your history records here.
              </p>
            </div>
          ) : (
            mathHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2 hover:border-orange-400 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {item.chapter}
                      </span>
                      {item.source && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {item.source}
                        </span>
                      )}
                      {item.type === 'MCQ_ATTEMPT' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                          MCQ Attempt: {item.score}/{item.questionCount}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{item.formattedDate}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">
                      {item.type === 'MCQ_ATTEMPT'
                        ? `${item.topic} (${item.percentage?.toFixed(0)}%)`
                        : item.topic}
                    </h3>
                  </div>

                  <button
                    onClick={() => onDeleteMathHistoryItem(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Problem or stats snippet */}
                {item.problem && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg line-clamp-2">
                    <MathView text={item.problem} inline />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  {item.type === 'SOLUTION' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedHistorySolution(item)}
                        className="flex-1 py-1.5 px-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Eye className="w-3 h-3" />
                        <span>VIEW SOLUTION</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (item.problem && item.solutionSteps && item.finalAnswer) {
                            onSaveMathSolutionToBookmark({
                              id: String(Date.now()),
                              chapter: item.chapter,
                              topic: item.topic,
                              problem: item.problem,
                              solutionSteps: item.solutionSteps,
                              finalAnswer: item.finalAnswer,
                              source: item.source || 'Typed',
                              formattedDate: item.formattedDate,
                              timestamp: item.timestamp
                            });
                            alert('Bookmarked to Math Bookmarks!');
                          }
                        }}
                        className="py-1.5 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                        title="Bookmark"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-orange-600" />
                        <span>BOOKMARK</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (item.problem && item.solutionSteps && item.finalAnswer) {
                            downloadMathSolutionPdf({
                              id: item.id,
                              chapter: item.chapter,
                              topic: item.topic,
                              problem: item.problem,
                              solutionSteps: item.solutionSteps,
                              finalAnswer: item.finalAnswer,
                              source: item.source || 'Typed',
                              formattedDate: item.formattedDate,
                              timestamp: item.timestamp
                            });
                          }
                        }}
                        className="py-1.5 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-orange-600" />
                        <span>PDF</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAttemptSavedMathHistory(item)}
                      className="flex-1 py-1.5 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ATTEMPT AGAIN</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: View Math History Solution */}
      {selectedHistorySolution && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn">
            <div className="p-4 bg-blue-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                  {selectedHistorySolution.chapter}
                </span>
                <h3 className="text-sm font-bold mt-1">{selectedHistorySolution.topic}</h3>
              </div>
              <button
                onClick={() => setSelectedHistorySolution(null)}
                className="p-1 rounded-full text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Problem</p>
                <div className="text-xs font-bold text-slate-900 mt-1">
                  <MathView text={selectedHistorySolution.problem} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-blue-950 uppercase">Step-by-Step Solution</p>
                {selectedHistorySolution.solutionSteps?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="text-xs text-slate-800 leading-relaxed flex-1">
                      <MathView text={step} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-orange-50 border-2 border-orange-500 rounded-xl">
                <p className="text-[10px] font-bold text-orange-700 uppercase">Final Answer</p>
                <div className="text-base font-bold text-slate-900 mt-1">
                  <MathView text={selectedHistorySolution.finalAnswer} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  if (
                    selectedHistorySolution.problem &&
                    selectedHistorySolution.solutionSteps &&
                    selectedHistorySolution.finalAnswer
                  ) {
                    downloadMathSolutionPdf({
                      id: selectedHistorySolution.id,
                      chapter: selectedHistorySolution.chapter,
                      topic: selectedHistorySolution.topic,
                      problem: selectedHistorySolution.problem,
                      solutionSteps: selectedHistorySolution.solutionSteps,
                      finalAnswer: selectedHistorySolution.finalAnswer,
                      source: selectedHistorySolution.source || 'Typed',
                      formattedDate: selectedHistorySolution.formattedDate,
                      timestamp: selectedHistorySolution.timestamp
                    });
                  }
                }}
                className="py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD PDF</span>
              </button>
              <button
                onClick={() => setSelectedHistorySolution(null)}
                className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Clear Math History */}
      {confirmClearHistory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Clear Math History?</h4>
              <p className="text-xs text-slate-500">
                This will delete all solved math records. Your General Quiz History and Bookmarks will NOT be deleted.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearHistory(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearMathHistory();
                  setConfirmClearHistory(false);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
