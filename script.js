let csvData = []; // Variável global que vai armazenar os dados do CSV

// Função para obter a data atual
function getCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    return `${day}/${month}`;
}

// Função para formatar o CSV e gerar um JSON
let input = document.querySelector('input[type="file"]');
input.addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        Papa.parse(file, {
            complete: function(results) {
                csvData = results.data; // Armazena os dados na variável global
            },
            header: true, // Se o seu CSV tem um cabeçalho, defina como true
            skipEmptyLines: true // Pula linhas vazias
        });
    }
});

// Função para contar os dados do CSV
function contagemDeDados(dadosCSV, dadosTopicoCSV) {
    const contagemDados = dadosCSV.reduce((acc, row) => {
        const data = row[dadosTopicoCSV];
        acc[data] = (acc[data] || 0) + 1;
        return acc;
    }, {});

    console.log('oie');
    console.log(contagemDados);
    console.log('end');
}

// Função para gerar o PDF
document.addEventListener('DOMContentLoaded', (event) => {
    const { jsPDF } = window.jspdf;

    window.generatePDF = function () {
        const input = document.getElementById('csvFile');
        if (input.files.length === 0) {
            alert("Please select a CSV file first.");
            return;
        }

        const file_name = input.files[0]['name'].replaceAll(' ', '_').replaceAll('__', '').slice(0, 35);
        
        const file = input.files[0];
        
        // Cria o documento PDF
        const doc = new jsPDF();

        // Capa do PDF
        var data_pesquisa = file_name.split('_')[3].replaceAll('-', '/');

        doc.setFillColor("#008FFF");
        doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F'); // Desenha retângulo para o fundo

        doc.setFontSize(36);
        doc.setTextColor("#FFFFFF");
        doc.text("Relatório de Pesquisa", doc.internal.pageSize.width / 2, 40, { align: "center" });
        doc.text("Mercado: " + file_name.split('_')[2], doc.internal.pageSize.width / 2, 60, { align: "center" });
        doc.text("Data: " + data_pesquisa + " - " + getCurrentDate(), doc.internal.pageSize.width / 2, 80, { align: "center" });
        doc.text("Respondentes: " + csvData.length, doc.internal.pageSize.width / 2, 100, { align: "center" });

        // Página de índices
        doc.addPage();

        doc.setFontSize(24);
        doc.setTextColor("#008FFF");

        doc.text("Índices", 20, 40);

        doc.setFontSize(18);
        doc.text("Preferência (Profilling)", 20, 60);
        doc.text("Preferências dos viajantes", 20, 70);
        doc.text("Visão Geral", 20, 80);

        doc.text("Motivação de viagem dos clientes", 20, 95);
        doc.text("Principais motivos para os respondentes viajarem", 20, 105);

        doc.text("Frequência de viagem dos respondentes", 20, 120);
        doc.text("Frequência com oque os respondentes viajam", 20, 130);

        doc.text("Motivos do por que não viajarem conosco", 20, 145);
        doc.text("Porque os clientes deixam de comprar conosco", 20, 155);

        doc.text("Motivos da escolha dos concorrentes", 20, 170);
        doc.text("O que os concorrentes oferecem que atrai os respondentes", 20, 180);

        doc.text("Quais são os principais concorrentes", 20, 195);
        doc.text("Quais outras empresas de ônibus os respondentes escolhem", 20, 205);
    
        doc.text("Satisfação quanto aos nossos serviços", 20, 220);
        doc.text("Satisfação dos respondentes com os nossos serviços", 20, 230);
    
        doc.text("Viajariam novamente conosco", 20, 245);
        doc.text("Qual a chance de viajar conosco novamente", 20, 255);

        // Páginas de Preferências (Profilling)
        doc.addPage();

        doc.setTextColor("#black");
        doc.text("Preferências (Profilling)", doc.internal.pageSize.width / 2, 40, { align: "center" });

        // Contagem dos votos
        contagemDeDados(csvData, 'Qual o seu gênero?');

        // Generate PDF as Data URL
        const pdfDataUrl = doc.output('dataurlstring');

        // Log the PDF URL to the console
        console.log(pdfDataUrl);

        // Preview the PDF in a new window/tab
        const pdfWindow = window.open("");
        pdfWindow.document.write("<iframe width='100%' height='100%' src='" + pdfDataUrl + "'></iframe>");

        // Gera o PDF
        // doc.save(file_name + '.pdf');
    }
});
