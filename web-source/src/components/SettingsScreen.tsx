import React, { useState } from 'react';
import { ArrowLeft, Key, Eye, EyeOff, Save, Trash2, CheckCircle, AlertCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import { testGeminiApiKey } from '../services/geminiService';

interface SettingsScreenProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onClearApiKey: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  apiKey,
  onSaveApiKey,
  onClearApiKey,
  onBack
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setToastMessage('API key saved locally on device.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClear = () => {
    setInputKey('');
    onClearApiKey();
    setTestResult(null);
    setToastMessage('API key cleared.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTest = async () => {
    if (!inputKey.trim()) {
      setTestResult({ success: false, message: 'Please enter your Gemini API key.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testGeminiApiKey(inputKey.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-base text-slate-900">Settings</h2>
      </div>

      {toastMessage && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold rounded-xl text-center">
          {toastMessage}
        </div>
      )}

      {/* Info card */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
        <Key className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold text-blue-950">Gemini API Key</p>
          <p className="text-blue-800 mt-0.5 leading-relaxed">
            Your API key is stored locally on this device and is used to generate quiz questions dynamically.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Enter Your Gemini API Key
        </label>

        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={inputKey}
            onChange={(e) => {
              setInputKey(e.target.value);
              setTestResult(null);
            }}
            placeholder="AIzaSy..."
            className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-green-700" />
          <span>Stored securely in Android SharedPreferences / EncryptedPrefs.</span>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={!inputKey.trim()}
            className="py-2.5 px-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Key</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="py-2.5 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear Key</span>
          </button>
        </div>

        {/* Test API Key Button */}
        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting}
          className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
        >
          {isTesting ? (
            <span>Testing Connection...</span>
          ) : (
            <span>Test API Key Connection</span>
          )}
        </button>

        {/* Test Result feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border flex items-start gap-2 text-xs font-medium ${
              testResult.success
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Guide to Get Key */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2 text-xs">
        <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
          <span>How to Get a Free Gemini API Key</span>
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
          <li>
            Open Google AI Studio in your browser:
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-blue-900 font-semibold inline-flex items-center gap-0.5 ml-1 underline"
            >
              aistudio.google.com <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>Sign in with your Google account.</li>
          <li>Click <strong className="text-slate-800">&quot;Get API key&quot;</strong> in the navigation.</li>
          <li>Click <strong className="text-slate-800">&quot;Create API key in new project&quot;</strong>.</li>
          <li>Copy the generated string, paste it in the box above, and tap <strong>Save Key</strong>.</li>
        </ol>
      </div>
    </div>
  );
};
