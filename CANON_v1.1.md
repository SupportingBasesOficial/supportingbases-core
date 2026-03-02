# SupportingBases Core Engine — Canon v1.1
**Status:** FROZEN — v1.1.0

## Propósito
Motor determinístico stateless de análise estrutural e projeção temporal com classificação sistêmica de risco financeiro.
Não persiste estado, não executa ações, não depende de UI, não depende de banco.

## Invariantes (imutáveis)
- Determinístico e stateless.
- Layer 1 > Layer 2 > Layer 3 (peso).
- Atraso nunca reduz peso.
- Engine nunca depende de calendário fixo (apenas usa datas fornecidas).
- Engine nunca toma decisão executável; apenas emite análise.
- Violação de invariantes => bump major.

## Fórmulas oficiais (v1.1)

### Structural ratio
`structural_ratio = total_weighted_pressure / available_cash`

### Structural index (logistic)
`structural_index = 100 * (ratio^2 / (1 + ratio^2))`

Regras:
- if available_cash <= 0 => structural_index = 100
- clamp [0,100]
- precisão: 1 casa decimal

### Nominal index (operacional)
Simulação sequencial de liquidez (amount nominal) em horizonte configurável.
Colapso nominal ocorre quando liquidity < 0 em algum dia do horizonte.
Mapping (0..100):
- se colapsa no horizonte => 100
- senão => escala pelo "pior stress" no horizonte (max daily outflow vs cash), com clamp [0..99]

### Consolidated index
Regras:
- if nominal_index >= 80 => consolidated = nominal
- else if structural_index >= 90 => consolidated = structural
- else consolidated = round(nominal*0.6 + structural*0.4)

## Pipeline oficial
1) validar SBInput (runtime)
2) expandir recorrências no horizonte
3) aplicar penalidade por atraso (late multiplier)
4) aplicar pesos por camada
5) consolidar por centers (pressões locais)
6) clusterizar obrigações em ondas de pressão
7) simular liquidez nominal e estrutural
8) identificar ZPF global (primeiro dia do cluster dominante / alta pressão)
9) calcular collapse dates (nominal e structural)
10) calcular índices (nominal, structural, consolidated)
11) emitir SBOutput

## Versionamento
- major: quebra de contrato/invariantes
- minor: extensões compatíveis
- patch: correções internas/testes
