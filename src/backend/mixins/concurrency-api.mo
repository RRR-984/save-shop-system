import Map "mo:core/Map";
import Time "mo:core/Time";
import Debug "mo:core/Debug";
import ConcurrencyTypes "../types/concurrency";
import ConcurrencyLib "../lib/concurrency";

/// Concurrency API Mixin
/// Exposes public lock-management and idempotency endpoints to the actor.
/// State injected:
///   lockTable        — Map: lockKey -> LockRecord
///   idempotencyTable — Map: idempotencyKey -> IdempotencyRecord
mixin (
  lockTable        : Map.Map<Text, ConcurrencyTypes.LockRecord>,
  idempotencyTable : Map.Map<Text, ConcurrencyTypes.IdempotencyRecord>
) {

  // ── acquireLock ───────────────────────────────────────────────────────────────

  /// Try to acquire an exclusive lock on a record for the given user.
  /// Returns #acquired if the lock is granted, or #conflict with lock-holder
  /// info if another unexpired lock exists.
  public shared func acquireLock(
    recordId   : Text,
    recordType : Text,
    shopId     : Text,
    userId     : Text,
    userName   : Text
  ) : async ConcurrencyTypes.LockResult {
    Debug.todo()
  };

  // ── releaseLock ───────────────────────────────────────────────────────────────

  /// Release a lock. Only the owner (userId match) or an expired lock can be
  /// released. Returns true when released, false otherwise.
  public shared func releaseLock(
    recordId   : Text,
    recordType : Text,
    shopId     : Text,
    userId     : Text
  ) : async Bool {
    Debug.todo()
  };

  // ── heartbeatLock ─────────────────────────────────────────────────────────────

  /// Extend the lock TTL by 10 minutes if the caller is the lock owner.
  /// Returns false if the lock is not found or the caller is not the owner.
  public shared func heartbeatLock(
    recordId   : Text,
    recordType : Text,
    shopId     : Text,
    userId     : Text
  ) : async Bool {
    Debug.todo()
  };

  // ── getLockStatus ─────────────────────────────────────────────────────────────

  /// Return the current unexpired lock for a record, or null.
  public query func getLockStatus(
    recordId   : Text,
    recordType : Text,
    shopId     : Text
  ) : async ?ConcurrencyTypes.LockRecord {
    Debug.todo()
  };

  // ── releaseAllLocksForUser ────────────────────────────────────────────────────

  /// Release all locks held by userId within shopId (call on logout).
  /// Returns the count of locks released.
  public shared func releaseAllLocksForUser(
    shopId : Text,
    userId : Text
  ) : async Nat {
    Debug.todo()
  };

  // ── getActiveUsersForShop ─────────────────────────────────────────────────────

  /// Return distinct active users for a shop derived from the lock table.
  /// A user is considered active if they hold an unexpired lock or sent a
  /// heartbeat within the last 5 minutes.
  public query func getActiveUsersForShop(
    shopId : Text
  ) : async [ConcurrencyTypes.ActiveUserRecord] {
    Debug.todo()
  };

  // ── checkIdempotency ──────────────────────────────────────────────────────────

  /// Return an existing idempotency record if processed within 24 hours,
  /// null otherwise.
  public query func checkIdempotency(
    idempotencyKey : Text,
    shopId         : Text
  ) : async ?ConcurrencyTypes.IdempotencyRecord {
    Debug.todo()
  };

  // ── registerIdempotency ───────────────────────────────────────────────────────

  /// Store an idempotency record after a successful invoice save.
  /// Returns true on success.
  public shared func registerIdempotency(
    idempotencyKey : Text,
    invoiceId      : Text,
    shopId         : Text
  ) : async Bool {
    Debug.todo()
  };

};
