/// Customer tracking domain logic.
/// The backend is schema-less: all customer data is stored as a JSON Text blob
/// per shopId via saveCustomers/getCustomers in main.mo.
/// This module is a stub — all business logic (rank calculation, activity
/// classification, auto-suggest, alerts) runs on the frontend against the
/// JSON payload. The backend simply stores and retrieves the blob unchanged.
import Runtime "mo:core/Runtime";
import Types "../types/customer-tracking";

module {

  /// Placeholder: classify customer activity from lastVisit date string.
  /// Implemented on the frontend; stub kept for contract completeness.
  public func classifyActivity(_lastVisit : ?Text, _nowMs : Int) : Types.ActivityStatus {
    Runtime.trap("not implemented");
  };

  /// Placeholder: compute customer rank from totalPurchase amount.
  /// Implemented on the frontend; stub kept for contract completeness.
  public func computeRank(_totalPurchase : ?Float) : Types.CustomerRank {
    Runtime.trap("not implemented");
  };
};
