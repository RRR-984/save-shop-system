module {

  /// A distributed lock record held by a single user for a specific record.
  /// lockKey = shopId # ':' # recordType # ':' # recordId
  public type LockRecord = {
    recordId    : Text;
    recordType  : Text;
    shopId      : Text;
    userId      : Text;
    userName    : Text;
    acquiredAt  : Int;
    expiresAt   : Int;
  };

  /// Result of an acquireLock call.
  /// #acquired  — caller now holds the lock.
  /// #conflict  — another user already holds an unexpired lock.
  public type LockResult = {
    #acquired;
    #conflict : {
      lockedBy       : Text;   // userId of current lock holder
      userName       : Text;   // display name of current lock holder
      expiresInSeconds : Int;  // seconds until the lock expires
    };
  };

  /// Idempotency record for invoice/billing operations.
  /// Prevents duplicate saves on retry / double-tap.
  public type IdempotencyRecord = {
    invoiceId   : Text;
    processedAt : Int;
    shopId      : Text;
  };

  /// Minimal active-user snapshot derived from lock heartbeats.
  /// Returned by getActiveUsersForShop.
  public type ActiveUserRecord = {
    userId   : Text;
    userName : Text;
    lastSeen : Int;
  };

};
