using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using HW_6.Models;
using HW_6.Services.Interfaces;
using System.IO;
using System.Threading.Tasks;

namespace HW_6.Services.Classes
{
    public class ExportService : IExportService
    {
        public async Task<MemoryStream> ExportInvoiceAsync(Invoice invoice)
        {
            var ms = new MemoryStream();

            using (var wordDoc = WordprocessingDocument.Create(ms, WordprocessingDocumentType.Document, true))
            {
                var mainPart = wordDoc.AddMainDocumentPart();
                mainPart.Document = new Document();
                var body = mainPart.Document.AppendChild(new Body());

                var titleParagraph = new Paragraph(new Run(new Text($"Invoice #{invoice.Id}")))
                {
                    ParagraphProperties = new ParagraphProperties(
                        new Justification() { Val = JustificationValues.Center })
                };
                body.AppendChild(titleParagraph);

                body.AppendChild(new Paragraph(new Run(new Text($"Customer: {invoice.Customer.Name}"))));
                body.AppendChild(new Paragraph(new Run(new Text($"Total: {invoice.TotalSum:C}"))));

                if (invoice.InvoiceRows != null && invoice.InvoiceRows.Count() > 0)
                {
                    var table = new Table();

                    var headerRow = new TableRow();
                    headerRow.Append(
                        new TableCell(new Paragraph(new Run(new Text("Service")))),
                        new TableCell(new Paragraph(new Run(new Text("Quantity")))),
                        new TableCell(new Paragraph(new Run(new Text("Rate")))),
                        new TableCell(new Paragraph(new Run(new Text("Sum"))))
                    );
                    table.AppendChild(headerRow);

                    foreach (var row in invoice.InvoiceRows)
                    {
                        var tr = new TableRow();
                        tr.Append(
                            new TableCell(new Paragraph(new Run(new Text(row.Service)))),
                            new TableCell(new Paragraph(new Run(new Text(row.Quantity.ToString())))),
                            new TableCell(new Paragraph(new Run(new Text(row.Rate.ToString("C"))))),
                            new TableCell(new Paragraph(new Run(new Text(row.Sum.ToString("C")))))
                        );
                        table.AppendChild(tr);
                    }

                    body.AppendChild(table);
                }

                mainPart.Document.Save();
            }

            ms.Position = 0; 
            return ms;
        }
    }
}