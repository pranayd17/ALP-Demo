# Implementation Plan - Simplified Evaluation Metrics with Clean Readable Equations

This plan outlines the restructuring of the **Evaluation Metrics** tab to eliminate unnecessary information and focus purely on **three clean mathematical formula cards** with beautifully formatted equations, direct numerical substitutions, and a minimal flight audit table.

---

## 1. User Choices & Simplification Goals
- **Formatting**: Clean mathematical formula cards with large highlighted values and properly formatted equations (fraction bars, mathematical symbols, and clear variable substitutions).
- **Structure**:
  1. Three clean, uncluttered metric cards displaying the exact formula, numerical substitution, and final value.
  2. Minimal, streamlined flight audit table verifying hard constraints for each flight.
  3. Removal of dense paragraphs, redundant text, benchmark reference boxes, and histogram clutter.

---

## 2. Component Design & Equations

### Card 1: Optimality Gap (Solution Error)
- **Equation**:
  $$\text{Optimality Gap (\%)} = \frac{P_{total} - P_{optimal}}{P_{optimal}} \times 100$$
- **Numerical Substitution Display**:
  - Displays the actual substituted values directly in the equation:
    $$\frac{P_{total} - P_{optimal}}{P_{optimal}} \times 100 = \frac{752.96 - 700.00}{700.00} \times 100 = 7.56\%$$
  - Sub-values: Current Cost $P_{total}$, Benchmark Optimum $P_{optimal}$, and Cost Variance $\Delta P$.

### Card 2: Constraint Feasibility Rate (Hard Correctness)
- **Equation & Binary Standard**:
  $$\text{Feasibility} = \begin{cases} 100\% & \text{if all constraints satisfied} \\ 0\% & \text{if any violation occurs} \end{cases}$$
- **Hard Constraints Display**:
  - **Time Window**: $E_i \le x_i \le L_i \quad \longrightarrow \quad \text{Compliant (0 violations)}$
  - **Separation Buffer**: $x_{i+1} - x_i \ge S_{i, i+1} \quad \longrightarrow \quad \text{Compliant (0 violations)}$
  - Minimum Separation Slack: $\min(x_{i+1} - x_i - S_{i, i+1})$

### Card 3: Target Deviation Error (Operational Accuracy)
- **Equation**:
  $$\text{MAD} = \frac{1}{N} \sum_{i=1}^{N} |x_i - T_i|$$
- **Numerical Substitution Display**:
  - Direct substitution: $\frac{1}{N} \times \sum |x_i - T_i| = \frac{1}{10} \times 28.9s = 2.89s$
  - Compact values: On-Time Rate ($x_i = T_i$), Mean Late Delay ($+s$), Max Deviation ($\max |x_i - T_i|$).

### Minimal Flight Audit Table
- A concise, high-contrast table showing:
  - `Pos` (Landing sequence #)
  - `Flight` (Callsign & Category)
  - `Window` ($[E_i, L_i]$)
  - `Target` ($T_i$)
  - `Assigned` ($x_i$)
  - `Deviation` ($x_i - T_i$)
  - `Separation` ($x_i - x_{i-1} \ge S$)
  - `Status` (Checkmark or Alert)

---

## 3. Verification Plan
- Run `compile_applet` and `lint_applet` together to verify zero syntax or type issues.
- Verify the mathematical formulas render cleanly with proper fraction lines and spacing on all screen sizes.
