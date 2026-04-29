import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Types "../types/category";

module {
  /// Store alias for the global categories map.
  public type CategoryStore = Map.Map<Text, Types.GlobalCategory>;

  let DEFAULT_NAMES : [Text] = [
    "Hardware",
    "Electrical Shop",
    "Grocery",
    "Medical / Pharma",
    "General Store",
    "Footwear",
    "Clothing",
    "Building Material",
    "Auto Parts",
    "Oil & Grease",
    "Fruits & Vegetables",
    "Beverages",
    "Mobile Shop",
    "Electronics (TV / Fridge / AC)",
    "Stationery",
    "Sweets & Bakery",
    "Dairy & Daily Needs",
    "Books",
    "Furniture",
    "Sports & Fitness",
    "Toys & Games",
    "Cosmetics & Beauty",
    "Others",
  ];

  /// Bootstrap default categories, seeding any that are not yet present.
  /// Safe to call on every canister boot — existing entries are never removed.
  public func initDefaultCategories(store : CategoryStore) : () {
    for (name in DEFAULT_NAMES.values()) {
      let id = "cat_" # name.toLower();
      // Skip if already present (handles upgrades without re-seeding)
      switch (store.get(id)) {
        case (?_) {};
        case (null) {
          let cat : Types.GlobalCategory = {
            id;
            name;
            isDefault = true;
            isDeleted = false;
          };
          store.add(id, cat);
        };
      };
    };
  };

  /// Add a new global category. Returns #err if name is blank or duplicate.
  public func addCategory(
    store : CategoryStore,
    name : Text,
  ) : Types.CategoryResult {
    let trimmed = name.trimEnd(#char ' ').trimStart(#char ' ');
    if (trimmed == "") {
      return #err "Category name cannot be blank.";
    };
    let lowerName = trimmed.toLower();
    // Check duplicate
    for ((_, cat) in store.entries()) {
      if (not cat.isDeleted and cat.name.toLower() == lowerName) {
        return #err "Category name already exists.";
      };
    };
    let ts : Nat = Int.abs(Time.now());
    let id = "cat_" # ts.toText();
    let newCat : Types.GlobalCategory = {
      id;
      name = trimmed;
      isDefault = false;
      isDeleted = false;
    };
    store.add(id, newCat);
    #ok newCat
  };

  /// Update the name of an existing category by id.
  public func updateCategory(
    store : CategoryStore,
    id : Text,
    name : Text,
  ) : Types.CategoryResult {
    let trimmed = name.trimEnd(#char ' ').trimStart(#char ' ');
    if (trimmed == "") {
      return #err "Category name cannot be blank.";
    };
    switch (store.get(id)) {
      case (null) { #err "Category not found." };
      case (?cat) {
        if (cat.isDeleted) { return #err "Category not found." };
        // Check duplicate name (excluding self)
        let lowerName = trimmed.toLower();
        for ((existingId, existing) in store.entries()) {
          if (existingId != id and not existing.isDeleted
              and existing.name.toLower() == lowerName) {
            return #err "Category name already exists.";
          };
        };
        let updated : Types.GlobalCategory = { cat with name = trimmed };
        store.add(id, updated);
        #ok updated
      };
    };
  };

  /// Soft-delete a category (isDeleted = true).
  /// Default categories cannot be deleted.
  public func deleteCategory(
    store : CategoryStore,
    id : Text,
  ) : { #ok; #err : Text } {
    switch (store.get(id)) {
      case (null) { #err "Category not found." };
      case (?cat) {
        if (cat.isDeleted) { return #err "Category not found." };
        if (cat.isDefault) {
          return #err "Default categories cannot be deleted.";
        };
        store.add(id, { cat with isDeleted = true });
        #ok
      };
    };
  };

  /// Return all non-deleted categories.
  public func getCategories(store : CategoryStore) : [Types.GlobalCategory] {
    let results = store.entries()
      .filter(func((_, cat) : (Text, Types.GlobalCategory)) : Bool { not cat.isDeleted })
      .map(func((_, cat) : (Text, Types.GlobalCategory)) : Types.GlobalCategory { cat })
      .toArray();
    results
  };
};
