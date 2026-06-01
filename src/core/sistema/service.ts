import { sistemaRepository } from "./repository";

export const sistemaService = {
  async executarLimpeza(dias?: number) {
    const fallbackDias = dias ?? 7;
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - fallbackDias);

    const resultado = await sistemaRepository.limparDadosInativos(dataLimite);

    return {
      message: `Limpeza realizada com sucesso para registros inativos há mais de ${fallbackDias} dias.`,
      limite: dataLimite,
      removidos: resultado,
    };
  },
};
