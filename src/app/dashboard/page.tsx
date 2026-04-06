"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/usAuth";
import { ProjectResponse } from "../../types/project.type";
import ProjectCard from "../../components/ProjectCard";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { API_ROUTES } from "@/config";
import { FiPlus, FiX, FiFolderPlus } from "react-icons/fi";

export default function DashboardPage() {
  const router = useRouter();
  const { token, loading, setLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [website, setWebsite] = useState("");
  const [gitUrl, setGitUrl] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(API_ROUTES.PROJECT_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setProjects([]);
        return;
      }
      const projectsArray: ProjectResponse[] = Array.isArray(data.projects)
        ? data.projects
        : Array.isArray(data)
        ? data
        : [];
      setProjects(projectsArray);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    }
  }, [token]);

  useEffect(() => {
    if (loading) return;
    if (!token) return router.push("/auth/login");
    fetchProjects();
  }, [token, loading, router, fetchProjects]);

  if (loading) return null;

  const createProject = async () => {
    if (!projectName.trim() || !website.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setLoading(true);

    const payload: { name: string; website: string; gitUrl?: string } = {
      name: projectName.trim(),
      website: website.trim(),
    };
    if (gitUrl.trim()) payload.gitUrl = gitUrl.trim();

    const res = await fetch(API_ROUTES.PROJECT_CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setProjectName("");
      setWebsite("");
      setGitUrl("");
      setModalOpen(false);
      await fetchProjects();
      showToast("Project created successfully!", "success");
    } else {
      showToast("Failed to create project", "error");
    }
    setLoading(false);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const res = await fetch(API_ROUTES.PROJECT_DELETE(projectId), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      fetchProjects();
      showToast("Project deleted successfully", "success");
    } else {
      showToast("Failed to delete project", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#8B5CF6] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#06B6D4] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-float-slower" />
        <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] bg-[#EC4899] rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-float-medium" />
      </div>

      <div className="relative z-10 p-6 md:p-8 mt-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Your Projects
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Manage and monitor your web performance audits
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2 overflow-hidden cursor-pointer"
          >
            <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Project</span>
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <FiFolderPlus className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to start auditing</p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:scale-105 transition-all cursor-pointer"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => router.push(`/dashboard/${p.id}`)}
                onDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-2xl shadow-2xl w-full max-w-md border border-white/10 transform animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Create New Project
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg"
                    placeholder="e.g., My Awesome App"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website URL <span className="text-red-400">*</span>
                  </label>
                  <Input
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Git Repository URL <span className="text-gray-500">(optional)</span>
                  </label>
                  <Input
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg"
                    placeholder="https://github.com/username/repo"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-white/10">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div
              className={`px-5 py-3 rounded-xl shadow-lg backdrop-blur-md border ${
                toast.type === "success"
                  ? "bg-green-500/20 border-green-500/50 text-green-400"
                  : "bg-red-500/20 border-red-500/50 text-red-400"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.05); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(1.08); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 30px) scale(1.03); }
        }
        .animate-float-slow { animation: float-slow 12s infinite ease-in-out; }
        .animate-float-slower { animation: float-slower 15s infinite ease-in-out; }
        .animate-float-medium { animation: float-medium 10s infinite ease-in-out; }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}