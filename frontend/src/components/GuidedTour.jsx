import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

const GuidedTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tourCompleted');
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('tourCompleted', 'true');
    }
  };

  const steps = [
    {
      target: 'body',
      content: 'Welcome to ProjectDock SaaS! Let us take a quick tour to help you get started.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-projects',
      content: 'Projects Dashboard: Manage your portfolio, create new projects, and monitor overall health.',
      placement: 'right',
    },
    {
      target: '#tour-tasks',
      content: 'Tasks Hub: View your work in Kanban, Grid, List, or Row formats.',
      placement: 'right',
    },
    {
      target: '#tour-sprints',
      content: 'Agile Sprints: Plan your iterations, track team capacity, and start/complete cycles.',
      placement: 'right',
    },
    {
      target: '#tour-analytics',
      content: 'Analytics & Reporting: Deep dive into project burndown charts and team velocity metrics.',
      placement: 'right',
    },
    {
      target: '#tour-search',
      content: 'Command Palette: Press ⌘K (or Ctrl+K) anywhere to quickly search tasks and projects.',
      placement: 'right',
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#4f46e5',
          textColor: '#1f2937',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        buttonNext: {
          borderRadius: '8px',
          fontWeight: 'bold'
        },
        buttonBack: {
          marginRight: 10
        }
      }}
    />
  );
};

export default GuidedTour;
