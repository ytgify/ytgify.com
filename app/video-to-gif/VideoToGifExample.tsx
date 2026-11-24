import Image from 'next/image';

const sampleDirectory = '/samples/video-to-gif';

export function VideoToGifExample() {
  return (
    <section
      aria-labelledby="mp4-to-gif-example"
      className="rounded-2xl border border-gray-800 bg-gray-950/55 p-5 sm:p-8"
    >
      <h2 id="mp4-to-gif-example" className="text-2xl font-bold text-white sm:text-3xl">
        MP4 to GIF example
      </h2>
      <p className="mt-3 max-w-2xl leading-7 text-gray-400">
        Turn four seconds of a 15-second MP4 into a looping GIF. YTgify made this export in the browser.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <Image
          src={`${sampleDirectory}/tears-of-steel-preview.jpg`}
          alt="First frame of the GIF, showing two people talking on a bridge"
          width={640}
          height={266}
          loading="lazy"
          className="h-auto w-full rounded-xl border border-gray-800"
        />
        <div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-400">Trim</dt>
              <dd className="mt-1 font-medium text-white">00:08–00:12</dd>
            </div>
            <div>
              <dt className="text-gray-400">Export settings</dt>
              <dd className="mt-1 font-medium text-white">360p · 10 FPS</dd>
            </div>
            <div>
              <dt className="text-gray-400">GIF dimensions</dt>
              <dd className="mt-1 font-medium text-white">854 × 356 px</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-x-5">
            <a
              href={`${sampleDirectory}/tears-of-steel-example.gif`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-[#4fd1c5] underline hover:text-white"
            >
              View GIF · 8.24 MB
            </a>
            <a
              href={`${sampleDirectory}/tears-of-steel-sample.mp4`}
              download
              className="inline-flex min-h-11 items-center text-sm font-semibold text-[#4fd1c5] underline hover:text-white"
            >
              Download sample MP4
            </a>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-400">
        <a
          href="https://commons.wikimedia.org/wiki/File:Tears_of_Steel_1080p.webm"
          className="underline hover:text-white"
        >
          Tears of Steel
        </a>{' '}
        © Blender Foundation,{' '}
        <a href="https://creativecommons.org/licenses/by/3.0/" className="underline hover:text-white">
          CC BY 3.0
        </a>
        . Shortened for the sample and converted to GIF.
      </p>
    </section>
  );
}
