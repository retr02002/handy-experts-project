/** Which document types apply to which owner, and how they're labelled — shared by every KYC list UI (editable and read-only) so they never drift apart. */
export const TECHNICIAN_KYC_FIELDS = [
  { type: "PHOTO", label: "Profile Photo", icon: "ph:user-focus", helperText: "Max 8MB · JPG, PNG or WEBP" },
  { type: "AADHAR", label: "Aadhaar Card", icon: "ph:identification-card", helperText: "Max 8MB · JPG, PNG or PDF" },
  { type: "PAN", label: "PAN Card", icon: "ph:identification-badge", helperText: "Max 8MB · JPG, PNG or PDF" },
  // captureMode "draw" is the switch TechnicianDocumentsTab uses to open the
  // signature pad instead of a file picker for this one row.
  { type: "SIGNATURE", label: "Signature", icon: "ph:signature", helperText: "Draw with your finger — used on your ID card", captureMode: "draw" as const },
] as const;

export const VENDOR_KYC_FIELDS = [
  { type: "GST", label: "GST Certificate", icon: "ph:receipt", helperText: "Max 8MB · JPG, PNG or PDF" },
  { type: "AADHAR", label: "Aadhaar Card", icon: "ph:identification-card", helperText: "Max 8MB · JPG, PNG or PDF" },
  { type: "PAN", label: "PAN Card", icon: "ph:identification-badge", helperText: "Max 8MB · JPG, PNG or PDF" },
] as const;
