import DownwardContainer from '../components/layout/DownwardContainer';
import ProjectsHeading from '../components/ProjectsHeading';
import SparkleText from '../components/SparkleText';
import { useFilteredProjects } from '../hooks/useFilteredProjects';
import { useSiteContent } from '../hooks/useSiteContent';

export default function WorksPage() {
  const { projects, activeFilters, toggleFilter, filterKeys } = useFilteredProjects();
  const content = useSiteContent();

  return (
    <section className="content-page works-page" aria-label={content.pages.works.title}>
      <div className="content-page__heading">
        <SparkleText as="h1">{content.pages.works.title}</SparkleText>
      </div>
      <ProjectsHeading
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        filterKeys={filterKeys}
      />
      <DownwardContainer projects={projects} />
    </section>
  );
}
