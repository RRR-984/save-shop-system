/// Customer tracking public API mixin.
/// No new endpoints are required: the existing saveCustomers/getCustomers
/// functions in main.mo already store and return arbitrary JSON blobs, so
/// extended fields (lastVisit, totalPurchase, visitCount, pendingBalance)
/// are persisted without any backend changes.
///
/// This mixin is intentionally empty — it exists to satisfy the domain
/// contract layout and to document that no additional backend surface area
/// is needed for the customer-tracking domain.
import Map "mo:core/Map";

mixin (
  _shopData : Map.Map<Text, Map.Map<Text, Text>>,
) {
  // No additional public functions needed.
  // All customer tracking persistence is handled by the existing
  // getCustomers / saveCustomers pair in main.mo, which passes JSON through
  // without inspection or field stripping.
};
