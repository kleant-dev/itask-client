// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-50">
          <FileQuestion className="h-12 w-12 text-primary-500" />
        </div>

        {/* Error Code */}
        <h1 className="mb-2 text-6xl font-bold text-neutral-900">404</h1>

        {/* Title */}
        <h2 className="mb-3 text-h4 text-neutral-900">Page not found</h2>

        {/* Description */}
        <p className="mb-8 text-p-medium text-neutral-500">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. Perhaps
          you&apos;ve mistyped the URL or the page has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/home">
              <Home className="h-4 w-4" />
              Go to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-p-small text-neutral-400">
          Need help?{" "}
          <Link
            href="/support"
            className="text-primary-500 underline-offset-4 hover:underline"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
