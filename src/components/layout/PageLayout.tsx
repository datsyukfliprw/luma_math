type PageLayoutProps = {
  children: React.ReactNode;
};

function PageLayout({ children }: PageLayoutProps) {
  return (
    <section className="h-full min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-5 lg:px-6 lg:pb-8 lg:pt-6">
      <div className="mx-auto max-w-[1260px]">{children}</div>
    </section>
  );
}

export default PageLayout;
