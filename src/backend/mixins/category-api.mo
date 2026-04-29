import Types "../types/category";
import CategoryLib "../lib/category";

mixin (
  globalCategoriesStore : CategoryLib.CategoryStore,
) {
  /// Return all non-deleted global categories. No auth required.
  public query func getGlobalCategories() : async [Types.GlobalCategory] {
    CategoryLib.getCategories(globalCategoriesStore)
  };

  /// Add a new global category. Super-admin only (enforced at frontend layer).
  public shared func addGlobalCategory(name : Text) : async Types.CategoryResult {
    CategoryLib.addCategory(globalCategoriesStore, name)
  };

  /// Update an existing global category name. Super-admin only.
  public shared func updateGlobalCategory(id : Text, name : Text) : async Types.CategoryResult {
    CategoryLib.updateCategory(globalCategoriesStore, id, name)
  };

  /// Soft-delete a global category. Default categories cannot be deleted. Super-admin only.
  public shared func deleteGlobalCategory(id : Text) : async { #ok; #err : Text } {
    CategoryLib.deleteCategory(globalCategoriesStore, id)
  };
};
