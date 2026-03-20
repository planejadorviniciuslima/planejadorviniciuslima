/**
 * Testes unitários para a função decide() do quiz
 * Execução: node quiz.test.js
 * Sem dependências externas.
 */

// ─── Cópia exata da função decide() de quiz_latest.html ───────────────────────
// ATENÇÃO: se a lógica do quiz mudar, atualizar aqui também.
function decide(r) {
  const highRenda   = r.renda  === 'high';
  const worriedDebt = r.divida === 'yes';
  const organized   = r.org    === 'yes';

  const allStrong = (
    !worriedDebt &&
    r.org           === 'yes' &&
    r.aposentadoria === 'yes' &&
    r.protecao      === 'yes' &&
    (r.investimentos === 'yes' || r.investimentos === 'structured')
  );

  if (allStrong)                 return 'EXCELENTE';
  if (highRenda && worriedDebt)  return 'MENTORIA';
  if (!highRenda && worriedDebt) return 'GUIA_N1';
  if (!worriedDebt && !organized) return 'PLANILHA';
  return 'GUIA_N2';
}

// ─── Runner ───────────────────────────────────────────────────────────────────
let pass = 0, fail = 0;

function test(name, actual, expected) {
  if (actual === expected) {
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    pass++;
  } else {
    console.error(`  \x1b[31m✗\x1b[0m ${name}`);
    console.error(`      esperado: "${expected}"`);
    console.error(`      recebeu:  "${actual}"`);
    fail++;
  }
}

// Perfil base "perfeito" — usado para derivar casos de EXCELENTE
const perfeito = {
  renda: 'high', divida: 'no', org: 'yes',
  aposentadoria: 'yes', protecao: 'yes', investimentos: 'yes'
};

// ─── EXCELENTE ────────────────────────────────────────────────────────────────
console.log('\nEXCELENTE');
test(
  'sem dívidas + todos os pilares fortes (investimentos=yes)',
  decide({ ...perfeito }),
  'EXCELENTE'
);
test(
  'sem dívidas + todos os pilares fortes (investimentos=structured)',
  decide({ ...perfeito, investimentos: 'structured' }),
  'EXCELENTE'
);
test(
  'dívida parcial (não preocupante) + todos os pilares fortes',
  decide({ ...perfeito, divida: 'partial' }),
  'EXCELENTE'
);
test(
  'renda low + todos os pilares fortes → ainda EXCELENTE (renda não entra no allStrong)',
  decide({ ...perfeito, renda: 'low' }),
  'EXCELENTE'
);

// ─── MENTORIA ─────────────────────────────────────────────────────────────────
console.log('\nMENTORIA');
test(
  'renda high + dívidas preocupantes',
  decide({ ...perfeito, divida: 'yes', org: 'no' }),
  'MENTORIA'
);
test(
  'renda high + dívidas preocupantes + resto fraco',
  decide({ renda: 'high', divida: 'yes', org: 'no', aposentadoria: 'no', protecao: 'no', investimentos: 'no' }),
  'MENTORIA'
);
test(
  'renda high + dívidas preocupantes mesmo com org=yes (worriedDebt bloqueia allStrong)',
  decide({ ...perfeito, divida: 'yes' }),
  'MENTORIA'
);

// ─── GUIA_N1 ──────────────────────────────────────────────────────────────────
console.log('\nGUIA_N1');
test(
  'renda low + dívidas preocupantes',
  decide({ renda: 'low', divida: 'yes', org: 'no', aposentadoria: 'no', protecao: 'no', investimentos: 'no' }),
  'GUIA_N1'
);
test(
  'renda low + dívidas preocupantes + org=yes (worriedDebt tem prioridade)',
  decide({ ...perfeito, renda: 'low', divida: 'yes' }),
  'GUIA_N1'
);

// ─── PLANILHA ─────────────────────────────────────────────────────────────────
console.log('\nPLANILHA');
test(
  'sem dívidas + sem organização (org=no)',
  decide({ renda: 'high', divida: 'no', org: 'no', aposentadoria: 'no', protecao: 'no', investimentos: 'no' }),
  'PLANILHA'
);
test(
  'sem dívidas + organização parcial (org=partial)',
  decide({ renda: 'high', divida: 'no', org: 'partial', aposentadoria: 'yes', protecao: 'yes', investimentos: 'yes' }),
  'PLANILHA'
);
test(
  'dívida parcial (não preocupante) + sem organização',
  decide({ renda: 'high', divida: 'partial', org: 'no', aposentadoria: 'no', protecao: 'no', investimentos: 'no' }),
  'PLANILHA'
);
test(
  'dívida parcial + organização parcial',
  decide({ renda: 'low', divida: 'partial', org: 'partial', aposentadoria: 'no', protecao: 'no', investimentos: 'no' }),
  'PLANILHA'
);

// ─── GUIA_N2 ──────────────────────────────────────────────────────────────────
console.log('\nGUIA_N2');
test(
  'sem dívidas + organizado, mas aposentadoria fraca (não allStrong)',
  decide({ ...perfeito, aposentadoria: 'no' }),
  'GUIA_N2'
);
test(
  'sem dívidas + organizado, mas proteção fraca',
  decide({ ...perfeito, protecao: 'partial' }),
  'GUIA_N2'
);
test(
  'sem dívidas + organizado, mas investimentos fracos',
  decide({ ...perfeito, investimentos: 'partial' }),
  'GUIA_N2'
);
test(
  'dívida parcial + organizado (não allStrong pois investimentos=partial)',
  decide({ renda: 'low', divida: 'partial', org: 'yes', aposentadoria: 'partial', protecao: 'no', investimentos: 'partial' }),
  'GUIA_N2'
);

// ─── Casos de borda ───────────────────────────────────────────────────────────
console.log('\nCasos de borda');
test(
  'EXCELENTE tem prioridade sobre qualquer outra regra (allStrong é verificado primeiro)',
  decide({ ...perfeito, renda: 'low', divida: 'no' }),
  'EXCELENTE'
);
test(
  'MENTORIA tem prioridade sobre GUIA_N2 quando renda=high e divida=yes',
  decide({ renda: 'high', divida: 'yes', org: 'yes', aposentadoria: 'yes', protecao: 'yes', investimentos: 'yes' }),
  'MENTORIA'
);

// ─── Resultado ───────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
if (fail === 0) {
  console.log(`\x1b[32m✓ Todos os ${pass} testes passaram.\x1b[0m\n`);
} else {
  console.error(`\x1b[31m✗ ${fail} teste(s) falharam, ${pass} passaram.\x1b[0m\n`);
  process.exit(1);
}
