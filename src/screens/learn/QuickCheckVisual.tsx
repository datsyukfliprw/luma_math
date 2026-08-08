import type { ReactNode } from "react";
import type { QuickCheckVisual as QuickCheckVisualData } from "../../lib/quickCheck/schema";

type QuickCheckVisualProps = {
  visual?: QuickCheckVisualData;
};

const PLACE_VALUE_COLUMNS = [
  { key: "hundred_thousands", label: "Hundred thousands" },
  { key: "ten_thousands", label: "Ten thousands" },
  { key: "thousands", label: "Thousands" },
  { key: "hundreds", label: "Hundreds" },
  { key: "tens", label: "Tens" },
  { key: "ones", label: "Ones" },
] as const;

function EqualGroupsVisual({ groups, itemsPerGroup }: { groups: number; itemsPerGroup: number }) {
  const safeGroups = Math.max(0, Math.min(groups, 12));
  const safeItems = Math.max(0, itemsPerGroup);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {Array.from({ length: safeGroups }).map((_, groupIndex) => (
          <div
            key={groupIndex}
            className="flex min-h-14 min-w-14 items-center justify-center rounded-2xl border border-[#00AFB9]/20 bg-[#F7FCFD] px-2 py-2 shadow-inner"
          >
            {safeItems === 0 ? (
              <span className="text-xl font-black text-[#9AB5C7]">∅</span>
            ) : safeItems <= 12 ? (
              <div className="flex max-w-[64px] flex-wrap items-center justify-center gap-1">
                {Array.from({ length: safeItems }).map((_, itemIndex) => (
                  <span
                    key={`${groupIndex}-${itemIndex}`}
                    className="h-3 w-3 rounded-full bg-[#F7B733]"
                  />
                ))}
              </div>
            ) : (
              <span className="text-lg font-black text-[#073B5A]">{safeItems}</span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-xs font-black uppercase tracking-[0.12em] text-[#6D9AB1]">
        {groups} groups · {itemsPerGroup} in each
      </p>
    </div>
  );
}

function ArrayVisual({ rows, columns }: { rows: number; columns: number }) {
  const total = Math.max(0, rows * columns);
  const canDrawDots = rows > 0 && columns > 0 && total <= 100;

  return (
    <div className="flex flex-col items-center">
      {canDrawDots ? (
        <div
          className="grid gap-2 rounded-2xl border border-[#00AFB9]/15 bg-[#F7FCFD] p-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: total }).map((_, index) => (
            <span key={index} className="h-4 w-4 rounded-full bg-[#00AFB9]" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#E9F7F8] px-6 py-4 text-2xl font-black text-[#073B5A]">
          {rows} rows × {columns} columns
        </div>
      )}

      <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#6D9AB1]">
        {rows} rows · {columns} in each row
      </p>
    </div>
  );
}

function NumberLineVisual({
  start,
  end,
  jumps,
  mark,
}: {
  start: number;
  end: number;
  jumps?: number[];
  mark?: number;
}) {
  const span = end - start || 1;
  const visiblePoints = (jumps ?? []).filter((value) => value >= start && value <= end);

  function percentFor(value: number) {
    return Math.max(0, Math.min(100, ((value - start) / span) * 100));
  }

  return (
    <div className="px-3 py-4">
      <div className="relative mx-auto h-16 max-w-[720px]">
        <div className="absolute left-0 right-0 top-7 h-1 rounded-full bg-[#9AB5C7]/45" />

        {[start, end].map((value) => (
          <div
            key={value}
            className="absolute top-3 -translate-x-1/2"
            style={{ left: `${percentFor(value)}%` }}
          >
            <div className="mx-auto h-9 w-1 rounded-full bg-[#073B5A]" />
            <p className="mt-1 text-sm font-black text-[#073B5A]">{value}</p>
          </div>
        ))}

        {visiblePoints.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className="absolute top-5 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white bg-[#00AFB9] shadow-sm"
            style={{ left: `${percentFor(value)}%` }}
            aria-label={`Number line point ${value}`}
          />
        ))}

        {mark !== undefined && mark >= start && mark <= end && (
          <div
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `${percentFor(mark)}%` }}
          >
            <div className="rounded-full bg-[#F7B733] px-3 py-1 text-sm font-black text-[#073B5A] shadow-sm">
              {mark}
            </div>
            <div className="mx-auto h-7 w-1 bg-[#F7B733]" />
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceValueChartVisual({
  number,
  highlightedPlace,
}: {
  number: string;
  highlightedPlace?: (typeof PLACE_VALUE_COLUMNS)[number]["key"];
}) {
  const digits = number.replace(/[^0-9]/g, "").slice(-6).padStart(6, " ").split("");

  return (
    <div className="overflow-hidden rounded-2xl border border-[#073B5A]/10 bg-white">
      <div className="grid grid-cols-6">
        {PLACE_VALUE_COLUMNS.map((column, index) => {
          const isHighlighted = column.key === highlightedPlace;

          return (
            <div
              key={column.key}
              className={`border-r border-[#073B5A]/10 px-1.5 py-3 text-center last:border-r-0 ${
                isHighlighted ? "bg-[#FFF3D9]" : "bg-[#F8FBFB]"
              }`}
            >
              <p className="min-h-8 text-[0.62rem] font-black uppercase leading-tight tracking-[0.08em] text-[#6D9AB1]">
                {column.label}
              </p>
              <p className={`mt-2 text-2xl font-black ${isHighlighted ? "text-[#C78300]" : "text-[#073B5A]"}`}>
                {digits[index].trim() || "·"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BaseTenBlocksVisual({
  thousands = 0,
  hundreds = 0,
  tens = 0,
  ones = 0,
}: {
  thousands?: number;
  hundreds?: number;
  tens?: number;
  ones?: number;
}) {
  const places = [
    { label: "Thousands", value: thousands, symbol: "▣" },
    { label: "Hundreds", value: hundreds, symbol: "▦" },
    { label: "Tens", value: tens, symbol: "▥" },
    { label: "Ones", value: ones, symbol: "■" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {places.map((place) => (
        <div key={place.label} className="rounded-2xl border border-[#00AFB9]/15 bg-[#F7FCFD] px-3 py-4 text-center">
          <div className="text-3xl text-[#00AFB9]">{place.symbol}</div>
          <p className="mt-2 text-2xl font-black text-[#073B5A]">{place.value}</p>
          <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[#6D9AB1]">
            {place.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function FractionBarVisual({
  numerator,
  denominator,
  shadedParts,
}: {
  numerator: number;
  denominator: number;
  shadedParts?: number;
}) {
  const safeDenominator = Math.max(1, Math.min(denominator, 24));
  const shaded = Math.max(0, Math.min(shadedParts ?? numerator, safeDenominator));

  return (
    <div className="mx-auto max-w-[720px]">
      <div
        className="grid h-20 overflow-hidden rounded-2xl border-2 border-[#073B5A]/15 bg-white"
        style={{ gridTemplateColumns: `repeat(${safeDenominator}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: safeDenominator }).map((_, index) => (
          <div
            key={index}
            className={`border-r border-[#073B5A]/15 last:border-r-0 ${
              index < shaded ? "bg-[#00AFB9]" : "bg-white"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-lg font-black text-[#073B5A]">
        {numerator}/{denominator}
      </p>
    </div>
  );
}

function FractionCircleVisual({ numerator, denominator }: { numerator: number; denominator: number }) {
  const safeDenominator = Math.max(1, denominator);
  const percent = Math.max(0, Math.min(100, (numerator / safeDenominator) * 100));

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-white shadow-sm"
        style={{
          background: `conic-gradient(#00AFB9 0 ${percent}%, #E9F7F8 ${percent}% 100%)`,
        }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-black text-[#073B5A] shadow-inner">
          {numerator}/{denominator}
        </div>
      </div>
    </div>
  );
}

function ShapeVisual({
  kind,
  width,
  height,
  sideLabels,
}: {
  kind: "rectangle" | "square" | "triangle" | "quadrilateral";
  width?: number;
  height?: number;
  sideLabels?: Record<string, number>;
}) {
  const polygonPoints = kind === "triangle" ? "100,15 185,135 15,135" : "25,25 180,15 170,135 15,125";

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex min-h-40 w-full max-w-[360px] items-center justify-center rounded-2xl bg-[#F7FCFD] px-5 py-4">
        {kind === "rectangle" || kind === "square" ? (
          <div
            className="border-4 border-[#00AFB9] bg-[#E9F7F8]"
            style={{
              width: kind === "square" ? 140 : 190,
              height: kind === "square" ? 140 : 110,
            }}
          />
        ) : (
          <svg viewBox="0 0 200 150" className="h-36 w-52" aria-label={`${kind} diagram`}>
            <polygon points={polygonPoints} fill="#E9F7F8" stroke="#00AFB9" strokeWidth="5" />
          </svg>
        )}
      </div>

      {(width !== undefined || height !== undefined) && (
        <p className="mt-3 text-base font-black text-[#073B5A]">
          {width !== undefined ? `width ${width}` : ""}
          {width !== undefined && height !== undefined ? " · " : ""}
          {height !== undefined ? `height ${height}` : ""}
        </p>
      )}

      {sideLabels && Object.keys(sideLabels).length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {Object.entries(sideLabels).map(([label, value]) => (
            <span key={label} className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-[#275875] shadow-sm">
              {label}: {value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ClockVisual({ hour, minute }: { hour: number; minute: number }) {
  const minuteRotation = minute * 6;
  const hourRotation = (hour % 12) * 30 + minute * 0.5;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-44 rounded-full border-4 border-[#073B5A] bg-white shadow-sm">
        {[12, 3, 6, 9].map((value) => {
          const position =
            value === 12
              ? "left-1/2 top-2 -translate-x-1/2"
              : value === 3
                ? "right-2 top-1/2 -translate-y-1/2"
                : value === 6
                  ? "bottom-2 left-1/2 -translate-x-1/2"
                  : "left-2 top-1/2 -translate-y-1/2";

          return (
            <span key={value} className={`absolute text-sm font-black text-[#073B5A] ${position}`}>
              {value}
            </span>
          );
        })}

        <div className="absolute left-1/2 top-1/2 h-14 w-1 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-[#073B5A]" style={{ transform: `translateX(-50%) translateY(-100%) rotate(${hourRotation}deg)` }} />
        <div className="absolute left-1/2 top-1/2 h-16 w-1 origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-[#00AFB9]" style={{ transform: `translateX(-50%) translateY(-100%) rotate(${minuteRotation}deg)` }} />
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F7B733]" />
      </div>

      <p className="mt-3 text-lg font-black text-[#073B5A]">
        {hour}:{String(minute).padStart(2, "0")}
      </p>
    </div>
  );
}

function BarGraphVisual({
  title,
  categories,
}: {
  title?: string;
  categories: { label: string; value: number }[];
}) {
  const maxValue = Math.max(1, ...categories.map((category) => category.value));

  return (
    <div>
      {title && <p className="mb-4 text-center text-base font-black text-[#073B5A]">{title}</p>}
      <div className="flex h-44 items-end justify-center gap-3 border-b-2 border-[#073B5A]/20 px-4">
        {categories.map((category) => (
          <div key={category.label} className="flex h-full min-w-12 flex-1 flex-col items-center justify-end">
            <p className="mb-1 text-sm font-black text-[#073B5A]">{category.value}</p>
            <div
              className="w-full max-w-16 rounded-t-xl bg-[#00AFB9]"
              style={{ height: `${Math.max(8, (category.value / maxValue) * 115)}px` }}
            />
            <p className="mt-2 max-w-20 truncate text-xs font-black text-[#6D9AB1]">{category.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PictureGraphVisual({
  title,
  categories,
  legendKey,
}: {
  title?: string;
  categories: { label: string; value: number }[];
  legendKey: string;
}) {
  return (
    <div>
      {title && <p className="mb-3 text-center text-base font-black text-[#073B5A]">{title}</p>}
      <div className="space-y-2.5">
        {categories.map((category) => (
          <div key={category.label} className="grid grid-cols-[110px_1fr] items-center gap-3 rounded-xl bg-[#F8FBFB] px-3 py-2.5">
            <p className="text-sm font-black text-[#073B5A]">{category.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: Math.max(0, Math.min(category.value, 30)) }).map((_, index) => (
                <span key={index} className="h-4 w-4 rounded bg-[#00AFB9]" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs font-black uppercase tracking-[0.12em] text-[#6D9AB1]">
        Key: {legendKey}
      </p>
    </div>
  );
}

function LinePlotVisual({ title, values }: { title?: string; values: number[] }) {
  const sortedUnique = Array.from(new Set(values)).sort((a, b) => a - b);
  const counts = new Map<number, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));

  return (
    <div>
      {title && <p className="mb-4 text-center text-base font-black text-[#073B5A]">{title}</p>}
      <div className="flex items-end justify-center gap-4 border-b-2 border-[#073B5A]/25 px-4 pb-1">
        {sortedUnique.map((value) => (
          <div key={value} className="flex min-w-10 flex-col items-center">
            <div className="flex min-h-16 flex-col-reverse justify-start gap-1 pb-1">
              {Array.from({ length: counts.get(value) ?? 0 }).map((_, index) => (
                <span key={index} className="h-3.5 w-3.5 rounded-full bg-[#00AFB9]" />
              ))}
            </div>
            <div className="h-3 w-0.5 bg-[#073B5A]" />
            <p className="mt-1 text-sm font-black text-[#073B5A]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickCheckVisual({ visual }: QuickCheckVisualProps) {
  if (!visual || visual.type === "none") {
    return null;
  }

  let content: ReactNode;

  switch (visual.type) {
    case "equal_groups":
      content = <EqualGroupsVisual groups={visual.groups} itemsPerGroup={visual.itemsPerGroup} />;
      break;
    case "array":
      content = <ArrayVisual rows={visual.rows} columns={visual.columns} />;
      break;
    case "number_line":
      content = (
        <NumberLineVisual start={visual.start} end={visual.end} jumps={visual.jumps} mark={visual.mark} />
      );
      break;
    case "place_value_chart":
      content = <PlaceValueChartVisual number={visual.number} highlightedPlace={visual.highlightedPlace} />;
      break;
    case "base_ten_blocks":
      content = (
        <BaseTenBlocksVisual
          thousands={visual.thousands}
          hundreds={visual.hundreds}
          tens={visual.tens}
          ones={visual.ones}
        />
      );
      break;
    case "fraction_bar":
      content = (
        <FractionBarVisual
          numerator={visual.numerator}
          denominator={visual.denominator}
          shadedParts={visual.shadedParts}
        />
      );
      break;
    case "fraction_circle":
      content = <FractionCircleVisual numerator={visual.numerator} denominator={visual.denominator} />;
      break;
    case "shape":
      content = (
        <ShapeVisual
          kind={visual.kind}
          width={visual.width}
          height={visual.height}
          sideLabels={visual.sideLabels}
        />
      );
      break;
    case "clock":
      content = <ClockVisual hour={visual.hour} minute={visual.minute} />;
      break;
    case "bar_graph":
      content = <BarGraphVisual title={visual.title} categories={visual.categories} />;
      break;
    case "picture_graph":
      content = (
        <PictureGraphVisual title={visual.title} categories={visual.categories} legendKey={visual.key} />
      );
      break;
    case "line_plot":
      content = <LinePlotVisual title={visual.title} values={visual.values} />;
      break;
  }

  return (
    <section
      data-name={`quick-check-visual-${visual.type}`}
      className="mt-4 rounded-[1.35rem] border border-[#00AFB9]/15 bg-white px-4 py-4 shadow-sm"
    >
      {content}
    </section>
  );
}

export default QuickCheckVisual;
