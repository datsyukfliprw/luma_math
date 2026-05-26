type PageLayoutProps = {
  children: React.ReactNode
}

function PageLayout({ children }: PageLayoutProps) {
  return (
    <section className="h-full min-w-0 flex-1 overflow-y-auto px-4 py-5 pr-2 lg:px-0 lg:pr-3">
      <div className="mx-auto max-w-[1260px] pb-6">{children}</div>
    </section>
  )
}

export default PageLayout
