import { ALPInstance, Evaluation, ScheduledAircraft } from '../types/alp';

export class ALPEvaluator {
  private instance: ALPInstance;
  private sepFactor: number;

  constructor(instance: ALPInstance, separationPenaltyFactor = 1_000_000.0) {
    this.instance = instance;
    this.sepFactor = separationPenaltyFactor;
  }

  public getInstance(): ALPInstance {
    return this.instance;
  }

  /**
   * Sorts aircraft by landing times (stable sort).
   * Returns array of aircraft indices in ascending landing order.
   */
  public landingOrder(x: number[]): number[] {
    const indices = x.map((_, i) => i);
    indices.sort((a, b) => {
      const diff = x[a] - x[b];
      return diff !== 0 ? diff : a - b;
    });
    return indices;
  }

  /**
   * Repairs time-window violations and separation violations in actual landing order.
   */
  public repair(x: number[]): number[] {
    const { aircraft, n, separation } = this.instance;
    const repaired = [...x];

    // Clip to lower and upper bounds
    for (let i = 0; i < n; i++) {
      repaired[i] = Math.max(aircraft[i].earliest, Math.min(aircraft[i].latest, repaired[i]));
    }

    // Determine current landing order
    const order = this.landingOrder(repaired);

    // Enforce separation constraints along chronological landing order
    for (let k = 1; k < n; k++) {
      const prev = order[k - 1];
      const curr = order[k];
      const required = repaired[prev] + separation[prev][curr];

      if (repaired[curr] < required) {
        repaired[curr] = Math.min(required, aircraft[curr].latest);
      }
    }

    // Final boundary clip
    for (let i = 0; i < n; i++) {
      repaired[i] = Math.max(aircraft[i].earliest, Math.min(aircraft[i].latest, repaired[i]));
    }

    return repaired;
  }

  /**
   * Evaluates the solution vector x, returning all penalties, delay, feasibility,
   * and full flight schedule details.
   */
  public evaluate(x: number[]): Evaluation {
    const { aircraft, n, separation } = this.instance;
    let landingPenalty = 0.0;
    let totalDelay = 0.0;
    let windowViolation = 0.0;

    for (let i = 0; i < n; i++) {
      const a = aircraft[i];
      const time = x[i];
      const diff = time - a.target;

      if (diff < 0) {
        landingPenalty += -diff * a.early_penalty;
      } else {
        landingPenalty += diff * a.late_penalty;
      }

      totalDelay += Math.max(0.0, diff);

      // Window bounds violation
      if (time < a.earliest) {
        windowViolation += a.earliest - time;
      } else if (time > a.latest) {
        windowViolation += time - a.latest;
      }
    }

    // Separation constraints in ACTUAL landing order
    const order = this.landingOrder(x);
    let separationViolation = 0.0;

    const schedule: ScheduledAircraft[] = [];

    for (let k = 0; k < n; k++) {
      const currId = order[k];
      const a = aircraft[currId];
      const time = x[currId];
      const diff = time - a.target;

      let devType: 'Early' | 'On-Time' | 'Late' = 'On-Time';
      const absDiff = Math.abs(diff);

      if (absDiff < 1e-6) {
        devType = 'On-Time';
      } else if (diff < 0) {
        devType = 'Early';
      } else {
        devType = 'Late';
      }

      const penalty = diff < 0 ? -diff * a.early_penalty : diff * a.late_penalty;

      let sepFromPrev: number | undefined;
      let reqSep: number | undefined;
      let sepOk: boolean | undefined;

      if (k > 0) {
        const prevId = order[k - 1];
        sepFromPrev = time - x[prevId];
        reqSep = separation[prevId][currId];
        const gapViolation = reqSep - (time - x[prevId]);

        if (gapViolation > 0) {
          separationViolation += gapViolation;
          sepOk = false;
        } else {
          sepOk = true;
        }
      }

      schedule.push({
        position: k + 1,
        aircraftId: currId,
        callsign: a.callsign || `FL-${String(currId + 1).padStart(3, '0')}`,
        category: a.category,
        landingTime: time,
        earliest: a.earliest,
        target: a.target,
        latest: a.latest,
        deviationType: devType,
        deviation: absDiff,
        penalty,
        separationFromPrev: sepFromPrev,
        requiredSepFromPrev: reqSep,
        separationOk: sepOk,
      });
    }

    const constraintViolation = separationViolation + windowViolation;
    const separationPenalty = constraintViolation * this.sepFactor;
    const totalCost = landingPenalty + separationPenalty;
    const feasible = constraintViolation <= 1e-9;

    return {
      total_cost: totalCost,
      landing_penalty: landingPenalty,
      separation_penalty: separationPenalty,
      delay: totalDelay,
      feasible,
      timeWindowViolation: windowViolation,
      separationViolation,
      landingOrder: order,
      schedule,
    };
  }

  /**
   * Fitness function: inverse of (1 + total_cost).
   */
  public fitness(x: number[]): number {
    const cost = this.evaluate(x).total_cost;
    return 1.0 / (1.0 + Math.max(0, cost));
  }
}
