type PageLayoutProps = {
  children: React.ReactNode
}

function PageLayout({ children }: PageLayoutProps) {
  return (
    <section className="flex-1 px-4 py-5 lg:px-0">
      <div className="mx-auto max-w-[1260px]">{children}</div>
    </section>
  )
}

export default PageLayout
