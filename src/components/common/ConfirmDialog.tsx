export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <div className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(event) => event.stopPropagation()}>
        <h3 id="confirm-title">{title}</h3>
        <p className="muted">{message}</p>
        <div className="action-row">
          <button className="btn" onClick={onConfirm}>{confirmLabel || ""}</button>
          <button className="btn-ghost" onClick={onCancel}>{cancelLabel || ""}</button>
        </div>
      </div>
    </div>
  );
}
