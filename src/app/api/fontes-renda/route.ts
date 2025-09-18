import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { FonteRenda, CreateFonteRendaDto, UpdateFonteRendaDto } from '@/services/types';

const dataPath = join(process.cwd(), 'src/data/fontes-renda.json');
const receitasPath = join(process.cwd(), 'src/data/receitas.json');

function readFontesRenda(): FonteRenda[] {
  try {
    const data = readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeFontesRenda(fontesRenda: FonteRenda[]): void {
  writeFileSync(dataPath, JSON.stringify(fontesRenda, null, 2));
}

function readReceitas() {
  try {
    const data = readFileSync(receitasPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const receitaId = url.searchParams.get('receitaId');
    
    let fontesRenda = readFontesRenda();
    
    if (receitaId) {
      fontesRenda = fontesRenda.filter(f => f.receitaId === receitaId);
    }
    
    return NextResponse.json(fontesRenda);
  } catch (error) {
    console.error('Erro ao buscar fontes de renda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateFonteRendaDto = await request.json();
    
    // Validação básica
    if (!data.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    
    if (!data.receitaId) {
      return NextResponse.json({ error: 'Receita é obrigatória' }, { status: 400 });
    }
    
    if (data.valorEstimado !== undefined && data.valorEstimado < 0) {
      return NextResponse.json({ error: 'Valor estimado não pode ser negativo' }, { status: 400 });
    }
    
    if (data.diaRecebimento !== undefined && (data.diaRecebimento < 1 || data.diaRecebimento > 31)) {
      return NextResponse.json({ error: 'Dia de recebimento deve estar entre 1 e 31' }, { status: 400 });
    }

    // Verificar se a receita existe
    const receitas = readReceitas();
    const receitaExiste = receitas.find((r: any) => r.id === data.receitaId);
    if (!receitaExiste) {
      return NextResponse.json({ error: 'Receita não encontrada' }, { status: 404 });
    }

    const fontesRenda = readFontesRenda();
    
    // Verificar se já existe fonte de renda com o mesmo nome na mesma receita
    const existeFonteRenda = fontesRenda.find(f => 
      f.receitaId === data.receitaId && 
      f.nome.toLowerCase() === data.nome.trim().toLowerCase()
    );
    
    if (existeFonteRenda) {
      return NextResponse.json({ error: 'Fonte de renda já cadastrada nesta receita' }, { status: 400 });
    }

    const novaFonteRenda: FonteRenda = {
      id: Date.now().toString(),
      receitaId: data.receitaId,
      nome: data.nome.trim(),
      valorEstimado: data.valorEstimado || 0,
      diaRecebimento: data.diaRecebimento,
      status: data.status !== undefined ? data.status : true,
      userId: 'user_default', // TODO: Integrar com autenticação real
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    fontesRenda.push(novaFonteRenda);
    writeFontesRenda(fontesRenda);

    return NextResponse.json(novaFonteRenda, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar fonte de renda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: UpdateFonteRendaDto = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    if (data.valorEstimado !== undefined && data.valorEstimado < 0) {
      return NextResponse.json({ error: 'Valor estimado não pode ser negativo' }, { status: 400 });
    }
    
    if (data.diaRecebimento !== undefined && (data.diaRecebimento < 1 || data.diaRecebimento > 31)) {
      return NextResponse.json({ error: 'Dia de recebimento deve estar entre 1 e 31' }, { status: 400 });
    }

    const fontesRenda = readFontesRenda();
    const index = fontesRenda.findIndex(f => f.id === data.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Fonte de renda não encontrada' }, { status: 404 });
    }

    const fonteAtual = fontesRenda[index];

    // Verificar se a receita existe (se está sendo alterada)
    if (data.receitaId && data.receitaId !== fonteAtual.receitaId) {
      const receitas = readReceitas();
      const receitaExiste = receitas.find((r: any) => r.id === data.receitaId);
      if (!receitaExiste) {
        return NextResponse.json({ error: 'Receita não encontrada' }, { status: 404 });
      }
    }

    // Verificar se o novo nome já existe em outra fonte de renda da mesma receita
    if (data.nome?.trim()) {
      const novoNome = data.nome.trim().toLowerCase();
      const receitaId = data.receitaId || fonteAtual.receitaId;
      const existeOutraFonte = fontesRenda.find(f => 
        f.id !== data.id && 
        f.receitaId === receitaId && 
        f.nome.toLowerCase() === novoNome
      );
      
      if (existeOutraFonte) {
        return NextResponse.json({ error: 'Nome já utilizado por outra fonte de renda nesta receita' }, { status: 400 });
      }
    }

    const fonteAtualizada: FonteRenda = {
      ...fonteAtual,
      ...(data.receitaId && { receitaId: data.receitaId }),
      ...(data.nome?.trim() && { nome: data.nome.trim() }),
      ...(data.valorEstimado !== undefined && { valorEstimado: data.valorEstimado }),
      ...(data.diaRecebimento !== undefined && { diaRecebimento: data.diaRecebimento }),
      ...(data.status !== undefined && { status: data.status }),
      updatedAt: new Date().toISOString()
    };

    fontesRenda[index] = fonteAtualizada;
    writeFontesRenda(fontesRenda);

    return NextResponse.json(fonteAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar fonte de renda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const fontesRenda = readFontesRenda();
    const index = fontesRenda.findIndex(f => f.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Fonte de renda não encontrada' }, { status: 404 });
    }

    // Verificar se existem lançamentos vinculados
    const lancamentosPath = join(process.cwd(), 'src/data/lancamentos.json');
    try {
      const lancamentosData = readFileSync(lancamentosPath, 'utf8');
      const lancamentos = JSON.parse(lancamentosData);
      const temLancamentosVinculados = lancamentos.some((l: any) => l.fonteRendaId === id);
      
      if (temLancamentosVinculados) {
        return NextResponse.json({ 
          error: 'Não é possível excluir fonte de renda que possui lançamentos vinculados' 
        }, { status: 400 });
      }
    } catch {
      // Se não conseguir ler lancamentos.json, continua com a exclusão
    }

    fontesRenda.splice(index, 1);
    writeFontesRenda(fontesRenda);

    return NextResponse.json({ message: 'Fonte de renda excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir fonte de renda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}