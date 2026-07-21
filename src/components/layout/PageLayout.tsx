type PageLayoutProps = {
  children: React.ReactNode;
};

function PageLayout({ children }: PageLayoutProps) {
  return (
    <section
      data-name="page-layout"
      className="min-h-full w-full min-w-0 px-4 pb-28 pt-4 sm:px-5 lg:px-6 lg:pb-6 lg:pt-6"
    >
      <div className="mx-auto w-full max-w-[1080px]">{children}</div>
    </section>
  );
}

export default PageLayout;
