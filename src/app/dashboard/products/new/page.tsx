import NewProductForm from "@/components/dashboard/new-product-form";
import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewProductPage() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "manager") {
    redirect("/login");
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <NewProductForm manager={user} />
    </div>
  );
}
