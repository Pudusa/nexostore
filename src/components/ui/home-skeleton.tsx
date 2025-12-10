import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function HomeSkeleton() {
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <div className="h-8 w-64 bg-muted rounded mx-auto mb-2"></div>
        <div className="h-5 w-80 bg-muted rounded mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={`home-skeleton-${index}`} className="h-full overflow-hidden animate-pulse">
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
        ))}
      </div>
    </div>
  );
}