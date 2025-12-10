import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function ProductSkeleton() {
  return (
    <Card className="h-full overflow-hidden animate-pulse">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] w-full bg-muted" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
        <div className="h-4 w-full bg-muted rounded mb-1"></div>
        <div className="h-4 w-1/2 bg-muted rounded"></div>
        <div className="mt-4 flex items-center gap-1">
          <div className="h-4 w-16 bg-muted rounded"></div>
          <div className="h-4 w-8 bg-muted rounded"></div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-6 w-16 bg-muted rounded"></div>
      </CardFooter>
    </Card>
  );
}