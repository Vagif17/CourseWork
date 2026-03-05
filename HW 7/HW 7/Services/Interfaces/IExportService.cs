using HW_7.Models;

namespace HW_7.Services.Interfaces;

public interface IExportService
{
    public  Task<MemoryStream> ExportInvoiceAsync(Invoice invoice);
}
