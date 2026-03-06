using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Record<T>
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public T Data { get; set; } = default!;
        public int Count { get; set; }  
        public decimal TotalAmount { get; set; } 
    }

    public class CustomerReportData 
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int InvoiceCount { get; set; }
        public decimal TotalInvoiced { get; set; }
    }

    public class WorkReportData
    {
        public int Id { get; set; }
        public int InvoiceCount { get; set; }
        public decimal TotalInvoiced { get; set; }
    }

    public class InvoiceStatusReportData
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}