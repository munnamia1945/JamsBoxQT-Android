import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  PlusCircle,
  History,
  Clock,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { QuizResult, QuizQuestion } from '../types';
import MathView from './MathView';

interface ResultScreenProps {
  result: QuizResult;
  isQuizBookmarked?: boolean;
  onRetry: () => void;
  onNewQuiz: () => void;
  onOpenHistory: () => void;
  onBookmarkQuiz?: () => void;
  onToggleBookmarkQuestion?: (q: QuizQuestion) => void;
  isQuestionBookmarked?: (q: QuizQuestion) => boolean;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  isQuizBookmarked = false,
  onRetry,
  onNewQuiz,
  onOpenHistory,
  onBookmarkQuiz,
  onToggleBookmarkQuestion,
  isQuestionBookmarked
}) => {
  const percentage = Math.round(result.percentage);

  const getScoreTheme = () => {
    if (percentage >= 80) return { bg: 'bg-green-50 text-green-700 border-green-200', text: 'text-green-700', label: 'Excellent' };
    if (percentage >= 50) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', label: 'Good Practice' };
    return { bg: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700', label: 'Needs Practice' };
  };

  const theme = getScoreTheme();

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Top Header */}
      <div className="text-center pt-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {result.isMathQuiz ? 'Math Lab Examination' : 'General Academic Examination'}
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-1">Quiz Completed!</h2>
        <p className="text-xs text-slate-600 mt-0.5 font-medium">{result.topic}</p>
        <span className="inline-block mt-1 text-[11px] px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-full font-medium">
          {result.questionType === 'MCQ' ? 'MCQ Quiz' : 'Very Short Questions'} • {result.mode === 'TIMED' ? 'Timed' : 'Untimed'}
          {result.difficulty && ` • ${result.difficulty}`}
        </span>
      </div>

      {/* Score Summary Card */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
        <div className={`mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 ${theme.bg}`}>
          <span className={`text-2xl font-black ${theme.text}`}>{percentage}%</span>
          <span className="text-[11px] font-semibold text-slate-600">
            {result.score}/{result.totalQuestions}
          </span>
        </div>
        <p className={`text-xs font-bold mt-2 ${theme.text}`}>{theme.label}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
          <div className="p-1.5 bg-green-50 rounded-lg">
            <p className="text-xs font-black text-green-700">{result.correctCount}</p>
            <p className="text-[10px] text-green-800">Correct</p>
          </div>
          <div className="p-1.5 bg-red-50 rounded-lg">
            <p className="text-xs font-black text-red-700">{result.wrongCount}</p>
            <p className="text-[10px] text-red-800">Wrong</p>
          </div>
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <p className="text-xs font-black text-slate-700">{result.unansweredCount}</p>
            <p className="text-[10px] text-slate-600">Skipped</p>
          </div>
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <p className="text-xs font-black text-blue-900">{formatSeconds(result.timeTakenSeconds)}</p>
            <p className="text-[10px] text-blue-800">Time</p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Retry, Bookmark Quiz, New Quiz */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRetry}
            className={`py-2.5 px-3 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm ${
              result.isMathQuiz ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Quiz</span>
          </button>

          {onBookmarkQuiz && (
            <button
              onClick={onBookmarkQuiz}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition border ${
                isQuizBookmarked
                  ? 'bg-orange-50 border-orange-300 text-orange-900'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isQuizBookmarked ? 'fill-orange-500 text-orange-500' : 'text-orange-600'}`} />
              <span>{isQuizBookmarked ? 'Quiz Bookmarked' : '☆ Bookmark Quiz'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onNewQuiz}
            className="py-2.5 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Quiz</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="py-2.5 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>View in History</span>
          </button>
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Question-by-Question Review
        </h3>

        <div className="space-y-2.5">
          {result.questions.map((q, idx) => {
            const ans = result.userAnswers[q.id];
            const isAnswered = ans && (ans.selectedOption || ans.textAnswer);
            const isCorrect = ans?.isCorrect;
            const bookmarked = isQuestionBookmarked ? isQuestionBookmarked(q) : false;

            return (
              <div
                key={q.id}
                className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950">Question {idx + 1}</span>

                  <div className="flex items-center gap-2">
                    {onToggleBookmarkQuestion && (
                      <button
                        onClick={() => onToggleBookmarkQuestion(q)}
                        className={`p-1 rounded text-[11px] flex items-center gap-1 ${
                          bookmarked ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={bookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-orange-500 text-orange-500' : ''}`} />
                      </button>
                    )}

                    <div className="flex items-center gap-1 font-semibold">
                      {isCorrect ? (
                        <span className="text-green-700 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : isAnswered ? (
                        <span className="text-red-700 flex items-center gap-1 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5" /> Unanswered
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Text */}
                <MathView text={q.question} className="text-slate-900 font-semibold leading-relaxed" />

                {/* User Answer */}
                <div
                  className={`p-2 rounded-lg ${
                    !isAnswered
                      ? 'bg-slate-100 text-slate-600'
                      : isCorrect
                      ? 'bg-green-50 text-green-900 border border-green-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  <p className="text-[10px] font-medium opacity-75">Your Answer:</p>
                  <div className="font-semibold text-xs mt-0.5">
                    <MathView
                      text={
                        result.questionType === 'MCQ'
                          ? ans?.selectedOption || 'Not answered'
                          : ans?.textAnswer || 'Not answered'
                      }
                      inline
                    />
                  </div>
                </div>

                {/* Correct Answer if wrong */}
                {!isCorrect && (
                  <div className="p-2 rounded-lg bg-green-50 text-green-900 border border-green-200">
                    <p className="text-[10px] font-medium text-green-700">Correct Answer:</p>
                    <div className="font-bold text-xs mt-0.5 text-green-900">
                      <MathView text={q.correctAnswer} inline />
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="pt-1 text-[11px] text-slate-600 leading-normal border-t border-slate-100">
                    <span className="font-bold text-slate-700">Explanation: </span>
                    <MathView text={q.explanation} className="inline" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
