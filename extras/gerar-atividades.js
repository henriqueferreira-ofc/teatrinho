const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

// Interface para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Solicita input do usuário
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Inicializa o Firebase Admin SDK
 */
async function initializeFirebase() {
  try {
    // Verifica se já existe uma app inicializada
    if (admin.apps.length === 0) {
      console.log('🔧 Inicializando Firebase Admin SDK...');
      
      // Verifica se existe o arquivo de credenciais
      const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
      
      if (!fs.existsSync(serviceAccountPath)) {
        console.log('❌ Arquivo serviceAccountKey.json não encontrado.');
        console.log('📁 Por favor, coloque o arquivo serviceAccountKey.json na pasta extras/');
        
        const continuar = await askQuestion('Deseja continuar mesmo assim? (s/n): ');
        if (continuar.toLowerCase() !== 's') {
          process.exit(1);
        }
        
        // Tenta usar variáveis de ambiente como fallback
        if (!process.env.FIREBASE_PROJECT_ID) {
          console.log('❌ Nenhuma credencial Firebase encontrada.');
          process.exit(1);
        }
        
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
        });
      } else {
        const serviceAccount = require(serviceAccountPath);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: `${serviceAccount.project_id}.appspot.com`
        });
      }
      
      console.log('✅ Firebase Admin SDK inicializado com sucesso!');
    }
    
    return admin.storage().bucket();
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error.message);
    process.exit(1);
  }
}

/**
 * Percorre as pastas no Storage e identifica arquivos .jpg
 */
async function percorrerAtividades(bucket) {
  console.log('📁 Percorrendo estrutura de pastas no Firebase Storage...');
  
  try {
    // Lista todos os arquivos na pasta atividades/
    const [files] = await bucket.getFiles({ prefix: 'atividades/' });
    
    const atividades = [];
    const categorias = new Set();
    
    for (const file of files) {
      const filePath = file.name;
      
      // Ignora se não é arquivo .jpg
      if (!filePath.endsWith('.jpg')) {
        continue;
      }
      
      // Extrai informações do caminho: atividades/categoria/arquivo.jpg
      const pathParts = filePath.split('/');
      
      if (pathParts.length < 3) {
        console.log(`⚠️  Caminho inválido ignorado: ${filePath}`);
        continue;
      }
      
      const categoria = pathParts[1];
      const nomeArquivo = pathParts[2];
      const ordem = parseInt(path.basename(nomeArquivo, '.jpg')) || 1;
      
      categorias.add(categoria);
      
      // Gera URL pública para a imagem
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2030' // URL válida por muito tempo
      });
      
      // Cria objeto da atividade
      const atividade = {
        id: uuidv4(),
        ordem: ordem,
        data: new Date().toISOString(),
        categoria: categoria,
        pasta: `atividades/${categoria}`,
        arquivo: nomeArquivo,
        imagemUrl: url
      };
      
      atividades.push(atividade);
    }
    
    // Ordena atividades por categoria e depois por ordem
    atividades.sort((a, b) => {
      if (a.categoria !== b.categoria) {
        return a.categoria.localeCompare(b.categoria);
      }
      return a.ordem - b.ordem;
    });
    
    return {
      atividades,
      totalCategorias: categorias.size,
      totalAtividades: atividades.length
    };
    
  } catch (error) {
    console.error('❌ Erro ao percorrer atividades:', error.message);
    throw error;
  }
}

/**
 * Salva o arquivo atividades.json
 */
function salvarArquivoJSON(atividades) {
  console.log('💾 Salvando arquivo atividades.json...');
  
  try {
    // Cria diretório se não existir
    const outputDir = path.join(__dirname, '../client/src/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Salva o arquivo JSON
    const outputPath = path.join(outputDir, 'atividades.json');
    fs.writeFileSync(outputPath, JSON.stringify(atividades, null, 2), 'utf8');
    
    console.log(`✅ Arquivo salvo em: ${outputPath}`);
    return outputPath;
    
  } catch (error) {
    console.error('❌ Erro ao salvar arquivo:', error.message);
    throw error;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando geração do arquivo atividades.json...\n');
  
  try {
    // Inicializa Firebase
    const bucket = await initializeFirebase();
    
    // Percorre atividades no Storage
    const resultado = await percorrerAtividades(bucket);
    
    // Salva arquivo JSON
    const outputPath = salvarArquivoJSON(resultado.atividades);
    
    // Exibe resumo
    console.log('\n📊 RESUMO DA EXECUÇÃO:');
    console.log(`📁 Total de categorias: ${resultado.totalCategorias}`);
    console.log(`📄 Total de atividades: ${resultado.totalAtividades}`);
    console.log(`💾 Arquivo salvo em: ${outputPath}`);
    console.log('\n✅ Processo concluído com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro durante a execução:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executa o script
if (require.main === module) {
  main();
}

module.exports = { main };