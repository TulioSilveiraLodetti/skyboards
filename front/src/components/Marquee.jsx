export default function Marquee({ items, className = "" }) {
  const list = [...items, ...items];
  return (
    <div className={`relative flex overflow-hidden ${className}`}>
      <div className="flex min-w-full shrink-0 animate-marquee items-center">
        {list.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="px-6 py-4 text-2xl font-black uppercase tracking-tight text-bone/90 sm:text-3xl">
              {t}
            </span>
            <span className="text-volt">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
