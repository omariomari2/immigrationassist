import { ProjectOption } from './ProjectsDashboard';

interface ProjectSelectorProps {
    activeProject: ProjectOption;
    onProjectChange: (project: ProjectOption) => void;
}

export function ProjectSelector({ activeProject, onProjectChange }: ProjectSelectorProps) {
    return (
        <div className="flex space-x-1 bg-white p-1 rounded-2xl w-fit shadow-soft">
            {Object.values(ProjectOption).map((option) => (
                <button
                    key={option}
                    onClick={() => onProjectChange(option)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${activeProject === option
                        ? 'bg-black text-white shadow-md transform scale-105'
                        : 'text-gray-400 hover:text-black hover:bg-gray-50'
                        }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
