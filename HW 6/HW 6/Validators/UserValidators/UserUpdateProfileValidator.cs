using FluentValidation;
using HW_6.DTO_s;

namespace HW_6.Validators.UserValidators;

public class UserUpdateProfileValidator : AbstractValidator<UpdateProfileRequest>
{
    public UserUpdateProfileValidator()
    {
        RuleFor(x => x.Name)
             .NotEmpty().WithMessage("Name is required.")
             .MaximumLength(50).WithMessage("Name cannot exceed 50 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(100).WithMessage("Email cannot exceed 100 characters.")
            .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Address)
           .NotEmpty().WithMessage("Address is required.")
           .MaximumLength(100).WithMessage("Address cannot exceed 100 characters.");

        RuleFor(x => x.PhoneNumber)
           .NotEmpty().WithMessage("PhoneNumber is required.")
           .MaximumLength(100).WithMessage("PhoneNumber cannot exceed 21 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
            .MaximumLength(100).WithMessage("Password cannot exceed 100 characters.");


    }
}
