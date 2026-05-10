import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import NotFound from "./Components/Notfound";
import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";
import AuthLayout from "./Layouts/AuthLayout";
import BranchesLayout from "./Layouts/BranchesLayout";
import EmployeeLayout from "./Layouts/EmployeeLayout";
import InventoryLayout from "./Layouts/InventoryLayout";
import MainLayout from "./Layouts/MainLayout";
import ProductLayout from "./Layouts/ProductLayout";
import SalesLayout from "./Layouts/SalesLayout";
import AddBranchPage from "./Pages/AddBranch";
import AddEmployeePage from "./Pages/AddEmployee";
import AddProductPage from "./Pages/AddProductPage";
import AddSalePage from "./Pages/AddSale";
import CardPaymentPage from "./Pages/CardPayment";
import BranchDetails from "./Pages/BranchDetails";
import Branches from "./Pages/Branches";
import EditBranchPage from "./Pages/EditBranch";
import EditEmployeePage from "./Pages/EditEmployee";
import EditProductPage from "./Pages/EditProductPage";
import Employees from "./Pages/Employees";
import Home from "./Pages/Home";
import Inventory from "./Pages/Inventory";
import InventoryAddStock from "./Pages/InventoryAddStock";
import InventoryDeductStock from "./Pages/InventoryDeductStock";
import InventoryTransferStock from "./Pages/InventoryTransferStock";
import Login from "./Pages/Login";
import ProductDetails from "./Pages/ProductDetails";
import Products from "./Pages/Products";
import Profit from "./Pages/Profit";
import SaleDetailsPage from "./Pages/SalesDetails";
import Sales from "./Pages/Sales";
import Settings from "./Pages/settings";
import Signup from "./Pages/Signup";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/register", element: <Navigate to="/signup" replace /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "home", element: <Home /> },
      {
        path: "products",
        element: <ProductLayout />,
        children: [
          { index: true, element: <Products /> },
          { path: "add", element: <AddProductPage /> },
          { path: ":id", element: <ProductDetails /> },
          { path: "edit/:id", element: <EditProductPage /> },
        ],
      },
      {
        path: "inventory",
        element: <InventoryLayout />,
        children: [
          { index: true, element: <Inventory /> },
          { path: "add/:id", element: <InventoryAddStock /> },
          { path: "deduct/:id", element: <InventoryDeductStock /> },
          { path: "transfer/:id", element: <InventoryTransferStock /> },
        ],
      },
      {
        path: "sales",
        element: <SalesLayout />,
        children: [
          { index: true, element: <Sales /> },
          { path: "add", element: <AddSalePage /> },
          { path: "card-payment", element: <CardPaymentPage /> },
          { path: ":id", element: <SaleDetailsPage /> },
        ],
      },
      { path: "profit", element: <Profit /> },
      {
        path: "employees",
        element: <EmployeeLayout />,
        children: [
          { index: true, element: <Employees /> },
          { path: "add", element: <AddEmployeePage /> },
          { path: "edit/:id", element: <EditEmployeePage /> },
        ],
      },
      {
        path: "branches",
        element: <BranchesLayout />,
        children: [
          { index: true, element: <Branches /> },
          { path: "add", element: <AddBranchPage /> },
          { path: "edit/:id", element: <EditBranchPage /> },
          { path: ":id", element: <BranchDetails /> },
        ],
      },
      { path: "settings", element: <Settings /> },
      { path: "admin", element: <Navigate to="/home" replace /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
