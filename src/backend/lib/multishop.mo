import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Types "../types/multishop";

module {
  /// Registry: ownerMobile -> List of ShopMeta
  public type Registry = Map.Map<Text, List.List<Types.ShopMeta>>;

  // ── Status helpers ───────────────────────────────────────────────────────────

  let SEVEN_DAYS_NS  : Int = 604_800_000_000_000;
  let THIRTY_DAYS_NS : Int = 2_592_000_000_000_000;
  let ONE_DAY_NS     : Int = 86_400_000_000_000;

  /// Compute the ShopStatus from a lastActivityTs nanosecond timestamp.
  public func computeStatus(lastActivityTs : Int) : Types.ShopStatus {
    if (lastActivityTs == 0) {
      return #inactive;
    };
    let now = Time.now();
    let elapsed = now - lastActivityTs;
    if (elapsed < SEVEN_DAYS_NS) {
      #active
    } else if (elapsed < THIRTY_DAYS_NS) {
      #inactive
    } else {
      #dead
    }
  };

  /// Recalculate and persist the status for a specific shop.
  /// Called on every write activity (session, billing, stock).
  public func updateShopStatus(
    registry : Registry,
    shopId : Text,
    lastActivityTs : Int,
  ) : () {
    let newStatus = computeStatus(lastActivityTs);
    for ((_, shops) in registry.entries()) {
      shops.mapInPlace(func(s : Types.ShopMeta) : Types.ShopMeta {
        if (s.id == shopId) {
          { s with status = newStatus; lastActivityTs }
        } else {
          s
        }
      });
    };
  };

  // ── capitalizeFirst ─────────────────────────────────────────────────────────

  /// Capitalizes the first character of a Text using Motoko char primitives.
  func capitalizeFirst(t : Text) : Text {
    let chars = t.toIter();
    switch (chars.next()) {
      case (null) { t };
      case (?first) {
        let upper = Text.fromChar(first).toUpper();
        // rest = everything after the first char
        var rest = "";
        for (c in chars) {
          rest := rest # Text.fromChar(c);
        };
        upper # rest
      };
    }
  };

  // ── ShopId generation ────────────────────────────────────────────────────────

  /// Generate a shopId from owner mobile and existing count.
  /// First shop keeps legacy shop_{mobile} id for backward compatibility.
  /// Additional shops get shop_{mobile}_{timestamp_as_nat}.
  public func generateShopId(ownerMobile : Text, existingCount : Nat) : Text {
    if (existingCount == 0) {
      "shop_" # ownerMobile
    } else {
      let now = Time.now();
      let ts : Nat = Int.abs(now);
      "shop_" # ownerMobile # "_" # ts.toText()
    };
  };

  // ── checkMobileExists ───────────────────────────────────────────────────────

  /// Returns true if the mobile number already owns at least one non-deleted shop.
  public func checkMobileExists(registry : Registry, mobile : Text) : Bool {
    switch (registry.get(mobile)) {
      case (null) { false };
      case (?shops) {
        switch (shops.find(func(s : Types.ShopMeta) : Bool { not s.isDeleted })) {
          case (null) { false };
          case (?_) { true };
        };
      };
    };
  };

  // ── addShop ─────────────────────────────────────────────────────────────────

  /// Create a new shop and insert it into the registry.
  public func addShop(
    registry : Registry,
    ownerMobile : Text,
    shopName : Text,
    address : Text,
    city : Text,
    category : Text,
  ) : Types.AddShopResult {
    let existing : List.List<Types.ShopMeta> = switch (registry.get(ownerMobile)) {
      case (null) { List.empty<Types.ShopMeta>() };
      case (?shops) { shops };
    };

    // Check 2-shop limit (count only non-deleted)
    var activeCount : Nat = 0;
    for (s in existing.values()) {
      if (not s.isDeleted) { activeCount += 1 };
    };
    if (activeCount >= 2) {
      return {
        shopId = "";
        success = false;
        error = ?"Maximum 2 shops allowed per mobile number.";
      };
    };

    // Auto-format: capitalize first letter
    let formattedName = capitalizeFirst(shopName.trimStart(#char ' ').trimEnd(#char ' '));

    // Check for duplicate shop name (case-insensitive, across all owners)
    let lowerName = formattedName.toLower();
    var isDuplicate = false;
    for ((_, shops) in registry.entries()) {
      for (s in shops.values()) {
        if (not s.isDeleted and s.name.toLower() == lowerName) {
          isDuplicate := true;
        };
      };
    };
    if (isDuplicate) {
      return {
        shopId = "";
        success = false;
        error = ?"Shop name already exists. Please choose a unique name.";
      };
    };

    let shopId = generateShopId(ownerMobile, activeCount);
    let shop : Types.ShopMeta = {
      id = shopId;
      ownerMobile;
      name = formattedName;
      address;
      city;
      category;
      createdAt = Time.now().toText();
      isDeleted = false;
      status = #inactive;
      lastActivityTs = 0;
    };
    existing.add(shop);
    registry.add(ownerMobile, existing);
    { shopId; success = true; error = null }
  };

  // ── listShopsForOwner ────────────────────────────────────────────────────────

  /// Return all non-deleted shops for a given owner mobile.
  public func listShopsForOwner(
    registry : Registry,
    mobile : Text,
  ) : [Types.ShopMeta] {
    switch (registry.get(mobile)) {
      case (null) { [] };
      case (?shops) {
        shops.filter(func(s : Types.ShopMeta) : Bool { not s.isDeleted }).toArray()
      };
    };
  };

  // ── updateShop ───────────────────────────────────────────────────────────────

  /// Update name/address/city/category for a shop identified by shopId.
  public func updateShop(
    registry : Registry,
    shopId : Text,
    name : Text,
    address : Text,
    city : Text,
    category : Text,
  ) : Types.UpdateShopResult {
    var found = false;
    for ((_, shops) in registry.entries()) {
      shops.mapInPlace(func(s : Types.ShopMeta) : Types.ShopMeta {
        if (s.id == shopId and not s.isDeleted) {
          found := true;
          { s with name; address; city; category }
        } else {
          s
        }
      });
    };
    if (found) {
      { success = true; error = null }
    } else {
      { success = false; error = ?"Shop not found." }
    }
  };

  // ── deleteShop ───────────────────────────────────────────────────────────────

  /// Soft-delete a shop (sets isDeleted = true, data preserved).
  public func deleteShop(
    registry : Registry,
    shopId : Text,
  ) : Types.DeleteShopResult {
    for ((_, shops) in registry.entries()) {
      shops.mapInPlace(func(s : Types.ShopMeta) : Types.ShopMeta {
        if (s.id == shopId) {
          { s with isDeleted = true }
        } else {
          s
        }
      });
    };
    { success = true }
  };

  // ── getShop ──────────────────────────────────────────────────────────────────

  /// Return a single shop by shopId (scans all owners).
  public func getShop(
    registry : Registry,
    shopId : Text,
  ) : ?Types.ShopMeta {
    for ((_, shops) in registry.entries()) {
      switch (shops.find(func(s : Types.ShopMeta) : Bool { s.id == shopId })) {
        case (?s) { return ?s };
        case (null) {};
      };
    };
    null
  };

  // ── getOwnerStats ────────────────────────────────────────────────────────────

  /// Aggregate stats across all shops for an owner.
  public func getOwnerStats(
    registry : Registry,
    _shopData : Map.Map<Text, Map.Map<Text, Text>>,
    mobile : Text,
  ) : Types.OwnerStats {
    let shopStatsList = List.empty<Types.ShopStats>();
    switch (registry.get(mobile)) {
      case (null) {};
      case (?shops) {
        for (s in shops.values()) {
          if (not s.isDeleted) {
            shopStatsList.add({
              shopId = s.id;
              shopName = s.name;
              sales = 0;
              profit = 0;
              customers = 0;
              products = 0;
              transactions = 0;
            });
          };
        };
      };
    };
    {
      totalSales = 0;
      totalProfit = 0;
      totalCustomers = 0;
      totalProducts = 0;
      totalTransactions = 0;
      shopStats = shopStatsList.toArray();
    }
  };

  // ── getTopActiveShops ────────────────────────────────────────────────────────

  /// Return the top `limit` shops ranked by combined score.
  /// RankScore = (totalRevenue * 5) + (totalSalesCount * 3) + (recencyScore * 2)
  /// recencyScore = max(0, 30 - daysSinceLastActivity)
  public func getTopActiveShops(
    registry : Registry,
    shopData : Map.Map<Text, Map.Map<Text, Text>>,
    limit : Nat,
  ) : [Types.ShopRankResult] {
    let now = Time.now();
    let results = List.empty<Types.ShopRankResult>();

    for ((ownerMobile, shops) in registry.entries()) {
      for (shop in shops.values()) {
        if (not shop.isDeleted) {
          let shopId = shop.id;

          // Count invoices and sum revenue from shopData
          var totalRevenue : Int = 0;
          var totalSalesCount : Nat = 0;

          switch (shopData.get(shopId)) {
            case (null) {};
            case (?sMap) {
              switch (sMap.get("invoices")) {
                case (null) {};
                case (?invoicesJson) {
                  if (invoicesJson != "" and invoicesJson != "[]") {
                    // Count invoice objects by number of "\"id\":" occurrences
                    let idParts = invoicesJson.split(#text "\"id\":\"");
                    var count : Nat = 0;
                    var firstId = true;
                    for (_ in idParts) {
                      if (firstId) { firstId := false }
                      else { count += 1 };
                    };
                    totalSalesCount := count;

                    // Sum totalAmount fields
                    let amountParts = invoicesJson.split(#text "\"totalAmount\":");
                    var firstAmt = true;
                    for (part in amountParts) {
                      if (firstAmt) { firstAmt := false }
                      else {
                        // Extract numeric value up to first comma or closing brace
                        let numText = part.trim(#char ' ');
                        let endParts = numText.split(#char ',');
                        switch (endParts.next()) {
                          case (null) {};
                          case (?rawNum) {
                            let cleaned = rawNum
                              .replace(#char '}', "")
                              .replace(#char ']', "")
                              .replace(#char ' ', "");
                            switch (Int.fromText(cleaned)) {
                              case (?amt) { totalRevenue += amt };
                              case (null) {};
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };

          // Compute recency score
          let daysSince : Int = if (shop.lastActivityTs == 0) {
            30 // treat new shops with no activity as 30 days inactive
          } else {
            (now - shop.lastActivityTs) / ONE_DAY_NS
          };
          let recencyScore : Int = Int.max(0, 30 - daysSince);

          let rankScore : Int = (totalRevenue * 5)
            + (Int.fromNat(totalSalesCount) * 3)
            + (recencyScore * 2);

          results.add({
            shopId;
            shopName = shop.name;
            ownerMobile;
            rankScore;
            totalRevenue;
            totalSalesCount;
            lastActivityTs = shop.lastActivityTs;
            status = computeStatus(shop.lastActivityTs);
          });
        };
      };
    };

    // Sort descending by rankScore and take top `limit`
    let sorted = results.sort(func(a : Types.ShopRankResult, b : Types.ShopRankResult) : { #less; #equal; #greater } {
      Int.compare(b.rankScore, a.rankScore)
    });
    sorted.values().take(limit).toArray()
  };
};
