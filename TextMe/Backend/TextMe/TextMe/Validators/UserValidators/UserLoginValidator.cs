using FluentValidation;
using Microsoft.AspNetCore.Identity.Data;

namespace TextMe.Validators.UserValidators;

public class UserLoginValidator : AbstractValidator<LoginRequest>
{
    public UserLoginValidator()
    {
        RuleFor(u => u.Email)
                    .NotEmpty().WithMessage("Email required!")
                    .EmailAddress().WithMessage("Invalid email format.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required!")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long!")
            .MaximumLength(100).WithMessage("Password cannot exceed 100 characters!");
    }
}
