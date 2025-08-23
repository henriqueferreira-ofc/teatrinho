import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      
      // Tenta usar variáveis de ambiente primeiro
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (serviceAccountJson) {
        console.log('🔑 Usando credenciais das variáveis de ambiente...');
        
        try {
          // Remove possíveis caracteres de quebra de linha ou espaços extras
          let cleanServiceAccountKey = serviceAccountJson.trim();
          
          // Se começar com aspas, remove elas (pode acontecer quando o JSON é colado como string)
          if (cleanServiceAccountKey.startsWith('"') && cleanServiceAccountKey.endsWith('"')) {
            cleanServiceAccountKey = cleanServiceAccountKey.slice(1, -1);
          }
          
          // Substitui escape de aspas por aspas normais
          cleanServiceAccountKey = cleanServiceAccountKey.replace(/\\"/g, '"');
          
          // Substitui escape de quebras de linha e outros caracteres especiais
          cleanServiceAccountKey = cleanServiceAccountKey.replace(/\\n/g, '\\n');
          cleanServiceAccountKey = cleanServiceAccountKey.replace(/\\r/g, '');
          cleanServiceAccountKey = cleanServiceAccountKey.replace(/\\t/g, '');
          
          // Remove caracteres de controle problemáticos
          cleanServiceAccountKey = cleanServiceAccountKey.replace(/[\x00-\x1F\x7F]/g, '');
          
          console.log('🔍 Verificando formato das credenciais...');
          
          const serviceAccount = JSON.parse(cleanServiceAccountKey);
          
          if (!serviceAccount.project_id) {
            throw new Error('project_id não encontrado nas credenciais');
          }
          
          if (!serviceAccount.type || serviceAccount.type !== 'service_account') {
            throw new Error('Tipo de credencial inválido. Deve ser "service_account"');
          }
          
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: `${serviceAccount.project_id}.appspot.com`
          });
          
          console.log('✅ Firebase Admin SDK inicializado com credenciais de ambiente!');
          console.log(`📁 Projeto: ${serviceAccount.project_id}`);
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse das credenciais de ambiente:', parseError.message);
          console.error('🔍 Verifique se o JSON das credenciais está válido e completo.');
          console.error('📋 Dica: O JSON deve começar com { e terminar com }');
          console.error('🔧 As credenciais devem ser o conteúdo completo do arquivo serviceAccountKey.json');
          process.exit(1);
        }
      } else {
        // Fallback para arquivo local
        const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
        
        if (!fs.existsSync(serviceAccountPath)) {
          console.log('❌ Nenhuma credencial Firebase encontrada.');
          console.log('📁 Variável FIREBASE_SERVICE_ACCOUNT_KEY não definida e arquivo serviceAccountKey.json não encontrado.');
          console.log('🔧 Configure a variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY com o conteúdo do arquivo JSON.');
          process.exit(1);
        }
        
        console.log('📁 Usando arquivo serviceAccountKey.json local...');
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: `${serviceAccount.project_id}.appspot.com`
        });
        
        console.log('✅ Firebase Admin SDK inicializado com arquivo local!');
      }
    }
    
    // Tenta diferentes variações do bucket
    const possibleBuckets = [
      `${admin.app().options.storageBucket}`,
      'app-teatrinho.firebasestorage.app',
      'app-teatrinho.appspot.com',
      `${admin.app().options.projectId}.appspot.com`,
      `${admin.app().options.projectId}.firebasestorage.app`,
      `gs://app-teatrinho.firebasestorage.app`,
      `gs://${admin.app().options.projectId}.appspot.com`,
      `gs://${admin.app().options.projectId}.firebasestorage.app`
    ];
    
    console.log('🪣 Conectando ao Firebase Storage...');
    
    for (const bucketName of possibleBuckets) {
      try {
        const bucket = admin.storage().bucket(bucketName);
        await bucket.getMetadata();
        console.log(`✅ Conectado com sucesso ao bucket: ${bucketName}`);
        return bucket;
      } catch (error) {
        // Continua tentando outros buckets sem mostrar erro
        continue;
      }
    }
    
    // Se nenhum bucket funcionou, cria arquivo de exemplo
    console.log('⚠️  Não foi possível conectar ao Firebase Storage.');
    console.log('📄 Gerando arquivo com dados de exemplo...');
    
    // Gera dados de exemplo
    const atividadesExemplo = criarDadosExemplo();
    return { isExample: true, atividades: atividadesExemplo };
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error.message);
    process.exit(1);
  }
}

/**
 * Carrega atividades existentes do arquivo JSON para preservar IDs
 */
function carregarAtividadesExistentes() {
  try {
    const outputPath = path.join(__dirname, '../client/src/data/atividades.json');
    if (fs.existsSync(outputPath)) {
      console.log('🔍 Carregando IDs existentes para preservação...');
      const conteudo = fs.readFileSync(outputPath, 'utf8');
      const atividades = JSON.parse(conteudo);
      
      // Cria mapa chave -> id
      const mapaIds = new Map();
      atividades.forEach(atividade => {
        const chave = `${atividade.categoria}/${atividade.arquivo}`;
        mapaIds.set(chave, {
          id: atividade.id,
          data: atividade.data
        });
      });
      
      console.log(`📋 ${mapaIds.size} IDs existentes carregados para preservação`);
      return mapaIds;
    }
  } catch (error) {
    console.log('⚠️  Erro ao carregar IDs existentes:', error.message);
  }
  
  return new Map();
}

/**
 * Torna um arquivo público e gera URL pública real
 */
async function tornarArquivoPublicoEGerarUrl(file, categoria, arquivo, bucketName) {
  try {
    // Torna o arquivo público
    await file.makePublic();
    
    // Gera URL pública real (sem token)
    const caminhoEncodificado = encodeURIComponent(`atividades/${categoria}/${arquivo}`);
    return `https://storage.googleapis.com/${bucketName}/atividades/${categoria}/${arquivo}`;
    
  } catch (error) {
    // Se falhar ao tornar público, usa URL assinada de longa duração
    console.log(`⚠️  Não foi possível tornar público ${categoria}/${arquivo}, usando URL assinada`);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2050' // URL válida por muito tempo
    });
    return signedUrl;
  }
}

/**
 * Cria dados de exemplo para demonstração
 */
function criarDadosExemplo() {
  const categorias = ['pre-escrita-tracado', 'coordenacao-motora', 'matematica-basica', 'formas-geometricas', 'alfabetizacao'];
  const atividades = [];
  const idsExistentes = carregarAtividadesExistentes();
  
  categorias.forEach(categoria => {
    for (let i = 1; i <= 3; i++) {
      const arquivo = `${i}.jpg`;
      const chave = `${categoria}/${arquivo}`;
      const dadosExistentes = idsExistentes.get(chave);
      
      atividades.push({
        id: dadosExistentes?.id || uuidv4(),
        ordem: i,
        data: dadosExistentes?.data || new Date().toISOString(),
        categoria: categoria,
        pasta: `atividades/${categoria}`,
        arquivo: arquivo,
        imagemUrl: `https://storage.googleapis.com/app-teatrinho.firebasestorage.app/atividades/${categoria}/${arquivo}`
      });
    }
  });
  
  return atividades;
}

/**
 * Percorre as pastas no Storage e identifica arquivos .jpg
 */
async function percorrerAtividades(bucket) {
  // Se for um bucket de exemplo, retorna os dados de exemplo
  if (bucket.isExample) {
    return bucket;
  }
  
  console.log('📁 Percorrendo estrutura de pastas no Firebase Storage...');
  
  try {
    // Carrega IDs existentes para preservação
    const idsExistentes = carregarAtividadesExistentes();
    
    // Lista todos os arquivos na pasta atividades/
    const [files] = await bucket.getFiles({ prefix: 'atividades/' });
    
    const atividades = [];
    const categorias = new Set();
    const bucketName = bucket.name;
    
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
      const chave = `${categoria}/${nomeArquivo}`;
      
      categorias.add(categoria);
      
      // Verifica se já existe ID para esta atividade
      const dadosExistentes = idsExistentes.get(chave);
      const atividadeId = dadosExistentes?.id || uuidv4();
      const dataAtividade = dadosExistentes?.data || new Date().toISOString();
      
      if (dadosExistentes) {
        console.log(`🔄 Preservando ID existente para ${categoria}/${nomeArquivo}`);
      }
      
      // Torna o arquivo público e gera URL pública real
      const imagemUrl = await tornarArquivoPublicoEGerarUrl(file, categoria, nomeArquivo, bucketName);
      
      // Cria objeto da atividade
      const atividade = {
        id: atividadeId,
        ordem: ordem,
        data: dataAtividade,
        categoria: categoria,
        pasta: `atividades/${categoria}`,
        arquivo: nomeArquivo,
        imagemUrl: imagemUrl
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
    
    let outputPath, resumo;
    
    if (resultado.isExample) {
      // Salva arquivo de exemplo
      outputPath = salvarArquivoJSON(resultado.atividades);
      const categorias = new Set(resultado.atividades.map(a => a.categoria));
      
      resumo = {
        totalCategorias: categorias.size,
        totalAtividades: resultado.atividades.length,
        isExample: true
      };
    } else {
      // Salva dados reais do Storage
      outputPath = salvarArquivoJSON(resultado.atividades);
      resumo = resultado;
    }
    
    // Exibe resumo
    console.log('\n📊 RESUMO DA EXECUÇÃO:');
    if (resumo.isExample) {
      console.log('⚠️  Dados de exemplo gerados (Storage não configurado)');
    }
    console.log(`📁 Total de categorias: ${resumo.totalCategorias}`);
    console.log(`📄 Total de atividades: ${resumo.totalAtividades}`);
    console.log(`💾 Arquivo salvo em: ${outputPath}`);
    
    if (resumo.isExample) {
      console.log('\n🔧 Para usar dados reais do Firebase Storage:');
      console.log('   1. Configure o Firebase Storage no projeto');
      console.log('   2. Faça upload das atividades na estrutura de pastas');
      console.log('   3. Execute o script novamente');
    }
    
    console.log('\n✅ Processo concluído com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro durante a execução:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executa o script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}