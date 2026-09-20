import React, { useState } from 'react';
import { ArrowLeft, Trash2, History, ChevronRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { QuizHistoryItem } from '../types';

interface HistoryScreenProps {
  historyList: QuizHistoryItem[];
  onBack: () => void;
  onSelectItem: (item: QuizHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onResetHistory: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  historyList,
  onBack,
  onSelectItem,
  onDeleteItem,
  onResetHistory
}) => {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col p-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-base text-slate-900">Quiz History</h2>
        </div>

        {/* Reset History button (only visible when history exists) */}
        {historyList.length > 0 && (
          <button
            onClick={() => setShowResetDialog(true)}
            className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 flex items-center gap-1.5 transition"
            title="Reset History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset History</span>
          </button>
        )}
      </div>

      {/* Success banner after reset */}
      {successBanner && (
        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* History List or Empty state */}
      {historyList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <p className="font-bold text-sm text-slate-800">No quiz history yet.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
            Complete a practice quiz on the Home screen to view your performance history here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2.5 pt-3">
          {historyList.map((item) => {
            const pct = Math.round(item.percentage);
            const badgeColor =
              pct >= 80 ? 'text-green-700 bg-green-50' : pct >= 50 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50';

            return (
              <div
                key={item.id}
                className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs hover:border-blue-400 transition"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectItem(item)}
                >
                  <h3 className="font-bold text-xs text-slate-900 leading-snug">{item.topic}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.questionType} • {item.mode}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.totalQuestions} Qs • {item.timeTakenFormatted} • {item.formattedDate}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${badgeColor}`}>
                    {pct}%
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(item.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ChevronRight
                    onClick={() => onSelectItem(item)}
                    className="w-4 h-4 text-slate-400 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reset History Confirmation Modal */}
      {showResetDialog && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1.5">Reset Quiz History?</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              This will permanently delete all saved quiz history. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetDialog(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetHistory();
                  setShowResetDialog(false);
                  setSuccessBanner('Quiz history has been cleared.');
                  setTimeout(() => setSuccessBanner(null), 4000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition"
              >
                Reset History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Item Confirmation Modal */}
      {deleteTargetId && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Delete Record?</h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to remove this practice attempt from your local history?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteItem(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
