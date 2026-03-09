// Mekke & Medine weather data
// Uses static monthly averages for reliable display

export interface CityWeather {
  city: string;
  cityTr: string;
  monthlyTemps: number[]; // Jan-Dec average highs in °C
  currentMonth: number;
}

// Average high temperatures (°C) by month: Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
const MEKKE_TEMPS = [30, 31, 34, 38, 42, 44, 43, 43, 42, 39, 34, 31];
const MEDINE_TEMPS = [22, 25, 29, 34, 39, 42, 42, 42, 40, 35, 28, 24];

const MONTH_LABELS = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

export function getMonthLabels(): string[] {
  return MONTH_LABELS;
}

export function getMekkeWeather(): CityWeather {
  return {
    city: "Mecca",
    cityTr: "Mekke",
    monthlyTemps: MEKKE_TEMPS,
    currentMonth: new Date().getMonth(),
  };
}

export function getMedineWeather(): CityWeather {
  return {
    city: "Medina",
    cityTr: "Medine",
    monthlyTemps: MEDINE_TEMPS,
    currentMonth: new Date().getMonth(),
  };
}

export function getCurrentTemp(temps: number[]): number {
  return temps[new Date().getMonth()];
}
