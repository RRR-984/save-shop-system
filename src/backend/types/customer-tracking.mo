/// Customer tracking domain types.
/// The backend stores customer data as schema-less JSON blobs via
/// saveCustomers/getCustomers — no Motoko-level field constraints exist.
/// These types document the extended customer shape expected by the frontend;
/// they are NOT enforced at the Motoko layer.
module {

  /// Activity status derived from lastVisit date (computed on frontend).
  public type ActivityStatus = {
    #active;   // visited within last 30 days
    #warm;     // visited within last 180 days
    #cold;     // no visit for 180+ days
    #lost;     // no visit for 360+ days
  };

  /// Customer rank derived from totalPurchase (computed on frontend).
  public type CustomerRank = {
    #vip;      // totalPurchase >= 50000
    #gold;     // totalPurchase >= 20000
    #silver;   // totalPurchase >= 5000
    #normal;   // totalPurchase < 5000
  };

  /// Extended customer record shape (documented reference only).
  /// Persisted as JSON via saveCustomers/getCustomers.
  /// All fields except mobile are optional for backward compatibility.
  public type CustomerRecord = {
    mobile : Text;          // primary key / unique ID
    name : ?Text;
    address : ?Text;
    lastVisit : ?Text;      // ISO date string e.g. "2026-04-19"
    totalPurchase : ?Float;
    visitCount : ?Nat;
    pendingBalance : ?Float;
    birthday : ?Text;       // YYYY-MM-DD — used for birthday reminders
  };

  /// Payload returned when a customer lookup resolves from mobile number.
  public type CustomerLookupResult = {
    found : Bool;
    customer : ?CustomerRecord;
  };

  /// Alert type for customer insights.
  public type CustomerAlert = {
    #inactiveSince180;
    #lostSince360;
    #highPending;
    #topCustomer;
  };
};
