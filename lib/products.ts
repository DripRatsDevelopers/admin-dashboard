import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const PRODUCTS_COLLECTION = "Products";

export interface Product {
  ProductId: string;
  Name: string;
  Price: number;
  ImageUrls: string[];
  Category?: string;
  Description: string;
  DiscountedPrice?: number;
  InStock?: boolean;
  DetailedDescription?: Record<string, string>;
}

export async function fetchAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map(
    (doc) => ({ ProductId: doc.id, ...doc.data() } as Product)
  );
}

export async function getProduct(id: string): Promise<Product | null> {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ ProductId: id, ...snap.data() } as Product) : null;
}

export async function addProduct(product: Omit<Product, "id">) {
  return await addDoc(collection(db, PRODUCTS_COLLECTION), product);
}

export async function updateProduct(id: string, product: Omit<Product, "id">) {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  return await updateDoc(ref, product);
}

export async function deleteProduct(id: string) {
  return await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
}
