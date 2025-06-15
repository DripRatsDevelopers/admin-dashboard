"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import cloudinaryLoader from "@/lib/cloudinaryUtils";
import { db } from "@/lib/firebase";
import {
  PRODUCT_SUMMARY_COLLECTION,
  PRODUCTS_COLLECTION,
  SEARCH_INDEX_COLLECTION,
} from "@/lib/products";
import { toKebabCase } from "@/lib/utils";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type DetailedDesc = Record<string, string>;

type ProductFormState = {
  Name: string;
  Price: number;
  DiscountedPrice?: number;
  InStock?: boolean;
  Category?: string;
  Description: string;
  ImageUrls: string[];
  DetailedDescription?: DetailedDesc;
  Tags: string[];
  MetaTitle?: string;
  MetaDescription?: string;
  ProductId: string;
};

interface ProductFormProps {
  mode?: "create" | "edit";
  defaultValues?: ProductFormState;
}

type Detail = { id: string; key: string; value: string };

export default function ProductForm({ mode, defaultValues }: ProductFormProps) {
  const [step, setStep] = useState("basic");
  const [isValid, setIsValid] = useState(false);

  const [form, setForm] = useState<ProductFormState>(
    defaultValues || {
      Name: "",
      Price: 0,
      DiscountedPrice: undefined,
      InStock: true,
      Category: "",
      Description: "",
      ImageUrls: [""],
      DetailedDescription: {},
      Tags: [],
      MetaTitle: "",
      MetaDescription: "",
      ProductId: "",
    }
  );

  useEffect(() => {
    const valid =
      form.Name.trim().length > 0 &&
      !!form.Price &&
      Number(form.Price) > 0 &&
      form.ImageUrls.length > 0;

    setIsValid(valid);
  }, [form]);

  const [details, setDetails] = useState<Detail[]>([]);

  // Initialize details from defaultValues if in edit mode
  useEffect(() => {
    if (defaultValues?.DetailedDescription && details.length === 0) {
      const initialDetails = Object.entries(
        defaultValues.DetailedDescription
      ).map(([key, value]) => ({
        id: crypto.randomUUID(),
        key,
        value,
      }));
      setDetails(initialDetails);
    }
  }, [defaultValues, details.length]);

  const router = useRouter();

  const handleSubmit = async () => {
    if (!form.Name) {
      alert("Product name is required");
      return;
    }

    const productId = mode === "edit" ? form.ProductId : toKebabCase(form.Name);

    if (!productId) {
      console.error("Invalid product id generated");
      return;
    }

    const detailedDescription: Record<string, string> = {};
    details.forEach(({ key, value }) => {
      if (key.trim()) detailedDescription[key.trim()] = value.trim();
    });

    const productData = {
      ...form,
      ProductId: productId,
      DiscountedPrice: form.DiscountedPrice ?? form.Price,
      DetailedDescription: detailedDescription,
    };

    // Exclude tags from productData — only send tags in SearchIndex
    const summaryData = {
      ProductId: productId,
      Price: productData.Price,
    };

    const searchIndexData = {
      ProductId: productId,
      Name: productData.Name,
      Category: productData.Category ?? "",
      Tags: form.Tags ?? [], // Only here, keep Tags in form state but don't save in Products
      Price: productData.Price,
      DiscountedPrice: productData.DiscountedPrice ?? productData.Price,
      ImageUrls: productData.ImageUrls ?? [],
    };

    try {
      if (mode === "edit") {
        await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), productData);
        await updateDoc(
          doc(db, PRODUCT_SUMMARY_COLLECTION, productId),
          summaryData
        );
        await updateDoc(
          doc(db, SEARCH_INDEX_COLLECTION, productId),
          searchIndexData
        );
      } else {
        await setDoc(doc(db, PRODUCTS_COLLECTION, productId), productData);
        await setDoc(
          doc(db, PRODUCT_SUMMARY_COLLECTION, productId),
          summaryData
        );
        await setDoc(
          doc(db, SEARCH_INDEX_COLLECTION, productId),
          searchIndexData
        );
      }

      router.push("/");
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  const updateField = (
    field: keyof ProductFormState,
    value: string | null | number | boolean | string[]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = form.Tags.filter((_, index) => index !== indexToRemove);
    updateField("Tags", newTags);
  };

  return (
    <div className="w-full">
      <Tabs value={step} onValueChange={setStep} className="w-full">
        {/* Mobile: Scrollable tab list */}
        <div className="overflow-x-auto mb-4">
          <TabsList className="grid grid-cols-5 min-w-full sm:w-auto">
            <TabsTrigger
              value="basic"
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              Basic
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              Images
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              SEO
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              Review
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Step 1: Basic */}
        <TabsContent value="basic">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Product Name
              </Label>
              <Input
                id="name"
                value={form.Name}
                onChange={(e) => updateField("Name", e.target.value)}
                placeholder="Enter product name"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium">
                  Price (₹)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={form.Price}
                  onChange={(e) => updateField("Price", Number(e.target.value))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="discounted-price"
                  className="text-sm font-medium"
                >
                  Discounted Price (₹)
                </Label>
                <Input
                  id="discounted-price"
                  type="number"
                  value={form.DiscountedPrice ?? ""}
                  onChange={(e) =>
                    updateField("DiscountedPrice", Number(e.target.value))
                  }
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Label htmlFor="in-stock" className="text-sm font-medium">
                In Stock
              </Label>
              <Switch
                id="in-stock"
                checked={form.InStock}
                onCheckedChange={(val) => updateField("InStock", val)}
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Input
                id="category"
                value={form.Category}
                onChange={(e) => updateField("Category", e.target.value)}
                placeholder="Enter category"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={form.Description}
                onChange={(e) => updateField("Description", e.target.value)}
                placeholder="Enter product description"
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
        </TabsContent>

        {/* Step 2: Images */}
        <TabsContent value="images">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Product Images
              </Label>
              <p className="text-xs text-muted-foreground mb-4">
                Upload images to Cloudinary and paste public IDs here.
              </p>
            </div>

            {form.ImageUrls.map((url, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex gap-2 items-start">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...form.ImageUrls];
                      newUrls[idx] = e.target.value;
                      updateField("ImageUrls", newUrls);
                    }}
                    placeholder="Enter Cloudinary public ID"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newUrls = form.ImageUrls.filter(
                        (_, i) => i !== idx
                      );
                      updateField("ImageUrls", newUrls);
                    }}
                    className="flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {url && (
                  <div className="flex justify-center">
                    <Image
                      src={cloudinaryLoader({ src: url, width: 120 })}
                      alt="preview"
                      width={120}
                      height={80}
                      className="rounded object-cover border"
                    />
                  </div>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => updateField("ImageUrls", [...form.ImageUrls, ""])}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Image URL
            </Button>
          </div>
        </TabsContent>

        {/* Step 3: Details */}
        <TabsContent value="details">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Product Details
              </Label>
              <p className="text-xs text-muted-foreground mb-4">
                Add detailed specifications and features.
              </p>
            </div>

            {details.map((item, idx) => (
              <div key={item.id} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Detail name (e.g. Material)"
                    value={item.key}
                    onChange={(e) => {
                      const updated = [...details];
                      updated[idx].key = e.target.value;
                      setDetails(updated);
                    }}
                  />
                  <Input
                    placeholder="Detail value (e.g. Cotton)"
                    value={item.value}
                    onChange={(e) => {
                      const updated = [...details];
                      updated[idx].value = e.target.value;
                      setDetails(updated);
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDetails((prev) =>
                        prev.filter((d) => d.id !== item.id)
                      );
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() =>
                setDetails((prev) => [
                  ...prev,
                  { id: crypto.randomUUID(), key: "", value: "" },
                ])
              }
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Detail
            </Button>
          </div>
        </TabsContent>

        {/* Step 4: SEO & Tags */}
        <TabsContent value="seo">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tags" className="text-sm font-medium">
                Tags
              </Label>
              <Input
                id="tags"
                value={form.Tags.join(", ")}
                onChange={(e) => {
                  const tagString = e.target.value;
                  const tags = tagString.split(",").map((s) => s.trim());
                  updateField("Tags", tags);
                }}
                placeholder="Enter tags separated by commas"
                className="mt-1"
              />

              {form.Tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.Tags.map(
                    (tag, i) =>
                      tag && (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            onClick={() => removeTag(i)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      )
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="meta-title" className="text-sm font-medium">
                Meta Title
              </Label>
              <Input
                id="meta-title"
                value={form.MetaTitle}
                onChange={(e) => updateField("MetaTitle", e.target.value)}
                placeholder="SEO title for search engines"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="meta-description" className="text-sm font-medium">
                Meta Description
              </Label>
              <Textarea
                id="meta-description"
                value={form.MetaDescription}
                onChange={(e) => updateField("MetaDescription", e.target.value)}
                placeholder="SEO description for search engines"
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>
        </TabsContent>

        {/* Step 5: Review & Submit */}
        <TabsContent value="review">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Product Summary
              </Label>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {form.Name || "Not set"}
                </div>
                <div>
                  <strong>Price:</strong> ₹{form.Price || 0}
                </div>
                {form.DiscountedPrice && (
                  <div>
                    <strong>Discounted Price:</strong> ₹{form.DiscountedPrice}
                  </div>
                )}
                <div>
                  <strong>Category:</strong> {form.Category || "Not set"}
                </div>
                <div>
                  <strong>In Stock:</strong> {form.InStock ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Images:</strong>{" "}
                  {form.ImageUrls.filter(Boolean).length} added
                </div>
                <div>
                  <strong>Tags:</strong> {form.Tags.length} added
                </div>
                <div>
                  <strong>Details:</strong> {details.length} added
                </div>
                {details.length > 0 && (
                  <div className="mt-2 pl-2 border-l-2 border-muted-foreground/20">
                    {details.slice(0, 3).map((detail, i) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        {detail.key}: {detail.value}
                      </div>
                    ))}
                    {details.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        ... and {details.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">
                Full Data Preview
              </Label>
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-h-60">
                {JSON.stringify(
                  {
                    ...form,
                    DetailedDescription:
                      details.length > 0
                        ? details.reduce((acc, { key, value }) => {
                            if (key.trim()) acc[key.trim()] = value.trim();
                            return acc;
                          }, {} as Record<string, string>)
                        : {},
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!isValid}
                className="flex-1 sm:flex-none"
              >
                {mode === "edit" ? "Update Product" : "Create Product"}
              </Button>

              {!isValid && (
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Please fill in required fields: Name, Price, and at least one
                  image.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
