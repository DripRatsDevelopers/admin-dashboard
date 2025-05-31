// app/admin/products/new/page.tsx
import ProductForm from "@/components/common/ProductForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
        <Button asChild variant="outline">
          <Link href="/">← Back to Products</Link>
        </Button>
      </div>
      <ProductForm />
    </div>
  );
}
