using FluentValidation;
using HW_6.DTO_s;

namespace HW_6.Validators.InvoiceRowValidators;

public class CreateInvoiceRowValidator : AbstractValidator<CreateInvoiceRowRequestDTO>
{
    public CreateInvoiceRowValidator()
    {
        RuleFor(x => x.Service)
            .NotEmpty().WithMessage("Service is required.")
            .MaximumLength(100).WithMessage("Service cannot exceed 100 characters.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be more than 0");

        RuleFor(x => x.Rate)
            .GreaterThan(0).WithMessage("Rate must be more than 0");
        
    }
}
