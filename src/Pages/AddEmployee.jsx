import EmployeeFormPage from "./EmployeeFormPage";
import { createEmployee } from "../Utils/EmployeeStore";

export default function AddEmployeePage() {
  return (
    <EmployeeFormPage
      mode="add"
      title="Add New Employee"
      submitLabel="Add Employee"
      onSubmit={(payload) => {
        createEmployee(payload);
      }}
    />
  );
}
