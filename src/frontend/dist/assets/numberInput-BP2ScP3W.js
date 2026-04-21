function clearLeadingZeros(value) {
  if (value === "" || value === "0" || value.startsWith("0.")) return value;
  return value.replace(/^0+/, "") || "0";
}
export {
  clearLeadingZeros as c
};
