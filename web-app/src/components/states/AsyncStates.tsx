import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";

interface SimpleStateProps {
  title: string;
  description?: string;
}

interface ErrorStateProps extends SimpleStateProps {
  onRetry?: () => void;
}

export function SectionShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-emerald-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-emerald-100 mt-2">{description}</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</section>
    </div>
  );
}

export function LoadingState({ title, description }: SimpleStateProps) {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <LoaderCircle className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-red-200">
      <CardContent className="p-10 text-center">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
        {onRetry ? (
          <Button variant="outline" className="mt-4" onClick={onRetry}>
            Tekrar Dene
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, description }: SimpleStateProps) {
  return (
    <Card>
      <CardContent className="p-10 text-center">
        <Inbox className="w-8 h-8 mx-auto text-gray-400" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
      </CardContent>
    </Card>
  );
}
