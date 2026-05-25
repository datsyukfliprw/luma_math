type PlaceholderScreenProps = {
  eyebrow: string
  title: string
  description: string
}

function PlaceholderScreen({
  eyebrow,
  title,
  description,
}: PlaceholderScreenProps) {
  return (
    <section className="flex-1 px-4 py-5 lg:px-0">
      <div className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">
          {eyebrow}
        </p>

        <h1 className="mt-3 text-4xl font-black">{title}</h1>

        <p className="mt-3 text-lg font-medium text-[#073B5A]/70">
          {description}
        </p>
      </div>
    </section>
  )
}

export default PlaceholderScreen
