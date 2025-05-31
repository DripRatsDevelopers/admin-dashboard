import ProductForm from "@/components/common/ProductForm";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase"; // your firestore init
import { Product } from "@/lib/products";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = params.id;
  const docRef = doc(db, "Products", productId);
  const searchSnap = await getDoc(doc(db, "SearchIndex", productId));

  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return notFound();

  const data = snapshot.data() as Product;
  const s = searchSnap.exists() ? searchSnap.data() : { Tags: [] };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
        <Button asChild variant="outline">
          <Link href="/">← Back to Products</Link>
        </Button>
      </div>
      <ProductForm
        mode="edit"
        defaultValues={{ ...data, ProductId: productId, Tags: s.Tags || [] }}
      />
    </div>
  );
}
