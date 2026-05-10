import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeFormPage from "./EmployeeFormPage";
import { getEmployeeById, updateEmployee } from "../Utils/EmployeeStore";

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const employee = useMemo(() => getEmployeeById(id), [id]);

  if (!employee) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-215 rounded-3xl border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center">
          <p className="text-base text-[#80858d]">Employee not found.</p>
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="mt-4 rounded-xl bg-[#ff7a1a] px-5 py-2 text-sm font-semibold text-white"
          >
            Back to employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <EmployeeFormPage
      mode="edit"
      title={`Edit ${employee.fullName}`}
      submitLabel="Save Changes"
      initialValues={{
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        branch: employee.branch,
        password: "",
      }}
      onSubmit={(payload) => {
        updateEmployee(id, payload);
      }}
    />
  );
}
