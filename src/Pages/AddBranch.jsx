import BranchFormPage from "./BranchesFormPage";
import { createBranch } from "../Utils/BranchesStore";

export default function AddBranchPage() {
  return (
    <BranchFormPage
      mode="add"
      title="Add New Branch"
      submitLabel="Add Branch"
      onSubmit={(payload) => {
        createBranch(payload);
      }}
    />
  );
}
