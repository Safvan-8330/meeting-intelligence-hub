from fpdf import FPDF
import os

class MeetingReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(0, 10, 'Meeting Intelligence Summary', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_pdf_report(filename, analysis_data):
    pdf = MeetingReport()
    pdf.add_page()
    
    # Title Section
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, f"File: {filename}", 0, 1)
    pdf.ln(5)

    # Key Decisions
    pdf.set_text_color(16, 185, 129) # Emerald Green
    pdf.cell(0, 10, "Key Decisions", 0, 1)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font('Arial', '', 10)
    for decision in analysis_data['decisions']:
        pdf.multi_cell(0, 8, f"- {decision}")
    pdf.ln(5)

    # Action Items Table Header
    pdf.set_font('Arial', 'B', 12)
    pdf.set_text_color(37, 99, 235) # Blue
    pdf.cell(0, 10, "Action Items Tracker", 0, 1)
    pdf.set_text_color(0, 0, 0)
    
    # Table Columns
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(40, 10, "Who", 1)
    pdf.cell(100, 10, "Task", 1)
    pdf.cell(50, 10, "Due Date", 1)
    pdf.ln()

    # Table Rows
    pdf.set_font('Arial', '', 9)
    for item in analysis_data['action_items']:
        pdf.cell(40, 10, item['who'], 1)
        pdf.cell(100, 10, item['what'], 1)
        pdf.cell(50, 10, item['by_when'], 1)
        pdf.ln()

    report_path = f"uploads/{filename}.pdf"
    pdf.output(report_path)
    return report_path