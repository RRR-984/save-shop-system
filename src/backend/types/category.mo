module {
  /// A globally managed category available to all shops.
  /// Managed by super-admin; defaults bootstrapped on canister init.
  public type GlobalCategory = {
    id : Text;
    name : Text;
    isDefault : Bool;
    isDeleted : Bool;
  };

  /// Result variant for category write operations.
  public type CategoryResult = {
    #ok : GlobalCategory;
    #err : Text;
  };
};
