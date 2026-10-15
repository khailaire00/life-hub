import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { AppData } from '../types';
import {
  exportAllDataAsJSON,
  importDataFromJSON,
  pushAllDataToCloud,
  fetchAllDataFromCloud
} from '../lib/storage';
import {
  getSupabaseCredentials,
  saveCustomSupabaseCredentials,
  clearCustomSupabaseCredentials,
  testSupabaseConnection,
  SUPABASE_SQL_SNIPPET
} from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onDataUpdated: (newData: AppData) => void;
}

export const CloudSyncModal: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  onDataUpdated,
}) => {
  const credentials = getSupabaseCredentials();
  const [urlInput, setUrlInput] = useState(credentials.url || '');
  const [keyInput, setKeyInput] = useState(credentials.key || '');
  const [testStatus, setTestStatus] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({ status: 'idle' });
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [showJsonPaste, setShowJsonPaste] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'supabase' | 'sql'>('sync');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestStatus({ status: 'error', message: 'Please provide both Supabase URL and Anon Key.' });
      return;
    }
    setTestStatus({ status: 'testing' });
    const res = await testSupabaseConnection(urlInput.trim(), keyInput.trim());
    if (res.success) {
      saveCustomSupabaseCredentials(urlInput.trim(), keyInput.trim());
      setTestStatus({ status: 'success', message: 'Successfully connected to Supabase project!' });
    } else {
      setTestStatus({ status: 'error', message: res.error || 'Connection failed' });
    }
  };

  const handlePushToCloud = async () => {
    setSyncStatus('Pushing workspace state to Supabase tables...');
    const res = await pushAllDataToCloud(data);
    if (res.success) {
      setSyncStatus('Workspace data successfully synced to Supabase tables!');
      setTimeout(() => setSyncStatus(null), 3000);
    } else {
      setSyncStatus(`Sync error: ${res.error}. Did you run the SQL schema in Supabase?`);
    }
  };

  const handlePullFromCloud = async () => {
    setSyncStatus('Fetching remote data from Supabase...');
    const res = await fetchAllDataFromCloud();
    if (res.synced) {
      onDataUpdated(res.data);
      setSyncStatus('Successfully pulled and updated data from Supabase!');
      setTimeout(() => setSyncStatus(null), 3000);
    } else {
      setSyncStatus(`Sync warning: ${res.error || 'Using local storage data'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJSON(content);
      if (res.success && res.data) {
        onDataUpdated(res.data);
        setSyncStatus('Backup file imported successfully!');
        setTimeout(() => setSyncStatus(null), 3000);
      } else {
        alert(res.error || 'Failed to import JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!jsonInput.trim()) return;
    const res = importDataFromJSON(jsonInput);
    if (res.success && res.data) {
      onDataUpdated(res.data);
      setJsonInput('');
      setShowJsonPaste(false);
      setSyncStatus('Data imported from JSON string!');
      setTimeout(() => setSyncStatus(null), 3000);
    } else {
      alert(res.error || 'Invalid JSON format');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const isConnected = !!credentials.url && !!credentials.key;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[var(--text-main)] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">Data Persistence & Cloud Sync</h2>
              <p className="text-xs text-[var(--text-muted)]">Seamless bridge across Safari Mac, iPhone & Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[var(--border-subtle)] bg-[var(--bg-muted)]/30">
          <button
            onClick={() => setActiveTab('sync')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Manual Backup & Sync
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Supabase Connection
            {isConnected ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="Local Mode" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            SQL Schema Snippet
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {syncStatus && (
            <div className="p-3 text-xs rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* TAB 1: Manual Backup & Sync */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-main)]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instant Cross-Device Data Bridge (No Setup Required)</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Export your entire workspace to a JSON file on your MacBook, and import it on your iPhone Safari browser (or AirDrop it) to keep all 6 tabs perfectly in sync instantly without requiring any database setup.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Download className="w-4 h-4 text-[var(--accent)]" />
                      Export All Data (JSON)
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Download complete snapshot of tasks, finances, notes, encrypted vault, habits, and meal plans.
                    </p>
                  </div>
                  <button
                    onClick={() => exportAllDataAsJSON(data)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Workspace (.JSON)
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[var(--accent)]" />
                      Import Data (JSON)
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Restore from backup or import exported data from your other browser/device.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      Choose File to Import
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => setShowJsonPaste(!showJsonPaste)}
                      className="w-full text-center text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
                    >
                      {showJsonPaste ? 'Hide paste input' : 'Or paste raw JSON directly'}
                    </button>
                  </div>
                </div>
              </div>

              {showJsonPaste && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                  <label className="text-xs font-medium text-[var(--text-muted)]">Paste JSON Data String:</label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={4}
                    placeholder="Paste the exported JSON data content here..."
                    className="w-full text-xs font-mono p-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    onClick={handlePasteImport}
                    disabled={!jsonInput.trim()}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] disabled:opacity-50"
                  >
                    Confirm Import
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Supabase Connection */}
          {activeTab === 'supabase' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-xs font-semibold">
                      {isConnected ? 'Supabase Connected' : 'Local Storage Fallback Mode'}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {isConnected
                        ? `Using credentials from ${credentials.source === 'env' ? 'Environment Variables' : 'Local Config'}`
                        : 'Operating safely offline using browser LocalStorage. Configure below to enable cloud sync.'}
                    </p>
                  </div>
                </div>
                {isConnected && credentials.source === 'storage' && (
                  <button
                    onClick={() => {
                      clearCustomSupabaseCredentials();
                      setUrlInput('');
                      setKeyInput('');
                      setTestStatus({ status: 'idle' });
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-muted)]">Supabase Project URL</label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full text-xs p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--text-muted)]">Supabase Anon Public API Key</label>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full text-xs p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] focus:outline-none focus:border-[var(--accent)] font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus.status === 'testing'}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {testStatus.status === 'testing' ? 'Testing...' : 'Save & Connect to Supabase'}
                  </button>
                </div>

                {testStatus.status === 'success' && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {testStatus.message}
                  </p>
                )}
                {testStatus.status === 'error' && (
                  <p className="text-xs text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {testStatus.message}
                  </p>
                )}
              </div>

              {isConnected && (
                <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                  <h4 className="text-xs font-semibold text-[var(--text-main)]">Cloud Sync Operations</h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePushToCloud}
                      className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Push All Data to Supabase
                    </button>
                    <button
                      onClick={handlePullFromCloud}
                      className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Pull Remote Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SQL Schema Snippet */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xs">Supabase Table Schema Script</h3>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Paste this into the Supabase SQL Editor and click "Run" to initialize all 12 tables for all 6 tabs.
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-90 transition-opacity"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto max-h-64 border border-neutral-800">
                  {SUPABASE_SQL_SNIPPET}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)]">
            Life Hub Workspace v1.0 · Centralized State Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
