document.addEventListener('DOMContentLoaded', () => {
  const page = getCurrentPage();

  if (page !== 'index.html') {
    verificarSessao();
  }

  switch (page) {
    case 'index.html':
      initLoginPage();
      break;
    case 'dashboard.html':
      initDashboardPage();
      break;
    case 'produtos.html':
      initProdutosPage();
      break;
    case 'cadastro.html':
      initCadastroPage();
      break;
    case 'movimentacao.html':
      initMovimentacaoPage();
      break;
    default:
      break;
  }
});

const STORAGE_KEYS = {
  auth: 'stockflow-demo-auth',
  data: 'stockflow-demo-data'
};

function getCurrentPage() {
  return location.pathname.split('/').pop() || 'index.html';
}

function showMessage(elementId, text, type = 'success') {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = text;
  element.className = 'message ' + type;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));
}

function formatDateTime(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getDemoData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.data);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn('Não foi possível ler os dados locais.', error);
  }

  const demoData = {
    usuarios: [
      {
        id: 1,
        nome: 'Administrador',
        email: 'admin@stockflow.com',
        senha: 'admin123'
      }
    ],
    produtos: [
      {
        id: 1,
        nome: 'Café Torrado',
        codigo: 'PROD-1001',
        categoria: 'Alimentos',
        valor_unitario: 18.5,
        quantidade: 24,
        estoque_minimo: 10
      },
      {
        id: 2,
        nome: 'Detergente',
        codigo: 'PROD-1002',
        categoria: 'Limpeza',
        valor_unitario: 12,
        quantidade: 8,
        estoque_minimo: 10
      },
      {
        id: 3,
        nome: 'Água Mineral',
        codigo: 'PROD-1003',
        categoria: 'Bebidas',
        valor_unitario: 4.5,
        quantidade: 32,
        estoque_minimo: 12
      }
    ],
    movimentacoes: [
      {
        id: 1,
        produto_id: 1,
        nome: 'Café Torrado',
        tipo: 'entrada',
        quantidade: 12,
        data_hora: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        produto_id: 2,
        nome: 'Detergente',
        tipo: 'saida',
        quantidade: 4,
        data_hora: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 3,
        produto_id: 3,
        nome: 'Água Mineral',
        tipo: 'entrada',
        quantidade: 18,
        data_hora: new Date(Date.now() - 259200000).toISOString()
      }
    ]
  };

  localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(demoData));
  return demoData;
}

function setDemoData(data) {
  localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(data));
}

function setSession(user) {
  localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify({
    logado: true,
    usuario: {
      id: user.id,
      nome: user.nome,
      email: user.email
    }
  }));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.auth);
}

function getAuthenticatedUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function verificarSessao() {
  const auth = getAuthenticatedUser();

  if (!auth || !auth.logado) {
    window.location.href = 'index.html';
    return;
  }

  const userNameElement = document.getElementById('usuarioLogado');
  if (userNameElement) {
    userNameElement.textContent = auth.usuario.nome.split(' ')[0];
  }

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  }
}

function initLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      showMessage('loginMessage', 'Informe e-mail e senha.', 'error');
      return;
    }

    const data = getDemoData();
    const usuario = data.usuarios.find((item) => {
      return item.email.toLowerCase() === email.toLowerCase() && item.senha === password;
    });

    if (!usuario) {
      showMessage('loginMessage', 'Credenciais inválidas. Use admin@stockflow.com / admin123', 'error');
      return;
    }

    setSession(usuario);
    showMessage('loginMessage', 'Login realizado com sucesso!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  });
}

function initDashboardPage() {
  const data = getDemoData();
  const produtos = data.produtos || [];
  const movimentacoes = (data.movimentacoes || []).sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

  const totalProdutos = produtos.length;
  const valorEstoque = produtos.reduce((total, produto) => {
    return total + Number(produto.valor_unitario) * Number(produto.quantidade);
  }, 0);

  const produtosBaixo = produtos.filter((produto) => Number(produto.quantidade) <= Number(produto.estoque_minimo)).length;
  const estoqueDisponivel = produtos.reduce((total, produto) => total + Number(produto.quantidade), 0);

  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 7);

  const entradasSeteDias = movimentacoes.filter((item) => item.tipo === 'entrada' && new Date(item.data_hora) >= dataLimite).reduce((total, item) => total + Number(item.quantidade), 0);
  const saidasSeteDias = movimentacoes.filter((item) => item.tipo === 'saida' && new Date(item.data_hora) >= dataLimite).reduce((total, item) => total + Number(item.quantidade), 0);

  document.getElementById('totalProdutos').textContent = totalProdutos;
  document.getElementById('valorEstoque').textContent = formatCurrency(valorEstoque);
  document.getElementById('produtosBaixo').textContent = produtosBaixo;
  document.getElementById('estoqueDisponivel').textContent = estoqueDisponivel;
  document.getElementById('entradasSeteDias').textContent = entradasSeteDias;
  document.getElementById('saidasSeteDias').textContent = saidasSeteDias;

  renderMovimentosRecentes(movimentacoes.slice(0, 6));
  renderProdutosAtencao(produtos.filter((produto) => Number(produto.quantidade) <= Number(produto.estoque_minimo)));
}

function renderMovimentosRecentes(movimentos) {
  const container = document.getElementById('tabelaMovimentos');
  if (!container) return;

  if (!movimentos.length) {
    container.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhuma movimentação registrada.</td></tr>';
    return;
  }

  container.innerHTML = movimentos.map((item) => {
    const tipo = item.tipo === 'entrada' ? 'Entrada' : 'Saída';
    const badgeClass = item.tipo === 'entrada' ? 'status-normal' : 'status-critico';

    return `
      <tr>
        <td>${formatDateTime(item.data_hora)}</td>
        <td>${item.nome}</td>
        <td><span class="status-badge ${badgeClass}">${tipo}</span></td>
        <td>${item.quantidade}</td>
      </tr>
    `;
  }).join('');
}

function renderProdutosAtencao(produtos) {
  const container = document.getElementById('listaProdutosAtencao');
  if (!container) return;

  if (!produtos.length) {
    container.innerHTML = '<li class="empty-state">Nenhum produto precisa de atenção.</li>';
    return;
  }

  container.innerHTML = produtos.map((item) => {
    const statusClass = Number(item.quantidade) === 0 ? 'status-critico' : 'status-baixo';
    const statusText = Number(item.quantidade) === 0 ? 'Estoque crítico' : 'Baixo estoque';

    return `
      <li>
        <span>${item.nome}</span>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </li>
    `;
  }).join('');
}

function initProdutosPage() {
  const tableBody = document.getElementById('produtosTableBody');
  const searchInput = document.getElementById('pesquisaProduto');
  let listaProdutos = [];

  function carregarProdutos() {
    const data = getDemoData();
    listaProdutos = data.produtos || [];
    renderizarTabela(listaProdutos);
  }

  function renderizarTabela(produtos) {
    if (!tableBody) return;

    if (!produtos.length) {
      tableBody.innerHTML = '<tr><td colspan="8" class="empty-state">Nenhum produto encontrado.</td></tr>';
      return;
    }

    tableBody.innerHTML = produtos.map((produto) => {
      const status = obterStatus(produto);

      return `
        <tr>
          <td>${produto.nome}</td>
          <td>${produto.codigo}</td>
          <td>${formatCurrency(produto.valor_unitario)}</td>
          <td>${produto.categoria}</td>
          <td>${produto.quantidade}</td>
          <td>${produto.estoque_minimo}</td>
          <td><span class="status-badge ${status.className}">${status.label}</span></td>
          <td>
            <div class="action-group">
              <button class="icon-btn edit" data-action="editar" data-id="${produto.id}">Editar</button>
              <button class="icon-btn delete" data-action="excluir" data-id="${produto.id}">Excluir</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tableBody.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === 'editar') {
          window.location.href = `cadastro.html?id=${id}`;
          return;
        }

        if (action === 'excluir') {
          if (!confirm('Deseja realmente excluir este produto?')) {
            return;
          }

          const data = getDemoData();
          data.produtos = data.produtos.filter((produto) => Number(produto.id) !== id);
          data.movimentacoes = data.movimentacoes.filter((movimento) => Number(movimento.produto_id) !== id);
          setDemoData(data);
          alert('Produto excluído com sucesso.');
          carregarProdutos();
        }
      });
    });
  }

  searchInput?.addEventListener('input', (event) => {
    const termo = event.target.value.toLowerCase();
    const filtrados = listaProdutos.filter((produto) => {
      return produto.nome.toLowerCase().includes(termo) || produto.codigo.toLowerCase().includes(termo);
    });
    renderizarTabela(filtrados);
  });

  carregarProdutos();
}

function obterStatus(produto) {
  if (Number(produto.quantidade) === 0) {
    return { label: 'Estoque crítico', className: 'status-critico' };
  }

  if (Number(produto.quantidade) <= Number(produto.estoque_minimo)) {
    return { label: 'Baixo estoque', className: 'status-baixo' };
  }

  return { label: 'Normal', className: 'status-normal' };
}

function initCadastroPage() {
  const form = document.getElementById('produtoForm');
  const codigoInput = document.getElementById('codigoProduto');

  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');

  if (editId) {
    const data = getDemoData();
    const produto = data.produtos.find((item) => Number(item.id) === Number(editId));

    if (!produto) {
      alert('Produto não encontrado.');
      window.location.href = 'produtos.html';
      return;
    }

    form.idProduto.value = produto.id;
    form.nome.value = produto.nome;
    form.codigo.value = produto.codigo;
    form.categoria.value = produto.categoria;
    form.valor_unitario.value = produto.valor_unitario;
    form.quantidade.value = produto.quantidade;
    form.estoque_minimo.value = produto.estoque_minimo;
    document.getElementById('tituloFormulario').textContent = 'Editar produto';
    document.getElementById('btnSalvarProduto').textContent = 'Salvar alterações';
  } else {
    gerarCodigoProduto();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const payload = {
      id: form.idProduto.value || null,
      nome: form.nome.value.trim(),
      codigo: form.codigo.value.trim(),
      categoria: form.categoria.value,
      valor_unitario: Number(form.valor_unitario.value),
      quantidade: Number(form.quantidade.value),
      estoque_minimo: Number(form.estoque_minimo.value)
    };

    if (!payload.nome || !payload.categoria || !payload.valor_unitario || Number.isNaN(payload.quantidade) || Number.isNaN(payload.estoque_minimo)) {
      showMessage('cadastroMessage', 'Preencha todos os campos corretamente.', 'error');
      return;
    }

    if (payload.valor_unitario <= 0 || payload.quantidade < 0 || payload.estoque_minimo < 0) {
      showMessage('cadastroMessage', 'Valores inválidos. Verifique o preço, quantidade e estoque mínimo.', 'error');
      return;
    }

    const data = getDemoData();

    if (payload.id) {
      const index = data.produtos.findIndex((item) => Number(item.id) === Number(payload.id));
      if (index >= 0) {
        data.produtos[index] = { ...data.produtos[index], ...payload };
      }
    } else {
      payload.id = Date.now();
      data.produtos.push(payload);
    }

    setDemoData(data);
    showMessage('cadastroMessage', payload.id ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!', 'success');
    form.reset();
    gerarCodigoProduto();

    setTimeout(() => {
      window.location.href = 'produtos.html';
    }, 700);
  });

  function gerarCodigoProduto() {
    if (!codigoInput) return;
    codigoInput.value = 'PROD-' + String(Math.floor(Math.random() * 9000) + 1000);
  }
}

function initMovimentacaoPage() {
  const form = document.getElementById('movimentacaoForm');
  const selectProduto = document.getElementById('produtoId');

  if (!form) return;

  function carregarProdutos() {
    const data = getDemoData();
    const produtos = data.produtos || [];

    if (!produtos.length) {
      selectProduto.innerHTML = '<option value="">Nenhum produto cadastrado</option>';
      return;
    }

    selectProduto.innerHTML = '<option value="">Selecione um produto</option>' + produtos.map((produto) => {
      return `<option value="${produto.id}">${produto.nome} (${produto.quantidade} em estoque)</option>`;
    }).join('');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const payload = {
      produto_id: Number(form.produtoId.value),
      tipo: form.tipo.value,
      quantidade: Number(form.quantidade.value)
    };

    if (!payload.produto_id || !payload.tipo || !payload.quantidade || payload.quantidade <= 0) {
      showMessage('movimentacaoMessage', 'Selecione um produto, informe o tipo e uma quantidade válida.', 'error');
      return;
    }

    const data = getDemoData();
    const produto = data.produtos.find((item) => Number(item.id) === Number(payload.produto_id));

    if (!produto) {
      showMessage('movimentacaoMessage', 'Produto não encontrado.', 'error');
      return;
    }

    if (payload.tipo === 'saida' && payload.quantidade > Number(produto.quantidade)) {
      showMessage('movimentacaoMessage', 'Não há quantidade suficiente em estoque para essa saída.', 'error');
      return;
    }

    if (payload.tipo === 'entrada') {
      produto.quantidade = Number(produto.quantidade) + payload.quantidade;
    } else {
      produto.quantidade = Number(produto.quantidade) - payload.quantidade;
    }

    data.movimentacoes.unshift({
      id: Date.now(),
      produto_id: produto.id,
      nome: produto.nome,
      tipo: payload.tipo,
      quantidade: payload.quantidade,
      data_hora: new Date().toISOString()
    });

    setDemoData(data);
    showMessage('movimentacaoMessage', 'Movimentação registrada com sucesso!', 'success');
    form.reset();
    carregarProdutos();
  });

  carregarProdutos();
}
