#!/bin/bash

# Script de Teste Otimizado - MagicBox Tier List
# Uso: ./scripts/test-models.sh

# Cores
NC='\033[0m'
CYAN='\033[36m'
YELLOW='\033[33m'
GREEN='\033[32m'
RED='\033[31m'

# Carregar .env.local
if [ -f .env.local ]; then
  set -a
  source <(tr -d '\r' < .env.local)
  set +a
else
  echo -e "${RED}❌ Arquivo .env.local não encontrado!${NC}"
  exit 1
fi

echo -e "\n${CYAN}🚀 Iniciando Teste Otimizado da Tier List...${NC}\n"

test_groq() {
  local model=$1
  local res=$(curl -s -X POST "https://api.groq.com/openai/v1/chat/completions" \
    -H "Authorization: Bearer $GROQ_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"${model}\",
      \"messages\": [{\"role\": \"user\", \"content\": \"oi\"}],
      \"max_tokens\": 5
    }")
  
  if echo "$res" | grep -q "choices"; then
    local text=$(echo "$res" | jq -r '.choices[0].message.content' | tr -d '\n' | head -c 50)
    echo -e "🤖 Groq | ${model}: ${GREEN}✅ SUCESSO${NC} ($text)"
  else
    local msg=$(echo "$res" | jq -r '.error.message' 2>/dev/null)
    [ "$msg" == "null" ] || [ -z "$msg" ] && msg=$(echo "$res" | jq -c '.' 2>/dev/null || echo "$res")
    echo -e "🤖 Groq | ${model}: ${RED}❌ FALHA${NC} ($msg)"
  fi
}

test_google() {
  local model=$1
  local res=$(curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_GENERATIVE_AI_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{
      \"contents\": [{\"parts\":[{\"text\": \"oi\"}]}],
      \"generationConfig\": {\"maxOutputTokens\": 5}
    }")
  
  if echo "$res" | grep -q "candidates"; then
    local text=$(echo "$res" | jq -r '.candidates[0].content.parts[0].text' | tr -d '\n' | head -c 50)
    echo -e "🤖 Google | ${model}: ${GREEN}✅ SUCESSO${NC} ($text)"
  else
    local msg=$(echo "$res" | jq -r '.error.message' 2>/dev/null)
    [ "$msg" == "null" ] || [ -z "$msg" ] && msg=$(echo "$res" | tr -d '\n' | head -c 100)
    echo -e "🤖 Google | ${model}: ${RED}❌ FALHA${NC} ($msg)"
  fi
}

test_github() {
  local model=$1
  local res=$(curl -s -X POST "https://models.inference.ai.azure.com/chat/completions" \
    -H "Authorization: Bearer $GITHUB_TOKEN_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"${model}\",
      \"messages\": [{\"role\": \"user\", \"content\": \"oi\"}],
      \"max_completion_tokens\": 5
    }")
  
  if echo "$res" | grep -q "choices"; then
    local text=$(echo "$res" | jq -r '.choices[0].message.content' | tr -d '\n' | head -c 50)
    echo -e "🤖 GitHub | ${model}: ${GREEN}✅ SUCESSO${NC} ($text)"
  else
    local msg=$(echo "$res" | jq -r '.error.message' 2>/dev/null)
    [ "$msg" == "null" ] || [ -z "$msg" ] && msg=$(echo "$res" | jq -c '.' 2>/dev/null || echo "$res")
    echo -e "🤖 GitHub | ${model}: ${RED}❌ FALHA${NC} ($msg)"
  fi
}

echo -e "${YELLOW}🥇 TIER 1: Ultra Rápidos${NC}"
test_groq "llama-3.1-8b-instant"
test_google "gemini-3.1-flash-lite-preview"

echo -e "\n${YELLOW}🥈 TIER 2: Balanceados e Qualidade${NC}"
test_google "gemini-2.5-flash-lite"
test_google "gemini-2.5-flash"
test_groq "llama-3.3-70b-versatile"

echo -e "\n${YELLOW}🛡️ TIER 3: GitHub (Reserva de Emergência)${NC}"
test_github "gpt-5-mini"
test_github "gpt-4.1-mini"
test_github "gpt-4.1"

echo -e "\n${GREEN}✨ Teste da Tier List finalizado com sucesso.${NC}\n"