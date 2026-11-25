import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";
import { getDataset } from "@/data/mock";

describe("CSV e dados simulados", () => {
  it("gera CSV com cabeçalho e escapa ponto e vírgula", () => {
    expect(toCsv([{ a: "x;y", b: 2 }])).toBe('a;b\n"x;y";2');
  });
  it("mix soma ~100% e madrugada retorna estado vazio", () => {
    const d = getDataset("hoje", "todos", 0);
    const sum = d.mix.reduce((a, b) => a + b.percentual, 0);
    expect(Math.abs(sum - 100)).toBeLessThan(1);
    expect(getDataset("hoje", "madrugada", 0).vazio).toBe(true);
  });
});
