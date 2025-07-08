import ProjectTaskDetailSimple from '@/components/project-tasks/project-task-detail-simple';

interface ProjectTaskPageProps {
  params: {
    id: string;
  };
}

export default function ProjectTaskPage({ params }: ProjectTaskPageProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <ProjectTaskDetailSimple taskId={params.id} />
    </div>
  );
}

