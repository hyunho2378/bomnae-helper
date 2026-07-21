// 라인 카드 3장 그리드(1→2→3열) · IA §2.1.4, COMPONENTS B.
// 카드 리빌 · PATTERNS §8 그대로: IntersectionObserver 1회 → opacity 0→1 + scale 0.96→1.0
// (scale 화이트리스트 2/2), 240ms ease, stagger 60ms(최대 4개 지연), reduced-motion 즉시 표시.
import { useEffect, useRef, useState } from 'react';
import { motion } from '../../tokens';
import Skeleton from '../ui/Skeleton';
import { getLines } from '../../data/api';
import LineCard from './LineCard';

function CardSkeleton() {
  // v3.1 무보더 · 카드 실루엣과 동일 형태(아이콘 배지 원 + 텍스트 라인)
  return (
    <div className="flex flex-col gap-12 rounded-lg bg-white p-24 shadow-sm">
      <Skeleton className="h-64 w-64 rounded-pill" />
      <Skeleton className="h-20 w-1/2" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-2/3" />
    </div>
  );
}

export default function LinesPreview() {
  const [lines, setLines] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    let alive = true;
    // api.js는 전부 async · await 계약(PROGRESS 인수인계 노트)
    getLines().then((result) => {
      if (alive) setLines(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    // reduced-motion: 관찰 없이 즉시 표시 (PATTERNS §8)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return undefined;
    }
    const node = gridRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={gridRef} className="grid gap-16 md:grid-cols-2 md:gap-24 xl:grid-cols-3 xl:gap-32">
      {lines
        ? lines.map((line, i) => (
            <div
              key={line.id}
              style={{
                opacity: revealed ? 1 : 0,
                // 카드 리빌 0.96→1.0 · scale 화이트리스트 2/2 (PATTERNS §8, DESIGN §10)
                transform: revealed ? 'none' : 'scale(0.96)',
                // 240ms·60ms stagger(최대 4개) · PATTERNS §8 명세값, 진입 = easeOut(§17.2)
                transition: `opacity 240ms ${motion.easeOut}, transform 240ms ${motion.easeOut}`,
                transitionDelay: `${Math.min(i, 4) * 60}ms`,
              }}
            >
              <LineCard line={line} />
            </div>
          ))
        : [0, 1, 2].map((i) => <CardSkeleton key={i} />)}
    </div>
  );
}
