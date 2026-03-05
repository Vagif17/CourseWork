using FluentValidation;
using HW_6.DTO_s;

namespace HW_6.Validators.InvoiceValidators;

public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceRequestDTO>
{
	public CreateInvoiceValidator()
	{
		RuleFor(x => x.CustomerId)
			.GreaterThan(0).WithMessage("CustomerId must be greater than 0.");
  
		RuleFor(x => x.StartDate)
				.NotEmpty().WithMessage("Invoice date is required.")
				.LessThanOrEqualTo(DateTime.Today).WithMessage("Invoice date cannot be in the future.");
		
		RuleFor(x => x.EndDate)
				.NotEmpty().WithMessage("Due date is required.")
				.GreaterThan(x => x.StartDate).WithMessage("Due date must be after the invoice date.");

    }
}
