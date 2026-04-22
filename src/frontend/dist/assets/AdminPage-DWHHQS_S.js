import { c as createLucideIcon, r as reactExports, u as useControllableState, j as jsxRuntimeExports, P as Primitive, a as useComposedRefs, b as composeEventHandlers, d as Presence, e as createContextScope, f as useSize, g as cn, h as useAuth, C as Card, i as CardHeader, k as CardTitle, M as MessageSquare, S as Settings, R as ROLE_PERMISSIONS, l as useStore, B as Button, m as Plus, n as CardContent, T as Table, o as TableHeader, p as TableRow, q as TableHead, s as TableBody, t as TableCell, v as Badge, w as Pencil, x as Trash2, y as ue, L as Label, I as Input, z as ShoppingCart, A as TrendingUp, D as CircleCheckBig, E as Clock, F as CircleAlert } from "./index-Bt77HP0S.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-NQ0wylTN.js";
import { R as Root, I as Item, c as createRovingFocusGroupScope, T as Tabs, a as TabsList, b as TabsTrigger, d as TabsContent } from "./tabs-FRlTL3i_.js";
import { u as useDirection } from "./index-BoNbO3VT.js";
import { u as usePrevious } from "./index-Bc1JMXzj.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CGD2qyaK.js";
import { S as Switch } from "./switch-USsqFl0-.js";
import { c as clearLeadingZeros } from "./numberInput-BP2ScP3W.js";
import { T as Tag } from "./tag-BROHmU0i.js";
import { L as Lock } from "./lock-CVY4hd8d.js";
import { C as CircleX } from "./circle-x-BDHwm0HL.js";
import { L as Lightbulb, S as Sparkles, B as Bug } from "./sparkles-Cii-no10.js";
import "./index-Dc2wOXFM.js";
import "./chevron-down-CFG9Ipkf.js";
import "./check-DtmnsLpz.js";
import "./chevron-up-hZ92f35t.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", key: "1nb95v" }],
  ["line", { x1: "8", x2: "16", y1: "6", y2: "6", key: "x4nwl0" }],
  ["line", { x1: "16", x2: "16", y1: "14", y2: "18", key: "wjye3r" }],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M12 10h.01", key: "1nrarc" }],
  ["path", { d: "M8 10h.01", key: "19clt8" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }]
];
const Calculator = createLucideIcon("calculator", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]];
const Circle = createLucideIcon("circle", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",
      key: "icamh8"
    }
  ],
  ["path", { d: "m14.5 12.5 2-2", key: "inckbg" }],
  ["path", { d: "m11.5 9.5 2-2", key: "fmmyf7" }],
  ["path", { d: "m8.5 6.5 2-2", key: "vc6u1g" }],
  ["path", { d: "m17.5 15.5 2-2", key: "wo5hmg" }]
];
const Ruler = createLucideIcon("ruler", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m2 2 20 20", key: "1ooewy" }],
  [
    "path",
    {
      d: "M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71",
      key: "1jlk70"
    }
  ],
  [
    "path",
    {
      d: "M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264",
      key: "18rp1v"
    }
  ]
];
const ShieldOff = createLucideIcon("shield-off", __iconNode);
var RADIO_NAME = "Radio";
var [createRadioContext, createRadioScope] = createContextScope(RADIO_NAME);
var [RadioProvider, useRadioContext] = createRadioContext(RADIO_NAME);
var Radio = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRadio,
      name,
      checked = false,
      required,
      disabled,
      value = "on",
      onCheck,
      form,
      ...radioProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioProvider, { scope: __scopeRadio, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "radio",
          "aria-checked": checked,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...radioProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            if (!checked) onCheck == null ? void 0 : onCheck();
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        RadioBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Radio.displayName = RADIO_NAME;
var INDICATOR_NAME = "RadioIndicator";
var RadioIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadio, forceMount, ...indicatorProps } = props;
    const context = useRadioContext(INDICATOR_NAME, __scopeRadio);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.checked, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...indicatorProps,
        ref: forwardedRef
      }
    ) });
  }
);
RadioIndicator.displayName = INDICATOR_NAME;
var BUBBLE_INPUT_NAME = "RadioBubbleInput";
var RadioBubbleInput = reactExports.forwardRef(
  ({
    __scopeRadio,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "radio",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
RadioBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
var RADIO_GROUP_NAME = "RadioGroup";
var [createRadioGroupContext] = createContextScope(RADIO_GROUP_NAME, [
  createRovingFocusGroupScope,
  createRadioScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var useRadioScope = createRadioScope();
var [RadioGroupProvider, useRadioGroupContext] = createRadioGroupContext(RADIO_GROUP_NAME);
var RadioGroup$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRadioGroup,
      name,
      defaultValue,
      value: valueProp,
      required = false,
      disabled = false,
      orientation,
      dir,
      loop = true,
      onValueChange,
      ...groupProps
    } = props;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? null,
      onChange: onValueChange,
      caller: RADIO_GROUP_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      RadioGroupProvider,
      {
        scope: __scopeRadioGroup,
        name,
        required,
        disabled,
        value,
        onValueChange: setValue,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root,
          {
            asChild: true,
            ...rovingFocusGroupScope,
            orientation,
            dir: direction,
            loop,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Primitive.div,
              {
                role: "radiogroup",
                "aria-required": required,
                "aria-orientation": orientation,
                "data-disabled": disabled ? "" : void 0,
                dir: direction,
                ...groupProps,
                ref: forwardedRef
              }
            )
          }
        )
      }
    );
  }
);
RadioGroup$1.displayName = RADIO_GROUP_NAME;
var ITEM_NAME = "RadioGroupItem";
var RadioGroupItem$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadioGroup, disabled, ...itemProps } = props;
    const context = useRadioGroupContext(ITEM_NAME, __scopeRadioGroup);
    const isDisabled = context.disabled || disabled;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
    const radioScope = useRadioScope(__scopeRadioGroup);
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const checked = context.value === itemProps.value;
    const isArrowKeyPressedRef = reactExports.useRef(false);
    reactExports.useEffect(() => {
      const handleKeyDown = (event) => {
        if (ARROW_KEYS.includes(event.key)) {
          isArrowKeyPressedRef.current = true;
        }
      };
      const handleKeyUp = () => isArrowKeyPressedRef.current = false;
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !isDisabled,
        active: checked,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Radio,
          {
            disabled: isDisabled,
            required: context.required,
            checked,
            ...radioScope,
            ...itemProps,
            name: context.name,
            ref: composedRefs,
            onCheck: () => context.onValueChange(itemProps.value),
            onKeyDown: composeEventHandlers((event) => {
              if (event.key === "Enter") event.preventDefault();
            }),
            onFocus: composeEventHandlers(itemProps.onFocus, () => {
              var _a;
              if (isArrowKeyPressedRef.current) (_a = ref.current) == null ? void 0 : _a.click();
            })
          }
        )
      }
    );
  }
);
RadioGroupItem$1.displayName = ITEM_NAME;
var INDICATOR_NAME2 = "RadioGroupIndicator";
var RadioGroupIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadioGroup, ...indicatorProps } = props;
    const radioScope = useRadioScope(__scopeRadioGroup);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioIndicator, { ...radioScope, ...indicatorProps, ref: forwardedRef });
  }
);
RadioGroupIndicator.displayName = INDICATOR_NAME2;
var Root2 = RadioGroup$1;
var Item2 = RadioGroupItem$1;
var Indicator = RadioGroupIndicator;
function RadioGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root2,
    {
      "data-slot": "radio-group",
      className: cn("grid gap-3", className),
      ...props
    }
  );
}
function RadioGroupItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Item2,
    {
      "data-slot": "radio-group-item",
      className: cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Indicator,
        {
          "data-slot": "radio-group-indicator",
          className: "relative flex items-center justify-center",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" })
        }
      )
    }
  );
}
function AdminPage() {
  const { currentUser } = useAuth();
  const role = (currentUser == null ? void 0 : currentUser.role) ?? "staff";
  if (role === "staff") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[60vh] px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        "data-ocid": "admin.denied.card",
        className: "w-full max-w-sm shadow-card border-border text-center",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { size: 24, className: "text-destructive" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-destructive", children: "Access Denied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm mt-1", children: [
            "You do not have Admin Panel access.",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            "Only Owner and Manager can access this page."
          ] })
        ] })
      }
    ) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanelContent, { role });
}
function AdminPanelContent({ role }) {
  const isOwner = role === "owner";
  const canManageStaff = ROLE_PERMISSIONS.canManageStaff(
    role
  );
  const canChangeSettings = ROLE_PERMISSIONS.canChangeSettings(
    role
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 md:px-6 pb-6 flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: "Admin Panel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-sm", children: [
        "Manage products, categories, units",
        isOwner ? ", users, and settings" : ""
      ] }),
      !isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldOff, { size: 12 }),
        "Manager View — Limited Access"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "products", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TabsList,
        {
          "data-ocid": "admin.tab",
          className: "mb-4 flex-wrap h-auto gap-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "products", children: "Products" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "categories", children: "Categories" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "units", children: "Units" }),
            canManageStaff && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "users", children: "Users" }),
            isOwner && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "feedback", "data-ocid": "admin.tab.feedback", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 12, className: "mr-1" }),
              " Feedback"
            ] }),
            canChangeSettings && /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "settings", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 12, className: "mr-1" }),
              " Settings"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "products", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductsManager, { canDelete: isOwner }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "categories", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoriesManager, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "units", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UnitsManager, {}) }),
      canManageStaff && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "users", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UsersManager, {}) }),
      isOwner && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "feedback", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedbackManager, {}) }),
      canChangeSettings && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "settings", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsManager, {}) })
    ] })
  ] }) });
}
function SettingsManager() {
  const { shopSettings, updateShopSettings, appConfig, saveAppConfig } = useStore();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2 text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Ruler, { size: 16, className: "text-primary" }),
        "Unit Settings"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/50 border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Label,
              {
                htmlFor: "mixed-units-toggle",
                className: "text-sm font-semibold cursor-pointer text-foreground",
                children: "Allow Mixed Units (Length + Weight)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Enable to store both Length and Weight for a single product." }),
            shopSettings.allowMixedUnits && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs text-primary font-medium", children: "Mixed Unit Mode is ON" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              id: "mixed-units-toggle",
              "data-ocid": "admin.settings.mixed_units.toggle",
              checked: shopSettings.allowMixedUnits,
              onCheckedChange: (checked) => updateShopSettings({ allowMixedUnits: checked })
            }
          )
        ] }),
        shopSettings.allowMixedUnits && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-border bg-secondary/30 text-xs text-muted-foreground space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "What does Mixed Unit Mode do?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• When adding a product you can set both Length + Weight" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Example: 1 Pipe = 6 meter = 15 kg" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Set Smart Ratio — it will auto-calculate" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2 text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 16, className: "text-primary" }),
          "Vendor Rate Settings"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Vendor rate change behavior control" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 p-3 rounded-lg bg-secondary/50 border border-border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Label,
              {
                htmlFor: "auto-cost-update-toggle",
                className: "text-sm font-semibold cursor-pointer text-foreground",
                children: "Auto Update Product Cost on Rate Change"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "ON: Product cost price will be automatically updated when vendor rate changes." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "OFF: A confirmation dialog will appear — you can decide." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              id: "auto-cost-update-toggle",
              "data-ocid": "admin.settings.auto_cost_update.toggle",
              checked: appConfig.autoUpdateCostOnVendorRateChange ?? false,
              onCheckedChange: (checked) => saveAppConfig({ autoUpdateCostOnVendorRateChange: checked })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-border bg-secondary/30 text-xs space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Vendor Rate History" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "• Every rate change will be automatically recorded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: '• View full rate history from the Vendors page via the "Rate History" button' })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "shadow-card border-border mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2 text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 16, className: "text-primary" }),
          "Dead Stock Settings"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'How many days without a sale before a product is considered "Dead Stock"' })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          RadioGroup,
          {
            value: [90, 180, 365].includes(shopSettings.deadStockThresholdDays ?? 90) ? String(shopSettings.deadStockThresholdDays ?? 90) : "custom",
            onValueChange: (val) => {
              if (val === "custom") {
                updateShopSettings({
                  deadStockThresholdDays: shopSettings.deadStockCustomDays ?? 90
                });
              } else {
                updateShopSettings({ deadStockThresholdDays: Number(val) });
              }
            },
            className: "space-y-2",
            children: [
              { label: "3 Months (90 days)", value: "90" },
              { label: "6 Months (180 days)", value: "180" },
              { label: "12 Months (365 days)", value: "365" },
              { label: "Custom Days", value: "custom" }
            ].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    RadioGroupItem,
                    {
                      value: opt.value,
                      id: `ds-${opt.value}`,
                      "data-ocid": `admin.dead_stock.radio.${opt.value}`
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Label,
                    {
                      htmlFor: `ds-${opt.value}`,
                      className: "cursor-pointer text-sm font-medium text-foreground",
                      children: opt.label
                    }
                  )
                ]
              },
              opt.value
            ))
          }
        ),
        ![90, 180, 365].includes(
          shopSettings.deadStockThresholdDays ?? 90
        ) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm whitespace-nowrap text-foreground", children: "Custom Days:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 1,
              max: 3650,
              className: "w-32",
              "data-ocid": "admin.dead_stock.custom_days.input",
              value: shopSettings.deadStockCustomDays ?? shopSettings.deadStockThresholdDays ?? 90,
              onChange: (e) => {
                const days = Number(clearLeadingZeros(e.target.value));
                updateShopSettings({
                  deadStockThresholdDays: days,
                  deadStockCustomDays: days
                });
              },
              onFocus: (e) => {
                if (e.target.value === "0") e.target.select();
              },
              placeholder: "e.g. 45"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "days" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-lg border border-border bg-secondary/30 text-xs space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Dead Stock Thresholds" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
            "• Slow:",
            " ",
            Math.round((shopSettings.deadStockThresholdDays ?? 90) / 2),
            " days since last sale"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
            "• Dead: ",
            shopSettings.deadStockThresholdDays ?? 90,
            " days since last sale"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function FormSection({
  icon,
  label,
  bgHint,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border last:border-b-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-5 py-2.5 bg-secondary/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
      bgHint && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto flex items-center gap-1 text-[10px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 9 }),
        " ",
        bgHint
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 py-4 space-y-3", children })
  ] });
}
function AutoCalcField({
  ocid,
  label,
  value,
  sub,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": ocid,
      className: `flex flex-col gap-1 rounded-lg border px-3 py-2.5 ${accent === "green" ? "bg-green-50 border-green-200" : accent === "blue" ? "bg-blue-50 border-blue-200" : "bg-muted/40 border-dashed border-border"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 10, className: "text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-medium", children: label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `text-base font-bold ${accent === "green" ? "text-green-700" : accent === "blue" ? "text-blue-700" : "text-foreground"}`,
            children: value
          }
        ),
        sub && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground leading-tight", children: sub })
      ]
    }
  );
}
function ProductsManager({ canDelete }) {
  const {
    products,
    categories,
    shopUnits,
    shopSettings,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    addStockIn,
    getProductCostPrice,
    getProductProfit,
    getProductProfitPct
  } = useStore();
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editProduct, setEditProduct] = reactExports.useState(null);
  const [name, setName] = reactExports.useState("");
  const [categoryName, setCategoryName] = reactExports.useState("");
  const [unit, setUnit] = reactExports.useState("");
  const [minStock, setMinStock] = reactExports.useState("");
  const [sellPrice, setSellPrice] = reactExports.useState("");
  const [costPrice, setCostPrice] = reactExports.useState("");
  const [profitPercent, setProfitPercent] = reactExports.useState("");
  const [minProfitPct, setMinProfitPct] = reactExports.useState("");
  const [vendorName, setVendorName] = reactExports.useState("");
  const [purchasePrice, setPurchasePrice] = reactExports.useState("");
  const [initialQty, setInitialQty] = reactExports.useState("");
  const [details, setDetails] = reactExports.useState("");
  const [purchaseDate, setPurchaseDate] = reactExports.useState(
    (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
  );
  const [invoiceNo, setInvoiceNo] = reactExports.useState("");
  const [billNo, setBillNo] = reactExports.useState("");
  const [transportCharge, setTransportCharge] = reactExports.useState("");
  const [labourCharge, setLabourCharge] = reactExports.useState("");
  const [otherCharge, setOtherCharge] = reactExports.useState("");
  const [expiryDate, setExpiryDate] = reactExports.useState("");
  const [retailerPrice, setRetailerPrice] = reactExports.useState("");
  const [wholesalerPrice, setWholesalerPrice] = reactExports.useState("");
  const [unitMode, setUnitMode] = reactExports.useState("single");
  const [lengthUnit, setLengthUnit] = reactExports.useState("");
  const [weightUnit, setWeightUnit] = reactExports.useState("");
  const [meterToKgRatio, setMeterToKgRatio] = reactExports.useState("");
  const [sellingMode, setSellingMode] = reactExports.useState("profit");
  const resetForm = () => {
    setName("");
    setCategoryName("");
    setUnit("");
    setMinStock("");
    setSellPrice("");
    setCostPrice("");
    setProfitPercent("");
    setMinProfitPct("");
    setVendorName("");
    setPurchasePrice("");
    setInitialQty("");
    setDetails("");
    setPurchaseDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    setInvoiceNo("");
    setBillNo("");
    setTransportCharge("");
    setLabourCharge("");
    setOtherCharge("");
    setExpiryDate("");
    setRetailerPrice("");
    setWholesalerPrice("");
    setUnitMode("single");
    setLengthUnit("");
    setWeightUnit("");
    setMeterToKgRatio("");
    setSellingMode("profit");
  };
  const openAdd = () => {
    setEditProduct(null);
    resetForm();
    setShowForm(true);
  };
  const openEdit = (p) => {
    setEditProduct(p);
    setName(p.name);
    const cat = categories.find((c) => c.id === p.categoryId);
    setCategoryName((cat == null ? void 0 : cat.name) ?? "");
    setUnit(p.unit);
    setMinStock(String(p.minStockAlert));
    setSellPrice(String(p.sellingPrice));
    setCostPrice(p.costPrice != null ? String(p.costPrice) : "");
    setMinProfitPct(p.minProfitPct != null ? String(p.minProfitPct) : "");
    if (p.purchasePrice != null && p.purchasePrice > 0) {
      const pp = (p.sellingPrice - p.purchasePrice) / p.purchasePrice * 100;
      setProfitPercent(pp > 0 ? pp.toFixed(2) : "");
    } else {
      setProfitPercent("");
    }
    setVendorName(p.vendorName ?? "");
    setPurchasePrice(p.purchasePrice != null ? String(p.purchasePrice) : "");
    setInitialQty("");
    setDetails(p.details ?? "");
    setPurchaseDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    setInvoiceNo("");
    setBillNo("");
    setTransportCharge("");
    setLabourCharge("");
    setExpiryDate(p.expiryDate ?? "");
    setRetailerPrice(p.retailerPrice != null ? String(p.retailerPrice) : "");
    setWholesalerPrice(
      p.wholesalerPrice != null ? String(p.wholesalerPrice) : ""
    );
    setUnitMode(p.unitMode ?? "single");
    setLengthUnit(p.lengthUnit ?? "");
    setWeightUnit(p.weightUnit ?? "");
    setMeterToKgRatio(p.meterToKgRatio != null ? String(p.meterToKgRatio) : "");
    setSellingMode("profit");
    setShowForm(true);
  };
  const handleSave = () => {
    var _a;
    const missingFields = [];
    if (!name.trim()) missingFields.push("Product Name");
    if (!categoryName.trim()) missingFields.push("Category");
    if (!minStock) missingFields.push("Min Alert");
    if (!sellPrice) missingFields.push("Sell Price");
    if (unitMode === "single" && !unit.trim()) missingFields.push("Unit");
    if (unitMode === "mixed") {
      if (!lengthUnit.trim()) missingFields.push("Length Unit");
      if (!weightUnit.trim()) missingFields.push("Weight Unit");
    }
    if (missingFields.length > 0) {
      ue.error(`Required: ${missingFields.join(", ")}`);
      return;
    }
    let catId = (_a = categories.find(
      (c) => c.name.toLowerCase() === categoryName.trim().toLowerCase()
    )) == null ? void 0 : _a.id;
    if (!catId) {
      catId = addCategory(categoryName.trim());
    }
    const primaryUnit = unitMode === "mixed" ? lengthUnit.trim() : unit.trim();
    const data = {
      name: name.trim(),
      categoryId: catId,
      unit: primaryUnit,
      minStockAlert: Number(minStock),
      sellingPrice: Number(sellPrice),
      costPrice: costPrice ? Number(costPrice) : void 0,
      minProfitPct: minProfitPct ? Number(minProfitPct) : void 0,
      vendorName: vendorName.trim() || void 0,
      purchasePrice: purchasePrice ? Number(purchasePrice) : void 0,
      details: details.trim() || void 0,
      expiryDate: expiryDate.trim() || void 0,
      unitMode,
      retailerPrice: retailerPrice ? Number(retailerPrice) : void 0,
      wholesalerPrice: wholesalerPrice ? Number(wholesalerPrice) : void 0,
      ...unitMode === "mixed" ? {
        lengthUnit: lengthUnit.trim(),
        weightUnit: weightUnit.trim(),
        meterToKgRatio: meterToKgRatio ? Number(meterToKgRatio) : void 0
      } : {}
    };
    if (editProduct) {
      updateProduct(editProduct.id, data);
      ue.success("Product updated");
    } else {
      const existingProduct = products.find(
        (p) => p.name.trim().toLowerCase() === data.name.trim().toLowerCase()
      );
      if (existingProduct) {
        ue.warning(
          `"${data.name}" already exists — add stock to it or rename`
        );
        setShowForm(false);
        return;
      }
      const newId = addProduct(data);
      const qty = Number(initialQty);
      if (qty > 0) {
        addStockIn(
          newId,
          qty,
          purchasePrice ? Number(purchasePrice) : 0,
          purchaseDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
          "Initial stock",
          invoiceNo.trim() || void 0,
          billNo.trim() || void 0,
          transportCharge ? Number(transportCharge) : void 0,
          labourCharge ? Number(labourCharge) : void 0,
          expiryDate.trim() || void 0,
          unitMode === "mixed" ? qty : void 0,
          unitMode === "mixed" && meterToKgRatio ? qty * Number(meterToKgRatio) : void 0,
          otherCharge ? Number(otherCharge) : void 0
        );
      }
      ue.success("Product added! ✓");
    }
    setShowForm(false);
  };
  const qty4cost = Number(initialQty || 0);
  const finalCostTotal = Number(purchasePrice || 0) * qty4cost + Number(transportCharge || 0) + Number(labourCharge || 0) + Number(otherCharge || 0);
  const finalCostPerUnit = qty4cost > 0 ? finalCostTotal / qty4cost : Number(purchasePrice || 0);
  const handleProfitPctChange = (pct) => {
    setProfitPercent(pct);
    if (Number(pct) < 0) return;
    const baseCost = finalCostPerUnit > 0 ? finalCostPerUnit : Number(purchasePrice || 0);
    if (baseCost > 0 && pct !== "") {
      const sp = baseCost + baseCost * Number(pct) / 100;
      setSellPrice(sp.toFixed(2));
    }
  };
  const handleSellPriceChange = (sp) => {
    setSellPrice(sp);
    const baseCost = finalCostPerUnit > 0 ? finalCostPerUnit : Number(purchasePrice || 0);
    if (baseCost > 0 && sp !== "") {
      const pct = (Number(sp) - baseCost) / baseCost * 100;
      setProfitPercent(pct.toFixed(2));
    }
  };
  const recalcFromCost = (pp, qty, tc, lc, oc) => {
    const qtyN = Number(qty || 0);
    const totalCost = Number(pp || 0) * qtyN + Number(tc || 0) + Number(lc || 0) + Number(oc || 0);
    const perUnit = qtyN > 0 ? totalCost / qtyN : Number(pp || 0);
    if (sellingMode === "profit" && profitPercent !== "" && perUnit > 0) {
      const sp = perUnit + perUnit * Number(profitPercent) / 100;
      setSellPrice(sp.toFixed(2));
    } else if (sellingMode === "price" && sellPrice !== "" && perUnit > 0) {
      const pct = (Number(sellPrice) - perUnit) / perUnit * 100;
      setProfitPercent(pct.toFixed(2));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        products.length,
        " products"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "admin.products.add.button",
          size: "sm",
          onClick: openAdd,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
            " Add Product"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.products.empty_state",
        className: "text-center py-10 text-muted-foreground text-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No products yet." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: 'Click "Add Product" to add your first product.' })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-secondary/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Unit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Vendor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Purchase Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Sell Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Cost Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Profit (₹)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Profit %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: products.map((p, idx) => {
        const cat = categories.find((c) => c.id === p.categoryId);
        const unitDisplay = p.unitMode === "mixed" && p.lengthUnit && p.weightUnit ? `${p.lengthUnit} + ${p.weightUnit}` : p.unit;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          TableRow,
          {
            "data-ocid": `admin.products.item.${idx + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-sm font-medium", children: [
                p.name,
                p.unitMode === "mixed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "ml-1 text-[10px] px-1 py-0 h-4 bg-secondary text-muted-foreground border-0", children: "Mixed" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: cat == null ? void 0 : cat.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: unitDisplay }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: p.vendorName ?? "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: p.purchasePrice != null ? `₹${p.purchasePrice}` : "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: `₹${p.sellingPrice}` }),
              (() => {
                const cp = getProductCostPrice(p.id);
                const profit = getProductProfit(p.id);
                const profitPct = getProductProfitPct(p.id);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-xs", children: cp > 0 ? `₹${cp}` : "-" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TableCell,
                    {
                      className: `text-xs font-semibold ${profit > 0 ? "text-green-600" : profit < 0 ? "text-red-500" : "text-muted-foreground"}`,
                      children: cp > 0 ? `₹${profit.toFixed(2)}` : "-"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    TableCell,
                    {
                      className: `text-xs font-semibold ${profitPct > 0 ? "text-green-600" : profitPct < 0 ? "text-red-500" : "text-muted-foreground"}`,
                      children: cp > 0 ? `${profitPct.toFixed(1)}%` : "-"
                    }
                  )
                ] });
              })(),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    "data-ocid": `admin.products.edit_button.${idx + 1}`,
                    variant: "ghost",
                    size: "sm",
                    className: "h-7 w-7 p-0",
                    onClick: () => openEdit(p),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 })
                  }
                ),
                canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    "data-ocid": `admin.products.delete_button.${idx + 1}`,
                    variant: "ghost",
                    size: "sm",
                    className: "h-7 w-7 p-0 text-destructive hover:bg-destructive/10",
                    onClick: () => {
                      deleteProduct(p.id);
                      ue.success("Product deleted");
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 })
                  }
                )
              ] }) })
            ]
          },
          p.id
        );
      }) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      DialogContent,
      {
        "data-ocid": "admin.products.form.dialog",
        className: "max-w-lg w-full p-0 gap-0 overflow-hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "px-5 pt-5 pb-3 border-b border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "flex items-center gap-2 text-base", children: editProduct ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 16, className: "text-primary" }),
            " Edit Product"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16, className: "text-primary" }),
            " Add New Product"
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto max-h-[76vh]", children: [
            !editProduct && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              FormSection,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { size: 14 }),
                label: "Purchase Details",
                color: "blue",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Vendor" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.vendor.input",
                          value: vendorName,
                          onChange: (e) => setVendorName(e.target.value),
                          placeholder: "e.g. Sharma Traders",
                          className: "h-9"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Bill No" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.bill_no.input",
                          value: billNo,
                          onChange: (e) => setBillNo(e.target.value),
                          placeholder: "e.g. BILL-001",
                          className: "h-9"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.purchase_date.input",
                        type: "date",
                        value: purchaseDate,
                        onChange: (e) => setPurchaseDate(e.target.value),
                        className: "h-9"
                      }
                    )
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              FormSection,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 14 }),
                label: "Product Details",
                color: "indigo",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Product Name *" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.name.input",
                        value: name,
                        onChange: (e) => setName(e.target.value),
                        placeholder: "e.g. Basmati Rice",
                        className: "h-9"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Category *" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.category.input",
                          value: categoryName,
                          onChange: (e) => setCategoryName(e.target.value),
                          placeholder: "e.g. Grains",
                          list: "category-suggestions",
                          className: "h-9"
                        }
                      ),
                      categories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "category-suggestions", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.name }, c.id)) })
                    ] }),
                    unitMode === "single" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Unit *" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.unit.input",
                          value: unit,
                          onChange: (e) => setUnit(e.target.value),
                          placeholder: "kg",
                          list: "unit-suggestions",
                          className: "h-9"
                        }
                      ),
                      shopUnits.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "unit-suggestions", children: shopUnits.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u.name }, u.id)) })
                    ] })
                  ] }),
                  shopSettings.allowMixedUnits && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "admin.products.unit_mode_single.toggle",
                        onClick: () => setUnitMode("single"),
                        className: `flex-1 text-xs py-1.5 px-3 rounded-md border transition-colors ${unitMode === "single" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`,
                        children: "Single Unit"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": "admin.products.unit_mode_mixed.toggle",
                        onClick: () => setUnitMode("mixed"),
                        className: `flex-1 text-xs py-1.5 px-3 rounded-md border transition-colors ${unitMode === "mixed" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`,
                        children: "Mixed Unit"
                      }
                    )
                  ] }),
                  unitMode === "mixed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 p-3 rounded-lg border border-border bg-secondary/30", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Length Unit *" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Input,
                          {
                            "data-ocid": "admin.products.length_unit.input",
                            value: lengthUnit,
                            onChange: (e) => setLengthUnit(e.target.value),
                            placeholder: "meter",
                            list: "length-unit-suggestions",
                            className: "h-8 text-sm"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("datalist", { id: "length-unit-suggestions", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "meter" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cm" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "feet" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "inch" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Weight Unit *" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Input,
                          {
                            "data-ocid": "admin.products.weight_unit.input",
                            value: weightUnit,
                            onChange: (e) => setWeightUnit(e.target.value),
                            placeholder: "kg",
                            list: "weight-unit-suggestions",
                            className: "h-8 text-sm"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("datalist", { id: "weight-unit-suggestions", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "kg" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ton" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "gram" })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Smart Mode Ratio (Optional)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: [
                          "1 ",
                          lengthUnit || "meter",
                          " ="
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Input,
                          {
                            "data-ocid": "admin.products.ratio.input",
                            type: "number",
                            value: meterToKgRatio,
                            onChange: (e) => setMeterToKgRatio(clearLeadingZeros(e.target.value)),
                            onFocus: (e) => {
                              if (e.target.value === "0") e.target.select();
                            },
                            placeholder: "2.5",
                            className: "h-8 text-sm",
                            min: "0",
                            step: "0.01"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: weightUnit || "kg" })
                      ] })
                    ] })
                  ] }),
                  !editProduct && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
                      "Quantity",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground normal-case", children: "(Opening Stock)" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.initial_qty.input",
                        type: "number",
                        value: initialQty,
                        onChange: (e) => setInitialQty(clearLeadingZeros(e.target.value)),
                        onFocus: (e) => {
                          if (e.target.value === "0") e.target.select();
                        },
                        placeholder: "e.g. 50",
                        className: "h-9"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Opening stock quantity? A stock batch will be created." })
                  ] })
                ]
              }
            ),
            !editProduct && /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormSection,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { size: 14 }),
                label: "Cost Input",
                color: "orange",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Purchase Price (₹)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.purchase_price.input",
                        type: "number",
                        value: purchasePrice,
                        onFocus: (e) => {
                          if (e.target.value === "0") e.target.select();
                        },
                        onChange: (e) => {
                          setPurchasePrice(clearLeadingZeros(e.target.value));
                          recalcFromCost(
                            clearLeadingZeros(e.target.value),
                            initialQty,
                            transportCharge,
                            labourCharge,
                            otherCharge
                          );
                        },
                        placeholder: "e.g. 80",
                        className: "h-9"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Transport (₹)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.transport.input",
                        type: "number",
                        value: transportCharge,
                        onFocus: (e) => {
                          if (e.target.value === "0") e.target.select();
                        },
                        onChange: (e) => {
                          setTransportCharge(clearLeadingZeros(e.target.value));
                          recalcFromCost(
                            purchasePrice,
                            initialQty,
                            clearLeadingZeros(e.target.value),
                            labourCharge,
                            otherCharge
                          );
                        },
                        placeholder: "0",
                        className: "h-9"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Labour (₹)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.labour.input",
                        type: "number",
                        value: labourCharge,
                        onFocus: (e) => {
                          if (e.target.value === "0") e.target.select();
                        },
                        onChange: (e) => {
                          setLabourCharge(clearLeadingZeros(e.target.value));
                          recalcFromCost(
                            purchasePrice,
                            initialQty,
                            transportCharge,
                            clearLeadingZeros(e.target.value),
                            otherCharge
                          );
                        },
                        placeholder: "0",
                        className: "h-9"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Other (₹)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.other_charges.input",
                        type: "number",
                        value: otherCharge,
                        onFocus: (e) => {
                          if (e.target.value === "0") e.target.select();
                        },
                        onChange: (e) => {
                          setOtherCharge(clearLeadingZeros(e.target.value));
                          recalcFromCost(
                            purchasePrice,
                            initialQty,
                            transportCharge,
                            labourCharge,
                            clearLeadingZeros(e.target.value)
                          );
                        },
                        placeholder: "0",
                        className: "h-9"
                      }
                    )
                  ] })
                ] })
              }
            ),
            !editProduct && /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormSection,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 14 }),
                label: "Auto Calculation",
                color: "slate",
                bgHint: "Auto-calculated — read only",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AutoCalcField,
                    {
                      ocid: "admin.products.final_cost.display",
                      label: "Final Cost (Total)",
                      value: qty4cost > 0 || finalCostTotal > 0 ? `₹${finalCostTotal.toFixed(2)}` : "—",
                      sub: qty4cost > 0 && purchasePrice ? `₹${Number(purchasePrice || 0)} × ${qty4cost}${Number(transportCharge) > 0 ? ` + ₹${transportCharge} transport` : ""}${Number(labourCharge) > 0 ? ` + ₹${labourCharge} labour` : ""}${Number(otherCharge) > 0 ? ` + ₹${otherCharge} other` : ""}` : void 0,
                      accent: "green"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AutoCalcField,
                    {
                      ocid: "admin.products.per_unit_cost.display",
                      label: "Per Unit Cost",
                      value: finalCostPerUnit > 0 ? `₹${finalCostPerUnit.toFixed(2)}` : "—",
                      sub: qty4cost > 0 && finalCostTotal > 0 ? `₹${finalCostTotal.toFixed(2)} ÷ ${qty4cost}` : void 0,
                      accent: "blue"
                    }
                  )
                ] })
              }
            ),
            editProduct && /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormSection,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { size: 14 }),
                label: "Purchase Details",
                color: "orange",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Vendor" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.vendor.input",
                        value: vendorName,
                        onChange: (e) => setVendorName(e.target.value),
                        placeholder: "e.g. Sharma Traders",
                        className: "h-9"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Purchase Price (₹)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.purchase_price.input",
                        type: "number",
                        value: purchasePrice,
                        onChange: (e) => setPurchasePrice(clearLeadingZeros(e.target.value)),
                        onFocus: (e) => {
                          if (e.target.value === "0") e.target.select();
                        },
                        placeholder: "80",
                        className: "h-9"
                      }
                    )
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              FormSection,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 14 }),
                label: "Selling",
                color: "green",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 p-0.5 bg-secondary rounded-lg w-full", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setSellingMode("profit"),
                        className: `flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${sellingMode === "profit" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                        children: "Edit Profit %"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setSellingMode("price"),
                        className: `flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors ${sellingMode === "price" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                        children: "Edit Sell Price"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: sellingMode === "profit" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Profit % *" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.profit_percent.input",
                          type: "number",
                          value: profitPercent,
                          min: "0",
                          onFocus: (e) => {
                            if (e.target.value === "0") e.target.select();
                          },
                          onChange: (e) => handleProfitPctChange(
                            clearLeadingZeros(e.target.value)
                          ),
                          placeholder: "e.g. 20",
                          className: "h-9"
                        }
                      )
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                      AutoCalcField,
                      {
                        ocid: "admin.products.profit_percent_display.display",
                        label: "Profit %",
                        value: profitPercent ? `${Number(profitPercent).toFixed(1)}%` : "—",
                        accent: "green"
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: sellingMode === "price" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Selling Price (₹) *" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.sell_price.input",
                          type: "number",
                          value: sellPrice,
                          onFocus: (e) => {
                            if (e.target.value === "0") e.target.select();
                          },
                          onChange: (e) => handleSellPriceChange(
                            clearLeadingZeros(e.target.value)
                          ),
                          placeholder: "100",
                          className: "h-9"
                        }
                      )
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                      AutoCalcField,
                      {
                        ocid: "admin.products.sell_price_display.display",
                        label: "Sell Price",
                        value: sellPrice ? `₹${Number(sellPrice).toFixed(2)}` : "—",
                        accent: "green"
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
                        "MRP (₹)",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case text-muted-foreground", children: "(optional)" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.mrp.input",
                          type: "number",
                          value: costPrice,
                          onChange: (e) => setCostPrice(e.target.value),
                          placeholder: "e.g. 120",
                          className: "h-9"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
                        "Min Profit %",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case text-muted-foreground", children: "(lock)" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.min_profit_pct.input",
                          type: "number",
                          value: minProfitPct,
                          min: "0",
                          max: "100",
                          onFocus: (e) => {
                            if (e.target.value === "0") e.target.select();
                          },
                          onChange: (e) => {
                            const val = clearLeadingZeros(e.target.value);
                            if (Number(val) < 0) return;
                            setMinProfitPct(val);
                          },
                          placeholder: "e.g. 10",
                          className: "h-9"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Staff cannot sell below this minimum profit threshold" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
                        "Retailer Price (₹)",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case text-muted-foreground", children: "(optional)" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.retailer_price.input",
                          type: "number",
                          value: retailerPrice,
                          onChange: (e) => setRetailerPrice(clearLeadingZeros(e.target.value)),
                          onFocus: (e) => {
                            if (e.target.value === "0") e.target.select();
                          },
                          placeholder: "e.g. 95",
                          className: "h-9"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Retailer (दुकानदार) ke liye price" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
                        "Wholesaler Price (₹)",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case text-muted-foreground", children: "(optional)" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          "data-ocid": "admin.products.wholesaler_price.input",
                          type: "number",
                          value: wholesalerPrice,
                          onChange: (e) => setWholesalerPrice(clearLeadingZeros(e.target.value)),
                          onFocus: (e) => {
                            if (e.target.value === "0") e.target.select();
                          },
                          placeholder: "e.g. 88",
                          className: "h-9"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Wholesaler (थोक) ke liye price" })
                    ] })
                  ] })
                ]
              }
            ),
            (() => {
              const baseCost = finalCostPerUnit > 0 ? finalCostPerUnit : purchasePrice ? Number(purchasePrice) : 0;
              const sp = sellPrice ? Number(sellPrice) : 0;
              const profitRs = baseCost > 0 && sp > 0 ? sp - baseCost : 0;
              const profitPct = baseCost > 0 && profitRs !== 0 ? profitRs / baseCost * 100 : 0;
              const hasData = baseCost > 0 && sp > 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                FormSection,
                {
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 14 }),
                  label: "Auto Profit",
                  color: "emerald",
                  bgHint: "From Per Unit Cost + Selling Price",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        "data-ocid": "admin.products.profit_rs.display",
                        className: `rounded-lg border p-3 text-center ${!hasData ? "bg-muted/40 border-border" : profitRs >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 mb-0.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 10, className: "text-muted-foreground" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-medium", children: "Profit ₹" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "p",
                            {
                              className: `text-lg font-bold ${!hasData ? "text-muted-foreground" : profitRs >= 0 ? "text-green-600" : "text-red-600"}`,
                              children: hasData ? `₹${profitRs.toFixed(2)}` : "—"
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        "data-ocid": "admin.products.profit_pct_display.display",
                        className: `rounded-lg border p-3 text-center ${!hasData ? "bg-muted/40 border-border" : profitPct >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1 mb-0.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 10, className: "text-muted-foreground" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-medium", children: "Profit %" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "p",
                            {
                              className: `text-lg font-bold ${!hasData ? "text-muted-foreground" : profitPct >= 0 ? "text-green-600" : "text-red-600"}`,
                              children: hasData ? `${profitPct.toFixed(1)}%` : "—"
                            }
                          )
                        ]
                      }
                    )
                  ] })
                }
              );
            })(),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormSection,
              {
                icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 14 }),
                label: "Alerts",
                color: "amber",
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: "Min Stock Alert *" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.min_stock.input",
                        type: "number",
                        value: minStock,
                        onChange: (e) => setMinStock(e.target.value),
                        placeholder: "e.g. 10",
                        className: "h-9"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "An alert will trigger when stock falls below this level" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
                      "Expiry Date",
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "normal-case text-muted-foreground", children: "(optional)" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Input,
                      {
                        "data-ocid": "admin.products.expiry_date.input",
                        type: "date",
                        value: expiryDate,
                        onChange: (e) => setExpiryDate(e.target.value),
                        className: "h-9"
                      }
                    )
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-t border-border bg-card flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  "data-ocid": "admin.products.form.save_button",
                  onClick: handleSave,
                  className: "w-full h-11 text-sm font-semibold",
                  children: editProduct ? "Update Product" : "Save Product"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  "data-ocid": "admin.products.form.cancel_button",
                  onClick: () => setShowForm(false),
                  className: "w-full h-10 text-sm",
                  children: "Cancel"
                }
              )
            ] })
          ] })
        ]
      }
    ) })
  ] });
}
function CategoriesManager() {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useStore();
  const [newCatName, setNewCatName] = reactExports.useState("");
  const [editingId, setEditingId] = reactExports.useState(null);
  const [editingName, setEditingName] = reactExports.useState("");
  const handleAdd = () => {
    if (!newCatName.trim()) {
      ue.error("Category name required");
      return;
    }
    addCategory(newCatName.trim());
    setNewCatName("");
    ue.success("Category added");
  };
  const handleUpdate = (id) => {
    if (!editingName.trim()) {
      ue.error("Category name required");
      return;
    }
    updateCategory(id, editingName.trim());
    setEditingId(null);
    ue.success("Category updated");
  };
  const handleDelete = (id) => {
    const hasProducts = products.some((p) => p.categoryId === id);
    if (hasProducts) {
      ue.error("Remove products in this category first");
      return;
    }
    deleteCategory(id);
    ue.success("Category deleted");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card border-border max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          "data-ocid": "admin.categories.name.input",
          value: newCatName,
          onChange: (e) => setNewCatName(e.target.value),
          placeholder: "New category name",
          onKeyDown: (e) => e.key === "Enter" && handleAdd()
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { "data-ocid": "admin.categories.add.button", onClick: handleAdd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      categories.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          "data-ocid": "admin.categories.empty_state",
          className: "text-sm text-muted-foreground py-4 text-center",
          children: "No categories yet. Add one above."
        }
      ),
      categories.map((c, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          "data-ocid": `admin.categories.item.${idx + 1}`,
          className: "shadow-card border-border",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-3 flex items-center justify-between", children: editingId === c.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: editingName,
                onChange: (e) => setEditingName(e.target.value),
                className: "h-8",
                onKeyDown: (e) => e.key === "Enter" && handleUpdate(c.id)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": `admin.categories.save_button.${idx + 1}`,
                size: "sm",
                onClick: () => handleUpdate(c.id),
                children: "Save"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": `admin.categories.cancel_button.${idx + 1}`,
                size: "sm",
                variant: "outline",
                onClick: () => setEditingId(null),
                children: "Cancel"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs mr-2", children: [
                products.filter((p) => p.categoryId === c.id).length,
                " ",
                "products"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  "data-ocid": `admin.categories.edit_button.${idx + 1}`,
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 w-7 p-0",
                  onClick: () => {
                    setEditingId(c.id);
                    setEditingName(c.name);
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  "data-ocid": `admin.categories.delete_button.${idx + 1}`,
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 w-7 p-0 text-destructive hover:bg-destructive/10",
                  onClick: () => handleDelete(c.id),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 })
                }
              )
            ] })
          ] }) })
        },
        c.id
      ))
    ] })
  ] });
}
function UnitsManager() {
  const { shopUnits, addShopUnit, deleteShopUnit } = useStore();
  const [newUnit, setNewUnit] = reactExports.useState("");
  const COMMON_UNITS = [
    "kg",
    "gram",
    "litre",
    "ml",
    "pcs",
    "box",
    "dozen",
    "bundle"
  ];
  const handleAdd = () => {
    if (!newUnit.trim()) {
      ue.error("Unit name required");
      return;
    }
    addShopUnit(newUnit.trim());
    setNewUnit("");
    ue.success("Unit added");
  };
  const handleAddCommon = (name) => {
    addShopUnit(name);
    ue.success(`"${name}" added`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card border-border max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            "data-ocid": "admin.units.name.input",
            value: newUnit,
            onChange: (e) => setNewUnit(e.target.value),
            placeholder: "Unit name (e.g. kg, litre)",
            onKeyDown: (e) => e.key === "Enter" && handleAdd()
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { "data-ocid": "admin.units.add.button", onClick: handleAdd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Common units:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: COMMON_UNITS.map((u) => {
          const exists = shopUnits.some(
            (su) => su.name.toLowerCase() === u.toLowerCase()
          );
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => !exists && handleAddCommon(u),
              disabled: exists,
              className: "text-xs px-2.5 py-1 rounded-full border transition-all duration-150\n                      disabled:opacity-40 disabled:cursor-not-allowed\n                      enabled:hover:bg-primary enabled:hover:text-white enabled:hover:border-primary\n                      border-border text-muted-foreground",
              children: [
                u,
                exists && " ✓"
              ]
            },
            u
          );
        }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: shopUnits.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.units.empty_state",
        className: "text-center py-8 text-muted-foreground",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ruler, { size: 32, className: "mx-auto mb-2 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No units added yet." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Add a unit above or use common units." })
        ]
      }
    ) : shopUnits.map((u, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        "data-ocid": `admin.units.item.${idx + 1}`,
        className: "shadow-card border-border",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-md bg-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ruler, { size: 13, className: "text-accent-foreground" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: u.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": `admin.units.delete_button.${idx + 1}`,
              variant: "ghost",
              size: "sm",
              className: "h-7 w-7 p-0 text-destructive hover:bg-destructive/10",
              onClick: () => {
                deleteShopUnit(u.id);
                ue.success("Unit deleted");
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 })
            }
          )
        ] })
      },
      u.id
    )) })
  ] });
}
const FEEDBACK_TYPE_META = {
  bug: {
    label: "Bug",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { size: 11 }),
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400"
  },
  feature: {
    label: "Feature",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 11 }),
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400"
  },
  improvement: {
    label: "Improvement",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { size: 11 }),
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400"
  }
};
const FEEDBACK_STATUS_META = {
  pending: {
    label: "Pending",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 11 }),
    cls: "bg-amber-50 text-amber-700 border-amber-200"
  },
  approved: {
    label: "Approved",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 11 }),
    cls: "bg-green-50 text-green-700 border-green-200"
  },
  rejected: {
    label: "Rejected",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 11 }),
    cls: "bg-red-50 text-red-700 border-red-200"
  }
};
function FeedbackManager() {
  const { feedbackList, approveFeedback, rejectFeedback } = useStore();
  const { currentUser } = useAuth();
  const [filter, setFilter] = reactExports.useState("all");
  const [rejectingId, setRejectingId] = reactExports.useState(null);
  const [rejectReason, setRejectReason] = reactExports.useState("");
  const filtered = filter === "all" ? feedbackList : feedbackList.filter((f) => f.status === filter);
  const counts = {
    all: feedbackList.length,
    pending: feedbackList.filter((f) => f.status === "pending").length,
    approved: feedbackList.filter((f) => f.status === "approved").length,
    rejected: feedbackList.filter((f) => f.status === "rejected").length
  };
  const filterChips = [
    {
      key: "all",
      label: `All (${counts.all})`,
      cls: "bg-secondary text-foreground border-border"
    },
    {
      key: "pending",
      label: `Pending (${counts.pending})`,
      cls: "bg-amber-50 text-amber-700 border-amber-200"
    },
    {
      key: "approved",
      label: `Approved (${counts.approved})`,
      cls: "bg-green-50 text-green-700 border-green-200"
    },
    {
      key: "rejected",
      label: `Rejected (${counts.rejected})`,
      cls: "bg-red-50 text-red-700 border-red-200"
    }
  ];
  function handleApprove(feedbackId) {
    approveFeedback(feedbackId, (currentUser == null ? void 0 : currentUser.name) ?? "Admin");
    ue.success("✅ Approved — 10 💎 awarded");
  }
  function handleConfirmReject(feedbackId) {
    rejectFeedback(feedbackId, rejectReason.trim() || "No reason provided");
    ue.error("❌ Feedback rejected");
    setRejectingId(null);
    setRejectReason("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex gap-2 flex-wrap",
        "data-ocid": "admin.feedback.filter.bar",
        children: filterChips.map((chip) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": `admin.feedback.filter.${chip.key}`,
            onClick: () => setFilter(chip.key),
            className: `text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === chip.key ? `${chip.cls} ring-2 ring-primary/30` : "bg-card text-muted-foreground border-border hover:border-primary/40"}`,
            children: chip.label
          },
          chip.key
        ))
      }
    ),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "admin.feedback.empty_state",
        className: "flex flex-col items-center gap-3 py-10 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 28, className: "text-muted-foreground/30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No feedback found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: filter === "all" ? "No users have submitted feedback yet." : `No ${filter} feedback at this time.` })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: filtered.map((entry) => {
      const typeInfo = FEEDBACK_TYPE_META[entry.type];
      const statusInfo = FEEDBACK_STATUS_META[entry.status];
      const isRejecting = rejectingId === entry.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Card,
        {
          "data-ocid": `admin.feedback.item.${entry.id}`,
          className: "shadow-card border-border",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start gap-2 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeInfo.color}`,
                    children: [
                      typeInfo.icon,
                      " ",
                      typeInfo.label
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.cls}`,
                    children: [
                      statusInfo.icon,
                      " ",
                      statusInfo.label
                    ]
                  }
                ),
                entry.rewardGiven && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200", children: "💎 +10 Rewarded" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: entry.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-0.5", children: entry.description }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                  "By",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground/80", children: entry.userName })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/50", children: "•" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: new Date(entry.submittedAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }
                ) })
              ] }),
              entry.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive mt-1", children: [
                "Reason: ",
                entry.rejectionReason
              ] })
            ] }) }),
            entry.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t border-border/60", children: isRejecting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "label",
                {
                  htmlFor: `reject-reason-${entry.id}`,
                  className: "text-xs font-semibold text-muted-foreground",
                  children: "Rejection reason (optional)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: `reject-reason-${entry.id}`,
                  placeholder: "Enter reason for rejection...",
                  value: rejectReason,
                  onChange: (e) => setRejectReason(e.target.value),
                  "data-ocid": `admin.feedback.reject_reason.${entry.id}`,
                  className: "h-8 text-sm"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "destructive",
                    onClick: () => handleConfirmReject(entry.id),
                    "data-ocid": `admin.feedback.confirm_reject.${entry.id}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 12, className: "mr-1" }),
                      " Confirm Reject"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    onClick: () => {
                      setRejectingId(null);
                      setRejectReason("");
                    },
                    children: "Cancel"
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  onClick: () => handleApprove(entry.id),
                  "data-ocid": `admin.feedback.approve.${entry.id}`,
                  className: "flex-1",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 12, className: "mr-1" }),
                    " Approve (+10 💎)"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: () => {
                    setRejectingId(entry.id);
                    setRejectReason("");
                  },
                  "data-ocid": `admin.feedback.reject.${entry.id}`,
                  className: "text-destructive hover:bg-destructive/10 hover:text-destructive border-border",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 12, className: "mr-1" }),
                    " Reject"
                  ]
                }
              )
            ] }) })
          ] })
        },
        entry.id
      );
    }) })
  ] });
}
function UsersManager() {
  const { users, addUser, updateUser, deleteUser } = useStore();
  const { currentUser, currentShop } = useAuth();
  const [showForm, setShowForm] = reactExports.useState(false);
  const [editUser, setEditUser] = reactExports.useState(null);
  const [uName, setUName] = reactExports.useState("");
  const [uUsername, setUUsername] = reactExports.useState("");
  const [uPassword, setUPassword] = reactExports.useState("");
  const [uRole, setURole] = reactExports.useState("staff");
  const openAdd = () => {
    setEditUser(null);
    setUName("");
    setUUsername("");
    setUPassword("");
    setURole("staff");
    setShowForm(true);
  };
  const openEdit = (u) => {
    setEditUser(u);
    setUName(u.name);
    setUUsername(u.username);
    setUPassword(u.password);
    setURole(u.role);
    setShowForm(true);
  };
  const handleSave = () => {
    if (!uName.trim() || !uUsername.trim() || !uPassword.trim()) {
      ue.error("All fields required");
      return;
    }
    const shopId = (currentShop == null ? void 0 : currentShop.id) ?? "";
    const data = {
      name: uName.trim(),
      username: uUsername.trim(),
      password: uPassword,
      role: uRole,
      shopId
    };
    if (editUser) {
      updateUser(editUser.id, data);
      ue.success("User updated");
    } else {
      addUser(data);
      ue.success("User added");
    }
    setShowForm(false);
  };
  const handleDelete = (u) => {
    if (u.id === (currentUser == null ? void 0 : currentUser.id)) {
      ue.error("You cannot delete your own account");
      return;
    }
    deleteUser(u.id);
    ue.success("User deleted");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        users.length,
        " users — ",
        currentShop == null ? void 0 : currentShop.name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { "data-ocid": "admin.users.add.button", size: "sm", onClick: openAdd, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
        " Add User"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "shadow-card border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: users.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "admin.users.empty_state",
        className: "text-center py-10 text-muted-foreground text-sm",
        children: "No users found."
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { className: "bg-secondary/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { className: "text-xs", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: users.map((u, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        TableRow,
        {
          "data-ocid": `admin.users.item.${idx + 1}`,
          className: u.id === (currentUser == null ? void 0 : currentUser.id) ? "bg-primary/5" : "",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { className: "text-sm font-medium text-foreground", children: [
              u.name,
              u.id === (currentUser == null ? void 0 : currentUser.id) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-xs text-primary", children: "(you)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { className: "text-sm", children: u.username }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                className: u.role === "owner" ? "bg-blue-100 text-blue-700 border-0 text-xs" : u.role === "manager" ? "bg-secondary text-muted-foreground border-0 text-xs" : "bg-secondary text-muted-foreground border-0 text-xs",
                children: u.role
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  "data-ocid": `admin.users.edit_button.${idx + 1}`,
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 w-7 p-0",
                  onClick: () => openEdit(u),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 12 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  "data-ocid": `admin.users.delete_button.${idx + 1}`,
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 w-7 p-0 text-destructive hover:bg-destructive/10",
                  disabled: u.id === (currentUser == null ? void 0 : currentUser.id),
                  onClick: () => handleDelete(u),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 })
                }
              )
            ] }) })
          ]
        },
        u.id
      )) })
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showForm, onOpenChange: setShowForm, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { "data-ocid": "admin.users.form.dialog", className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editUser ? "Edit User" : "Add User" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Full Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              "data-ocid": "admin.users.name.input",
              value: uName,
              onChange: (e) => setUName(e.target.value),
              placeholder: "Full name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Username *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "admin.users.username.input",
                value: uUsername,
                onChange: (e) => setUUsername(e.target.value),
                placeholder: "username"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Password *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "admin.users.password.input",
                type: "password",
                value: uPassword,
                onChange: (e) => setUPassword(e.target.value),
                placeholder: "password"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Role *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: uRole,
              onValueChange: (v) => setURole(v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "admin.users.role.select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "owner", children: "Owner" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "manager", children: "Manager" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "staff", children: "Staff" })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 px-4 py-3 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            "data-ocid": "admin.users.form.cancel_button",
            onClick: () => setShowForm(false),
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            "data-ocid": "admin.users.form.save_button",
            onClick: handleSave,
            children: editUser ? "Update" : "Add"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  AdminPage
};
