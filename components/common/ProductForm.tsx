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
import { toKebabCase } from "@/lib/utils";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { Trash2 } from "lucide-react";
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
        await updateDoc(doc(db, "Products", productId), productData);
        await updateDoc(doc(db, "ProductSummary", productId), summaryData);
        await updateDoc(doc(db, "SearchIndex", productId), searchIndexData);
      } else {
        await setDoc(doc(db, "Products", productId), productData);
        await setDoc(doc(db, "ProductSummary", productId), summaryData);
        await setDoc(doc(db, "SearchIndex", productId), searchIndexData);
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

  return (
    <Tabs value={step} onValueChange={setStep} className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="basic">Basic</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="details">Description</TabsTrigger>
        <TabsTrigger value="seo">SEO & Tags</TabsTrigger>
        <TabsTrigger value="review">Preview</TabsTrigger>
      </TabsList>

      {/* Step 1: Basic */}
      <TabsContent value="basic">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={form.Name}
              onChange={(e) => updateField("Name", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price</Label>
              <Input
                type="number"
                value={form.Price}
                onChange={(e) => updateField("Price", Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Discounted Price (optional)</Label>
              <Input
                type="number"
                value={form.DiscountedPrice ?? ""}
                onChange={(e) =>
                  updateField("DiscountedPrice", Number(e.target.value))
                }
              />
            </div>
          </div>
          <div className="flex align-items-center gap-2">
            <Label>In Stock</Label>
            <Switch
              checked={form.InStock}
              onCheckedChange={(val) => updateField("InStock", val)}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input
              value={form.Category}
              onChange={(e) => updateField("Category", e.target.value)}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={form.Description}
              onChange={(e) => updateField("Description", e.target.value)}
            />
          </div>
        </div>
      </TabsContent>

      {/* Step 2: Images */}
      <TabsContent value="images">
        <div className="space-y-4">
          {form.ImageUrls.map((url, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input
                value={url}
                onChange={(e) => {
                  const newUrls = [...form.ImageUrls];
                  newUrls[idx] = e.target.value;
                  updateField("ImageUrls", newUrls);
                }}
              />
              {url && (
                <Image
                  src={cloudinaryLoader({ src: url, width: 40 })}
                  alt="preview"
                  width={40}
                  height={40}
                  className="rounded object-cover border"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newUrls = form.ImageUrls.filter((_, i) => i !== idx);
                  updateField("ImageUrls", newUrls);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => updateField("ImageUrls", [...form.ImageUrls, ""])}
          >
            Add Image URL
          </Button>
          <p className="text-xs text-muted-foreground">
            Upload images to Cloudinary and paste public IDs here.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="details">
        <div className="space-y-4">
          {details.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
            >
              <Input
                placeholder="Key"
                value={item.key}
                onChange={(e) => {
                  const updated = [...details];
                  updated[idx].key = e.target.value;
                  setDetails(updated);
                }}
              />
              <Input
                placeholder="Value"
                value={item.value}
                onChange={(e) => {
                  const updated = [...details];
                  updated[idx].value = e.target.value;
                  setDetails(updated);
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setDetails((prev) => prev.filter((d) => d.id !== item.id));
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
          >
            Add Field
          </Button>
        </div>
      </TabsContent>

      {/* Step 4: SEO & Tags */}
      <TabsContent value="seo">
        <div className="space-y-4">
          <div>
            <Label>Tags (comma separated)</Label>
            <Input
              value={form.Tags.join(",")}
              onChange={(e) =>
                updateField(
                  "Tags",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {form.Tags.map((tag, i) => (
                <Badge key={i}>{tag}</Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Meta Title</Label>
            <Input
              value={form.MetaTitle}
              onChange={(e) => updateField("MetaTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Meta Description</Label>
            <Textarea
              value={form.MetaDescription}
              onChange={(e) => updateField("MetaDescription", e.target.value)}
            />
          </div>
        </div>
      </TabsContent>

      {/* Step 5: Review & Submit */}
      <TabsContent value="review">
        <div className="space-y-4">
          <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(form, null, 2)}
          </pre>
          <Button onClick={handleSubmit} disabled={!isValid}>
            {mode == "edit" ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
