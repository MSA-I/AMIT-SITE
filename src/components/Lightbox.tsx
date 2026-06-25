import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../i18n/context';
import type { ProjectImage } from '../data/projects';

interface Props {
  images: ProjectImage[];
  index: number;
  alt: string;
  onClose: () => void;
  onIndex: (i: number) => void;
}

export default function Lightbox({ images, index, alt, onClose, onIndex }: Props) {
  const { dir } = useI18n();
  const reduce = useReducedMotion();
  const total = images.length;

  const go = useCallback(
    (delta: number) => onIndex((index + delta + total) % total),
    [index, total, onIndex]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // arrows respect reading direction
      const fwd = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd) go(1);
      if (e.key === back) go(-1);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose, dir]);

  const Prev = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const Next = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={alt}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute end-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full text-bg/80 ring-1 ring-bg/20 transition-colors hover:text-bg"
        >
          <X className="h-5 w-5" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); go(-1); }}
          aria-label="Previous"
          className="absolute start-3 z-10 flex h-12 w-12 items-center justify-center rounded-full text-bg/80 ring-1 ring-bg/20 transition-colors hover:text-bg md:start-8"
        >
          <Prev className="h-6 w-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); go(1); }}
          aria-label="Next"
          className="absolute end-3 z-10 flex h-12 w-12 items-center justify-center rounded-full text-bg/80 ring-1 ring-bg/20 transition-colors hover:text-bg md:end-8"
        >
          <Next className="h-6 w-6" />
        </button>

        <motion.img
          key={images[index].full}
          src={images[index].full}
          alt={`${alt} - ${index + 1}/${total}`}
          className="max-h-[88vh] max-w-[92vw] object-contain"
          onClick={(e) => e.stopPropagation()}
          drag={reduce ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) go(dir === 'rtl' ? -1 : 1);
            else if (info.offset.x > 80) go(dir === 'rtl' ? 1 : -1);
          }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />

        <span className="absolute bottom-5 text-sm tabular-nums tracking-widest text-bg/70" dir="ltr">
          {index + 1} / {total}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
