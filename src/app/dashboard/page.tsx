"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/usAuth";
import { ProjectResponse } from "../../types/project.type";
import ProjectCard from "../../components/ProjectCard";
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
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(API_ROUTES.PROJECT_LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const projectsArray: ProjectResponse[] = Array.isArray(data.projects)
        ? data.projects
        : Array.isArray(data)
        ? data
        : [];

      setProjects(projectsArray);
    } catch (err) {
      console.error(err);
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
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);

    const payload: any = {
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;

    const res = await fetch(API_ROUTES.PROJECT_DELETE(id), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      fetchProjects();
      showToast("Deleted successfully", "success");
    } else {
      showToast("Delete failed", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white">

      {/* Background Orbs (FIXED COLORS) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/20 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 blur-[100px] animate-float-slower" />
        <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] animate-float-medium" />
      </div>

      <div className="relative z-10 p-6 md:p-8 mt-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Your Projects
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage and monitor your audits
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold hover:scale-105 transition"
          >
            <FiPlus /> New Project
          </button>
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <FiFolderPlus className="text-cyan-400 w-10 h-10" />
            </div>
            <h3 className="text-xl mb-2">No projects yet</h3>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            className="fixed inset-0 bg-black/60 flex items-center justify-center"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="bg-[#111827] p-6 rounded-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Create Project
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <FiX />
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-500"
                />

                <Input
                  placeholder="Website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-500"
                />

                <Input
                  placeholder="Git URL (optional)"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-cyan-500"
                />
              </div>

              <button
                onClick={createProject}
                disabled={loading}
                className="mt-5 w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6">
            <div
              className={`px-4 py-2 rounded ${
                toast.type === "success"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float-slow {
          50% { transform: translate(30px, -30px); }
        }
        @keyframes float-slower {
          50% { transform: translate(-30px, 20px); }
        }
        @keyframes float-medium {
          50% { transform: translate(20px, 30px); }
        }
        .animate-float-slow { animation: float-slow 12s infinite; }
        .animate-float-slower { animation: float-slower 15s infinite; }
        .animate-float-medium { animation: float-medium 10s infinite; }
      `}</style>
    </div>
  );
}