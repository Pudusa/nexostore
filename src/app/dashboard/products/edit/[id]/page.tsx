import ProductForm from "@/components/dashboard/product-form";
import { getAuthenticatedUser } from "@/lib/auth";
import { getProductById } from "@/lib/api";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "manager") {
    redirect("/login");
  }

  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  // Optional: Add a check to ensure the manager can only edit their own products
  if (product.managerId !== user.id) {
    // Or redirect to a generic "access denied" page
    redirect("/dashboard/products");
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <ProductForm manager={user} product={product} />
    </div>
  );
}
