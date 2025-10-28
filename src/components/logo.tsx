import { Package } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Package className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold tracking-tight">NexoStore</span>
    </div>
  );
}
