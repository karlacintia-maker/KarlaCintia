export function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12">
      <path d="M1.5 6.2l3 3 6-6.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CaretIcon({ open }) {
  return (
    <svg className={`caret ${open ? 'open' : ''}`} width="9" height="9" viewBox="0 0 8 8">
      <path d="M2 0l4 4-4 4z" fill="currentColor" />
    </svg>
  );
}
