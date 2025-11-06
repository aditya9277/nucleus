import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { modelService, crudService, ModelDefinition } from "../services";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, ArrowLeft, X } from "lucide-react";

export default function DataManager() {
  const { modelName } = useParams<{ modelName: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [model, setModel] = useState<ModelDefinition | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (modelName) {
      loadModel();
      loadRecords();
    }
  }, [modelName]);

  const loadModel = async () => {
    try {
      const data = await modelService.getOne(modelName!);
      setModel(data);
    } catch (error: any) {
      toast.error("Failed to load model");
      navigate("/");
    }
  };

  const loadRecords = async () => {
    try {
      const response = await crudService.getAll(modelName!);
      setRecords(response.data || []);
    } catch (error: any) {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    const data: Record<string, any> = {};
    model?.fields.forEach((field) => {
      // Skip ID field as it's auto-generated
      if (field.name !== "id") {
        data[field.name] = record[field.name];
      }
    });
    setFormData(data);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      await crudService.delete(modelName!, id);
      toast.success("Record deleted successfully");
      loadRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete record");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRecord) {
        await crudService.update(modelName!, editingRecord.id, formData);
        toast.success("Record updated successfully");
      } else {
        await crudService.create(modelName!, formData);
        toast.success("Record created successfully");
      }
      setShowForm(false);
      loadRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save record");
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const renderFieldInput = (field: any) => {
    const value = formData[field.name] || "";

    switch (field.type) {
      case "boolean":
        return (
          <select
            value={value.toString()}
            onChange={(e) =>
              handleInputChange(field.name, e.target.value === "true")
            }
            className="input"
            required={field.required}>
            <option value="">Select...</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="input"
            required={field.required}
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="input"
            required={field.required}
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="input"
            required={field.required}
          />
        );

      case "json":
        return (
          <textarea
            value={
              typeof value === "string" ? value : JSON.stringify(value, null, 2)
            }
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="input"
            rows={4}
            required={field.required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="input"
            required={field.required}
          />
        );
    }
  };

  const renderCellValue = (value: any, type: string) => {
    if (value === null || value === undefined) return "-";

    if (type === "boolean") return value ? "Yes" : "No";
    if (type === "json") return JSON.stringify(value);
    if (type === "date") return new Date(value).toLocaleDateString();

    return value.toString();
  };

  const canCreate =
    model?.rbac[user?.role || ""]?.includes("create") ||
    model?.rbac[user?.role || ""]?.includes("all") ||
    user?.role === "Admin";

  const canUpdate =
    model?.rbac[user?.role || ""]?.includes("update") ||
    model?.rbac[user?.role || ""]?.includes("all") ||
    user?.role === "Admin";

  const canDelete =
    model?.rbac[user?.role || ""]?.includes("delete") ||
    model?.rbac[user?.role || ""]?.includes("all") ||
    user?.role === "Admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!model) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate("/")}
            className="btn-secondary flex items-center space-x-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            {model.name} Data
          </h1>
          <p className="text-gray-600 mt-1">
            Manage {model.name.toLowerCase()} records
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Record</span>
          </button>
        )}
      </div>

      {/* Records Table */}
      {records.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No records yet</p>
          {canCreate && (
            <button onClick={handleCreate} className="btn-primary">
              Create First Record
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {model.fields.map((field) => (
                  <th
                    key={field.name}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {field.name}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </th>
                ))}
                {(canUpdate || canDelete) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {model.fields.map((field) => (
                    <td
                      key={field.name}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCellValue(record[field.name], field.type)}
                    </td>
                  ))}
                  {(canUpdate || canDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-primary-600 hover:text-primary-900">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingRecord ? "Edit Record" : "Create Record"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {model.fields
                .filter((field) => field.name !== "id") // Skip auto-generated ID field
                .map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.name}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                      <span className="text-gray-400 ml-2 text-xs">
                        ({field.type})
                      </span>
                    </label>
                    {renderFieldInput(field)}
                  </div>
                ))}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingRecord ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
