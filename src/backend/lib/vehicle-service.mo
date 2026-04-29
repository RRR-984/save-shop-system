import Debug "mo:core/Debug";
import Types "../types/vehicle-service";

module {

  // ── Collection name constants ────────────────────────────────────────────────
  // These strings must match exactly what is used in main.mo
  public let VEHICLE_RECORDS_COLLECTION  : Text = "vehicleRecords";
  public let JOB_CARDS_COLLECTION        : Text = "jobCards";
  public let SERVICE_REMINDERS_COLLECTION: Text = "serviceReminders";

  // ── Domain helpers (stubs — implement in develop phase) ─────────────────────

  /// Validate that vehicleNumber is non-empty and normalised.
  public func validateVehicleNumber(_vehicleNumber : Text) : Bool {
    Debug.todo()
  };

  /// Determine the next service due date from last service date and interval.
  public func calcNextDueDate(_lastServiceDate : Int, _intervalDays : Nat) : Int {
    Debug.todo()
  };

  /// Summarise all parts cost for a job card.
  public func calcPartsCost(_parts : [Types.PartUsed]) : Float {
    Debug.todo()
  };

};
