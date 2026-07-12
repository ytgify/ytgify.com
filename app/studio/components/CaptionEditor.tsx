import { Captions, Sparkles } from 'lucide-react';
import type { StudioCaptionColor, StudioCaptionSettings, StudioCaptionSize } from '@/lib/studio/types';
import { captionColorDetails, captionSizeDetails } from '../studio-config';
import { CaptionInput, OptionButton, OptionSection } from './shared';

interface CaptionEditorProps {
  captions: StudioCaptionSettings;
  onCaptionChange: (placement: keyof StudioCaptionSettings, value: string) => void;
  onCaptionSettingChange: <Key extends keyof StudioCaptionSettings>(
    key: Key,
    value: StudioCaptionSettings[Key],
  ) => void;
  onSkip: () => void;
  onCreate: () => void;
  disabled: boolean;
}

export function CaptionEditor(props: CaptionEditorProps) {
  const { captions } = props;
  return (
    <section className="rounded-xl border border-gray-800 bg-black/10 p-4">
      <h3 className="mb-4 text-lg font-bold text-white">Captions</h3>
      <CaptionInput
        label="Top text"
        value={captions.topText}
        onChange={(value) => props.onCaptionChange('topText', value)}
      />
      <CaptionInput
        label="Bottom text"
        value={captions.bottomText}
        onChange={(value) => props.onCaptionChange('bottomText', value)}
      />
      <OptionSection icon={<Captions className="h-4 w-4" />} label="Caption Size">
        {(Object.keys(captionSizeDetails) as StudioCaptionSize[]).map((size) => (
          <OptionButton
            key={size}
            active={captions.size === size}
            title={captionSizeDetails[size].label}
            description={captionSizeDetails[size].description}
            onClick={() => props.onCaptionSettingChange('size', size)}
          />
        ))}
      </OptionSection>
      <div className="mt-4">
        <OptionSection icon={<Sparkles className="h-4 w-4" />} label="Caption Color">
          {(Object.keys(captionColorDetails) as StudioCaptionColor[]).map((color) => (
            <OptionButton
              key={color}
              active={captions.color === color}
              title={captionColorDetails[color].label}
              description={captionColorDetails[color].description}
              onClick={() => props.onCaptionSettingChange('color', color)}
            />
          ))}
        </OptionSection>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <button
          type="button"
          onClick={props.onSkip}
          disabled={props.disabled}
          className="inline-flex items-center justify-center gap-2 border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create without text
        </button>
        <button
          type="button"
          onClick={props.onCreate}
          disabled={props.disabled}
          className="inline-flex items-center justify-center gap-2 bg-[#E91E8C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d51a80] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          Create GIF
        </button>
      </div>
    </section>
  );
}
