using FluentValidation;
using HW_6.DTO_s;

namespace HW_6.Validators.UserValidators;

public class UserLoginValidator : AbstractValidator<LoginUserRequestDTO>
{
    public UserLoginValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(100).WithMessage("Email cannot exceed 100 characters.")
            .EmailAddress().WithMessage("Invalid email format.");   

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
            .MaximumLength(100).WithMessage("Password cannot exceed 100 characters.");
    }
}
