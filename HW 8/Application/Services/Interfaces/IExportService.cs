using Domain;

namespace Application.Services.Interfaces;

public interface IExportService
{
    public  Task<MemoryStream> ExportInvoiceAsync(Invoice invoice);
}
