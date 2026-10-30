//Gemensam validering av input innan något når databasen (se SECURITY.md).

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Endast avatarer som finns i public/avatars får sparas.
// Håll i synk med AVATARS i src/lib/avatars.ts
const AVATAR_NAMES = new Set([
  "time-singularity",
  "avatar-retro-computer",
  "avatar-fountain-pen",
  "avatar-hourglass",
  "avatar-earth-sunrise",
  "avatar-coffee",
  "avatar-books",
  "avatar-sticky-note",
  "avatar-plant",
  "avatar-camera",
  "avatar-compass",
  "avatar-laptop",
  "avatar-desk-lamp",
  "avatar-rocket-launch",
  "avatar-ringed-planet",
  "avatar-sunset-clouds",
  "avatar-gears",
  "avatar-robot",
  "avatar-brain",
  "avatar-floating-city",
  "avatar-purple-planet",
  "avatar-robot-hand",
  "avatar-dreamer",
  "avatar-crystal",
  "avatar-orbital-station",
  "avatar-astronaut-helmet",
  "avatar-starship",
  "avatar-event-horizon",
  "avatar-earth-night",
  "avatar-portal",
  "avatar-happy-bot",
  "avatar-space-lounge",
  "avatar-spiral-galaxy",
]);

export const MAX_HOURS_PER_ENTRY = 24;
export const MAX_DESCRIPTION_LENGTH = 150;
export const MAX_MILEAGE = 5000;
export const MAX_EXPENSE = 100000;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72; // bcrypt använder bara de första 72 byten
export const ALLOWED_ROLES = ["developer", "sales"];



//##############################################################################



export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

// Tabeller med serial-id (t.ex. timesheets) skickar id som tal från pg
export function isSerialId(value: unknown): value is number | string {
  const id = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0 && id <= 2147483647;
}

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_REGEX.test(value);
}

export function isAvatarName(value: unknown): value is string {
  return typeof value === "string" && AVATAR_NAMES.has(value);
}

export function isValidPassword(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= MIN_PASSWORD_LENGTH &&
    value.length <= MAX_PASSWORD_LENGTH
  );
}

// Dagens datum i svensk tid, samma tidszon som resten av appen
function todayInStockholm() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
}

// Ett riktigt datum på formatet YYYY-MM-DD (godkänner även ISO-tidsstämplar)
export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const datePart = value.slice(0, 10);
  if (!DATE_REGEX.test(datePart)) return false;
  const date = new Date(`${datePart}T00:00:00Z`);
  return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === datePart;
}

// Entries får inte loggas på framtida datum
export function isValidWorkDate(value: unknown): value is string {
  return isValidDate(value) && value.slice(0, 10) <= todayInStockholm();
}

// Returnerar talet om det ligger inom gränserna, annars null. Godkänner decimalkomma.
export function parseNumberInRange(value: unknown, min: number, max: number) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const number = Number(String(value).trim().replace(",", "."));
  if (String(value).trim() === "" || isNaN(number) || number < min || number > max) {
    return null;
  }
  return number;
}

// Valfria fält (mileage/expense): tomt är ok, annars måste värdet vara inom gränserna
export function isOptionalNumberInRange(value: unknown, max: number) {
  if (value === undefined || value === null || value === "") return true;
  return parseNumberInRange(value, 0, max) !== null;
}

export function isValidDescription(value: unknown) {
  if (value === undefined || value === null) return true;
  return typeof value === "string" && value.length <= MAX_DESCRIPTION_LENGTH;
}



//##############################################################################



// Validerar en time entry, returnerar ett felmeddelande eller null om allt är ok
export function validateEntry(entry: {
  companyId: unknown;
  date: unknown;
  hours: unknown;
  description: unknown;
  mileage?: unknown;
  expense?: unknown;
}) {
  if (!isUuid(entry.companyId)) return "Invalid company";
  if (!isValidWorkDate(entry.date)) return "Invalid date";
  if (parseNumberInRange(entry.hours, 0.01, MAX_HOURS_PER_ENTRY) === null) {
    return `Hours must be between 0 and ${MAX_HOURS_PER_ENTRY}`;
  }
  if (!isValidDescription(entry.description)) {
    return `Description can't exceed ${MAX_DESCRIPTION_LENGTH} characters`;
  }
  if (!isOptionalNumberInRange(entry.mileage, MAX_MILEAGE)) return "Invalid mileage";
  if (!isOptionalNumberInRange(entry.expense, MAX_EXPENSE)) return "Invalid expense";
  return null;
}
