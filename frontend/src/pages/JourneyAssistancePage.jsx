import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  LifeBuoy, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Clock, 
  Info,
  ShieldAlert
} from 'lucide-react';

const CATEGORIES = [
  { value: 'SEAT_CONFLICT', label: 'Seat Conflict / Double Booking' },
  { value: 'BERTH_DISPUTE', label: 'Berth Allocation Dispute' },
  { value: 'ACCESSIBILITY_NEED', label: 'Accessibility / Elderly Support' },
  { value: 'LOST_ITEM', label: 'Lost / Misplaced Item' },
  { value: 'GENERAL_ASSISTANCE', label: 'General Journey Assistance' },
];

export default function JourneyAssistancePage() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form state
  const [category, setCategory] = useState('SEAT_CONFLICT');
  const [description, setDescription] = useState('');

  // AI Draft feature state
  const [aiNote, setAiNote] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDraftReceived, setAiDraftReceived] = useState(null);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getAssistanceReports();
      setReports(res.reports || []);
    } catch (err) {
      console.error('Failed to load assistance reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Generate structured AI Draft
  const handleGenerateAiDraft = async () => {
    if (!aiNote.trim()) return;
    try {
      setAiLoading(true);
      const res = await api.generateAiDraft(aiNote.trim());
      if (res.draft) {
        setAiDraftReceived(res.draft);
        setCategory(res.draft.category);
        setDescription(res.draft.description);
      }
    } catch (err) {
      alert(`AI Draft helper: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Assistance Report
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!description.trim() || description.trim().length < 5) {
      setSubmitError('Please provide a descriptive explanation (minimum 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      await api.createAssistanceReport({
        category,
        description: description.trim(),
      });
      setSubmitSuccess(true);
      setDescription('');
      setAiNote('');
      setAiDraftReceived(null);
      await loadReports();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit assistance report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-teal-600" />
          Journey Assistance & Incident Reports
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Log journey-related issues, dispute clarifications, or accessibility needs for peer passenger coordination.
        </p>
      </div>

      {/* Official Railway Boundary Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
        <div className="font-semibold flex items-center gap-1.5 text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          Prototype Integrity Notice
        </div>
        <p className="leading-relaxed">
          Assistance reports are logged within RailMatte for passenger coordination and internal auditing. This does <strong>not</strong> file an official Indian Railways RailMadad complaint or dispatch train staff. For security emergencies, always contact official railway police or railway staff directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Submit Form (2 columns on md) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">
              Submit New Assistance Report
            </h2>

            {submitSuccess && (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Assistance report logged successfully with status SUBMITTED.</span>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* AI Assistant Section */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Optional AI Report Drafting Assistant</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Type rough notes below and our AI assistant will format a structured, objective report draft and classify the issue.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. Fellow passenger refuses to vacate lower berth allocated on ticket"
                  value={aiNote}
                  onChange={(e) => setAiNote(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none bg-white min-h-[40px]"
                />
                <button
                  type="button"
                  disabled={aiLoading || !aiNote.trim()}
                  onClick={handleGenerateAiDraft}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0 min-h-[40px]"
                >
                  {aiLoading ? 'Drafting...' : 'Generate Draft'}
                </button>
              </div>

              {aiDraftReceived && (
                <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 text-xs space-y-1">
                  <div className="font-semibold text-teal-900 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    AI Suggestion Applied to Form Below:
                  </div>
                  <div className="text-teal-800 text-[11px]">
                    <strong>Recommended Action:</strong> {aiDraftReceived.recommendedAction}
                  </div>
                  <div className="text-[10px] text-slate-500 italic">
                    Review and edit the fields below before submitting.
                  </div>
                </div>
              )}
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Issue Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder="Describe the journey circumstance clearly and objectively..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none"
                />
                <div className="text-[10px] text-slate-400 text-right mt-0.5">
                  {description.length}/1000 characters
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting...' : 'Log Assistance Report'}
              </button>
            </form>
          </div>
        </div>

        {/* Previous Reports History (1 column on md) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Your Reported Logs ({reports.length})
          </h2>

          {loading ? (
            <div className="text-xs text-slate-500">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
              No reports filed yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {rep.category.replace('_', ' ')}
                    </span>
                    <StatusBadge status={rep.status} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rep.description}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                    <span>ID: {rep.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
