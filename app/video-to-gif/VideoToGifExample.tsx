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
      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-6">
        <section aria-labelledby="example-before">
          <h3 id="example-before" className="text-sm font-medium text-gray-400">
            Before
          </h3>
          <p className="mt-1 font-semibold text-white">15-second MP4</p>
          <Image
            src={`${sampleDirectory}/tears-of-steel-source-preview.jpg`}
            alt="Two people standing on a bridge earlier in the source video"
            width={640}
            height={266}
            loading="lazy"
            className="mt-3 h-auto w-full rounded-xl border border-gray-800"
          />
          <a
            href={`${sampleDirectory}/tears-of-steel-sample.mp4`}
            download
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[#4fd1c5] underline hover:text-white"
          >
            Download MP4
          </a>
        </section>
        <section aria-labelledby="example-after">
          <h3 id="example-after" className="text-sm font-medium text-gray-400">
            After
          </h3>
          <p className="mt-1 font-semibold text-white">4-second GIF</p>
          <Image
            src={`${sampleDirectory}/tears-of-steel-preview.jpg`}
            alt="First frame of the GIF, with one person gesturing with a robotic hand"
            width={640}
            height={266}
            loading="lazy"
            className="mt-3 h-auto w-full rounded-xl border border-gray-800"
          />
          <a
            href={`${sampleDirectory}/tears-of-steel-example.gif`}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[#4fd1c5] underline hover:text-white"
          >
            View GIF · 8.24 MB
          </a>
        </section>
      </div>
      <p className="text-sm leading-6 text-gray-300">Trimmed 00:08–00:12 · 360p · 10 FPS</p>
      <p className="mt-3 text-sm leading-6 text-gray-400">
        Excerpt from{' '}
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
        .
      </p>
    </section>
  );
}
