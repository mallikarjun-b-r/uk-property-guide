import { useState, useMemo } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ParameterPanel } from '@/components/buy-vs-rent/parameter-panel';
import { ResultsPanel } from '@/components/buy-vs-rent/results-panel';
import { runDashboard } from '@/lib/calculators/dashboard';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  DEFAULT_PARAMS,
  DEFAULT_SCENARIO_TOGGLES,
  DEFAULT_SELL_AND_REBUY_PARAMS,
  DEFAULT_KEEP_AND_RENT_OUT_PARAMS,
} from '@/types/buy-vs-rent';
import type {
  BuyVsRentParams,
  ScenarioToggles,
  SellAndRebuyParams,
  KeepAndRentOutParams,
} from '@/types/buy-vs-rent';

export default function App() {
  const [params, setParams] = useState<BuyVsRentParams>(DEFAULT_PARAMS);
  const [toggles, setToggles] = useState<ScenarioToggles>(DEFAULT_SCENARIO_TOGGLES);
  const [sellAndRebuyParams, setSellAndRebuyParams] = useState<SellAndRebuyParams>(DEFAULT_SELL_AND_REBUY_PARAMS);
  const [keepAndRentOutParams, setKeepAndRentOutParams] = useState<KeepAndRentOutParams>(DEFAULT_KEEP_AND_RENT_OUT_PARAMS);

  const debouncedParams = useDebouncedValue(params, 100);
  const debouncedToggles = useDebouncedValue(toggles, 100);
  const debouncedSellParams = useDebouncedValue(sellAndRebuyParams, 100);
  const debouncedKeepParams = useDebouncedValue(keepAndRentOutParams, 100);

  // Auto-clamp sell/switch year when simulation years change
  const clampedSellParams = useMemo(() => {
    const maxYear = debouncedParams.simulationYears - 1;
    if (debouncedSellParams.sellAfterYear > maxYear) {
      return { ...debouncedSellParams, sellAfterYear: Math.max(1, maxYear) };
    }
    return debouncedSellParams;
  }, [debouncedParams.simulationYears, debouncedSellParams]);

  const clampedKeepParams = useMemo(() => {
    const maxYear = debouncedParams.simulationYears - 1;
    if (debouncedKeepParams.switchYear > maxYear) {
      return { ...debouncedKeepParams, switchYear: Math.max(1, maxYear) };
    }
    return debouncedKeepParams;
  }, [debouncedParams.simulationYears, debouncedKeepParams]);

  const dashboardResult = useMemo(
    () => runDashboard(debouncedParams, debouncedToggles, clampedSellParams, clampedKeepParams),
    [debouncedParams, debouncedToggles, clampedSellParams, clampedKeepParams]
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b px-6 py-4">
          <h1 className="text-xl font-bold">UK Property Guide</h1>
          <p className="text-sm text-muted-foreground">Buy vs Rent Comparison Dashboard</p>
        </header>

        <main className="p-4 md:p-6 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            <aside className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <ParameterPanel
                params={params}
                onChange={setParams}
                toggles={toggles}
                onTogglesChange={setToggles}
                sellAndRebuyParams={sellAndRebuyParams}
                onSellAndRebuyChange={setSellAndRebuyParams}
                keepAndRentOutParams={keepAndRentOutParams}
                onKeepAndRentOutChange={setKeepAndRentOutParams}
              />
            </aside>
            <section>
              <ResultsPanel result={dashboardResult} />
            </section>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
