"use client";

export default function Error() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          Something went wrong
        </h2>

        <p className="mt-2 text-gray-500">
          An unexpected error occurred. Please try again.
        </p>
      </div>
    </div>
  );
}