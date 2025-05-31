// app/admin/products/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import cloudinaryLoader from "@/lib/cloudinaryUtils";
import { deleteProduct, fetchAllProducts, Product } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAllProducts();
      setProducts(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.ProductId !== id));
  };
  console.log({ products });
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discounted Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.ProductId}>
                <TableCell>
                  <Image
                    src={cloudinaryLoader({
                      src: product.ImageUrls[0],
                      width: 80,
                    })}
                    alt={product.Name}
                    width={80}
                    height={40}
                  />
                </TableCell>
                <TableCell>{product.Name}</TableCell>
                <TableCell>₹{product.Price}</TableCell>
                <TableCell>₹{product.DiscountedPrice}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/products/${product.ProductId}`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.ProductId!)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
