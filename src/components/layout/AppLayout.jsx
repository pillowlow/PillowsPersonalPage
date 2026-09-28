import { useEffect } from 'react';
import useHashRoute from '../../hooks/useHashRoute';
import AccountsPage from '../../pages/AccountsPage';
import DemosPage from '../../pages/DemosPage';
import HomePage from '../../pages/HomePage';
import IntroPage from '../../pages/IntroPage';
import WorksPage from '../../pages/WorksPage';
import SiteHeader from './SiteHeader';

export default function AppLayout() {
  const { routeId } = useHashRoute();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [routeId]);

  const Page = {
    home: HomePage,
    intro: IntroPage,
    accounts: AccountsPage,
    demos: DemosPage,
    works: WorksPage,
  }[routeId] ?? HomePage;

  return (
    <div className="app-layout">
      <SiteHeader routeId={routeId} />
      <main className="page-content">
        <Page />
      </main>
    </div>
  );
}
