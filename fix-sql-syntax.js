#!/usr/bin/env node

/**
 * Script para corrigir sintaxe SQL MySQL para PostgreSQL
 * Converte todas as queries com ? para $1, $2, $3, etc.
 */

const fs = require('fs');
const path = require('path');

const controllersDir = './backend/src/controllers';
const files = fs.readdirSync(controllersDir);

function fixSqlSyntax(content) {
  let newContent = content;
  let counter = 1;
  
  // Converter ? para $1, $2, $3, etc. dentro de queries SQL
  newContent = newContent.replace(/await pool\.execute\(\s*['"`]([^'"`]*?)['"`],?\s*\[([^\]]*?)\]/gs, (match, query, params) => {
    counter = 1;
    
    // Converter ? para $1, $2, $3, etc.
    const fixedQuery = query.replace(/\?/g, () => `$${counter++}`);
    
    return match.replace(query, fixedQuery);
  });
  
  // Resetar counter para cada nova query
  newContent = newContent.replace(/pool\.execute\(/g, () => {
    counter = 1;
    return 'pool.execute(';
  });
  
  return newContent;
}

console.log('🔧 Corrigindo sintaxe SQL MySQL para PostgreSQL...');

files.forEach(file => {
  if (file.endsWith('.ts')) {
    const filePath = path.join(controllersDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixSqlSyntax(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent);
      console.log(`✅ Corrigido: ${file}`);
    } else {
      console.log(`⚪ Sem alterações: ${file}`);
    }
  }
});

console.log('🎉 Correção concluída!');
