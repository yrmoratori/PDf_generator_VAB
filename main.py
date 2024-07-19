import os
import pandas as pd
from flask import Flask, request, render_template, send_file
from werkzeug.utils import secure_filename
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from datetime import date

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def criar_pdf(contagens, caminho_pdf, nome_pdf, num_respondentes):
    c = canvas.Canvas(caminho_pdf, pagesize=letter)
    width, height = letter

    # Criar a capa com fundo colorido
    c.setFillColor(HexColor("#008FFF"))
    c.rect(0, 0, width, height, stroke=0, fill=1)

    # Adicionar título e informações à capa
    c.setFillColor(HexColor("#000000"))
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2.0, height - 2 * inch, "Relatório de Pesquisa")

    # Imprimir o nome do mercado
    nome_mercado = nome_pdf.split('_')[4]
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2.0, height - 4 * inch, f"Mercado {nome_mercado}")

    # Imprimir a data da pesquisa - data atual
    data_atual = date.today()
    data_atual_2 = data_atual.strftime("%d/%m")
    data_envio_formulario = nome_pdf.split('_')[7].replace('-', '/')
    c.drawCentredString(width / 2.0, height - 5 * inch, f"Data: {data_envio_formulario} - {data_atual_2}")

    # Imprimir número de respondentes
    c.drawCentredString(width / 2.0, height - 6 * inch, f"Respondentes: {num_respondentes}")

    c.showPage()

    # Criar a página de índice
    c.setFillColor(HexColor("#008FFF"))
    c.rect(0, 0, width, height, stroke=0, fill=1)  # desenhar retângulo para o fundo

    c.setFillColor(HexColor("#000000"))  # cor do texto (preto)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 100, "Índices:")
    c.drawString(50, height - 140, "Preferência (Profilling)")

    c.setFont("Helvetica", 16)
    c.drawString(50, height - 160, "Preferências dos viajantes")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 180, "Visão Geral")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 210, "Motivação de viagem dos clientes")
    
    c.setFont("Helvetica", 16)
    c.drawString(50, height - 230, "Principais motivos para os respondentes viajarem")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 260, "Frequência de viagem dos respondentes")
    
    c.setFont("Helvetica", 16)
    c.drawString(50, height - 280, "Frequência com oque os respondentes viajam")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 310, "Motivos do por que não viajarem conosco")
    
    c.setFont("Helvetica", 16)
    c.drawString(50, height - 330, "Porque os clientes deixam de comprar conosco")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 360, "Motivos da escolha dos concorrentes")
    
    c.setFont("Helvetica", 16)
    c.drawString(50, height - 380, "O que os concorrentes oferecem que atrai os respondentes")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 410, "Quais são os principais concorrentes")
    
    c.setFont("Helvetica", 16)
    c.drawString(50, height - 430, "Quais outras empresas de ônibus os respondentes escolhem")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 460, "Satisfação quanto aos nossos serviços")
    
    c.setFont("Helvetica", 16)
    c.drawString(50, height - 480, "Satisfação dos respondentes com os nossos serviços")

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 510, "Viajariam novamente conosco")
    
    c.setFont("Helvetica", 16)
    c.drawString(50, height - 530, "Qual a chance de viajar conosco novamente")

    c.showPage()

    # Informações de Preferências dos clientes

    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2.0, height - 100, "Preferências (Profilling)")

    c.setFont("Helvetica", 16)
    c.drawString(50, height - 150, f"{contagens['Qual o seu gênero?']}")

    c.showPage()

    # Adicionar as contagens de cada coluna ao PDF
    c.setFont("Helvetica", 12)
    y = height - 100
    for coluna, frequencias in contagens.items():
        c.drawString(100, y, f"{coluna}")
        y -= 20
        for item, count in frequencias.items():
            linha = f"{item}: {count}"
            c.drawString(120, y, linha)
            y -= 20
            if y < 50:
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 12)
        y -= 30
        if y < 50:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 12)

    c.showPage()
    c.save()

@app.route('/')
def upload_file():
    return render_template('upload.html')

@app.route('/uploader', methods=['GET', 'POST'])
def uploader_file():
    if request.method == 'POST':
        if 'file' not in request.files:
            return 'No file part'
        file = request.files['file']
        if file.filename == '':
            return 'No selected file'
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)

            # Certifique-se de que o diretório de upload existe
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])

            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Process CSV file
            relatorio = pd.read_csv(file_path)
            relatorio.pop(relatorio.columns[0]) # 'Carimbo de data/hora'
            relatorio.pop(relatorio.columns[-4]) # '2. 2. 2. CPF (Digitar o CPF com pontos e hífen 000.000.000-00, para correta liberação do cupom)'
            relatorio.pop(relatorio.columns[-3]) # '3. 3. 3. E-mail (De preferência, o mesmo cadastrado no site)'
            relatorio.pop(relatorio.columns[-2]) # '4. 4. 4. Telefone celular ( Digite seu telefone celular com 55 e seu DDD. Exemplo 5527999999999 )'

            contagens = {}
            for coluna in relatorio.columns:
                valores_contados = relatorio[coluna].value_counts()
                contagens[coluna] = valores_contados

            pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], filename.rsplit('.', 1)[0] + '.pdf')

            num_respondentes = len(relatorio)

            criar_pdf(contagens, pdf_path, filename, num_respondentes)

            return send_file(pdf_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
