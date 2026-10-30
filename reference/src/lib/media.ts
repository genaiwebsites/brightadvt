/** Public assets are referenced relative to the page so the build can be served from any path. */
export const asset = (p: string) => p;

export const finePointer = () =>
  typeof window !== "undefined" && matchMedia("(hover: hover) and (pointer: fine)").matches;
