import React from 'react';
import { ArrowLeft, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { QuizHistoryItem } from '../types';
import MathView from './MathView';

interface HistoryDetailScreenProps {
  item: QuizHistoryItem;
  onBack: () => void;
}

export const HistoryDetailScreen: React.FC<HistoryDetailScreenProps> = ({ item, onBack }) => {
  const percentage = Math.round(item.percentage);
  const isMcq = item.questionType.includes('MCQ');

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="truncate">
          <h2 className="font-bold text-sm text-slate-900 truncate">{item.topic}</h2>
          <p className="text-[10px] text-slate-500">{item.formattedDate}</p>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">Score Summary</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.questionType} • {item.mode}
            </p>
            <p className="text-xs text-slate-500">Duration: {item.timeTakenFormatted}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-blue-900">{percentage}%</span>
            <p className="text-[10px] text-slate-500 font-semibold">{item.score}/{item.totalQuestions} Correct</p>
          </div>
        </div>
      </div>

      {/* Question Details */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Saved Questions ({item.questions.length})
        </h3>

        <div className="space-y-2.5">
          {item.questions.map((q, idx) => {
            const ans = item.userAnswers[q.id];
            const isAnswered = ans && (ans.selectedOption || ans.textAnswer);
            const isCorrect = ans?.isCorrect;

            return (
              <div
                key={q.id}
                className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">Q{idx + 1}</span>
                  {isCorrect ? (
                    <span className="text-green-700 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : isAnswered ? (
                    <span className="text-red-700 flex items-center gap-1 font-semibold text-[11px]">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1 font-semibold text-[11px]">
                      <HelpCircle className="w-3.5 h-3.5" /> Unanswered
                    </span>
                  )}
                </div>

                <div className="font-semibold text-slate-900 leading-snug">
                  <MathView text={q.question} />
                </div>

                <div className={`p-2 rounded-lg ${isCorrect ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                  <p className="text-[10px] font-medium opacity-75">Your Answer:</p>
                  <div className="font-semibold text-xs mt-0.5">
                    <MathView text={isMcq ? ans?.selectedOption || 'None' : ans?.textAnswer || 'None'} inline />
                  </div>
                </div>

                {!isCorrect && (
                  <div className="p-2 rounded-lg bg-green-50 text-green-900">
                    <p className="text-[10px] font-medium text-green-700">Correct Answer:</p>
                    <div className="font-bold text-xs mt-0.5 text-green-900">
                      <MathView text={q.correctAnswer} inline />
                    </div>
                  </div>
                )}

                {q.explanation && (
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
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
