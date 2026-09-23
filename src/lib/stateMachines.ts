/**
 * Procurement State Machine — Enforced Transition Validator
 *
 * Defines the ONLY legal state transitions for Tenders and Bids.
 * Any attempt to transition to a state not listed here is rejected
 * at the API level with a 422 Unprocessable Entity error.
 *
 * Compliant with:
 * - GFR 2017 Rule 160-175 (Public Procurement Procedure)
 * - CVC Office Memorandum on Two-Bid System (2003)
 */

import { TenderStatus, BidStatus } from "@prisma/client";

// ─── Tender State Machine ─────────────────────────────────────────────────────

/**
 * Legal Tender status transitions:
 *
 *   DRAFT → UNDER_APPROVAL | PUBLISHED | CANCELLED
 *   UNDER_APPROVAL → PUBLISHED | DRAFT | CANCELLED
 *   PUBLISHED → OPEN | CANCELLED
 *   OPEN → CLOSED | CANCELLED
 *   CLOSED → AWARDED | CANCELLED
 *   AWARDED → (terminal — no further transitions)
 *   CANCELLED → (terminal — no further transitions)
 */
const TENDER_TRANSITIONS: Record<TenderStatus, TenderStatus[]> = {
  [TenderStatus.DRAFT]: [
    TenderStatus.UNDER_APPROVAL,
    TenderStatus.PUBLISHED,
    TenderStatus.CANCELLED,
  ],
  [TenderStatus.UNDER_APPROVAL]: [
    TenderStatus.PUBLISHED,
    TenderStatus.DRAFT,
    TenderStatus.CANCELLED,
  ],
  [TenderStatus.PUBLISHED]: [TenderStatus.OPEN, TenderStatus.CANCELLED],
  [TenderStatus.OPEN]: [TenderStatus.CLOSED, TenderStatus.CANCELLED],
  [TenderStatus.CLOSED]: [TenderStatus.AWARDED, TenderStatus.CANCELLED],
  [TenderStatus.AWARDED]: [], // Terminal state
  [TenderStatus.CANCELLED]: [], // Terminal state
};

/**
 * Validates a tender status transition.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateTenderTransition(
  currentStatus: TenderStatus,
  requestedStatus: TenderStatus
): string | null {
  // No-op transitions are always allowed (e.g. updating title only, no status change)
  if (currentStatus === requestedStatus) return null;

  const allowed = TENDER_TRANSITIONS[currentStatus];
  if (!allowed.includes(requestedStatus)) {
    return (
      `Invalid tender status transition: ${currentStatus} → ${requestedStatus}. ` +
      `Allowed transitions from ${currentStatus}: [${allowed.join(", ") || "NONE — terminal state"}]`
    );
  }

  return null;
}

// ─── Bid State Machine ────────────────────────────────────────────────────────

/**
 * Legal Bid status transitions:
 *
 *   DRAFT → SUBMITTED
 *   SUBMITTED → UNDER_EVALUATION | TECHNICALLY_QUALIFIED | TECHNICALLY_DISQUALIFIED
 *   UNDER_EVALUATION → TECHNICALLY_QUALIFIED | TECHNICALLY_DISQUALIFIED
 *   TECHNICALLY_QUALIFIED → FINANCIAL_EVALUATION | TECHNICALLY_DISQUALIFIED
 *   FINANCIAL_EVALUATION → AWARDED | NOT_AWARDED
 *   TECHNICALLY_DISQUALIFIED → (terminal)
 *   AWARDED → (terminal)
 *   NOT_AWARDED → (terminal)
 */
const BID_TRANSITIONS: Record<BidStatus, BidStatus[]> = {
  [BidStatus.DRAFT]: [BidStatus.SUBMITTED],
  [BidStatus.SUBMITTED]: [
    BidStatus.UNDER_EVALUATION,
    BidStatus.TECHNICALLY_QUALIFIED,
    BidStatus.TECHNICALLY_DISQUALIFIED,
  ],
  [BidStatus.UNDER_EVALUATION]: [
    BidStatus.TECHNICALLY_QUALIFIED,
    BidStatus.TECHNICALLY_DISQUALIFIED,
  ],
  [BidStatus.TECHNICALLY_QUALIFIED]: [
    BidStatus.FINANCIAL_EVALUATION,
    BidStatus.TECHNICALLY_DISQUALIFIED,
  ],
  [BidStatus.FINANCIAL_EVALUATION]: [
    BidStatus.AWARDED,
    BidStatus.NOT_AWARDED,
  ],
  [BidStatus.TECHNICALLY_DISQUALIFIED]: [], // Terminal
  [BidStatus.AWARDED]: [], // Terminal
  [BidStatus.NOT_AWARDED]: [], // Terminal
};

/**
 * Validates a bid status transition.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateBidTransition(
  currentStatus: BidStatus,
  requestedStatus: BidStatus
): string | null {
  if (currentStatus === requestedStatus) return null;

  const allowed = BID_TRANSITIONS[currentStatus];
  if (!allowed.includes(requestedStatus)) {
    return (
      `Invalid bid status transition: ${currentStatus} → ${requestedStatus}. ` +
      `Allowed transitions from ${currentStatus}: [${allowed.join(", ") || "NONE — terminal state"}]`
    );
  }

  return null;
}

/**
 * Returns whether a bid is in a locked (non-editable-by-bidder) state.
 * Bidders may only modify bids in DRAFT status.
 */
export function isBidLockedForBidder(status: BidStatus): boolean {
  return status !== BidStatus.DRAFT;
}

/**
 * Returns whether a tender is accepting new bids.
 * Only OPEN tenders accept bid submissions.
 */
export function isTenderAcceptingBids(status: TenderStatus): boolean {
  return status === TenderStatus.OPEN;
}
