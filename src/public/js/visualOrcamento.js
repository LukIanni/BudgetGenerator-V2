const container = document.getElementById('orcamento-dados');
if (dados) {
  container.innerHTML = `<pre class="slide-in">${JSON.stringify(dados, null, 2)}</pre>`;
} else {
  container.innerHTML = "<p class='slide-in'>Nenhum orçamento encontrado.</p>";
}