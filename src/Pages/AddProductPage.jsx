import ProductFormPage from "./ProductForm";
import { createProduct } from "../Utils/ProductStore";

export default function AddProductPage({ routerNavigate }) {
  return (
    <ProductFormPage
      mode="add"
      routerNavigate={routerNavigate}
      title="Add New Product"
      submitLabel="Add Product"
      onSubmit={(payload) => {
        createProduct(payload);
      }}
    />
  );
}
