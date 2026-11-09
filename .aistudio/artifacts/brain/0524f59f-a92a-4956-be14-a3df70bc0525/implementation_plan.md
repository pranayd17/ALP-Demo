# Real-World Airport Hub Datasets, CSV Importer & Scenario Generator

Expand the Aircraft Landing Problem (ALP) optimization suite beyond standard academic benchmarks by adding real-world international airport hub traffic schedules, a client-side CSV dataset importer, and a parametric custom scenario generator.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the interactive interview:
> - **Dataset Focus**: Real-world airport hub schedules and peak traffic (specifically utilizing authentic multi-airline flight schedules and hub operations).
> - **Import & Generation Capabilities**: Include both a direct CSV upload workflow (parsing flight numbers, arrival windows, airlines, and aircraft categories) and an interactive parametric scenario generator (enabling rush hour congestion and wake separation stress tests).

- **Confirmed Decision 1**: Implement real-world hub schedules based on active commercial airline traffic (Delhi DEL, Mumbai BOM, and London Heathrow LHR peak banks) alongside the existing OR-Library benchmarks.
- **Confirmed Decision 2**: Provide an in-app dataset management modal with instant CSV file parsing, template download, error checking, and a custom scenario generator (adjusting flight count, time horizon, wake-turbulence category distribution, and schedule tightness).

---

### 1. Overview & Core Concept

- **What It Does**: Enhances the AGWOA optimization dashboard with realistic airline landing schedules (derived from real commercial flight databases like Delhi DEL and Mumbai BOM peak arrivals), allowing users to switch between classic OR-Lib academic instances, realistic commercial hub schedules, and user-uploaded custom flight datasets.
- **Target Audience / Persona**: Air traffic control researchers, aviation operations analysts, algorithm students, and logistics planners testing aircraft landing schedules against realistic commercial arrival patterns.
- **Key Value**: Bridges the gap between synthetic benchmark equations and true airport operations, proving AGWOA's real-world applicability on tight commercial flight banks with wake turbulence separation constraints.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Dataset Selector*: The top problem dropdown in the Interactive Solver expands into categorized groups: **OR-Library Benchmarks (airland1–9)**, **Real-World Hub Schedules (Delhi DEL, Mumbai BOM, Heathrow LHR Peak)**, and **Custom / Imported Datasets**.
  2. *CSV Uploader Modal*: Clicking "Import CSV / Generator" opens a clean, single-elevation modal where users can drag-and-drop a `.csv` file (with columns: `callsign`, `category`, `arrival`, `earliest`, `target`, `latest`, `early_penalty`, `late_penalty`, or standard airline arrival format), preview parsed aircraft, and immediately load them into the optimizer.
  3. *Parametric Scenario Generator*: Within the same modal, users can configure parameters (Airport Name, Aircraft Count $10 \dots 120$, Wake Distribution [Heavy/Medium/Light], Window Tightness [Relaxed vs. Peak Rush Hour]) and generate an authentic ALP problem instance with one click.
  4. *Multi-View Sync*: All 5 system views (Schedule & Solver, Radar Scope, 3D Airstrip Landing, Airspace Map, Evaluation Metrics) immediately react and visualize the loaded dataset with authentic callsigns and spatial vectors.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Clean utilitarian aviation operations dashboard with high-density data tables and crisp graphical displays.
  - *Color Palette & Mood*: Dominant clean white/neutral slate canvas (`#F8FAFC` to `#FFFFFF`), structural borders (`#E2E8F0`), and clear semantic status accents (Sapphire Blue `#2563EB` primary, Emerald `#16A34A` for on-time targets, Amber `#D97706` for delay/early penalties).
  - *Typography & Hierarchy*: Geometric display heading font (`Plus Jakarta Sans`), readable body font (`Plus Jakarta Sans` 14px), and tabular monospace numerals (`JetBrains Mono`, `tabular-nums`) for all timestamps, runway separations, and penalty costs.
- **Interactive Feedback & Motion**:
  - Drag-over visual feedback on CSV drop zone.
  - Real-time syntax and column validation with clear warnings if early/late penalty values are missing (with sensible ICAO defaults applied automatically).
  - Smooth animation transitions on dataset switch without page reload.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-World Hub Flight Generator & Embedded Real Data**:
  - *Chosen Approach*: Embed structured real-world flight hub datasets (DEL 25-flight peak arrival bank, BOM 35-flight morning rush, LHR 40-flight mixed international bank) with true commercial airline callsigns (Air India, IndiGo, British Airways, Emirates, SpiceJet) and ICAO wake turbulence classes.
  - *Why*: Eliminates network latency, ensures 100% offline reliability in the sandbox, and guarantees reproducible optimization benchmarks.
  - *Alternatives Considered*: Fetching live FlightAware/OpenSky APIs in real-time was rejected due to API key requirements, CORS restrictions in sandboxes, and rate-limiting.
- **Decision 2: Client-Side CSV Parsing with Standard Template Download**:
  - *Chosen Approach*: Implement a zero-dependency in-browser CSV parser supporting both minimal column formats and full OR-Lib specifications, paired with a 1-click "Download Sample CSV" button.
  - *Why*: Allows users to test any custom airport scenario without backend server dependencies or security risks.
- **Decision 3: Wake Turbulence Matrix Auto-Synthesis**:
  - *Chosen Approach*: When a custom CSV only lists aircraft categories (Heavy, Medium, Light) without a full $N \times N$ matrix, automatically calculate the standard FAA/ICAO wake-vortex separation matrix ($H \to H = 90\text{s}$, $H \to M = 120\text{s}$, $H \to L = 150\text{s}$, etc.).
  - *Why*: Makes creating and importing new datasets effortless for users without requiring them to construct quadratic pairwise matrices.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          App.tsx (Root State)                          │
│   currentInstance: ALPInstance  │  evaluation: Evaluation | null       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼─────────────────────────────┐
       ▼                            ▼                             ▼
┌───────────────┐           ┌───────────────┐             ┌───────────────┐
│  Interactive  │           │ Dataset Modal │             │ System Views  │
│    Solver     │           │ (Upload & Gen)│             │ (Radar, 3D,   │
│ ┌───────────┐ │           │ ┌───────────┐ │             │  Map, Table)  │
│ │ Dataset   │─┼───────────┼►│ CSV Import│ │             └───────────────┘
│ │ Dropdown  │ │ (Open UI) │ ├───────────┤ │
│ └───────────┘ │           │ │ Scenario  │─┼──(Emit new ALPInstance)──►
│ ┌───────────┐ │           │ │ Generator │ │
│ │ Run/Reset │ │           │ └───────────┘ │
│ └───────────┘ │           └───────────────┘
└───────────────┘
```

- **Data Models & Contracts**:
  - `ALPInstance`: Extended with `category: 'orlib' | 'hub' | 'custom'` metadata to visually group items in selector menus.
  - `CSVParserConfig`: Maps CSV headers (`callsign`, `category`, `arrival`, `earliest`, `target`, `latest`, `early_penalty`, `late_penalty`).
- **Interactive Component & State Mapping**:
  - `InteractiveSolver.tsx`: Updated to render grouped dropdown options (`<optgroup label="...">`) and an "Import / Create Dataset" trigger button.
  - `DatasetManagerModal.tsx`: New component containing the Tabbed interface for "Upload CSV File" and "Generate Airport Scenario", with live preview table and validation stats before activating.
  - `benchmarkData.ts`: Extended with pre-built hub instances (DEL Hub, BOM Morning Rush, LHR Peak Arrival) and CSV template generator.
