type BandcampEmbedPlayerProps = {
  src: string;
  title: string;
};

export function BandcampEmbedPlayer({
  src,
  title,
}: BandcampEmbedPlayerProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white">
      <iframe
        title={title}
        src={src}
        className="block h-[120px] w-full border-0"
        loading="lazy"
        seamless
      />
    </div>
  );
}
