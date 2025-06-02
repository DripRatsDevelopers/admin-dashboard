import ProductForm from "@/components/common/ProductForm";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase"; // your firestore init
import { Product } from "@/lib/products";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string; category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id: productId } = await params;
  const docRef = doc(db, "Products", productId);
  const searchSnap = await getDoc(doc(db, "SearchIndex", productId));

  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return notFound();

  const data = snapshot.data() as Product;
  const s = searchSnap.exists() ? searchSnap.data() : { Tags: [] };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Add New Product</h2>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
      </div>
      <ProductForm
        mode="edit"
        defaultValues={{ ...data, ProductId: productId, Tags: s.Tags || [] }}
      />
    </div>
  );
}
