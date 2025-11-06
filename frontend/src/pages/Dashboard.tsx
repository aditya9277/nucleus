import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { modelService } from "../services";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Database, Plus, Edit, Trash2, Eye, Clock } from "lucide-react";

interface Model {
  name: string;
  tableName?: string;
  fieldCount: number;
  ownerField?: string;
  timestamps?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function Dashboard() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await modelService.getAll();
      setModels(response.models);
    } catch (error: any) {
      toast.error("Failed to load models");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete the model "${modelName}"?`)) {
      return;
    }

    try {
      await modelService.delete(modelName);
      toast.success("Model deleted successfully");
      loadModels();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete model");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 font-medium">Loading models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Manage your data models and records
          </p>
        </div>

        {user?.role === "Admin" && (
          <Link
            to="/models/new"
            className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Create Model</span>
          </Link>
        )}
      </div>

      {models.length === 0 ? (
        <div className="card text-center py-16">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Database className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No models yet
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Get started by creating your first data model to organize and manage
            your data
          </p>
          {user?.role === "Admin" && (
            <Link
              to="/models/new"
              className="btn-primary inline-flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Your First Model</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <div
              key={model.name}
              className="card group hover:scale-105 transition-transform duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {model.name}
                    </h3>
                    {model.tableName && (
                      <p className="text-sm text-gray-500">{model.tableName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fields:</span>
                  <span className="badge badge-primary">
                    {model.fieldCount} fields
                  </span>
                </div>
                {model.ownerField && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Owner Field:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {model.ownerField}
                    </span>
                  </div>
                )}
                {model.updatedAt && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(model.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <Link
                  to={`/data/${model.name}`}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View Data</span>
                </Link>

                {user?.role === "Admin" && (
                  <>
                    <Link
                      to={`/models/${model.name}/edit`}
                      className="btn-secondary p-2.5 hover:bg-blue-50"
                      title="Edit Model">
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(model.name)}
                      className="btn-danger p-2.5"
                      title="Delete Model">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
