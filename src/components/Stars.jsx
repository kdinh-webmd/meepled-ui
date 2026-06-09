// Renders a 1–5 star rating (rounds to nearest whole star).
export default function Stars({ value = 0 }) {
  const full = Math.round(value);
  return (
    <span className="stars" title={`${value}/5`}>
      {'★'.repeat(full)}
      <span className="off">{'★'.repeat(5 - full)}</span>
    </span>
  );
}
