'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useScheduleStream } from '@/lib/useScheduleStream';
import type { ScheduleState } from '@/lib/store';
import AdSlideshow from './AdSlideshow';

export default function HomeView({
  initialState,
}: {
  initialState: ScheduleState;
}) {
  const state = useScheduleStream(initialState);
  const singers = state.singers;
  const currentIndex = singers.findIndex(
    (s) => s.numero === state.currentNumber,
  );
  const current = currentIndex === -1 ? null : singers[currentIndex];
  const nowItemRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const item = nowItemRef.current;
    const container = railRef.current;
    if (!item || !container) return;
    container.style.maxHeight = `${item.clientHeight * 5}px`;
    const itemRect = item.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const offsetWithinContainer =
      itemRect.top - containerRect.top + container.scrollTop;
    const targetTop =
      offsetWithinContainer -
      container.clientHeight / 2 +
      item.clientHeight / 2;
    container.scrollTo({ top: targetTop, behavior: 'smooth' });
  }, [current?.numero]);

  return (
    <div className='app app-tv'>
      <main id='userView'>
        <div className='tv-stage'>
          <section
            className='hero tv-hero'
            aria-live='polite'
          >
            {state.intervalMode ? (
              <>
                <span className='kicker-label tv-hero-kicker tv-hero-kicker-interval'>
                  <span
                    className='live-dot'
                    aria-hidden='true'
                  />
                  Intervalo
                </span>
                <AdSlideshow />
              </>
            ) : (
              <span className='kicker-label tv-hero-kicker'>
                <span
                  className='live-dot'
                  aria-hidden='true'
                />
                Cantando agora
              </span>
            )}
            <AnimatePresence mode='wait'>
              {state.intervalMode ? null : current ? (
                <motion.div
                  key={current.numero}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className='tv-hero-content'
                >
                  <div className='tv-number'>{current.numero}</div>
                  <div className='tv-info'>
                    <div className='tv-field'>
                      <span className='tv-meta-label'>Música</span>
                      <h2 className='tv-music'>{current.nome_musica}</h2>
                    </div>
                    <div className='tv-field'>
                      <span className='tv-meta-label'>Cantor</span>
                      <div className='tv-singer'>{current.nome_cantor}</div>
                    </div>
                    <div className='tv-meta'>
                      <div className='tv-meta-item'>
                        <span className='tv-meta-label'>Categoria</span>
                        <span className='tv-meta-value'>
                          {current.categoria}
                        </span>
                      </div>
                      {current.cidade ? (
                        <div className='tv-meta-item'>
                          <span className='tv-meta-label'>Cidade</span>
                          <span className='tv-meta-value'>
                            {current.cidade}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key='empty'
                  className='hero-empty'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Nenhum cantor marcado como atual no momento.
                </motion.p>
              )}
            </AnimatePresence>
          </section>

          {/* Ordem do dia oculta temporariamente
          <aside>
            <p className='rail-heading'>Ordem do dia</p>
            <div
              className='rail'
              ref={railRef}
            >
              {singers.map((s, i) => {
                const isNow = i === currentIndex;
                const isDone = currentIndex > -1 && i < currentIndex;
                return (
                  <div
                    key={s.numero}
                    ref={isNow ? nowItemRef : undefined}
                    className={`rail-item${isNow ? ' now' : ''}${isDone ? ' done' : ''}`}
                  >
                    {isNow ? (
                      <motion.span
                        layoutId='rail-indicator'
                        layout
                        className='rail-dot'
                        transition={{
                          type: 'spring',
                          stiffness: 350,
                          damping: 32,
                        }}
                      />
                    ) : (
                      <span className='rail-dot' />
                    )}
                    <div className='rail-title'>
                      #{s.numero} · {s.nome_cantor}
                    </div>
                    <div className='rail-meta'>
                      {s.nome_musica}
                      {s.categoria ? ` · ${s.categoria}` : ''}
                    </div>
                  </div>
                );
              })}
              {singers.length === 0 ? (
                <p className='hero-empty'>Nenhum cantor cadastrado ainda.</p>
              ) : null}
            </div>
          </aside>
          */}
        </div>
      </main>
    </div>
  );
}

