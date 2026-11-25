# Bovinus Intelligence — protótipo (Hackathon FMU TECH · Unidade Augusta)

Dashboard operacional **somente front-end**. **Todos os dados são simulados** — não há câmeras, visão computacional, backend, autenticação ou APIs reais.

## Executar
```bash
bun install
bun run dev      # http://localhost:8080
bunx vitest run  # testes
```

## Abas
- **Visão geral** — KPIs, clientes e espera por hora, alertas.
- **Mix do prato** — proporção estimada de carnes nobres x acompanhamentos.
- **Filas** — entrada/escada e churrasqueira: espera, pico, gargalo, abandono simulado.
- **Mesas** — mapa livre/ocupada/aguardando limpeza, tempo de limpeza e giro.
- **Qualidade e sobras** — sobra por alimento, baixa saída e recomendações.

Filtros de período e turno (o turno "Madrugada" mostra o estado vazio), botão **Atualizar**, modo **Ao vivo** (nova amostra a cada 10 s) e **Exportar CSV** (gerado no navegador, separador `;`, UTF‑8).

## Estrutura
- `src/data/mock.ts` — gerador determinístico de dados + tipos (`Dataset`, `QueueStat`, `TableInfo`...).
- `src/components/dashboard/` — `Shell`, `DashboardContext`, gráficos SVG (`Charts.tsx`) e UI reutilizável.
- `src/routes/` — uma página por aba.
- `src/lib/csv.ts` — exportação CSV local.

## Integração futura (Java Spring Boot)
Os tipos em `src/data/mock.ts` são o contrato. Sugestão de endpoints:
```
GET /api/v1/unidades/augusta/dashboard?periodo=hoje|7d|30d&turno=todos|almoco|jantar
  -> Dataset (JSON)
```
Substitua `getDataset()` em `DashboardContext.tsx` por um `fetch` (ou React Query) a esse endpoint, mantendo o mesmo formato. Configure a URL por `VITE_API_URL` e habilite CORS no Spring (`@CrossOrigin`). Quando houver dados reais, remova a faixa "Dados simulados — protótipo".
