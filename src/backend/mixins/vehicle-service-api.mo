import Debug "mo:core/Debug";
import Map "mo:core/Map";

mixin (
  shopData : Map.Map<Text, Map.Map<Text, Text>>,
) {

  // ── Internal helpers (mirror main.mo pattern) ───────────────────────────────

  func _vsGetCollection(shopId : Text, collection : Text) : Text {
    Debug.todo()
  };

  func _vsSaveCollection(shopId : Text, collection : Text, data : Text) : () {
    Debug.todo()
  };

  // ── Vehicle Records ──────────────────────────────────────────────────────────

  /// Return all vehicle records for a shop as a JSON string.
  public query func getVehicleRecords(shopId : Text) : async Text {
    Debug.todo()
  };

  /// Persist vehicle records for a shop (full JSON replace).
  public shared func saveVehicleRecords(shopId : Text, data : Text) : async () {
    Debug.todo()
  };

  // ── Job Cards ────────────────────────────────────────────────────────────────

  /// Return all job cards for a shop as a JSON string.
  public query func getJobCards(shopId : Text) : async Text {
    Debug.todo()
  };

  /// Persist job cards for a shop (full JSON replace).
  public shared func saveJobCards(shopId : Text, data : Text) : async () {
    Debug.todo()
  };

  // ── Service Reminders ────────────────────────────────────────────────────────

  /// Return all service reminders for a shop as a JSON string.
  public query func getServiceReminders(shopId : Text) : async Text {
    Debug.todo()
  };

  /// Persist service reminders for a shop (full JSON replace).
  public shared func saveServiceReminders(shopId : Text, data : Text) : async () {
    Debug.todo()
  };

};
