import Link from "next/link";
import { Sparkles, ArrowRight, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-12 shadow-2xl backdrop-blur-xl max-w-md w-full space-y-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700/80 text-sky-400 mx-auto">
          <FileQuestion className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold text-white">404</h1>
          <h2 className="text-base font-semibold text-zinc-200">Page not found</h2>
          <p className="text-xs text-zinc-400">
            The link you followed may be broken or the page may have been removed.
          </p>
        </div>
        <Link href="/">
          <Button variant="primary" size="default" className="w-full gap-2">
            <span>Back to NearDrop</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
