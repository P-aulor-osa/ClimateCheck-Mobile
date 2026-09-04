// busca do botão no formulário HTML
const botaoBusca = document.getElementById("buscar");
const campoCidade = document.getElementById("cidade");
const resultado = document.getElementById("resultado");

// ============================================
// CONFIGURAÇÃO DA API — Open-Meteo (não exige chave)
// ============================================

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const CLIMA_URL = "https://api.open-meteo.com/v1/forecast";


// ligação do click do botão com a função de busca do clima
botaoBusca.addEventListener("click", buscarClima);

// Permite também pesquisar pressionando Enter
campoCidade.addEventListener("keydown", function(evento) {
  if (evento.key === "Enter") {
    buscarClima();
  }
});

// MELHORIA 1: Função para interpretar o código do clima e retornar uma descrição amigável

function interpretarClima(codigo) {
    switch (codigo) {
        case 0:
            return "Céu limpo ☀️";

        case 1:
        case 2:
        case 3:
            return "Parcialmente nublado ⛅";

        case 45:
        case 48:
            return "Neblina 🌫️";

        case 51:
        case 53:
        case 55:
            return "Garoa 🌦️";

        case 61:
        case 63:
        case 65:
            return "Chuva 🌧️";

        case 71:
        case 73:
        case 75:
            return "Neve ❄️";

        case 80:
        case 81:
        case 82:
            return "Pancadas de chuva 🌧️";

        case 95:
            return "Trovoada ⛈️";

        case 96:
        case 99:
            return "Trovoada com granizo ⛈️";

        default:
            return "Condição desconhecida";
    }
}

function classificarTemperatura(temperatura) {
    if (temperatura <= 10) {
        return "Frio 🥶";
    } else if (temperatura <= 20) {
        return "Ameno 🌤️";
    } else if (temperatura <= 30) {
        return "Quente ☀️";
    } else {
        return "Muito quente 🔥";
    }
}


//função executada a cada clique do botão
function buscarClima() {

  // .value pega o que o usuário digitou
  // .trim() remove espaços extras no início/fim
  const cidade = campoCidade.value.trim();

  console.log("Cidade digitada:", cidade);

  if (cidade === "") {
  alert("Digite o nome de uma cidade.");
  return;
  }
  

// 1) Descobre a latitude e a longitude da cidade digitada
const urlBusca =
  `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
  `&count=1&language=pt&format=json`;

fetch(urlBusca)
  .then(resposta => resposta.json())
  .then(dadosCidade => {
    const { latitude, longitude } = dadosCidade.results[0];
    

    // 2) Usa a latitude e a longitude para consultar o clima
    const urlClima =
      `${CLIMA_URL}?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m` +
      `,wind_speed_10m,weather_code`;

    return fetch(urlClima);
  })
  .then(resposta => resposta.json())
  .then(dadosClima => {
    console.log(dadosClima);

// Variáveis para armazenar os dados da API de clima

   
    const temperatura = dadosClima.current.temperature_2m;
    const umidade = dadosClima.current.relative_humidity_2m;
    const vento = dadosClima.current.wind_speed_10m;
    const codigoClima = dadosClima.current.weather_code;

  //MELHORIA 2: Adição de uma função de última atualização, mostrando a hora e data da consulta do clima
    const horario = dadosClima.current.time;
    const condicao = interpretarClima(dadosClima.current.weather_code);

    const dataHora = new Date(horario);
    const dataFormatada = dataHora.toLocaleDateString("pt-BR");
    const horaFormatada = dataHora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const horaAtual = `${dataFormatada} ${horaFormatada}`;

    const classificacao = classificarTemperatura(temperatura);

    // Exibe os dados no console para depuração

    console.log("Temperatura:", temperatura);
    console.log("Umidade:", umidade);
    console.log("Vento:", vento);
    console.log("Código do clima:", codigoClima);

    // Atualiza o conteúdo da seção de resultados com os dados do clima

  resultado.innerHTML = `

  <div class="card-clima">
    <h2>${cidade}</h2>

    <p>
      Temperatura:
      <strong>${temperatura} °C</strong>
    </p>

    <p>
      Condição do Clima:
      <strong>${condicao}</strong>
    </p>

    <p>
    Classificação:
    <strong>${classificacao}</strong>
</p>

    <p>
      Umidade:
      <strong>${umidade}%</strong>
    </p>

    <p>
      Vento:
      <strong>${vento} km/h</strong>
    </p>

    <p>
    Atualizado em:
    <strong>${horaAtual}</strong>
    </p>

  </div>


`;
    
  });

//Inicialização da variável URL, e sistema de exibição de erro "Cidade não encontrada" caso a cidade digitada não seja localizada na API de geolocalização
  
const url = `${GEO_URL}?name=${encodeURIComponent(campoCidade.value)}&count=1&language=pt&format=json`;

fetch(url)
  .then(resposta => {

    // Verifica se o servidor respondeu com sucesso
    if (!resposta.ok) {
      throw new Error("Não foi possível consultar a cidade.");
    }

    // Converte o corpo da resposta para JSON
    return resposta.json();
  })
  .then(dados => { 
      if (!dados.results) {
        throw new Error("Cidade não encontrada.");
      }
      console.log(dados);
    })
  .catch(erro => {
    resultado.innerHTML = `<p class="erro">Erro: ${erro.message}</p>`;
  });

}

// ============================================
// REGISTRO DO SERVICE WORKER PARA FUNCIONAMENTO OFFLINE
// ============================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => {
        console.log("Service Worker registrado com sucesso.");
      })
      .catch((erro) => {
        console.log("Falha ao registrar o Service Worker:", erro);
      });
  });
}