import { STUDIO_FPS_OPTIONS, STUDIO_RESOLUTION_OPTIONS, STUDIO_SIZE_TARGETS } from '@/lib/studio/constants';
import { qualityLabel, qualityPresets } from '@/lib/studio/quality-presets';
import type { StudioOutputSettings } from '@/lib/studio/types';
import { getSizeTargetLabel } from '../studio-controller-helpers';
import { Disclosure } from './Disclosure';

const choiceClass = 'min-h-11 rounded-lg border px-2 py-2 text-sm transition-colors';
export function OutputSettings({
  settings,
  estimatedSize,
  onChange,
}: {
  settings: StudioOutputSettings;
  estimatedSize: string;
  onChange: (settings: StudioOutputSettings) => void;
}) {
  const mode = qualityLabel(settings);
  return (
    <section className="space-y-3" aria-label="Output settings">
      <h2 className="text-base font-bold">Choose the result</h2>
      <div className="grid grid-cols-3 gap-2">
        {qualityPresets.map((preset) => (
          <button
            type="button"
            key={preset.label}
            aria-pressed={mode === preset.label}
            onClick={() => onChange(preset.settings)}
            className={`${choiceClass} font-semibold ${mode === preset.label ? 'border-[#E91E8C] bg-[#E91E8C]/15 text-white' : 'border-gray-700 text-gray-300'}`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <p className="text-xs leading-5 text-gray-400" data-testid="effective-settings">
        {mode} · {settings.resolution}p · {settings.fps} FPS · estimated {estimatedSize} MB
      </p>
      <Disclosure
        title="Set a size target"
        description={settings.sizeTarget === 'auto' ? 'Optional' : `${settings.sizeTarget} MB active`}
      >
        <p className="text-xs leading-5 text-gray-400">
          We adjust resolution and FPS as you trim. This is a rough estimate, not a guaranteed limit. Motion, detail,
          and captions affect the final size.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {STUDIO_SIZE_TARGETS.map((target) => (
            <button
              type="button"
              key={target}
              aria-pressed={settings.sizeTarget === target}
              className={`${choiceClass} ${settings.sizeTarget === target ? 'border-[#E91E8C] bg-[#E91E8C]/15' : 'border-gray-700'}`}
              onClick={() => onChange({ ...settings, sizeTarget: target })}
            >
              {getSizeTargetLabel(target)}
            </button>
          ))}
        </div>
      </Disclosure>
      <Disclosure title="Advanced settings" description="Resolution & frame rate">
        <fieldset>
          <legend className="mb-2 text-sm text-gray-300">Resolution</legend>
          <div className="grid grid-cols-3 gap-2">
            {STUDIO_RESOLUTION_OPTIONS.map((resolution) => (
              <button
                type="button"
                key={resolution}
                aria-pressed={settings.resolution === resolution}
                className={`${choiceClass} ${settings.resolution === resolution ? 'border-[#E91E8C] bg-[#E91E8C]/15' : 'border-gray-700'}`}
                onClick={() => onChange({ ...settings, resolution, sizeTarget: 'auto' })}
              >
                {resolution}p
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm text-gray-300">Frame rate</legend>
          <div className="grid grid-cols-3 gap-2">
            {STUDIO_FPS_OPTIONS.map((fps) => (
              <button
                type="button"
                key={fps}
                aria-pressed={settings.fps === fps}
                className={`${choiceClass} ${settings.fps === fps ? 'border-[#E91E8C] bg-[#E91E8C]/15' : 'border-gray-700'}`}
                onClick={() => onChange({ ...settings, fps, sizeTarget: 'auto' })}
              >
                {fps} fps
              </button>
            ))}
          </div>
        </fieldset>
        <p className="text-xs text-gray-400">Manual changes turn off an automatic size target.</p>
      </Disclosure>
    </section>
  );
}
