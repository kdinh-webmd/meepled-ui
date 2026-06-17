interface StarsProps { value?: number; }
export default function Stars({ value = 0 }: StarsProps) {
  const full = Math.round(value);
  return (
    <span className="stars" title={`${value}/5`}>
      {'★'.repeat(full)}
      <span className="off">{'★'.repeat(5 - full)}</span>
    </span>
  );
}
