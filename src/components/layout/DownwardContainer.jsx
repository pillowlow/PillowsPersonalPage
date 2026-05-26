import ProjectCard from '../ProjectCard';

export default function DownwardContainer({ projects }) {
  return (
    <section className="downward-container" aria-label="Projects">
      <div className="project-list">
        {projects.length === 0 ? (
          <p className="project-list__empty">No projects match the selected filters.</p>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </section>
  );
}
