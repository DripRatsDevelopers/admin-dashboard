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
import { AlertTriangle, Edit, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAllProducts();
      setProducts(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    setIsDeleteLoading(true);
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.ProductId !== id));
    setIsDeleteLoading(false);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/products/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                        className="rounded object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.Name}
                    </TableCell>
                    <TableCell>₹{product.Price}</TableCell>
                    <TableCell>₹{product.DiscountedPrice}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/products/${product.ProductId}`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <AlertDialogTitle>
                                  Delete {product.Name}?
                                </AlertDialogTitle>
                              </div>
                              <AlertDialogDescription className="text-left">
                                This action cannot be undone. This will
                                permanently delete the &quot;{product.Name}
                                &quot; product.
                                <br />
                                <br />
                                <strong>
                                  Are you sure you want to continue?
                                </strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.ProductId!)}
                                disabled={isDeleteLoading}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                {isDeleteLoading ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                  </div>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {products.map((product) => (
              <div
                key={product.ProductId}
                className="border rounded-lg p-4 bg-card space-y-3"
              >
                <div className="flex gap-3">
                  <Image
                    src={cloudinaryLoader({
                      src: product.ImageUrls[0],
                      width: 80,
                    })}
                    alt={product.Name}
                    width={80}
                    height={60}
                    className="rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight mb-2 truncate">
                      {product.Name}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span>₹{product.Price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Discounted:
                        </span>
                        <span className="text-green-600 font-medium">
                          ₹{product.DiscountedPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Link
                    href={`/products/${product.ProductId}`}
                    className="flex-1"
                  >
                    <Button size="sm" variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.ProductId!)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No products found</p>
          <Link href="/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
