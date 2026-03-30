import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const PageHeaderSkeleton = () => (
  <div className="text-center mb-12 space-y-4">
    <Skeleton className="h-12 w-64 mx-auto" />
    <Skeleton className="h-5 w-96 mx-auto" />
  </div>
);

export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Card>
    ))}
  </div>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-6">
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="p-6">
        <Skeleton className="h-8 w-12 mb-2" />
        <Skeleton className="h-4 w-24" />
      </Card>
    ))}
  </div>
);
