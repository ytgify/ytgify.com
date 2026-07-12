'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const EXAMPLE_GIFS = [
  '/examples/free-gratis.gif',
  '/examples/boom-baby.gif',
  '/examples/witness-me.gif',
];

export default function ExampleGifsGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev === EXAMPLE_GIFS.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [currentIndex]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Carousel Container */}
      <div className="relative w-full max-w-[500px] mx-auto">
        {/* GIF Display with Sliding Animation */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-800 border-2 border-gray-700 shadow-2xl p-2">
          {/* Viewport with overflow hidden */}
          <div className="relative w-full rounded-2xl overflow-hidden">
            {/* Sliding track */}
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {EXAMPLE_GIFS.map((gifUrl, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <Image
                    src={gifUrl}
                    alt={`Example GIF ${index + 1}`}
                    width={256}
                    height={144}
                    className="w-full h-auto"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex gap-2 mt-6">
        {EXAMPLE_GIFS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Go to GIF ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
