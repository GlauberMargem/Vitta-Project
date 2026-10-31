"use client";

import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function HelpPopover({ children }: { children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ajuda"
          className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-sm text-foreground">
        {children}
      </PopoverContent>
    </Popover>
  );
}
