import React, { useState } from 'react';
import { ExplorationDirection } from './types';
import { DesignExplorationBar } from './DesignExplorationBar';
import { Direction01Minimal } from './Direction01Minimal/Direction01Minimal';
import { Direction02SaaS } from './Direction02SaaS/Direction02SaaS';
import { Direction03Premium } from './Direction03Premium/Direction03Premium';
import '../../styles/exploration.css';

export const DailyPatientQueueExploration: React.FC = () => {
  const [direction, setDirection] = useState<ExplorationDirection>('minimal');

  return (
    <div className="daily-queue-exploration">
      <DesignExplorationBar
        currentDirection={direction}
        onSelectDirection={setDirection}
      />
      {direction === 'minimal' && <Direction01Minimal />}
      {direction === 'saas' && <Direction02SaaS />}
      {direction === 'premium' && <Direction03Premium />}
    </div>
  );
};