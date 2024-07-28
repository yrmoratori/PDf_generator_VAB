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

// Função para contar e ordenar os dados do CSV, incluindo porcentagem dos votos
function contagemDeDados(dadosCSV, dadosTopicoCSV) {
    const contagemDados = dadosCSV.reduce((acc, row) => {
        // Verifica se o dado não é vazio ou undefined
        if (row[dadosTopicoCSV]) {
            // Divide a string por vírgula e processa cada parte
            const splitData = row[dadosTopicoCSV].split(',');
            splitData.forEach(data => {
                // Remove espaços em branco adicionais antes de contar
                const cleanedData = data.trim();
                acc[cleanedData] = (acc[cleanedData] || 0) + 1;
            });
        }
        return acc;
    }, {});

    console.log(dadosTopicoCSV);
    console.log(contagemDados);

    // Converte o objeto contagemDados em uma array de entradas, ordena pela contagem
    const tableData = Object.entries(contagemDados).map(([data, count]) => ([data, count]));
    tableData.sort((a, b) => a[1] - b[1]);

    // Calcula o total das contagens
    const totalCount = tableData.reduce((acc, [data, count]) => acc + count, 0);

    // Adiciona a porcentagem de cada entrada
    const tableDataWithPercentage = tableData.map(([data, count]) => {
        const percentage = ((count / totalCount) * 100).toFixed(2) + '%';
        return [data, count, percentage];
    });

    // Adiciona o total ao final do array
    tableDataWithPercentage.push(['Total', totalCount, '100%']);

    return tableDataWithPercentage;
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

        // Página de Preferências (Profilling)
        doc.addPage();

        doc.setTextColor("#black");
        doc.text("Preferências (Profilling)", doc.internal.pageSize.width / 2, 20, { align: "center" });

        console.log(csvData);

        let dataGender = contagemDeDados(csvData, 'Qual o seu gênero?');
        let dataHorario = contagemDeDados(csvData, 'Em qual horário do dia você prefere viajar?');
        let dataService = contagemDeDados(csvData, 'Quando você viaja de ônibus, qual serviço você prefere?');

        doc.autoTable({
            head: [['GÊNEROS DOS RESPONDENTES', '', ''],['GÊNERO', 'VOTOS', 'PORCENTAGEM']],
            body: dataGender,
            startY: 40
        });

        doc.autoTable({
            head: [['PREFERÊNCIA DE HORÁRIO DOS RESPONDENTES', '', ''], ['HORÁRIO', 'VOTOS', 'PORCENTAGEM']],
            body: dataHorario,
            startY: doc.previousAutoTable.finalY + 10 // Inicia a segunda tabela abaixo da primeira
        });

        doc.autoTable({
            head: [['PREFERÊNCIA DE SERVIÇO DOS RESPONDENTES', '', ''], ['SERVIÇO', 'VOTOS', 'PORCENTAGEM']],
            body: dataService,
            startY: doc.previousAutoTable.finalY + 10
        });

        // Página de Experiência durante a viagem
        doc.addPage();

        doc.setTextColor("#black");
        doc.text("Experiência durante a viagem", doc.internal.pageSize.width / 2, 20, { align: "center" });

        let dataFileira  = contagemDeDados(csvData, 'Quando você viaja de ônibus, em qual fileira de assento você prefere viajar?');
        let dataLocAssento  = contagemDeDados(csvData, 'Em relação à localização do assento, qual é a sua preferência?');
        let dataPrefAssento  = contagemDeDados(csvData, 'Qual é a sua preferência quanto aos assentos?');
        let dataPrefPiso  = contagemDeDados(csvData, 'Em ônibus com dois pisos, em qual piso você prefere viajar?');

        doc.autoTable({
            head: [['FILEIRA PREFERIDA PELOS RESPONDENTES', '', ''],['FILEIRA', 'VOTOS', 'PORCENTAGEM']],
            body: dataFileira,
            startY: 40
        });

        doc.autoTable({
            head: [['LOCALIZAÇÃO DOS RESPONDENTES PREFERIDAS', '', ''],['LOCALIZAÇÃO', 'VOTOS', 'PORCENTAGEM']],
            body: dataLocAssento,
            startY: doc.previousAutoTable.finalY + 10
        });

        doc.autoTable({
            head: [['ASSENTOS PREFERIDOS PELOS RESPONDENTES', '', ''],['ASSENTO', 'VOTOS', 'PORCENTAGEM']],
            body: dataPrefAssento,
            startY: doc.previousAutoTable.finalY + 10
        });

        doc.autoTable({
            head: [['PISOS PREFERIDOS PELOS RESPONDENTES', '', ''],['PISO', 'VOTOS', 'PORCENTAGEM']],
            body: dataPrefPiso,
            startY: doc.previousAutoTable.finalY + 10
        });

        // Página de Motivações e Frequências
        doc.addPage();

        doc.setTextColor("#black");
        doc.text("Motivações e Frequência de viagens dos clientes", doc.internal.pageSize.width / 2, 20, { align: "center" });

        // let dataMotivacao  = contagemDeDados(csvData, 'Quais as principais motivações para sua viagem? (Por favor, selecione todas as que se aplicam)');
        let dataFrequency  = contagemDeDados(csvData, 'Com que frequência, você viaja?');

        /*
        doc.autoTable({
            head: [['MOTIVAÇÃO DAS VIAGENS DOS RESPONDENTES', '', ''],['MOTIVAÇÕES', 'VOTOS', 'PORCENTAGEM']],
            body: dataMotivacao,
            startY: 40
        });
        */

        doc.autoTable({
            head: [['FREQUÊNCIA QUE OS RESPONDENTES VIAJAM', '', ''],['FREQUÊNCIAS', 'VOTOS', 'PORCENTAGEM']],
            body: dataFrequency,
            startY: 40
            // startY: doc.previousAutoTable.finalY + 10
        });

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
