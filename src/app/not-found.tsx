import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60dvh] flex-col items-center justify-center text-center">
      <p className="eyebrow text-brand">404</p>
      <h1 className="text-h1 mt-4">We could not find that page</h1>
      <p className="text-lead mt-3 max-w-md">The link may be broken or the course may have been unpublished.</p>
      <Link href="/courses" className="btn btn-primary mt-8">
        Browse courses
      </Link>
    </div>
  );
}
