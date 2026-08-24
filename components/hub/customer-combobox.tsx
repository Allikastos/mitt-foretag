"use client";

import {
  useDeferredValue,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  filterCustomerOptions,
  mergeCustomerOptions,
  normalizeCustomerSearch,
  type CustomerSearchOption,
} from "@/src/lib/hub/customer-search";
import { inputClassName } from "./ui";

type CustomerComboboxProps = {
  label: string;
  customers: CustomerSearchOption[];
  defaultValue?: string;
  disabled?: boolean;
  emptyLabel: string;
  name?: string;
  placeholder?: string;
};

export function CustomerCombobox({
  label,
  customers,
  defaultValue = "",
  disabled = false,
  emptyLabel,
  name = "customer_id",
  placeholder = "Sök efter kund",
}: CustomerComboboxProps) {
  const inputId = useId();
  const listboxId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const initialCustomer = customers.find((customer) => customer.id === defaultValue);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSearchOption | null>(initialCustomer ?? null);
  const [selectedId, setSelectedId] = useState(defaultValue);
  const [query, setQuery] = useState(initialCustomer?.company_name ?? "");
  const [options, setOptions] = useState(() =>
    filterCustomerOptions(customers, ""),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasResolvedDefault, setHasResolvedDefault] = useState(
    Boolean(!defaultValue || initialCustomer),
  );
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const normalizedQuery = normalizeCustomerSearch(deferredQuery);
    const needsSelectedCustomer = Boolean(defaultValue && !hasResolvedDefault);

    if (normalizedQuery.length < 2 && !needsSelectedCustomer) {
      setOptions(filterCustomerOptions(customers, normalizedQuery));
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const searchParams = new URLSearchParams();
        if (normalizedQuery.length >= 2) searchParams.set("q", normalizedQuery);
        if (needsSelectedCustomer && normalizedQuery.length < 2) {
          searchParams.set("selected_id", defaultValue);
        }

        const response = await fetch(
          `/api/hub/customers/search?${searchParams.toString()}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Customer search failed");

        const result = (await response.json()) as {
          customers?: CustomerSearchOption[];
        };
        const remoteCustomers = result.customers ?? [];

        if (needsSelectedCustomer && normalizedQuery.length < 2) {
          const loadedCustomer = remoteCustomers.find(
            (customer) => customer.id === defaultValue,
          );
          if (loadedCustomer) {
            setSelectedCustomer(loadedCustomer);
            setQuery(loadedCustomer.company_name);
          }
          setHasResolvedDefault(true);
        } else {
          setOptions(
            mergeCustomerOptions(
              remoteCustomers,
              filterCustomerOptions(customers, normalizedQuery),
            ),
          );
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setOptions(filterCustomerOptions(customers, normalizedQuery));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [customers, defaultValue, deferredQuery, hasResolvedDefault]);

  function selectCustomer(customer: CustomerSearchOption | null) {
    setSelectedCustomer(customer);
    setSelectedId(customer?.id ?? "");
    setQuery(customer?.company_name ?? "");
    setIsOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        return Math.max(-1, Math.min(options.length - 1, current + direction));
      });
      return;
    }

    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      selectCustomer(activeIndex === -1 ? null : options[activeIndex]);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative block"
      onBlur={(event) => {
        if (!wrapperRef.current?.contains(event.relatedTarget)) setIsOpen(false);
      }}
    >
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-medium text-[var(--hub-text)]"
      >
        {label}
      </label>
      <input type="hidden" name={name} value={selectedId} disabled={disabled} />
      <div className="relative">
        <input
          id={inputId}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-activedescendant={
            isOpen
              ? activeIndex === -1
                ? `${listboxId}-empty`
                : options[activeIndex]
                  ? `${listboxId}-${options[activeIndex].id}`
                  : undefined
              : undefined
          }
          autoComplete="off"
          className={`${inputClassName} pr-24`}
          disabled={disabled}
          placeholder={
            defaultValue && !selectedCustomer ? "Laddar vald kund..." : placeholder
          }
          value={query}
          onFocus={() => {
            setIsOpen(true);
            setActiveIndex(
              selectedId
                ? options.findIndex((option) => option.id === selectedId)
                : -1,
            );
          }}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setIsOpen(true);
            setActiveIndex(-1);
            if (selectedCustomer?.company_name !== nextQuery) {
              setSelectedCustomer(null);
              setSelectedId("");
            }
            setOptions(filterCustomerOptions(customers, nextQuery));
          }}
          onKeyDown={handleKeyDown}
        />
        {query && !disabled ? (
          <button
            type="button"
            className="absolute inset-y-1 right-2 rounded-xl px-3 text-xs font-medium text-[var(--hub-muted)] hover:bg-[var(--hub-card-soft)] hover:text-[var(--hub-text)]"
            onClick={() => selectCustomer(null)}
          >
            Rensa
          </button>
        ) : null}
      </div>
      {isOpen && !disabled ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={`${label}, sökresultat`}
          className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-black/10 bg-[var(--hub-card)] p-2 shadow-[0_22px_48px_-24px_rgba(0,0,0,0.34)]"
        >
          <button
            id={`${listboxId}-empty`}
            type="button"
            role="option"
            aria-selected={!selectedId}
            className={`flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-[var(--hub-muted)] ${
              activeIndex === -1
                ? "bg-[var(--hub-card-soft)]"
                : "hover:bg-[var(--hub-card-soft)]"
            }`}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActiveIndex(-1)}
            onClick={() => selectCustomer(null)}
          >
            {emptyLabel}
          </button>
          {options.map((customer, index) => (
            <button
              id={`${listboxId}-${customer.id}`}
              key={customer.id}
              type="button"
              role="option"
              aria-selected={selectedId === customer.id}
              className={`flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm text-[var(--hub-text)] ${
                activeIndex === index
                  ? "bg-[var(--hub-card-soft)]"
                  : "hover:bg-[var(--hub-card-soft)]"
              }`}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectCustomer(customer)}
            >
              {customer.company_name}
            </button>
          ))}
          {isLoading ? (
            <p className="px-3 py-3 text-sm text-[var(--hub-muted)]">Söker...</p>
          ) : null}
          {!isLoading && options.length === 0 ? (
            <p className="px-3 py-3 text-sm text-[var(--hub-muted)]">
              Ingen kund hittades.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
