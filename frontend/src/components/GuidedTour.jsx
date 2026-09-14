import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

const GuidedTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('tourCompleted');
    if (!hasSeenTour) {
      setRun(true);
    }

    const startTour = () => setRun(true);
    window.addEventListener('start-tour', startTour);
    return () => window.removeEventListener('start-tour', startTour);
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status, action } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    // Also save if user closes the tour halfway
    if (finishedStatuses.includes(status) || action === 'close') {
      setRun(false);
      localStorage.setItem('tourCompleted', 'true');
    }
  };

  const steps = [
    {
      target: 'body',
      content: 'Welcome to ProjectDock SaaS! We are absolutely thrilled to have you here. This quick guide will walk you through how to use the platform to supercharge your team\'s productivity and streamline your workflows. Let\'s dive in!',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-projects',
      content: 'Think of the Projects dashboard as your central command center. Here, you can organize all your different initiatives, track their overall health status, and keep all related work perfectly grouped together.',
      placement: 'right',
    },
    {
      target: '#tour-tasks',
      content: 'The Tasks Hub is where the real work happens. You can visualize your work exactly how you want—whether that is a Kanban board for moving cards through stages, a Grid for a quick overview, or a List for detailed sorting.',
      placement: 'right',
    },
    {
      target: '#tour-sprints',
      content: 'Welcome to agile planning! Use the Sprints section to define specific timeframes (like 2 weeks) for your team to accomplish a set goal. You can track team capacity here and click \'Start Sprint\' when you are ready to kick things off.',
      placement: 'right',
    },
    {
      target: '#tour-analytics',
      content: 'Data is power. In the Analytics section, you will find visual burndown charts to see if your team is on track to finish their sprint, alongside team velocity metrics to help you plan future work more accurately.',
      placement: 'right',
    },
    {
      target: '#tour-search',
      content: 'Need to find something fast? Just press ⌘K (or Ctrl+K) anywhere in the app to instantly search across all your tasks and projects without ever touching your mouse. Give it a try later!',
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
