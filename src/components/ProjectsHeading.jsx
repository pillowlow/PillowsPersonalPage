import { useSiteContent } from '../hooks/useSiteContent';
import ProjectFilters from './ProjectFilters';
import SparkleText from './SparkleText';

export default function ProjectsHeading({ activeFilters, toggleFilter, filterKeys }) {
  const content = useSiteContent();

  return (
    <div className="projects-heading">
      <SparkleText as="h2" className="projects-heading__label">
        {content.sections.projects}
      </SparkleText>
      <ProjectFilters
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        filterKeys={filterKeys}
      />
    </div>
  );
}
