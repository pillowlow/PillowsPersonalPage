import UpperContainer from './UpperContainer';
import ProjectsHeading from '../ProjectsHeading';
import DownwardContainer from './DownwardContainer';
import { useFilteredProjects } from '../../hooks/useFilteredProjects';

export default function AppLayout() {
  const { projects, activeFilters, toggleFilter, filterKeys } = useFilteredProjects();

  return (
    <div className="app-layout">
      <UpperContainer />
      <ProjectsHeading
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        filterKeys={filterKeys}
      />
      <DownwardContainer projects={projects} />
    </div>
  );
}
