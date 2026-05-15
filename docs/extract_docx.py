from docx import Document

doc = Document('BarResto_Cahier_Des_Charges.docx')
for para in doc.paragraphs:
    text = para.text
    if text.strip():
        print(text)
