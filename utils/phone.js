export const normalizeIndianPhone = (value) => {
    if (typeof value !== "string") return null;
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
    if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
    return /^[6-9]\d{9}$/.test(digits) ? digits : null;
};
