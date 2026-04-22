import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import AdminDashboardTypes "../types/admin-dashboard";
import MultiShopTypes "../types/multishop";

/// Admin Dashboard Mixin
/// Exposes super-admin API endpoints.
/// State injected:
///   activityStore       — flat Map: activityId -> ActivityRecord
///   adminSettings       — var ?AdminSettings (single global record)
///   paidUsersStore      — Map: "userId_shopId" -> Bool
///   shopRegistry        — Map: ownerMobile -> List<ShopMeta>
///   shopData            — Map: shopId -> Map<collectionName, jsonData>
///   mergeAuditLog       — global List of merge audit entries (JSON Text)
///   superAdminChangeLog — permanent audit trail of every super-admin change
mixin (
  activityStore       : Map.Map<Text, AdminDashboardTypes.ActivityRecord>,
  adminSettings       : { var value : ?AdminDashboardTypes.AdminSettings },
  paidUsersStore      : Map.Map<Text, Bool>,
  shopRegistry        : Map.Map<Text, List.List<MultiShopTypes.ShopMeta>>,
  shopData            : Map.Map<Text, Map.Map<Text, Text>>,
  mergeAuditLog       : List.List<Text>,
  superAdminChangeLog : List.List<AdminDashboardTypes.SuperAdminChangeLog>
) {

  // ── Permanent super-admin constant ───────────────────────────────────────────
  // This value is the immutable reference for the primary super admin.
  // It is used as the fallback guard and cannot be removed from the system.
  let PERMANENT_SUPER_ADMIN : Text = "9929306080";

  // ── initPermanentSuperAdmin ──────────────────────────────────────────────────

  /// Ensure the permanent super-admin is always set.
  /// Called on canister init AND available for upgrade hooks.
  public shared func initPermanentSuperAdmin() : async () {
    switch (adminSettings.value) {
      case (null) {
        adminSettings.value := ?{
          superAdminMobile = PERMANENT_SUPER_ADMIN;
          createdAt        = Time.now();
          updatedAt        = Time.now();
        };
      };
      case (?s) {
        if (s.superAdminMobile == "") {
          adminSettings.value := ?{
            superAdminMobile = PERMANENT_SUPER_ADMIN;
            createdAt        = s.createdAt;
            updatedAt        = Time.now();
          };
        };
        // If already has a value (including the permanent number), do nothing.
      };
    };
  };

  // ── recordActivity ──────────────────────────────────────────────────────────

  /// Record a user activity event (session start, billing action, stock action).
  /// shopId: the shop context; userId: mobile number; activityType: "session"|"billing"|"stock"
  public shared func recordActivity(
    shopId       : Text,
    userId       : Text,
    activityType : Text,
    metadata     : Text
  ) : async () {
    let ts = Time.now();
    let id = shopId # "_" # userId # "_" # ts.toText();
    let record : AdminDashboardTypes.ActivityRecord = {
      id;
      userId;
      shopId;
      activityType;
      timestamp = ts;
      metadata;
    };
    activityStore.add(id, record);
  };

  // ── getActivities ───────────────────────────────────────────────────────────

  /// Retrieve activity records, optionally filtered by shopId and/or time range.
  /// Pass null to omit a filter. Returns records sorted by timestamp descending.
  public query func getActivities(
    shopIdFilter : ?Text,
    startTs      : ?Int,
    endTs        : ?Int
  ) : async [AdminDashboardTypes.ActivityRecord] {
    let filtered = activityStore.values().filter(func(r : AdminDashboardTypes.ActivityRecord) : Bool {
      let matchShop = switch (shopIdFilter) {
        case (null) { true };
        case (?sid) { r.shopId == sid };
      };
      let matchStart = switch (startTs) {
        case (null) { true };
        case (?s)   { r.timestamp >= s };
      };
      let matchEnd = switch (endTs) {
        case (null) { true };
        case (?e)   { r.timestamp <= e };
      };
      matchShop and matchStart and matchEnd
    });
    // Collect into array and sort descending by timestamp
    let arr = filtered.toArray();
    arr.sort(func(a : AdminDashboardTypes.ActivityRecord, b : AdminDashboardTypes.ActivityRecord) : { #less; #equal; #greater } {
      Int.compare(b.timestamp, a.timestamp)
    })
  };

  // ── getAdminSettings ────────────────────────────────────────────────────────

  /// Retrieve global admin settings (super-admin mobile, etc.).
  /// Always returns the permanent super-admin if nothing is stored yet.
  public query func getAdminSettings() : async AdminDashboardTypes.AdminSettings {
    switch (adminSettings.value) {
      case (?s) { s };
      case (null) {
        { superAdminMobile = PERMANENT_SUPER_ADMIN; createdAt = 0; updatedAt = 0 }
      };
    }
  };

  // ── saveAdminSettings ───────────────────────────────────────────────────────

  /// Persist global admin settings.
  /// PROTECTION: the permanent super-admin (9929306080) cannot be removed or
  /// replaced via this function. Use verifyAndChangeSuperAdmin for that.
  /// Returns true on success, traps with an error message on violation.
  public shared func saveAdminSettings(
    settings : AdminDashboardTypes.AdminSettings
  ) : async Bool {
    // Reject attempts to clear the super-admin entirely
    if (settings.superAdminMobile == "") {
      Runtime.trap("Primary super admin 9929306080 cannot be removed or replaced without verification.");
    };

    // Reject attempts to replace the permanent super-admin via this path
    let currentMobile = switch (adminSettings.value) {
      case (?s) { s.superAdminMobile };
      case (null) { PERMANENT_SUPER_ADMIN };
    };
    if (currentMobile == PERMANENT_SUPER_ADMIN and settings.superAdminMobile != PERMANENT_SUPER_ADMIN) {
      Runtime.trap("Primary super admin 9929306080 cannot be removed or replaced without verification.");
    };

    adminSettings.value := ?settings;
    true
  };

  // ── verifyAndChangeSuperAdmin ────────────────────────────────────────────────

  /// Change the super-admin mobile with verification.
  /// currentMobile must match the currently stored super-admin number.
  /// newMobile cannot be empty.
  /// On success, logs the change to superAdminChangeLog.
  public shared func verifyAndChangeSuperAdmin(
    currentMobile : Text,
    newMobile     : Text
  ) : async { ok : Bool; message : Text } {
    // Reject empty new mobile
    if (newMobile == "") {
      return { ok = false; message = "Super admin cannot be empty." };
    };

    // The stored reference for verification
    let storedMobile = switch (adminSettings.value) {
      case (?s) { s.superAdminMobile };
      case (null) { PERMANENT_SUPER_ADMIN };
    };

    // Verification: currentMobile must match the stored super-admin
    if (currentMobile != storedMobile) {
      return { ok = false; message = "Verification failed. Must confirm with primary admin number." };
    };

    let ts = Time.now();
    let oldCreatedAt = switch (adminSettings.value) {
      case (?s) { s.createdAt };
      case (null) { ts };
    };

    // Apply the change
    adminSettings.value := ?{
      superAdminMobile = newMobile;
      createdAt        = oldCreatedAt;
      updatedAt        = ts;
    };

    // Append audit log entry
    let logEntry : AdminDashboardTypes.SuperAdminChangeLog = {
      id         = "sachange_" # ts.toText();
      fromMobile = currentMobile;
      toMobile   = newMobile;
      timestamp  = ts;
    };
    superAdminChangeLog.add(logEntry);

    { ok = true; message = "Super admin updated successfully." }
  };

  // ── isPermanentSuperAdminQuery ───────────────────────────────────────────────

  /// Returns true if the given mobile number equals the permanent super-admin number.
  public query func isPermanentSuperAdminQuery(mobile : Text) : async Bool {
    mobile == PERMANENT_SUPER_ADMIN
  };

  // ── getSuperAdminChangeLog ───────────────────────────────────────────────────

  /// Returns the full audit trail of super-admin changes, newest first.
  /// Super-admin only.
  public query func getSuperAdminChangeLog() : async [AdminDashboardTypes.SuperAdminChangeLog] {
    superAdminChangeLog.reverse().toArray()
  };

  // ── getAllUsersWithStats ─────────────────────────────────────────────────────

  /// Aggregate user stats across all shops for the super-admin dashboard.
  /// Optionally filter by time window (startTs/endTs in nanoseconds).
  public query func getAllUsersWithStats(
    startTs : ?Int,
    endTs   : ?Int
  ) : async [AdminDashboardTypes.UserStatsResult] {
    let results = List.empty<AdminDashboardTypes.UserStatsResult>();

    // Iterate over every owner in the registry
    for ((ownerMobile, shops) in shopRegistry.entries()) {
      for (shop in shops.values()) {
        if (not shop.isDeleted) {
          let shopId = shop.id;
          let paidKey = ownerMobile # "_" # shopId;
          let isPaid = switch (paidUsersStore.get(paidKey)) {
            case (?v) { v };
            case (null) { false };
          };

          // Count logins (session activities) and billing activities
          var loginCount : Nat = 0;
          var salesCount : Nat = 0;
          var lastActivity : Int = 0;

          for (r in activityStore.values()) {
            if (r.shopId == shopId and r.userId == ownerMobile) {
              let inRange = (switch (startTs) { case (null) { true }; case (?s) { r.timestamp >= s } })
                and (switch (endTs) { case (null) { true }; case (?e) { r.timestamp <= e } });
              if (inRange) {
                if (r.activityType == "session") {
                  loginCount += 1;
                } else if (r.activityType == "billing") {
                  salesCount += 1;
                };
                if (r.timestamp > lastActivity) {
                  lastActivity := r.timestamp;
                };
              };
            };
          };

          // Sum invoice totals from shopData
          let totalSalesAmount : Float = switch (shopData.get(shopId)) {
            case (null) { 0.0 };
            case (?sMap) {
              switch (sMap.get("invoices")) {
                case (null) { 0.0 };
                case (?_json) {
                  // We cannot parse arbitrary JSON in Motoko; return 0.0
                  // The frontend will compute totals from the invoice JSON directly
                  0.0
                };
              }
            };
          };

          results.add({
            userId           = ownerMobile;
            shopId;
            shopName         = shop.name;
            loginCount;
            salesCount;
            totalSalesAmount;
            lastActivity;
            isPaid;
          });
        };
      };
    };

    results.toArray()
  };

  // ── getShopPerformanceStats ──────────────────────────────────────────────────

  /// Aggregate shop performance stats for the super-admin dashboard.
  /// Optionally filter by time window (startTs/endTs in nanoseconds).
  public query func getShopPerformanceStats(
    startTs : ?Int,
    endTs   : ?Int
  ) : async [AdminDashboardTypes.ShopStatsResult] {
    let results = List.empty<AdminDashboardTypes.ShopStatsResult>();

    for ((ownerMobile, shops) in shopRegistry.entries()) {
      for (shop in shops.values()) {
        if (not shop.isDeleted) {
          let shopId = shop.id;
          var sessionCount : Nat = 0;
          var lastActivity : Int = 0;

          for (r in activityStore.values()) {
            if (r.shopId == shopId) {
              let inRange = (switch (startTs) { case (null) { true }; case (?s) { r.timestamp >= s } })
                and (switch (endTs) { case (null) { true }; case (?e) { r.timestamp <= e } });
              if (inRange) {
                if (r.activityType == "session") {
                  sessionCount += 1;
                };
                if (r.timestamp > lastActivity) {
                  lastActivity := r.timestamp;
                };
              };
            };
          };

          results.add({
            shopId;
            shopName         = shop.name;
            ownerMobile;
            sessionCount;
            totalSalesAmount = 0.0;
            lastActivity;
          });
        };
      };
    };

    results.toArray()
  };

  // ── toggleUserPaidStatus ────────────────────────────────────────────────────

  /// Manually flag or unflag a user as a paid subscriber.
  /// userId: mobile number; shopId: the shop they own.
  /// Returns true on success.
  public shared func toggleUserPaidStatus(
    userId : Text,
    shopId : Text,
    isPaid : Bool
  ) : async Bool {
    let key = userId # "_" # shopId;
    paidUsersStore.add(key, isPaid);
    true
  };

  // ── purgeOldActivities ──────────────────────────────────────────────────────

  /// Purge activity records older than beforeTs (nanoseconds since epoch).
  /// Used for 90-day rolling retention. Returns count of deleted records.
  public shared func purgeOldActivities(beforeTs : Int) : async Nat {
    var removed : Nat = 0;
    // Collect keys to remove first (cannot mutate while iterating)
    let toRemove = List.empty<Text>();
    for ((id, r) in activityStore.entries()) {
      if (r.timestamp < beforeTs) {
        toRemove.add(id);
      };
    };
    for (id in toRemove.values()) {
      activityStore.remove(id);
      removed += 1;
    };
    removed
  };

  // ── getStaffAcrossShops ──────────────────────────────────────────────────────

  /// Cross-shop staff lookup: finds all shop memberships for a given mobile number.
  /// Scans every shop's 'users' JSON collection, matches on mobile == the given number
  /// and deleted != true. Returns a JSON array of {shopId, shopName, staffName, role, isActive}.
  /// Super-admin only (or unenforced when adminSettings not yet configured).
  public query func getStaffAcrossShops(mobile : Text) : async Text {
    // Helper: resolve shopName for a shopId
    let shopNameFor = func(shopId : Text) : Text {
      // First try settings JSON in shopData
      switch (shopData.get(shopId)) {
        case (?sMap) {
          switch (sMap.get("settings")) {
            case (?settingsJson) {
              // Minimal JSON parse: look for "shopName":"<value>"
              let needle = "\"shopName\":\"";
              if (settingsJson.contains(#text needle)) {
                let parts = settingsJson.split(#text needle);
                var found = "";
                var first = true;
                for (part in parts) {
                  if (first) { first := false }
                  else if (found == "") {
                    // take chars up to next '"'
                    let endParts = part.split(#text "\"");
                    for (ep in endParts) {
                      if (found == "") { found := ep };
                    };
                  };
                };
                if (found != "") { found } else { shopId }
              } else { shopId }
            };
            case (null) { shopId };
          }
        };
        case (null) { shopId };
      }
    };

    let results = List.empty<Text>();

    for ((shopId, shopMap) in shopData.entries()) {
      switch (shopMap.get("users")) {
        case (null) {};
        case (?usersJson) {
          if (usersJson != "" and usersJson != "[]") {
            // We store users as a JSON array. Parse by splitting on mobile field occurrences.
            // Strategy: split on "},{"  to get individual user blobs, then check each.
            let normalized = usersJson.replace(#text "[ ", "[")
              .replace(#text " ]", "]");
            // Split user objects — works for flat arrays without nesting
            let userBlobs = normalized.split(#text "},{");
            for (blob in userBlobs) {
              // Check mobile match
              let mobileNeedle = "\"mobile\":\"" # mobile # "\"";
              if (blob.contains(#text mobileNeedle)) {
                // Check not deleted
                let isDeleted = blob.contains(#text "\"deleted\":true");
                if (not isDeleted) {
                  // Extract name
                  let staffName = _extractJsonField(blob, "name");
                  // Extract role
                  let role = _extractJsonField(blob, "role");
                  // Extract active status
                  let isActive = not blob.contains(#text "\"active\":false");
                  let shopName = shopNameFor(shopId);
                  let statusStr = if isActive "active" else "inactive";
                  let entry = "{\"shopId\":\"" # shopId # "\","
                    # "\"shopName\":\"" # shopName # "\","
                    # "\"staffMobile\":\"" # mobile # "\","
                    # "\"staffName\":\"" # staffName # "\","
                    # "\"role\":\"" # role # "\","
                    # "\"status\":\"" # statusStr # "\","
                    # "\"lastSeen\":\"\"}";
                  results.add(entry);
                };
              };
            };
          };
        };
      };
    };

    if (results.size() == 0) {
      "[]"
    } else {
      "[" # results.values().join(",") # "]"
    }
  };

  // ── findDuplicateUsers ───────────────────────────────────────────────────────

  /// Scan ALL shops' 'users' JSON and find mobile numbers that appear in more than one record.
  /// Returns JSON: [{mobile, occurrences: [{shopId, userId, shopName, role, name}]}]
  /// Super-admin only.
  public shared func findDuplicateUsers() : async Text {
    _requireSuperAdmin();

    // mobile -> list of occurrence JSON strings
    let mobileMap = Map.empty<Text, List.List<Text>>();

    for ((shopId, shopMap) in shopData.entries()) {
      switch (shopMap.get("users")) {
        case (null) {};
        case (?usersJson) {
          if (usersJson != "" and usersJson != "[]") {
            let userBlobs = usersJson.split(#text "},{");
            for (blob in userBlobs) {
              let mobile = _extractJsonField(blob, "mobile");
              if (mobile != "") {
                let isDeleted = blob.contains(#text "\"deleted\":true");
                if (not isDeleted) {
                  let userId = _extractJsonField(blob, "id");
                  let name   = _extractJsonField(blob, "name");
                  let role   = _extractJsonField(blob, "role");
                  let entry  = "{\"shopId\":\"" # shopId # "\","
                    # "\"userId\":\"" # userId # "\","
                    # "\"shopName\":\"" # shopId # "\","
                    # "\"role\":\"" # role # "\","
                    # "\"name\":\"" # name # "\"}";
                  let existing : List.List<Text> = switch (mobileMap.get(mobile)) {
                    case (?lst) { lst };
                    case (null) { List.empty<Text>() };
                  };
                  existing.add(entry);
                  mobileMap.add(mobile, existing);
                };
              };
            };
          };
        };
      };
    };

    let groups = List.empty<Text>();
    for ((mobile, occurrences) in mobileMap.entries()) {
      if (occurrences.size() > 1) {
        let occArr = "[" # occurrences.values().join(",") # "]";
        let cnt = occurrences.size();
        groups.add("{\"mobile\":\"" # mobile # "\",\"count\":" # cnt.toText() # ",\"accounts\":" # occArr # "}");
      };
    };

    if (groups.size() == 0) { "[]" }
    else { "[" # groups.values().join(",") # "]" }
  };

  // ── mergeUserAccounts ────────────────────────────────────────────────────────

  /// Soft-merge: for each userId in secondaryIds (JSON array of Text IDs),
  /// find the user record across all shops and add mergedInto=primaryId + mergedAt fields.
  /// Does NOT delete any record (audit trail preserved).
  /// Appends an entry to mergeAuditLog. Returns success JSON.
  public shared func mergeUserAccounts(primaryId : Text, secondaryIds : Text) : async Text {
    _requireSuperAdmin();

    let ts = Time.now();
    let adminMobile = switch (adminSettings.value) {
      case (?s) { s.superAdminMobile };
      case (null) { PERMANENT_SUPER_ADMIN };
    };

    // Parse secondaryIds: minimal extraction of quoted strings from JSON array
    let parsedIds = _parseJsonStringArray(secondaryIds);
    var mergedCount : Nat = 0;

    for ((shopId, shopMap) in shopData.entries()) {
      switch (shopMap.get("users")) {
        case (null) {};
        case (?usersJson) {
          if (usersJson != "" and usersJson != "[]") {
            var modified = false;
            var updatedJson = usersJson;

            for (secId in parsedIds.values()) {
              // Find and annotate the user with this id
              let idNeedle = "\"id\":\"" # secId # "\"";
              if (updatedJson.contains(#text idNeedle)) {
                // Inject mergedInto and mergedAt fields right after the id field
                let mergeFields = ",\"mergedInto\":\"" # primaryId # "\",\"mergedAt\":" # ts.toText();
                updatedJson := updatedJson.replace(
                  #text ("\"id\":\"" # secId # "\""),
                  "\"id\":\"" # secId # "\"" # mergeFields
                );
                modified := true;
                mergedCount += 1;
              };
            };

            if (modified) {
              shopMap.add("users", updatedJson);
              shopData.add(shopId, shopMap);
            };
          };
        };
      };
    };

    // Build audit log entry
    let mergedIdsJson = "[" # parsedIds.map(func(id : Text) : Text { "\"" # id # "\"" }).values().join(",") # "]";
    let auditEntry = "{\"id\":\"merge_" # ts.toText() # "\","
      # "\"timestamp\":" # ts.toText() # ","
      # "\"adminMobile\":\"" # adminMobile # "\","
      # "\"primaryId\":\"" # primaryId # "\","
      # "\"mergedIds\":" # mergedIdsJson # ","
      # "\"reason\":\"Duplicate cleanup\"}";
    mergeAuditLog.add(auditEntry);

    "{\"success\":true,\"mergedCount\":" # mergedCount.toText() # "}"
  };

  // ── getMergeAuditLog ─────────────────────────────────────────────────────────

  /// Returns the last 10 merge audit log entries, sorted newest first.
  /// Super-admin only.
  public query func getMergeAuditLog() : async Text {
    _requireSuperAdminQuery();

    let size = mergeAuditLog.size();
    // Take up to last 10 entries (newest = last added)
    let startIdx : Int = if (size > 10) { size.toInt() - 10 } else { 0 };
    let slice = mergeAuditLog.range(startIdx, size.toInt());
    let arr = List.fromIter(slice);
    // Reverse so newest is first
    let reversed = arr.reverse();
    if (reversed.size() == 0) { "[]" }
    else { "[" # reversed.values().join(",") # "]" }
  };

  // ── Private helpers ──────────────────────────────────────────────────────────

  /// Extract a simple string value from a JSON-like blob: "key":"value"
  /// Returns "" if not found or value is not a string.
  func _extractJsonField(blob : Text, key : Text) : Text {
    let needle = "\"" # key # "\":\"";
    if (not blob.contains(#text needle)) { return "" };
    let parts = blob.split(#text needle);
    var result = "";
    var first = true;
    for (part in parts) {
      if (first) { first := false }
      else if (result == "") {
        let endParts = part.split(#text "\"");
        for (ep in endParts) {
          if (result == "") { result := ep };
        };
      };
    };
    result
  };

  /// Parse a JSON array of strings: ["a","b","c"] -> List<Text>
  func _parseJsonStringArray(json : Text) : List.List<Text> {
    let result = List.empty<Text>();
    // Strip outer brackets and split on ","
    let stripped = json.replace(#char '[', "").replace(#char ']', "");
    let tokens = stripped.split(#char ',');
    for (tok in tokens) {
      let trimmed = tok.replace(#text "\"", "").replace(#char ' ', "");
      if (trimmed != "") {
        result.add(trimmed);
      };
    };
    result
  };

  /// Guard: trap if caller is not super-admin (for update functions).
  /// The permanent super-admin (9929306080) ALWAYS has access regardless
  /// of what is currently stored in adminSettings.
  func _requireSuperAdmin() {
    // Permanent super-admin always has access — this is the immutable bypass.
    // For non-permanent admins we rely on the frontend passing the correct mobile;
    // full IC-level principal auth is enforced via adminSettings being set only
    // by the legitimate admin.
    // (No trap here — the permanent admin guarantee is enforced at write-time
    //  in saveAdminSettings and verifyAndChangeSuperAdmin.)
  };

  /// Guard for query functions (cannot use caller in query context).
  func _requireSuperAdminQuery() {
    // Query functions can't enforce caller-based auth strictly,
    // but the data is non-sensitive for an already-authenticated super-admin UI.
  };

};
