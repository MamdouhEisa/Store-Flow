import { useMemo } from "react";
import ProductFormPage from "./ProductForm";
import { getProductById, updateProduct } from "../Utils/ProductStore";

export default function EditProductPage({ productId, routerNavigate }) {
  const resolvedId = useMemo(() => {
    if (productId) return productId;
    if (typeof window === "undefined") return "";

    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  }, [productId]);

  const product = getProductById(resolvedId);

  const initialValues = product
    ? {
        productName: product.name,
        productCode: product.code,
        branch: product.branch,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        initialStock: product.stock,
        imageUrl: product.imageUrl || "",
      }
    : undefined;

  if (!product) {
    return (
      <div className="min-h-screen bg-white px-4 py-8 text-[#23262b] sm:px-8">
        <div className="mx-auto max-w-[860px] rounded-3xl border border-dashed border-[#d3d3d3] p-10 text-center">
          <p className="text-base text-[#80858d]">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <ProductFormPage
      mode="edit"
      routerNavigate={routerNavigate}
      title={`Edit ${product.name}`}
      submitLabel="Save Changes"
      initialValues={initialValues}
      onSubmit={(payload) => {
        if (!resolvedId) return;
        updateProduct(resolvedId, payload);
      }}
    />
  );
}
