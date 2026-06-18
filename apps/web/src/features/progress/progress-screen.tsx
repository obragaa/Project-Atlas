"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  type MeasurementView,
  type ProgressSummary,
  type RecordMeasurementRequest,
} from "@atlas/contracts";
import { Button, Card, Input, Skeleton, cn } from "@atlas/ui";
import { ApiError } from "@/services/api-client";
import { progressService } from "@/services/progress.service";
import { WeightChart } from "./weight-chart";

/** Progress screen (blueprint/07 "Progresso"): records, chart, log + history. */
export function ProgressScreen() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [history, setHistory] = useState<MeasurementView[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [s, h] = await Promise.all([progressService.summary(), progressService.history()]);
      setSummary(s);
      setHistory([...h.items]);
    } catch (err) {
      setError(toMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Progresso</h1>
        <p className="text-text-secondary">Acompanhe seu peso e medidas ao longo do tempo.</p>
      </header>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-text"
        >
          {error}
        </p>
      ) : null}

      {/* Records */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Peso atual"
          value={fmtKg(summary?.latestWeightKg)}
          loading={summary === null}
          accent
        />
        <Stat
          label="Variação"
          value={fmtChange(summary?.totalChangeKg)}
          loading={summary === null}
        />
        <Stat label="Menor" value={fmtKg(summary?.lowestWeightKg)} loading={summary === null} />
        <Stat label="Maior" value={fmtKg(summary?.highestWeightKg)} loading={summary === null} />
      </section>

      {/* Chart */}
      <Card padding="lg" className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Evolução do peso
        </h2>
        {summary === null ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <WeightChart series={summary.weightSeries} />
        )}
      </Card>

      {/* Record form */}
      <RecordForm onRecorded={() => void load()} />

      {/* History */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
          Histórico
        </h2>
        {history === null ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : history.length === 0 ? (
          <Card padding="lg">
            <p className="text-sm text-text-secondary">
              Nenhum registro ainda. Adicione sua primeira medição acima.
            </p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((m) => (
              <HistoryRow key={m.id} entry={m} onDeleted={() => void load()} onError={setError} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RecordForm({ onRecorded }: { onRecorded: () => void }) {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const request: RecordMeasurementRequest = {
      recordedOn: date,
      weightKg: weight ? Number(weight) : null,
      measurements: waist ? { waist: Number(waist) } : undefined,
      note: note.trim() || null,
    };
    if (!request.weightKg && !waist) {
      setError("Informe o peso ou ao menos uma medida.");
      return;
    }
    setBusy(true);
    try {
      await progressService.record(request);
      setWeight("");
      setWaist("");
      setNote("");
      onRecorded();
    } catch (err) {
      setError(err instanceof ApiError ? err.problem.detail : "Não foi possível registrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">
        Novo registro
      </h2>
      {error ? (
        <p role="alert" className="text-sm text-danger-text">
          {error}
        </p>
      ) : null}
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input
            label="Peso (kg)"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="Ex.: 82.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <Input
            label="Cintura (cm)"
            type="number"
            inputMode="decimal"
            placeholder="Opcional"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
          />
        </div>
        <Input
          label="Observação"
          placeholder="Opcional"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div>
          <Button type="submit" isLoading={busy} loadingText="Salvando">
            Registrar
          </Button>
        </div>
      </form>
    </Card>
  );
}

function HistoryRow({
  entry,
  onDeleted,
  onError,
}: {
  entry: MeasurementView;
  onDeleted: () => void;
  onError: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const parts: string[] = [];
  if (entry.weightKg !== null) parts.push(`${entry.weightKg} kg`);
  const m = entry.measurements;
  if (m.waist) parts.push(`cintura ${m.waist} cm`);
  if (m.arm) parts.push(`braço ${m.arm} cm`);
  if (m.chest) parts.push(`peito ${m.chest} cm`);

  async function remove() {
    setBusy(true);
    try {
      await progressService.remove(entry.id);
      onDeleted();
    } catch (err) {
      onError(err instanceof ApiError ? err.problem.detail : "Não foi possível excluir.");
      setBusy(false);
    }
  }

  return (
    <li>
      <Card padding="md" className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-text-primary">{formatDate(entry.recordedOn)}</p>
          <p className="truncate text-sm text-text-tertiary">
            {parts.join(" · ")}
            {entry.note ? ` — ${entry.note}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="sm" isLoading={busy} onClick={() => void remove()}>
          Excluir
        </Button>
      </Card>
    </li>
  );
}

function Stat({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value: string;
  loading: boolean;
  accent?: boolean;
}) {
  return (
    <Card padding="md" className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-text-tertiary">{label}</span>
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <span
          className={cn("text-2xl font-semibold", accent ? "text-accent" : "text-text-primary")}
        >
          {value}
        </span>
      )}
    </Card>
  );
}

function fmtKg(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : `${v} kg`;
}

function fmtChange(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v} kg`;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function toMessage(err: unknown): string {
  return err instanceof ApiError ? err.problem.detail : "Algo deu errado. Tente novamente.";
}
