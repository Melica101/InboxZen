import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import ActionModal from './components/ActionModal.jsx';

// Pages
import DailyBriefing from './pages/DailyBriefing.jsx';
import SmartInbox    from './pages/SmartInbox.jsx';
import Commitments   from './pages/Commitments.jsx';
import RiskRadar     from './pages/RiskRadar.jsx';
import CalendarPage  from './pages/CalendarPage.jsx';
import AgentActivity from './pages/AgentActivity.jsx';
import PrivacyCenter from './pages/PrivacyCenter.jsx';
import ConnectMail   from './pages/ConnectMail.jsx';
import ProfilePage   from './pages/ProfilePage.jsx';

const PAGES = {
  'Daily briefing': DailyBriefing,
  'Smart inbox':    SmartInbox,
  'Commitments':    Commitments,
  'Risk radar':     RiskRadar,
  'Calendar':       CalendarPage,
  'Agent activity': AgentActivity,
  'Privacy center': PrivacyCenter,
  'Connect mail':   ConnectMail,
  'Profile':        ProfilePage,
};

function AppShell() {
  const { state } = useApp();
  const PageComponent = PAGES[state.page] || DailyBriefing;

  return (
    <div className="shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-body">
          <div className="page-enter" key={state.page}>
            <PageComponent />
          </div>
        </main>
      </div>
      <ActionModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
