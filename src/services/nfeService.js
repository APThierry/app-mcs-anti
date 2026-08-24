// ====================================================================
// MOTOR DE VALIDAÇÃO E PROCESSAMENTO DE NOTA FISCAL (NFC-e SEFAZ-MG)
// ====================================================================

// Mapeamento de CNPJs e Lojas do Monte Carmo Shopping
export const SHOPPING_STORES_MAP = {
  '12345678000101': { name: 'Burger King', category: 'Alimentação' },
  '12345678000102': { name: 'Cacau Show', category: 'Alimentação' },
  '12345678000103': { name: 'BoliXe Monte Carmo', category: 'Diversão' },
  '12345678000104': { name: 'Cineart Monte Carmo', category: 'Diversão' },
  '12345678000105': { name: 'Lojas Renner', category: 'Vestuário' },
  '12345678000106': { name: 'Artesanato do Japa', category: 'Alimentação' },
  '12345678000107': { name: 'Academia Plataforma', category: 'Academia' },
  '12345678000108': { name: 'Air Jump', category: 'Diversão' }
};

export const nfeService = {
  /**
   * Calcula o Dígito Verificador (DV) da Chave de Acesso pelo algoritmo Módulo 11 (Padrão SEFAZ)
   */
  calculateModulo11(chave43) {
    if (!chave43 || chave43.length !== 43) return null;

    let soma = 0;
    let peso = 2;

    for (let i = chave43.length - 1; i >= 0; i--) {
      const digito = parseInt(chave43.charAt(i), 10);
      soma += digito * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }

    const resto = soma % 11;
    const dv = 11 - resto;

    if (dv === 0 || dv === 10 || dv === 11) {
      return 0;
    }
    return dv;
  },

  /**
   * Valida se a chave de 44 dígitos possui um Dígito Verificador matematicamente correto
   */
  isValidModulo11(chave44) {
    if (!chave44 || chave44.length !== 44) return false;
    const chave43 = chave44.substring(0, 43);
    const dvInformado = parseInt(chave44.charAt(43), 10);
    const dvCalculado = this.calculateModulo11(chave43);
    return dvInformado === dvCalculado;
  },

  /**
   * Extrai a Chave de Acesso de 44 dígitos de uma URL de QR Code da SEFAZ
   * Padrão SEFAZ-MG: http://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=312608...|2|1|1|...
   */
  extractKeyFromQrCode(qrTextOrUrl) {
    if (!qrTextOrUrl) return null;

    const text = qrTextOrUrl.trim();

    // Se já for a chave pura de 44 dígitos
    const cleanDigits = text.replace(/\D/g, '');
    if (cleanDigits.length === 44 && (text.length === 44 || !text.includes('http'))) {
      return cleanDigits;
    }

    // Se for URL com parâmetro "p=" (Padrão Nacional e SEFAZ-MG)
    if (text.includes('p=')) {
      const urlParams = text.split('p=')[1];
      if (urlParams) {
        const parts = urlParams.split('|');
        const candidate = parts[0].replace(/\D/g, '');
        if (candidate.length >= 44) {
          return candidate.substring(0, 44);
        }
      }
    }

    // Se for URL com parâmetro "chNFe="
    if (text.includes('chNFe=')) {
      const candidate = text.split('chNFe=')[1].split('&')[0].replace(/\D/g, '');
      if (candidate.length === 44) {
        return candidate;
      }
    }

    // Se encontrar qualquer sequência contínua de 44 dígitos no texto
    const regexMatch = text.match(/\b\d{44}\b/);
    if (regexMatch) {
      return regexMatch[0];
    }

    return null;
  },

  /**
   * Decompõe a chave de acesso em campos estruturados
   */
  parseAccessKey(chave44) {
    if (!chave44 || chave44.length !== 44) return null;

    const ufCode = chave44.substring(0, 2);
    const ano = '20' + chave44.substring(2, 4);
    const mes = chave44.substring(4, 6);
    const cnpj = chave44.substring(6, 20);
    const modelo = chave44.substring(20, 22);
    const serie = chave44.substring(22, 25);
    const numero = chave44.substring(25, 34);
    const tipoEmissao = chave44.substring(34, 35);
    const codigo = chave44.substring(35, 43);
    const dv = chave44.substring(43, 44);

    return {
      chaveCompleta: chave44,
      ufCode,
      ufNome: ufCode === '31' ? 'Minas Gerais (MG)' : `Outro Estado (UF ${ufCode})`,
      dataEmissao: `${mes}/${ano}`,
      cnpj,
      cnpjFormatado: cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
      modelo: modelo === '65' ? 'NFC-e (Consumidor)' : (modelo === '55' ? 'NF-e (Mercantil)' : `Modelo ${modelo}`),
      serie,
      numero: parseInt(numero, 10).toString(),
      tipoEmissao: tipoEmissao === '1' ? 'Normal' : 'Contingência',
      dv
    };
  },

  /**
   * Valida todas as regras de negócio e anti-fraude para aceitação da nota no shopping
   */
  validateReceipt(chaveRaw, existingReceipts = []) {
    const chave = chaveRaw.replace(/\D/g, '');

    // 1. Validação de tamanho
    if (chave.length !== 44) {
      return {
        isValid: false,
        error: `A Chave de Acesso deve conter exatamente 44 dígitos (você digitou ${chave.length}).`
      };
    }

    // 2. Validação Matemática Módulo 11
    if (!this.isValidModulo11(chave)) {
      return {
        isValid: false,
        error: 'Chave de Acesso inválida! O dígito verificador da SEFAZ não confere (erro de digitação).'
      };
    }

    const parsed = this.parseAccessKey(chave);

    // 3. Validação de UF (Minas Gerais = 31)
    if (parsed.ufCode !== '31') {
      return {
        isValid: false,
        error: `Nota emitida fora de Minas Gerais (${parsed.ufNome}). O Monte Carmo Shopping só aceita notas fiscais de Betim/MG.`
      };
    }

    // 4. Validação de Unicidade (Anti-Duplicação)
    const isDuplicate = existingReceipts.some(r => r.access_key_44 === chave || r.id === `NF-${chave.substring(0, 6)}`);
    if (isDuplicate) {
      return {
        isValid: false,
        error: 'Esta nota fiscal já foi cadastrada anteriormente no sistema por você ou outro cliente.'
      };
    }

    // 5. Identificação da Loja pelo CNPJ ou Simulação de Loja do Shopping
    const storeInfo = SHOPPING_STORES_MAP[parsed.cnpj] || {
      name: 'Loja Participante Monte Carmo',
      category: 'Geral'
    };

    // Gera valor simulado consistente baseado na chave para demonstração
    const seed = parseInt(chave.substring(28, 34), 10) || 150;
    const amount = ((seed % 350) + 49.90).toFixed(2);
    const points = Math.floor(parseFloat(amount));

    return {
      isValid: true,
      storeName: storeInfo.name,
      category: storeInfo.category,
      amount: parseFloat(amount),
      pointsEarned: points,
      parsedDetails: parsed
    };
  },

  /**
   * Gera uma Chave de Acesso 100% Válida da SEFAZ-MG com Módulo 11 perfeito para testes
   */
  generateSampleValidKey(storeCnpj = '12345678000101') {
    const uf = '31'; // MG
    const now = new Date();
    const ano = String(now.getFullYear()).substring(2); // 26
    const mes = String(now.getMonth() + 1).padStart(2, '0'); // 08
    const cnpj = storeCnpj.padEnd(14, '0').substring(0, 14);
    const mod = '65'; // NFC-e
    const serie = '001';
    const num = String(Math.floor(100000000 + Math.random() * 900000000)).substring(0, 9);
    const tpEmis = '1';
    const cNF = String(Math.floor(10000000 + Math.random() * 90000000)).substring(0, 8);

    const chave43 = `${uf}${ano}${mes}${cnpj}${mod}${serie}${num}${tpEmis}${cNF}`;
    const dv = this.calculateModulo11(chave43);
    return `${chave43}${dv}`;
  }
};
