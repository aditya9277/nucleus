import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  modelService,
  ModelDefinition,
  ModelField,
  ModelRBAC,
} from "../services";
import toast from "react-hot-toast";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

const FIELD_TYPES = ["string", "number", "boolean", "date", "email", "json"];
const ROLES = ["Admin", "Manager", "Viewer"];
const PERMISSIONS = ["all", "create", "read", "update", "delete"];

export default function ModelBuilder() {
  const navigate = useNavigate();
  const { modelName } = useParams();
  const isEdit = !!modelName;

  const [name, setName] = useState("");
  const [tableName, setTableName] = useState("");
  const [ownerField, setOwnerField] = useState("");
  const [fields, setFields] = useState<ModelField[]>([
    { name: "id", type: "string", required: true },
  ]);
  const [rbac, setRbac] = useState<ModelRBAC>({
    Admin: ["all" as const],
    Manager: ["create" as const, "read" as const, "update" as const],
    Viewer: ["read" as const],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && modelName) {
      loadModel(modelName);
    }
  }, [isEdit, modelName]);

  const loadModel = async (name: string) => {
    try {
      const model = await modelService.getOne(name);
      setName(model.name);
      setTableName(model.tableName || "");
      setOwnerField(model.ownerField || "");
      setFields(model.fields);
      setRbac(model.rbac);
    } catch (error: any) {
      toast.error("Failed to load model");
      navigate("/");
    }
  };

  const handleAddField = () => {
    setFields([...fields, { name: "", type: "string", required: false }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (
    index: number,
    key: keyof ModelField,
    value: any
  ) => {
    const newFields = [...fields];
    (newFields[index] as any)[key] = value;
    setFields(newFields);
  };

  const handleRbacChange = (
    role: string,
    permission: string,
    checked: boolean
  ) => {
    setRbac((prev) => {
      const current = prev[role] || [];
      const newRbac: ModelRBAC = {
        ...prev,
        [role]: checked
          ? [
              ...current,
              permission as "create" | "read" | "update" | "delete" | "all",
            ]
          : current.filter((p) => p !== permission),
      };
      return newRbac;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Model name is required");
      return;
    }

    if (fields.length === 0) {
      toast.error("At least one field is required");
      return;
    }

    // Validate fields
    for (const field of fields) {
      if (!field.name.trim()) {
        toast.error("All fields must have a name");
        return;
      }
    }

    setLoading(true);

    try {
      const model: ModelDefinition = {
        name: name.trim(),
        tableName: tableName.trim() || undefined,
        fields,
        ownerField: ownerField.trim() || undefined,
        rbac: rbac,
        timestamps: true,
      };

      if (isEdit) {
        await modelService.update(name, model);
        toast.success("Model updated successfully");
      } else {
        await modelService.create(model);
        toast.success("Model published successfully");
      }

      navigate("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          `Failed to ${isEdit ? "update" : "create"} model`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="btn-secondary flex items-center space-x-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Edit Model" : "Create New Model"}
        </h1>
        <p className="text-gray-600 mt-1">
          Define your data model with fields and permissions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Employee, Product, Student..."
                required
                disabled={isEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Name (optional)
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="input"
                placeholder="employees (defaults to lowercase plural)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Field (optional)
              </label>
              <input
                type="text"
                value={ownerField}
                onChange={(e) => setOwnerField(e.target.value)}
                className="input"
                placeholder="ownerId, userId..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for ownership-based access control
              </p>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Fields</h2>
            <button
              type="button"
              onClick={handleAddField}
              className="btn-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={index}
                className="flex space-x-2 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) =>
                      handleFieldChange(index, "name", e.target.value)
                    }
                    className="input"
                    placeholder="Field name"
                    required
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={field.type}
                      onChange={(e) =>
                        handleFieldChange(index, "type", e.target.value)
                      }
                      className="input">
                      {FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={field.default || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "default", e.target.value)
                      }
                      className="input"
                      placeholder="Default value"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.required || false}
                        onChange={(e) =>
                          handleFieldChange(index, "required", e.target.checked)
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Required</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.unique || false}
                        onChange={(e) =>
                          handleFieldChange(index, "unique", e.target.checked)
                        }
                        className="rounded"
                      />
                      <span className="text-sm">Unique</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="btn-danger p-2"
                  disabled={fields.length === 1}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RBAC */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">
            Role-Based Access Control
          </h2>

          <div className="space-y-4">
            {ROLES.map((role) => (
              <div key={role} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3">{role}</h3>
                <div className="flex flex-wrap gap-4">
                  {PERMISSIONS.map((permission) => (
                    <label
                      key={permission}
                      className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={
                          rbac[role]?.includes(
                            permission as
                              | "create"
                              | "read"
                              | "update"
                              | "delete"
                              | "all"
                          ) || false
                        }
                        onChange={(e) =>
                          handleRbacChange(role, permission, e.target.checked)
                        }
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Model"
                : "Publish Model"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
