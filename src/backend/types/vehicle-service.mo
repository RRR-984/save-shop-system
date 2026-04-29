module {

  // A single batch consumed when parts are used in a job card
  public type BatchConsumed = {
    batchId   : Text;
    qty       : Nat;
  };

  // One line of parts used in a job card
  public type PartUsed = {
    productId   : Text;
    productName : Text;
    quantity    : Nat;
    unitCost    : Float;
    batchesUsed : [BatchConsumed];
    lineTotal   : Float;
  };

  public type JobCardStatus = {
    #Open;
    #InProgress;
    #Completed;
    #OnHold;
  };

  public type ReminderType = {
    #fixed;
    #manual;
  };

  public type ReminderStatus = {
    #pending;
    #sent;
    #snoozed;
    #dismissed;
  };

  // Vehicle record — vehicle number is the unique business key per shop
  public type VehicleRecord = {
    id                     : Text;
    shopId                 : Text;
    vehicleNumber          : Text;
    customerName           : Text;
    customerPhone          : Text;
    vehicleModel           : Text;
    vehicleType            : Text;
    firstServiceDate       : Int;
    lastServiceDate        : Int;
    nextDueDate            : Int;
    totalServiceCount      : Nat;
    nextServiceIntervalDays: Nat;   // default 90
    createdAt              : Int;
    updatedAt              : Int;
  };

  // Job card — linked to a vehicle
  public type JobCard = {
    id                    : Text;
    shopId                : Text;
    vehicleId             : Text;
    vehicleNumber         : Text;
    customerId            : ?Text;
    date                  : Int;
    problemDescription    : Text;
    workDone              : Text;
    status                : JobCardStatus;
    partsUsed             : [PartUsed];
    labourHours           : Float;
    labourRate            : Float;
    labourCost            : Float;
    subtotal              : Float;
    gstAmount             : Float;
    grandTotal            : Float;
    invoiceId             : ?Text;
    completedAt           : ?Int;
    manualNextServiceDate : ?Int;
    notes                 : Text;
    createdAt             : Int;
    updatedAt             : Int;
  };

  // Service reminder — linked to a vehicle
  public type ServiceReminder = {
    id                  : Text;
    shopId              : Text;
    vehicleId           : Text;
    vehicleNumber       : Text;
    customerName        : Text;
    customerPhone       : Text;
    dueDate             : Int;
    reminderType        : ReminderType;
    snoozedUntil        : ?Int;
    lastReminderSentAt  : ?Int;
    status              : ReminderStatus;
    createdAt           : Int;
  };

};
