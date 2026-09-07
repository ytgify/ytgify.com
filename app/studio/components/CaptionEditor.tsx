import type { StudioCaptionSettings } from '@/lib/studio/types';
import { CaptionInput } from './shared';
import { Disclosure } from './Disclosure';

export interface CaptionEditorProps {
  captions: StudioCaptionSettings;
  onCaptionChange: (placement: 'topText' | 'bottomText', value: string) => void;
  onCaptionSettingChange: <Key extends keyof StudioCaptionSettings>(
    key: Key,
    value: StudioCaptionSettings[Key],
  ) => void;
}

export function CaptionEditor({ captions, onCaptionChange, onCaptionSettingChange }: CaptionEditorProps) {
  const hasText = Boolean(captions.topText.trim() || captions.bottomText.trim());
  return (
    <Disclosure title="Add a caption" description={hasText ? 'Caption included' : 'Optional'} defaultOpen={hasText}>
      <CaptionInput label="Top text" value={captions.topText} onChange={(value) => onCaptionChange('topText', value)} />
      <CaptionInput
        label="Bottom text"
        value={captions.bottomText}
        onChange={(value) => onCaptionChange('bottomText', value)}
      />
      <Disclosure title="Caption style">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Size
            <select
              aria-label="Caption size"
              value={captions.size}
              onChange={(event) => onCaptionSettingChange('size', event.target.value as StudioCaptionSettings['size'])}
              className="mt-2 min-h-11 w-full rounded-lg border border-gray-700 bg-gray-900 p-2"
            >
              <option value="standard">Standard</option>
              <option value="large">Large</option>
            </select>
          </label>
          <label className="text-sm">
            Color
            <select
              aria-label="Caption color"
              value={captions.color}
              onChange={(event) =>
                onCaptionSettingChange('color', event.target.value as StudioCaptionSettings['color'])
              }
              className="mt-2 min-h-11 w-full rounded-lg border border-gray-700 bg-gray-900 p-2"
            >
              <option value="white">White</option>
              <option value="yellow">Yellow</option>
            </select>
          </label>
        </div>
      </Disclosure>
      <p className="text-xs text-gray-400">Closing this section keeps your caption. Clear the text to remove it.</p>
    </Disclosure>
  );
}
