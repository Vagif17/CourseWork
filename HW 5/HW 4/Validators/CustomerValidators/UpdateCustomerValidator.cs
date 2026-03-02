using FluentValidation;
using HW_4.DTO_s;

namespace HW_4.Validators.CustomerValidators;

public class UpdateCustomerValidator : AbstractValidator<UpdateCustomerRequestDTO>
{
    public UpdateCustomerValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");
      
        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(200).WithMessage("Address cannot exceed 200 characters.");
       
        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.")
            .MaximumLength(20).WithMessage("Phone number cannot exceed 20 characters.")
            .Matches(@"^\+?[0-9\s\-]+$").WithMessage("Phone number can only contain digits, spaces, dashes, and an optional leading +.");
    }
}
