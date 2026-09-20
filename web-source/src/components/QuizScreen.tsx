import React, { useState } from 'react';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Bookmark,
  Star
} from 'lucide-react';
import { QuizQuestion, UserAnswer, QuizMode, QuestionType } from '../types';
import MathView from './MathView';

interface QuizScreenProps {
  topic: string;
  questionType: QuestionType;
  quizMode: QuizMode;
  questions: QuizQuestion[];
  currentIndex: number;
  userAnswers: Record<number, UserAnswer>;
  remainingSeconds: number;
  isMathQuiz?: boolean;
  isBookmarked?: boolean;
  onToggleBookmarkCurrent?: () => void;
  onSelectOption: (qId: number, option: string) => void;
  onEnterText: (qId: number, text: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onExit: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  topic,
  questionType,
  quizMode,
  questions,
  currentIndex,
  userAnswers,
  remainingSeconds,
  isMathQuiz = false,
  isBookmarked = false,
  onToggleBookmarkCurrent,
  onSelectOption,
  onEnterText,
  onNext,
  onPrevious,
  onSubmit,
  onExit
}) => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-slate-500">
        No active quiz found.
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];
  const total = questions.length;
  const currentAns = userAnswers[currentQ.id];
  const progressPercent = ((currentIndex + 1) / total) * 100;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = quizMode === 'TIMED' && remainingSeconds < 120;
  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = total - answeredCount;

  return (
    <div className="flex-1 flex flex-col justify-between p-4 relative overflow-y-auto">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2 max-w-[200px]">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              title="Exit Quiz"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                {isMathQuiz ? 'Math Lab' : 'General Quiz'}
              </span>
              <h2 className="font-bold text-xs text-slate-900 truncate mt-0.5">{topic}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button for the current question */}
            {onToggleBookmarkCurrent && (
              <button
                type="button"
                onClick={onToggleBookmarkCurrent}
                className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  isBookmarked
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isBookmarked ? 'Bookmarked' : 'Bookmark this question'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-orange-500 text-orange-500' : ''}`} />
                <span className="text-[11px]">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            )}

            {quizMode === 'TIMED' ? (
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isLowTime ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(remainingSeconds)}</span>
              </div>
            ) : (
              <span className="text-[11px] px-2 py-0.5 bg-slate-200 text-slate-700 font-semibold rounded-full">
                Untimed
              </span>
            )}
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isMathQuiz ? 'bg-orange-600' : 'bg-blue-900'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Counter */}
        <div className="flex items-center justify-between mt-2.5 text-xs">
          <span className="font-semibold text-slate-800">
            Question {currentIndex + 1} of {total}
          </span>
          <span
            className={`font-medium text-[11px] ${
              currentAns?.selectedOption || currentAns?.textAnswer ? 'text-emerald-700 font-bold' : 'text-slate-400'
            }`}
          >
            {currentAns?.selectedOption || currentAns?.textAnswer ? '✓ Answered' : 'Unanswered'}
          </span>
        </div>

        {/* Question Card */}
        <div className="mt-2.5 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          {currentQ.chapter && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900">
              {currentQ.chapter}
            </span>
          )}
          <MathView
            text={currentQ.question}
            className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed"
          />
        </div>

        {/* Answers Section */}
        <div className="mt-3.5 space-y-2">
          {questionType === 'MCQ' ? (
            currentQ.options.map((opt, idx) => {
              const isSelected = currentAns?.selectedOption === opt;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectOption(currentQ.id, opt)}
                  className={`w-full p-2.5 sm:p-3 text-left rounded-xl border text-xs leading-normal flex items-start gap-2.5 transition ${
                    isSelected
                      ? isMathQuiz
                        ? 'border-orange-600 bg-orange-50/80 text-orange-950 font-semibold ring-1 ring-orange-600'
                        : 'border-blue-900 bg-blue-50/80 text-blue-950 font-semibold ring-1 ring-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                      isSelected
                        ? isMathQuiz
                          ? 'border-orange-600 bg-orange-600'
                          : 'border-blue-900 bg-blue-900'
                        : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="font-medium flex-1 overflow-x-auto">
                    <MathView text={opt} inline />
                  </span>
                </button>
              );
            })
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Your Answer:</label>
              <textarea
                value={currentAns?.textAnswer || ''}
                onChange={(e) => onEnterText(currentQ.id, e.target.value)}
                placeholder="Type your short answer here..."
                rows={3}
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              <p className="text-[11px] text-slate-400">Keep it short (1-5 words or direct key term).</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-3 border-t border-slate-200 space-y-2 mt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="flex-1 py-2.5 px-3 bg-white border border-slate-300 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 hover:bg-slate-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentIndex < total - 1 ? (
            <button
              type="button"
              onClick={onNext}
              className={`flex-1 py-2.5 px-3 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition ${
                isMathQuiz ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-900 hover:bg-blue-800'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="flex-1 py-2.5 px-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 hover:bg-emerald-700 transition shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Submit</span>
            </button>
          )}
        </div>

        {currentIndex < total - 1 && (
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="w-full py-1 text-center text-xs text-slate-500 hover:text-slate-800 transition"
          >
            Submit Early ({answeredCount}/{total} answered)
          </button>
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-slate-900">Exit Quiz?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Your current quiz progress will be cancelled and will not be recorded in history.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Continue Quiz
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false);
                  onExit();
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Exit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {showSubmitModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Submit Quiz?</h3>
            <p className="text-xs text-slate-600 mb-4">
              {unansweredCount > 0
                ? `You have ${unansweredCount} unanswered question(s). Finish now to calculate your score?`
                : 'All questions have been answered. Ready to see your exam results and review?'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Review More
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  onSubmit();
                }}
                className={`px-3.5 py-1.5 text-xs font-bold text-white rounded-lg ${
                  isMathQuiz ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-900 hover:bg-blue-800'
                }`}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
