using HW_6.Models;

namespace HW_6.Services.Interfaces;

public interface IExportService
{
    public  Task<MemoryStream> ExportInvoiceAsync(Invoice invoice);
}
