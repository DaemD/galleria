export type MemoryPhoto = {
  id: string;
  src: string;
  alt: string;
  title: string;
  note: string;
};

export type CollectedMemory = MemoryPhoto & {
  pulledAt: string;
};
