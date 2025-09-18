import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Receita, CreateReceitaDto, UpdateReceitaDto } from '@/services/types';

const dataPath = join(process.cwd(), 'src/data/receitas.json');

function readReceitas(): Receita[] {
  try {
    const data = readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeReceitas(receitas: Receita[]): void {
  writeFileSync(dataPath, JSON.stringify(receitas, null, 2));
}

export async function GET() {
  try {
    const receitas = readReceitas();
    return NextResponse.json(receitas);
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateReceitaDto = await request.json();
    
    // Validação básica
    if (!data.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const receitas = readReceitas();
    
    // Verificar se já existe receita com o mesmo nome
    const existeReceita = receitas.find(r => 
      r.nome.toLowerCase() === data.nome.trim().toLowerCase()
    );
    
    if (existeReceita) {
      return NextResponse.json({ error: 'Receita já cadastrada' }, { status: 400 });
    }

    const novaReceita: Receita = {
      id: Date.now().toString(),
      nome: data.nome.trim(),
      userId: 'user_default', // TODO: Integrar com autenticação real
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    receitas.push(novaReceita);
    writeReceitas(receitas);

    return NextResponse.json(novaReceita, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar receita:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: UpdateReceitaDto = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const receitas = readReceitas();
    const index = receitas.findIndex(r => r.id === data.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Receita não encontrada' }, { status: 404 });
    }

    // Verificar se o novo nome já existe em outra receita
    if (data.nome?.trim()) {
      const novoNome = data.nome.trim().toLowerCase();
      const existeOutraReceita = receitas.find(r => 
        r.id !== data.id && r.nome.toLowerCase() === novoNome
      );
      
      if (existeOutraReceita) {
        return NextResponse.json({ error: 'Nome já utilizado por outra receita' }, { status: 400 });
      }
    }

    const receitaAtualizada: Receita = {
      ...receitas[index],
      ...(data.nome && { nome: data.nome.trim() }),
      updatedAt: new Date().toISOString()
    };

    receitas[index] = receitaAtualizada;
    writeReceitas(receitas);

    return NextResponse.json(receitaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
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

    const receitas = readReceitas();
    const index = receitas.findIndex(r => r.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Receita não encontrada' }, { status: 404 });
    }

    // Verificar se existem fontes de renda vinculadas
    const fontesRendaPath = join(process.cwd(), 'src/data/fontes-renda.json');
    try {
      const fontesRendaData = readFileSync(fontesRendaPath, 'utf8');
      const fontesRenda = JSON.parse(fontesRendaData);
      const temFontesVinculadas = fontesRenda.some((f: any) => f.receitaId === id);
      
      if (temFontesVinculadas) {
        return NextResponse.json({ 
          error: 'Não é possível excluir receita que possui fontes de renda vinculadas' 
        }, { status: 400 });
      }
    } catch {
      // Se não conseguir ler fontes-renda.json, continua com a exclusão
    }

    receitas.splice(index, 1);
    writeReceitas(receitas);

    return NextResponse.json({ message: 'Receita excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir receita:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}