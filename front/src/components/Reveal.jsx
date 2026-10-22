import { useEffect, useRef } from "react";

/**
 * Revela o conteúdo quando entra na viewport.
 * Respeita prefers-reduced-motion via CSS (.reveal fica visível).
 */
export default function Reveal({ as: Tag = "div", delay = 0, className = "", children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add("is-in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref}
      className={`reveal transition-all duration-700 ease-out ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
