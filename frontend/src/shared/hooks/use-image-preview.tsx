import { useCallback, useEffect, useRef, useState } from "react";

/** Vista previa local (blob:) de un archivo; se libera al cambiar y al desmontar. */
export function useImagePreview() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const setFile = useCallback((file: File | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = file ? URL.createObjectURL(file) : null;
    setPreviewUrl(urlRef.current);
  }, []);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return { previewUrl, setFile };
}
