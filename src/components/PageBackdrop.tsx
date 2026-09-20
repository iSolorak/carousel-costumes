import Image from "next/image";

/**
 * A fixed "stage" behind a page's content: velvet curtains, a soft pink
 * spotlight haze and drifting confetti, echoing the hero. It stays put
 * while the content scrolls over it, like a theatre backdrop.
 */
export default function PageBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg"
    >
      <Image
        src="/bg/catalogue-stage.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
      {/* Keeps the centre calm so cards and text stay legible. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_0%,rgba(18,8,24,0.55)_75%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg/70" />
    </div>
  );
}
