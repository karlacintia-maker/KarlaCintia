export default function Toast({ toast, onAction }) {
  if (!toast) return null;
  return (
    <div className="toast">
      <span>{toast.msg}</span>
      {toast.actionLabel && (
        <button onClick={onAction}>{toast.actionLabel}</button>
      )}
    </div>
  );
}
