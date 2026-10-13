import React, { useState } from 'react';
import { ExplorationDirection } from './types';

interface DesignExplorationBarProps {
  currentDirection: ExplorationDirection;
  onSelectDirection: (direction: ExplorationDirection) => void;
}

export const DesignExplorationBar: React.FC<DesignExplorationBarProps> = ({
  currentDirection,
  onSelectDirection,
}) => {
  const [isSpecOpen, setIsSpecOpen] = useState(false);

  return (
    <aside className="exploration-bar" aria-label="Design Exploration Switcher">
      <div className="exploration-bar-inner">
        <div className="exploration-brand">
          <span className="exploration-badge">DESIGN EXPLORATION</span>
          <span className="exploration-title">
            <strong>Shfaa / شفاء</strong>
            <span className="exploration-subtitle">— Daily Patient Queue Prototype</span>
          </span>
        </div>

        <div className="exploration-switchers" role="tablist" aria-label="Choose design direction">
          <button
            type="button"
            className={`dir-switch-btn btn-minimal ${currentDirection === 'minimal' ? 'dir-switch-btn--active' : ''}`}
            onClick={() => onSelectDirection('minimal')}
            role="tab"
            aria-selected={currentDirection === 'minimal'}
            id="tab-dir-minimal"
          >
            <span className="dir-num">01</span>
            <span>Minimal Clinical</span>
          </button>

          <button
            type="button"
            className={`dir-switch-btn btn-saas ${currentDirection === 'saas' ? 'dir-switch-btn--active' : ''}`}
            onClick={() => onSelectDirection('saas')}
            role="tab"
            aria-selected={currentDirection === 'saas'}
            id="tab-dir-saas"
          >
            <span className="dir-num">02</span>
            <span>Modern SaaS Workstation</span>
          </button>

          <button
            type="button"
            className={`dir-switch-btn btn-premium ${currentDirection === 'premium' ? 'dir-switch-btn--active' : ''}`}
            onClick={() => onSelectDirection('premium')}
            role="tab"
            aria-selected={currentDirection === 'premium'}
            id="tab-dir-premium"
          >
            <span className="dir-num">03</span>
            <span>Premium Clinical</span>
          </button>
        </div>

        <div className="exploration-actions">
          <button
            type="button"
            className="btn-spec-toggle"
            onClick={() => setIsSpecOpen(prev => !prev)}
            aria-expanded={isSpecOpen}
          >
            <span>{isSpecOpen ? 'Hide' : 'Compare'} Design Rationale</span>
            <span aria-hidden="true">{isSpecOpen ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {isSpecOpen && (
        <div className="exploration-spec-sheet" id="exploration-spec-panel">
          <div className="spec-sheet-grid">
            {/* Direction 01 Spec */}
            <div className={`spec-col ${currentDirection === 'minimal' ? 'spec-col--active' : ''}`}>
              <div className="spec-header">
                <span className="spec-title">01 · Minimal Clinical</span>
                <span className="spec-tag">Calm & Focused</span>
              </div>
              <p className="spec-desc">
                Minimalist focus mode. Monolithic flat canvas with intentional whitespace. Zero boxed cards. Answers immediately: &ldquo;What do I need to do right now?&rdquo;
              </p>
              <ul className="spec-props">
                <li><span className="spec-prop-label">Layout:</span> <span className="spec-prop-val">Open Canvas, Borderless</span></li>
                <li><span className="spec-prop-label">Density:</span> <span className="spec-prop-val">Relaxed (20-28px spacing)</span></li>
                <li><span className="spec-prop-label">Surfaces:</span> <span className="spec-prop-val">Monolithic White (#ffffff)</span></li>
                <li><span className="spec-prop-label">Typography:</span> <span className="spec-prop-val">Light/Medium System Sans</span></li>
                <li><span className="spec-prop-label">Table:</span> <span className="spec-prop-val">Hairline Dividers, Spacious Rows</span></li>
                <li><span className="spec-prop-label">Controls:</span> <span className="spec-prop-val">Quiet Text Tabs & Pills</span></li>
                <li><span className="spec-prop-label">Palette:</span> <span className="spec-prop-val">Monochrome Slate (#0f172a)</span></li>
              </ul>
            </div>

            {/* Direction 02 Spec */}
            <div className={`spec-col ${currentDirection === 'saas' ? 'spec-col--active' : ''}`}>
              <div className="spec-header">
                <span className="spec-title">02 · Modern SaaS Workstation</span>
                <span className="spec-tag">Structured High-Density</span>
              </div>
              <p className="spec-desc">
                High-throughput operational workstation. Modular paneling, segmented controls, discrete KPI cards with micro-accents, and high row scannability.
              </p>
              <ul className="spec-props">
                <li><span className="spec-prop-label">Layout:</span> <span className="spec-prop-val">Structured Modular Panels</span></li>
                <li><span className="spec-prop-label">Density:</span> <span className="spec-prop-val">Compact (8-12px spacing, 40px rows)</span></li>
                <li><span className="spec-prop-label">Surfaces:</span> <span className="spec-prop-val">Slate (#f1f5f9) + Crisp White Cards</span></li>
                <li><span className="spec-prop-label">Typography:</span> <span className="spec-prop-val">High-Contrast Neo-Grotesque</span></li>
                <li><span className="spec-prop-label">Table:</span> <span className="spec-prop-val">Dense Grid with Hover Tints</span></li>
                <li><span className="spec-prop-label">Controls:</span> <span className="spec-prop-val">Segmented Pills, Shortcut Hints</span></li>
                <li><span className="spec-prop-label">Palette:</span> <span className="spec-prop-val">Cobalt Accent (#0284c7)</span></li>
              </ul>
            </div>

            {/* Direction 03 Spec */}
            <div className={`spec-col ${currentDirection === 'premium' ? 'spec-col--active' : ''}`}>
              <div className="spec-header">
                <span className="spec-title">03 · Premium Clinical</span>
                <span className="spec-tag">Refined Authority & Depth</span>
              </div>
              <p className="spec-desc">
                Authoritative hospital/clinic operating system. Layered soft elevation, executive crest, refined typography, and harmonious proportional balance.
              </p>
              <ul className="spec-props">
                <li><span className="spec-prop-label">Layout:</span> <span className="spec-prop-val">Balanced Deck Architecture</span></li>
                <li><span className="spec-prop-label">Density:</span> <span className="spec-prop-val">Harmonious Proportional (16px module)</span></li>
                <li><span className="spec-prop-label">Surfaces:</span> <span className="spec-prop-val">Warm Slate + Soft Elevation Shadows</span></li>
                <li><span className="spec-prop-label">Typography:</span> <span className="spec-prop-val">Refined Weights, Taller x-height</span></li>
                <li><span className="spec-prop-label">Table:</span> <span className="spec-prop-val">Clinical Ledger with Pill Badges</span></li>
                <li><span className="spec-prop-label">Controls:</span> <span className="spec-prop-val">Underline Tabs, Refined Inputs</span></li>
                <li><span className="spec-prop-label">Palette:</span> <span className="spec-prop-val">Deep Surgical Spruce (#0f766e)</span></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};