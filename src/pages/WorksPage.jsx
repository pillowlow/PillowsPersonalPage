import DownwardContainer from '../components/layout/DownwardContainer';
import ProjectFilters from '../components/ProjectFilters';
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
        <ProjectFilters
          activeFilters={activeFilters}
          toggleFilter={toggleFilter}
          filterKeys={filterKeys}
        />
      </div>
      <DownwardContainer projects={projects} />
    </section>
  );
}
