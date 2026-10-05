import fs from 'fs';

let c = fs.readFileSync('src/control/useHome.ts', 'utf8');

c = c.replace(/const \[configMenuState, setConfigMenuState\] = useState<ConfigMenuState>\('none'\);/, 
`const [configMenuState, setConfigMenuState] = useState<ConfigMenuState>('none');
  const [infoReportSource, setInfoReportSource] = useState<NavigationView>('home');`);

c = c.replace(/const handleOpenReport = useCallback\(\(report: IssueReport\) => \{\s*handleMarkAsRead\(report.issueId\);\s*setSelectedReport\(report\);\s*navigateTo\('info-report'\);\s*\}, \[handleMarkAsRead, navigateTo\]\);/,
`const handleOpenReport = useCallback((report: IssueReport) => {
    handleMarkAsRead(report.issueId);
    setSelectedReport(report);
    setInfoReportSource(activeView);
    navigateTo('info-report');
  }, [activeView, handleMarkAsRead, navigateTo]);

  const handleCloseInfoReport = useCallback(() => {
    navigateTo(infoReportSource);
  }, [infoReportSource, navigateTo]);`);

c = c.replace(/if \(activeView === 'info-report'\) \{\s*navigateTo\('home'\);\s*return true;\s*\}/,
`if (activeView === 'info-report') {
      navigateTo(infoReportSource);
      return true;
    }`);

c = c.replace(/handleOpenReport,\s*handleOpenConfiguration,/,
`handleOpenReport,
    handleCloseInfoReport,
    handleOpenConfiguration,`);

fs.writeFileSync('src/control/useHome.ts', c);

let h = fs.readFileSync('src/pages/Home.tsx', 'utf8');
h = h.replace(/handleOpenReport,\s*handleOpenConfiguration,/, 
`handleOpenReport,
    handleCloseInfoReport,
    handleOpenConfiguration,`);

h = h.replace(/onBack=\{.*navigateTo\('home'\).*\}/, `onBack={handleCloseInfoReport}`);

fs.writeFileSync('src/pages/Home.tsx', h);
console.log('Fixed useHome.ts and Home.tsx');
