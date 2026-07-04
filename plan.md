We need to fix three things:
1. divergencias/repository.ts: obterLancamentosVencidosNaoPagos should group by month and despesa, check SUM(pagamento) < SUM(agendamento) (or FIXA logic), and respect [QUITAÇÃO].
2. divergencias/service.ts: Update the logic that uses obterLancamentosVencidosNaoPagos.
3. relatorios/repository.ts and service: Respect [QUITAÇÃO] when computing restante and status.
