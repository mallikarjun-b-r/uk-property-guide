export interface BuyVsRentParams {
  propertyPrice: number;
  depositPercent: number;
  mortgageRate: number;
  mortgageTerm: number;
  monthlyRent: number;
  annualRentIncrease: number;
  annualPropertyGrowth: number;
  annualMaintenancePercent: number;
  investmentReturnRate: number;
  simulationYears: number;
  isFirstTimeBuyer: boolean;
}

export interface YearlyBreakdown {
  year: number;
  // Buying
  propertyValue: number;
  mortgageBalance: number;
  equity: number;
  mortgagePaymentYearly: number;
  maintenanceCost: number;
  buyingCostCumulative: number;
  // Renting
  monthlyRentThisYear: number;
  rentCostYearly: number;
  rentCostCumulative: number;
  investmentPot: number;
  // Comparison
  buyNetWealth: number;
  rentNetWealth: number;
  netDifference: number;
}

export interface SimulationResult {
  params: BuyVsRentParams;
  stampDuty: number;
  totalUpfrontCosts: number;
  monthlyMortgagePayment: number;
  yearlyBreakdown: YearlyBreakdown[];
  verdict: 'buy' | 'rent';
  netDifference: number;
}

// --- Multi-Scenario Types ---

export interface ScenarioToggles {
  sellAndRebuy: boolean;
  keepAndRentOut: boolean;
}

export const SCENARIO_COLORS = {
  rent: '#3b82f6',
  buyAndHold: '#10b981',
  sellAndRebuy: '#f59e0b',
  keepAndRentOut: '#8b5cf6',
} as const;

export const SCENARIO_LABELS = {
  rent: 'Just Rent',
  buyAndHold: 'Buy & Hold',
  sellAndRebuy: 'Sell & Rebuy',
  keepAndRentOut: 'Keep & Rent Out',
} as const;

export interface SellAndRebuyParams {
  sellAfterYear: number;
  newPropertyPrice: number;
  sellingCostsPercent: number;
  newDepositPercent: number;
  newMortgageRate: number;
  newMortgageTerm: number;
}

export interface KeepAndRentOutParams {
  switchYear: number;
  monthlyRentalIncome: number;
  annualRentalIncrease: number;
  lettingAgentFeePercent: number;
  voidWeeksPerYear: number;
  landlordInsurance: number;
  propertyBPrice: number;
  propertyBDepositPercent: number;
  propertyBMortgageRate: number;
  propertyBMortgageTerm: number;
}

export interface SellAndRebuyYearlyData {
  year: number;
  netWealth: number;
  propertyValue: number;
  mortgageBalance: number;
  equity: number;
  cashReserve: number;
  phase: 'hold-a' | 'sold-buying-b' | 'hold-b';
}

export interface KeepAndRentOutYearlyData {
  year: number;
  netWealth: number;
  propertyAValue: number;
  propertyAMortgageBalance: number;
  propertyAEquity: number;
  propertyBValue: number;
  propertyBMortgageBalance: number;
  propertyBEquity: number;
  rentalIncome: number;
  cashPosition: number;
  phase: 'live-in-a' | 'two-properties';
}

export interface MultiScenarioYearlyData {
  year: number;
  rentNetWealth: number;
  buyAndHoldNetWealth: number;
  sellAndRebuyNetWealth?: number;
  keepAndRentOutNetWealth?: number;
  rentCostCumulative: number;
  buyAndHoldCostCumulative: number;
  sellAndRebuyCostCumulative?: number;
  keepAndRentOutCostCumulative?: number;
}

export interface ScenarioRanking {
  key: string;
  label: string;
  netWealth: number;
  color: string;
}

export interface DashboardResult {
  baseResult: SimulationResult;
  sellAndRebuyData?: SellAndRebuyYearlyData[];
  keepAndRentOutData?: KeepAndRentOutYearlyData[];
  multiScenarioData: MultiScenarioYearlyData[];
  rankings: ScenarioRanking[];
  toggles: ScenarioToggles;
  sellAfterYear?: number;
  switchYear?: number;
}

export const DEFAULT_PARAMS: BuyVsRentParams = {
  propertyPrice: 250000,
  depositPercent: 10,
  mortgageRate: 4.5,
  mortgageTerm: 25,
  monthlyRent: 1200,
  annualRentIncrease: 3,
  annualPropertyGrowth: 4,
  annualMaintenancePercent: 1,
  investmentReturnRate: 6,
  simulationYears: 15,
  isFirstTimeBuyer: false,
};

export const DEFAULT_SCENARIO_TOGGLES: ScenarioToggles = {
  sellAndRebuy: false,
  keepAndRentOut: false,
};

export const DEFAULT_SELL_AND_REBUY_PARAMS: SellAndRebuyParams = {
  sellAfterYear: 5,
  newPropertyPrice: 350000,
  sellingCostsPercent: 2.5,
  newDepositPercent: 15,
  newMortgageRate: 4.5,
  newMortgageTerm: 25,
};

export const DEFAULT_KEEP_AND_RENT_OUT_PARAMS: KeepAndRentOutParams = {
  switchYear: 5,
  monthlyRentalIncome: 1100,
  annualRentalIncrease: 3,
  lettingAgentFeePercent: 10,
  voidWeeksPerYear: 4,
  landlordInsurance: 200,
  propertyBPrice: 350000,
  propertyBDepositPercent: 15,
  propertyBMortgageRate: 4.5,
  propertyBMortgageTerm: 25,
};
