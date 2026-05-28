// @SECTION SCROLL_MORE_HINT_COMPONENT
function ScrollMoreHint({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-name="scroll-more-hint"
      className="pointer-events-none fixed bottom-24 right-8 z-40 hidden xl:block"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#073B5A]/10 bg-white/95 text-2xl font-black text-[#0081A7] shadow-lg backdrop-blur">
        <span className="animate-bounce leading-none">↓</span>
      </div>
    </div>
  );
}

export default ScrollMoreHint;
