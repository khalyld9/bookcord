export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>

        <h2 className="mt-2 text-2xl font-semibold">
          Page not found
        </h2>

        <p className="mt-2 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
    </div>
  );
}