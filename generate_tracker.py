#!/usr/bin/env python3
import sys
import os

def check_dependencies():
    try:
        import openpyxl
    except ImportError:
        print("Dependency 'openpyxl' is missing. Installing it now...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "openpyxl"])
        print("'openpyxl' installed successfully!\n")

check_dependencies()

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule

def create_tracker():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Job Applications"

    # Ensure grid lines are visible
    ws.views.sheetView[0].showGridLines = True

    # Styling colors
    HEADER_FILL = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
    HEADER_FONT = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
    
    TITLE_FILL = PatternFill(start_color="0F2027", end_color="203A43", fill_type="solid")
    TITLE_FONT = Font(name="Segoe UI", size=16, bold=True, color="FFFFFF")
    
    DATA_FONT = Font(name="Segoe UI", size=10)
    
    # Border styles
    thin_side = Side(border_style="thin", color="D3D3D3")
    border_all = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

    # Title Block
    ws.merge_cells("A1:H1")
    title_cell = ws["A1"]
    title_cell.value = "LinkedIn Job Application Tracker"
    title_cell.font = TITLE_FONT
    title_cell.fill = TITLE_FILL
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 40

    # Headers
    headers = [
        "Company Name",
        "Job Title",
        "Status",
        "Date Applied",
        "Link to Job Posting",
        "Job Description",
        "Contact Person",
        "Notes / Next Steps"
    ]
    
    ws.row_dimensions[3].height = 25
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=3, column=col_idx)
        cell.value = header
        cell.font = HEADER_FONT
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_all

    # Mock Data
    mock_data = [
        ["Google", "Software Engineer", "Applied", "2026-06-30", "https://linkedin.com/jobs/view/12345", "Develop and optimize search algorithms. Experience with Python/Go.", "John Doe (Recruiter)", "Follow up in 1 week if no response."],
        ["Meta", "Production Engineer", "Interviewing", "2026-06-28", "https://linkedin.com/jobs/view/67890", "Maintain site reliability and infrastructure. Systems programming focus.", "Jane Smith", "Technical screening scheduled for July 5th."],
        ["Netflix", "Senior UI Developer", "Offered", "2026-06-15", "https://linkedin.com/jobs/view/11223", "Design high performance streaming interfaces. React and TypeScript.", "HR Team", "Received offer, negotiating start date."],
        ["Amazon", "Systems Architect", "Rejected", "2026-06-10", "https://linkedin.com/jobs/view/44556", "Build distributed cloud services. Java and AWS architecture.", "Recruiter Contact", "Rejected after phone screen. Try again in 6 months."],
        ["Apple", "AI Researcher", "Wishlist", "", "https://linkedin.com/jobs/view/77889", "Research deep learning models for on-device inference.", "", "Requires updating portfolio before applying."]
    ]

    for row_idx, row_data in enumerate(mock_data, 4):
        ws.row_dimensions[row_idx].height = 20
        for col_idx, val in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.value = val
            cell.font = DATA_FONT
            cell.border = border_all
            
            # Alignments & Formats
            if col_idx in [3, 4]:  # Status and Date
                cell.alignment = Alignment(horizontal="center", vertical="center")
            elif col_idx in [5]:  # Hyperlink
                cell.alignment = Alignment(horizontal="left", vertical="center")
                # Format as hyperlink
                cell.font = Font(name="Segoe UI", size=10, color="0563C1", underline="single")
            elif col_idx in [6, 8]:  # Job Description and Notes
                cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # Set up Data Validation for Status Column (Row 4 to 100)
    status_list = '"Wishlist,Applied,Interviewing,Offered,Rejected"'
    dv = DataValidation(type="list", formula1=status_list, allow_blank=True)
    dv.error = 'Your entry is not in the status list'
    dv.errorTitle = 'Invalid Entry'
    dv.prompt = 'Please select a status from the list'
    dv.promptTitle = 'Select Status'
    
    ws.add_data_validation(dv)
    # Apply to Status column (C4 to C100)
    dv.add("C4:C100")

    # Setup Conditional Formatting for Status Colors (Row 4 to 100)
    # Colors (HEX codes without lead hash or lead opacity, e.g. E2EFDA for light green)
    colors = {
        "Offered": "C6EFCE",      # Soft Green
        "Interviewing": "FFEB9C", # Soft Yellow
        "Applied": "DDEBF7",      # Soft Blue
        "Rejected": "FFC7CE",     # Soft Pink/Red
        "Wishlist": "E2DDF7"      # Soft Purple
    }
    
    text_colors = {
        "Offered": "006100",      # Dark Green
        "Interviewing": "9C6500", # Dark Yellow
        "Applied": "1F4E79",      # Dark Blue
        "Rejected": "9C0006",     # Dark Red
        "Wishlist": "4E1F79"      # Dark Purple
    }

    for status, bg_color in colors.items():
        text_color = text_colors[status]
        fill = PatternFill(start_color=bg_color, end_color=bg_color, fill_type="solid")
        font = Font(name="Segoe UI", size=10, color=text_color, bold=True)
        rule = CellIsRule(operator="equal", formula=[f'"{status}"'], fill=fill, font=font)
        ws.conditional_formatting.add("C4:C100", rule)

    # Auto-adjust column widths with a margin
    column_widths = {
        "A": 22, # Company Name
        "B": 28, # Job Title
        "C": 16, # Status
        "D": 15, # Date Applied
        "E": 32, # Link
        "F": 45, # Job Description
        "G": 22, # Contact
        "H": 35  # Notes
    }
    
    for col_letter, width in column_widths.items():
        ws.column_dimensions[col_letter].width = width

    # Output file path
    output_filename = "job_applications_tracker.xlsx"
    wb.save(output_filename)
    print(f"Spreadsheet generated successfully: {output_filename}")

if __name__ == "__main__":
    create_tracker()
