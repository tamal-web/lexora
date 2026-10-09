"use client"

import { useMemo, useState, useRef, useEffect, type ReactNode } from "react"
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

/* ============================================================================
 * 1. Column type machinery
 * ==========================================================================*/

/** Detects a string literal union (e.g. "a" | "b") as opposed to plain `string`. */
type IsStringLiteralUnion<V> = V extends string
  ? string extends V
  ? false
  : true
  : false

/** The full set of "kinds" a column can be. Declared standalone — do NOT derive
 * this from Column<any>["type"], since instantiating a distributive conditional
 * type with `any` can silently drop union members. */
export type ColumnType = "string" | "number" | "boolean" | "union" | "date"

interface BaseColumn<T, K extends keyof T> {
  key: K
  header: string
  /** Optional custom cell renderer. `value` is T[K] (including | undefined if present). */
  render?: (value: T[K], row: T) => ReactNode
}

export interface StringColumn<T, K extends keyof T> extends BaseColumn<T, K> {
  type: "string"
  sortable?: boolean
  filterable?: boolean // free-text "contains" filter
}

export interface NumberColumn<T, K extends keyof T> extends BaseColumn<T, K> {
  type: "number"
  sortable?: boolean
  filterable?: boolean // min/max range filter
}

export interface BooleanColumn<T, K extends keyof T> extends BaseColumn<T, K> {
  type: "boolean"
  sortable?: boolean
  filterable?: boolean // true/false/either
}

export interface UnionColumn<T, K extends keyof T> extends BaseColumn<T, K> {
  type: "union"
  /** Must be supplied explicitly — TS erases literal unions at runtime. */
  options: readonly T[K][]
  /** Optional display label per raw value, e.g. { PATENT_UTILITY: "Utility Patent" }.
   * Falls back to the raw value if a label isn't found. */
  labels?: Partial<Record<string, string>>
  sortable?: boolean
  filterable?: boolean // multi-select over `options`
}

export interface DateColumn<T, K extends keyof T> extends BaseColumn<T, K> {
  type: "date"
  sortable?: boolean
  filterable?: boolean // before/after range filter
}

/** Picks the correct column config shape based on T[K] (ignoring | undefined). */
export type ColumnConfigFor<T, K extends keyof T> =
  NonNullable<T[K]> extends Date
  ? DateColumn<T, K>
  : NonNullable<T[K]> extends boolean
  ? BooleanColumn<T, K>
  : NonNullable<T[K]> extends number
  ? NumberColumn<T, K>
  : IsStringLiteralUnion<NonNullable<T[K]>> extends true
  ? UnionColumn<T, K>
  : NonNullable<T[K]> extends string
  ? StringColumn<T, K>
  : never

/** The correlated union of every possible column for T. Array order = display order,
 * index 0 leftmost. */
export type Column<T> = {
  [K in keyof T]: ColumnConfigFor<T, K>
}[keyof T]

/** Small helper for building `options` + `labels` from an { id, title }[] list
 * (e.g. your typesList / statusList / priorityList shape) without writing both by hand. */
export function fromIdTitleList<
  const L extends readonly { id: string; title: string }[],
>(list: L): { options: L[number]["id"][]; labels: Record<string, string> } {
  return {
    options: list.map((i) => i.id),
    labels: Object.fromEntries(list.map((i) => [i.id, i.title])),
  }
}

/** Plain-value label lookup — deliberately NOT typed as Column<any> (see note above). */
function displayLabel(
  value: unknown,
  labels?: Partial<Record<string, string>>
): string {
  return labels?.[String(value)] ?? String(value)
}

/* ============================================================================
 * 2. Sorting
 * ==========================================================================*/

export type SortDirection = "asc" | "desc"

export interface SortState<T> {
  key: keyof T
  direction: SortDirection
}

function compareByType(a: unknown, b: unknown, type: ColumnType): number {
  switch (type) {
    case "number":
      return (a as number) - (b as number)
    case "boolean":
      return Number(a as boolean) - Number(b as boolean)
    case "date":
      return (a as Date).getTime() - (b as Date).getTime()
    case "string":
    case "union":
      return String(a).localeCompare(String(b))
  }
}

function sortData<T>(
  data: T[],
  sort: SortState<T> | null,
  columns: Column<T>[]
): T[] {
  if (!sort) return data
  const col = columns.find((c) => c.key === sort.key)
  if (!col) return data

  return [...data].sort((rowA, rowB) => {
    const result = compareByType(rowA[sort.key], rowB[sort.key], col.type)
    return sort.direction === "asc" ? result : -result
  })
}

/* ============================================================================
 * 3. Filtering
 * ==========================================================================*/

export type FilterValueFor<T, K extends keyof T> =
  NonNullable<T[K]> extends Date
  ? { before?: Date; after?: Date }
  : NonNullable<T[K]> extends boolean
  ? boolean
  : NonNullable<T[K]> extends number
  ? { min?: number; max?: number }
  : IsStringLiteralUnion<NonNullable<T[K]>> extends true
  ? NonNullable<T[K]>[]
  : NonNullable<T[K]> extends string
  ? string
  : never

export type FilterState<T> = {
  [K in keyof T]?: FilterValueFor<T, K>
}

function applyFilters<T>(
  data: T[],
  filters: FilterState<T>,
  columns: Column<T>[]
): T[] {
  return data.filter((row) =>
    columns.every((col) => {
      const filterValue = (filters as Record<string, unknown>)[
        col.key as string
      ]
      if (filterValue === undefined) return true

      const cellValue = row[col.key]

      switch (col.type) {
        case "string":
          if (cellValue === undefined) return false
          return String(cellValue)
            .toLowerCase()
            .includes(String(filterValue).toLowerCase())

        case "number": {
          if (cellValue === undefined) return false
          const { min, max } = filterValue as { min?: number; max?: number }
          const n = cellValue as number
          return (
            (min === undefined || n >= min) && (max === undefined || n <= max)
          )
        }

        case "boolean":
          return cellValue === filterValue

        case "union":
          return (filterValue as unknown[]).includes(cellValue)

        case "date": {
          if (cellValue === undefined) return false
          const { before, after } = filterValue as {
            before?: Date
            after?: Date
          }
          const t = (cellValue as Date).getTime()
          return (
            (before === undefined || t <= before.getTime()) &&
            (after === undefined || t >= after.getTime())
          )
        }

        default:
          return true
      }
    })
  )
}

/* ============================================================================
 * 4. Pagination
 * ==========================================================================*/

function paginate<T>(data: T[], page: number, pageSize: number): T[] {
  const start = page * pageSize
  return data.slice(start, start + pageSize)
}

/* ============================================================================
 * 5. Cell rendering helpers
 * ==========================================================================*/

const BADGE_COLORS = [
  "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-400/30",
  "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-400/30",
  "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-400/30",
  "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-400/30",
  "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-400/30",
  "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-400/30",
  "bg-muted text-muted-foreground ring-border",
]

function badgeColor(value: string): string {
  let hash = 0
  for (let i = 0; i < value.length; i++)
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length]
}

function Badge({ children }: { children: ReactNode }) {
  const text = String(children)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeColor(
        text
      )}`}
    >
      {children}
    </span>
  )
}

/* ============================================================================
 * 6. Multi-select filter for union columns
 *    (Radix Select doesn't support multiple selection, so this is a small
 *    self-contained dropdown styled to match the same trigger/content look.)
 * ==========================================================================*/

function MultiSelectFilter({
  options,
  labels,
  selected,
  onChange,
}: {
  options: readonly unknown[]
  labels?: Partial<Record<string, string>>
  selected: unknown[]
  onChange: (next: unknown[] | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function toggle(opt: unknown) {
    const next = selected.includes(opt)
      ? selected.filter((o) => o !== opt)
      : [...selected, opt]
    onChange(next.length ? next : undefined)
  }

  const label =
    selected.length === 0
      ? "Any"
      : selected.length === 1
        ? displayLabel(selected[0], labels)
        : `${selected.length} selected`

  return (
    <div ref={ref} className="relative flex flex-row items-center gap-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none focus:ring-1 focus:ring-ring"
      >
        <span className={selected.length ? "" : "text-muted-foreground"}>
          {label}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
      {selected.length > 0 && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="shrink-0 rounded-full p-1 hover:bg-secondary"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full min-w-[10rem] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {options.map((opt) => {
            const isSelected = selected.includes(opt)
            return (
              <div
                key={String(opt)}
                onClick={() => toggle(opt)}
                className="relative flex cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
              >
                {displayLabel(opt, labels)}
                {isSelected && <Check className="absolute right-2 h-4 w-4" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
 * 7. Filter UI, dispatched by column.type — reuses the app's Input/Select
 * ==========================================================================*/

function ColumnFilter<T>({
  column,
  value,
  onChange,
}: {
  column: Column<T>
  value: unknown
  onChange: (value: unknown) => void
}) {
  switch (column.type) {
    case "string":
      return (
        <Input
          type="text"
          placeholder="Filter..."
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="h-9"
        />
      )

    case "number": {
      const v = (value as { min?: number; max?: number }) ?? {}
      return (
        <div className="flex gap-1">
          <Input
            type="number"
            placeholder="Min"
            value={v.min ?? ""}
            onChange={(e) =>
              onChange({
                ...v,
                min: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-9"
          />
          <Input
            type="number"
            placeholder="Max"
            value={v.max ?? ""}
            onChange={(e) =>
              onChange({
                ...v,
                max: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-9"
          />
        </div>
      )
    }

    case "boolean": {
      const strValue = value === undefined ? undefined : String(value)
      return (
        <div className="flex flex-row items-center gap-1">
          <Select
            value={strValue}
            onValueChange={(v) => onChange(v === "true")}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
          {strValue !== undefined && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="shrink-0 rounded-full p-1 hover:bg-secondary"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )
    }

    case "union":
      return (
        <MultiSelectFilter
          options={column.options}
          labels={column.labels}
          selected={(value as unknown[]) ?? []}
          onChange={onChange}
        />
      )

    case "date": {
      const v = (value as { before?: Date; after?: Date }) ?? {}
      const toInputValue = (d?: Date) => (d ? d.toISOString().slice(0, 10) : "")
      return (
        <div className="flex gap-1">
          <Input
            type="date"
            value={toInputValue(v.after)}
            onChange={(e) =>
              onChange({
                ...v,
                after: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
            className="h-9"
          />
          <Input
            type="date"
            value={toInputValue(v.before)}
            onChange={(e) =>
              onChange({
                ...v,
                before: e.target.value ? new Date(e.target.value) : undefined,
              })
            }
            className="h-9"
          />
        </div>
      )
    }
  }
}

/* ============================================================================
 * 8. The Table component
 * ==========================================================================*/

export interface TableProps<T> {
  onRowClick?: (row: T) => void;
  data: T[]
  /** Array order = column display order, index 0 leftmost. */
  columns: Column<T>[]
  /** Stable unique id per row, used as the React key. */
  getRowId: (row: T) => string | number
  pageSize?: number
}

export function Table<T extends object>({
  data,
  columns,
  getRowId,
  pageSize = 10,
  onRowClick,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortState<T> | null>(null)
  const [filters, setFilters] = useState<FilterState<T>>({})
  const [page, setPage] = useState(0)

  const processed = useMemo(() => {
    const filtered = applyFilters(data, filters, columns)
    return sortData(filtered, sort, columns)
  }, [data, filters, sort, columns])

  const pageData = useMemo(
    () => paginate(processed, page, pageSize),
    [processed, page, pageSize]
  )

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize))

  function toggleSort(key: keyof T) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" }
      if (prev.direction === "asc") return { key, direction: "desc" }
      return null // third click clears sort
    })
    setPage(0)
  }

  function setFilter(key: keyof T, value: unknown) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  function renderCell(col: Column<T>, row: T): ReactNode {
    const value = row[col.key]
    if (col.render) return col.render(value, row)
    if (value === undefined || value === null)
      return <span className="text-muted-foreground">—</span>
    if (col.type === "boolean")
      return (
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${value
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-muted text-muted-foreground"
            }`}
        >
          {value ? "✓" : "–"}
        </span>
      )
    if (col.type === "union")
      return <Badge>{displayLabel(value, col.labels)}</Badge>
    if (col.type === "date")
      return (value as unknown as Date).toLocaleDateString()
    return String(value)
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-3 py-2.5 text-left align-top"
                >
                  <button
                    type="button"
                    disabled={!col.sortable}
                    onClick={() => toggleSort(col.key)}
                    className={`flex items-center gap-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase ${col.sortable
                      ? "cursor-pointer hover:text-foreground"
                      : "cursor-default"
                      }`}
                  >
                    {col.header}
                    {col.sortable &&
                      (sort?.key === col.key ? (
                        sort.direction === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />
                      ))}
                  </button>
                  {col.filterable && (
                    <div className="mt-1.5 w-44">
                      <ColumnFilter
                        column={col}
                        value={
                          (filters as Record<string, unknown>)[
                          col.key as string
                          ]
                        }
                        onChange={(v) => setFilter(col.key, v)}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageData.map((row) => (
              <tr
                key={getRowId(row)}
                className="transition-colors hover:bg-muted/50"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-3 py-2.5 align-middle text-foreground"
                  >
                    {renderCell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-sm text-muted-foreground"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/50 px-3 py-2">
        <span className="text-xs text-muted-foreground">
          {processed.length} result{processed.length === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
