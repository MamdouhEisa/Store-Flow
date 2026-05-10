import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BranchFormPage from "./BranchesFormPage";
import { getBranchById, updateBranch } from "../Utils/BranchesStore";

export default function EditBranchPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const branch = useMemo(() => getBranchById(id), [id]);

  if (!branch) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[860px] rounded-3xl border border-dashed border-[#d3d3d3]  p-10 text-center">
          <p className="text-base text-[#80858d]">Branch not found.</p>
          <button
            type="button"
            onClick={() => navigate("/branches")}
            className="mt-4 rounded-xl bg-[#ff7a1a] px-5 py-2 text-sm font-semibold text-white"
          >
            Back to branches
          </button>
        </div>
      </div>
    );
  }

  return (
    <BranchFormPage
      mode="edit"
      title={`Edit ${branch.name}`}
      submitLabel="Save Changes"
      initialValues={{
        branchName: branch.name,
        streetAddress: branch.address,
        city: branch.city,
        email: branch.email,
        phone: branch.phone,
        branchManager: branch.manager,
      }}
      onSubmit={(payload) => updateBranch(id, payload)}
    />
  );
}
