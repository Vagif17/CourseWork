using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Storage;

public interface IFileStorage
{
    public Task<MemoryStream> ExportInvoiceAsync(Invoice invoice);

}
