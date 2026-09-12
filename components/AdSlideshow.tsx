'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ADS = [
  '/images/capa.jpg',
  '/images/eventos.jpg',
  '/images/shokonsai.jpg',
];

const SLIDE_DURATION_MS = 10000; // 10 seconds

export default function AdSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % ADS.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className='tv-ads'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={ADS[index]}
          className='tv-ads-slide'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Image
            src={ADS[index]}
            alt=''
            fill
            priority
            sizes='100vw'
            className='tv-ads-image'
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

