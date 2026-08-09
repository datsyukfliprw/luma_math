import { Home, Map } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";

function NotFoundScreen() {
  return (
    <PageLayout>
      <div className="flex min-h-[620px] items-center justify-center">
        <section className="w-full max-w-2xl rounded-[2rem] border border-[#073B5A]/10 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9F7F8] text-3xl font-black text-[#0081A7]">
            ?
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#0081A7]">
            Page Not Found
          </p>
          <h1 className="mt-2 text-3xl font-black text-[#073B5A]">That page isn&apos;t available.</h1>
          <p className="mx-auto mt-3 max-w-lg text-base font-bold leading-7 text-[#073B5A]/65">
            The link may be old or incomplete. Your saved learning progress has not been changed.
          </p>

          <div className="mx-auto mt-7 grid max-w-md gap-3 sm:grid-cols-2">
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#00AFB9] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7]"
            >
              <Home size={18} strokeWidth={2.7} />
              Home
            </Link>
            <Link
              to="/learning-path"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white px-5 text-sm font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB]"
            >
              <Map size={18} strokeWidth={2.7} />
              Learning Path
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default NotFoundScreen;
