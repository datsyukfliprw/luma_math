type PlaceholderScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
};

function PlaceholderScreen({ eyebrow, title, description }: PlaceholderScreenProps) {
  return (
    <section className="flex min-h-[50vh] flex-1 items-center justify-center px-3 py-5 sm:px-4 lg:px-0">
      <div className="w-full max-w-2xl rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 text-center shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">{eyebrow}</p>

        <h1 className="mt-3 text-2xl font-black sm:text-3xl lg:text-4xl">{title}</h1>

        <p className="mt-3 text-base font-medium text-[#073B5A]/70 lg:text-lg">{description}</p>
      </div>
    </section>
  );
}

export default PlaceholderScreen;
