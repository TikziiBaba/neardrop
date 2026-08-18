import React from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { TransferProgress } from '../../types';
import { useTransferStore } from '../../stores/transferStore';
import { formatBytes, formatSpeed, formatEta } from '../../utils/format';
import { Badge } from '../common/Badge';

interface TransferCardProps {
  progress: TransferProgress;
}

export const TransferCard: React.FC<TransferCardProps> = ({ progress }) => {
  const { cancelTransfer } = useTransferStore();

  const isSending = progress.direction === 'send';
  const percent =
    progress.total_bytes > 0
      ? Math.min(
          100,
          Math.round((progress.transferred_bytes / progress.total_bytes) * 100)
        )
      : 0;

  const isTransferring = progress.status === 'transferring';
  const isWaiting = progress.status === 'waiting_for_acceptance';
  const isCompleted = progress.status === 'completed';
  const isFailed = progress.status === 'failed' || progress.status === 'rejected';

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header with direction, peer name, status badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isSending
                ? 'bg-sky-500/10 text-sky-500'
                : 'bg-emerald-500/10 text-emerald-500'
            }`}
          >
            {isSending ? (
              <ArrowUpRight className="w-5 h-5" />
            ) : (
              <ArrowDownLeft className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {isSending ? 'Sending to' : 'Receiving from'} {progress.peer_device_name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {progress.current_file_name || `${progress.total_files} file(s)`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </Badge>
          )}

          {isFailed && (
            <Badge variant="danger" className="gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{progress.status}</span>
            </Badge>
          )}

          {isWaiting && (
            <Badge variant="warning" className="gap-1">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Waiting for accept</span>
            </Badge>
          )}

          {isTransferring && (
            <Badge variant="info" className="gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>{percent}%</span>
            </Badge>
          )}

          {/* Cancel button */}
          {(isTransferring || isWaiting) && (
            <button
              onClick={() => cancelTransfer(progress.transfer_id)}
              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cancel Transfer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              isCompleted
                ? 'bg-emerald-500'
                : isFailed
                ? 'bg-rose-500'
                : 'bg-sky-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {formatBytes(progress.transferred_bytes)} / {formatBytes(progress.total_bytes)}
          </span>

          {isTransferring && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-sky-600 dark:text-sky-400 font-medium">
                {formatSpeed(progress.speed_bytes_per_sec)}
              </span>
              <span>ETA: {formatEta(progress.eta_seconds)}</span>
            </div>
          )}
        </div>
      </div>

      {progress.error_message && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-800/50">
          {progress.error_message}
        </div>
      )}
    </div>
  );
};
