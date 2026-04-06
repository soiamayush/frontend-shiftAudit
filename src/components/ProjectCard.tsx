// import React from "react";
// import { ProjectResponse } from "../types/project.type";
// import { FiTrash2, FiCheck, FiClock } from "react-icons/fi";

// interface ProjectCardProps {
//   project: ProjectResponse;
//   onClick?: () => void;
//   onDelete?: () => void;
// }

// export default function ProjectCard({
//   project,
//   onClick,
//   onDelete,
// }: ProjectCardProps) {
//   return (
//     <div
//       onClick={onClick}
//       className="group relative cursor-pointer rounded-xl bg-white/5 hover:bg-white/10 transition-all p-4 shadow-md border border-white/10 w-full max-w-xs h-36 flex flex-col justify-between"
//     >
//       <div className="flex flex-col gap-0.5">
//         <h3 className="text-white text-base font-medium">{project.name}</h3>
//         <p className="text-l text-white-400 truncate">{project.website}</p>
//       </div>

//       {/* Analysis complete badge */}
//       {project.status === "complete" ? (
//         <div className="absolute bottom-3 left-3 flex items-center gap-1">
//           <div className="w-6 h-6 border-2 border-green-500 rounded-full flex items-center justify-center">
//             <FiCheck
//               size={14}
//               className="text-green-500"
//               title="Analysis complete"
//             />
//           </div>
//         </div>
//       ) : (
//         <div className="absolute bottom-3 left-3 flex items-center gap-1">
//         <div
//           title="Analysis pending"
//         >
//           <FiClock size={16} className="text-yellow-500" />
//         </div>
//         </div>
//       )}

//       {onDelete && (
//         <FiTrash2
//           size={16}
//           onClick={(e) => {
//             e.stopPropagation();
//             onDelete();
//           }}
//           className="absolute bottom-3 right-3 text-gray-400  hover:text-red-400 transition"
//           title="Delete project"
//         />
//       )}
//     </div>
//   );
// }

import React from "react";
import { ProjectResponse } from "../types/project.type";
import { FiTrash2, FiCheck, FiClock } from "react-icons/fi";

interface ProjectCardProps {
  project: ProjectResponse;
  onClick?: () => void;
  onDelete?: () => void;
}

export default function ProjectCard({
  project,
  onClick,
  onDelete,
}: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className="
        sa-animated-ring
        group relative cursor-pointer
        w-full max-w-xs h-36
        overflow-hidden
        transition-all duration-300
        hover:-translate-y-1
      "
    >
      {/* Card content surface */}
      <div
        className="
          relative z-10 h-full w-full
          rounded-[1rem]
          border border-white/10
          bg-white/[0.04] hover:bg-white/[0.06]
          backdrop-blur-xl
          p-4 pl-10
          shadow-[0_18px_55px_-35px_rgba(0,0,0,0.9)]
        "
      >
      {/* Status badge top-left */}
      <div
        className={`
          absolute top-2 left-2 flex items-center justify-center
          w-6 h-6 rounded-full text-xs
          ${
            project.status === "complete"
              ? "bg-green-600 text-white"
              : "bg-yellow-500 text-black"
          }
        `}
        title={
          project.status === "complete"
            ? "Analysis complete"
            : "Analysis pending"
        }
      >
        {project.status === "complete" ? (
          <FiCheck size={14} />
        ) : (
          <FiClock size={14} />
        )}
      </div>

      {/* Title + URL */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-white text-base font-semibold">{project.name}</h3>
        <p className="text-sm text-gray-400 truncate" title={project.website}>
          {project.website}
        </p>
      </div>

      {/* Delete icon top-right, visible on hover */}
      {onDelete && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <FiTrash2
            size={16}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-400 cursor-pointer"
            title="Delete project"
          />
        </div>
      )}
      </div>
    </div>
  );
}
