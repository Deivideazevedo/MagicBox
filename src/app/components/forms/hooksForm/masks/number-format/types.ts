/**
 * Unidades de medida válidas suportadas pelo Intl.NumberFormat
 * Apenas unidades testadas e compatíveis com navegadores modernos
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#unit
 * @see https://tc39.es/ecma402/#table-sanctioned-simple-unit-identifiers
 */
export type UnitIdentifier =
  // Acceleration
  | "g-force" | "meter-per-square-second"
  // Angle
  | "degree" | "arc-minute" | "arc-second" | "radian" | "revolution"
  // Area
  | "acre" | "hectare" 
  | "square-centimeter" | "square-foot" | "square-inch" 
  | "square-kilometer" | "square-meter" | "square-mile" | "square-yard"
  // Concentration
  | "percent" | "permille"
  // Digital
  | "bit" | "byte" 
  | "kilobit" | "kilobyte" 
  | "megabit" | "megabyte" 
  | "gigabit" | "gigabyte" 
  | "terabit" | "terabyte" 
  | "petabyte"
  // Duration
  | "millisecond" | "second" | "minute" | "hour" 
  | "day" | "week" | "month" | "year"
  // Energy
  | "calorie" | "foodcalorie" | "joule" | "kilocalorie" 
  | "kilojoule" | "kilowatt-hour"
  // Length
  | "centimeter" | "decimeter" | "meter" | "kilometer" 
  | "millimeter" | "micrometer" | "nanometer" | "picometer"
  | "foot" | "inch" | "mile" | "yard"
  | "mile-scandinavian" | "nautical-mile"
  // Mass
  | "gram" | "kilogram" | "milligram" | "microgram" | "metric-ton"
  | "ounce" | "ounce-troy" | "pound" | "stone" | "ton" | "carat"
  // Power
  | "watt" | "milliwatt" | "kilowatt" | "megawatt" | "gigawatt" | "horsepower"
  // Pressure
  | "hectopascal" | "millimeter-of-mercury" | "pound-per-square-inch" 
  | "inch-ofhg" | "millibar"
  // Speed
  | "meter-per-second" | "kilometer-per-hour" | "mile-per-hour" | "knot"
  // Temperature
  | "celsius" | "fahrenheit" | "kelvin"
  // Volume
  | "liter" | "milliliter" | "centiliter" | "deciliter" | "hectoliter" | "megaliter"
  | "cubic-centimeter" | "cubic-meter" | "cubic-kilometer"
  | "cubic-foot" | "cubic-inch" | "cubic-yard" | "cubic-mile"
  | "fluid-ounce" | "fluid-ounce-imperial"
  | "gallon" | "gallon-imperial"
  | "pint" | "pint-metric"
  | "quart" | "cup" | "cup-metric"
  | "tablespoon" | "teaspoon"
  // Consumption
  | "liter-per-100-kilometer" | "liter-per-kilometer" 
  | "mile-per-gallon" | "mile-per-gallon-imperial";

/**
 * Propriedades aceitas pelo useNumberFormat do @react-input/number-format
 * Baseado na documentação oficial e API Intl.NumberFormat
 * @see https://www.npmjs.com/package/@react-input/number-format
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
 */
export type NumberFormatOptions = {
  /** 
   * Localização para formatação 
   * @example "pt-BR", "en-US", "de-DE", ["ban", "id"]
   */
  locales?: string | string[];
  
  /** 
   * Tipo de formatação numérica 
   * @default "decimal"
   */
  format?: "currency" | "decimal" | "percent" | "unit";
  
  /** 
   * Código ISO 4217 da moeda (requer format: "currency") 
   * @example "BRL", "USD", "EUR", "JPY"
   */
  currency?: string;
  
  /** 
   * Como exibir a moeda 
   * - symbol: Símbolo localizado (ex: R$, US$)
   * - narrowSymbol: Símbolo curto (ex: $)
   * - code: Código ISO (ex: BRL)
   * - name: Nome por extenso (ex: reais brasileiros)
   * @default "symbol"
   */
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  
  /** 
   * Unidade de medida válida conforme UTS #35 (requer format: "unit")
   * @example "kilometer", "meter-per-second", "celsius"
   * @see https://unicode.org/reports/tr35/tr35-general.html#Unit_Elements
   */
  unit?: UnitIdentifier;
  
  /** 
   * Como exibir a unidade 
   * - short: Forma abreviada (ex: 5 km)
   * - long: Forma por extenso (ex: 5 quilômetros)
   * - narrow: Forma mais curta possível (ex: 5km)
   * @default "short"
   */
  unitDisplay?: "short" | "long" | "narrow";
  
  /** 
   * Quando exibir o sinal (+/-)
   * - auto: Apenas para números negativos
   * - always: Sempre (+ e -)
   * - exceptZero: Sempre exceto para zero
   * - negative: Apenas para números negativos
   * - never: Nunca mostrar sinal
   * @default "auto"
   */
  signDisplay?: "auto" | "always" | "exceptZero" | "negative" | "never";
  
  /** 
   * Controla o agrupamento de dígitos (separador de milhares)
   * - true/"always": Sempre usar agrupamento
   * - false: Nunca usar agrupamento
   * - "auto": Usar conforme locale (padrão)
   * - "min2": Apenas para 10.000 ou mais
   * @default "auto"
   */
  groupDisplay?: boolean | "always" | "auto" | "min2";
  
  /** 
   * Número mínimo de dígitos inteiros (preenche com zeros à esquerda)
   * @default 1
   * @example minimumIntegerDigits: 3 → 5 becomes "005"
   */
  minimumIntegerDigits?: number;
  
  /** 
   * Número máximo de dígitos inteiros
   * @example maximumIntegerDigits: 3 → 12345 becomes "345"
   */
  maximumIntegerDigits?: number;
  
  /** 
   * Número mínimo de casas decimais
   * - Para decimal/percent: padrão 0
   * - Para currency: conforme ISO 4217 (geralmente 2)
   * @example minimumFractionDigits: 2 → 10 becomes "10,00"
   */
  minimumFractionDigits?: number;
  
  /** 
   * Número máximo de casas decimais
   * - Para decimal: Math.max(minimumFractionDigits, 3)
   * - Para currency: conforme ISO 4217 (geralmente 2)
   * - Para percent: Math.max(minimumFractionDigits, 0)
   * @example maximumFractionDigits: 2 → 10.12345 becomes "10,12"
   */
  maximumFractionDigits?: number;
};
