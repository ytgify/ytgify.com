import { useRef, useState } from 'react';

export function useCaptionPreview() {
  const [active, setActive] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const returnButtonRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<HTMLElement | null>(null);
  const show = (editor: HTMLElement) => {
    editorRef.current = editor;
    setActive(true);
    requestAnimationFrame(() => {
      returnButtonRef.current?.focus({ preventScroll: true });
      previewRef.current?.scrollIntoView({ block: 'center' });
    });
  };
  const back = () => {
    setActive(false);
    requestAnimationFrame(() => {
      editorRef.current?.focus({ preventScroll: true });
      editorRef.current?.scrollIntoView({ block: 'center' });
    });
  };
  return { active, previewRef, returnButtonRef, show, back };
}
