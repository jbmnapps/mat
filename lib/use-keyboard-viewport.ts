'use client';

import { useEffect, useState } from 'react';

interface KeyboardViewportState {
  height: number | null;
  keyboardOpen: boolean;
}

function aktivtTekstfelt() {
  const active = document.activeElement;
  return (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    (active instanceof HTMLElement && active.isContentEditable)
  );
}

export function useKeyboardViewport(): KeyboardViewportState {
  const [state, setState] = useState<KeyboardViewportState>({
    height: null,
    keyboardOpen: false,
  });

  useEffect(() => {
    const visualViewport = window.visualViewport;

    const update = () => {
      const height = visualViewport?.height ?? window.innerHeight;
      const hiddenHeight = window.innerHeight - height - (visualViewport?.offsetTop ?? 0);
      const keyboardOpen = aktivtTekstfelt() && hiddenHeight > 120;

      setState((prev) => {
        const roundedHeight = Math.round(height);
        if (prev.height === roundedHeight && prev.keyboardOpen === keyboardOpen) return prev;
        return { height: roundedHeight, keyboardOpen };
      });
    };

    update();

    visualViewport?.addEventListener('resize', update);
    visualViewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('focusin', update);
    window.addEventListener('focusout', update);

    return () => {
      visualViewport?.removeEventListener('resize', update);
      visualViewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('focusin', update);
      window.removeEventListener('focusout', update);
    };
  }, []);

  return state;
}
