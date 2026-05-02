'use client';

/**
 * Eksport/import af progress + valgfri elev-navn.
 *
 * Vises øverst på dashboardet. Diskret men tilgængelig.
 */

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { eksporterProgress, importerProgress } from '@/lib/progress-io';
import { cn } from '@/lib/utils';

export function SaveActions() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    besked: string;
  } | null>(null);

  const handleEksport = () => {
    const state = useStore.getState();
    eksporterProgress(state);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importerProgress(file);
    setFeedback({
      type: result.success ? 'success' : 'error',
      besked: result.besked,
    });

    // Reset input så samme fil kan vælges igen
    e.target.value = '';

    // Auto-skjul feedback efter 4 sek
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleImportClick}
          title="Importér status fra fil"
          aria-label="Importér status"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white',
            'text-slate-500',
            'transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
          )}
        >
          <Upload className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={handleEksport}
          title="Eksportér status til fil"
          aria-label="Eksportér status"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white',
            'text-slate-500',
            'transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
          )}
        >
          <Download className="h-4 w-4" aria-hidden />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Vælg status-fil at importere"
        />
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium',
              feedback.type === 'success'
                ? 'bg-status-gron/10 text-status-gron'
                : 'bg-status-rod/10 text-status-rod',
            )}
            role="status"
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" aria-hidden />
            )}
            {feedback.besked}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Inline navne-input. Tom = placeholder. Skift af navn gemmes ved blur.
 */
export function NameInput() {
  const elevNavn = useStore((s) => s.elevNavn);
  const sætElevNavn = useStore((s) => s.sætElevNavn);
  const [draft, setDraft] = useState(elevNavn ?? '');

  // Hold draft synkroniseret hvis navnet ændres udefra (fx import)
  // Brug et ref-pattern eller bare oversv\rive ved focus i stedet:
  const handleFocus = () => setDraft(elevNavn ?? '');
  const handleBlur = () => {
    const trimmed = draft.trim();
    sætElevNavn(trimmed === '' ? null : trimmed);
  };

  return (
    <input
      type="text"
      value={draft}
      onFocus={handleFocus}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      placeholder="Skriv dit navn"
      className={cn(
        'bg-transparent font-display text-2xl font-bold tracking-tight',
        'text-slate-900 placeholder:text-slate-300',
        'border-b-2 border-transparent focus:border-slate-900 focus:outline-none',
        'transition-colors',
      )}
      maxLength={32}
      autoComplete="off"
      spellCheck={false}
    />
  );
}
