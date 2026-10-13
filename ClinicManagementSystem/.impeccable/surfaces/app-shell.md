---
version: 1
slug: "app-shell"
primary_target: "app-shell"
related_targets: []
---

# Surface Brief: Unified Clinical App Shell

## Scope & Metadata
- **Target**: `app-shell`
- **Visitor Mode**: `operate`
- **Audience**: Receptionists, Doctors, and Clinic Administrators in outpatient practice.
- **Constraints**: Role switcher is testing/dev only; doctor-patient ownership indicator is contextual; accent colors used sparingly on slate chrome; 2-keystroke/1-click is a UX goal; backend/API untouched.

## Direction contract

### THESIS
A high-efficiency clinical workstation shell replacing generic SaaS dashboard bloat with razor-sharp, zero-latency clinical wayfinding, dense ergonomics, and instant command-driven search.

### OWN-WORLD
Calm surgical slate ground (`#f8fafc` / `#0f172a`), hairline slate dividers (`#e2e8f0`), restrained clinical teal/cobalt brand accent (`#0284c7` / `#0f766e`), high-contrast tabular typography, drawn SVG iconography, and strictly semantic status accents (emerald active, amber queue, violet in-consultation, rose urgent).

### STORY
Clinical staff instantly perceive system state, live queues, and their active role context. They navigate role-partitioned clinic workflows without friction and execute immediate patient lookups through the keyboard spotlight.

### FIRST VIEWPORT
Collapsible slim left navigation rail (240px expanded / 64px icon rail) with badge counters; top workstation header featuring live clinic clock, contextual doctor-scope indicator, spotlight trigger (`Ctrl+K`), notifications, and profile menu; fluid central viewport with clean breadcrumb bar and content stage; unobtrusive bottom dev role simulator.

### FORM
Clinical workstation shell; assigned candidate 5 of grounded list; seed key 954eda16.

### FINISH
unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
