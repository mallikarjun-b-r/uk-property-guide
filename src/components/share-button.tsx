import { useState, useCallback } from 'react';
import { Link, Check } from 'lucide-react';
import { encodeStateToUrl } from '@/lib/utils/url-params';
import type {
  BuyVsRentParams,
  ScenarioToggles,
  SellAndRebuyParams,
  KeepAndRentOutParams,
} from '@/types/buy-vs-rent';

interface ShareButtonProps {
  params: BuyVsRentParams;
  toggles: ScenarioToggles;
  sellParams: SellAndRebuyParams;
  keepParams: KeepAndRentOutParams;
}

export function ShareButton({ params, toggles, sellParams, keepParams }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    const url = encodeStateToUrl(params, toggles, sellParams, keepParams);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [params, toggles, sellParams, keepParams]);

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Link className="h-4 w-4" />
          Share
        </>
      )}
    </button>
  );
}
